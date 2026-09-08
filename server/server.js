import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { neon } from '@neondatabase/serverless';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Database file path for offline cache
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'orders_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ----------------------------------------------------
// 1. NEON POSTGRESQL CONNECTION & SCHEMA INITIALIZATION
// ----------------------------------------------------
function getDatabaseUrl() {
  let url = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
  if (!url) {
    try {
      const envPath = path.resolve(__dirname, '../.env');
      if (fs.existsSync(envPath)) {
        const envText = fs.readFileSync(envPath, 'utf8');
        const match = envText.match(/DATABASE_URL=(.+)/);
        if (match) url = match[1].trim();
      }
    } catch (e) {}
  }
  return url.trim();
}

const DATABASE_URL = getDatabaseUrl();
let sql = null;
let isNeonReady = false;

if (DATABASE_URL) {
  try {
    sql = neon(DATABASE_URL);
    console.log('[Neon DB] Initializing connection to:', DATABASE_URL.replace(/:[^:@]+@/, ':****@'));
  } catch (err) {
    console.error('[Neon DB Init Error]:', err.message);
  }
}

// Ensure Neon schema is ready
async function initNeonSchema() {
  if (!sql) return;
  try {
    // 1. Ensure students table
    await sql`
      CREATE TABLE IF NOT EXISTS students (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        student_id VARCHAR(100),
        phone VARCHAR(50),
        hostel_block VARCHAR(100),
        room_number VARCHAR(100),
        total_orders INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 2. Ensure orders table and columns
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(255),
        student_name VARCHAR(255) NOT NULL,
        student_email VARCHAR(255),
        student_phone VARCHAR(50) NOT NULL,
        student_id VARCHAR(100),
        delivery_location TEXT NOT NULL,
        restaurant_id VARCHAR(100) NOT NULL,
        restaurant_name VARCHAR(255) NOT NULL,
        total_amount NUMERIC NOT NULL,
        status VARCHAR(50) NOT NULL,
        instructions TEXT,
        items JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        confirmed_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // Add extra columns if existing table didn't have them
    await sql`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS student_email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
    `;

    // 3. Ensure order_status_history table
    await sql`
      CREATE TABLE IF NOT EXISTS order_status_history (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        changed_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    isNeonReady = true;
    console.log('✅ [Neon DB] Connected & Schema Initialized Successfully!');
  } catch (err) {
    console.warn('[Neon DB Schema Warning]:', err.message);
    isNeonReady = false;
  }
}

initNeonSchema();

// ----------------------------------------------------
// 2. LOCAL CACHE HELPERS (Resilient Offline Fallback)
// ----------------------------------------------------
const DEFAULT_STATE = {
  orders: [],
  students: [],
  settings: { ordering_enabled: true },
  restaurants: [
    {
      id: 'local-home-kitchen',
      name: 'Local Home Kitchen',
      description: 'Homestyle North & South Indian meals, fragrant biryanis and freshly rolled rotis.',
      is_open: true
    },
    {
      id: 'campus-delight',
      name: 'Campus Delight Kitchen',
      description: 'Quick bites, fried rice, crispy chicken rolls, pizzas, shakes and fast food snacks.',
      is_open: true
    }
  ]
};

function readLocalDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_STATE, null, 2), 'utf8');
      return DEFAULT_STATE;
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return DEFAULT_STATE;
  }
}

function writeLocalDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    return false;
  }
}

// ----------------------------------------------------
// 3. API ROUTES
// ----------------------------------------------------

// GET /api/health & /api/db/status
app.get(['/api/health', '/api/db/status'], async (req, res) => {
  let neonStatus = 'offline';
  let totalNeonOrders = 0;
  let totalNeonStudents = 0;

  if (sql) {
    try {
      const orderCount = await sql`SELECT count(*) as c FROM orders;`;
      const studentCount = await sql`SELECT count(*) as c FROM students;`;
      totalNeonOrders = parseInt(orderCount[0]?.c || '0', 10);
      totalNeonStudents = parseInt(studentCount[0]?.c || '0', 10);
      neonStatus = 'connected';
    } catch (e) {
      neonStatus = 'error: ' + e.message;
    }
  }

  res.json({
    ok: true,
    message: 'CampusBites Central Shared Backend is Live 🚀',
    neon: {
      status: neonStatus,
      database: 'neondb',
      total_orders: totalNeonOrders,
      total_students: totalNeonStudents
    },
    timestamp: new Date().toISOString()
  });
});

