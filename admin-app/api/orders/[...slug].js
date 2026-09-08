import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_IDfEm7NR9gHC@ep-winter-moon-axhp8k01-pooler.c-4.us-east-2.aws.neon.tech/clgbytes?sslmode=require';

const sql = neon(DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse slug from query or URL
  const querySlug = req.query.slug;
  const slugArray = Array.isArray(querySlug) ? querySlug : (querySlug ? [querySlug] : []);
  const urlParts = (req.url || '').split('?')[0].replace(/^\/api\/orders\/?/, '').split('/').filter(Boolean);
  const parts = slugArray.length > 0 ? slugArray : urlParts;

  const orderId = parts[0] || '';
  const action = parts[1] || '';

  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  try {
    // 1. Assign Delivery Partner: PATCH /api/orders/:id/assign-partner
    if (action === 'assign-partner' || req.body?.deliveryPartner || req.body?.partnerId) {
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

    // 2. Update Order Status: PATCH /api/orders/:id/status or PATCH /api/orders/:id
    if (req.method === 'PATCH' || req.method === 'POST') {
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

    // 3. Delete Order: DELETE /api/orders/:id
    if (req.method === 'DELETE') {
      await sql`DELETE FROM orders WHERE id = ${orderId};`;
      return res.status(200).json({ success: true, message: `Order #${orderId} deleted` });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(`[Order Action Error for #${orderId}]:`, err.message);
    return res.status(500).json({ error: 'Serverless execution error: ' + err.message });
  }
}
