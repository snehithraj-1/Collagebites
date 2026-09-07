-- Neon PostgreSQL Database Schema for CampusBites Food Ordering Platform

-- 1. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(50) PRIMARY KEY,
  student_name VARCHAR(255) NOT NULL,
  student_phone VARCHAR(20) NOT NULL,
  student_id VARCHAR(50),
  restaurant_id VARCHAR(100) NOT NULL,
  restaurant_name VARCHAR(255) NOT NULL,
  delivery_location TEXT NOT NULL,
  instructions TEXT,
  total_amount NUMERIC(10, 2) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED',
  items JSONB NOT NULL,
  cancelled_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- 2. Restaurant Statuses Table
CREATE TABLE IF NOT EXISTS restaurant_statuses (
  restaurant_id VARCHAR(100) PRIMARY KEY,
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Initial Seed Data for Restaurant Statuses
INSERT INTO restaurant_statuses (restaurant_id, status)
VALUES 
  ('local-home-kitchen', 'OPEN'),
  ('campus-delight-dhaba', 'OPEN')
ON CONFLICT (restaurant_id) DO NOTHING;

-- 5. Initial Seed Data for Master Ordering Setting
INSERT INTO system_settings (setting_key, setting_value)
VALUES 
  ('overall_ordering', 'true')
ON CONFLICT (setting_key) DO NOTHING;

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);
