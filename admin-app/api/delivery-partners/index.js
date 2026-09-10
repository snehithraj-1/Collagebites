import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_IDfEm7NR9gHC@ep-winter-moon-axhp8k01-pooler.c-4.us-east-2.aws.neon.tech/clgbytes?sslmode=require';

const sql = neon(DATABASE_URL);

async function ensureTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS delivery_partners (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        pin VARCHAR(20) DEFAULT '1234',
        restaurant_id VARCHAR(100) DEFAULT 'all',
        is_active BOOLEAN DEFAULT true,
        total_deliveries INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await sql`
      ALTER TABLE delivery_partners 
      ADD COLUMN IF NOT EXISTS pin VARCHAR(20) DEFAULT '1234',
      ADD COLUMN IF NOT EXISTS restaurant_id VARCHAR(100) DEFAULT 'all';
    `;
  } catch (e) {
    console.warn('[Neon ensureTable warning]:', e.message);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  await ensureTable();

  // GET: Fetch all active delivery partners
  if (req.method === 'GET') {
    try {
      const restaurantId = req.query.restaurant_id || req.query.restaurant;
      let rows;
      if (restaurantId && restaurantId !== 'all') {
        rows = await sql`
          SELECT * FROM delivery_partners
          WHERE is_active = true AND (restaurant_id = ${restaurantId} OR restaurant_id = 'all')
          ORDER BY name ASC;
        `;
      } else {
        rows = await sql`
          SELECT * FROM delivery_partners
          WHERE is_active = true
          ORDER BY name ASC;
        `;
      }

      const formatted = rows.map(r => ({
        id: r.id,
        name: r.name,
        phone: r.phone,
        pin: r.pin || '1234',
        restaurant_id: r.restaurant_id || 'all',
        restaurantId: r.restaurant_id || 'all',
        is_active: r.is_active !== false,
        isActive: r.is_active !== false,
        total_deliveries: Number(r.total_deliveries || 0),
        totalDeliveries: Number(r.total_deliveries || 0),
        created_at: r.created_at,
        createdAt: r.created_at
      }));

      return res.status(200).json({ 
        success: true, 
        partners: formatted, 
        data: formatted,
        count: formatted.length 
      });
    } catch (err) {
      console.error('[Admin Delivery Partners GET Error]:', err.message);
      return res.status(500).json({ success: false, error: 'Failed to fetch delivery partners: ' + err.message });
    }
  }

  // POST: Create / Register new delivery partner with Mobile + PIN
  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const name = (body.name || '').trim();
      const rawPhone = (body.phone || '').toString().trim();
      const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
      const pin = (body.pin || '1234').toString().trim();
      const restaurantId = (body.restaurant_id || body.restaurantId || 'all').trim();

      if (!name) {
        return res.status(400).json({ success: false, error: 'Delivery partner name is required.' });
      }
      if (cleanPhone.length < 10) {
        return res.status(400).json({ success: false, error: 'Valid 10-digit mobile number is required.' });
      }
      if (pin.length < 4) {
        return res.status(400).json({ success: false, error: 'PIN must be at least 4 digits.' });
      }

      const partnerId = 'dp_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

      await sql`
        INSERT INTO delivery_partners (
          id, name, phone, pin, restaurant_id, is_active, total_deliveries, created_at, updated_at
        ) VALUES (
          ${partnerId}, ${name}, ${cleanPhone}, ${pin}, ${restaurantId}, true, 0, NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          phone = EXCLUDED.phone,
          pin = EXCLUDED.pin,
          restaurant_id = EXCLUDED.restaurant_id,
          is_active = true,
          updated_at = NOW();
      `;

      const newPartner = {
        id: partnerId,
        name,
        phone: cleanPhone,
        pin,
        restaurant_id: restaurantId,
        restaurantId,
        is_active: true,
        isActive: true,
        total_deliveries: 0,
        totalDeliveries: 0,
        created_at: new Date().toISOString()
      };

      console.log(`[Neon DB] Created Delivery Partner: ${name} (+91 ${cleanPhone}) PIN: ${pin}`);
      return res.status(201).json({ success: true, partner: newPartner, data: newPartner });
    } catch (err) {
      console.error('[Admin Delivery Partners POST Error]:', err.message);
      return res.status(500).json({ success: false, error: 'Failed to create rider credentials: ' + err.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
