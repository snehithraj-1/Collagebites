import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Database file path
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'orders_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default state
const DEFAULT_STATE = {
  orders: [],
  settings: {
    ordering_enabled: true
  },
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

// Helper: read DB
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_STATE, null, 2), 'utf8');
      return DEFAULT_STATE;
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('[DB Read Error]:', err);
    return DEFAULT_STATE;
  }
}

// Helper: write DB safely
function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('[DB Write Error]:', err);
    return false;
  }
}

// ------------------------------------
// Health Check
// ------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    message: 'CampusBites Central Shared Backend is Live 🚀',
    timestamp: new Date().toISOString()
  });
});

// ------------------------------------
// Orders APIs
// ------------------------------------

// 1. GET /api/orders - Fetch all orders for Admin
app.get('/api/orders', (req, res) => {
  const db = readDb();
  const sorted = [...(db.orders || [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  res.json({ success: true, orders: sorted });
});

// 2. GET /api/orders/student/:identifier - Fetch orders for a student
app.get('/api/orders/student/:identifier', (req, res) => {
  const db = readDb();
  const idOrEmail = (req.params.identifier || '').toLowerCase();
  const userOrders = (db.orders || []).filter((o) => {
    const uid = (o.user_id || '').toLowerCase();
    const email = (o.student_email || '').toLowerCase();
    return uid === idOrEmail || email === idOrEmail;
  });
  const sorted = userOrders.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  res.json({ success: true, orders: sorted });
});

// 3. POST /api/orders - Student creates a new order
app.post('/api/orders', (req, res) => {
  const db = readDb();
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

  // Prepend new order
  db.orders = [newOrder, ...(db.orders || [])];
  writeDb(db);

  console.log(`[Order Created] #${newOrder.id} by ${newOrder.student_name} (${newOrder.total_amount} INR)`);
  res.status(201).json({ success: true, order: newOrder });
});

// 4. PATCH /api/orders/:id/status - Admin updates order status
app.patch('/api/orders/:id/status', (req, res) => {
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

  const db = readDb();
  const orderIndex = db.orders.findIndex((o) => o.id === orderId);

  if (orderIndex === -1) {
    return res.status(404).json({ success: false, error: `Order #${orderId} not found.` });
  }

  const prevStatus = db.orders[orderIndex].status;
  db.orders[orderIndex].status = status;
  db.orders[orderIndex].updated_at = new Date().toISOString();
  if (status === 'DELIVERED') {
    db.orders[orderIndex].delivered_at = new Date().toISOString();
  }

  writeDb(db);
  console.log(`[Status Updated] Order #${orderId}: ${prevStatus} -> ${status}`);

  res.json({
    success: true,
    message: `Order #${orderId} status changed to ${status}`,
    order: db.orders[orderIndex]
  });
});

// 5. DELETE /api/orders/:id - Admin deletes order
app.delete('/api/orders/:id', (req, res) => {
  const orderId = req.params.id;
  const db = readDb();
  const initialCount = db.orders.length;
  db.orders = db.orders.filter((o) => o.id !== orderId);

  if (db.orders.length === initialCount) {
    return res.status(404).json({ success: false, error: `Order #${orderId} not found.` });
  }

  writeDb(db);
  console.log(`[Order Deleted] #${orderId}`);
  res.json({ success: true, message: `Order #${orderId} permanently deleted.` });
});

// ------------------------------------
// System Settings APIs
// ------------------------------------
app.get('/api/settings/ordering', (req, res) => {
  const db = readDb();
  res.json({
    success: true,
    ordering_enabled: db.settings?.ordering_enabled !== false
  });
});

app.post('/api/settings/ordering', (req, res) => {
  const { ordering_enabled } = req.body;
  if (typeof ordering_enabled !== 'boolean') {
    return res.status(400).json({ success: false, error: 'ordering_enabled must be a boolean.' });
  }
  const db = readDb();
  db.settings = db.settings || {};
  db.settings.ordering_enabled = ordering_enabled;
  writeDb(db);
  console.log(`[Master Switch] Ordering enabled: ${ordering_enabled}`);
  res.json({ success: true, ordering_enabled });
});

// ------------------------------------
// Restaurant Status APIs
// ------------------------------------
app.get('/api/restaurants', (req, res) => {
  const db = readDb();
  res.json({ success: true, restaurants: db.restaurants || [] });
});

app.patch('/api/restaurants/:id', (req, res) => {
  const { is_open } = req.body;
  const restId = req.params.id;
  const db = readDb();
  const rest = (db.restaurants || []).find((r) => r.id === restId);
  if (!rest) {
    return res.status(404).json({ success: false, error: 'Restaurant not found.' });
  }
  rest.is_open = Boolean(is_open);
  writeDb(db);
  console.log(`[Restaurant Updated] ${rest.name} is_open: ${rest.is_open}`);
  res.json({ success: true, restaurant: rest });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  CampusBites Central Shared Backend API running     `);
  console.log(`  🌐 Port: http://localhost:${PORT}                   `);
  console.log(`  📂 Database: ${DB_FILE}                             `);
  console.log(`====================================================`);
});
