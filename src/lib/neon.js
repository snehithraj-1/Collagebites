import { neon } from '@neondatabase/serverless';

// Retrieve database connection URL from Vite environment
export const DATABASE_URL = 
  import.meta.env.DATABASE_URL || 
  import.meta.env.VITE_DATABASE_URL || 
  '';

// Check if Neon DB is configured
export const isNeonConfigured = () => {
  return Boolean(
    DATABASE_URL && 
    (DATABASE_URL.startsWith('postgres://') || DATABASE_URL.startsWith('postgresql://'))
  );
};

// Lazy SQL client getter
const getSql = () => {
  if (!isNeonConfigured()) return null;
  try {
    return neon(DATABASE_URL);
  } catch (err) {
    console.warn('[Neon DB] Failed to initialize connection:', err.message);
    return null;
  }
};

/**
 * Automatically initializes database schema tables if they don't exist
 */
export async function initNeonDb() {
  const sql = getSql();
  if (!sql) return false;

  try {
    // 1. Orders table
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        student_name VARCHAR(255) NOT NULL,
        student_phone VARCHAR(20) NOT NULL,
        student_id VARCHAR(50),
        restaurant_id VARCHAR(100) NOT NULL,
        restaurant_name VARCHAR(255) NOT NULL,
        delivery_location TEXT NOT NULL,
        instructions TEXT,
        total_amount NUMERIC(10, 2) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED',
        items JSONB NOT NULL,
        cancelled_reason TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        confirmed_at TIMESTAMPTZ,
        cancelled_at TIMESTAMPTZ
      );
    `;

    // 2. Restaurant statuses
    await sql`
      CREATE TABLE IF NOT EXISTS restaurant_statuses (
        restaurant_id VARCHAR(100) PRIMARY KEY,
        status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 3. System settings
    await sql`
      CREATE TABLE IF NOT EXISTS system_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    console.log('[Neon DB] Tables verified/created successfully.');
    return true;
  } catch (error) {
    console.error('[Neon DB] Schema initialization error:', error);
    return false;
  }
}

/**
 * Fetch all orders from Neon Database
 */
export async function fetchNeonOrders() {
  const sql = getSql();
  if (!sql) return null;

  try {
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
        created_at AS "createdAt",
        confirmed_at AS "confirmedAt",
        cancelled_at AS "cancelledAt"
      FROM orders
      ORDER BY created_at DESC;
    `;
    return rows;
  } catch (error) {
    console.error('[Neon DB] Fetch orders error:', error);
    return null;
  }
}

/**
 * Insert new order into Neon Database
 */
export async function insertNeonOrder(order) {
  const sql = getSql();
  if (!sql) return null;

  try {
    await sql`
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
        cancelled_reason,
        created_at,
        confirmed_at,
        cancelled_at
      ) VALUES (
        ${order.id || order.tempId},
        ${order.studentName},
        ${order.studentPhone},
        ${order.studentId || null},
        ${order.restaurantId},
        ${order.restaurantName},
        ${order.deliveryLocation},
        ${order.instructions || ''},
        ${order.totalAmount},
        ${order.status},
        ${JSON.stringify(order.items || [])},
        ${order.cancelledReason || null},
        ${order.createdAt ? new Date(order.createdAt) : new Date()},
        ${order.confirmedAt ? new Date(order.confirmedAt) : null},
        ${order.cancelledAt ? new Date(order.cancelledAt) : null}
      );
    `;
    console.log(`[Neon DB] Order #${order.id} saved to cloud database.`);
    return true;
  } catch (error) {
    console.error('[Neon DB] Insert order error:', error);
    return false;
  }
}

/**
 * Update order status (CONFIRMED, CANCELLED)
 */
export async function updateNeonOrderStatus(orderId, status, cancelledReason = null) {
  const sql = getSql();
  if (!sql) return false;

  try {
    await sql`
      UPDATE orders
      SET 
        status = ${status},
        cancelled_reason = ${cancelledReason},
        cancelled_at = ${status === 'CANCELLED' ? new Date() : null}
      WHERE id = ${orderId};
    `;
    return true;
  } catch (error) {
    console.error(`[Neon DB] Update order #${orderId} error:`, error);
    return false;
  }
}

/**
 * Delete order permanently from Neon
 */
export async function deleteNeonOrder(orderId) {
  const sql = getSql();
  if (!sql) return false;

  try {
    await sql`
      DELETE FROM orders
      WHERE id = ${orderId};
    `;
    return true;
  } catch (error) {
    console.error(`[Neon DB] Delete order #${orderId} error:`, error);
    return false;
  }
}

/**
 * Fetch restaurant statuses (OPEN / CLOSED)
 */
export async function fetchNeonRestaurantStatuses() {
  const sql = getSql();
  if (!sql) return null;

  try {
    const rows = await sql`SELECT restaurant_id, status FROM restaurant_statuses;`;
    const statuses = {};
    rows.forEach(r => {
      statuses[r.restaurant_id] = r.status;
    });
    return statuses;
  } catch (error) {
    console.error('[Neon DB] Fetch restaurant statuses error:', error);
    return null;
  }
}

/**
 * Upsert restaurant status
 */
export async function upsertNeonRestaurantStatus(restaurantId, status) {
  const sql = getSql();
  if (!sql) return false;

  try {
    await sql`
      INSERT INTO restaurant_statuses (restaurant_id, status, updated_at)
      VALUES (${restaurantId}, ${status}, NOW())
      ON CONFLICT (restaurant_id)
      DO UPDATE SET status = ${status}, updated_at = NOW();
    `;
    return true;
  } catch (error) {
    console.error(`[Neon DB] Upsert restaurant status error:`, error);
    return false;
  }
}

/**
 * Fetch master ordering setting
 */
export async function fetchNeonOverallOrdering() {
  const sql = getSql();
  if (!sql) return null;

  try {
    const rows = await sql`
      SELECT setting_value 
      FROM system_settings 
      WHERE setting_key = 'overall_ordering';
    `;
    if (rows.length > 0) {
      return rows[0].setting_value === 'true';
    }
    return null;
  } catch (error) {
    console.error('[Neon DB] Fetch overall ordering error:', error);
    return null;
  }
}

/**
 * Upsert master ordering setting
 */
export async function upsertNeonOverallOrdering(enabled) {
  const sql = getSql();
  if (!sql) return false;

  try {
    const val = enabled ? 'true' : 'false';
    await sql`
      INSERT INTO system_settings (setting_key, setting_value, updated_at)
      VALUES ('overall_ordering', ${val}, NOW())
      ON CONFLICT (setting_key)
      DO UPDATE SET setting_value = ${val}, updated_at = NOW();
    `;
    return true;
  } catch (error) {
    console.error(`[Neon DB] Upsert overall ordering error:`, error);
    return false;
  }
}
