import { 
  createOrderInDb, 
  getOrderByIdFromDb, 
  confirmOrderInDb, 
  cancelOrderInDb, 
  updateOrderStatusInDb, 
  getAllOrdersFromDb,
  deleteOrderFromDb,
  sql
} from '../server/db.js';

async function runTests() {
  console.log('=== STARTING BACKEND API & DB TESTS ===\n');

  // Test 1: Create Order (Phase 3)
  console.log('Test 1: Creating order with PENDING_CONFIRMATION and 30s expiry...');
  const testOrder = await createOrderInDb({
    studentName: 'Test Student',
    studentPhone: '9989955833',
    studentId: 'AP241001',
    restaurantId: 'local-home-kitchen',
    restaurantName: 'Local Home Kitchen',
    deliveryLocation: 'Hostel Block B, Room 412',
    instructions: 'Extra spicy',
    items: [
      { name: 'Chicken Dum Biryani', qty: 2, price: 170 },
      { name: 'Paneer Biryani', qty: 1, price: 210 }
    ]
  });

  console.log('Created Order ID:', testOrder.id);
  console.log('Status:', testOrder.status);
  console.log('Total Amount:', testOrder.totalAmount);
  console.log('Confirmation Expires At:', testOrder.confirmationExpiresAt);

  if (testOrder.status !== 'PENDING_CONFIRMATION') throw new Error('Status should be PENDING_CONFIRMATION');
  console.log('✓ Test 1 Passed.\n');

  // Test 2: Get Order & Items (Phase 2 & 4)
  console.log('Test 2: Fetching order details and order_items...');
  const fetched = await getOrderByIdFromDb(testOrder.id);
  console.log('Fetched Order:', fetched.id, 'Status:', fetched.status);
  console.log('Order Items Count:', fetched.orderItems?.length);
  console.table(fetched.orderItems);

  if (!fetched.orderItems || fetched.orderItems.length !== 2) {
    throw new Error('Expected 2 order items in order_items table');
  }
  console.log('✓ Test 2 Passed.\n');

  // Test 3: Confirm Order within 30s (Phase 4)
  console.log('Test 3: Confirming order within 30s...');
  const confirmRes = await confirmOrderInDb(testOrder.id);
  console.log('Confirm Result:', confirmRes.success ? 'CONFIRMED' : confirmRes.error);
  if (!confirmRes.success || confirmRes.order.status !== 'CONFIRMED') {
    throw new Error('Expected status to become CONFIRMED');
  }
  console.log('✓ Test 3 Passed.\n');

  // Test 4: Phase 5 Status Transitions
  console.log('Test 4: Testing status transition PREPARING...');
  const prepRes = await updateOrderStatusInDb(testOrder.id, 'PREPARING');
  console.log('Status after PREPARING:', prepRes.order.status);
  if (prepRes.order.status !== 'PREPARING') throw new Error('Expected status PREPARING');

  console.log('Testing invalid transition (PREPARING -> DELIVERED)...');
  const invalidRes = await updateOrderStatusInDb(testOrder.id, 'DELIVERED');
  console.log('Invalid transition error caught:', invalidRes.error);
  if (!invalidRes.error) throw new Error('Should have rejected invalid transition');
  console.log('✓ Test 4 Passed.\n');

  // Test 5: Expiry enforcement (Phase 4)
  console.log('Test 5: Testing 30-second expiry enforcement...');
  // Create an expired test order
  const expiredOrder = await createOrderInDb({
    studentName: 'Expiry Test',
    studentPhone: '9989900000',
    restaurantId: 'local-home-kitchen',
    deliveryLocation: 'Hostel A',
    items: [{ name: 'Veg Biryani', qty: 1, price: 150 }]
  });

  // Manually set confirmation_expires_at to 10 seconds in the past
  await sql`
    UPDATE orders 
    SET confirmation_expires_at = NOW() - INTERVAL '10 seconds'
    WHERE id = ${expiredOrder.id};
  `;

  // Attempt to confirm expired order
  const expiredConfirm = await confirmOrderInDb(expiredOrder.id);
  console.log('Expired order confirmation attempt result:', expiredConfirm.error);
  console.log('Status after expired attempt:', expiredConfirm.order.status);

  if (expiredConfirm.order.status !== 'EXPIRED' || !expiredConfirm.error) {
    throw new Error('Expired order must not be confirmed and should be marked EXPIRED');
  }
  console.log('✓ Test 5 Passed.\n');

  // Cleanup test orders
  console.log('Cleaning up test orders...');
  await deleteOrderFromDb(testOrder.id);
  await deleteOrderFromDb(expiredOrder.id);
  console.log('✓ Cleanup complete.\n');

  console.log('=== ALL TESTS PASSED SUCCESSFULLY! 🚀 ===');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
