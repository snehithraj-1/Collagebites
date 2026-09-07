import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getVerifiedItemPrice } from './menuCatalog.js';

// Resolve database URL from process.env or .env file
function getDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/DATABASE_URL=(.+)/);
      if (match) return match[1].trim();
    }
  } catch (e) {
    // Ignore and fallback
  }

  return '';
}

const DATABASE_URL = getDatabaseUrl();

if (!DATABASE_URL) {
  console.warn('[Server DB] WARNING: DATABASE_URL is not set!');
}

export const sql = neon(DATABASE_URL);

// Phase 5 State Machine
export const ALLOWED_TRANSITIONS = {
  'PENDING_CONFIRMATION': ['CONFIRMED', 'CANCELLED', 'EXPIRED'],
  'CONFIRMED': ['PREPARING', 'CANCELLED'],
  'PREPARING': ['READY', 'CANCELLED'],
  'READY': ['PICKED_UP', 'OUT_FOR_DELIVERY', 'CANCELLED'],
  'PICKED_UP': ['OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
  'OUT_FOR_DELIVERY': ['DELIVERED', 'CANCELLED'],
  'DELIVERED': [],
  'CANCELLED': [],
  'EXPIRED': []
};

/**
 * Phase 3: Create Order in Neon Database
 * Atomic transaction inserting into orders and order_items
 */
export async function createOrderInDb({
  studentName,
  studentPhone,
  studentId,
  restaurantId,
  restaurantName,
  deliveryLocation,
  instructions,
  items
}) {
  if (!studentName || !studentPhone || !restaurantId || !Array.isArray(items) || items.length === 0) {
    throw new Error('Invalid order payload: Missing student details, restaurant or items.');
  }

  // Phase 5 & 6 Server-Side Guard: Validate master switch and restaurant status in database
  const settingsRows = await sql`SELECT setting_value FROM system_settings WHERE setting_key = 'overall_ordering';`;
  if (settingsRows.length > 0 && settingsRows[0].setting_value === 'false') {
    throw new Error('Ordering is currently unavailable.');
  }

  const restRows = await sql`SELECT status FROM restaurant_statuses WHERE restaurant_id = ${restaurantId};`;
  if (restRows.length > 0 && restRows[0].status === 'CLOSED') {
    throw new Error('This restaurant is currently closed.');
  }

  // 1. Validate prices from server-side menu catalog and calculate verified totals
  let verifiedSubtotal = 0;
  const verifiedItems = items.map((item) => {
    const qty = parseInt(item.qty || item.quantity || 1, 10);
    if (qty <= 0) throw new Error(`Invalid item quantity for ${item.name || 'item'}`);

    const unitPrice = getVerifiedItemPrice(item);
    const itemTotal = unitPrice * qty;
    verifiedSubtotal += itemTotal;

    return {
      id: item.id || null,
      name: item.name || item.item_name || 'Dish',
      quantity: qty,
      unit_price: unitPrice,
      total_price: itemTotal
    };
  });

  const platformFee = 5;
  const deliveryFee = 0;
  const verifiedTotal = verifiedSubtotal + platformFee + deliveryFee;

  // 2. Generate unique Order ID
  const prefix = restaurantId === 'local-home-kitchen' ? 'LHK' : 'ORD';
  const orderId = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

  // 3. Set Confirmation Expiry = NOW() + 30 seconds
  const now = new Date();
  const confirmationExpiresAt = new Date(now.getTime() + 30 * 1000);

  // 4. Build Atomic Transaction Queries
  const insertOrderQuery = sql`
    INSERT INTO orders (
      id,
      student_name,
      student_phone,
      student_id,
      restaurant_id,
      restaurant_name,
      delivery_location,
      instructions,
      total_amount,
      status,
      items,
      confirmation_expires_at,
      created_at,
      updated_at
    ) VALUES (
      ${orderId},
      ${studentName.trim()},
      ${studentPhone.trim()},
      ${studentId ? studentId.trim() : null},
      ${restaurantId},
      ${restaurantName || (restaurantId === 'local-home-kitchen' ? 'Local Home Kitchen' : 'Campus Kitchen')},
      ${deliveryLocation || 'Hostel Delivery'},
      ${instructions || ''},
      ${verifiedTotal},
      'PENDING_CONFIRMATION',
      ${JSON.stringify(verifiedItems)},
      ${confirmationExpiresAt.toISOString()},
      ${now.toISOString()},
      ${now.toISOString()}
    ) RETURNING *;
  `;

  const insertItemQueries = verifiedItems.map((item) => {
    return sql`
      INSERT INTO order_items (
        order_id,
        item_name,
        quantity,
        unit_price,
        total_price,
        created_at
      ) VALUES (
        ${orderId},
        ${item.name},
        ${item.quantity},
        ${item.unit_price},
        ${item.total_price},
        ${now.toISOString()}
      );
    `;
  });

  // Execute atomically
  await sql.transaction([insertOrderQuery, ...insertItemQueries]);

  return {
    id: orderId,
    studentName: studentName.trim(),
    studentPhone: studentPhone.trim(),
    studentId: studentId || null,
    restaurantId,
    restaurantName: restaurantName || 'Local Home Kitchen',
    deliveryLocation: deliveryLocation || 'Hostel Delivery',
    instructions: instructions || '',
    totalAmount: verifiedTotal,
    status: 'PENDING_CONFIRMATION',
    items: verifiedItems,
    confirmationExpiresAt: confirmationExpiresAt.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };
}

/**
 * Phase 4: Get Order by ID with order_items and automatic expiry check
 */
export async function getOrderByIdFromDb(orderId) {
  const rows = await sql`
    SELECT 
      id,
      student_name AS "studentName",
      student_phone AS "studentPhone",
      student_id AS "studentId",
      restaurant_id AS "restaurantId",
      restaurant_name AS "restaurantName",
      delivery_location AS "deliveryLocation",
      instructions,
      total_amount::float AS "totalAmount",
      status,
      items,
      cancelled_reason AS "cancelledReason",
      confirmation_expires_at AS "confirmationExpiresAt",
      created_at AS "createdAt",
      confirmed_at AS "confirmedAt",
      cancelled_at AS "cancelledAt",
      updated_at AS "updatedAt"
    FROM orders
    WHERE id = ${orderId};
  `;

  if (rows.length === 0) return null;
  const order = rows[0];

  // Auto-expire check: If PENDING_CONFIRMATION and current time > confirmationExpiresAt
  if (order.status === 'PENDING_CONFIRMATION' && order.confirmationExpiresAt) {
    const expiryTime = new Date(order.confirmationExpiresAt).getTime();
    if (Date.now() > expiryTime) {
      await sql`
        UPDATE orders
        SET 
          status = 'EXPIRED',
          cancelled_reason = 'Confirmation time expired (30 seconds)',
          cancelled_at = NOW(),
          updated_at = NOW()
        WHERE id = ${orderId};
      `;
      order.status = 'EXPIRED';
      order.cancelledReason = 'Confirmation time expired (30 seconds)';
    }
  }

  // Fetch relational order items
  const items = await sql`
    SELECT 
      id,
      order_id AS "orderId",
      item_name AS "name",
      quantity,
      unit_price::float AS "unitPrice",
      total_price::float AS "totalPrice",
      created_at AS "createdAt"
    FROM order_items
    WHERE order_id = ${orderId}
    ORDER BY id ASC;
  `;

  order.orderItems = items;
  // If items was array of objects, prioritize real order_items
  if (items.length > 0) {
    order.items = items.map(i => ({
      name: i.name,
      qty: i.quantity,
      price: i.unitPrice,
      total: i.totalPrice
    }));
  }

  return order;
}

/**
 * Phase 4: Confirm Order
 * Prevents confirming expired orders or invalid status transitions
 */
export async function confirmOrderInDb(orderId) {
  const order = await getOrderByIdFromDb(orderId);
  if (!order) {
    return { error: 'Order not found', code: 404 };
  }

  // Must be in PENDING_CONFIRMATION
  if (order.status !== 'PENDING_CONFIRMATION') {
    return { 
      error: `Order cannot be confirmed because status is ${order.status}`, 
      code: 400,
      order 
    };
  }

  // Strict 30s expiry verification
  const expiryTime = new Date(order.confirmationExpiresAt).getTime();
  if (Date.now() > expiryTime) {
    await sql`
      UPDATE orders
      SET 
        status = 'EXPIRED',
        cancelled_reason = 'Confirmation window expired before confirmation',
        cancelled_at = NOW(),
        updated_at = NOW()
      WHERE id = ${orderId};
    `;
    order.status = 'EXPIRED';
    return { 
      error: 'Order confirmation window (30 seconds) has expired.', 
      code: 410,
      order 
    };
  }

  // Update to CONFIRMED
  const now = new Date();
  await sql`
    UPDATE orders
    SET 
      status = 'CONFIRMED',
      confirmed_at = ${now.toISOString()},
      updated_at = ${now.toISOString()}
    WHERE id = ${orderId};
  `;

  order.status = 'CONFIRMED';
  order.confirmedAt = now.toISOString();
  order.updatedAt = now.toISOString();

  return { success: true, order };
}

/**
 * Phase 4 & 5: Cancel Order
 */
export async function cancelOrderInDb(orderId, reason = 'Cancelled by Student') {
  const order = await getOrderByIdFromDb(orderId);
  if (!order) {
    return { error: 'Order not found', code: 404 };
  }

  if (['DELIVERED', 'CANCELLED', 'EXPIRED'].includes(order.status)) {
    return { 
      error: `Order cannot be cancelled because it is already ${order.status}`, 
      code: 400,
      order 
    };
  }

  const now = new Date();
  await sql`
    UPDATE orders
    SET 
      status = 'CANCELLED',
      cancelled_reason = ${reason},
      cancelled_at = ${now.toISOString()},
      updated_at = ${now.toISOString()}
    WHERE id = ${orderId};
  `;

  order.status = 'CANCELLED';
  order.cancelledReason = reason;
  order.cancelledAt = now.toISOString();
  order.updatedAt = now.toISOString();

  return { success: true, order };
}

/**
 * Phase 5: Update Order Status with transition validation
 */
export async function updateOrderStatusInDb(orderId, nextStatus, reason = null) {
  const order = await getOrderByIdFromDb(orderId);
  if (!order) {
    return { error: 'Order not found', code: 404 };
  }

  const currentStatus = order.status;
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];

  if (!allowed.includes(nextStatus)) {
    return {
      error: `Invalid status transition: Cannot move order from ${currentStatus} to ${nextStatus}. Allowed: ${allowed.join(', ') || 'None (Terminal state)'}`,
      code: 400,
      order
    };
  }

  const now = new Date();
  await sql`
    UPDATE orders
    SET 
      status = ${nextStatus},
      cancelled_reason = ${reason || order.cancelledReason},
      updated_at = ${now.toISOString()}
    WHERE id = ${orderId};
  `;

  order.status = nextStatus;
  order.updatedAt = now.toISOString();
  return { success: true, order };
}

