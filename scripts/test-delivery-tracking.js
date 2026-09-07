import { 
  createOrderInDb, 
  getOrderByIdFromDb, 
  confirmOrderInDb, 
  updateOrderStatusInDb, 
  getAllDeliveryPartnersFromDb,
  assignDeliveryPartnerToOrderInDb,
  getOrdersForDeliveryPartnerFromDb,
  updateDeliveryOrderStatusInDb,
  recordDeliveryLocationInDb,
  getLatestDeliveryLocationFromDb,
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

async function runDeliveryTrackingTests() {
  console.log('=== STARTING DELIVERY PARTNER & LIVE LOCATION TRACKING TESTS ===\n');

  try {
    // 1. Verify delivery partners in Neon
    console.log('Test 1: Checking delivery_partners table and seeded couriers...');
    const partners = await withRetry(() => getAllDeliveryPartnersFromDb());
    console.log(`Found ${partners.length} active delivery couriers in Neon:`);
    partners.forEach(p => console.log(`  - [${p.id}] ${p.name} (${p.phone})`));
    if (partners.length === 0) {
      throw new Error('Test 1 Failed: No delivery partners found in database');
    }
    const courier = partners[0];
    console.log('✓ Test 1 Passed.\n');

    // 2. Create test order and advance to READY
    console.log('Test 2: Creating order and advancing to READY stage...');
    const orderPayload = {
      studentName: 'Rohan Mehra',
      studentPhone: '9888877777',
      studentId: 'AP21110010555',
      restaurantId: 'local-home-kitchen',
      restaurantName: 'Local Home Kitchen',
      deliveryLocation: 'Hostel Block B - Room 204',
      instructions: 'Ring bell on arrival',
      items: [{ name: 'Chole Bhature', quantity: 2, price: 120 }]
    };
    const order = await withRetry(() => createOrderInDb(orderPayload));
    await withRetry(() => confirmOrderInDb(order.id));
    await withRetry(() => updateOrderStatusInDb(order.id, 'PREPARING'));
    const readyRes = await withRetry(() => updateOrderStatusInDb(order.id, 'READY'));
    console.log(`Order #${order.id} status is now: ${readyRes.order.status}`);
    console.log('✓ Test 2 Passed.\n');

    // 3. Admin assigns delivery partner
    console.log(`Test 3: Admin assigning courier ${courier.name} (${courier.id}) to order #${order.id}...`);
    const assignRes = await withRetry(() => assignDeliveryPartnerToOrderInDb(order.id, courier.id));
    if (!assignRes.success || assignRes.order.deliveryPartnerId !== courier.id) {
      throw new Error(`Test 3 Failed: Assign delivery partner failed: ${assignRes.error}`);
    }
    console.log(`Assigned courier: ${assignRes.order.deliveryPartnerName} (${assignRes.order.deliveryPartnerPhone})`);
    console.log('✓ Test 3 Passed.\n');

    // 4. Partner views assigned deliveries
    console.log(`Test 4: Fetching assigned orders for courier ${courier.id}...`);
    const courierOrders = await withRetry(() => getOrdersForDeliveryPartnerFromDb(courier.id));
    const assignedMatch = courierOrders.find(o => o.id === order.id);
    if (!assignedMatch) {
      throw new Error(`Test 4 Failed: Order #${order.id} not found in courier's assigned orders list`);
    }
    console.log(`Order #${order.id} is visible in courier's assigned list with status ${assignedMatch.status}`);
    console.log('✓ Test 4 Passed.\n');

    // 5. Courier marks PICKED_UP
    console.log('Test 5: Courier marking order as PICKED_UP...');
    const pickedUpRes = await withRetry(() => updateDeliveryOrderStatusInDb(order.id, 'PICKED_UP', courier.id));
    if (!pickedUpRes.success || pickedUpRes.order.status !== 'PICKED_UP') {
      throw new Error('Test 5 Failed: Courier PICKED_UP status update failed');
    }
    console.log(`Order status updated to: ${pickedUpRes.order.status}`);
    console.log('✓ Test 5 Passed.\n');

    // 6. Courier starts delivery and broadcasts GPS coordinates
    console.log('Test 6: Courier starts delivery (OUT_FOR_DELIVERY) and transmits GPS coordinates...');
    const outRes = await withRetry(() => updateDeliveryOrderStatusInDb(order.id, 'OUT_FOR_DELIVERY', courier.id));
    if (!outRes.success || outRes.order.status !== 'OUT_FOR_DELIVERY') {
      throw new Error('Test 6 Failed: Courier OUT_FOR_DELIVERY update failed');
    }

    // Transmit location 1
    const loc1 = await withRetry(() => recordDeliveryLocationInDb({
      orderId: order.id,
      deliveryPartnerId: courier.id,
      latitude: 16.5175,
      longitude: 80.5215,
      accuracy: 8.5
    }));
    console.log(`Recorded GPS ping 1: lat=${loc1.location.latitude}, lng=${loc1.location.longitude}`);

    // Transmit location 2
    await sleep(400);
    const loc2 = await withRetry(() => recordDeliveryLocationInDb({
      orderId: order.id,
      deliveryPartnerId: courier.id,
      latitude: 16.5165,
      longitude: 80.5200,
      accuracy: 6.2
    }));
    console.log(`Recorded GPS ping 2: lat=${loc2.location.latitude}, lng=${loc2.location.longitude}`);
    console.log('✓ Test 6 Passed.\n');

    // 7. Student retrieves latest live location
    console.log('Test 7: Student querying live location for the active delivery...');
    const studentLoc = await withRetry(() => getLatestDeliveryLocationFromDb(order.id));
    console.log('Student received location response:', {
      active: studentLoc.active,
      lat: studentLoc.location?.latitude,
      lng: studentLoc.location?.longitude,
      partner: studentLoc.partner?.name
    });

    if (!studentLoc.active || Math.abs(studentLoc.location.latitude - 16.5165) > 0.001) {
      throw new Error('Test 7 Failed: Student did not receive the latest active location');
    }
    console.log('✓ Test 7 Passed.\n');

    // 8. Courier marks order as DELIVERED
    console.log('Test 8: Courier marks order as DELIVERED...');
    const deliveredRes = await withRetry(() => updateDeliveryOrderStatusInDb(order.id, 'DELIVERED', courier.id));
    if (!deliveredRes.success || deliveredRes.order.status !== 'DELIVERED') {
      throw new Error('Test 8 Failed: Failed to mark order DELIVERED');
    }
    console.log(`Order status is now: ${deliveredRes.order.status}`);
    console.log('✓ Test 8 Passed.\n');

    // 9. Verify Location Privacy Guard after DELIVERED
    console.log('Test 9: Verifying location privacy guard (location access disabled after DELIVERED)...');
    const postDeliveryLoc = await withRetry(() => getLatestDeliveryLocationFromDb(order.id));
    console.log('Post-delivery location query result:', postDeliveryLoc);
    if (postDeliveryLoc.active !== false || postDeliveryLoc.location !== null) {
      throw new Error('Test 9 Failed: Location was still accessible after order reached DELIVERED');
    }
    console.log('Correctly halted location exposure after DELIVERED.');
    console.log('✓ Test 9 Passed.\n');

    // 10. Clean up test order
    console.log('Test 10: Cleaning up test order and cascading location records...');
    await withRetry(() => deleteOrderFromDb(order.id));
    console.log('Test order and associated location history safely deleted from Neon.');
    console.log('✓ Test 10 Passed.\n');

    console.log('=== ALL DELIVERY PARTNER & LIVE LOCATION TESTS PASSED WITH 100% SUCCESS! 🚀 ===');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Delivery Tracking Test Failed:', err);
    process.exit(1);
  }
}

runDeliveryTrackingTests();