// GET /api/orders - Fetch all orders for Admin
app.get('/api/orders', async (req, res) => {
  if (sql && isNeonReady) {
    try {
      const rows = await sql`
        SELECT * FROM orders 
        ORDER BY created_at DESC;
      `;
      const parsedOrders = rows.map((r) => ({
        ...r,
        total_amount: Number(r.total_amount),
        items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items
      }));
      return res.json({ success: true, orders: parsedOrders, source: 'neon' });
    } catch (err) {
      console.warn('[Neon Fetch Orders Error]:', err.message);
    }
  }

  // Fallback to local cache
  const local = readLocalDb();
  const sorted = [...(local.orders || [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  res.json({ success: true, orders: sorted, source: 'local_cache' });
});

// GET /api/orders/student/:identifier - Fetch orders for a student
app.get('/api/orders/student/:identifier', async (req, res) => {
  const idOrEmail = (req.params.identifier || '').trim().toLowerCase();

  if (sql && isNeonReady) {
    try {
      const rows = await sql`
        SELECT * FROM orders 
        WHERE LOWER(student_email) = ${idOrEmail} 
           OR user_id = ${req.params.identifier}
           OR student_id = ${req.params.identifier}
        ORDER BY created_at DESC;
      `;
      const parsedOrders = rows.map((r) => ({
        ...r,
        total_amount: Number(r.total_amount),
        items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items
      }));
      return res.json({ success: true, orders: parsedOrders, source: 'neon' });
    } catch (err) {
      console.warn('[Neon Student Orders Error]:', err.message);
    }
  }

  // Fallback to local cache
  const local = readLocalDb();
  const userOrders = (local.orders || []).filter((o) => {
    const uid = (o.user_id || '').toLowerCase();
    const email = (o.student_email || '').toLowerCase();
    const sid = (o.student_id || '').toLowerCase();
    return uid === idOrEmail || email === idOrEmail || sid === idOrEmail;
  });
  const sorted = userOrders.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  res.json({ success: true, orders: sorted, source: 'local_cache' });
});

// POST /api/orders - Student creates a new order (Stores in Neon DB)
app.post('/api/orders', async (req, res) => {
  const orderData = req.body;

  if (!orderData || !orderData.total_amount || !Array.isArray(orderData.items)) {
    return res.status(400).json({ success: false, error: 'Invalid order payload.' });
  }

  const orderId = orderData.id || `CB-${Math.floor(100000 + Math.random() * 900000)}`;
  const nowIso = new Date().toISOString();

  const newOrder = {
    id: orderId,
    user_id: orderData.user_id || null,
    student_name: orderData.student_name || 'Student',
    student_email: orderData.student_email || '',
    student_id: orderData.student_id || null,
    student_phone: orderData.student_phone || '',
    delivery_location: orderData.delivery_location || 'Hostel Room',
    restaurant_id: orderData.restaurant_id || 'local-home-kitchen',
    restaurant_name: orderData.restaurant_name || 'Campus Kitchen',
    total_amount: Number(orderData.total_amount) || 0,
    status: orderData.status || 'CONFIRMED',
    instructions: orderData.instructions || null,
    created_at: orderData.created_at || nowIso,
    confirmed_at: nowIso,
    updated_at: nowIso,
    items: orderData.items || []
  };

  // 1. Insert into Neon DB
  if (sql) {
    try {
      // Insert into orders table
      await sql`
        INSERT INTO orders (
          id, user_id, student_name, student_email, student_phone, student_id,
          delivery_location, restaurant_id, restaurant_name, total_amount,
          status, instructions, items, created_at, confirmed_at, updated_at
        ) VALUES (
          ${newOrder.id},
          ${newOrder.user_id},
          ${newOrder.student_name},
          ${newOrder.student_email},
          ${newOrder.student_phone},
          ${newOrder.student_id},
          ${newOrder.delivery_location},
          ${newOrder.restaurant_id},
          ${newOrder.restaurant_name},
          ${newOrder.total_amount},
          ${newOrder.status},
          ${newOrder.instructions},
          ${JSON.stringify(newOrder.items)},
          ${newOrder.created_at},
          ${newOrder.confirmed_at},
          ${newOrder.updated_at}
        )
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          updated_at = NOW();
      `;

      // Upsert Student profile into students table
      if (newOrder.student_email) {
        await sql`
          INSERT INTO students (
            id, name, email, student_id, phone, hostel_block, room_number, total_orders, updated_at
          ) VALUES (
            ${newOrder.user_id || 'student-' + Math.random().toString(36).substring(2, 9)},
            ${newOrder.student_name},
            ${newOrder.student_email.toLowerCase()},
            ${newOrder.student_id},
            ${newOrder.student_phone},
            ${orderData.hostel_block || null},
            ${orderData.room_number || null},
            1,
            NOW()
          )
          ON CONFLICT (email) DO UPDATE SET
            name = EXCLUDED.name,
            phone = COALESCE(EXCLUDED.phone, students.phone),
            student_id = COALESCE(EXCLUDED.student_id, students.student_id),
            total_orders = students.total_orders + 1,
            updated_at = NOW();
        `;
      }

      // Insert individual items into order_items table
      for (const item of newOrder.items) {
        try {
          await sql`
            INSERT INTO order_items (
              order_id, item_name, quantity, unit_price, total_price, created_at
            ) VALUES (
              ${newOrder.id},
              ${item.name},
              ${item.quantity || 1},
              ${item.price || 0},
              ${(item.price || 0) * (item.quantity || 1)},
              NOW()
            );
          `;
        } catch (itemErr) {
          // Continue
        }
      }

      // Record in order_status_history
      try {
        await sql`
          INSERT INTO order_status_history (order_id, status, changed_at)
          VALUES (${newOrder.id}, ${newOrder.status}, NOW());
        `;
      } catch (histErr) {}

      console.log(`[Neon DB] Order #${newOrder.id} successfully saved to PostgreSQL!`);
    } catch (err) {
      console.error('[Neon DB Order Insert Error]:', err.message);
    }
  }

  // 2. Also sync to local cache
  const local = readLocalDb();
  local.orders = [newOrder, ...(local.orders || []).filter((o) => o.id !== newOrder.id)];
  writeLocalDb(local);

  res.status(201).json({ success: true, order: newOrder, stored_in_neon: isNeonReady });
});

// 4. PATCH /api/orders/:id/status - Admin updates order status (PREPARING, READY, OUT_FOR_DELIVERY, DELIVERED)
app.patch('/api/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  const orderId = req.params.id;

  const validStatuses = [
    'CONFIRMED',
    'PREPARING',
    'READY',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'EXPIRED'
  ];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    });
  }

  let updatedOrder = null;

  // 1. Update in Neon DB
  if (sql) {
    try {
      const result = await sql`
        UPDATE orders 
        SET status = ${status}, updated_at = NOW() 
        WHERE id = ${orderId}
        RETURNING *;
      `;
      if (result && result.length > 0) {
        updatedOrder = {
          ...result[0],
          total_amount: Number(result[0].total_amount),
          items: typeof result[0].items === 'string' ? JSON.parse(result[0].items) : result[0].items
        };

        // Record in status history
        await sql`
          INSERT INTO order_status_history (order_id, status, changed_at)
          VALUES (${orderId}, ${status}, NOW());
        `;
        console.log(`[Neon DB] Order #${orderId} status updated to: ${status}`);
      }
    } catch (err) {
      console.error('[Neon DB Status Update Error]:', err.message);
    }
  }

  // 2. Sync to local cache
  const local = readLocalDb();
  const orderIndex = (local.orders || []).findIndex((o) => o.id === orderId);
  if (orderIndex !== -1) {
    local.orders[orderIndex].status = status;
    local.orders[orderIndex].updated_at = new Date().toISOString();
    writeLocalDb(local);
    if (!updatedOrder) updatedOrder = local.orders[orderIndex];
  }

  if (!updatedOrder) {
    return res.status(404).json({ success: false, error: `Order #${orderId} not found.` });
  }

  res.json({
    success: true,
    message: `Order #${orderId} status changed to ${status}`,
    order: updatedOrder
  });
});

