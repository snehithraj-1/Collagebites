-- ================================================================
-- CAMPUSBITES: ONE-CLICK SUPABASE COMPLETE SETUP SCRIPT
-- Copy and run this entire script in your Supabase SQL Editor.
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
  student_id TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 Restaurants Table
CREATE TABLE restaurants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_open BOOLEAN DEFAULT TRUE,
  location TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.4 System Settings Table (Master Ordering Switch)
CREATE TABLE system_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  ordering_enabled BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.5 Orders Table
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_id TEXT,
  student_phone TEXT,
  delivery_location TEXT NOT NULL, -- e.g. "Ganga Hostel, Room 304"
  restaurant_id TEXT REFERENCES restaurants(id) ON DELETE SET NULL,
  restaurant_name TEXT,
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  status TEXT NOT NULL DEFAULT 'PENDING_CONFIRMATION' CHECK (
    status IN ('PENDING_CONFIRMATION', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'EXPIRED')
  ),
  instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

-- 3.6 Order Items Table
CREATE TABLE order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id TEXT REFERENCES menu_items(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);

-- ================================================================
-- 4. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, student_id, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'student_id', NULL),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    student_id = COALESCE(EXCLUDED.student_id, profiles.student_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 5.1 Profiles Policies
CREATE POLICY "Public profiles are viewable by self or admin"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile or admin can update"
  ON profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- 5.2 Restaurants Policies (Students can read, only Admin can write)
CREATE POLICY "Anyone can view restaurants"
  ON restaurants FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert restaurants"
  ON restaurants FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update restaurants"
  ON restaurants FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete restaurants"
  ON restaurants FOR DELETE
  USING (public.is_admin());

-- 5.3 Menu Items Policies (Students can read, only Admin can write)
CREATE POLICY "Anyone can view menu items"
  ON menu_items FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert menu items"
  ON menu_items FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update menu items"
  ON menu_items FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete menu items"
  ON menu_items FOR DELETE
  USING (public.is_admin());

-- 5.4 System Settings Policies (Anyone can read, only Admin can update)
CREATE POLICY "Anyone can view system settings"
  ON system_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can update system settings"
  ON system_settings FOR UPDATE
  USING (public.is_admin());

-- 5.5 Orders Policies
-- Student can ONLY see their own orders; Admin can see all orders
CREATE POLICY "Students see own orders; Admins see all"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Authenticated students can insert an order if ordering is enabled
CREATE POLICY "Students can insert own orders"
  ON orders FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND (
      SELECT ordering_enabled FROM system_settings WHERE id = 'global'
    ) = true
  );

-- Student can confirm or cancel their own order during 30s confirmation window; Admin can update any status
CREATE POLICY "Students update own orders; Admins update all"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

-- Only Admins can permanently delete orders
CREATE POLICY "Only Admins can delete orders"
  ON orders FOR DELETE
  USING (public.is_admin());

-- 5.6 Order Items Policies
CREATE POLICY "Users view order items for viewable orders"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users insert order items for own orders"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Only Admins can delete order items"
  ON order_items FOR DELETE
  USING (public.is_admin());

-- ================================================================
-- 6. REALTIME REPLICATION CONFIGURATION
-- ================================================================
-- Add tables to the supabase_realtime publication
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  ALTER PUBLICATION supabase_realtime ADD TABLE restaurants;
  ALTER PUBLICATION supabase_realtime ADD TABLE system_settings;
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- Already published
END $$;

-- ================================================================
-- 7. SEED DATA (RESTAURANTS, MENU ITEMS, SYSTEM SETTINGS)
-- ================================================================

-- Initial System Settings
INSERT INTO system_settings (id, ordering_enabled, updated_at)
VALUES ('global', TRUE, NOW())
ON CONFLICT (id) DO UPDATE SET ordering_enabled = TRUE;

