const http = require('http');

const endpoints = [
  { name: 'Backend API Health', port: 5000, path: '/api/health' },
  { name: 'Backend Orders API', port: 5000, path: '/api/orders' },
  { name: 'Backend Restaurants API', port: 5000, path: '/api/restaurants' },
  { name: 'Student Portal', port: 5173, path: '/' },
  { name: 'Super Admin Portal', port: 5174, path: '/' }
];

async function run() {
  console.log('=== CAMPUSBITES ECOSYSTEM FULL AUDIT ===\n');
  let passed = 0;
  let failed = 0;

  for (const item of endpoints) {
    try {
      const res = await new Promise((resolve, reject) => {
        const req = http.get({ host: 'localhost', port: item.port, path: item.path, timeout: 4000 }, (r) => {
          let body = '';
          r.on('data', chunk => body += chunk);
          r.on('end', () => resolve({ status: r.statusCode, body }));
        });
        req.on('error', reject);
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Timeout after 4000ms'));
        });
      });

      if (res.status === 200) {
        console.log(`[PASS] ${item.name.padEnd(26)} -> HTTP 200 OK (Port ${item.port})`);
        passed++;
      } else {
        console.log(`[WARN] ${item.name.padEnd(26)} -> HTTP ${res.status} (Port ${item.port})`);
        failed++;
      }
    } catch (err) {
      console.log(`[FAIL] ${item.name.padEnd(26)} -> Connection Failed: ${err.message} (Port ${item.port})`);
      failed++;
    }
  }

  console.log(`\nResults: ${passed} Passed, ${failed} Failed`);
}

run();
