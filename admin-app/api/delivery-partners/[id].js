import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_IDfEm7NR9gHC@ep-winter-moon-axhp8k01-pooler.c-4.us-east-2.aws.neon.tech/clgbytes?sslmode=require';

const sql = neon(DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, PATCH, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extract ID from query params (Vercel passes dynamic [id] into req.query.id)
  const id = req.query.id;
  if (!id) {
    return res.status(400).json({ success: false, error: 'Partner ID is required.' });
  }

  // DELETE: Remove delivery partner
  if (req.method === 'DELETE') {
    try {
      await sql`
        DELETE FROM delivery_partners
        WHERE id = ${id};
      `;
      return res.status(200).json({ success: true, message: 'Delivery partner deleted successfully.' });
    } catch (err) {
      console.error('[Admin Delete Partner Error]:', err.message);
      return res.status(500).json({ success: false, error: 'Failed to delete partner: ' + err.message });
    }
  }

  // PATCH / PUT: Update status or PIN
  if (req.method === 'PATCH' || req.method === 'PUT') {
    try {
      const { pin, is_active } = req.body || {};
      if (pin !== undefined) {
        await sql`UPDATE delivery_partners SET pin = ${pin}, updated_at = NOW() WHERE id = ${id};`;
      }
      if (is_active !== undefined) {
        await sql`UPDATE delivery_partners SET is_active = ${is_active}, updated_at = NOW() WHERE id = ${id};`;
      }
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
