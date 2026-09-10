import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_IDfEm7NR9gHC@ep-winter-moon-axhp8k01-pooler.c-4.us-east-2.aws.neon.tech/clgbytes?sslmode=require';

const sql = neon(DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const id = req.query.id;
  if (!id) {
    return res.status(400).json({ success: false, error: 'Dish ID is required.' });
  }

  try {
    const body = req.body || {};
    const isAvailable = body.is_available !== undefined ? Boolean(body.is_available) : (body.isAvailable !== undefined ? Boolean(body.isAvailable) : true);

    await sql`
      UPDATE menu_items
      SET is_available = ${isAvailable}, updated_at = NOW()
      WHERE id = ${id};
    `;

    return res.status(200).json({ success: true, id, is_available: isAvailable });
  } catch (err) {
    console.error('[Menu Availability Error]:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to update availability: ' + err.message });
  }
}
