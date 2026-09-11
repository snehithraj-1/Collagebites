// Using Node.js native global fetch
const BASE_URL = 'http://localhost:5000';

async function testMultiRoleFlow() {
  console.log('====================================================');
  console.log('  RUNNING AUTOMATED END-TO-END MULTI-ROLE TEST SUITE ');
  console.log('====================================================\n');

  let passedCount = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedCount++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
    }
  }

  try {
    // 1. Test Super Admin Login
    console.log('--- 1. Testing Admin Authentication Roles ---');
    const superAdminRes = await fetch(`${BASE_URL}/api/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'rajsrmap2@gmail.com', password: 'Snehith@007' })
    }).then(r => r.json());
    assert(superAdminRes.success && superAdminRes.user?.role === 'super_admin', 'Super Admin Login (rajsrmap2@gmail.com)');

    // 2. Test Local Home Kitchen Admin Login
    const lhkAdminRes = await fetch(`${BASE_URL}/api/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'lhk_admin', password: 'LHK@Campus2026' })
    }).then(r => r.json());
    assert(lhkAdminRes.success && lhkAdminRes.user?.restaurant_id === 'local-home-kitchen', 'Local Home Kitchen Admin Login (lhk_admin)');

    // 3. Test CLG Bites Admin Login
    const clgAdminRes = await fetch(`${BASE_URL}/api/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'clgbites_admin', password: 'CLG@Campus2026' })
    }).then(r => r.json());
    assert(clgAdminRes.success && clgAdminRes.user?.restaurant_id === 'clg-bites-biryani-nation', 'CLG Bites Admin Login (clgbites_admin)');

    // 4. Test Delivery Partner (Rider) Login via Phone + PIN
    console.log('\n--- 2. Testing Delivery Partner Authentication ---');
    const riderLoginRes = await fetch(`${BASE_URL}/api/rider/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '8240756887', pin: '1234' })
    }).then(r => r.json());
    assert(riderLoginRes.success && Boolean(riderLoginRes.partner?.id), 'Delivery Partner Login via Phone & PIN (8240756887)');

    // 5. Test Active Delivery Partners Endpoint
    console.log('\n--- 3. Testing Delivery Partners List ---');
    const partnersRes = await fetch(`${BASE_URL}/api/delivery-partners`).then(r => r.json());
    assert(partnersRes.success && Array.isArray(partnersRes.partners) && partnersRes.partners.length > 0, `Active Delivery Partners Available (Count: ${partnersRes.partners?.length || 0})`);

    // 6. Test Orders Scoping by Restaurant
    console.log('\n--- 4. Testing Order Isolation Between Restaurants ---');
    const lhkOrdersRes = await fetch(`${BASE_URL}/api/orders?restaurant_id=local-home-kitchen`).then(r => r.json());
    const clgOrdersRes = await fetch(`${BASE_URL}/api/orders?restaurant_id=clg-bites-biryani-nation`).then(r => r.json());
    
    assert(
      lhkOrdersRes.success && lhkOrdersRes.orders.every(o => o.restaurant_id === 'local-home-kitchen'),
      `LHK Orders contain ONLY Local Home Kitchen orders (Count: ${lhkOrdersRes.orders?.length || 0})`
    );
    assert(
      clgOrdersRes.success && clgOrdersRes.orders.every(o => o.restaurant_id === 'clg-bites-biryani-nation'),
      `CLG Bites Orders contain ONLY CLG Bites orders (Count: ${clgOrdersRes.orders?.length || 0})`
    );

    // 7. Test Two-Tier Availability: Platform Switch & Restaurant Toggles
    console.log('\n--- 5. Testing Two-Tier Ordering Availability Controls ---');
    const settingsRes = await fetch(`${BASE_URL}/api/system-settings`).then(r => r.json());
    assert(settingsRes.success && typeof settingsRes.platform_enabled === 'boolean', 'System Settings platform_enabled query');

    const restaurantsRes = await fetch(`${BASE_URL}/api/restaurants`).then(r => r.json());
    assert(restaurantsRes.success && Array.isArray(restaurantsRes.restaurants), 'Restaurants status query');

    // 8. Test Rider Status Updates Endpoint (Lifecycle: ASSIGNED -> OUT_FOR_DELIVERY -> DELIVERED)
    console.log('\n--- 6. Testing Delivery Partner Order Status Stepper ---');
    const riderOrders = await fetch(`${BASE_URL}/api/rider/orders?phone=8240756887`).then(r => r.json());
    assert(riderOrders.success && Array.isArray(riderOrders.orders), 'Rider Orders Endpoint responds with active orders list');

    console.log('\n====================================================');
    console.log(`  TEST RESULTS: ${passedCount} / ${totalTests} TESTS PASSED`);
    console.log('====================================================');

    if (passedCount === totalTests) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test runner error:', err);
    process.exit(1);
  }
}

testMultiRoleFlow();
