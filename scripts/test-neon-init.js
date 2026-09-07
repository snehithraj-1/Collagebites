import { neon } from '@neondatabase/serverless';

const connectionString = 'postgresql://neondb_owner:npg_PQnFCBANg24r@ep-dark-fire-a5mvjvbd-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require';
const sql = neon(connectionString);

async function run() {
  console.log('Connecting to Neon PostgreSQL...');
  try {
    const version = await sql`SELECT version();`;
    console.log('Connected to Neon successfully! PostgreSQL Version:', version[0].version);

    console.log('Creating tables...');
    // 1. Orders
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        student_name VARCHAR(255) NOT NULL,
        student_phone VARCHAR(20) NOT NULL,
        student_id VARCHAR(50),
        restaurant_id VARCHAR(100) NOT NULL,
        restaurant_name VARCHAR(255) NOT NULL,
        delivery_location TEXT NOT NULL,
        instructions TEXT,
        total_amount NUMERIC(10, 2) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED',
        items JSONB NOT NULL,
        cancelled_reason TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        confirmed_at TIMESTAMPTZ,
        cancelled_at TIMESTAMPTZ
      );
    `;
    console.log('✓ Orders table created.');

    // 2. Restaurant Statuses
    await sql`
      CREATE TABLE IF NOT EXISTS restaurant_statuses (
        restaurant_id VARCHAR(100) PRIMARY KEY,
        status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log('✓ Restaurant statuses table created.');

    // 3. System Settings
    await sql`
      CREATE TABLE IF NOT EXISTS system_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log('✓ System settings table created.');

    // 4. Initial Seed
    await sql`
      INSERT INTO restaurant_statuses (restaurant_id, status)
      VALUES 
        ('local-home-kitchen', 'OPEN'),
        ('campus-delight-dhaba', 'OPEN')
      ON CONFLICT (restaurant_id) DO NOTHING;
    `;

    await sql`
      INSERT INTO system_settings (setting_key, setting_value)
      VALUES 
        ('overall_ordering', 'true')
      ON CONFLICT (setting_key) DO NOTHING;
    `;

    // 5. Seed initial demo orders if empty
    const countRes = await sql`SELECT count(*) FROM orders;`;
    if (parseInt(countRes[0].count, 10) === 0) {
      console.log('Seeding initial campus orders into Neon...');
      await sql`
        INSERT INTO orders (id, student_name, student_phone, student_id, restaurant_id, restaurant_name, delivery_location, total_amount, status, items, created_at)
        VALUES 
          ('LHK-7821', 'Raj Snehith', '9989955833', 'AP22110010482', 'local-home-kitchen', 'Local Home Kitchen', 'Hostel Block B (Boys), Room 412', 370, 'CONFIRMED', '[{"name":"Chicken Dum Biryani","qty":1,"price":170},{"name":"Chicken 65","qty":1,"price":200}]', NOW() - INTERVAL '25 minutes'),
          ('ORD-8930', 'Ananya Sharma', '9848011223', 'AP22110010214', 'local-home-kitchen', 'Local Home Kitchen', 'Hostel Block C (Girls), Room 204', 210, 'CONFIRMED', '[{"name":"Veg Manchurian","qty":1,"price":80},{"name":"Double Egg Chicken Fried Rice","qty":1,"price":130}]', NOW() - INTERVAL '2 hours'),
          ('ORD-8711', 'Karthik Verma', '9701234567', 'AP22110010901', 'campus-delight-dhaba', 'Campus Delight Kitchen', 'Hostel Block A (Boys), Room 108', 220, 'CANCELLED', '[{"name":"Special North Indian Veg Thali","qty":1,"price":160},{"name":"Sweet Punjabi Lassi","qty":1,"price":60}]', NOW() - INTERVAL '4 hours');
      `;
      console.log('✓ Initial orders seeded.');
    }

    const finalCount = await sql`SELECT count(*) FROM orders;`;
    console.log(`Total orders in Neon Database: ${finalCount[0].count}`);

    console.log('All Neon tables initialized successfully! 🎉');
  } catch (err) {
    console.error('Error connecting to Neon:', err);
    process.exit(1);
  }
}

run();
