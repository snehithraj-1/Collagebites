import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbUrl = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_3O6tHydAMuSg@ep-soft-flower-a5yk954q-pooler.us-east-2.aws.neon.tech/clgbites?sslmode=require&channel_binding=require';

const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/DATABASE_URL=(.+)/);
  if (match) dbUrl = match[1].trim();
}

const sql = neon(dbUrl);

async function main() {
  console.log('🚀 Starting Vilasa Café removal from Neon database...');
  try {
    // 1. Delete menu items
    const deletedItems = await sql`
      DELETE FROM menu_items WHERE restaurant_id = 'vilasa-cafe' RETURNING id;
    `;
    console.log(`✅ Deleted ${deletedItems.length} menu items belonging to Vilasa Café.`);

    // 2. Delete delivery partners if any
    try {
      const deletedPartners = await sql`
        DELETE FROM delivery_partners WHERE restaurant_id = 'vilasa-cafe' RETURNING id;
      `;
      console.log(`✅ Deleted ${deletedPartners.length} delivery partners for Vilasa Café.`);
    } catch (e) {
      console.log('ℹ️ Delivery partners check/delete skipped:', e.message);
    }

    // 3. Delete admin accounts
    const deletedAdmins = await sql`
      DELETE FROM admin_accounts 
      WHERE restaurant_id = 'vilasa-cafe' OR id = 'admin-vilasa' OR username = 'vilasa_admin'
      RETURNING id;
    `;
    console.log(`✅ Deleted ${deletedAdmins.length} admin accounts for Vilasa Café.`);

    // 4. Delete orders associated with vilasa-cafe if any
    try {
      const deletedOrders = await sql`
        DELETE FROM orders WHERE restaurant_id = 'vilasa-cafe' RETURNING id;
      `;
      console.log(`✅ Deleted ${deletedOrders.length} orders belonging to Vilasa Café.`);
    } catch (e) {
      console.log('ℹ️ Orders check/delete skipped:', e.message);
    }

    // 5. Delete restaurant
    const deletedRestaurants = await sql`
      DELETE FROM restaurants WHERE id = 'vilasa-cafe' RETURNING id;
    `;
    console.log(`✅ Deleted restaurant record 'vilasa-cafe' (${deletedRestaurants.length} removed).`);

    // 6. Verification
    const remainingRest = await sql`SELECT id, name FROM restaurants;`;
    console.log('\n📋 Active Restaurants in Neon DB:', remainingRest);

    const remainingItems = await sql`SELECT count(*) as count FROM menu_items WHERE restaurant_id = 'vilasa-cafe';`;
    console.log(`🔍 Remaining Vilasa menu items: ${remainingItems[0]?.count || 0}`);

    console.log('\n🎉 Successfully cleaned Vilasa Café from Neon Database!');
  } catch (err) {
    console.error('❌ Error removing Vilasa Café from database:', err);
    process.exit(1);
  }
}

main();
