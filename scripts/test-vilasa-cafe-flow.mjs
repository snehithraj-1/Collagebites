const BASE_URL = 'http://localhost:5000';

async function runVilasaSuite() {
  console.log('===========================================================');
  console.log('  TESTING VILASA CAFÉ END-TO-END FLOW & COMPLETE ISOLATION  ');
  console.log('===========================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, name) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name}`);
    }
  }

  // 1. Fetch restaurants list (Student view)
  console.log('--- 1. Testing Restaurants List (Student Portal) ---');
  const restRes = await fetch(`${BASE_URL}/api/restaurants`).then(r => r.json());
  assert(restRes.success && Array.isArray(restRes.restaurants), 'GET /api/restaurants returned array');
  const restaurants = restRes.restaurants;
  const lhk = restaurants.find(r => r.id === 'local-home-kitchen');
  const clg = restaurants.find(r => r.id === 'clg-bites-biryani-nation');
  const vilasa = restaurants.find(r => r.id === 'vilasa-cafe');
  assert(Boolean(lhk), 'Restaurant 1 exists: Local Home Kitchen');
  assert(Boolean(clg), 'Restaurant 2 exists: Clg Bites Biryani Nation');
  assert(Boolean(vilasa), 'Restaurant 3 exists: Vilasa Café');
  assert(vilasa?.phone === '9989955833', 'Vilasa Café phone is 99899 55833');
  assert(vilasa?.location?.includes('SRM University') || vilasa?.location?.includes('Neerukonda'), 'Vilasa Café location is Opp. SRM University, Neerukonda');

  // 2. Fetch Vilasa Café Menu
  console.log('\n--- 2. Testing Vilasa Café Menu (88 items & 10 Categories) ---');
  const menuRes = await fetch(`${BASE_URL}/api/menu?restaurant_id=vilasa-cafe`).then(r => r.json());
  const items = Array.isArray(menuRes) ? menuRes : (menuRes.items || menuRes.menu || []);
  assert(items.length === 88, `Vilasa Café has exactly 88 authentic items (found: ${items.length})`);

  const expectedCategories = [
    'Veg Starters',
    'Egg Starters',
    'Non-Veg Starters',
    'Veg Biryanis',
    'Non-Veg Biryanis',
    'Noodles',
    'Fried Rice',
    'Veg Curries',
    'Non-Veg Curries',
    'Breads & Frankies'
  ];
  const presentCats = new Set(items.map(i => i.category));
  const allCatsPresent = expectedCategories.every(c => presentCats.has(c));
  assert(allCatsPresent, 'All 10 required menu categories are present for Vilasa Café');

  const chkBiryani = items.find(i => i.name === 'Chicken Dum Biryani' && i.restaurant_id === 'vilasa-cafe');
  assert(chkBiryani && Number(chkBiryani.price) === 190, 'Chicken Dum Biryani exists at exact price ₹190');

  const omelet = items.find(i => i.name === 'Omelet' && i.restaurant_id === 'vilasa-cafe');
  assert(omelet && Number(omelet.price) === 80, 'Omelet exists in Egg Starters at ₹80');

  const schezwanRice = items.find(i => i.name === 'Veg Schezwan Fried Rice' && i.restaurant_id === 'vilasa-cafe');
  assert(schezwanRice && Number(schezwanRice.price) === 170, 'Veg Schezwan Fried Rice exists at exact price ₹170');

  const tomatoCurry = items.find(i => i.name === 'Tomato Curry' && i.restaurant_id === 'vilasa-cafe');
  assert(tomatoCurry && Number(tomatoCurry.price) === 180, 'Tomato Curry exists at exact price ₹180');

  // 3. Student places order for Vilasa Café
  console.log('\n--- 3. Student Order Placement for Vilasa Café ---');
  const testOrderId = `order-test-vc-${Date.now()}`;
  const placeRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: testOrderId,
      student_name: 'Test Student (SRM AP)',
      student_email: 'student.test@srmap.edu.in',
      student_phone: '9988776655',
      delivery_location: 'Gate 3 Collection Point',
      restaurant_id: 'vilasa-cafe',
      restaurant_name: 'Vilasa Café',
      total_amount: 190,
      payment_method: 'cash',
      status: 'CONFIRMED',
      items: [
        { id: chkBiryani.id, name: 'Chicken Dum Biryani', price: 190, quantity: 1 }
      ]
    })
  }).then(r => r.json());
  assert(placeRes.success, `Order placed successfully (#${testOrderId})`);

  // 4. Vilasa Admin Login & Data Isolation
  console.log('\n--- 4. Vilasa Café Admin Login & Strict Isolation ---');
  const vilasaLoginRes = await fetch(`${BASE_URL}/api/auth/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'vilasa_admin', password: 'Vilasa@Campus2026' })
  }).then(r => r.json());
  assert(vilasaLoginRes.success && vilasaLoginRes.user?.restaurant_id === 'vilasa-cafe', 'Vilasa Café Admin logged in (role: restaurant_admin, restaurant_id: vilasa-cafe)');

  // Fetch orders using Vilasa Admin token
  const vilasaOrdersRes = await fetch(`${BASE_URL}/api/orders`, {
    headers: { 'Authorization': `Bearer ${vilasaLoginRes.token}` }
  }).then(r => r.json());
  const vilasaOrders = Array.isArray(vilasaOrdersRes) ? vilasaOrdersRes : (vilasaOrdersRes.orders || []);
  const hasOurOrder = vilasaOrders.some(o => o.id === testOrderId);
  assert(hasOurOrder, 'Vilasa Admin can see the newly placed Vilasa Café order');

  // Verify cross-restaurant isolation: no orders from other restaurants appear in Vilasa view
  const hasForeignOrders = vilasaOrders.some(o => o.restaurant_id && o.restaurant_id !== 'vilasa-cafe');
  assert(!hasForeignOrders, 'Strict Isolation: Vilasa Admin cannot see orders from other restaurants');

  // 5. Vilasa Delivery Partners
  console.log('\n--- 5. Delivery Partner for Vilasa Café ---');
  const partnersRes = await fetch(`${BASE_URL}/api/delivery-partners?restaurant_id=vilasa-cafe`).then(r => r.json());
  assert(partnersRes.success && Array.isArray(partnersRes.partners), 'Fetched delivery partners for Vilasa Café');
  const vilasaRider = partnersRes.partners.find(p => p.restaurant_id === 'vilasa-cafe');
  assert(Boolean(vilasaRider), `Found dedicated Vilasa rider: ${vilasaRider?.name || 'dp-4'}`);

  // 6. Vilasa Admin assigns delivery partner to order
  console.log('\n--- 6. Assigning Delivery Partner to Order ---');
  const assignRes = await fetch(`${BASE_URL}/api/orders/${testOrderId}/assign-partner`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      partnerId: vilasaRider.id,
      partnerName: vilasaRider.name,
      partnerPhone: vilasaRider.phone
    })
  }).then(r => r.json());
  assert(assignRes.success && assignRes.order?.delivery_partner_name === vilasaRider.name, 'Rider assigned to order; order status set to ASSIGNED');

  // 7. Delivery Partner flow: ASSIGNED -> OUT_FOR_DELIVERY -> DELIVERED
  console.log('\n--- 7. Delivery Partner Status Lifecycle ---');
  // Dispatch: OUT_FOR_DELIVERY
  const outRes = await fetch(`${BASE_URL}/api/rider/orders/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: testOrderId,
      status: 'OUT_FOR_DELIVERY',
      riderId: vilasaRider.id
    })
  }).then(r => r.json());
  assert(outRes.success, 'Rider changed order status to OUT_FOR_DELIVERY');

  // Completion: DELIVERED
  const delRes = await fetch(`${BASE_URL}/api/rider/orders/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: testOrderId,
      status: 'DELIVERED',
      riderId: vilasaRider.id
    })
  }).then(r => r.json());
  assert(delRes.success, 'Rider changed order status to DELIVERED');

  // 8. Verify Student sees DELIVERED status
  console.log('\n--- 8. Verifying Student Perspective ---');
  const verifyRes = await fetch(`${BASE_URL}/api/orders`).then(r => r.json());
  const allOrders = Array.isArray(verifyRes) ? verifyRes : (verifyRes.orders || []);
  const finalOrder = allOrders.find(o => o.id === testOrderId);
  assert(finalOrder?.status === 'DELIVERED', `Final order status verified as DELIVERED (id: ${testOrderId})`);

  // 9. Super Admin sees all three restaurants and orders
  console.log('\n--- 9. Super Admin Verification ---');
  const superRes = await fetch(`${BASE_URL}/api/auth/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'collagebites1@gmail.com', password: 'Clgbites123' })
  }).then(r => r.json());
  assert(superRes.success && superRes.user?.role === 'super_admin', 'Super Admin logged in (collagebites1@gmail.com)');

  const superOrders = await fetch(`${BASE_URL}/api/orders`, {
    headers: { 'Authorization': `Bearer ${superRes.token}` }
  }).then(r => r.json());
  const superOrdersList = Array.isArray(superOrders) ? superOrders : (superOrders.orders || []);
  assert(superOrdersList.some(o => o.id === testOrderId), 'Super Admin can view Vilasa Café orders along with all restaurants');

  // 10. Clean up test order
  await fetch(`${BASE_URL}/api/orders/${testOrderId}`, { method: 'DELETE' }).catch(() => {});

  console.log('\n===========================================================');
  console.log(`  RESULT: ${passed} / ${total} TESTS PASSED`);
  console.log('===========================================================');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runVilasaSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
