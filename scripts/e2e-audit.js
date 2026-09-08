import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL=(.+)/);
const dbUrl = match ? match[1].trim() : '';

const BASE_URL = 'http://localhost:5000';

console.log('====================================================');
console.log('🔍 CAMPUSBITES FULL END-TO-END SYSTEM AUDIT');
console.log('====================================================\n');

async function runAudit() {
  const steps = [];

  // 1. Check Backend Health
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    if (res.ok && data.neon?.status === 'connected') {
      steps.push({ name: '1. Backend & Neon Health API', status: 'PASS', detail: `Connected to ${data.neon.database}` });
    } else {
      steps.push({ name: '1. Backend & Neon Health API', status: 'FAIL', detail: JSON.stringify(data) });
    }
  } catch (e) {
    steps.push({ name: '1. Backend & Neon Health API', status: 'FAIL', detail: e.message });
  }

  // 2. Direct Neon DB Connection
  const sql = neon(dbUrl);
  try {
    const dbInfo = await sql`SELECT current_database(), current_user;`;
    steps.push({ name: '2. Direct Neon Connection', status: 'PASS', detail: `DB: ${dbInfo[0].current_database}, User: ${dbInfo[0].current_user}` });
  } catch (e) {
    steps.push({ name: '2. Direct Neon Connection', status: 'FAIL', detail: e.message });
  }

  // 3. Place a New Student Order via Student App API (POST /api/orders)
  const testOrderId = `CB-AUDIT-${Math.floor(1000 + Math.random() * 9000)}`;
  const testStudentEmail = 'audit_student@campus.edu';
  const testOrderPayload = {
    id: testOrderId,
    user_id: 'usr_audit_42',
    student_name: 'Audit Test Student',
    student_email: testStudentEmail,
    student_id: 'STU-AUDIT-2026',
    student_phone: '+91 99887 76655',
    delivery_location: 'Hostel Block C, Room 305',
    hostel_block: 'Block C',
    room_number: 'Room 305',
    restaurant_id: 'local-home-kitchen',
    restaurant_name: 'Local Home Kitchen',
    total_amount: 280,
    status: 'CONFIRMED',
    instructions: 'Ring bell on arrival',
    items: [
      { id: 'it-1', name: 'Paneer Butter Masala Meal', quantity: 1, price: 200 },
      { id: 'it-2', name: 'Gulab Jamun (2 pcs)', quantity: 1, price: 80 }
    ]
  };

  try {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testOrderPayload)
    });
    const data = await res.json();
    if (res.ok && data.success && data.stored_in_neon) {
      steps.push({ name: '3. Student Order Placement (Write)', status: 'PASS', detail: `Order #${testOrderId} created & written to Neon` });
    } else {
      steps.push({ name: '3. Student Order Placement (Write)', status: 'FAIL', detail: JSON.stringify(data) });
    }
  } catch (e) {
    steps.push({ name: '3. Student Order Placement (Write)', status: 'FAIL', detail: e.message });
  }

  // 4. Verify Order Exists in Neon DB Table
  try {
    const rows = await sql`SELECT id, student_name, total_amount, status FROM orders WHERE id = ${testOrderId};`;
    if (rows.length === 1 && rows[0].status === 'CONFIRMED') {
      steps.push({ name: '4. Neon DB Order Persistence', status: 'PASS', detail: `Verified in table 'orders': ₹${rows[0].total_amount}, status: ${rows[0].status}` });
    } else {
      steps.push({ name: '4. Neon DB Order Persistence', status: 'FAIL', detail: `Found ${rows.length} rows` });
    }
  } catch (e) {
    steps.push({ name: '4. Neon DB Order Persistence', status: 'FAIL', detail: e.message });
  }

  // 5. Verify Student Profile Saved in Neon DB Table
  try {
    const studentRows = await sql`SELECT name, email, student_id, total_orders FROM students WHERE email = ${testStudentEmail};`;
    if (studentRows.length === 1 && studentRows[0].total_orders >= 1) {
      steps.push({ name: '5. Neon DB Student Profile Persistence', status: 'PASS', detail: `Student ${studentRows[0].name} saved with ${studentRows[0].total_orders} total orders` });
    } else {
      steps.push({ name: '5. Neon DB Student Profile Persistence', status: 'FAIL', detail: `Found ${studentRows.length} rows` });
    }
  } catch (e) {
    steps.push({ name: '5. Neon DB Student Profile Persistence', status: 'FAIL', detail: e.message });
  }

  // 6. Admin Portal Orders Retrieval (GET /api/orders)
  try {
    const res = await fetch(`${BASE_URL}/api/orders`);
    const data = await res.json();
    const found = (data.orders || []).some(o => o.id === testOrderId);
    if (res.ok && found) {
      steps.push({ name: '6. Admin Portal Order Retrieval', status: 'PASS', detail: `Order #${testOrderId} visible in Admin feed` });
    } else {
      steps.push({ name: '6. Admin Portal Order Retrieval', status: 'FAIL', detail: `Order not found in ${data.orders?.length} orders` });
    }
  } catch (e) {
    steps.push({ name: '6. Admin Portal Order Retrieval', status: 'FAIL', detail: e.message });
  }

  // 7. Admin Status Update: CONFIRMED -> PREPARING -> READY -> OUT_FOR_DELIVERY -> DELIVERED
  const statusTransitions = ['PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  let statusOk = true;
  for (const st of statusTransitions) {
    try {
      const res = await fetch(`${BASE_URL}/api/orders/${testOrderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: st })
      });
      const data = await res.json();
      if (!res.ok || !data.success || data.order.status !== st) {
        statusOk = false;
        break;
      }
    } catch (e) {
      statusOk = false;
      break;
    }
  }
  steps.push({
    name: '7. Admin Order Status Workflow',
    status: statusOk ? 'PASS' : 'FAIL',
    detail: 'CONFIRMED ➔ PREPARING ➔ READY ➔ OUT_FOR_DELIVERY ➔ DELIVERED'
  });

  // 8. Verify Status History Recorded in Neon
  try {
    const historyRows = await sql`SELECT status, changed_at FROM order_status_history WHERE order_id = ${testOrderId} ORDER BY id ASC;`;
    if (historyRows.length >= 4) {
      const historyTrail = historyRows.map(h => h.status).join(' ➔ ');
      steps.push({ name: '8. Neon Status History Audit Trail', status: 'PASS', detail: `${historyRows.length} transitions logged (${historyTrail})` });
    } else {
      steps.push({ name: '8. Neon Status History Audit Trail', status: 'FAIL', detail: `Found only ${historyRows.length} history records` });
    }
  } catch (e) {
    steps.push({ name: '8. Neon Status History Audit Trail', status: 'FAIL', detail: e.message });
  }

  // 9. Student Portal Order Tracking Endpoint (GET /api/orders/student/:id)
  try {
    const res = await fetch(`${BASE_URL}/api/orders/student/${encodeURIComponent(testStudentEmail)}`);
    const data = await res.json();
    const studentOrder = (data.orders || []).find(o => o.id === testOrderId);
    if (res.ok && studentOrder && studentOrder.status === 'DELIVERED') {
      steps.push({ name: '9. Student Real-Time Order Tracking', status: 'PASS', detail: `Student sees live status: ${studentOrder.status}` });
    } else {
      steps.push({ name: '9. Student Real-Time Order Tracking', status: 'FAIL', detail: JSON.stringify(data) });
    }
  } catch (e) {
    steps.push({ name: '9. Student Real-Time Order Tracking', status: 'FAIL', detail: e.message });
  }

  // 10. Admin Students Directory (GET /api/students)
  try {
    const res = await fetch(`${BASE_URL}/api/students`);
    const data = await res.json();
    const hasStudent = (data.students || []).some(s => s.email === testStudentEmail);
    if (res.ok && hasStudent) {
      steps.push({ name: '10. Admin Students Directory', status: 'PASS', detail: `Student ${testStudentEmail} listed in Admin database modal` });
    } else {
      steps.push({ name: '10. Admin Students Directory', status: 'FAIL', detail: `Student missing from list of ${data.students?.length}` });
    }
  } catch (e) {
    steps.push({ name: '10. Admin Students Directory', status: 'FAIL', detail: e.message });
  }

  // Clean up test order from DB
  try {
    await sql`DELETE FROM order_status_history WHERE order_id = ${testOrderId};`;
    await sql`DELETE FROM orders WHERE id = ${testOrderId};`;
  } catch (e) {}

  // Print Summary Table
  console.log('RESULTS:');
  steps.forEach(s => {
    const icon = s.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} [${s.status}] ${s.name.padEnd(38)} : ${s.detail}`);
  });

  const allPassed = steps.every(s => s.status === 'PASS');
  console.log('\n====================================================');
  console.log(allPassed ? '🎉 10/10 TESTS PASSED — SYSTEM IS WORKING PERFECTLY!' : '⚠️ SOME CHECKS FAILED');
  console.log('====================================================');
}

runAudit().catch(console.error);
