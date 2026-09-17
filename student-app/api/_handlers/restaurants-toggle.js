import { createSql } from '../sqlClient.js';

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://postgres:Clgbites%40135@db.shudbvqjxauqiyfgvpfk.supabase.co:5432/postgres';

const sql = createSql(DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, PATCH, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const body = req.body || {};
    const id = body.id || body.restaurantId || body.restaurant_id || req.query.id;

    if (!id) {
      return res.status(400).json({ success: false, error: 'Restaurant ID is required.' });
    }

    let nextStatus = body.is_open !== undefined ? Boolean(body.is_open) : undefined;

    if (nextStatus === undefined) {
      const current = await sql`SELECT is_open FROM restaurants WHERE id = ${id} LIMIT 1;`;
      if (current && current.length > 0) {
        nextStatus = !current[0].is_open;
      } else {
        nextStatus = true;
      }
    }

    await sql`
      UPDATE restaurants
      SET is_open = ${nextStatus}, updated_at = NOW()
      WHERE id = ${id};
    `;

    return res.status(200).json({ success: true, id, is_open: nextStatus });
  } catch (err) {
    console.error('[Restaurant Toggle Error]:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to toggle restaurant: ' + err.message });
  }
}
