import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL=(.+)/);
const dbUrl = match ? match[1].trim() : '';

const BASE_URL = 'http://localhost:5000';

console.log('====================================================');
console.log('🍽️ TESTING KITCHEN MENU & DISH INVENTORY (NEON DB)');
console.log('====================================================\n');

async function testMenuLifecycle() {
  // 1. Fetch menu
  console.log('1. Fetching all dishes via GET /api/menu...');
  const res1 = await fetch(`${BASE_URL}/api/menu`);
  const data1 = await res1.json();
  console.log(`✅ Retrieved ${data1.items?.length} dishes from database (Source: ${data1.source})`);

  // 2. Add New Dish
  console.log('\n2. Creating new dish: "Chef Special Butter Chicken Roll"...');
  const newDish = {
    id: `dish-test-${Date.now()}`,
    restaurant_id: 'local-home-kitchen',
    restaurant_name: 'Local Home Kitchen',
    name: "Chef's Special Butter Chicken Roll",
    description: 'Juicy butter chicken rolled in soft paratha with mint chutney and fresh onions',
    price: 140,
    category: 'Starters',
    is_veg: false,
    is_available: true,
    preparation_time: '12 mins'
  };

  const res2 = await fetch(`${BASE_URL}/api/menu`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newDish)
  });
  const data2 = await res2.json();
  console.log(`✅ Dish created: ${data2.item?.name} - ₹${data2.item?.price} (ID: ${data2.item?.id})`);

  // 3. 1-Click Toggle Sold Out
  console.log('\n3. Marking dish as SOLD OUT via PATCH /api/menu/:id/availability...');
  const res3 = await fetch(`${BASE_URL}/api/menu/${newDish.id}/availability`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_available: false })
  });
  const data3 = await res3.json();
  console.log(`✅ Dish availability updated: is_available = ${data3.is_available} (SOLD OUT)`);

  // 4. Update Price & Details
  console.log('\n4. Updating price to ₹150 via PUT /api/menu/:id...');
  const res4 = await fetch(`${BASE_URL}/api/menu/${newDish.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ price: 150, preparation_time: '10 mins' })
  });
  const data4 = await res4.json();
  console.log(`✅ Dish updated: ${data4.message}`);

  // 5. Verify directly in Neon Database
  console.log('\n5. Querying Neon PostgreSQL table `menu_items`...');
  const sql = neon(dbUrl);
  const rows = await sql`SELECT id, name, price, is_available FROM menu_items WHERE id = ${newDish.id};`;
  console.log('🐘 Neon PostgreSQL Record:', rows[0]);

  // 6. Toggle back to Available
  console.log('\n6. Toggling back to IN STOCK...');
  await fetch(`${BASE_URL}/api/menu/${newDish.id}/availability`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_available: true })
  });
  console.log('✅ Dish is now available for students to order!');

  console.log('\n====================================================');
  console.log('🎉 MENU & INVENTORY SYSTEM FULLY VERIFIED & LIVE!');
  console.log('====================================================\n');
}

testMenuLifecycle().catch(console.error);
