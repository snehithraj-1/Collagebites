import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('  CampusBites — Starting Unified Dual Portals & Shared Backend  ');
console.log('================================================================');
console.log('  ⚡ Shared Central Backend API: http://localhost:5000');
console.log('  🍔 Student Dining Portal:      http://localhost:5173');
console.log('  🛡️  Admin Management Portal:    http://localhost:5174');
console.log('================================================================\n');

const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const nodeCmd = process.platform === 'win32' ? 'node.exe' : 'node';

// 1. Start Shared Backend API (Port 5000)
const backend = spawn(nodeCmd, ['server/server.js'], {
  cwd: rootDir,
  shell: true,
  stdio: 'pipe'
});

backend.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach(line => {
    if (line.trim()) console.log(`\x1b[32m[BACKEND :5000]\x1b[0m ${line}`);
  });
});

backend.stderr.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach(line => {
    if (line.trim()) console.error(`\x1b[31m[BACKEND ERROR]\x1b[0m ${line}`);
  });
});

// 2. Start Student Portal (Port 5173)
const student = spawn(npxCmd, ['vite', 'student-app', '--config', 'student-app/vite.config.js', '--port', '5173', '--host'], {
  cwd: rootDir,
  shell: true,
  stdio: 'pipe'
});

student.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach(line => {
    if (line.trim()) console.log(`\x1b[38;5;208m[STUDENT :5173]\x1b[0m ${line}`);
  });
});

student.stderr.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach(line => {
    if (line.trim()) console.error(`\x1b[31m[STUDENT ERROR]\x1b[0m ${line}`);
  });
});

// 3. Start Admin Portal (Port 5174)
const admin = spawn(npxCmd, ['vite', 'admin-app', '--config', 'admin-app/vite.config.js', '--port', '5174', '--host'], {
  cwd: rootDir,
  shell: true,
  stdio: 'pipe'
});

admin.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach(line => {
    if (line.trim()) console.log(`\x1b[34m[ADMIN   :5174]\x1b[0m ${line}`);
  });
});

admin.stderr.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach(line => {
    if (line.trim()) console.error(`\x1b[31m[ADMIN ERROR]\x1b[0m ${line}`);
  });
});

function handleExit() {
  backend.kill();
  student.kill();
  admin.kill();
  process.exit();
}

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);
