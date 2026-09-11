import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_3O6tHydAMuSg@ep-soft-flower-a5yk954q-pooler.us-east-2.aws.neon.tech/clgbites?sslmode=require&channel_binding=require';

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
        // Snake case keys (expected by MenuManagerModal filters)
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

        // Camel case keys
        restaurantId: r.restaurant_id,
        restaurantName: r.restaurant_name,
        isVeg: r.is_veg !== false,
        isAvailable: r.is_available !== false,
        imageUrl: r.image_url,
        preparationTime: r.preparation_time || '15-20 mins'
      }));

      // Return BOTH { success: true, items: formatted } AND formatted array for maximum compatibility
      return res.status(200).json({ success: true, items: formatted, count: formatted.length });
    } catch (err) {
      console.error('[Admin Menu GET Error]:', err.message);
      return res.status(500).json({ success: false, error: 'Failed to fetch menu items: ' + err.message });
    }
  }

  // POST: Add new menu dish
  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const id = body.id || ('dish_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6));
      const restaurantId = body.restaurant_id || body.restaurantId || 'local-home-kitchen';
      const restaurantName = body.restaurant_name || body.restaurantName || (restaurantId === 'clg-bites' ? 'CLG Bites' : 'Local Home Kitchen');
      const name = (body.name || '').trim();
      const description = (body.description || '').trim();
      const price = Number(body.price) || 0;
      const category = (body.category || 'Main Course').trim();
      const isVeg = body.is_veg !== undefined ? Boolean(body.is_veg) : (body.isVeg !== undefined ? Boolean(body.isVeg) : true);
      const isAvailable = body.is_available !== undefined ? Boolean(body.is_available) : (body.isAvailable !== undefined ? Boolean(body.isAvailable) : true);
      const imageUrl = body.image_url || body.imageUrl || null;
      const prepTime = body.preparation_time || body.preparationTime || '15-20 mins';

      if (!name || price <= 0) {
        return res.status(400).json({ success: false, error: 'Dish name and valid price are required.' });
      }

      await sql`
        INSERT INTO menu_items (
          id, restaurant_id, restaurant_name, name, description, price, category, is_veg, is_available, preparation_time, image_url, updated_at
        ) VALUES (
          ${id}, ${restaurantId}, ${restaurantName}, ${name}, ${description}, ${price}, ${category}, ${isVeg}, ${isAvailable}, ${prepTime}, ${imageUrl}, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          price = EXCLUDED.price,
          category = EXCLUDED.category,
          is_veg = EXCLUDED.is_veg,
          is_available = EXCLUDED.is_available,
          image_url = EXCLUDED.image_url,
          updated_at = NOW();
      `;

      const newDish = {
        id,
        restaurant_id: restaurantId,
        restaurant_name: restaurantName,
        name,
        description,
        price,
        category,
        is_veg: isVeg,
        is_available: isAvailable,
        image_url: imageUrl,
        preparation_time: prepTime,
        restaurantId,
        restaurantName,
        isVeg,
        isAvailable,
        imageUrl,
        preparationTime: prepTime
      };

      return res.status(201).json({ success: true, item: newDish });
    } catch (err) {
      console.error('[Admin Menu POST Error]:', err.message);
      return res.status(500).json({ success: false, error: 'Failed to create menu item: ' + err.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
