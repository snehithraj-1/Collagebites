-- ================================================================
-- CAMPUSBITES: ONE-CLICK SUPABASE COMPLETE SETUP SCRIPT
-- Version: 2.0 (Multi-Role Support & Strict Kitchen Isolation)
-- Run this in your Supabase SQL Editor to initialize or rebuild.
-- ================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================
-- 2. DROP EXISTING TABLES IF REBUILDING (IN CORRECT DEPENDENCY ORDER)
-- ================================================================
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS delivery_partners CASCADE;
DROP TABLE IF EXISTS admin_accounts CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ================================================================
-- 3. CREATE CORE TABLES
-- ================================================================

-- 3.1 Profiles Table (Linked to Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  student_id TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'super_admin', 'restaurant_admin', 'delivery_partner')),
  restaurant_id TEXT, -- Populated if role is 'restaurant_admin'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 Restaurants Table
CREATE TABLE restaurants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cuisine TEXT,
  image_url TEXT,
  is_open BOOLEAN DEFAULT TRUE,
  location TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.3 Menu Items Table
CREATE TABLE menu_items (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  category TEXT NOT NULL,
  is_veg BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  preparation_time TEXT DEFAULT '15-20 mins',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.4 Delivery Partners Table
CREATE TABLE delivery_partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  pin TEXT DEFAULT '1234',
  restaurant_id TEXT DEFAULT 'all', -- 'local-home-kitchen', 'clg-bites-biryani-nation', or 'all'
  is_active BOOLEAN DEFAULT TRUE,
  total_deliveries INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.5 System Settings Table (Master Platform Ordering Switch)
CREATE TABLE system_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  ordering_enabled BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.6 Orders Table
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_phone TEXT,
  student_id TEXT,
  delivery_location TEXT NOT NULL, -- e.g. "Ganga Hostel, Room 304"
  restaurant_id TEXT REFERENCES restaurants(id) ON DELETE SET NULL,
  restaurant_name TEXT,
  delivery_partner_id TEXT REFERENCES delivery_partners(id) ON DELETE SET NULL,
  delivery_partner_name TEXT,
  delivery_partner_phone TEXT,
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  status TEXT NOT NULL DEFAULT 'PENDING_CONFIRMATION' CHECK (
    status IN ('PENDING_CONFIRMATION', 'CONFIRMED', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'EXPIRED')
  ),
  instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  assigned_at TIMESTAMPTZ,
  out_for_delivery_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.7 Order Items Table (Stores captured price at time of purchase)
CREATE TABLE order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id TEXT REFERENCES menu_items(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.8 Admin Accounts Table (Credentials for Admin Portal Authentication)
CREATE TABLE admin_accounts (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'restaurant_admin')),
  restaurant_id TEXT REFERENCES restaurants(id) ON DELETE SET NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_partner ON orders(delivery_partner_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);

-- ================================================================
-- 4. PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone, student_id, role, restaurant_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'student_id',
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NEW.raw_user_meta_data->>'restaurant_id'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    student_id = COALESCE(EXCLUDED.student_id, profiles.student_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Helper Security Functions
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_admin_restaurant_id()
RETURNS TEXT AS $$
DECLARE
  v_restaurant_id TEXT;
BEGIN
  SELECT restaurant_id INTO v_restaurant_id
  FROM public.profiles
  WHERE id = auth.uid() AND role = 'restaurant_admin';
  RETURN v_restaurant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_accounts ENABLE ROW LEVEL SECURITY;

-- 5.1 Profiles Policies
CREATE POLICY "Users read own profile or super admin reads all"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR public.is_super_admin());

CREATE POLICY "Users update own profile without role elevation"
  ON profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_super_admin())
  WITH CHECK (
    (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()))
    OR public.is_super_admin()
  );

CREATE POLICY "Users insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_super_admin());

-- 5.2 Restaurants Policies
CREATE POLICY "Public read restaurants"
  ON restaurants FOR SELECT
  USING (true);

CREATE POLICY "Admins update restaurants"
  ON restaurants FOR UPDATE
  USING (
    public.is_super_admin() OR id = public.get_admin_restaurant_id()
  );

CREATE POLICY "Super admin insert restaurants"
  ON restaurants FOR INSERT
  WITH CHECK (public.is_super_admin());

CREATE POLICY "Super admin delete restaurants"
  ON restaurants FOR DELETE
  USING (public.is_super_admin());

-- 5.3 Menu Items Policies
CREATE POLICY "Public read menu items"
  ON menu_items FOR SELECT
  USING (true);

