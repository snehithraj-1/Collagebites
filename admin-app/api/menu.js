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

  // GET: Fetch all menu items
  if (req.method === 'GET') {
    try {
      const restaurantId = req.query.restaurant_id || req.query.restaurant;
      let rows;
      if (restaurantId && restaurantId !== 'all' && restaurantId !== 'ALL') {
        rows = await sql`
          SELECT * FROM menu_items 
          WHERE restaurant_id = ${restaurantId}
          ORDER BY category, name;
        `;
      } else {
        rows = await sql`
          SELECT * FROM menu_items 
          ORDER BY restaurant_id, category, name;
        `;
      }

      const formatted = rows.map(r => ({
        id: r.id,
        restaurant_id: r.restaurant_id,
        restaurant_name: r.restaurant_name,
        name: r.name,
        description: r.description,
        price: Number(r.price),
        category: r.category,
        is_veg: r.is_veg !== false,
        is_available: r.is_available !== false,
        image_url: r.image_url,
        preparation_time: r.preparation_time || '15-20 mins',
        rating: Number(r.rating || 4.5),
        restaurantId: r.restaurant_id,
        restaurantName: r.restaurant_name,
        isVeg: r.is_veg !== false,
        isAvailable: r.is_available !== false,
        imageUrl: r.image_url,
        preparationTime: r.preparation_time || '15-20 mins'
      }));

      return res.status(200).json({ success: true, items: formatted, data: formatted, count: formatted.length });
    } catch (err) {
      console.error('[Menu GET Error]:', err.message);
      return res.status(500).json({ success: false, error: 'Failed to fetch menu items: ' + err.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
