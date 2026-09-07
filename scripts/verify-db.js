import { neon } from '@neondatabase/serverless';
import fs from 'fs';

// Read connection string from .env
const envFile = fs.readFileSync('.env', 'utf-8');
const match = envFile.match(/DATABASE_URL=(.+)/);
const conn = match ? match[1].trim() : '';

const sql = neon(conn);

async function check() {
  console.log('--- NEON DATABASE LIVE VERIFICATION ---');
  const start = Date.now();
  const res = await sql`SELECT now() as current_time, current_database() as db, current_user as user;`;
  const duration = Date.now() - start;

  console.log('✅ Status: CONNECTED & ONLINE');
  console.log('⚡ Ping Latency:', duration + 'ms');
  console.log('📁 Database Name:', res[0].db);
  console.log('👤 Database User:', res[0].user);
  console.log('🕒 Server Time:', res[0].current_time);

  const orders = await sql`SELECT id, student_name, restaurant_name, total_amount, status FROM orders ORDER BY created_at DESC;`;
  console.log(`\n📦 Live Orders in Neon Database (${orders.length} total):`);
  console.table(orders);

  const statuses = await sql`SELECT * FROM restaurant_statuses;`;
  console.log('\n🏪 Live Restaurant Statuses in Neon Database:');
  console.table(statuses);

  const settings = await sql`SELECT * FROM system_settings;`;
  console.log('\n⚙️ Live System Settings in Neon Database:');
  console.table(settings);
  console.log('\n----------------------------------------');
}

check().catch(console.error);
