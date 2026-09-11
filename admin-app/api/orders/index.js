import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_3O6tHydAMuSg@ep-soft-flower-a5yk954q-pooler.us-east-2.aws.neon.tech/clgbites?sslmode=require&channel_binding=require';

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

      // Format with BOTH snake_case and camelCase so frontend components always find the fields
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
        const restaurantName = r.restaurant_name || (r.restaurant_id === 'clg-bites-biryani-nation' ? 'CLG Bites' : 'Local Home Kitchen');
        const restaurantIdVal = r.restaurant_id || 'local-home-kitchen';
        const partnerName = r.delivery_partner_name || null;
        const partnerPhone = r.delivery_partner_phone || null;
        const partnerId = r.delivery_partner_id || null;

        return {
          id: r.id,
          // Snake case keys (expected by OrdersTable.jsx)
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

          // Camel case keys (for standard react components)
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

      return res.status(200).json({ 
        success: true, 
        orders: formatted, 
        data: formatted,
        count: formatted.length 
      });
    } catch (err) {
      console.error('[Admin Orders GET Error]:', err.message);
      return res.status(500).json({ success: false, error: 'Failed to fetch orders: ' + err.message });
    }
  }

  // POST /api/orders
  if (req.method === 'POST') {
    try {
      const order = req.body || {};
      const orderId = order.id || 'CB-' + Math.floor(100000 + Math.random() * 900000);
      const studentName = order.student_name || order.studentName || 'Student';
      const studentPhone = order.student_phone || order.studentPhone || '';
      const studentEmail = order.student_email || order.studentEmail || '';
      const deliveryLocation = order.delivery_location || order.deliveryLocation || 'Gate 3';
      const restaurantId = order.restaurant_id || order.restaurantId || 'local-home-kitchen';
      const restaurantName = order.restaurant_name || order.restaurantName || 'Campus Kitchen';
      const totalAmount = Number(order.total_amount || order.totalAmount || 0);
      const paymentMethod = order.payment_method || order.paymentMethod || 'cod';
      const items = JSON.stringify(order.items || []);

      await sql`
        INSERT INTO orders (
          id, student_name, student_phone, student_email, delivery_location,
          restaurant_id, restaurant_name, total_amount, payment_method, items,
          status, created_at, updated_at
        ) VALUES (
          ${orderId}, ${studentName}, ${studentPhone}, ${studentEmail}, ${deliveryLocation},
          ${restaurantId}, ${restaurantName}, ${totalAmount}, ${paymentMethod}, ${items}::jsonb,
          'CONFIRMED', NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          updated_at = NOW();
      `;

      return res.status(201).json({ success: true, orderId });
    } catch (err) {
      console.error('[Admin Order Create Error]:', err.message);
      return res.status(500).json({ success: false, error: 'Failed to create order: ' + err.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