-- 7.1 Seed Two Authentic Campus Restaurants
INSERT INTO restaurants (id, name, description, image_url, is_open, location, phone)
VALUES 
(
  'local-home-kitchen',
  'Local Home Kitchen',
  'Authentic Homestyle South Indian Meals, Spicy Biryanis & Curries in Neerukonda Village.',
  'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=80',
  TRUE,
  'Beside Ayyappa PG Hostel, Neerukonda',
  '9989955833'
),
(
  'campus-delight-dhaba',
  'Campus Delight Kitchen',
  'North Indian Specialties, Thalis, Fresh Rotis & Snacks at Campus Main Gate.',
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80',
  TRUE,
  'Opposite University South Gate, Neerukonda',
  '9848022338'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  is_open = EXCLUDED.is_open;

-- 7.2 Seed Menu Items for Local Home Kitchen
INSERT INTO menu_items (id, restaurant_id, name, description, price, category, is_veg, is_available)
VALUES
-- Chicken Biryani
('lhk-cb-1', 'local-home-kitchen', 'Chicken Dum Biryani', 'Aromatic basmati rice cooked with tender marinated chicken and authentic spices.', 170, 'Biryani', FALSE, TRUE),
('lhk-cb-2', 'local-home-kitchen', 'Chicken Fry Biryani', 'Special flavored biryani rice topped with crispy spiced chicken fry.', 190, 'Biryani', FALSE, TRUE),
('lhk-cb-3', 'local-home-kitchen', 'Chicken Boneless Biryani', 'Flavorful biryani served with succulent boneless chicken cubes.', 240, 'Biryani', FALSE, TRUE),
('lhk-cb-4', 'local-home-kitchen', 'Chicken 65 Biryani', 'Classic biryani paired with spicy, tangy South Indian Chicken 65.', 220, 'Biryani', FALSE, TRUE),
('lhk-cb-5', 'local-home-kitchen', 'Chicken Lollipop Biryani', 'Served with 4 crispy chicken lollipops over fragrant biryani.', 250, 'Biryani', FALSE, TRUE),
('lhk-cb-7', 'local-home-kitchen', 'Mushroom Biryani', 'Fresh button mushrooms tossed with herbs in biryani rice.', 220, 'Biryani', TRUE, TRUE),
('lhk-cb-9', 'local-home-kitchen', 'Paneer Biryani', 'Soft paneer cubes tossed in rich biryani spices and saffron rice.', 220, 'Biryani', TRUE, TRUE),

-- Starters
('lhk-sv-1', 'local-home-kitchen', 'Veg Manchurian', 'Golden vegetable dumplings tossed in tangy soya-garlic gravy.', 80, 'Starters', TRUE, TRUE),
('lhk-sv-2', 'local-home-kitchen', 'Paneer Manchurian', 'Crispy cottage cheese tossed in spicy Indo-Chinese sauce.', 180, 'Starters', TRUE, TRUE),
('lhk-sc-1', 'local-home-kitchen', 'Chicken Manchuria', 'Deep fried chicken balls coated with spicy garlic sauce.', 180, 'Starters', FALSE, TRUE),
('lhk-sc-2', 'local-home-kitchen', 'Chicken 65', 'Curry leaf and mustard infused Andhra-style spicy fried chicken.', 200, 'Starters', FALSE, TRUE),
('lhk-sc-3', 'local-home-kitchen', 'Chilli Chicken', 'Diced chicken tossed with capsicum, green chillies, and soy glaze.', 200, 'Starters', FALSE, TRUE),
('lhk-sc-7', 'local-home-kitchen', 'Pepper Chicken', 'Crushed black pepper roasted chicken with caramelised onions.', 230, 'Starters', FALSE, TRUE),

-- Fried Rice & Noodles
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

-- 7.3 Seed Menu Items for Campus Delight Kitchen
INSERT INTO menu_items (id, restaurant_id, name, description, price, category, is_veg, is_available)
VALUES
('cd-cur-1', 'campus-delight-dhaba', 'Paneer Butter Masala', 'Rich tomato and cashew nut gravy with succulent fresh cottage cheese.', 180, 'Curries', TRUE, TRUE),
('cd-cur-2', 'campus-delight-dhaba', 'Dal Tadka Dhaba Style', 'Yellow lentils tempered with ghee, cumin, garlic, and red chilies.', 110, 'Curries', TRUE, TRUE),
('cd-cur-3', 'campus-delight-dhaba', 'Butter Chicken Masala', 'Charcoal-grilled chicken simmered in a silky, creamy butter tomato sauce.', 210, 'Curries', FALSE, TRUE),
('cd-rot-1', 'campus-delight-dhaba', 'Butter Naan (2 pcs)', 'Fresh clay-tandoor flatbread brushed with aromatic butter.', 60, 'Breads', TRUE, TRUE),
('cd-rot-2', 'campus-delight-dhaba', 'Tandoori Roti (3 pcs)', 'Healthy whole wheat flatbread baked in traditional tandoor.', 45, 'Breads', TRUE, TRUE),
('cd-tha-1', 'campus-delight-dhaba', 'Executive Veg Thali', 'Paneer curry, Dal Tadka, 2 Rotis, Jeera Rice, Curd, and Sweet.', 160, 'Thalis', TRUE, TRUE),
('cd-tha-2', 'campus-delight-dhaba', 'Deluxe Chicken Thali', 'Chicken curry, Egg fry, 2 Rotis, Biryani rice, Salad, and Raita.', 220, 'Thalis', FALSE, TRUE),
('cd-bev-1', 'campus-delight-dhaba', 'Sweet Punjabi Lassi', 'Chilled churned yogurt drink topped with malai and cardamom.', 50, 'Beverages', TRUE, TRUE)

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  is_veg = EXCLUDED.is_veg;

-- ================================================================
-- SETUP COMPLETE!
-- Your Supabase database is now completely initialized for:
-- 1. Student Portal (Email OTP Auth, Realtime updates, Order History)
-- 2. Admin Portal (Master ON/OFF, Restaurant toggles, Orders Board)
-- ================================================================
