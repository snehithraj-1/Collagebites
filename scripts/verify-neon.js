import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL=(.+)/);
if (!match) {
  console.error('❌ No DATABASE_URL found in .env');
  process.exit(1);
}
const url = match[1].trim();
console.log('Connecting to Neon PostgreSQL:', url.replace(/:[^:@]+@/, ':****@'));

try {
  const sql = neon(url);
  const health = await sql`SELECT NOW() as now, current_database() as db;`;
  const orders = await sql`SELECT count(*) as count FROM orders;`;
  const students = await sql`SELECT count(*) as count FROM students;`;

  console.log('\n========================================');
  console.log('✅ NEON POSTGRESQL CONNECTED & HEALTHY!');
  console.log('========================================');
  console.log('Database Name: ', health[0].db);
  console.log('Server Time:   ', health[0].now);
  console.log('Total Orders:  ', orders[0].count);
  console.log('Total Students:', students[0].count);
  console.log('========================================\n');
} catch (err) {
  console.error('❌ Connection Failed:', err.message);
}
