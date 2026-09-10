import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_IDfEm7NR9gHC@ep-winter-moon-axhp8k01-pooler.c-4.us-east-2.aws.neon.tech/clgbytes?sslmode=require';

const sql = neon(DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET /api/orders
  if (req.method === 'GET') {
    try {
      const restaurantId = req.query.restaurant_id || req.query.restaurant;
      let rows;
      if (restaurantId && restaurantId !== 'all') {
        rows = await sql`
          SELECT * FROM orders 
          WHERE restaurant_id = ${restaurantId}
          ORDER BY created_at DESC 
          LIMIT 200;
        `;
      } else {
        rows = await sql`
          SELECT * FROM orders 
          ORDER BY created_at DESC 
          LIMIT 200;
        `;
      }

      const formatted = rows.map(r => {
        let itemsList = [];
        try {
          itemsList = typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || []);
        } catch {
          itemsList = [];
        }

        const totalNum = Number(r.total_amount) || 0;
        const studentName = r.student_name || 'Student';
        const studentPhone = r.student_phone || '';
        const studentEmail = r.student_email || '';
        const deliveryLocation = r.delivery_location || 'Gate 3';
        const restaurantName = r.restaurant_name || 'Campus Kitchen';
        const restaurantIdVal = r.restaurant_id || 'local-home-kitchen';
        const partnerName = r.delivery_partner_name || null;
        const partnerPhone = r.delivery_partner_phone || null;
        const partnerId = r.delivery_partner_id || null;

        return {
          id: r.id,
          // Snake case keys
          student_name: studentName,
          student_email: studentEmail,
          student_phone: studentPhone,
          delivery_location: deliveryLocation,
          restaurant_id: restaurantIdVal,
          restaurant_name: restaurantName,
          total_amount: totalNum,
          status: r.status || 'CONFIRMED',
          payment_method: r.payment_method || 'cod',
          delivery_partner_id: partnerId,
          delivery_partner_name: partnerName,
          delivery_partner_phone: partnerPhone,
          created_at: r.created_at,
          updated_at: r.updated_at,
          items: itemsList,

          // Camel case keys
          studentName,
          studentEmail,
          studentPhone,
          deliveryLocation,
          restaurantId: restaurantIdVal,
          restaurantName,
          totalAmount: totalNum,
          paymentMethod: r.payment_method || 'cod',
          deliveryPartner: partnerId ? {
            id: partnerId,
            name: partnerName,
            phone: partnerPhone
          } : null,
          createdAt: r.created_at,
          updatedAt: r.updated_at
        };
      });

      return res.status(200).json({ success: true, orders: formatted, data: formatted });
    } catch (err) {
      console.error('[Orders GET Error]:', err.message);
      return res.status(500).json({ success: false, error: 'Failed to fetch orders: ' + err.message });
    }
  }

  // POST /api/orders
  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const studentName = body.student_name || body.studentName || 'Student';
      const studentPhone = body.student_phone || body.studentPhone || '';
      const studentEmail = (body.student_email || body.studentEmail || '').trim().toLowerCase();
      const deliveryLocation = body.delivery_location || body.deliveryLocation || 'SRM University - Gate 3';
      const restaurantId = body.restaurant_id || body.restaurantId || 'local-home-kitchen';
      const restaurantName = body.restaurant_name || body.restaurantName || 'Campus Kitchen';
      const totalAmount = Number(body.total_amount ?? body.totalAmount) || 0;
      const items = Array.isArray(body.items) ? body.items : [];
      const paymentMethod = body.payment_method || body.paymentMethod || 'cod';
      const instructions = body.instructions || null;

      if (!items.length || totalAmount <= 0) {
        return res.status(400).json({ success: false, error: 'Order must contain items and a valid total amount.' });
      }

      const orderId = body.id || ('CB-' + Math.floor(100000 + Math.random() * 900000));
      const itemsJson = JSON.stringify(items);
      const nowIso = new Date().toISOString();

      await sql`
        INSERT INTO orders (
          id, student_name, student_email, student_phone,
          delivery_location, restaurant_id, restaurant_name,
          items, total_amount, status, payment_method, instructions,
          created_at, updated_at
        ) VALUES (
          ${orderId}, ${studentName}, ${studentEmail}, ${studentPhone},
          ${deliveryLocation}, ${restaurantId}, ${restaurantName},
          ${itemsJson}::jsonb, ${totalAmount}, 'CONFIRMED', ${paymentMethod}, ${instructions},
          NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          updated_at = NOW();
      `;

      return res.status(201).json({ success: true, orderId });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
