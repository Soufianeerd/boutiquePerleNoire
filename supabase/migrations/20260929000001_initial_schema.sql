-- ==============================================================================
-- PERLE NOIRE - LUXURY JEWELRY PLATFORM
-- Initial Schema Migration
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. ENUMS & DOMAINS
-- ------------------------------------------------------------------------------

DO $$ BEGIN
    CREATE TYPE product_status AS ENUM (
        'draft',
        'published',
        'hidden',
        'out_of_stock',
        'coming_soon',
        'made_to_order',
        'unique_piece'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE product_sell_mode AS ENUM (
        'inherit',
        'online',
        'contact_only'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE contact_method AS ENUM (
        'contact_form',
        'whatsapp',
        'phone',
        'email'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM (
        'pending',
        'paid',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM (
        'pending',
        'authorized',
        'succeeded',
        'failed',
        'refunded'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE admin_role AS ENUM (
        'super_admin',
        'admin',
        'manager',
        'editor'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ------------------------------------------------------------------------------
-- 2. CORE TABLES
-- ------------------------------------------------------------------------------

-- Admins Table (linked to Supabase Auth users)
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE, -- References auth.users(id) in Supabase
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role admin_role NOT NULL DEFAULT 'admin',
    active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    hero_url TEXT,
    position INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Collections Table (e.g., Haute Joaillerie, L'Éclat Noir, Renaissance)
CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    hero_url TEXT,
    position INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    short_description VARCHAR(500),
    sku VARCHAR(100) UNIQUE,
    base_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    compare_at_price NUMERIC(12, 2),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
    status product_status NOT NULL DEFAULT 'draft',
    featured BOOLEAN NOT NULL DEFAULT false,
    sell_mode product_sell_mode NOT NULL DEFAULT 'inherit',
    material_details VARCHAR(255), -- e.g., "Or Jaune 18K (750/1000)"
    gemstone_details VARCHAR(255), -- e.g., "Perle de Tahiti 11mm & Diamants F-VS"
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Product Images Table
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt VARCHAR(255) NOT NULL,
    position INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Product Variants Table (sizes, gold finishes, stones)
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    price NUMERIC(12, 2) NOT NULL,
    size VARCHAR(50),
    material VARCHAR(100),
    color VARCHAR(100),
    stock_quantity INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Inventory Movements Table (Audit trail for stock)
CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    change_amount INT NOT NULL,
    reason VARCHAR(100) NOT NULL, -- 'restock', 'sale', 'adjustment', 'return', 'initial'
    reference_id VARCHAR(100), -- Order ID or supplier reference
    created_by UUID REFERENCES admins(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    postal_code VARCHAR(20),
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'France',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    guest_email VARCHAR(255),
    guest_name VARCHAR(255),
    guest_phone VARCHAR(50),
    shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
    billing_address JSONB NOT NULL DEFAULT '{}'::jsonb,
    status order_status NOT NULL DEFAULT 'pending',
    payment_status payment_status NOT NULL DEFAULT 'pending',
    subtotal_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    shipping_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    variant_title VARCHAR(255),
    sku VARCHAR(100),
    price NUMERIC(12, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL DEFAULT 'stripe',
    provider_payment_id VARCHAR(255),
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
    status payment_status NOT NULL DEFAULT 'pending',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Contact Requests & Bespoke Inquiries Table
CREATE TABLE IF NOT EXISTS contact_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    preferred_channel contact_method NOT NULL DEFAULT 'contact_form',
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'new', -- 'new', 'in_progress', 'answered', 'closed'
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Store Settings Table (Singleton record id = 1)
CREATE TABLE IF NOT EXISTS store_settings (
    id INT PRIMARY KEY DEFAULT 1,
    brand_name VARCHAR(255) NOT NULL DEFAULT 'Perle Noire Joaillerie',
    tagline VARCHAR(255) DEFAULT 'Haute Joaillerie & Créations d''Exception',
    logo_url TEXT,
    contact_email VARCHAR(255) NOT NULL DEFAULT 'atelier@perlenoire-joaillerie.com',
    phone VARCHAR(50) DEFAULT '+33 1 42 68 55 00',
    whatsapp VARCHAR(50) DEFAULT '+33 6 12 34 56 78',
    instagram_url VARCHAR(255) DEFAULT 'https://instagram.com/perlenoirejoaillerie',
    address TEXT DEFAULT '18 Place Vendôme, 75001 Paris, France',
    
    -- Crucial Modes
    commerce_enabled BOOLEAN NOT NULL DEFAULT false, -- Vitrine (false) vs E-Commerce (true)
    show_prices BOOLEAN NOT NULL DEFAULT true,      -- Price visible even in vitrine mode
    allow_guest_checkout BOOLEAN NOT NULL DEFAULT true,
    
    default_contact_method contact_method NOT NULL DEFAULT 'whatsapp',
    currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
    locale VARCHAR(10) NOT NULL DEFAULT 'fr-FR',
    
    stripe_enabled BOOLEAN NOT NULL DEFAULT false,
    paypal_enabled BOOLEAN NOT NULL DEFAULT false,
    
    low_stock_threshold INT NOT NULL DEFAULT 2,
    maintenance_mode BOOLEAN NOT NULL DEFAULT false,
    
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT singleton_check CHECK (id = 1)
);

-- Homepage Sections Table (Dynamic visual storytelling)
CREATE TABLE IF NOT EXISTS homepage_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_type VARCHAR(50) NOT NULL, -- 'hero', 'categories', 'featured_products', 'collection_banner', 'new_arrivals', 'editorial', 'reassurance', 'newsletter', 'instagram', 'custom'
    title VARCHAR(255),
    subtitle VARCHAR(255),
    position INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Discount Codes Table
CREATE TABLE IF NOT EXISTS discount_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage', -- 'percentage', 'fixed_amount'
    discount_value NUMERIC(10, 2) NOT NULL,
    min_order_amount NUMERIC(10, 2) DEFAULT 0.00,
    max_uses INT,
    current_uses INT NOT NULL DEFAULT 0,
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Media Storage Table
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    alt_text VARCHAR(255),
    bucket VARCHAR(100) NOT NULL DEFAULT 'jewelry-media',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Administrative Audit Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- e.g., 'update_settings', 'toggle_commerce_mode', 'create_product'
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 3. INDEXES
-- ------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_pos ON homepage_sections(position, active);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper: Check if current auth user is an active admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admins
        WHERE user_id = auth.uid() AND active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public Storefront Policies: Read published items
CREATE POLICY "Public can view active store settings"
    ON store_settings FOR SELECT
    USING (true);

CREATE POLICY "Public can view active categories"
    ON categories FOR SELECT
    USING (active = true);

CREATE POLICY "Public can view active collections"
    ON collections FOR SELECT
    USING (active = true);

CREATE POLICY "Public can view published products"
    ON products FOR SELECT
    USING (status IN ('published', 'unique_piece', 'made_to_order', 'out_of_stock', 'coming_soon'));

CREATE POLICY "Public can view product images"
    ON product_images FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM products
        WHERE products.id = product_images.product_id
        AND products.status IN ('published', 'unique_piece', 'made_to_order', 'out_of_stock', 'coming_soon')
    ));

CREATE POLICY "Public can view active variants"
    ON product_variants FOR SELECT
    USING (active = true);

CREATE POLICY "Public can view active homepage sections"
    ON homepage_sections FOR SELECT
    USING (active = true);

CREATE POLICY "Public can create contact requests"
    ON contact_requests FOR INSERT
    WITH CHECK (true);

-- Admin Policies: Full CRUD for authenticated administrators
CREATE POLICY "Admins have full access to admins"
    ON admins FOR ALL
    USING (is_admin());

CREATE POLICY "Admins have full access to categories"
    ON categories FOR ALL
    USING (is_admin());

CREATE POLICY "Admins have full access to collections"
    ON collections FOR ALL
    USING (is_admin());

CREATE POLICY "Admins have full access to products"
    ON products FOR ALL
    USING (is_admin());

CREATE POLICY "Admins have full access to product_images"
    ON product_images FOR ALL
    USING (is_admin());

CREATE POLICY "Admins have full access to product_variants"
    ON product_variants FOR ALL
    USING (is_admin());

CREATE POLICY "Admins have full access to inventory_movements"
    ON inventory_movements FOR ALL
    USING (is_admin());

CREATE POLICY "Admins have full access to customers"
    ON customers FOR ALL
    USING (is_admin());

CREATE POLICY "Admins have full access to orders"
    ON orders FOR ALL
    USING (is_admin());

CREATE POLICY "Admins have full access to order_items"
    ON order_items FOR ALL
    USING (is_admin());

CREATE POLICY "Admins have full access to payments"
    ON payments FOR ALL
    USING (is_admin());

CREATE POLICY "Admins have full access to contact_requests"
    ON contact_requests FOR ALL
    USING (is_admin());

CREATE POLICY "Admins have full access to store_settings"
    ON store_settings FOR ALL
    USING (is_admin());

CREATE POLICY "Admins have full access to homepage_sections"
    ON homepage_sections FOR ALL
    USING (is_admin());

CREATE POLICY "Admins have full access to discount_codes"
    ON discount_codes FOR ALL
    USING (is_admin());

CREATE POLICY "Admins have full access to media"
    ON media FOR ALL
    USING (is_admin());

CREATE POLICY "Admins have full access to activity_logs"
    ON activity_logs FOR ALL
    USING (is_admin());