CREATE POLICY "Admins insert menu items"
  ON menu_items FOR INSERT
  WITH CHECK (
    public.is_super_admin() OR restaurant_id = public.get_admin_restaurant_id()
  );

CREATE POLICY "Admins update menu items"
  ON menu_items FOR UPDATE
  USING (
    public.is_super_admin() OR restaurant_id = public.get_admin_restaurant_id()
  );

CREATE POLICY "Admins delete menu items"
  ON menu_items FOR DELETE
  USING (
    public.is_super_admin() OR restaurant_id = public.get_admin_restaurant_id()
  );

-- 5.4 Delivery Partners Policies
CREATE POLICY "Admins view delivery partners"
  ON delivery_partners FOR SELECT
  USING (
    public.is_super_admin() 
    OR restaurant_id = 'all' 
    OR restaurant_id = public.get_admin_restaurant_id()
    OR id = auth.uid()::text
  );

CREATE POLICY "Admins manage delivery partners"
  ON delivery_partners FOR ALL
  USING (
    public.is_super_admin() OR restaurant_id = public.get_admin_restaurant_id()
  );

-- 5.5 System Settings Policies
CREATE POLICY "Public read system settings"
  ON system_settings FOR SELECT
  USING (true);

CREATE POLICY "Super admin update system settings"
  ON system_settings FOR UPDATE
  USING (public.is_super_admin());

-- 5.6 Orders Policies (STRICT MULTI-ROLE ISOLATION)
CREATE POLICY "Scoped select orders"
  ON orders FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.is_super_admin()
    OR (restaurant_id = public.get_admin_restaurant_id())
    OR (delivery_partner_id = auth.uid()::text)
  );

CREATE POLICY "Students insert orders"
  ON orders FOR INSERT
  WITH CHECK (
    (auth.uid() = user_id OR user_id IS NULL)
    AND (
      SELECT ordering_enabled FROM system_settings WHERE id = 'global'
    ) = true
    AND (
      SELECT is_open FROM restaurants WHERE id = orders.restaurant_id
    ) = true
  );

CREATE POLICY "Scoped update orders"
  ON orders FOR UPDATE
  USING (
    (auth.uid() = user_id AND status IN ('PENDING_CONFIRMATION', 'CONFIRMED'))
    OR public.is_super_admin()
    OR (restaurant_id = public.get_admin_restaurant_id())
    OR (delivery_partner_id = auth.uid()::text)
  );

CREATE POLICY "Admins delete orders"
  ON orders FOR DELETE
  USING (
    public.is_super_admin() OR (restaurant_id = public.get_admin_restaurant_id())
  );

-- 5.7 Order Items Policies
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
        OR orders.delivery_partner_id = auth.uid()::text
      )
    )
  );

CREATE POLICY "Insert order items for valid order"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR public.is_super_admin())
    )
  );

-- 5.8 Admin Accounts Policies
CREATE POLICY "Super admin manage admin accounts"
  ON admin_accounts FOR ALL
  USING (public.is_super_admin());

-- ================================================================
-- 6. REALTIME REPLICATION CONFIGURATION
-- ================================================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  ALTER PUBLICATION supabase_realtime ADD TABLE restaurants;
  ALTER PUBLICATION supabase_realtime ADD TABLE system_settings;
  ALTER PUBLICATION supabase_realtime ADD TABLE delivery_partners;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ================================================================
-- 7. SEED DATA (AUTHENTIC RESTAURANTS & MENUS)
-- ================================================================

-- Initial System Settings
INSERT INTO system_settings (id, ordering_enabled, updated_at)
VALUES ('global', TRUE, NOW())
ON CONFLICT (id) DO UPDATE SET ordering_enabled = TRUE;

