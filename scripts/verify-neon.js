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

try {
  const sql = neon(url);

  console.log('Connecting to URL:', url.replace(/:[^:@]+@/, ':****@'));
  const dbInfo = await sql`SELECT current_database(), current_user, inet_server_addr();`;
  console.log('Database Info:', dbInfo[0]);

  console.log('\n--- ORDERS IN NEON DB ---');
  const orders = await sql`
    SELECT id, student_name, student_email, student_phone, total_amount, status, created_at, updated_at 
    FROM orders 
    ORDER BY created_at DESC 
    LIMIT 10;
  `;
  console.table(orders);

  console.log('\n--- STUDENTS IN NEON DB ---');
  const students = await sql`
    SELECT id, name, email, student_id, phone, hostel_block, room_number, total_orders, updated_at 
    FROM students 
    ORDER BY updated_at DESC;
  `;
  console.table(students);

} catch (err) {
  console.error('❌ Query Failed:', err.message);
}