/**
 * Phase 6: Get Orders for a specific student
 */
export async function getStudentOrdersFromDb(studentIdentifier) {
  const clean = studentIdentifier.trim();
  const rows = await sql`
    SELECT 
      id,
      student_name AS "studentName",
      student_phone AS "studentPhone",
      student_id AS "studentId",
      restaurant_id AS "restaurantId",
      restaurant_name AS "restaurantName",
      delivery_location AS "deliveryLocation",
      instructions,
      total_amount::float AS "totalAmount",
      status,
      items,
      cancelled_reason AS "cancelledReason",
      confirmation_expires_at AS "confirmationExpiresAt",
      created_at AS "createdAt",
      confirmed_at AS "confirmedAt",
      cancelled_at AS "cancelledAt",
      updated_at AS "updatedAt"
    FROM orders
    WHERE student_phone = ${clean} OR student_id = ${clean}
    ORDER BY created_at DESC;
  `;

  return rows;
}

/**
 * Phase 6: Get all orders for Admin
 */
export async function getAllOrdersFromDb() {
  const rows = await sql`
    SELECT 
      id,
      student_name AS "studentName",
      student_name AS "student_name",
      student_phone AS "studentPhone",
      student_phone AS "student_phone",
      student_id AS "studentId",
      student_id AS "student_id",
      restaurant_id AS "restaurantId",
      restaurant_id AS "restaurant_id",
      restaurant_name AS "restaurantName",
      restaurant_name AS "restaurant_name",
      delivery_location AS "deliveryLocation",
      instructions,
      total_amount::float AS "totalAmount",
      total_amount::float AS "total_amount",
      status,
      items,
      cancelled_reason AS "cancelledReason",
      confirmation_expires_at AS "confirmationExpiresAt",
      created_at AS "createdAt",
      created_at AS "created_at",
      confirmed_at AS "confirmedAt",
      cancelled_at AS "cancelledAt",
      updated_at AS "updatedAt"
    FROM orders
    ORDER BY created_at DESC;
  `;

  // Fetch relational order items
  const allOrderItems = await sql`
    SELECT 
      id,
      order_id AS "orderId",
      item_name AS "name",
      quantity,
      unit_price::float AS "unitPrice",
      total_price::float AS "totalPrice",
      created_at AS "createdAt"
    FROM order_items
    ORDER BY id ASC;
  `;

  const itemsByOrder = {};
  for (const item of allOrderItems) {
    if (!itemsByOrder[item.orderId]) itemsByOrder[item.orderId] = [];
    itemsByOrder[item.orderId].push(item);
  }

  // Check and update any expired pending orders & attach relational order_items
  const nowTime = Date.now();
  for (const o of rows) {
    if (o.status === 'PENDING_CONFIRMATION' && o.confirmationExpiresAt) {
      if (nowTime > new Date(o.confirmationExpiresAt).getTime()) {
        o.status = 'EXPIRED';
        o.cancelledReason = 'Confirmation time expired (30 seconds)';
      }
    }

    const relationalItems = itemsByOrder[o.id] || [];
    if (relationalItems.length > 0) {
      o.orderItems = relationalItems;
      o.orderedItems = relationalItems;
      o.items = relationalItems.map(i => ({
        name: i.name,
        qty: i.quantity,
        quantity: i.quantity,
        price: i.unitPrice,
        unit_price: i.unitPrice,
        total: i.totalPrice,
        total_price: i.totalPrice
      }));
      o.quantity = relationalItems.reduce((sum, i) => sum + i.quantity, 0);
    } else if (Array.isArray(o.items)) {
      o.orderedItems = o.items;
      o.quantity = o.items.reduce((sum, i) => sum + (i.qty || i.quantity || 1), 0);
    } else {
      o.orderedItems = [];
      o.quantity = 1;
    }
  }

  return rows;
}