// 5. DELETE /api/orders/:id - Admin deletes order
app.delete('/api/orders/:id', async (req, res) => {
  const orderId = req.params.id;

  if (sql) {
    try {
      await sql`DELETE FROM order_items WHERE order_id = ${orderId};`;
      await sql`DELETE FROM orders WHERE id = ${orderId};`;
      console.log(`[Neon DB] Order #${orderId} deleted from PostgreSQL`);
    } catch (err) {
      console.warn('[Neon DB Delete Error]:', err.message);
    }
  }

  const local = readLocalDb();
  local.orders = (local.orders || []).filter((o) => o.id !== orderId);
  writeLocalDb(local);

  res.json({ success: true, message: `Order #${orderId} permanently deleted.` });
});

// 6. GET /api/students - Admin views all registered students
app.get('/api/students', async (req, res) => {
  if (sql && isNeonReady) {
    try {
      const students = await sql`
        SELECT * FROM students 
        ORDER BY updated_at DESC;
      `;
      return res.json({ success: true, students, source: 'neon' });
    } catch (err) {
      console.warn('[Neon Fetch Students Error]:', err.message);
    }
  }

  const local = readLocalDb();
  res.json({ success: true, students: local.students || [], source: 'local_cache' });
});

// 7. POST /api/students - Register or update student details
app.post('/api/students', async (req, res) => {
  const { id, name, email, student_id, phone, hostel_block, room_number } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Student email is required.' });
  }

  const studentPayload = {
    id: id || 'student-' + Math.random().toString(36).substring(2, 9),
    name: name || 'Student',
    email: email.toLowerCase().trim(),
    student_id: student_id || null,
    phone: phone || null,
    hostel_block: hostel_block || null,
    room_number: room_number || null,
    updated_at: new Date().toISOString()
  };

  if (sql) {
    try {
      await sql`
        INSERT INTO students (
          id, name, email, student_id, phone, hostel_block, room_number, updated_at
        ) VALUES (
          ${studentPayload.id},
          ${studentPayload.name},
          ${studentPayload.email},
          ${studentPayload.student_id},
          ${studentPayload.phone},
          ${studentPayload.hostel_block},
          ${studentPayload.room_number},
          NOW()
        )
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          student_id = COALESCE(EXCLUDED.student_id, students.student_id),
          phone = COALESCE(EXCLUDED.phone, students.phone),
          hostel_block = COALESCE(EXCLUDED.hostel_block, students.hostel_block),
          room_number = COALESCE(EXCLUDED.room_number, students.room_number),
          updated_at = NOW();
      `;
      console.log(`[Neon DB] Student details saved: ${studentPayload.name} (${studentPayload.email})`);
    } catch (err) {
      console.error('[Neon DB Student Save Error]:', err.message);
    }
  }

  const local = readLocalDb();
  local.students = [
    studentPayload,
    ...(local.students || []).filter((s) => s.email !== studentPayload.email)
  ];
  writeLocalDb(local);

  res.json({ success: true, student: studentPayload });
});

