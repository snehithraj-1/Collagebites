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

async function main() {
  console.log('Querying restaurants...');
  const rows = await sql`SELECT id, name, is_open, phone, location, created_at FROM restaurants ORDER BY created_at ASC;`;
  console.log('RESTAURANTS IN NEON:');
  console.log(JSON.stringify(rows, null, 2));

  console.log('\nChecking menu_items count per restaurant_id:');
  const menuCounts = await sql`SELECT restaurant_id, count(*) as count FROM menu_items GROUP BY restaurant_id;`;
  console.log(JSON.stringify(menuCounts, null, 2));

  console.log('\nChecking orders count per restaurant_id:');
  const orderCounts = await sql`SELECT restaurant_id, count(*) as count FROM orders GROUP BY restaurant_id;`;
  console.log(JSON.stringify(orderCounts, null, 2));
}

main().catch(console.error);
