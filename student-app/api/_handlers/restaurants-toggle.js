import { createSql } from '../sqlClient.js';

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://postgres.shudbvqjxauqiyfgvpfk:Clgbites%40135@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

const sql = createSql(DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, PATCH, PUT, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const body = req.body || {};
    let id = body.id || body.restaurantId || body.restaurant_id || req.query?.id || req.query?.restaurantId || req.query?.restaurant_id;

    // Robust extraction from URL path if routed via catch-all (e.g. /api/restaurants/:id/toggle or /api/restaurants/:id)
    if (!id) {
      const urlToParse = req.headers['x-forwarded-uri'] || req.headers['x-matched-path'] || req.headers['x-vercel-matched-path'] || req.url || '';
      const match = urlToParse.match(/\/api\/restaurants\/([^/?]+)(?:\/toggle)?/i);
      if (match && match[1] && match[1] !== 'toggle') {
        id = decodeURIComponent(match[1]);
      }
    }

    if (!id) {
      return res.status(400).json({ success: false, error: 'Restaurant ID is required.' });
    }

    // Determine target open state (explicit boolean or toggle if not provided)
    let nextStatus = undefined;
    if (body.is_open !== undefined) {
      nextStatus = Boolean(body.is_open);
    } else if (req.query?.is_open !== undefined) {
      nextStatus = req.query.is_open === 'true';
    }

    if (nextStatus === undefined) {
      const current = await sql`
        SELECT is_open FROM restaurants 
        WHERE id = ${id} OR id LIKE ${id + '%'} 
        LIMIT 1;
      `;
      if (current && current.length > 0) {
        nextStatus = !(current[0].is_open !== false);
      } else {
        nextStatus = true;
      }
    }

    const updated = await sql`
      UPDATE restaurants
      SET is_open = ${nextStatus}, updated_at = NOW()
      WHERE id = ${id} OR id LIKE ${id + '%'}
      RETURNING *;
    `;

    const updatedRow = updated?.[0] || { id, is_open: nextStatus };
    return res.status(200).json({
      success: true,
      id: updatedRow.id || id,
      is_open: nextStatus,
      restaurant: updatedRow
    });
  } catch (err) {
    console.error('[Restaurant Toggle Error]:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to toggle restaurant: ' + err.message });
  }
}