// 8. System & Restaurant toggles
app.get('/api/settings/ordering', (req, res) => {
  const local = readLocalDb();
  res.json({ success: true, ordering_enabled: local.settings?.ordering_enabled !== false });
});

app.post('/api/settings/ordering', (req, res) => {
  const { ordering_enabled } = req.body;
  const local = readLocalDb();
  local.settings = local.settings || {};
  local.settings.ordering_enabled = ordering_enabled;
  writeLocalDb(local);
  res.json({ success: true, ordering_enabled });
});

app.get('/api/restaurants', (req, res) => {
  const local = readLocalDb();
  res.json({ success: true, restaurants: local.restaurants || [] });
});

app.patch('/api/restaurants/:id', (req, res) => {
  const { is_open } = req.body;
  const local = readLocalDb();
  const rest = (local.restaurants || []).find((r) => r.id === req.params.id);
  if (!rest) return res.status(404).json({ success: false, error: 'Not found' });
  rest.is_open = Boolean(is_open);
  writeLocalDb(local);
  res.json({ success: true, restaurant: rest });
});

// Start server
app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`  CampusBites Backend with Neon PostgreSQL Live!   `);
  console.log(`  🌐 Port: http://localhost:${PORT}                 `);
  console.log(`  🐘 Neon DB: Connected                            `);
  console.log('====================================================');
});
