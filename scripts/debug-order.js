import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_IDfEm7NR9gHC@ep-winter-moon-axhp8k01-pooler.c-4.us-east-2.aws.neon.tech/clgbytes?sslmode=require';
const sql = neon(DATABASE_URL);

async function main() {
  const cols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders' ORDER BY ordinal_position;`;
  console.log('Orders columns in Neon:');
  cols.forEach(c => console.log(`  - ${c.column_name} (${c.data_type})`));

  const allOrders = await sql`SELECT * FROM orders WHERE restaurant_id = 'maggi-hotspot' OR delivery_location LIKE '%Hostel Block 2%';`;
  console.log('Orders with Maggi Hotspot:', JSON.stringify(allOrders, null, 2));

  const restaurants = await sql`SELECT * FROM restaurants;`;
  console.log('Restaurants in Neon:', JSON.stringify(restaurants, null, 2));
}

main();