/**
 * Delete order from Neon with cascading deletion of order_items
 */
export async function deleteOrderFromDb(orderId) {
  const deleteItems = sql`DELETE FROM order_items WHERE order_id = ${orderId};`;
  const deleteOrder = sql`DELETE FROM orders WHERE id = ${orderId};`;
  await sql.transaction([deleteItems, deleteOrder]);
  return { success: true, id: orderId };
}

export async function getOverallOrderingSettingFromDb() {
  const rows = await sql`SELECT setting_value FROM system_settings WHERE setting_key = 'overall_ordering';`;
  if (rows.length === 0) return true;
  return rows[0].setting_value !== 'false';
}

export async function setOverallOrderingSettingInDb(enabled) {
  const val = enabled ? 'true' : 'false';
  await sql`
    INSERT INTO system_settings (setting_key, setting_value, updated_at)
    VALUES ('overall_ordering', ${val}, NOW())
    ON CONFLICT (setting_key)
    DO UPDATE SET setting_value = ${val}, updated_at = NOW();
  `;
  return { success: true, overallOrdering: Boolean(enabled) };
}

/**
 * System Settings & Restaurant Statuses
 */
export async function getSystemSettingsFromDb() {
  const rows = await sql`SELECT setting_key, setting_value FROM system_settings;`;
  const settings = { overall_ordering: true };
  rows.forEach(r => {
    if (r.setting_key === 'overall_ordering') {
      settings.overall_ordering = r.setting_value === 'true';
    }
  });
  return settings;
}

export async function updateSystemSettingInDb(key, value) {
  const val = String(value);
  await sql`
    INSERT INTO system_settings (setting_key, setting_value, updated_at)
    VALUES (${key}, ${val}, NOW())
    ON CONFLICT (setting_key)
    DO UPDATE SET setting_value = ${val}, updated_at = NOW();
  `;
  return { success: true, key, value };
}

export async function getRestaurantStatusesFromDb() {
  const rows = await sql`SELECT restaurant_id, status FROM restaurant_statuses;`;
  const statuses = {};
  rows.forEach(r => {
    statuses[r.restaurant_id] = r.status;
  });
  return statuses;
}

export async function updateRestaurantStatusInDb(restaurantId, status) {
  await sql`
    INSERT INTO restaurant_statuses (restaurant_id, status, updated_at)
    VALUES (${restaurantId}, ${status}, NOW())
    ON CONFLICT (restaurant_id)
    DO UPDATE SET status = ${status}, updated_at = NOW();
  `;
  return { success: true, restaurantId, status };
}
