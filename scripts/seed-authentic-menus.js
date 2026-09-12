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

  // Also handle alias for campus-delight / campus-delight-dhaba so old references gracefully map to Clg Bites Biryani Nation
  const aliases = ['campus-delight', 'campus-delight-dhaba'];
  for (const aId of aliases) {
    await sql`
      INSERT INTO restaurants (id, name, description, is_open, phone, location, cuisine, image_url, updated_at)
      VALUES (${aId}, 'Clg Bites Biryani Nation', 'A Taste You''ll Love... Fresh, Delicious Biryanis with Special Campus Discounts!', true, '9989955833', 'Neerukonda Campus Hub, SRM University AP', 'Chicken & Veg Biryanis', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80', NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = 'Clg Bites Biryani Nation',
        description = 'A Taste You''ll Love... Fresh, Delicious Biryanis with Special Campus Discounts!',
        phone = '9989955833',
        is_open = true,
        updated_at = NOW();
    `;
  }

  // 3. Clear old placeholder items and seed all authentic items
  console.log('\n🍛 Seeding Authentic Menu Items with Food Photography Images...');
  
  // Clean old menu items for these restaurants
  await sql`DELETE FROM menu_items WHERE restaurant_id IN ('local-home-kitchen', 'clg-bites-biryani-nation', 'vilasa-cafe', 'campus-delight', 'campus-delight-dhaba');`;

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

  // Also duplicate clg-bites-biryani-nation items for campus-delight alias so any request with the old restaurant_id gets the new menu
  for (const item of AUTHENTIC_MENU_ITEMS.filter(i => i.restaurant_id === 'clg-bites-biryani-nation')) {
    const aliasItem = {
      ...item,
      id: `${item.id}-alias`,
      restaurant_id: 'campus-delight'
    };
    await sql`
      INSERT INTO menu_items (
        id, restaurant_id, restaurant_name, category, name, description, price, is_veg, is_available, image_url, preparation_time, rating, created_at, updated_at
      ) VALUES (
        ${aliasItem.id},
        ${aliasItem.restaurant_id},
        ${aliasItem.restaurant_name},
        ${aliasItem.category},
        ${aliasItem.name},
        ${aliasItem.description},
        ${aliasItem.price},
        ${aliasItem.is_veg},
        true,
        ${aliasItem.image_url},
        '15-20 mins',
        4.8,
        NOW(),
        NOW()
      ) ON CONFLICT (id) DO NOTHING;
    `;
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
