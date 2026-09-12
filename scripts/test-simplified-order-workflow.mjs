import dns from 'dns';

// Fix DNS resolution for local Windows
const originalDnsLookup = dns.lookup;
const fallbackResolver = new dns.promises.Resolver();
fallbackResolver.setServers(['8.8.8.8', '1.1.1.1']);

dns.lookup = function (hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  originalDnsLookup(hostname, options, (err, address, family) => {
    if (!err && address) return callback(null, address, family);
    fallbackResolver.resolve4(hostname).then((addrs) => {
      if (addrs && addrs.length > 0) return callback(null, addrs[0], 4);
      callback(err, address, family);
    }).catch(() => callback(err, address, family));
  });
};

const BASE_URL = 'http://localhost:5000';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ [FAIL] ${message}`);
    throw new Error(message);
  }
  console.log(`✅ [PASS] ${message}`);
}

async function run() {
  console.log('===========================================================');
  console.log('  TESTING SIMPLIFIED ORDER WORKFLOW & NO DELIVERY LAYER    ');
  console.log('===========================================================\n');

  // ---------------------------------------------------------
  // 1. Check Main Admin / Restaurants: Exactly 3, No Duplicates
  // ---------------------------------------------------------
  console.log('--- 1. Testing Restaurants List & Duplicate Removal ---');
  const restRes = await fetch(`${BASE_URL}/api/restaurants`);
  assert(restRes.ok, 'GET /api/restaurants returned 200');
  const restData = await restRes.json();
  const restaurants = restData.restaurants || [];
  
  assert(restaurants.length === 3, `Expected exactly 3 restaurants, got ${restaurants.length}`);

  const lhk = restaurants.find(r => r.id === 'local-home-kitchen');
  const clg = restaurants.find(r => r.id === 'clg-bites-biryani-nation');
  const vilasa = restaurants.find(r => r.id === 'vilasa-cafe');

  assert(Boolean(lhk), 'Restaurant 1 exists: Local Home Kitchen');
  assert(Boolean(clg), 'Restaurant 2 exists: CLG Bites');
  assert(Boolean(vilasa), 'Restaurant 3 exists: Vilasa Café');

  assert(clg.name === 'CLG Bites', `CLG Bites name is exact 'CLG Bites' (got: ${clg.name})`);
  assert(lhk.phone === '9989955833', 'Local Home Kitchen phone is 9989955833');
  assert(clg.phone === '9989955833', 'CLG Bites phone is 9989955833');
  assert(vilasa.phone === '9989955833', 'Vilasa Café phone is 9989955833');

  const clgDuplicates = restaurants.filter(r => r.name.toLowerCase().includes('clg bites') || r.id.includes('campus-delight'));
  assert(clgDuplicates.length === 1, `No duplicate CLG Bites records found (count: ${clgDuplicates.length})`);

  // ---------------------------------------------------------
  // 2. Delivery Partner Layer Removal Check
  // ---------------------------------------------------------
  console.log('\n--- 2. Testing Delivery Partner System Removal ---');
  const dpRes = await fetch(`${BASE_URL}/api/delivery-partners`);
  assert(dpRes.ok, 'GET /api/delivery-partners returns 200');
  const dpData = await dpRes.json();
  assert(Array.isArray(dpData.partners) && dpData.partners.length === 0, 'Delivery partners array is empty (no rider fleet maintained)');

  // ---------------------------------------------------------
  // 3. Admin Authentication for All 3 Restaurants
  // ---------------------------------------------------------
  console.log('\n--- 3. Testing Admin Logins ---');
  async function adminLogin(identifier, password) {
    const res = await fetch(`${BASE_URL}/api/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    return res.json();
  }

  const lhkLogin = await adminLogin('lhk_admin', 'LHK@Campus2026');
  assert(lhkLogin.success && lhkLogin.user?.restaurant_id === 'local-home-kitchen', 'LHK Admin authenticated');

  const clgLogin = await adminLogin('clgbites_admin', 'CLG@Campus2026');
  assert(clgLogin.success && clgLogin.user?.restaurant_id === 'clg-bites-biryani-nation', 'CLG Bites Admin authenticated');

  const vilasaLogin = await adminLogin('vilasa_admin', 'Vilasa@Campus2026');
  assert(vilasaLogin.success && vilasaLogin.user?.restaurant_id === 'vilasa-cafe', 'Vilasa Café Admin authenticated');

  const superLogin = await adminLogin('rajsrmap2@gmail.com', 'Snehith@007');
  assert(superLogin.success && superLogin.user?.role === 'super_admin', 'Super Admin authenticated');

  // ---------------------------------------------------------
  // 4. TEST 1: Student -> Local Home Kitchen -> Order & Isolation
  // ---------------------------------------------------------
  console.log('\n--- 4. TEST 1: Local Home Kitchen Order & Isolation ---');
  const lhkOrderId = `order-lhk-${Date.now()}`;
  const lhkOrderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: lhkOrderId,
      student_name: 'Aarav Sharma',
      student_email: 'aarav@srmist.edu.in',
      student_phone: '9876543210',
      restaurant_id: 'local-home-kitchen',
      restaurant_name: 'Local Home Kitchen',
      total_amount: 220,
      status: 'CONFIRMED',
      items: [{ name: 'Chicken Fried Rice', quantity: 1, price: 220 }]
    })
  });
  assert(lhkOrderRes.ok, `LHK Order placed (#${lhkOrderId})`);

  // Verify LHK Admin sees it
  const lhkOrdersRes = await fetch(`${BASE_URL}/api/orders?restaurant_id=local-home-kitchen`);
  const lhkOrders = (await lhkOrdersRes.json()).orders || [];
  assert(lhkOrders.some(o => o.id === lhkOrderId), 'Local Home Kitchen Admin received the order');

  // Verify CLG Bites Admin does NOT see it
  const clgOrdersRes1 = await fetch(`${BASE_URL}/api/orders?restaurant_id=clg-bites-biryani-nation`);
  const clgOrders1 = (await clgOrdersRes1.json()).orders || [];
  assert(!clgOrders1.some(o => o.id === lhkOrderId), 'CLG Bites Admin does NOT receive LHK order');

  // Verify Vilasa Café Admin does NOT see it
  const vilasaOrdersRes1 = await fetch(`${BASE_URL}/api/orders?restaurant_id=vilasa-cafe`);
  const vilasaOrders1 = (await vilasaOrdersRes1.json()).orders || [];
  assert(!vilasaOrders1.some(o => o.id === lhkOrderId), 'Vilasa Café Admin does NOT receive LHK order');

  // LHK Admin marks order COMPLETED
  const lhkCompleteRes = await fetch(`${BASE_URL}/api/orders/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId: lhkOrderId, status: 'COMPLETED' })
  });
  assert(lhkCompleteRes.ok, 'LHK Admin marked order as COMPLETED');
  const lhkCheck = await fetch(`${BASE_URL}/api/orders/${lhkOrderId}`);
  const lhkCheckData = await lhkCheck.json();
  assert(lhkCheckData.order?.status === 'COMPLETED' || lhkCheckData.status === 'COMPLETED', `Order status is now COMPLETED (got: ${lhkCheckData.order?.status || lhkCheckData.status})`);

  // ---------------------------------------------------------
  // 5. TEST 2: Student -> CLG Bites -> Order & Isolation
  // ---------------------------------------------------------
  console.log('\n--- 5. TEST 2: CLG Bites Order & Isolation ---');
  const clgOrderId = `order-clg-${Date.now()}`;
  const clgOrderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: clgOrderId,
      student_name: 'Pooja Reddy',
      student_email: 'pooja@srmist.edu.in',
      student_phone: '9876543211',
      restaurant_id: 'clg-bites-biryani-nation',
      restaurant_name: 'CLG Bites',
      total_amount: 190,
      status: 'CONFIRMED',
      items: [{ name: 'Chicken Dum Biryani (Single)', quantity: 1, price: 190 }]
    })
  });
  assert(clgOrderRes.ok, `CLG Bites Order placed (#${clgOrderId})`);

  const clgOrdersRes2 = await fetch(`${BASE_URL}/api/orders?restaurant_id=clg-bites-biryani-nation`);
  const clgOrders2 = (await clgOrdersRes2.json()).orders || [];
  assert(clgOrders2.some(o => o.id === clgOrderId), 'CLG Bites Admin received the order');

  const lhkOrdersRes2 = await fetch(`${BASE_URL}/api/orders?restaurant_id=local-home-kitchen`);
  const lhkOrders2 = (await lhkOrdersRes2.json()).orders || [];
  assert(!lhkOrders2.some(o => o.id === clgOrderId), 'Local Home Kitchen Admin does NOT receive CLG Bites order');

  // ---------------------------------------------------------
  // 6. TEST 3: Student -> Vilasa Café -> Order & Isolation
  // ---------------------------------------------------------
  console.log('\n--- 6. TEST 3: Vilasa Café Order & Isolation ---');
  const vilasaOrderId = `order-vilasa-${Date.now()}`;
  const vilasaOrderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: vilasaOrderId,
      student_name: 'Rahul Varma',
      student_email: 'rahul@srmist.edu.in',
      student_phone: '9876543212',
      restaurant_id: 'vilasa-cafe',
      restaurant_name: 'Vilasa Café',
      total_amount: 210,
      status: 'CONFIRMED',
      items: [{ name: 'Chicken Manchuria', quantity: 1, price: 210 }]
    })
  });
  assert(vilasaOrderRes.ok, `Vilasa Café Order placed (#${vilasaOrderId})`);

  const vilasaOrdersRes3 = await fetch(`${BASE_URL}/api/orders?restaurant_id=vilasa-cafe`);
  const vilasaOrders3 = (await vilasaOrdersRes3.json()).orders || [];
  assert(vilasaOrders3.some(o => o.id === vilasaOrderId), 'Vilasa Café Admin received the order');

  const clgOrdersRes3 = await fetch(`${BASE_URL}/api/orders?restaurant_id=clg-bites-biryani-nation`);
  const clgOrders3 = (await clgOrdersRes3.json()).orders || [];
  assert(!clgOrders3.some(o => o.id === vilasaOrderId), 'CLG Bites Admin does NOT receive Vilasa Café order');

  // ---------------------------------------------------------
  // 7. TEST 4: Turn Vilasa Café OFF
  // ---------------------------------------------------------
  console.log('\n--- 7. TEST 4: Turn Vilasa Café OFF & Independent Operation ---');
  await fetch(`${BASE_URL}/api/restaurants/vilasa-cafe/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_open: false })
  });

  const blockedRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: `order-blocked-${Date.now()}`,
      student_name: 'Test Block',
      restaurant_id: 'vilasa-cafe',
      total_amount: 190,
      status: 'CONFIRMED',
      items: [{ name: 'Chicken Dum Biryani', quantity: 1, price: 190 }]
    })
  });
  assert(blockedRes.status === 403, 'Order placement rejected (403) when Vilasa Café is CLOSED');

  // Verify LHK and CLG Bites still accept orders
  const lhkStillOpenRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: `order-lhk-open-${Date.now()}`,
      student_name: 'Test LHK While Vilasa Closed',
      restaurant_id: 'local-home-kitchen',
      total_amount: 100,
      status: 'CONFIRMED',
      items: [{ name: 'Veg Fried Rice', quantity: 1, price: 100 }]
    })
  });
  assert(lhkStillOpenRes.ok, 'Local Home Kitchen still accepts orders while Vilasa Café is CLOSED');

  // Restore Vilasa Café to OPEN
  await fetch(`${BASE_URL}/api/restaurants/vilasa-cafe/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_open: true })
  });
  console.log('Restored Vilasa Café to OPEN.');

  // ---------------------------------------------------------
  // 8. TEST 5: Turn entire platform OFF
  // ---------------------------------------------------------
  console.log('\n--- 8. TEST 5: Master Platform Ordering Toggle ---');
  await fetch(`${BASE_URL}/api/system-settings/platform`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform_enabled: false })
  });

  const platformBlockedRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: `order-platform-blocked-${Date.now()}`,
      student_name: 'Test Platform Blocked',
      restaurant_id: 'local-home-kitchen',
      total_amount: 150,
      status: 'CONFIRMED',
      items: [{ name: 'Veg Noodles', quantity: 1, price: 150 }]
    })
  });
  assert(platformBlockedRes.status === 403, 'Order placement rejected (403) across all restaurants when Platform is PAUSED');

  // Restore Platform to ACTIVE
  await fetch(`${BASE_URL}/api/system-settings/platform`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform_enabled: true })
  });
  console.log('Restored Platform Ordering to ACTIVE.');

  // ---------------------------------------------------------
  // 9. Cleanup Test Orders
  // ---------------------------------------------------------
  const cleanupIds = [lhkOrderId, clgOrderId, vilasaOrderId, `order-lhk-open-${Date.now()}`];
  for (const cid of cleanupIds) {
    await fetch(`${BASE_URL}/api/orders/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: cid })
    }).catch(() => {});
  }

  console.log('\n===========================================================');
  console.log('  ALL SIMPLIFIED ORDER WORKFLOW & ARCHITECTURE TESTS PASSED! ');
  console.log('===========================================================');
}

run().catch((err) => {
  console.error('Test run error:', err);
  process.exit(1);
});
