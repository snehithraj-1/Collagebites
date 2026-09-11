import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Bulletproof DNS resilience for Neon serverless PostgreSQL
const originalDnsLookup = dns.lookup;
const fallbackResolver = new dns.promises.Resolver();
fallbackResolver.setServers(['8.8.8.8', '1.1.1.1']);

dns.lookup = function (hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  originalDnsLookup(hostname, options, (err, address, family) => {
    if (!err && address) {
      return callback(null, address, family);
    }
    fallbackResolver.resolve4(hostname).then((addrs) => {
      if (addrs && addrs.length > 0) {
        if (options && options.all) {
          return callback(null, addrs.map((a) => ({ address: a, family: 4 })));
        }
        return callback(null, addrs[0], 4);
      }
      callback(err, address, family);
    }).catch(() => {
      callback(err, address, family);
    });
  });
};

function getDbUrl() {
  const envText = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf8');
  const match = envText.match(/^\s*DATABASE_URL\s*=\s*(.+)$/m);
  return match ? match[1].trim() : '';
}

async function updateAdmin() {
  const dbUrl = getDbUrl();
  console.log('Connecting to Neon DB...');
  const sql = neon(dbUrl);

  console.log('Upserting admin-super credentials: collagebites1@gmail.com / Clgbites123');
  await sql`
    INSERT INTO admin_accounts (id, username, name, role, restaurant_id, password_hash, updated_at)
    VALUES ('admin-super', 'collagebites1@gmail.com', 'Collage Bites (Super Admin)', 'super_admin', null, 'Clgbites123', NOW())
    ON CONFLICT (id) DO UPDATE SET
      username = EXCLUDED.username,
      name = EXCLUDED.name,
      password_hash = EXCLUDED.password_hash,
      role = EXCLUDED.role,
      restaurant_id = EXCLUDED.restaurant_id,
      updated_at = NOW();
  `;

  await sql`
    INSERT INTO admin_accounts (id, username, name, role, restaurant_id, password_hash, updated_at)
    VALUES ('admin-super-alias', 'collagebites@gmail.com', 'Collage Bites Admin', 'super_admin', null, 'Clgbites123', NOW())
    ON CONFLICT (id) DO UPDATE SET
      username = EXCLUDED.username,
      name = EXCLUDED.name,
      password_hash = EXCLUDED.password_hash,
      role = EXCLUDED.role,
      restaurant_id = EXCLUDED.restaurant_id,
      updated_at = NOW();
  `;

  const accounts = await sql`SELECT id, username, name, role, password_hash FROM admin_accounts;`;
  console.log('✅ Successfully updated Admin Accounts in Neon DB:');
  console.table(accounts);
}

updateAdmin().catch(console.error);
