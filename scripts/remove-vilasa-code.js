import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Clean server/authenticMenuData.js
{
  const filePath = path.join(rootDir, 'server/authenticMenuData.js');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove Vilasa from AUTHENTIC_RESTAURANTS
    content = content.replace(/,\s*\{\s*id:\s*"vilasa-cafe"[\s\S]*?is_open:\s*true\s*\}/g, '');

    // Remove Vilasa items from AUTHENTIC_MENU_ITEMS
    // It starts with `// =========================================================================\n  // 3. VILASA CAFÉ`
    content = content.replace(/,\s*\/\/\s*={10,}\s*\/\/\s*3\.\s*VILASA CAFÉ[\s\S]*?\];/, '\n];');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Cleaned server/authenticMenuData.js');
  }
}

// 2. Clean student-app/src/lib/campusSeedData.js
{
  const filePath = path.join(rootDir, 'student-app/src/lib/campusSeedData.js');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove Vilasa from DEFAULT_RESTAURANTS
    content = content.replace(/,\s*\{\s*id:\s*"vilasa-cafe"[\s\S]*?is_open:\s*true\s*\}/g, '');

    // Remove Vilasa items from DEFAULT_MENU_ITEMS
    content = content.replace(/,\s*\/\/\s*={10,}\s*\/\/\s*3\.\s*VILASA CAFÉ[\s\S]*?\];/, '\n];');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Cleaned student-app/src/lib/campusSeedData.js');
  }
}

// 3. Clean admin-app/src/lib/campusSeedData.js
{
  const filePath = path.join(rootDir, 'admin-app/src/lib/campusSeedData.js');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    content = content.replace(/,\s*\{\s*id:\s*"vilasa-cafe"[\s\S]*?is_open:\s*true\s*\}/g, '');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Cleaned admin-app/src/lib/campusSeedData.js');
  }
}

// 4. Clean student-app/index.html
{
  const filePath = path.join(rootDir, 'student-app/index.html');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    content = content.replace(', and Vilasa Café', '');
    content = content.replace('& Vilasa Café', '');
    content = content.replace(', Vilasa Café', '');
    content = content.replace('Vilasa Café, ', '');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Cleaned student-app/index.html');
  }
}

// 5. Clean student-app/api/_handlers/auth-admin-login.js
{
  const filePath = path.join(rootDir, 'student-app/api/_handlers/auth-admin-login.js');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    content = content.replace(/\s*\(cleanPassword === 'vilasa123' && account\.restaurant_id === 'vilasa-cafe'\) \|\|/g, '');
    content = content.replace(/\s*if \(\(inputIdentifier === 'vilasa_admin' \|\| inputIdentifier === 'vilasa@campusbites\.com' \|\| inputIdentifier === 'vilasa'\)[\s\S]*?return res\.status\(200\)\.json\(\{ success: true, token: makeAdminToken\(vilasaProfile\), user: vilasaProfile, message: 'Vilasa Café Admin authenticated' \}\);\s*\}/g, '');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Cleaned student-app/api/_handlers/auth-admin-login.js');
  }
}

// 6. Clean server/server.js
{
  const filePath = path.join(rootDir, 'server/server.js');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove Vilasa admin account seed
    content = content.replace(/,\s*\('admin-vilasa', 'vilasa_admin', 'Vilasa Café Admin', 'restaurant_admin', 'vilasa-cafe', 'Vilasa@Campus2026'\)/g, '');

    // Remove Vilasa admin fallback auth
    content = content.replace(/\s*if \(\(inputIdentifier === 'vilasa_admin' \|\| inputIdentifier === 'vilasa@campusbites\.com' \|\| inputIdentifier === 'vilasa'\)[\s\S]*?return res\.json\(\{ success: true, token: makeAdminToken\(vilasaProfile\), user: vilasaProfile, message: 'Vilasa Café Admin authenticated' \}\);\s*\}/g, '');

    // Line 2169 restaurant name fallback
    content = content.replace("data.restaurant_id === 'vilasa-cafe' ? 'Vilasa Café' : (data.restaurant_id === 'clg-bites-biryani-nation' ? 'Biryani Nation' : 'Local Home Kitchen')", "data.restaurant_id === 'clg-bites-biryani-nation' ? 'Biryani Nation' : 'Local Home Kitchen'");

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Cleaned server/server.js');
  }
}

