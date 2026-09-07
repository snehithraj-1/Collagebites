import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const conn = env.match(/DATABASE_URL=(.+)/)[1].trim();
const sql = neon(conn);

async function migrate() {
  console.log('--- EXECUTING ORDER MANAGEMENT MIGRATION ---');
  console.log('Connecting to Neon PostgreSQL...');

  // 1. Add confirmation_expires_at and updated_at to orders safely
  console.log('1. Adding confirmation_expires_at and updated_at to orders table...');
  await sql`
    ALTER TABLE orders 
    ADD COLUMN IF NOT EXISTS confirmation_expires_at TIMESTAMPTZ;
  `;
  await sql`
    ALTER TABLE orders 
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
  `;
  console.log('✓ Columns added to orders table.');

  // 2. Create order_items table
  console.log('2. Creating order_items table...');
  await sql`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      item_name VARCHAR(255) NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      unit_price NUMERIC(10, 2) NOT NULL,
      total_price NUMERIC(10, 2) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
  `;
  console.log('✓ order_items table created with foreign key and index.');

  // 3. Backfill order_items for existing orders if empty
  console.log('3. Backfilling order_items from existing orders JSONB...');
  const existingOrders = await sql`SELECT id, items, created_at FROM orders;`;
  let itemsCount = 0;

  for (const order of existingOrders) {
    const existingItems = await sql`SELECT count(*) FROM order_items WHERE order_id = ${order.id};`;
    if (parseInt(existingItems[0].count, 10) === 0 && Array.isArray(order.items)) {
      for (const item of order.items) {
        const qty = item.qty || item.quantity || 1;
        const unitPrice = parseFloat(item.price || item.unit_price || 0);
        const totalPrice = unitPrice * qty;
        await sql`
          INSERT INTO order_items (order_id, item_name, quantity, unit_price, total_price, created_at)
          VALUES (${order.id}, ${item.name || item.item_name || 'Dish'}, ${qty}, ${unitPrice}, ${totalPrice}, ${order.created_at || new Date()});
        `;
        itemsCount++;
      }
    }
  }
  console.log(`✓ Backfilled ${itemsCount} order items for existing orders.`);

  // 4. Verify Final Structure
  const orderCols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'orders';
  `;
  console.log('\nUpdated `orders` columns:');
  console.table(orderCols);

  const itemCols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'order_items';
  `;
  console.log('\n`order_items` columns:');
  console.table(itemCols);

  const totalItems = await sql`SELECT count(*) FROM order_items;`;
  console.log(`\nTotal rows in order_items: ${totalItems[0].count}`);

  console.log('\nMigration completed successfully! 🎉');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
