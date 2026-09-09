import { execSync } from 'child_process';

console.log('==============================================');
console.log('  CampusBites Vercel Auto-Build Adapter (Rider)');
console.log('==============================================');

try {
  console.log('[Adapter] Executing Vite build for rider-app...');
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('[Adapter] ✅ Build finished successfully into dist/');
  process.exit(0);
} catch (err) {
  console.error('[Adapter] ❌ Build execution failed:', err);
  process.exit(1);
}