// 7. Clean admin-app/src/context/AdminAuthContext.jsx
{
  const filePath = path.join(rootDir, 'admin-app/src/context/AdminAuthContext.jsx');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    content = content.replace(/\s*if \(\(lowerInput === 'vilasa_admin' \|\| lowerInput === 'vilasa@collegebites\.com' \|\| lowerInput === 'vilasa@campusbites\.com' \|\| lowerInput === 'vilasa'\)[\s\S]*?return \{ success: true, user: vilasaProfile \};\s*\}/g, '');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Cleaned admin-app/src/context/AdminAuthContext.jsx');
  }
}

// 8. Clean admin-app/src/pages/AdminDashboardPage.jsx
{
  const filePath = path.join(rootDir, 'admin-app/src/pages/AdminDashboardPage.jsx');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove line 459: : assignedRestaurantId === 'vilasa-cafe' ? 'Vilasa Café'
    content = content.replace(/\s*: assignedRestaurantId === 'vilasa-cafe'\s*\?\s*'Vilasa Café'/g, '');

    // Remove line 664: : (isRestaurantAdmin && assignedRestaurantId === 'vilasa-cafe') || activeRestaurantTab === 'vilasa-cafe' ? 'Vilasa Café'
    content = content.replace(/\s*: \(isRestaurantAdmin && assignedRestaurantId === 'vilasa-cafe'\) \|\| activeRestaurantTab === 'vilasa-cafe'\s*\?\s*'Vilasa Café'/g, '');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Cleaned admin-app/src/pages/AdminDashboardPage.jsx');
  }
}

// 9. Clean admin-app/src/components/OrdersTable.jsx
{
  const filePath = path.join(rootDir, 'admin-app/src/components/OrdersTable.jsx');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove Vilasa Café tab button
    const vilasaBtnRegex = /\s*<button\s*onClick=\{\(\) => onSelectRestaurantTab\('vilasa-cafe'\)\}[\s\S]*?Vilasa Café\s*<\/button>/g;
    content = content.replace(vilasaBtnRegex, '');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Cleaned admin-app/src/components/OrdersTable.jsx');
  }
}

// 10. Clean admin-app/src/components/OrderCard.jsx
{
  const filePath = path.join(rootDir, 'admin-app/src/components/OrderCard.jsx');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    content = content.replace("order.restaurant_id === 'vilasa-cafe' ? 'Vilasa Café' : (order.restaurant_id === 'clg-bites-biryani-nation' ? 'Biryani Nation' : 'Local Home Kitchen')", "order.restaurant_id === 'clg-bites-biryani-nation' ? 'Biryani Nation' : 'Local Home Kitchen'");

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Cleaned admin-app/src/components/OrderCard.jsx');
  }
}

// 11. Clean admin-app/src/components/MenuManagerModal.jsx
{
  const filePath = path.join(rootDir, 'admin-app/src/components/MenuManagerModal.jsx');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    content = content.replace("effectiveRest === 'vilasa-cafe' ? 'Vilasa Café' : (effectiveRest === 'clg-bites-biryani-nation' ? 'Clg Bites Biryani Nation' : 'Local Home Kitchen')", "effectiveRest === 'clg-bites-biryani-nation' ? 'Clg Bites Biryani Nation' : 'Local Home Kitchen'");

    content = content.replace(/\s*\{\(!assignedRestaurantId \|\| assignedRestaurantId === 'vilasa-cafe'\) && \(\s*<option value="vilasa-cafe">Vilasa Café<\/option>\s*\)\}/g, '');

    content = content.replace(/\s*e\.target\.value === 'vilasa-cafe'\s*\?\s*'Vilasa Café'\s*:/g, '');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Cleaned admin-app/src/components/MenuManagerModal.jsx');
  }
}

// 12. Clean admin-app/src/components/DeliveryPartnersModal.jsx
{
  const filePath = path.join(rootDir, 'admin-app/src/components/DeliveryPartnersModal.jsx');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    content = content.replace(/\s*\{\(!assignedRestaurantId \|\| assignedRestaurantId === 'vilasa-cafe'\) && \(\s*<option value="vilasa-cafe">Vilasa Café<\/option>\s*\)\}/g, '');

    content = content.replace(/\s*: p\.restaurant_id === 'vilasa-cafe'\s*\?\s*'Vilasa Café'/g, '');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Cleaned admin-app/src/components/DeliveryPartnersModal.jsx');
  }
}
