import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envText = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf8');
const match = envText.match(/^\s*DATABASE_URL\s*=\s*(.+)$/m);
const dbUrl = match ? match[1].trim() : '';

const sql = neon(dbUrl);

async function run() {
  console.log('Updating restaurant name in Neon PostgreSQL...');
  await sql`
    UPDATE restaurants 
    SET name = 'Clg Bites Biryani Nation', updated_at = NOW() 
    WHERE id = 'clg-bites-biryani-nation';
  `;

  // Also update any menu_items that might have old restaurant_name
  await sql`
    UPDATE menu_items 
    SET restaurant_name = 'Clg Bites Biryani Nation' 
    WHERE restaurant_id = 'clg-bites-biryani-nation';
  `;

  const rows = await sql`SELECT id, name, location, phone FROM restaurants ORDER BY id ASC;`;
  console.log('✅ Current Restaurants in Neon DB:');
  console.table(rows);
}

run().catch(console.error);
