import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_3O6tHydAMuSg@ep-soft-flower-a5yk954q-pooler.us-east-2.aws.neon.tech/clgbites?sslmode=require&channel_binding=require';

const sql = neon(DATABASE_URL);

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
    const { phone, pin } = req.body || {};
    const cleanPhone = (phone || '').toString().replace(/\D/g, '').slice(-10);
    const cleanPin = (pin || '').toString().trim();

    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({ success: false, error: 'Please enter a valid 10-digit mobile number.' });
    }
    if (!cleanPin) {
      return res.status(400).json({ success: false, error: 'Please enter your security PIN.' });
    }

    const rows = await sql`
      SELECT id, name, phone, pin, restaurant_id, is_active, total_deliveries
      FROM delivery_partners
      WHERE RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 10) = ${cleanPhone}
        AND pin = ${cleanPin}
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Please verify your phone number and security PIN with your kitchen admin.'
      });
    }

    const partner = rows[0];
    if (partner.is_active === false) {
      return res.status(403).json({
        success: false,
        error: 'Your delivery partner account has been deactivated. Please contact the administrator.'
      });
    }

    const partnerObj = {
      id: partner.id,
      name: partner.name,
      phone: partner.phone,
      restaurant_id: partner.restaurant_id || 'all',
      restaurantId: partner.restaurant_id || 'all',
      total_deliveries: Number(partner.total_deliveries || 0),
      totalDeliveries: Number(partner.total_deliveries || 0)
    };

    console.log(`[Rider Login] Rider authenticated: ${partner.name} (+91 ${cleanPhone})`);
    return res.status(200).json({
      success: true,
      partner: partnerObj,
      rider: partnerObj
    });
  } catch (err) {
    console.error('[Rider Login Error]:', err.message);
    return res.status(500).json({ success: false, error: 'Authentication service error: ' + err.message });
  }
}
