import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_IDfEm7NR9gHC@ep-winter-moon-axhp8k01-pooler.c-4.us-east-2.aws.neon.tech/clgbytes?sslmode=require';

const sql = neon(DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { orderId, partnerId, partnerName, partnerPhone } = req.body || {};

    if (!orderId || !partnerId) {
      return res.status(400).json({ success: false, error: 'orderId and partnerId are required.' });
    }

    let finalName = partnerName;
    let finalPhone = partnerPhone;

    // Look up partner details if not provided in payload
    if (!finalName || !finalPhone) {
      const partnerRows = await sql`
        SELECT name, phone FROM delivery_partners WHERE id = ${partnerId} LIMIT 1;
      `;
      if (partnerRows && partnerRows.length > 0) {
        finalName = partnerRows[0].name;
        finalPhone = partnerRows[0].phone;
      }
    }

    // Update order in Neon DB
    await sql`
      UPDATE orders
      SET 
        delivery_partner_id = ${partnerId},
        delivery_partner_name = ${finalName || 'Assigned Rider'},
        delivery_partner_phone = ${finalPhone || ''},
        status = 'ASSIGNED',
        updated_at = NOW()
      WHERE id = ${orderId};
    `;

    // Record status history
    try {
      await sql`
        INSERT INTO order_status_history (order_id, status, changed_at)
        VALUES (${orderId}, 'ASSIGNED', NOW());
      `;
    } catch (hErr) {}

    console.log(`[Neon DB] Order ${orderId} assigned to partner: ${finalName} (${finalPhone})`);
    return res.status(200).json({
      success: true,
      message: `Order assigned to ${finalName}`,
      deliveryPartner: {
        id: partnerId,
        name: finalName,
        phone: finalPhone
      }
    });
  } catch (err) {
    console.error('[Assign Partner Error]:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to assign partner: ' + err.message });
  }
}
