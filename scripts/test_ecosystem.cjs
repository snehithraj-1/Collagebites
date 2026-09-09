const http = require('http');

function request(method, path, data) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, text: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function fullEcosystemCheck() {
  console.log('--- 1. Testing Restaurant Controls ---');
  const restRes = await request('GET', '/api/restaurants');
  console.log(`Restaurants found: ${restRes.data.restaurants.length}`);
  for (const r of restRes.data.restaurants) {
    console.log(`  - ${r.name} (${r.id}): is_open = ${r.is_open}`);
  }

  console.log('\n--- 2. Testing Delivery Partners ---');
  const dpRes = await request('GET', '/api/delivery-partners');
  console.log(`Delivery partners registered: ${dpRes.data.partners.length}`);
  const firstPartner = dpRes.data.partners[0];
  if (firstPartner) {
    console.log(`  Active rider sample: ${firstPartner.name} (Phone: ${firstPartner.phone})`);
  }

  console.log('\n--- 3. Testing Order Creation (Student Flow) ---');
  const testId = `CB-AUDIT-${Date.now().toString().slice(-6)}`;
  const createRes = await request('POST', '/api/orders', {
    id: testId,
    restaurant_id: 'local-home-kitchen',
    restaurant_name: 'Local Home Kitchen',
    student_name: 'Audit Student',
    student_phone: '9876543210',
    hostel_block: 'SRM University Gate 3',
    items: [{ name: 'Veg Fried Rice', price: 150, quantity: 1 }],
    total_amount: 150,
    payment_method: 'COD'
  });
  console.log(`Order created: ${createRes.data.success ? 'PASS' : 'FAIL'} (ID: ${testId})`);

  console.log('\n--- 4. Testing Kitchen Status Update (PREPARING) ---');
  const prepRes = await request('PATCH', `/api/orders/${testId}/status`, { status: 'PREPARING' });
  console.log(`Status -> PREPARING: ${prepRes.data.success ? 'PASS' : 'FAIL'}`);

  console.log('\n--- 5. Testing Rider Assignment ---');
  const assignRes = await request('PATCH', `/api/orders/${testId}/assign-partner`, {
    partner_id: firstPartner ? firstPartner.id : 'test-dp',
    partner_name: firstPartner ? firstPartner.name : 'Audit Rider',
    partner_phone: firstPartner ? firstPartner.phone : '9999999999'
  });
  console.log(`Rider assigned: ${assignRes.data && assignRes.data.success ? 'PASS' : 'FAIL'}`);

  console.log('\n--- 6. Testing Rider Update to OUT_FOR_DELIVERY ---');
  const outRes = await request('PATCH', `/api/orders/${testId}/status`, { status: 'OUT_FOR_DELIVERY' });
  console.log(`Status -> OUT_FOR_DELIVERY: ${outRes.data.success ? 'PASS' : 'FAIL'}`);

  console.log('\n--- 7. Testing Student Multi-Identifier Lookup (by Phone) ---');
  const lookupRes = await request('GET', `/api/orders/student/9876543210`);
  const foundOrder = lookupRes.data.orders ? lookupRes.data.orders.find(o => o.id === testId) : null;
  console.log(`Student lookup by phone returned order: ${foundOrder ? 'PASS' : 'FAIL'}`);
  if (foundOrder) {
    console.log(`  Current order status seen by student: ${foundOrder.status}`);
    console.log(`  Rider info seen by student: ${foundOrder.delivery_partner_name} (${foundOrder.delivery_partner_phone})`);
  }

  console.log('\n--- 8. Testing Rider Update to DELIVERED ---');
  const delRes = await request('PATCH', `/api/orders/${testId}/status`, { status: 'DELIVERED' });
  console.log(`Status -> DELIVERED: ${delRes.data.success ? 'PASS' : 'FAIL'}`);

  console.log('\n--- 9. Verifying Database & Storage Sync ---');
  const finalLookup = await request('GET', `/api/orders/student/9876543210`);
  const finalOrder = finalLookup.data.orders ? finalLookup.data.orders.find(o => o.id === testId) : null;
  console.log(`Final order state: ${finalOrder && finalOrder.status === 'DELIVERED' ? 'PASS (DELIVERED)' : 'FAIL'}`);

  console.log('\n=== ALL ECOSYSTEM CHECKS COMPLETE ===');
}

fullEcosystemCheck().catch(err => console.error('Ecosystem Check Error:', err));
