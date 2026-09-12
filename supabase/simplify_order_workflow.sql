-- ====================================================================
-- CAMPUSBITES: SIMPLIFIED ORDER WORKFLOW & DELIVERY PARTNER REMOVAL
-- ====================================================================

-- 1. Remove duplicate restaurant and menu records
DELETE FROM menu_items WHERE restaurant_id IN ('campus-delight', 'campus-delight-dhaba');
DELETE FROM restaurants WHERE id IN ('campus-delight', 'campus-delight-dhaba');

-- 2. Standardize canonical restaurant names and contact numbers
UPDATE restaurants 
SET name = 'CLG Bites', phone = '9989955833', updated_at = NOW() 
WHERE id = 'clg-bites-biryani-nation';

UPDATE restaurants 
SET phone = '9989955833', updated_at = NOW() 
WHERE id IN ('local-home-kitchen', 'vilasa-cafe');

-- 3. Enhance orders table with completion and cancellation timestamps
ALTER TABLE orders ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- 4. Simplify existing order statuses
UPDATE orders 
SET status = 'COMPLETED', completed_at = COALESCE(completed_at, updated_at, NOW())
WHERE status IN ('DELIVERED', 'OUT_FOR_DELIVERY', 'ASSIGNED', 'READY', 'PREPARING');

-- 5. Drop deprecated delivery partner references and policies
DROP POLICY IF EXISTS "Scoped select orders" ON orders;
DROP POLICY IF EXISTS "Scoped update orders" ON orders;
DROP POLICY IF EXISTS "Scoped select order items" ON order_items;

-- 5.1 Orders SELECT Policy (Students see own orders; Admins see their restaurant orders; Super Admin sees all)
CREATE POLICY "Scoped select orders"
  ON orders FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.is_super_admin()
    OR (restaurant_id = public.get_admin_restaurant_id())
  );

-- 5.2 Orders UPDATE Policy (Restaurant admins can mark COMPLETED or CANCELLED; Super Admin can manage all)
CREATE POLICY "Scoped update orders"
  ON orders FOR UPDATE
  USING (
    public.is_super_admin()
    OR (
      restaurant_id = public.get_admin_restaurant_id()
      AND status IN ('CONFIRMED', 'COMPLETED', 'CANCELLED')
    )
  );

-- 5.3 Order Items SELECT Policy
CREATE POLICY "Scoped select order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        orders.user_id = auth.uid()
        OR public.is_super_admin()
        OR orders.restaurant_id = public.get_admin_restaurant_id()
      )
    )
  );
