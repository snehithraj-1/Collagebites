async function check() {
  try {
    const res = await fetch('https://collagebites-admin1.vercel.app/');
    const html = await res.text();
    const match = html.match(/index-[a-zA-Z0-9_\-]+\.js/);
    console.log('Live bundle:', match ? match[0] : 'not found');

    const ordersRes = await fetch('https://collagebites-admin1.vercel.app/api/orders');
    console.log('Orders API Status:', ordersRes.status);
    if (ordersRes.ok) {
      const data = await ordersRes.json();
      console.log('Orders Count:', data.orders?.length || (Array.isArray(data) ? data.length : 0));
      const first = data.orders?.[0] || data[0];
      if (first) {
        console.log('First Order fields check:');
        console.log(' - student_name:', first.student_name);
        console.log(' - studentName:', first.studentName);
        console.log(' - student_phone:', first.student_phone);
        console.log(' - restaurant_name:', first.restaurant_name);
        console.log(' - total_amount:', first.total_amount);
      }
    }

    const studentsRes = await fetch('https://collagebites-admin1.vercel.app/api/students');
    console.log('Students API Status:', studentsRes.status);
    if (studentsRes.ok) {
      const sData = await studentsRes.json();
      console.log('Students Count:', sData.students?.length || (Array.isArray(sData) ? sData.length : 0));
    }

    const partnersRes = await fetch('https://collagebites-admin1.vercel.app/api/delivery-partners');
    console.log('Delivery Partners API Status:', partnersRes.status);
    if (partnersRes.ok) {
      const pData = await partnersRes.json();
      console.log('Partners Count:', pData.partners?.length || (Array.isArray(pData) ? pData.length : 0));
    }

    const toggleRes = await fetch('https://collagebites-admin1.vercel.app/api/restaurants/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'clg-bites-biryani-nation', is_open: true })
    });
    console.log('Toggle API Status:', toggleRes.status);
    if (toggleRes.ok) {
      const tData = await toggleRes.json();
      console.log('Toggle response:', tData);
    }
  } catch (err) {
    console.error('Check error:', err);
  }
}

check();
