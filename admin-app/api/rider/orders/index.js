import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_IDfEm7NR9gHC@ep-winter-moon-axhp8k01-pooler.c-4.us-east-2.aws.neon.tech/clgbytes?sslmode=require';

const sql = neon(DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const riderId = req.query.riderId || req.query.rider_id;
    const phone = req.query.phone;
    const cleanPhone = phone ? phone.toString().replace(/\D/g, '').slice(-10) : '';

    let rows = [];

    if (riderId && cleanPhone) {
      rows = await sql`
        SELECT * FROM orders
        WHERE (delivery_partner_id = ${riderId} 
           OR RIGHT(REGEXP_REPLACE(COALESCE(delivery_partner_phone, ''), '[^0-9]', '', 'g'), 10) = ${cleanPhone})
        ORDER BY created_at DESC
        LIMIT 100;
      `;
    } else if (riderId) {
      rows = await sql`
        SELECT * FROM orders
        WHERE delivery_partner_id = ${riderId}
        ORDER BY created_at DESC
        LIMIT 100;
      `;
    } else if (cleanPhone) {
      rows = await sql`
        SELECT * FROM orders
        WHERE RIGHT(REGEXP_REPLACE(COALESCE(delivery_partner_phone, ''), '[^0-9]', '', 'g'), 10) = ${cleanPhone}
        ORDER BY created_at DESC
        LIMIT 100;
      `;
    } else {
      // Return recent assigned or out for delivery orders
      rows = await sql`
        SELECT * FROM orders
        WHERE status IN ('ASSIGNED', 'OUT_FOR_DELIVERY', 'OUT FOR DELIVERY')
        ORDER BY created_at DESC
        LIMIT 50;
      `;
    }

    const formatted = rows.map(r => {
      let itemsList = [];
      try {
        itemsList = typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || []);
      } catch {
        itemsList = [];
      }

      return {
        id: r.id,
        student_name: r.student_name || 'Student',
        studentName: r.student_name || 'Student',
        student_phone: r.student_phone || '',
        studentPhone: r.student_phone || '',
        student_email: r.student_email || '',
        delivery_location: r.delivery_location || 'SRM Gate 3',
        deliveryLocation: r.delivery_location || 'SRM Gate 3',
        restaurant_id: r.restaurant_id,
        restaurantId: r.restaurant_id,
        restaurant_name: r.restaurant_name,
        restaurantName: r.restaurant_name,
        total_amount: Number(r.total_amount) || 0,
        totalAmount: Number(r.total_amount) || 0,
        status: r.status,
        payment_method: r.payment_method || 'cod',
        paymentMethod: r.payment_method || 'cod',
        delivery_partner_id: r.delivery_partner_id,
        delivery_partner_name: r.delivery_partner_name,
        delivery_partner_phone: r.delivery_partner_phone,
        items: itemsList,
        created_at: r.created_at,
        createdAt: r.created_at,
        updated_at: r.updated_at
      };
    });

    return res.status(200).json({ success: true, orders: formatted });
  } catch (err) {
    console.error('[Rider Orders Error]:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch rider orders: ' + err.message });
  }
}
