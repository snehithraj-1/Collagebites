import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_IDfEm7NR9gHC@ep-winter-moon-axhp8k01-pooler.c-4.us-east-2.aws.neon.tech/clgbytes?sslmode=require';

const sql = neon(DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      await sql`DELETE FROM orders WHERE id = ${id};`;
      return res.status(200).json({ success: true, message: `Order #${id} deleted` });
    } catch (err) {
      console.error('[Delete Order Error]:', err.message);
      return res.status(500).json({ error: 'Failed to delete order: ' + err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
