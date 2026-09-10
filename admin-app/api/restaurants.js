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

  // GET: Return all restaurants
  if (req.method === 'GET') {
    try {
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
      return res.status(200).json({ success: true, restaurants: rows, data: rows });
    } catch (err) {
      console.error('[Admin Restaurants GET Error]:', err.message);
      return res.status(500).json({ success: false, error: 'Failed to fetch restaurants: ' + err.message });
    }
  }

  // POST: Toggle restaurant
  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const id = body.id || body.restaurantId || req.query.id;
      if (!id) {
        return res.status(400).json({ success: false, error: 'Restaurant ID required' });
      }
      const nextStatus = Boolean(body.is_open);
      await sql`UPDATE restaurants SET is_open = ${nextStatus}, updated_at = NOW() WHERE id = ${id};`;
      return res.status(200).json({ success: true, id, is_open: nextStatus });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
