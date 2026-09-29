-- ==============================================================================
-- PERLE NOIRE - ADMIN DATA INTEGRITY, RPCs & ORDER INFRASTRUCTURE
-- Atomic stock adjustments, product saving, storage path & webhook idempotency
-- ==============================================================================

-- 1. ADD storage_path TO media TABLE
ALTER TABLE public.media
ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- 2. DOMAIN & BUSINESS CHECK CONSTRAINTS
-- Prevents negative stocks, negative prices, and negative quantities at database level
DO $$
BEGIN
    -- Products constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_stock_non_negative') THEN
        ALTER TABLE public.products ADD CONSTRAINT chk_products_stock_non_negative CHECK (stock_quantity >= 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_price_non_negative') THEN
        ALTER TABLE public.products ADD CONSTRAINT chk_products_price_non_negative CHECK (base_price >= 0);
    END IF;

    -- Product variants constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_variants_stock_non_negative') THEN
        ALTER TABLE public.product_variants ADD CONSTRAINT chk_variants_stock_non_negative CHECK (stock_quantity >= 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_variants_price_non_negative') THEN
        ALTER TABLE public.product_variants ADD CONSTRAINT chk_variants_price_non_negative CHECK (price >= 0);
    END IF;

    -- Order items constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_order_items_qty_positive') THEN
        ALTER TABLE public.order_items ADD CONSTRAINT chk_order_items_qty_positive CHECK (quantity > 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_order_items_price_non_negative') THEN
        ALTER TABLE public.order_items ADD CONSTRAINT chk_order_items_price_non_negative CHECK (price >= 0);
    END IF;

    -- Orders financial constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_orders_total_non_negative') THEN
        ALTER TABLE public.orders ADD CONSTRAINT chk_orders_total_non_negative CHECK (total_amount >= 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_orders_subtotal_non_negative') THEN
        ALTER TABLE public.orders ADD CONSTRAINT chk_orders_subtotal_non_negative CHECK (subtotal_amount >= 0);
    END IF;

    -- Payments amount constraint
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_payments_amount_non_negative') THEN
        ALTER TABLE public.payments ADD CONSTRAINT chk_payments_amount_non_negative CHECK (amount >= 0);
    END IF;

    -- Ordering positions constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_categories_pos_non_negative') THEN
        ALTER TABLE public.categories ADD CONSTRAINT chk_categories_pos_non_negative CHECK (position >= 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_collections_pos_non_negative') THEN
        ALTER TABLE public.collections ADD CONSTRAINT chk_collections_pos_non_negative CHECK (position >= 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_product_images_pos_non_negative') THEN
        ALTER TABLE public.product_images ADD CONSTRAINT chk_product_images_pos_non_negative CHECK (position >= 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_homepage_sections_pos_non_negative') THEN
        ALTER TABLE public.homepage_sections ADD CONSTRAINT chk_homepage_sections_pos_non_negative CHECK (position >= 0);
    END IF;
END $$;

-- 3. WEBHOOK IDEMPOTENCY TABLE (Prepares future Stripe & PayPal webhook processing)
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(50) NOT NULL, -- 'stripe', 'paypal'
    event_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_webhook_provider_event UNIQUE (provider, event_id)
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_lookup ON public.webhook_events(provider, event_id);

-- Enable RLS on webhook_events (service_role only, no public or standard user access)
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view webhook events" ON public.webhook_events;
CREATE POLICY "Admins can view webhook events"
    ON public.webhook_events FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- 4. ATOMIC STOCK ADJUSTMENT RPC (Prevents lost updates via FOR UPDATE & ensures movement is created)
CREATE OR REPLACE FUNCTION public.admin_adjust_stock(
    p_product_id UUID,
    p_variant_id UUID,
    p_new_quantity INT,
    p_reason VARCHAR(100),
    p_reference_id VARCHAR(100) DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_admin_id UUID;
    v_prev_qty INT;
    v_diff INT;
    v_movement_id UUID;
    v_target_product_id UUID := p_product_id;
BEGIN
    -- 1. Security Check: must be active admin
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Accès refusé : privilèges administrateur requis';
    END IF;

    -- 2. Validate quantity
    IF p_new_quantity < 0 THEN
        RAISE EXCEPTION 'La quantité en stock ne peut pas être négative (%)', p_new_quantity;
    END IF;

    IF p_product_id IS NULL AND p_variant_id IS NULL THEN
        RAISE EXCEPTION 'Identifiant produit ou variante requis';
    END IF;

    -- Resolve current admin id from admins table
    SELECT id INTO v_admin_id
    FROM public.admins
    WHERE user_id = auth.uid() AND active = true
    LIMIT 1;

    -- 3. Lock & Update with FOR UPDATE
    IF p_variant_id IS NOT NULL THEN
        SELECT stock_quantity, product_id INTO v_prev_qty, v_target_product_id
        FROM public.product_variants
        WHERE id = p_variant_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Variante introuvable (ID: %)', p_variant_id;
        END IF;

        v_diff := p_new_quantity - v_prev_qty;

        UPDATE public.product_variants
        SET stock_quantity = p_new_quantity,
            updated_at = timezone('utc'::text, now())
        WHERE id = p_variant_id;

    ELSE
        SELECT stock_quantity INTO v_prev_qty
        FROM public.products
        WHERE id = p_product_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Produit introuvable (ID: %)', p_product_id;
        END IF;

        v_diff := p_new_quantity - v_prev_qty;

        UPDATE public.products
        SET stock_quantity = p_new_quantity,
            updated_at = timezone('utc'::text, now())
        WHERE id = p_product_id;
    END IF;

    -- 4. Insert inventory_movement atomically
    INSERT INTO public.inventory_movements (
        product_id,
        variant_id,
        change_amount,
        previous_quantity,
        new_quantity,
        reason,
        reference_id,
        created_by,
        created_at
    ) VALUES (
        v_target_product_id,
        p_variant_id,
        v_diff,
        v_prev_qty,
        p_new_quantity,
        p_reason,
        p_reference_id,
        v_admin_id,
        timezone('utc'::text, now())
    )
    RETURNING id INTO v_movement_id;

    -- 5. Critical Audit Log
    INSERT INTO public.activity_logs (
        admin_id,
        action,
        entity_type,
        entity_id,
        details
    ) VALUES (
        v_admin_id,
        'adjust_stock',
        CASE WHEN p_variant_id IS NOT NULL THEN 'product_variant' ELSE 'product' END,
        COALESCE(p_variant_id, p_product_id)::text,
        jsonb_build_object(
            'previous_quantity', v_prev_qty,
            'new_quantity', p_new_quantity,
            'difference', v_diff,
            'reason', p_reason,
            'reference_id', p_reference_id,
            'movement_id', v_movement_id
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'previous_quantity', v_prev_qty,
        'new_quantity', p_new_quantity,
        'difference', v_diff,
        'movement_id', v_movement_id
    );
END;
$$;

-- Restrict RPC execution: only authenticated admins
REVOKE ALL ON FUNCTION public.admin_adjust_stock(UUID, UUID, INT, VARCHAR, VARCHAR) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_adjust_stock(UUID, UUID, INT, VARCHAR, VARCHAR) TO authenticated;

-- 5. ATOMIC PRODUCT + VARIANTS + IMAGES SAVE RPC
CREATE OR REPLACE FUNCTION public.admin_save_product(
    p_product_id UUID, -- NULL if create, UUID if update
    p_product_data JSONB,
    p_variants JSONB DEFAULT '[]'::jsonb,
    p_images JSONB DEFAULT '[]'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_admin_id UUID;
    v_target_id UUID := p_product_id;
    v_var RECORD;
    v_img RECORD;
    v_incoming_variant_ids UUID[] := ARRAY[]::UUID[];
BEGIN
    -- 1. Security check
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Accès refusé : privilèges administrateur requis';
    END IF;

    SELECT id INTO v_admin_id
    FROM public.admins
    WHERE user_id = auth.uid() AND active = true
    LIMIT 1;

    -- 2. Create or Update Product
    IF v_target_id IS NULL THEN
        INSERT INTO public.products (
            name, slug, sku, description, short_description,
            base_price, compare_at_price, category_id, collection_id,
            status, featured, sell_mode, material_details, gemstone_details,
            stock_quantity, meta_title, meta_description
        ) VALUES (
            p_product_data->>'name',
            p_product_data->>'slug',
            NULLIF(p_product_data->>'sku', ''),
            p_product_data->>'description',
            NULLIF(p_product_data->>'short_description', ''),
            (p_product_data->>'base_price')::NUMERIC,
            NULLIF(p_product_data->>'compare_at_price', '')::NUMERIC,
            NULLIF(p_product_data->>'category_id', '')::UUID,
            NULLIF(p_product_data->>'collection_id', '')::UUID,
            COALESCE((p_product_data->>'status')::product_status, 'draft'::product_status),
            COALESCE((p_product_data->>'featured')::BOOLEAN, false),
            COALESCE((p_product_data->>'sell_mode')::product_sell_mode, 'inherited'::product_sell_mode),
            NULLIF(p_product_data->>'material_details', ''),
            NULLIF(p_product_data->>'gemstone_details', ''),
            COALESCE((p_product_data->>'stock_quantity')::INT, 0),
            NULLIF(p_product_data->>'meta_title', ''),
            NULLIF(p_product_data->>'meta_description', '')
        )
        RETURNING id INTO v_target_id;
    ELSE
        UPDATE public.products
        SET
            name = p_product_data->>'name',
            slug = p_product_data->>'slug',
            sku = NULLIF(p_product_data->>'sku', ''),
            description = p_product_data->>'description',
            short_description = NULLIF(p_product_data->>'short_description', ''),
            base_price = (p_product_data->>'base_price')::NUMERIC,
            compare_at_price = NULLIF(p_product_data->>'compare_at_price', '')::NUMERIC,
            category_id = NULLIF(p_product_data->>'category_id', '')::UUID,
            collection_id = NULLIF(p_product_data->>'collection_id', '')::UUID,
            status = COALESCE((p_product_data->>'status')::product_status, 'draft'::product_status),
            featured = COALESCE((p_product_data->>'featured')::BOOLEAN, false),
            sell_mode = COALESCE((p_product_data->>'sell_mode')::product_sell_mode, 'inherited'::product_sell_mode),
            material_details = NULLIF(p_product_data->>'material_details', ''),
            gemstone_details = NULLIF(p_product_data->>'gemstone_details', ''),
            stock_quantity = COALESCE((p_product_data->>'stock_quantity')::INT, 0),
            meta_title = NULLIF(p_product_data->>'meta_title', ''),
            meta_description = NULLIF(p_product_data->>'meta_description', ''),
            updated_at = timezone('utc'::text, now())
        WHERE id = v_target_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Produit introuvable (ID: %)', v_target_id;
        END IF;
    END IF;

    -- 3. Synchronize Variants Atomically
    IF p_variants IS NOT NULL AND jsonb_typeof(p_variants) = 'array' THEN
        -- Collect incoming ids
        FOR v_var IN SELECT * FROM jsonb_to_recordset(p_variants) AS x(
            id UUID, title VARCHAR, sku VARCHAR, price NUMERIC,
            size VARCHAR, material VARCHAR, color VARCHAR, stock_quantity INT, active BOOLEAN
        )
        LOOP
            IF v_var.id IS NOT NULL THEN
                v_incoming_variant_ids := array_append(v_incoming_variant_ids, v_var.id);
            END IF;
        END LOOP;

        -- Delete variants no longer present
        DELETE FROM public.product_variants
        WHERE product_id = v_target_id
          AND (v_incoming_variant_ids = ARRAY[]::UUID[] OR id != ALL(v_incoming_variant_ids));

        -- Upsert / Insert
        FOR v_var IN SELECT * FROM jsonb_to_recordset(p_variants) AS x(
            id UUID, title VARCHAR, sku VARCHAR, price NUMERIC,
            size VARCHAR, material VARCHAR, color VARCHAR, stock_quantity INT, active BOOLEAN
        )
        LOOP
            IF v_var.id IS NOT NULL AND EXISTS (SELECT 1 FROM public.product_variants WHERE id = v_var.id) THEN
                UPDATE public.product_variants
                SET
                    title = v_var.title,
                    sku = NULLIF(v_var.sku, ''),
                    price = v_var.price,
                    size = NULLIF(v_var.size, ''),
                    material = NULLIF(v_var.material, ''),
                    color = NULLIF(v_var.color, ''),
                    stock_quantity = COALESCE(v_var.stock_quantity, 0),
                    active = COALESCE(v_var.active, true),
                    updated_at = timezone('utc'::text, now())
                WHERE id = v_var.id;
            ELSE
                INSERT INTO public.product_variants (
                    product_id, title, sku, price, size, material, color, stock_quantity, active
                ) VALUES (
                    v_target_id, v_var.title, NULLIF(v_var.sku, ''), v_var.price,
                    NULLIF(v_var.size, ''), NULLIF(v_var.material, ''), NULLIF(v_var.color, ''),
                    COALESCE(v_var.stock_quantity, 0), COALESCE(v_var.active, true)
                );
            END IF;
        END LOOP;
    END IF;

    -- 4. Synchronize Images Atomically
    IF p_images IS NOT NULL AND jsonb_typeof(p_images) = 'array' THEN
        DELETE FROM public.product_images WHERE product_id = v_target_id;

        FOR v_img IN SELECT * FROM jsonb_to_recordset(p_images) AS x(
            url TEXT, alt VARCHAR, position INT, is_primary BOOLEAN
        )
        LOOP
            INSERT INTO public.product_images (
                product_id, url, alt, position, is_primary
            ) VALUES (
                v_target_id, v_img.url, COALESCE(v_img.alt, p_product_data->>'name'),
                COALESCE(v_img.position, 0), COALESCE(v_img.is_primary, false)
            );
        END LOOP;
    END IF;

    -- 5. Critical Audit Log
    INSERT INTO public.activity_logs (
        admin_id, action, entity_type, entity_id, details
    ) VALUES (
        v_admin_id,
        CASE WHEN p_product_id IS NULL THEN 'create_product' ELSE 'update_product' END,
        'product',
        v_target_id::text,
        jsonb_build_object('name', p_product_data->>'name', 'slug', p_product_data->>'slug')
    );

    RETURN jsonb_build_object('success', true, 'product_id', v_target_id);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_save_product(UUID, JSONB, JSONB, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_save_product(UUID, JSONB, JSONB, JSONB) TO authenticated;
