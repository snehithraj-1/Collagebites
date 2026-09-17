import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.resolve(__dirname, '../supabase/setup_all.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

const { Client } = pg;
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Clgbites%40135@db.shudbvqjxauqiyfgvpfk.supabase.co:5432/postgres';

async function runSetup() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL at', connectionString.split('@')[1]);
    await client.connect();
    console.log('Connected! Executing setup_all.sql...');
    
    await client.query(sql);
    console.log('setup_all.sql executed successfully! 🎉');

    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
    console.log('Initialized public tables:', res.rows.map(r => r.table_name));

    const restaurantsRes = await client.query("SELECT id, name, is_open FROM restaurants;");
    console.log('Seeded restaurants:', restaurantsRes.rows);

    const menuCountRes = await client.query("SELECT count(*) FROM menu_items;");
    console.log('Seeded menu items count:', menuCountRes.rows[0].count);

  } catch (err) {
    console.error('Error running setup_all.sql:', err);
  } finally {
    await client.end();
  }
}

runSetup();
