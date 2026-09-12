import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { VILASA_RESTAURANT, VILASA_MENU_ITEMS } from './add-vilasa-cafe.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Update server/authenticMenuData.js
const authMenuPath = path.join(rootDir, 'server/authenticMenuData.js');
let authMenuContent = fs.readFileSync(authMenuPath, 'utf8');

if (!authMenuContent.includes('"vilasa-cafe"')) {
  // Add to AUTHENTIC_RESTAURANTS
  const restStr = `  {\n    id: "vilasa-cafe",\n    name: "Vilasa Café",\n    description: "High on life! Taste • Talks • Time — Fresh Biryanis, Starters, Chinese & Curries.",\n    cuisine: "Biryani, Starters & Chinese",\n    location: "Opp SRM University, E12 Road • Neerukonda, Amaravathi",\n    phone: "9989955833",\n    rating: 4.8,\n    prep_time: "15-20 min",\n    image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",\n    is_open: true\n  }`;
  
  authMenuContent = authMenuContent.replace(
    /export const AUTHENTIC_RESTAURANTS = \[([\s\S]*?)\];/,
    (match, inner) => `export const AUTHENTIC_RESTAURANTS = [${inner.trimEnd()},\n${restStr}\n];`
  );

  // Append VILASA_MENU_ITEMS to AUTHENTIC_MENU_ITEMS
  const itemsJson = VILASA_MENU_ITEMS.map(item => `  ${JSON.stringify(item, null, 2).replace(/\n/g, '\n  ')}`).join(',\n');
  const sectionComment = `\n  // =========================================================================\n  // 3. VILASA CAFÉ (Authentic Campus Menu)\n  // =========================================================================\n\n`;

  authMenuContent = authMenuContent.replace(
    /export const AUTHENTIC_MENU_ITEMS = \[([\s\S]*?)\];/,
    (match, inner) => `export const AUTHENTIC_MENU_ITEMS = [${inner.trimEnd()},\n${sectionComment}${itemsJson}\n];`
  );

  fs.writeFileSync(authMenuPath, authMenuContent, 'utf8');
  console.log('✅ Updated server/authenticMenuData.js with Vilasa Café!');
} else {
  console.log('ℹ️ server/authenticMenuData.js already contains Vilasa Café.');
}

// 2. Update student-app/src/lib/campusSeedData.js
const studentSeedPath = path.join(rootDir, 'student-app/src/lib/campusSeedData.js');
let studentSeedContent = fs.readFileSync(studentSeedPath, 'utf8');

if (!studentSeedContent.includes('"vilasa-cafe"')) {
  const restStr = `  {\n    id: "vilasa-cafe",\n    name: "Vilasa Café",\n    description: "High on life! Taste • Talks • Time — Fresh Biryanis, Starters, Chinese & Curries.",\n    cuisine: "Biryani, Starters & Chinese",\n    location: "Opp SRM University, E12 Road • Neerukonda, Amaravathi",\n    phone: "9989955833",\n    rating: 4.8,\n    prep_time: "15-20 min",\n    image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",\n    is_open: true\n  }`;

  studentSeedContent = studentSeedContent.replace(
    /export const DEFAULT_RESTAURANTS = \[([\s\S]*?)\];/,
    (match, inner) => `export const DEFAULT_RESTAURANTS = [${inner.trimEnd()},\n${restStr}\n];`
  );

  const itemsJson = VILASA_MENU_ITEMS.map(item => `  ${JSON.stringify(item, null, 2).replace(/\n/g, '\n  ')}`).join(',\n');
  const sectionComment = `\n  // =========================================================================\n  // 3. VILASA CAFÉ (Authentic Campus Menu)\n  // =========================================================================\n\n`;

  studentSeedContent = studentSeedContent.replace(
    /export const DEFAULT_MENU_ITEMS = \[([\s\S]*?)\];/,
    (match, inner) => `export const DEFAULT_MENU_ITEMS = [${inner.trimEnd()},\n${sectionComment}${itemsJson}\n];`
  );

  fs.writeFileSync(studentSeedPath, studentSeedContent, 'utf8');
  console.log('✅ Updated student-app/src/lib/campusSeedData.js with Vilasa Café!');
} else {
  console.log('ℹ️ student-app/src/lib/campusSeedData.js already contains Vilasa Café.');
}

// 3. Update admin-app/src/lib/campusSeedData.js
const adminSeedPath = path.join(rootDir, 'admin-app/src/lib/campusSeedData.js');
let adminSeedContent = fs.readFileSync(adminSeedPath, 'utf8');

if (!adminSeedContent.includes('"vilasa-cafe"')) {
  const restStr = `  {\n    id: "vilasa-cafe",\n    name: "Vilasa Café",\n    description: "High on life! Taste • Talks • Time — Fresh Biryanis, Starters, Chinese & Curries.",\n    cuisine: "Biryani, Starters & Chinese",\n    location: "Opp SRM University, E12 Road • Neerukonda, Amaravathi",\n    phone: "9989955833",\n    rating: 4.8,\n    prep_time: "15-20 min",\n    image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",\n    is_open: true\n  }`;

  adminSeedContent = adminSeedContent.replace(
    /export const DEFAULT_RESTAURANTS = \[([\s\S]*?)\];/,
    (match, inner) => `export const DEFAULT_RESTAURANTS = [${inner.trimEnd()},\n${restStr}\n];`
  );

  const itemsJson = VILASA_MENU_ITEMS.map(item => `  ${JSON.stringify(item, null, 2).replace(/\n/g, '\n  ')}`).join(',\n');
  const sectionComment = `\n  // =========================================================================\n  // 3. VILASA CAFÉ (Authentic Campus Menu)\n  // =========================================================================\n\n`;

  adminSeedContent = adminSeedContent.replace(
    /export const DEFAULT_MENU_ITEMS = \[([\s\S]*?)\];/,
    (match, inner) => `export const DEFAULT_MENU_ITEMS = [${inner.trimEnd()},\n${sectionComment}${itemsJson}\n];`
  );

  fs.writeFileSync(adminSeedPath, adminSeedContent, 'utf8');
  console.log('✅ Updated admin-app/src/lib/campusSeedData.js with Vilasa Café!');
} else {
  console.log('ℹ️ admin-app/src/lib/campusSeedData.js already contains Vilasa Café.');
}

// 4. Update server/server.js admin accounts
const serverJsPath = path.join(rootDir, 'server/server.js');
let serverJsContent = fs.readFileSync(serverJsPath, 'utf8');

if (!serverJsContent.includes("'admin-vilasa'")) {
  serverJsContent = serverJsContent.replace(
    "('admin-clg', 'clgbites_admin', 'CLG Bites Admin', 'restaurant_admin', 'clg-bites-biryani-nation', 'CLG@Campus2026')",
    "('admin-clg', 'clgbites_admin', 'CLG Bites Admin', 'restaurant_admin', 'clg-bites-biryani-nation', 'CLG@Campus2026'),\n        ('admin-vilasa', 'vilasa_admin', 'Vilasa Café Admin', 'restaurant_admin', 'vilasa-cafe', 'Vilasa@Campus2026')"
  );
  fs.writeFileSync(serverJsPath, serverJsContent, 'utf8');
  console.log('✅ Updated server/server.js with Vilasa admin account seed!');
} else {
  console.log('ℹ️ server/server.js already contains Vilasa admin account.');
}
