-- ==============================================================================
-- PERLE NOIRE - SECURITY HARDENING MIGRATION
-- Fixes search_path hijacking, strengthens RLS policies and adds WITH CHECK
-- ==============================================================================

-- 1. HARDEN is_admin() FUNCTION
-- Fix search_path hijacking vulnerability and restrict execution privileges
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    current_user_id UUID;
    is_active_admin BOOLEAN;
BEGIN
    current_user_id := auth.uid();
    IF current_user_id IS NULL THEN
        RETURN false;
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.admins
        WHERE user_id = current_user_id
          AND active = true
    ) INTO is_active_admin;

    RETURN COALESCE(is_active_admin, false);
END;
$$;

-- Restrict function execution: only authenticated users can evaluate is_admin()
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 2. HARDEN PUBLIC STOREFRONT POLICIES
-- A. Product Variants: Prevent leakage of variants belonging to draft or hidden products
DROP POLICY IF EXISTS "Public can view active variants" ON product_variants;
CREATE POLICY "Public can view active variants"
    ON product_variants FOR SELECT
    USING (
        active = true
        AND EXISTS (
            SELECT 1 FROM public.products
            WHERE products.id = product_variants.product_id
            AND products.status IN ('published', 'unique_piece', 'made_to_order', 'out_of_stock', 'coming_soon')
        )
    );

-- B. Contact Requests: Enforce validation constraints on public inserts
DROP POLICY IF EXISTS "Public can create contact requests" ON contact_requests;
CREATE POLICY "Public can create contact requests"
    ON contact_requests FOR INSERT
    WITH CHECK (
        name IS NOT NULL AND length(trim(name)) >= 2 AND
        email IS NOT NULL AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
        message IS NOT NULL AND length(trim(message)) >= 5
    );

-- C. Store Settings: Restrict public read to singleton id = 1
DROP POLICY IF EXISTS "Public can view active store settings" ON store_settings;
CREATE POLICY "Public can view active store settings"
    ON store_settings FOR SELECT
    USING (id = 1);

-- 3. HARDEN ALL ADMIN POLICIES WITH EXPLICIT 'WITH CHECK' CLAUSES
-- Prevents privilege bypass and unauthorized insertions

DROP POLICY IF EXISTS "Admins have full access to admins" ON admins;
CREATE POLICY "Admins have full access to admins"
    ON admins FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to categories" ON categories;
CREATE POLICY "Admins have full access to categories"
    ON categories FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to collections" ON collections;
CREATE POLICY "Admins have full access to collections"
    ON collections FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to products" ON products;
CREATE POLICY "Admins have full access to products"
    ON products FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to product_images" ON product_images;
CREATE POLICY "Admins have full access to product_images"
    ON product_images FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to product_variants" ON product_variants;
CREATE POLICY "Admins have full access to product_variants"
    ON product_variants FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to inventory_movements" ON inventory_movements;
CREATE POLICY "Admins have full access to inventory_movements"
    ON inventory_movements FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to customers" ON customers;
CREATE POLICY "Admins have full access to customers"
    ON customers FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to orders" ON orders;
CREATE POLICY "Admins have full access to orders"
    ON orders FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to order_items" ON order_items;
CREATE POLICY "Admins have full access to order_items"
    ON order_items FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to payments" ON payments;
CREATE POLICY "Admins have full access to payments"
    ON payments FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to contact_requests" ON contact_requests;
CREATE POLICY "Admins have full access to contact_requests"
    ON contact_requests FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to store_settings" ON store_settings;
CREATE POLICY "Admins have full access to store_settings"
    ON store_settings FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to homepage_sections" ON homepage_sections;
CREATE POLICY "Admins have full access to homepage_sections"
    ON homepage_sections FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to discount_codes" ON discount_codes;
CREATE POLICY "Admins have full access to discount_codes"
    ON discount_codes FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to media" ON media;
CREATE POLICY "Admins have full access to media"
    ON media FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to activity_logs" ON activity_logs;
CREATE POLICY "Admins have full access to activity_logs"
    ON activity_logs FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
