import { createSql } from '../sqlClient.js';

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://postgres.shudbvqjxauqiyfgvpfk:Clgbites%40135@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

const sql = createSql(DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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

    return res.status(200).json({ success: true, restaurants: rows });
  } catch (err) {
    console.error('[Vercel Restaurants GET Error]:', err.message);
    return res.status(500).json({ error: 'Failed to fetch restaurants: ' + err.message });
  }
}
