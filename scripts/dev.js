import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('  CampusBites — Starting Dedicated Portals + Shared Backend API ');
console.log('================================================================');
console.log('  ⚡ Shared Backend API:          http://localhost:5000');
console.log('  🍔 Student Dining Portal:       http://localhost:5173');
console.log('  🛡️  CampusBites Admin Portal:    http://localhost:5174');
console.log('  🚴 Delivery Partner Portal:     http://localhost:5175');
console.log('================================================================\n');

const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const nodeCmd = process.platform === 'win32' ? 'node.exe' : 'node';

function startProcess(name, cmd, args, colorCode) {
  const proc = spawn(cmd, args, {
    cwd: rootDir,
    shell: true,
    stdio: 'pipe'
  });

  proc.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      if (line.trim()) console.log(`\x1b[${colorCode}m[${name}]\x1b[0m ${line}`);
    });
  });

  proc.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      if (line.trim()) console.error(`\x1b[31m[${name} ERROR]\x1b[0m ${line}`);
    });
  });

  return proc;
}

// 1. Shared Backend API (Port 5000) with auto-reload
const backend = startProcess('BACKEND  :5000', nodeCmd, ['--watch', 'server/server.js'], '32');

// 2. Student Dining Portal (Port 5173)
const student = startProcess('STUDENT  :5173', npxCmd, ['vite', 'student-app', '--config', 'student-app/vite.config.js', '--port', '5173', '--host'], '38;5;208');

// 3. Main Admin Portal (Port 5174)
const admin = startProcess('ADMIN    :5174', npxCmd, ['vite', 'admin-app', '--config', 'admin-app/vite.config.js', '--port', '5174', '--host'], '34');

// 4. Delivery Partner Portal (Port 5175)
const delivery = startProcess('DELIVERY :5175', npxCmd, ['vite', 'delivery-app', '--config', 'delivery-app/vite.config.js', '--port', '5175', '--host'], '36');

function handleExit() {
  backend.kill();
  student.kill();
  admin.kill();
  delivery.kill();
  process.exit();
}

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);
