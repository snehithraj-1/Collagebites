import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_3O6tHydAMuSg@ep-soft-flower-a5yk954q-pooler.us-east-2.aws.neon.tech/clgbites?sslmode=require&channel_binding=require';

const sql = neon(DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let id = req.query.id;
  const body = req.body || {};

  // If matched with id = 'toggle', extract real id from request body or query
  if (id === 'toggle') {
    id = body.id || body.restaurantId || body.restaurant_id || req.query.restaurant_id || req.query.restaurantId;
  }

  if (!id) {
    return res.status(400).json({ success: false, error: 'Restaurant ID is required.' });
  }

  try {
    let targetState = body.is_open !== undefined ? Boolean(body.is_open) : undefined;

    if (typeof targetState === 'undefined') {
      const curr = await sql`SELECT is_open FROM restaurants WHERE id = ${id} LIMIT 1;`;
      if (curr && curr.length > 0) {
        targetState = !(curr[0].is_open !== false);
      } else {
        targetState = true;
      }
    }

    const rows = await sql`
      UPDATE restaurants 
      SET is_open = ${targetState}, updated_at = NOW()
      WHERE id = ${id} OR id LIKE ${id + '%'}
      RETURNING *;
    `;

    return res.status(200).json({ 
      success: true, 
      id, 
      restaurantId: id, 
      is_open: targetState, 
      restaurant: rows[0] 
    });
  } catch (err) {
    console.error('[Update Restaurant Error]:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to update restaurant: ' + err.message });
  }
}
