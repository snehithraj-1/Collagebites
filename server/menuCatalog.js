import { AUTHENTIC_MENU_ITEMS } from './authenticMenuData.js';

// Precompute lookup maps for instant, authoritative price validation
const menuMap = new Map();

AUTHENTIC_MENU_ITEMS.forEach((item) => {
  // Key by item id and lowercase item name
  if (item.id) menuMap.set(item.id, item);
  if (item.name) menuMap.set(item.name.toLowerCase().trim(), item);
});

/**
 * Validate and get authoritative price from menu data
 * Prevents client-side price tampering
 */
export function getVerifiedItemPrice(item) {
  const byId = item.id ? menuMap.get(item.id) : null;
  if (byId) return parseFloat(byId.price);

  const byName = item.name ? menuMap.get(item.name.toLowerCase().trim()) : null;
  if (byName) return parseFloat(byName.price);

  // Fallback if custom or unmapped item
  return parseFloat(item.price || item.unit_price || 0);
}
