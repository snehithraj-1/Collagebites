import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_3O6tHydAMuSg@ep-soft-flower-a5yk954q-pooler.us-east-2.aws.neon.tech/clgbites?sslmode=require&channel_binding=require';

const sql = neon(DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const id = req.query.id;
  if (!id) {
    return res.status(400).json({ success: false, error: 'Dish ID is required.' });
  }

  // DELETE dish
  if (req.method === 'DELETE') {
    try {
      await sql`DELETE FROM menu_items WHERE id = ${id};`;
      return res.status(200).json({ success: true, message: 'Dish deleted.' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // PUT / PATCH dish
  if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const body = req.body || {};
      const name = body.name;
      const description = body.description;
      const price = body.price !== undefined ? Number(body.price) : undefined;
      const category = body.category;
      const isVeg = body.is_veg !== undefined ? body.is_veg : body.isVeg;
      const isAvailable = body.is_available !== undefined ? body.is_available : body.isAvailable;
      const imageUrl = body.image_url || body.imageUrl;

      await sql`
        UPDATE menu_items
        SET
          name = COALESCE(${name}, name),
          description = COALESCE(${description}, description),
          price = COALESCE(${price}, price),
          category = COALESCE(${category}, category),
          is_veg = COALESCE(${isVeg}, is_veg),
          is_available = COALESCE(${isAvailable}, is_available),
          image_url = COALESCE(${imageUrl}, image_url),
          updated_at = NOW()
        WHERE id = ${id};
      `;

      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
