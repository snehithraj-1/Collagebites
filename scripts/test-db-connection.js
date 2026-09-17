import { sql, checkDbHealth } from '../server/db.js';

async function testConnection() {
  console.log('====================================================');
  console.log('🔍 INITIATING DATABASE CONNECTION TEST');
  console.log('====================================================');

  const health = await checkDbHealth();
  console.log('Health check result:', JSON.stringify(health, null, 2));

  if (!health.ok) {
    console.error('❌ Health check failed!');
    process.exit(1);
  }

  console.log('\n--- 1. BASIC CONNECTION & SERVER INFO ---');
  const start = Date.now();
  const [info] = await sql`SELECT 
    current_database() as database_name,
    current_user as db_user,
    version() as postgres_version,
    NOW() as server_now;`;
  const ping = Date.now() - start;

  console.log(`✅ Ping latency: ${ping}ms`);
  console.log(`📁 Database: ${info.database_name}`);
  console.log(`👤 User: ${info.db_user}`);
  console.log(`🕒 Server Time: ${info.server_now}`);
  console.log(`ℹ️ Version: ${info.postgres_version.split('\n')[0]}`);

  console.log('\n--- 2. SCHEMA & TABLES DISCOVERY ---');
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `;
  console.log(`Found ${tables.length} tables in 'public' schema:`);

  for (const t of tables) {
    try {
      const countRes = await sql.query(`SELECT count(*) as count FROM "${t.table_name}"`);
      console.log(`  • ${t.table_name.padEnd(25)} : ${countRes[0].count} rows`);
    } catch (err) {
      console.log(`  • ${t.table_name.padEnd(25)} : Error (${err.message})`);
    }
  }

  console.log('\n--- 3. SAMPLE DATA VERIFICATION ---');
  
  // Orders
  try {
    const orders = await sql`SELECT id, student_name, restaurant_name, total_amount, status, created_at FROM orders ORDER BY created_at DESC LIMIT 3;`;
    console.log(`Recent orders count: ${orders.length}`);
    if (orders.length > 0) {
      console.table(orders);
    }
  } catch (e) {
    console.log('Orders table check:', e.message);
  }

  // System settings
  try {
    const settings = await sql`SELECT * FROM system_settings LIMIT 5;`;
    console.log(`System settings count: ${settings.length}`);
    if (settings.length > 0) {
      console.table(settings);
    }
  } catch (e) {
    console.log('System settings check:', e.message);
  }

  // Restaurants
  try {
    const rests = await sql`SELECT id, name, is_open FROM restaurants;`;
    console.log(`\nRestaurants (${rests.length} found):`);
    console.table(rests);
  } catch (e) {
    console.log('Restaurants check:', e.message);
  }

  // Admin accounts
  try {
    const admins = await sql`SELECT id, username, role, restaurant_id FROM admin_accounts;`;
    console.log(`\nAdmin accounts (${admins.length} found):`);
    console.table(admins);
  } catch (e) {
    console.log('Admin accounts check:', e.message);
  }

  // Delivery partners
  try {
    const partners = await sql`SELECT id, name, phone, is_active FROM delivery_partners;`;
    console.log(`\nDelivery partners (${partners.length} found):`);
    console.table(partners);
  } catch (e) {
    console.log('Delivery partners check:', e.message);
  }

  console.log('\n====================================================');
  console.log('🎉 CONCLUSION: DATABASE IS CONNECTED AND FULLY OPERATIONAL!');
  console.log('====================================================');

  if (sql.pool) {
    await sql.pool.end();
  }
}

testConnection().catch(err => {
  console.error('❌ Connection test error:', err);
  process.exit(1);
});