-- 7.1 Seed Authentic Restaurants
INSERT INTO restaurants (id, name, description, cuisine, image_url, is_open, location, phone)
VALUES 
(
  'local-home-kitchen',
  'Local Home Kitchen',
  'Trust it, Taste it — Fast Food & Biryani''s. Authentic Homestyle Campus Meals in Neerukonda Village.',
  'Fast Food & Biryani''s',
  'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=80',
  TRUE,
  'Beside Ayyappa PG Hostel, Neerukonda',
  '9989955833'
),
(
  'clg-bites-biryani-nation',
  'Clg Bites Biryani Nation',
  'A Taste You''ll Love... Fresh, Delicious Biryanis with Special Campus Student Discounts!',
  'Chicken & Veg Biryanis',
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80',
  TRUE,
  'Neerukonda Campus Hub, SRM University AP',
  '9989955833'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  cuisine = EXCLUDED.cuisine,
  image_url = EXCLUDED.image_url,
  is_open = EXCLUDED.is_open,
  location = EXCLUDED.location,
  phone = EXCLUDED.phone;

-- 7.2 Seed Delivery Partners
INSERT INTO delivery_partners (id, name, phone, pin, restaurant_id, is_active, total_deliveries)
VALUES
  ('dp-suresh', 'Suresh Reddy', '9398414231', '1234', 'local-home-kitchen', TRUE, 14),
  ('dp-rajesh', 'Rajesh Kumar', '8240756887', '1234', 'clg-bites-biryani-nation', TRUE, 18),
  ('dp-manoj', 'Manoj Varma', '8247840765', '1234', 'all', TRUE, 9)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  restaurant_id = EXCLUDED.restaurant_id,
  is_active = EXCLUDED.is_active;

-- 7.3 Seed Menu Items: Local Home Kitchen
INSERT INTO menu_items (id, restaurant_id, name, description, price, category, is_veg, is_available)
VALUES
  ('lhk-cb-1', 'local-home-kitchen', 'Chicken Dum Biryani', 'Aromatic basmati rice cooked with tender marinated chicken and authentic spices.', 170, 'Biryani', FALSE, TRUE),
  ('lhk-cb-2', 'local-home-kitchen', 'Chicken Fry Biryani', 'Special flavored biryani rice topped with crispy spiced chicken fry.', 190, 'Biryani', FALSE, TRUE),
  ('lhk-cb-3', 'local-home-kitchen', 'Chicken Boneless Biryani', 'Flavorful biryani served with succulent boneless chicken cubes.', 240, 'Biryani', FALSE, TRUE),
  ('lhk-cb-4', 'local-home-kitchen', 'Chicken 65 Biryani', 'Classic biryani paired with spicy, tangy South Indian Chicken 65.', 220, 'Biryani', FALSE, TRUE),
  ('lhk-cb-5', 'local-home-kitchen', 'Chicken Lollipop Biryani', 'Served with 4 crispy chicken lollipops over fragrant biryani.', 250, 'Biryani', FALSE, TRUE),
  ('lhk-cb-7', 'local-home-kitchen', 'Mushroom Biryani', 'Fresh button mushrooms tossed with herbs in biryani rice.', 220, 'Biryani', TRUE, TRUE),
  ('lhk-cb-9', 'local-home-kitchen', 'Paneer Biryani', 'Soft paneer cubes tossed in rich biryani spices and saffron rice.', 220, 'Biryani', TRUE, TRUE),
  ('lhk-sv-1', 'local-home-kitchen', 'Veg Manchurian', 'Golden vegetable dumplings tossed in tangy soya-garlic gravy.', 80, 'Starters', TRUE, TRUE),
  ('lhk-sv-2', 'local-home-kitchen', 'Paneer Manchurian', 'Crispy cottage cheese tossed in spicy Indo-Chinese sauce.', 180, 'Starters', TRUE, TRUE),
  ('lhk-sc-1', 'local-home-kitchen', 'Chicken Manchuria', 'Deep fried chicken balls coated with spicy garlic sauce.', 180, 'Starters', FALSE, TRUE),
  ('lhk-sc-2', 'local-home-kitchen', 'Chicken 65', 'Curry leaf and mustard infused Andhra-style spicy fried chicken.', 200, 'Starters', FALSE, TRUE),
  ('lhk-sc-3', 'local-home-kitchen', 'Chilli Chicken', 'Diced chicken tossed with capsicum, green chillies, and soy glaze.', 200, 'Starters', FALSE, TRUE),
  ('lhk-sc-7', 'local-home-kitchen', 'Pepper Chicken', 'Crushed black pepper roasted chicken with caramelised onions.', 230, 'Starters', FALSE, TRUE),
  ('lhk-fr-1', 'local-home-kitchen', 'Chicken Fried Rice', 'Wok-tossed rice with egg ribbons, shredded chicken, and spring onion.', 120, 'Rice & Noodles', FALSE, TRUE),
  ('lhk-fr-5', 'local-home-kitchen', 'Veg Fried Rice', 'Stir-fried rice with fine chopped beans, carrot, cabbage, and light seasoning.', 80, 'Rice & Noodles', TRUE, TRUE),
  ('lhk-fr-8', 'local-home-kitchen', 'Egg Fried Rice', 'Wholesome wok-tossed rice packed with eggs and white pepper.', 120, 'Rice & Noodles', FALSE, TRUE),
  ('lhk-nd-1', 'local-home-kitchen', 'Chicken Noodles', 'Hakka noodles stir fried with julienne chicken and crunchy vegetables.', 120, 'Rice & Noodles', FALSE, TRUE),
  ('lhk-nd-5', 'local-home-kitchen', 'Veg Hakka Noodles', 'Long wok-tossed wheat noodles with crunchy veggies and light soya.', 80, 'Rice & Noodles', TRUE, TRUE)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  is_veg = EXCLUDED.is_veg;

-- 7.4 Seed Menu Items: Clg Bites Biryani Nation
INSERT INTO menu_items (id, restaurant_id, name, description, price, category, is_veg, is_available)
VALUES
  ('cbn-chk-dum-s', 'clg-bites-biryani-nation', 'Chicken Dum Biryani (Single)', 'Authentic slow-cooked dum biryani with marinated chicken and fragrant basmati rice.', 190, 'Chicken Biryani', FALSE, TRUE),
  ('cbn-chk-dum-f', 'clg-bites-biryani-nation', 'Chicken Dum Biryani (Full)', 'Full portion Hyderabadi dum biryani with juicy chicken pieces, boiled egg & salan.', 260, 'Chicken Biryani', FALSE, TRUE),
  ('cbn-chk-fry-s', 'clg-bites-biryani-nation', 'Chicken Fry Biryani (Single)', 'Crispy Andhra spiced chicken fry served generously over flavorful dum biryani rice.', 200, 'Chicken Biryani', FALSE, TRUE),
  ('cbn-chk-fry-f', 'clg-bites-biryani-nation', 'Chicken Fry Biryani (Full)', 'Large serving of spicy roasted chicken fry pieces over seasoned ghee biryani rice.', 270, 'Chicken Biryani', FALSE, TRUE),
  ('cbn-chk-bone-s', 'clg-bites-biryani-nation', 'Chicken Boneless Biryani (Single)', 'Tender boneless chicken cubes tossed in rich spices layered with fragrant biryani.', 210, 'Chicken Biryani', FALSE, TRUE),
  ('cbn-chk-bone-f', 'clg-bites-biryani-nation', 'Chicken Boneless Biryani (Full)', 'Full generous portion of boneless chicken bites with spicy caramelized onion biryani.', 290, 'Chicken Biryani', FALSE, TRUE),
  ('cbn-chk-lol-s', 'clg-bites-biryani-nation', 'Chicken Lollipop Biryani (Single)', 'Crisp seasoned chicken lollipops paired with hot dum biryani rice and raita.', 210, 'Chicken Biryani', FALSE, TRUE),
  ('cbn-chk-lol-f', 'clg-bites-biryani-nation', 'Chicken Lollipop Biryani (Full)', 'Family size aromatic biryani crowned with multiple spicy chicken lollipops.', 290, 'Chicken Biryani', FALSE, TRUE),
  ('cbn-veg-dum-s', 'clg-bites-biryani-nation', 'Veg Dum Biryani (Single)', 'Fragrant basmati rice layered with fresh farm vegetables, mint, and saffron.', 150, 'Veg Biryani', TRUE, TRUE),
  ('cbn-veg-dum-f', 'clg-bites-biryani-nation', 'Veg Dum Biryani (Full)', 'Generous full portion of traditional vegetables and paneer dum biryani.', 210, 'Veg Biryani', TRUE, TRUE),
  ('cbn-pan-bir-s', 'clg-bites-biryani-nation', 'Paneer Biryani (Single)', 'Succulent marinated cottage cheese cubes tossed in spicy biryani masala.', 170, 'Veg Biryani', TRUE, TRUE),
  ('cbn-pan-bir-f', 'clg-bites-biryani-nation', 'Paneer Biryani (Full)', 'Grand serving of saffron paneer biryani served with mirchi salan and curd raita.', 240, 'Veg Biryani', TRUE, TRUE)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  is_veg = EXCLUDED.is_veg;

-- ================================================================
-- SETUP COMPLETE!
-- Your Supabase database is now completely initialized for:
-- 1. Student Portal (Email OTP Auth, Order Creation, Personal History)
-- 2. Local Home Kitchen Admin (Scoped strictly to 'local-home-kitchen')
-- 3. CLG Bites Admin (Scoped strictly to 'clg-bites-biryani-nation')
-- 4. Delivery Partner App (Scoped to assigned rider orders)
-- 5. Super Admin Portal (Full platform control & Master toggles)
-- ================================================================
