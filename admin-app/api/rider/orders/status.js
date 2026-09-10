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
    const { orderId, status, riderId } = req.body || {};
    if (!orderId || !status) {
      return res.status(400).json({ success: false, error: 'orderId and status are required.' });
    }

    const cleanStatus = status.trim().toUpperCase();

    // Update order status in Neon DB
    await sql`
      UPDATE orders
      SET status = ${cleanStatus}, updated_at = NOW()
      WHERE id = ${orderId};
    `;

    // Record status history
    try {
      await sql`
        INSERT INTO order_status_history (order_id, status, changed_at)
        VALUES (${orderId}, ${cleanStatus}, NOW());
      `;
    } catch (hErr) {}

    // If delivered, increment rider's total_deliveries
    if (cleanStatus === 'DELIVERED') {
      try {
        if (riderId) {
          await sql`
            UPDATE delivery_partners
            SET total_deliveries = COALESCE(total_deliveries, 0) + 1, updated_at = NOW()
            WHERE id = ${riderId};
          `;
        } else {
          // Look up delivery_partner_id on the order
          const ord = await sql`SELECT delivery_partner_id FROM orders WHERE id = ${orderId} LIMIT 1;`;
          if (ord && ord.length > 0 && ord[0].delivery_partner_id) {
            await sql`
              UPDATE delivery_partners
              SET total_deliveries = COALESCE(total_deliveries, 0) + 1, updated_at = NOW()
              WHERE id = ${ord[0].delivery_partner_id};
            `;
          }
        }
      } catch (dErr) {
        console.warn('[Increment Delivery Count Warning]:', dErr.message);
      }
    }

    console.log(`[Rider Status] Order ${orderId} transitioned to ${cleanStatus}`);
    return res.status(200).json({ success: true, orderId, status: cleanStatus });
  } catch (err) {
    console.error('[Rider Status Error]:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to update delivery status: ' + err.message });
  }
}
