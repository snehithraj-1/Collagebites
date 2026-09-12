import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import dns from 'dns';

const originalDnsLookup = dns.lookup;
const fallbackResolver = new dns.promises.Resolver();
fallbackResolver.setServers(['8.8.8.8', '1.1.1.1']);

dns.lookup = function (hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  originalDnsLookup(hostname, options, (err, address, family) => {
    if (!err && address) return callback(null, address, family);
    fallbackResolver.resolve4(hostname).then((addrs) => {
      if (addrs && addrs.length > 0) return callback(null, addrs[0], 4);
      callback(err, address, family);
    }).catch(() => callback(err, address, family));
  });
};

const envText = fs.readFileSync('.env', 'utf8');
const match = envText.match(/^\s*DATABASE_URL\s*=\s*(.+)$/m);
let url = match ? match[1].trim() : '';
if (url.startsWith('"') && url.endsWith('"')) url = url.slice(1, -1);
if (url.startsWith("'") && url.endsWith("'")) url = url.slice(1, -1);

const sql = neon(url);

async function runMigration() {
  console.log('--- 1. Cleaning up duplicate restaurants and menu items ---');
  await sql`DELETE FROM menu_items WHERE restaurant_id IN ('campus-delight', 'campus-delight-dhaba');`;
  await sql`DELETE FROM restaurants WHERE id IN ('campus-delight', 'campus-delight-dhaba');`;
  console.log('Deleted campus-delight & campus-delight-dhaba records.');

  console.log('--- 2. Updating canonical restaurant details ---');
  await sql`
    UPDATE restaurants 
    SET name = 'CLG Bites', phone = '9989955833', updated_at = NOW() 
    WHERE id = 'clg-bites-biryani-nation';
  `;
  await sql`
    UPDATE restaurants 
    SET phone = '9989955833', updated_at = NOW() 
    WHERE id = 'local-home-kitchen';
  `;
  await sql`
    UPDATE restaurants 
    SET phone = '9989955833', updated_at = NOW() 
    WHERE id = 'vilasa-cafe';
  `;
  console.log('Canonical restaurant details updated.');

  console.log('--- 3. Adding completed_at and cancelled_at columns to orders table ---');
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;`;

  console.log('--- 4. Migrating existing legacy order statuses to COMPLETED ---');
  await sql`
    UPDATE orders 
    SET status = 'COMPLETED', completed_at = COALESCE(completed_at, updated_at, NOW()) 
    WHERE status IN ('DELIVERED', 'OUT_FOR_DELIVERY', 'ASSIGNED', 'READY', 'PREPARING');
  `;

  console.log('--- 5. Verifying final restaurants table ---');
  const rows = await sql`SELECT id, name, is_open, phone, location FROM restaurants ORDER BY id ASC;`;
  console.log('Final Restaurants in Neon DB:');
  console.log(JSON.stringify(rows, null, 2));

  if (rows.length !== 3) {
    throw new Error(`Expected exactly 3 restaurants, but found ${rows.length}`);
  }

  console.log('✅ Database migration completed successfully!');
}

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
