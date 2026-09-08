import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL=(.+)/);
if (!match) {
  console.error('❌ No DATABASE_URL found in .env');
  process.exit(1);
}
const url = match[1].trim();

console.log('Connecting to database:', url.replace(/:[^:@]+@/, ':****@'));
const sql = neon(url);

async function setup() {
  try {
    console.log('1. Creating `students` table...');
    await sql`
      CREATE TABLE IF NOT EXISTS public.students (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        student_id VARCHAR(100),
        phone VARCHAR(50),
        hostel_block VARCHAR(100),
        room_number VARCHAR(100),
        total_orders INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log('✅ `students` table ready!');

    console.log('2. Creating `orders` table...');
    await sql`
      CREATE TABLE IF NOT EXISTS public.orders (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(255),
        student_name VARCHAR(255) NOT NULL,
        student_email VARCHAR(255),
        student_phone VARCHAR(50) NOT NULL,
        student_id VARCHAR(100),
        delivery_location TEXT NOT NULL,
        restaurant_id VARCHAR(100) NOT NULL,
        restaurant_name VARCHAR(255) NOT NULL,
        total_amount NUMERIC NOT NULL,
        status VARCHAR(50) NOT NULL,
        instructions TEXT,
        items JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        confirmed_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log('✅ `orders` table ready!');

    console.log('3. Creating `order_status_history` table...');
    await sql`
      CREATE TABLE IF NOT EXISTS public.order_status_history (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(50) NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        changed_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log('✅ `order_status_history` table ready!');

    // Insert sample student
    console.log('4. Seeding initial student record...');
    await sql`
      INSERT INTO public.students (id, name, email, student_id, phone, hostel_block, room_number, total_orders, updated_at)
      VALUES (
        'std-raj-01',
        'Snehith Raj',
        'snehithraj@campus.edu',
        'STU-2026-998',
        '+91 98765 43210',
        'Block B (Aryabhata)',
        'Room 402',
        1,
        NOW()
      )
      ON CONFLICT (email) DO UPDATE 
      SET total_orders = public.students.total_orders + 1, updated_at = NOW();
    `;
    console.log('✅ Student record seeded!');

    // Insert sample order
    console.log('5. Seeding initial order record...');
    const sampleItems = JSON.stringify([
      { id: 'item-1', name: 'Special Chicken Biryani', quantity: 1, price: 220 },
      { id: 'item-2', name: 'Fresh Mint Lime Soda', quantity: 2, price: 50 }
    ]);

    await sql`
      INSERT INTO public.orders (
        id, user_id, student_name, student_email, student_phone, student_id,
        delivery_location, restaurant_id, restaurant_name, total_amount,
        status, instructions, items, created_at, confirmed_at, updated_at
      ) VALUES (
        'CB-7829-LIVE',
        'std-raj-01',
        'Snehith Raj',
        'snehithraj@campus.edu',
        '+91 98765 43210',
        'STU-2026-998',
        'Hostel Block B - Room 402',
        'local-home-kitchen',
        'Local Home Kitchen',
        320.00,
        'PREPARING',
        'Please deliver to hostel security desk if room is locked',
        ${sampleItems}::jsonb,
        NOW(),
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO NOTHING;
    `;
    console.log('✅ Order record seeded!');

    console.log('\n========================================');
    console.log('🎉 ALL TABLES CREATED AND POPULATED IN `clgbytes` (public schema)!');
    console.log('========================================');

  } catch (err) {
    console.error('❌ Setup error:', err);
  }
}

setup();
