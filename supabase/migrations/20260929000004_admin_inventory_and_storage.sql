-- ==============================================================================
-- PERLE NOIRE - ADMIN INVENTORY, METADATA & STORAGE MIGRATION
-- Adds stock_quantity to products, SEO metadata, inventory movements precision,
-- and configures Supabase Storage policies for 'jewelry-media'.
-- ==============================================================================

-- 1. ADD stock_quantity TO products (for products without variants)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS stock_quantity INT NOT NULL DEFAULT 0;

-- 2. ADD SEO METADATA FIELDS
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS meta_description TEXT;

ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS meta_description TEXT;

ALTER TABLE public.collections
ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- 3. AUDIT TRAIL PRECISION ON inventory_movements
ALTER TABLE public.inventory_movements
ADD COLUMN IF NOT EXISTS previous_quantity INT,
ADD COLUMN IF NOT EXISTS new_quantity INT;

-- 4. CREATE INDEXES FOR FAST STOCK & SEO LOOKUPS
CREATE INDEX IF NOT EXISTS idx_products_stock ON public.products(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_product_variants_stock ON public.product_variants(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_prod ON public.inventory_movements(product_id, created_at DESC);

-- 5. SUPABASE STORAGE BUCKET & RLS POLICIES FOR 'jewelry-media'
-- Ensure storage bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'jewelry-media',
    'jewelry-media',
    true,
    10485760, -- 10 MB in bytes
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

-- Storage Object Policies for jewelry-media
DROP POLICY IF EXISTS "Public can view jewelry media" ON storage.objects;
CREATE POLICY "Public can view jewelry media"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'jewelry-media');

DROP POLICY IF EXISTS "Admins can upload jewelry media" ON storage.objects;
CREATE POLICY "Admins can upload jewelry media"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'jewelry-media'
        AND public.is_admin()
    );

DROP POLICY IF EXISTS "Admins can update jewelry media" ON storage.objects;
CREATE POLICY "Admins can update jewelry media"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'jewelry-media'
        AND public.is_admin()
    )
    WITH CHECK (
        bucket_id = 'jewelry-media'
        AND public.is_admin()
    );

DROP POLICY IF EXISTS "Admins can delete jewelry media" ON storage.objects;
CREATE POLICY "Admins can delete jewelry media"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'jewelry-media'
        AND public.is_admin()
    );
