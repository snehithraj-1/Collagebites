import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const conn = env.match(/DATABASE_URL=(.+)/)[1].trim();
const sql = neon(conn);

async function inspect() {
  const cols = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'orders'
    ORDER BY ordinal_position;
  `;
  console.log('--- Orders Table Columns ---');
  console.table(cols);

  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;
  console.log('--- Public Tables ---');
  console.table(tables);
}

inspect().catch(console.error);
