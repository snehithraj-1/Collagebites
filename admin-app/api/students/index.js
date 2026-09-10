import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_IDfEm7NR9gHC@ep-winter-moon-axhp8k01-pooler.c-4.us-east-2.aws.neon.tech/clgbytes?sslmode=require';

const sql = neon(DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      let rows = [];
      try {
        rows = await sql`
          SELECT 
            id, 
            name, 
            email, 
            phone, 
            student_id,
            hostel_block,
            room_number,
            total_orders,
            created_at,
            updated_at
          FROM students 
          ORDER BY created_at DESC 
          LIMIT 300;
        `;
      } catch (e) {
        console.warn('[Students Table Select Warning]:', e.message);
      }

      // Also ensure any student who placed an order in Neon DB is included
      try {
        const orderStudents = await sql`
          SELECT 
            DISTINCT ON (student_phone)
            id as order_id,
            student_name,
            student_email,
            student_phone,
            delivery_location,
            created_at
          FROM orders
          WHERE student_phone IS NOT NULL AND student_phone != '' AND student_phone != '—'
          ORDER BY student_phone, created_at DESC;
        `;

        const existingPhones = new Set((rows || []).map(r => (r.phone || '').replace(/\D/g, '').slice(-10)));

        for (const os of orderStudents) {
          const cleanP = (os.student_phone || '').replace(/\D/g, '').slice(-10);
          if (cleanP && !existingPhones.has(cleanP)) {
            rows.push({
              id: 'stu_' + cleanP,
              name: os.student_name || 'Student',
              email: os.student_email || '',
              phone: os.student_phone,
              student_id: 'SRM-' + cleanP.slice(-4),
              hostel_block: 'SRM Campus',
              room_number: os.delivery_location || 'Gate 3',
              total_orders: 1,
              created_at: os.created_at,
              updated_at: os.created_at
            });
            existingPhones.add(cleanP);
          }
        }
      } catch (e) {
        console.warn('[Order students backfill warning]:', e.message);
      }

      const formatted = rows.map(r => ({
        id: r.id,
        name: r.name || 'Student',
        email: r.email || '',
        phone: r.phone || '—',
        student_id: r.student_id || '—',
        studentId: r.student_id || '—',
        hostel_block: r.hostel_block || 'SRM Campus',
        hostelBlock: r.hostel_block || 'SRM Campus',
        room_number: r.room_number || 'Gate 3',
        roomNumber: r.room_number || 'Gate 3',
        total_orders: Number(r.total_orders || 0),
        totalOrders: Number(r.total_orders || 0),
        created_at: r.created_at,
        createdAt: r.created_at
      }));

      // Return both array payload and object with .students and .data
      return res.status(200).json({ 
        success: true, 
        students: formatted, 
        data: formatted,
        count: formatted.length 
      });
    } catch (err) {
      console.error('[Admin Students GET Error]:', err.message);
      return res.status(500).json({ success: false, error: 'Failed to fetch students: ' + err.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
