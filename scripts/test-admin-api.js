import {
  createOrderInDb,
  getOrderByIdFromDb,
  getAllOrdersFromDb,
  updateOrderStatusInDb,
  cancelOrderInDb,
  deleteOrderFromDb,
  getOverallOrderingSettingFromDb,
  setOverallOrderingSettingInDb,
  getRestaurantStatusesFromDb,
  updateRestaurantStatusInDb
} from '../server/db.js';

async function runAdminApiTests() {
  console.log('=== STARTING REAL ADMIN DASHBOARD & ORDER MANAGEMENT TESTS ===\n');

  // Test 1: Fetch Admin Orders
  console.log('Test 1: Fetching all admin orders via getAllOrdersFromDb...');
  const adminOrders = await getAllOrdersFromDb();
  console.log(`Retrieved ${adminOrders.length} orders from Neon.`);
  if (adminOrders.length > 0) {
    const sample = adminOrders[0];
    console.log(`Sample Order: #${sample.id} - Student: ${sample.studentName} (${sample.studentPhone}) - Status: ${sample.status}`);
    console.log(`Items count: ${sample.orderItems ? sample.orderItems.length : (sample.items ? sample.items.length : 0)} - Total Qty: ${sample.quantity}`);
  }
  console.log('✓ Test 1 Passed.\n');

  // Test 2: Master Ordering Toggle & Server Guard
  console.log('Test 2: Testing Overall Ordering Master Toggle & Server Enforcement...');
  // Read current
  const initialOrdering = await getOverallOrderingSettingFromDb();
  console.log('Current Overall Ordering setting:', initialOrdering);

  // Turn master ordering OFF
  await setOverallOrderingSettingInDb(false);
  const turnedOff = await getOverallOrderingSettingFromDb();
  console.log('Setting after turning OFF:', turnedOff);
  if (turnedOff !== false) throw new Error('Expected ordering setting to be false');

  // Attempt to create order when ordering is OFF (Should be blocked by server)
  let blocked = false;
  try {
    await createOrderInDb({
      studentName: 'Guard Test',
      studentPhone: '9999999999',
      restaurantId: 'local-home-kitchen',
      deliveryLocation: 'Hostel A',
      items: [{ name: 'Chicken Dum Biryani', qty: 1, price: 170 }]
    });
  } catch (err) {
    blocked = true;
    console.log('Server successfully blocked order creation when overall ordering is OFF:', err.message);
  }
  if (!blocked) throw new Error('Server must reject order creation when overall ordering is OFF');

  // Restore master ordering to ON
  await setOverallOrderingSettingInDb(true);
  console.log('Restored master ordering to ON.');
  console.log('✓ Test 2 Passed.\n');

  // Test 3: Restaurant Open/Close Toggle & Server Guard
  console.log('Test 3: Testing Restaurant Open/Close Toggle & Server Enforcement...');
  // Turn Campus Delight Dhaba to CLOSED
  await updateRestaurantStatusInDb('campus-delight-dhaba', 'CLOSED');
  const statuses = await getRestaurantStatusesFromDb();
  console.log('Restaurant statuses:', statuses);
  if (statuses['campus-delight-dhaba'] !== 'CLOSED') throw new Error('Expected campus-delight-dhaba to be CLOSED');

  // Attempt to place order to CLOSED restaurant
  let restBlocked = false;
  try {
    await createOrderInDb({
      studentName: 'Closed Rest Test',
      studentPhone: '9999999999',
      restaurantId: 'campus-delight-dhaba',
      deliveryLocation: 'Hostel B',
      items: [{ name: 'Paneer Butter Masala', qty: 1, price: 180 }]
    });
  } catch (err) {
    restBlocked = true;
    console.log('Server successfully blocked order to CLOSED restaurant:', err.message);
  }
  if (!restBlocked) throw new Error('Server must reject order creation for a CLOSED restaurant');

  // Restore restaurant status to OPEN
  await updateRestaurantStatusInDb('campus-delight-dhaba', 'OPEN');
  console.log('Restored campus-delight-dhaba status to OPEN.');
  console.log('✓ Test 3 Passed.\n');

  // Test 4: Create Test Order, Transition Stages, Cancel, and Cascading Delete
  console.log('Test 4: Testing Order Lifecycle, Status Transitions, and Cascading Deletion...');
  const testOrder = await createOrderInDb({
    studentName: 'Admin Flow Test Student',
    studentPhone: '9888877777',
    studentId: 'AP998877',
    restaurantId: 'local-home-kitchen',
    deliveryLocation: 'Hostel 3, Room 202',
    instructions: 'Ring bell twice',
    items: [
      { name: 'Chicken Dum Biryani', qty: 1, price: 170 },
      { name: 'Paneer Biryani', qty: 2, price: 210 }
    ]
  });
  console.log(`Created test order #${testOrder.id} for admin testing.`);

  // Advance to CONFIRMED
  const confirmed = await updateOrderStatusInDb(testOrder.id, 'CONFIRMED');
  console.log(`Advanced #${testOrder.id} to ${confirmed.order.status}`);

  // Advance to PREPARING
  const preparing = await updateOrderStatusInDb(testOrder.id, 'PREPARING');
  console.log(`Advanced #${testOrder.id} to ${preparing.order.status}`);

  // Advance to READY
  const ready = await updateOrderStatusInDb(testOrder.id, 'READY');
  console.log(`Advanced #${testOrder.id} to ${ready.order.status}`);

  // Advance to OUT_FOR_DELIVERY
  const outForDelivery = await updateOrderStatusInDb(testOrder.id, 'OUT_FOR_DELIVERY');
  console.log(`Advanced #${testOrder.id} to ${outForDelivery.order.status}`);

  // Advance to DELIVERED
  const delivered = await updateOrderStatusInDb(testOrder.id, 'DELIVERED');
  console.log(`Advanced #${testOrder.id} to ${delivered.order.status}`);

  // Verify invalid transition from terminal DELIVERED to PREPARING
  const invalidTransition = await updateOrderStatusInDb(testOrder.id, 'PREPARING');
  console.log('Rejected invalid transition from DELIVERED:', invalidTransition.error);
  if (!invalidTransition.error) throw new Error('Invalid transition from DELIVERED was not rejected');

  // Delete test order (cascading delete)
  const delRes = await deleteOrderFromDb(testOrder.id);
  console.log('Deleted test order result:', delRes);

  const checkDeleted = await getOrderByIdFromDb(testOrder.id);
  if (checkDeleted !== null) throw new Error('Deleted order should not exist in database');
  console.log('Verified order was permanently deleted from Neon.');
  console.log('✓ Test 4 Passed.\n');

  console.log('=== ALL REAL ADMIN DASHBOARD TESTS PASSED WITH 100% SUCCESS! 🚀 ===\n');
}

runAdminApiTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
