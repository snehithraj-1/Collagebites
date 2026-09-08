import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envText = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf8');
const match = envText.match(/DATABASE_URL=(.+)/);
const dbUrl = match ? match[1].trim() : '';

const sql = neon(dbUrl);

async function inspect() {
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public';
  `;
  console.log('Tables in Neon DB:', tables.map(t => t.table_name));

  const orderCols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'orders';
  `;
  console.log('Orders columns:', orderCols.map(c => c.column_name));

  const sampleOrder = await sql`SELECT id, status, delivery_partner_id, delivery_partner_name, delivery_partner_phone FROM orders LIMIT 5;`;
  console.log('Sample orders:', sampleOrder);

  const partners = await sql`SELECT * FROM delivery_partners;`;
  console.log('Delivery Partners:', partners);
}

inspect().catch(console.error);
