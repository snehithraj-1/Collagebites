import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adminAssets = path.resolve(__dirname, '../dist/admin/assets');
const rootAssets = path.resolve(__dirname, '../dist/assets');

if (fs.existsSync(adminAssets) && fs.existsSync(rootAssets)) {
  for (const f of fs.readdirSync(adminAssets)) {
    const src = path.join(adminAssets, f);
    const dst = path.join(rootAssets, f);
    fs.copyFileSync(src, dst);
  }
  console.log('✅ Synced admin assets to root assets directory.');
}
