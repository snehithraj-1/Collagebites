import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_IDfEm7NR9gHC@ep-winter-moon-axhp8k01-pooler.c-4.us-east-2.aws.neon.tech/clgbytes?sslmode=require';

const sql = neon(DATABASE_URL);

export default async function handler(req, res) {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Robust path segment parsing from both query and URL
  const urlPath = (req.url || '').split('?')[0].replace(/^\/api\/?/, '');
  const urlSegments = urlPath.split('/').filter(Boolean);
  const querySegments = Array.isArray(req.query?.path) ? req.query.path : (req.query?.path ? [req.query.path] : []);
  const segments = querySegments.length > 0 ? querySegments : urlSegments;

  const root = segments[0] || '';
  const sub1 = segments[1] || '';
  const sub2 = segments[2] || '';

  try {
    // ----------------------------------------------------
    // 1. ORDERS API: /api/orders
    // ----------------------------------------------------
    if (root === 'orders') {
      // GET /api/orders
      if (req.method === 'GET' && !sub1) {
        const rows = await sql`
          SELECT * FROM orders 
          ORDER BY created_at DESC 
          LIMIT 200;
        `;
        const formatted = rows.map(r => ({
          id: r.id,
          studentName: r.student_name,
          studentEmail: r.student_email,
          studentPhone: r.student_phone,
          deliveryLocation: r.delivery_location,
          restaurantId: r.restaurant_id,
          restaurantName: r.restaurant_name,
          items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || []),
          totalAmount: Number(r.total_amount),
          status: r.status,
          paymentMethod: r.payment_method || 'cod',
          deliveryPartner: r.delivery_partner_id ? {
            id: r.delivery_partner_id,
            name: r.delivery_partner_name,
            phone: r.delivery_partner_phone
          } : null,
          createdAt: r.created_at,
          updatedAt: r.updated_at
        }));
        return res.status(200).json({ success: true, orders: formatted });
      }

      // PATCH /api/orders/:id/assign-partner
      if (req.method === 'PATCH' && sub1 && sub2 === 'assign-partner') {
        const orderId = sub1;
        const { deliveryPartner, partnerId, partnerName, partnerPhone } = req.body || {};

        let pId = null;
        let pName = null;
        let pPhone = null;

        if (deliveryPartner) {
          pId = deliveryPartner.id || null;
          pName = deliveryPartner.name || null;
          pPhone = deliveryPartner.phone || null;
        } else if (partnerId) {
          pId = partnerId;
          pName = partnerName || null;
          pPhone = partnerPhone || null;
        }

        // If assigning, fetch courier name/phone from DB if missing
        if (pId && (!pName || !pPhone)) {
          const partners = await sql`SELECT * FROM delivery_partners WHERE id = ${pId} LIMIT 1;`;
          if (partners && partners.length > 0) {
            pName = partners[0].name;
            pPhone = partners[0].phone;
          }
        }

        const updated = await sql`
          UPDATE orders 
          SET 
            delivery_partner_id = ${pId},
            delivery_partner_name = ${pName},
            delivery_partner_phone = ${pPhone},
            updated_at = NOW()
          WHERE id = ${orderId}
          RETURNING *;
        `;

        if (!updated || updated.length === 0) {
          return res.status(404).json({ error: 'Order not found' });
        }

        const r = updated[0];
        return res.status(200).json({
          success: true,
          order: {
            id: r.id,
            studentName: r.student_name,
            studentEmail: r.student_email,
            deliveryPartner: pId ? { id: pId, name: pName, phone: pPhone } : null
          }
        });
      }

      // PATCH /api/orders/:id/status or PATCH /api/orders/:id
      if (req.method === 'PATCH' && sub1) {
        const orderId = sub1;
        const { status } = req.body || {};
        if (!status) {
          return res.status(400).json({ error: 'Status is required' });
        }

        const updated = await sql`
          UPDATE orders 
          SET status = ${status}, updated_at = NOW()
          WHERE id = ${orderId}
          RETURNING *;
        `;

        if (!updated || updated.length === 0) {
          return res.status(404).json({ error: 'Order not found' });
        }

        return res.status(200).json({ success: true, order: updated[0] });
      }

      // DELETE /api/orders/:id
      if (req.method === 'DELETE' && sub1) {
        const orderId = sub1;
        await sql`DELETE FROM orders WHERE id = ${orderId};`;
        return res.status(200).json({ success: true, message: `Order #${orderId} deleted` });
      }
    }

    // ----------------------------------------------------
    // 2. DELIVERY PARTNERS API: /api/delivery-partners
    // ----------------------------------------------------
    if (root === 'delivery-partners') {
      // GET /api/delivery-partners
      if (req.method === 'GET') {
        const rows = await sql`
          SELECT 
            id, 
            name, 
            phone, 
            is_active as "isActive", 
            total_deliveries as "totalDeliveries", 
            created_at as "createdAt"
          FROM delivery_partners 
          ORDER BY name ASC;
        `;
        return res.status(200).json({ success: true, partners: rows });
      }

      // POST /api/delivery-partners
      if (req.method === 'POST') {
        const { name, phone } = req.body || {};
        if (!name || !phone) {
          return res.status(400).json({ error: 'Name and phone are required' });
        }
        const id = 'dp-' + Date.now().toString(36);
        const rows = await sql`
          INSERT INTO delivery_partners (id, name, phone, is_active, total_deliveries, created_at, updated_at)
          VALUES (${id}, ${name.trim()}, ${phone.trim()}, true, 0, NOW(), NOW())
          RETURNING *;
        `;
        return res.status(201).json({ success: true, partner: rows[0] });
      }

      // PATCH /api/delivery-partners/:id
      if (req.method === 'PATCH' && sub1) {
        const partnerId = sub1;
        const { isActive, is_active } = req.body || {};
        const activeState = typeof isActive !== 'undefined' ? Boolean(isActive) : Boolean(is_active);

        const rows = await sql`
          UPDATE delivery_partners 
          SET is_active = ${activeState}, updated_at = NOW()
          WHERE id = ${partnerId}
          RETURNING *;
        `;
        return res.status(200).json({ success: true, partner: rows[0] });
      }

      // DELETE /api/delivery-partners/:id
      if (req.method === 'DELETE' && sub1) {
        const partnerId = sub1;
        await sql`DELETE FROM delivery_partners WHERE id = ${partnerId};`;
        return res.status(200).json({ success: true, message: 'Courier deleted' });
      }
    }

    // ----------------------------------------------------
    // 3. RESTAURANTS API: /api/restaurants
    // ----------------------------------------------------
    if (root === 'restaurants') {
      // GET /api/restaurants
      if (req.method === 'GET') {
        let isGlobalOrderingEnabled = true;
        try {
          const settingRows = await sql`SELECT ordering_enabled FROM system_settings WHERE id = 'global';`;
          if (settingRows && settingRows.length > 0) {
            isGlobalOrderingEnabled = settingRows[0].ordering_enabled !== false;
          }
        } catch (e) {}

        let rows = await sql`SELECT * FROM restaurants ORDER BY id ASC;`;
        if (!isGlobalOrderingEnabled) {
          rows = rows.map(r => ({ ...r, is_open: false }));
        }
        return res.status(200).json({ success: true, restaurants: rows });
      }

      // PATCH /api/restaurants/:id or /api/restaurants/:id/toggle
      if ((req.method === 'PATCH' || req.method === 'POST') && sub1) {
        const restId = sub1;
        const { is_open } = req.body || {};
        let targetState = Boolean(is_open);

        if (typeof is_open === 'undefined') {
          const curr = await sql`SELECT is_open FROM restaurants WHERE id = ${restId} LIMIT 1;`;
          if (curr && curr.length > 0) {
            targetState = !(curr[0].is_open !== false);
          }
        }

        const rows = await sql`
          UPDATE restaurants 
          SET is_open = ${targetState}, updated_at = NOW()
          WHERE id = ${restId} OR id LIKE ${restId + '%'}
          RETURNING *;
        `;
        return res.status(200).json({ success: true, restaurant: rows[0] });
      }
    }

    // ----------------------------------------------------
    // 4. MENU API: /api/menu
    // ----------------------------------------------------
    if (root === 'menu') {
      // GET /api/menu
      if (req.method === 'GET') {
        const rows = await sql`
          SELECT 
            id, 
            restaurant_id as "restaurantId", 
            restaurant_name as "restaurantName", 
            name, 
            description, 
            price::numeric as price, 
            category, 
            is_veg as "isVeg", 
            is_available as "isAvailable", 
            image_url as "imageUrl", 
            preparation_time as "preparationTime", 
            rating::numeric as rating
          FROM menu_items 
          ORDER BY restaurant_id, category, name;
        `;
        return res.status(200).json(rows);
      }

      // PATCH /api/menu/:id (toggle stock)
      if (req.method === 'PATCH' && sub1) {
        const itemId = sub1;
        const { is_available, isAvailable } = req.body || {};
        const availableState = typeof isAvailable !== 'undefined' ? Boolean(isAvailable) : Boolean(is_available);

        await sql`
          UPDATE menu_items 
          SET is_available = ${availableState}, updated_at = NOW()
          WHERE id = ${itemId};
        `;
        return res.status(200).json({ success: true, id: itemId, isAvailable: availableState });
      }

      // DELETE /api/menu/:id
      if (req.method === 'DELETE' && sub1) {
        const itemId = sub1;
        await sql`DELETE FROM menu_items WHERE id = ${itemId};`;
        return res.status(200).json({ success: true, message: `Dish #${itemId} deleted` });
      }
    }

    // ----------------------------------------------------
    // 5. STUDENTS API: /api/students
    // ----------------------------------------------------
    if (root === 'students') {
      if (req.method === 'GET') {
        const rows = await sql`
          SELECT 
            id, 
            name, 
            email, 
            phone, 
            role, 
            created_at as "createdAt",
            updated_at as "updatedAt"
          FROM students 
          ORDER BY created_at DESC 
          LIMIT 300;
        `;
        return res.status(200).json(rows);
      }
    }

    // ----------------------------------------------------
    // 6. SYSTEM SETTINGS API: /api/settings
    // ----------------------------------------------------
    if (root === 'settings') {
      if (req.method === 'GET') {
        const rows = await sql`SELECT ordering_enabled FROM system_settings WHERE id = 'global';`;
        const isEnabled = rows && rows.length > 0 ? rows[0].ordering_enabled !== false : true;
        return res.status(200).json({ success: true, ordering_enabled: isEnabled });
      }

      if (req.method === 'POST' || req.method === 'PATCH') {
        const { ordering_enabled } = req.body || {};
        const isEnabled = ordering_enabled !== false;

        await sql`
          INSERT INTO system_settings (id, ordering_enabled, updated_at)
          VALUES ('global', ${isEnabled}, NOW())
          ON CONFLICT (id) DO UPDATE SET
            ordering_enabled = ${isEnabled},
            updated_at = NOW();
        `;

        await sql`
          UPDATE restaurants 
          SET is_open = ${isEnabled}, updated_at = NOW();
        `;

        return res.status(200).json({ success: true, ordering_enabled: isEnabled });
      }
    }

    return res.status(404).json({ error: `API route /api/${segments.join('/')} not found` });
  } catch (err) {
    console.error(`[Vercel Admin API Error /api/${segments.join('/')}]:`, err.message);
    return res.status(500).json({ error: 'Serverless execution error: ' + err.message });
  }
}
