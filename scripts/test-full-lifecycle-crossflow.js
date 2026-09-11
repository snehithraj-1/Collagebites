// scripts/test-full-lifecycle-crossflow.js
// Automated cross-flow integration test for both restaurants independently

const BASE_URL = 'http://localhost:5000';

async function testFullCrossFlow() {
  console.log('================================================================');
  console.log('  CAMPUSBITES PHASE 8: CROSS-FLOW END-TO-END INTEGRATION TEST  ');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, description) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${description}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${description}`);
    }
  }

  try {
    // -------------------------------------------------------------------------
    // TEST FLOW A: LOCAL HOME KITCHEN
    // -------------------------------------------------------------------------
    console.log('--- TEST FLOW A: LOCAL HOME KITCHEN ORDER LIFECYCLE ---');
    
    // 1. Student creates order
    const lhkOrderPayload = {
      id: 'CB-TEST-LHK-' + Math.floor(1000 + Math.random() * 9000),
      studentName: 'Aarav Sharma',
      studentPhone: '9876543210',
      studentEmail: 'aarav.sharma@srmap.edu.in',
      studentId: 'AP23110010045',
      deliveryLocation: 'Brahmaputra Hostel, Room 412',
      restaurantId: 'local-home-kitchen',
      restaurantName: 'Local Home Kitchen',
      totalAmount: 175,
      items: [
        {
          id: 'lhk-cb-1',
          name: 'Chicken Dum Biryani',
          quantity: 1,
          price: 170
        }
      ]
    };

    const createLhkRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lhkOrderPayload)
    }).then(r => r.json());

    assert(createLhkRes.success && Boolean(createLhkRes.order?.id), `Student placed order at Local Home Kitchen (${lhkOrderPayload.id})`);

    const lhkOrderId = createLhkRes.order?.id || lhkOrderPayload.id;

    // 2. Verify Local Home Kitchen admin can view this order
    const lhkOrders = await fetch(`${BASE_URL}/api/orders?restaurant_id=local-home-kitchen`).then(r => r.json());
    const orderInLhk = lhkOrders.orders?.find(o => o.id === lhkOrderId);
    assert(Boolean(orderInLhk), `LHK Admin dashboard receives order #${lhkOrderId}`);

    // 3. Verify CLG Bites admin CANNOT view this order (Strict Kitchen Isolation!)
    const clgOrders = await fetch(`${BASE_URL}/api/orders?restaurant_id=clg-bites-biryani-nation`).then(r => r.json());
    const orderInClg = clgOrders.orders?.find(o => o.id === lhkOrderId);
    assert(!orderInClg, `CLG Bites Admin is strictly isolated and CANNOT see order #${lhkOrderId}`);

    // 4. LHK Admin assigns Delivery Partner Suresh Reddy (dp-lhk-2, phone 9876543211)
    const assignLhkRes = await fetch(`${BASE_URL}/api/orders/assign-partner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: lhkOrderId,
        partnerId: 'dp-lhk-2',
        partnerName: 'Suresh Reddy (LHK Rider)',
        partnerPhone: '9876543211'
      })
    }).then(r => r.json());

    assert(assignLhkRes.success && assignLhkRes.status === 'ASSIGNED', `LHK Admin assigns Suresh Reddy -> status: ASSIGNED`);

    // 5. Suresh Reddy logs in and verifies assignment in delivery app
    const sureshLogin = await fetch(`${BASE_URL}/api/rider/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9876543211', pin: '1234' })
    }).then(r => r.json());
    assert(sureshLogin.success && sureshLogin.partner?.name?.includes('Suresh'), 'Suresh Reddy authenticates in Delivery App (Phone + PIN)');

    const sureshOrders = await fetch(`${BASE_URL}/api/rider/orders?phone=9876543211`).then(r => r.json());
    const orderInSuresh = sureshOrders.orders?.find(o => o.id === lhkOrderId);
    assert(Boolean(orderInSuresh), `Suresh Reddy's Delivery App receives assigned order #${lhkOrderId}`);

    // 6. Suresh Reddy starts delivery -> OUT_FOR_DELIVERY
    const outForDeliveryRes = await fetch(`${BASE_URL}/api/rider/orders/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: lhkOrderId,
        status: 'OUT_FOR_DELIVERY',
        partnerId: 'dp-lhk-2'
      })
    }).then(r => r.json());
    assert(outForDeliveryRes.success && outForDeliveryRes.order?.status === 'OUT_FOR_DELIVERY', `Rider updates status: OUT_FOR_DELIVERY`);

    // 7. Suresh Reddy marks order as DELIVERED
    const deliveredRes = await fetch(`${BASE_URL}/api/rider/orders/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: lhkOrderId,
        status: 'DELIVERED',
        partnerId: 'dp-lhk-2'
      })
    }).then(r => r.json());
    assert(deliveredRes.success && deliveredRes.order?.status === 'DELIVERED', `Rider updates status: DELIVERED`);

    // 8. Student verifies status is DELIVERED
    const finalLhkOrderCheck = await fetch(`${BASE_URL}/api/orders/${lhkOrderId}`).then(r => r.json());
    const finalStatus = finalLhkOrderCheck.order?.status || finalLhkOrderCheck.status;
    assert(finalStatus === 'DELIVERED', `Student order status correctly reflects DELIVERED in receipt/history`);


    // -------------------------------------------------------------------------
    // TEST FLOW B: CLG BITES BIRYANI NATION
    // -------------------------------------------------------------------------
    console.log('\n--- TEST FLOW B: CLG BITES BIRYANI NATION ORDER LIFECYCLE ---');

    // 1. Student creates order at CLG Bites
    const clgOrderPayload = {
      id: 'CB-TEST-CLG-' + Math.floor(1000 + Math.random() * 9000),
      studentName: 'Pooja Reddy',
      studentPhone: '9123456780',
      studentEmail: 'pooja.reddy@srmap.edu.in',
      studentId: 'AP23110010098',
      deliveryLocation: 'Ganga Hostel, Room 204',
      restaurantId: 'clg-bites-biryani-nation',
      restaurantName: 'Clg Bites Biryani Nation',
      totalAmount: 215,
      items: [
        {
          id: 'cbn-chk-bone-s',
          name: 'Chicken Boneless Biryani (Single)',
          quantity: 1,
          price: 210
        }
      ]
    };

    const createClgRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clgOrderPayload)
    }).then(r => r.json());

    assert(createClgRes.success && Boolean(createClgRes.order?.id), `Student placed order at CLG Bites (${clgOrderPayload.id})`);

    const clgOrderId = createClgRes.order?.id || clgOrderPayload.id;

    // 2. Verify CLG Bites admin can view this order
    const clgOrders2 = await fetch(`${BASE_URL}/api/orders?restaurant_id=clg-bites-biryani-nation`).then(r => r.json());
    const orderInClg2 = clgOrders2.orders?.find(o => o.id === clgOrderId);
    assert(Boolean(orderInClg2), `CLG Bites Admin dashboard receives order #${clgOrderId}`);

    // 3. Verify Local Home Kitchen CANNOT view this order (Strict Kitchen Isolation!)
    const lhkOrders2 = await fetch(`${BASE_URL}/api/orders?restaurant_id=local-home-kitchen`).then(r => r.json());
    const orderInLhk2 = lhkOrders2.orders?.find(o => o.id === clgOrderId);
    assert(!orderInLhk2, `LHK Admin is strictly isolated and CANNOT see order #${clgOrderId}`);

    // 4. CLG Bites Admin assigns Delivery Partner Pawan Kalyan (dp-clg-1, phone 9876543220)
    const assignClgRes = await fetch(`${BASE_URL}/api/orders/assign-partner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: clgOrderId,
        partnerId: 'dp-clg-1',
        partnerName: 'Pawan Kalyan (CLG Rider)',
        partnerPhone: '9876543220'
      })
    }).then(r => r.json());

    assert(assignClgRes.success && assignClgRes.status === 'ASSIGNED', `CLG Bites Admin assigns Pawan Kalyan -> status: ASSIGNED`);

    // 5. Pawan Kalyan logs in and checks assigned orders
    const pawanLogin = await fetch(`${BASE_URL}/api/rider/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9876543220', pin: '1234' })
    }).then(r => r.json());
    assert(pawanLogin.success && pawanLogin.partner?.name?.includes('Pawan'), 'Pawan Kalyan authenticates in Delivery App (Phone + PIN)');

    // 6. Pawan Kalyan marks order OUT_FOR_DELIVERY -> DELIVERED
    const outForDeliveryClg = await fetch(`${BASE_URL}/api/rider/orders/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: clgOrderId,
        status: 'OUT_FOR_DELIVERY',
        partnerId: 'dp-clg-1'
      })
    }).then(r => r.json());
    assert(outForDeliveryClg.success && outForDeliveryClg.order?.status === 'OUT_FOR_DELIVERY', `Pawan Kalyan marks order OUT_FOR_DELIVERY`);

    const deliveredClg = await fetch(`${BASE_URL}/api/rider/orders/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: clgOrderId,
        status: 'DELIVERED',
        partnerId: 'dp-clg-1'
      })
    }).then(r => r.json());
    assert(deliveredClg.success && deliveredClg.order?.status === 'DELIVERED', `Pawan Kalyan marks order DELIVERED`);

    console.log('\n================================================================');
    console.log(`  E2E INTEGRATION TEST RESULTS: ${passed} / ${total} TESTS PASSED`);
    console.log('================================================================');

    if (passed === total) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Cross-flow test execution error:', err);
    process.exit(1);
  }
}

testFullCrossFlow();
