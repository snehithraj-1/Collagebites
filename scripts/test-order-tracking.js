import { 
  createOrderInDb, 
  getOrderByIdFromDb, 
  confirmOrderInDb, 
  updateOrderStatusInDb, 
  cancelOrderInDb, 
  deleteOrderFromDb 
} from '../server/db.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function withRetry(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      console.warn(`[Retry ${i + 1}/${retries}] Network glitch, retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
}

async function runOrderTrackingTests() {
  console.log('=== STARTING REAL-TIME STUDENT ORDER TRACKING TESTS ===\n');

  try {
    // 1. Create a test order
    console.log('Test 1: Creating a test student order...');
    const orderPayload = {
      studentName: 'Aarav Sharma',
      studentPhone: '9876543210',
      studentId: 'AP21110010999',
      restaurantId: 'local-home-kitchen',
      restaurantName: 'Local Home Kitchen',
      deliveryLocation: 'Hostel Block C - Room 304',
      instructions: 'Please call before arrival',
      items: [
        { name: 'Paneer Butter Masala', quantity: 2, price: 160 },
        { name: 'Butter Naan', quantity: 3, price: 40 }
      ]
    };

    const created = await createOrderInDb(orderPayload);
    const orderId = created.id;
    console.log(`Created test order #${orderId} with status ${created.status}`);
    console.log(`Initial status history count: ${created.statusHistory?.length || 0}`);
    if (!created.statusHistory || created.statusHistory[0].status !== 'PENDING_CONFIRMATION') {
      throw new Error('Test 1 Failed: Initial status history was not PENDING_CONFIRMATION');
    }
    console.log('✓ Test 1 Passed.\n');

    // 2. Confirm order
    console.log('Test 2: Confirming order within 30s window...');
    const confirmRes = await confirmOrderInDb(orderId);
    if (!confirmRes.success || confirmRes.order.status !== 'CONFIRMED') {
      throw new Error(`Test 2 Failed: Order confirm failed: ${confirmRes.error}`);
    }
    console.log(`Order #${orderId} confirmed at: ${confirmRes.order.confirmedAt}`);
    console.log('✓ Test 2 Passed.\n');

    // 3. Verify getOrderByIdFromDb with relational items and status history
    console.log('Test 3: Fetching order details via getOrderByIdFromDb...');
    const fetched = await getOrderByIdFromDb(orderId);
    console.log(`Fetched Order #${fetched.id}: Status: ${fetched.status}`);
    console.log(`Student: ${fetched.studentName} | Phone: ${fetched.studentPhone}`);
    console.log(`Items count: ${fetched.items.length}`);
    console.log('Status History entries:');
    fetched.statusHistory.forEach(h => {
      console.log(`  - [${h.changedAt}] ${h.status}`);
    });

    if (fetched.statusHistory.length < 2) {
      throw new Error('Test 3 Failed: Expected at least 2 status history entries (PENDING_CONFIRMATION and CONFIRMED)');
    }
    console.log('✓ Test 3 Passed.\n');

    // 4. Progress through all kitchen and delivery stages
    console.log('Test 4: Advancing order stages and checking history records...');
    const stages = ['PREPARING', 'READY', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'];

    for (const stage of stages) {
      await sleep(300);
      const updateRes = await withRetry(() => updateOrderStatusInDb(orderId, stage));
      if (!updateRes.success || updateRes.order.status !== stage) {
        throw new Error(`Test 4 Failed: Failed to advance to ${stage}: ${updateRes.error}`);
      }
      console.log(` -> Advanced to ${stage}`);
    }

    // Fetch and check final status history
    await sleep(300);
    const finalFetched = await withRetry(() => getOrderByIdFromDb(orderId));
    console.log(`Total status history events: ${finalFetched.statusHistory.length}`);
    const recordedStatuses = finalFetched.statusHistory.map(h => h.status);
    console.log('All recorded statuses in order:', recordedStatuses.join(' -> '));

    for (const s of ['PENDING_CONFIRMATION', 'CONFIRMED', ...stages]) {
      if (!recordedStatuses.includes(s)) {
        throw new Error(`Test 4 Failed: Missing status ${s} from order_status_history`);
      }
    }
    console.log('✓ Test 4 Passed.\n');

    // 5. Test terminal state enforcement
    console.log('Test 5: Testing terminal state validation from DELIVERED...');
    const invalidTry = await withRetry(() => updateOrderStatusInDb(orderId, 'PREPARING'));
    if (invalidTry.success) {
      throw new Error('Test 5 Failed: Should not allow moving from DELIVERED back to PREPARING');
    }
    console.log(`Correctly rejected invalid transition: ${invalidTry.error}`);
    console.log('✓ Test 5 Passed.\n');

    // 6. Test cancellation history
    console.log('Test 6: Testing cancellation recording in order_status_history...');
    const orderPayload2 = {
      studentName: 'Test Student 2',
      studentPhone: '9876543211',
      studentId: 'AP21110010998',
      restaurantId: 'campus-delight-dhaba',
      restaurantName: 'Campus Delight Dhaba',
      deliveryLocation: 'Hostel Block A - Room 101',
      instructions: '',
      items: [{ name: 'Veg Biryani', quantity: 1, price: 150 }]
    };
    const order2 = await withRetry(() => createOrderInDb(orderPayload2));
    const cancelRes = await withRetry(() => cancelOrderInDb(order2.id, 'Student changed mind'));
    if (!cancelRes.success || cancelRes.order.status !== 'CANCELLED') {
      throw new Error('Test 6 Failed: Order cancel failed');
    }
    const order2Fetched = await withRetry(() => getOrderByIdFromDb(order2.id));
    const order2Statuses = order2Fetched.statusHistory.map(h => h.status);
    console.log(`Order #${order2.id} statuses: ${order2Statuses.join(' -> ')}`);
    if (!order2Statuses.includes('CANCELLED')) {
      throw new Error('Test 6 Failed: CANCELLED status not recorded in order_status_history');
    }
    console.log('✓ Test 6 Passed.\n');

    // 7. Cleanup test orders
    console.log('Test 7: Cleaning up test orders with cascading deletes...');
    await withRetry(() => deleteOrderFromDb(orderId));
    await withRetry(() => deleteOrderFromDb(order2.id));
    console.log('Cleaned up test orders and their status history from Neon.');
    console.log('✓ Test 7 Passed.\n');

    console.log('=== ALL REAL-TIME ORDER TRACKING TESTS PASSED WITH 100% SUCCESS! 🚀 ===');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Test Suite Failed:', err);
    process.exit(1);
  }
}

runOrderTrackingTests();
