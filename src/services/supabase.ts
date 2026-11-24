import { createClient } from '@supabase/supabase-js';

// Configuration can be provided via environment variables or settings UI
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Complete PostgreSQL / Supabase Schema for production deployment
export const SUPABASE_SQL_SCHEMA = `-- =========================================================================
-- BIZTRACK – COMPLETE POSTGRESQL & SUPABASE DATABASE SCHEMA
-- Production-ready schema with Row Level Security (RLS) and Audit Logging
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BUSINESS PROFILES
CREATE TABLE IF NOT EXISTS business_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    logo_url TEXT,
    currency VARCHAR(10) DEFAULT '₹',
    distribution_start_day INT DEFAULT 1,
    distribution_end_day INT DEFAULT 5,
    daily_reminder_time TIME DEFAULT '08:30:00',
    enable_web_push BOOLEAN DEFAULT true,
    low_stock_global_threshold INT DEFAULT 20,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SHOPS
CREATE TABLE IF NOT EXISTS shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    locality VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    google_maps_url TEXT,
    photo_url TEXT,
    instructions TEXT,
    notes TEXT,
    preferred_delivery_date INT CHECK (preferred_delivery_date BETWEEN 1 AND 31),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CHOCOLATE PRODUCTS
CREATE TABLE IF NOT EXISTS chocolate_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    brand_name VARCHAR(100) NOT NULL,
    flavour_name VARCHAR(255) NOT NULL,
    box_description TEXT,
    photo_url TEXT,
    internal_code VARCHAR(100),
    notes TEXT,
    unit_cost DECIMAL(10, 2) DEFAULT 0,
    unit_price DECIMAL(10, 2) DEFAULT 0,
    is_discontinued BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCT INVENTORY
CREATE TABLE IF NOT EXISTS product_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID UNIQUE REFERENCES chocolate_products(id) ON DELETE CASCADE,
    available_boxes INT NOT NULL DEFAULT 0 CHECK (available_boxes >= 0),
    low_stock_threshold INT NOT NULL DEFAULT 20,
    last_restocked_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MONTHLY DISTRIBUTION PLANS
CREATE TABLE IF NOT EXISTS monthly_distribution_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    is_confirmed BOOLEAN DEFAULT false,
    confirmed_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, month, year)
);

-- 6. SHOP FLAVOUR ASSIGNMENTS
CREATE TABLE IF NOT EXISTS shop_flavour_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID REFERENCES monthly_distribution_plans(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    product_id UUID REFERENCES chocolate_products(id) ON DELETE RESTRICT,
    assigned_boxes INT NOT NULL CHECK (assigned_boxes > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(plan_id, shop_id, product_id)
);

-- 7. DISTRIBUTION TRANSACTIONS
CREATE TABLE IF NOT EXISTS distribution_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID REFERENCES monthly_distribution_plans(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    product_id UUID REFERENCES chocolate_products(id) ON DELETE RESTRICT,
    boxes_delivered INT NOT NULL CHECK (boxes_delivered > 0),
    delivery_date TIMESTAMPTZ DEFAULT NOW(),
    delivery_status VARCHAR(50) DEFAULT 'completed',
    notes TEXT,
    recorded_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. INVENTORY TRANSACTIONS
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES chocolate_products(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'purchase_add', 'distribution_deduct', 'adjustment', 'return'
    quantity_change INT NOT NULL,
    balance_after INT NOT NULL,
    reference_id VARCHAR(100),
    notes TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 9. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
    product_id UUID REFERENCES chocolate_products(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES monthly_distribution_plans(id) ON DELETE CASCADE,
    invoice_amount DECIMAL(10, 2) NOT NULL,
    amount_received DECIMAL(10, 2) NOT NULL,
    outstanding_amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    payment_method VARCHAR(50) DEFAULT 'upi',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. EXPENSES
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE chocolate_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_distribution_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_flavour_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Production Security Policies (Owner access)
CREATE POLICY "Users can manage their business profile"
    ON business_profiles FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can access their shops"
    ON shops FOR ALL
    USING (business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their products"
    ON chocolate_products FOR ALL
    USING (business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their monthly plans"
    ON monthly_distribution_plans FOR ALL
    USING (business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()));
`;
