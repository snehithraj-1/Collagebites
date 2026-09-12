import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AUTHENTIC_RESTAURANTS, AUTHENTIC_MENU_ITEMS } from '../server/authenticMenuData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

let dbUrl = '';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/DATABASE_URL=(.+)/);
  if (match) dbUrl = match[1].trim();
}

console.log('====================================================');
console.log('🍕 SEEDING AUTHENTIC MENUS & DISH IMAGES TO NEON DB');
console.log('====================================================');
console.log(`Restaurants to seed: ${AUTHENTIC_RESTAURANTS.length}`);
console.log(`Menu Items to seed:  ${AUTHENTIC_MENU_ITEMS.length}`);

async function seedDatabase() {
  if (!dbUrl) {
    console.error('DATABASE_URL not found!');
    return;
  }

  const sql = neon(dbUrl);

  // 1. Ensure image_url exists on menu_items
  try {
    await sql`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS image_url TEXT;`;
    await sql`ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS phone VARCHAR(50);`;
    await sql`ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS location TEXT;`;
    await sql`ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS cuisine TEXT;`;
    console.log('✅ Columns verified on Neon tables.');
  } catch (err) {
    console.warn('Column check warning:', err.message);
  }

  // 2. Seed / Upsert Restaurants
  console.log('\n🏪 Seeding Restaurants...');
  for (const r of AUTHENTIC_RESTAURANTS) {
    await sql`
      INSERT INTO restaurants (id, name, description, is_open, phone, location, cuisine, image_url, updated_at)
      VALUES (${r.id}, ${r.name}, ${r.description}, true, ${r.phone}, ${r.location}, ${r.cuisine}, ${r.image_url}, NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = ${r.name},
        description = ${r.description},
        is_open = true,
        phone = ${r.phone},
        location = ${r.location},
        cuisine = ${r.cuisine},
        image_url = ${r.image_url},
        updated_at = NOW();
    `;
    console.log(`   ✨ Restaurant Synced: ${r.name} (${r.id})`);
  }



  // 3. Clear old placeholder items and seed all authentic items
  console.log('\n🍛 Seeding Authentic Menu Items with Food Photography Images...');
  
  // Clean old menu items for these restaurants
  await sql`DELETE FROM menu_items WHERE restaurant_id IN ('local-home-kitchen', 'clg-bites-biryani-nation');`;

  let insertedCount = 0;
  for (const item of AUTHENTIC_MENU_ITEMS) {
    await sql`
      INSERT INTO menu_items (
        id, restaurant_id, restaurant_name, category, name, description, price, is_veg, is_available, image_url, preparation_time, rating, created_at, updated_at
      ) VALUES (
        ${item.id},
        ${item.restaurant_id},
        ${item.restaurant_name},
        ${item.category},
        ${item.name},
        ${item.description},
        ${item.price},
        ${item.is_veg},
        true,
        ${item.image_url},
        '15-20 mins',
        4.8,
        NOW(),
        NOW()
      );
    `;
    insertedCount++;
  }

  console.log(`✅ Successfully seeded ${insertedCount} authentic dishes to Neon PostgreSQL!`);

  // 4. Update local JSON DB cache
  const localDbPath = path.resolve(__dirname, '../server/data/orders_db.json');
  if (fs.existsSync(localDbPath)) {
    try {
      const localData = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
      localData.restaurants = AUTHENTIC_RESTAURANTS;
      localData.menu_items = AUTHENTIC_MENU_ITEMS;
      fs.writeFileSync(localDbPath, JSON.stringify(localData, null, 2));
      console.log('✅ Local orders_db.json cache updated.');
    } catch (e) {
      console.warn('Local db cache update error:', e.message);
    }
  }

  console.log('\n🎉 Menu Seeding Complete! Both kitchens are fully loaded with real menus & photos.');
}

seedDatabase().catch(console.error);
