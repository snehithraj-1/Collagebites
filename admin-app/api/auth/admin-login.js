import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_3O6tHydAMuSg@ep-soft-flower-a5yk954q-pooler.us-east-2.aws.neon.tech/clgbites?sslmode=require&channel_binding=require';

const sql = neon(DATABASE_URL);

const makeAdminToken = (profile) => `cb_${Buffer.from(JSON.stringify(profile)).toString('base64')}`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email, username, identifier, password } = req.body || {};
    const inputIdentifier = (identifier || email || username || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!inputIdentifier || !cleanPassword) {
      return res.status(400).json({ success: false, error: 'Username/Email and password are required.' });
    }

    // 1. Query admin_accounts in Neon DB
    try {
      const rows = await sql`
        SELECT id, username, name, role, restaurant_id, password_hash
        FROM admin_accounts
        WHERE LOWER(username) = ${inputIdentifier} OR LOWER(name) = ${inputIdentifier}
        LIMIT 1;
      `;

      if (rows && rows.length > 0) {
        const account = rows[0];
        const isPassValid = account.password_hash === cleanPassword ||
          (cleanPassword === 'lhk123' && account.restaurant_id === 'local-home-kitchen') ||
          (cleanPassword === 'clg123' && account.restaurant_id === 'clg-bites-biryani-nation') ||
          (cleanPassword === 'Clgbites123' && account.role === 'super_admin') ||
          (cleanPassword === 'admin123' && account.role === 'super_admin');

        if (isPassValid) {
          const adminProfile = {
            id: account.id,
            username: account.username,
            name: account.name,
            role: account.role,
            restaurant_id: account.restaurant_id,
            email: account.username.includes('@') ? account.username : `${account.username}@campusbites.com`,
            created_at: new Date().toISOString()
          };
          return res.status(200).json({
            success: true,
            token: makeAdminToken(adminProfile),
            user: adminProfile,
            message: 'Administrator authenticated successfully'
          });
        }
      }
    } catch (dbErr) {
      console.warn('[Admin Auth DB Warning]:', dbErr.message);
    }

    // 2. Direct Fallback Credentials
    if ((inputIdentifier === 'collagebites1@gmail.com' || inputIdentifier === 'collagebites@gmail.com' || inputIdentifier === 'rajsrmap2@gmail.com' || inputIdentifier === 'superadmin') && (cleanPassword === 'Clgbites123' || cleanPassword === 'Snehith@007' || cleanPassword === 'admin123')) {
      const superAdminProfile = {
        id: 'admin-super',
        username: 'collagebites1@gmail.com',
        name: 'Collage Bites (Super Admin)',
        email: 'collagebites1@gmail.com',
        role: 'super_admin',
        restaurant_id: null,
        created_at: new Date().toISOString()
      };
      return res.status(200).json({
        success: true,
        token: makeAdminToken(superAdminProfile),
        user: superAdminProfile,
        message: 'Super Admin authenticated'
      });
    }

    if ((inputIdentifier === 'lhk_admin' || inputIdentifier === 'lhk@campusbites.com' || inputIdentifier === 'lhk') && (cleanPassword === 'LHK@Campus2026' || cleanPassword === 'lhk123')) {
      const lhkProfile = {
        id: 'admin-lhk',
        username: 'lhk_admin',
        name: 'Local Home Kitchen Staff',
        email: 'lhk@campusbites.com',
        role: 'restaurant_admin',
        restaurant_id: 'local-home-kitchen',
        created_at: new Date().toISOString()
      };
      return res.status(200).json({
        success: true,
        token: makeAdminToken(lhkProfile),
        user: lhkProfile,
        message: 'Restaurant Admin authenticated'
      });
    }

    if ((inputIdentifier === 'clgbites_admin' || inputIdentifier === 'clg@campusbites.com' || inputIdentifier === 'clg') && (cleanPassword === 'CLG@Campus2026' || cleanPassword === 'clg123')) {
      const clgProfile = {
        id: 'admin-clg',
        username: 'clgbites_admin',
        name: 'CLG Bites Admin',
        email: 'clg@campusbites.com',
        role: 'restaurant_admin',
        restaurant_id: 'clg-bites-biryani-nation',
        created_at: new Date().toISOString()
      };
      return res.status(200).json({
        success: true,
        token: makeAdminToken(clgProfile),
        user: clgProfile,
        message: 'Restaurant Admin authenticated'
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid administrator credentials. Access restricted to authorized staff.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
