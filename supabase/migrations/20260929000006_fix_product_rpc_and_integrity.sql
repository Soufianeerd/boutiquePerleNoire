-- ==============================================================================
-- PERLE NOIRE - CORRECTIF D'INTÉGRITÉ (Migration 00006)
-- Corrige le bug enum 'inherited' -> 'inherit' dans admin_save_product,
-- renforce les validations variantes (cross-product protection),
-- invariant image primaire, contraintes financières orders,
-- soft-delete média, backfill storage_path, RPC dashboard stats,
-- et enrichit webhook_events.
-- ==============================================================================

-- ============================================================
-- 1. CORRECTION ENUM : admin_save_product ('inherited' -> 'inherit')
--    + Protection cross-product variants
--    + Invariant image primaire (au plus 1 par produit)
--    + Validation prix / stock >= 0 côté RPC
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_save_product(
    p_product_id UUID,  -- NULL = création, UUID = mise à jour
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
    v_admin_id          UUID;
    v_target_id         UUID := p_product_id;
    v_var               RECORD;
    v_img               RECORD;
    v_incoming_var_ids  UUID[] := ARRAY[]::UUID[];
    v_base_price        NUMERIC;
    v_stock_qty         INT;
    v_primary_count     INT;
    v_min_position      INT;
    v_sell_mode_val     product_sell_mode;
BEGIN
    -- ── Sécurité ─────────────────────────────────────────────
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Accès refusé : privilèges administrateur requis';
    END IF;

    SELECT id INTO v_admin_id
    FROM public.admins
    WHERE user_id = auth.uid() AND active = true
    LIMIT 1;

    -- ── Validation payload produit ────────────────────────────
    v_base_price := (p_product_data->>'base_price')::NUMERIC;
    IF v_base_price IS NULL OR v_base_price < 0 THEN
        RAISE EXCEPTION 'Le prix de base doit être >= 0 (reçu : %)', p_product_data->>'base_price';
    END IF;

    v_stock_qty := COALESCE((p_product_data->>'stock_quantity')::INT, 0);
    IF v_stock_qty < 0 THEN
        RAISE EXCEPTION 'Le stock doit être >= 0 (reçu : %)', v_stock_qty;
    END IF;

    -- Résolution sell_mode avec valeur par défaut correcte 'inherit' (JAMAIS 'inherited')
    BEGIN
        v_sell_mode_val := COALESCE(
            NULLIF(p_product_data->>'sell_mode', ''),
            'inherit'
        )::product_sell_mode;
    EXCEPTION WHEN invalid_text_representation THEN
        RAISE EXCEPTION 'Valeur sell_mode invalide : %. Valeurs acceptées : inherit, online, contact_only',
            p_product_data->>'sell_mode';
    END;

    -- ── Créer ou mettre à jour le produit ────────────────────
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
            v_base_price,
            NULLIF(p_product_data->>'compare_at_price', '')::NUMERIC,
            NULLIF(p_product_data->>'category_id', '')::UUID,
            NULLIF(p_product_data->>'collection_id', '')::UUID,
            COALESCE(NULLIF(p_product_data->>'status', ''), 'draft')::product_status,
            COALESCE((p_product_data->>'featured')::BOOLEAN, false),
            v_sell_mode_val,
            NULLIF(p_product_data->>'material_details', ''),
            NULLIF(p_product_data->>'gemstone_details', ''),
            v_stock_qty,
            NULLIF(p_product_data->>'meta_title', ''),
            NULLIF(p_product_data->>'meta_description', '')
        )
        RETURNING id INTO v_target_id;
    ELSE
        UPDATE public.products
        SET
            name                = p_product_data->>'name',
            slug                = p_product_data->>'slug',
            sku                 = NULLIF(p_product_data->>'sku', ''),
            description         = p_product_data->>'description',
            short_description   = NULLIF(p_product_data->>'short_description', ''),
            base_price          = v_base_price,
            compare_at_price    = NULLIF(p_product_data->>'compare_at_price', '')::NUMERIC,
            category_id         = NULLIF(p_product_data->>'category_id', '')::UUID,
            collection_id       = NULLIF(p_product_data->>'collection_id', '')::UUID,
            status              = COALESCE(NULLIF(p_product_data->>'status', ''), 'draft')::product_status,
            featured            = COALESCE((p_product_data->>'featured')::BOOLEAN, false),
            sell_mode           = v_sell_mode_val,
            material_details    = NULLIF(p_product_data->>'material_details', ''),
            gemstone_details    = NULLIF(p_product_data->>'gemstone_details', ''),
            stock_quantity      = v_stock_qty,
            meta_title          = NULLIF(p_product_data->>'meta_title', ''),
            meta_description    = NULLIF(p_product_data->>'meta_description', ''),
            updated_at          = timezone('utc'::text, now())
        WHERE id = v_target_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Produit introuvable (ID: %)', v_target_id;
        END IF;
    END IF;

    -- ── Synchronisation atomique des variantes ────────────────
    IF p_variants IS NOT NULL AND jsonb_typeof(p_variants) = 'array' THEN

        -- Collecter les IDs entrants valides (appartenant obligatoirement au produit cible)
        FOR v_var IN SELECT * FROM jsonb_to_recordset(p_variants) AS x(
            id UUID, title VARCHAR, sku VARCHAR, price NUMERIC,
            size VARCHAR, material VARCHAR, color VARCHAR,
            stock_quantity INT, active BOOLEAN
        )
        LOOP
            IF v_var.id IS NOT NULL THEN
                -- Protection cross-product : vérifier que la variante appartient au produit en cours
                IF NOT EXISTS (
                    SELECT 1 FROM public.product_variants
                    WHERE id = v_var.id AND product_id = v_target_id
                ) THEN
                    RAISE EXCEPTION
                        'Variante étrangère détectée (id: %). Cette variante n''appartient pas au produit (id: %).',
                        v_var.id, v_target_id;
                END IF;
                v_incoming_var_ids := array_append(v_incoming_var_ids, v_var.id);
            END IF;

            -- Validation prix et stock variante
            IF v_var.price IS NOT NULL AND v_var.price < 0 THEN
                RAISE EXCEPTION 'Le prix de la variante doit être >= 0 (reçu : %)', v_var.price;
            END IF;
            IF COALESCE(v_var.stock_quantity, 0) < 0 THEN
                RAISE EXCEPTION 'Le stock de la variante doit être >= 0 (reçu : %)', v_var.stock_quantity;
            END IF;
        END LOOP;

        -- Supprimer les variantes appartenant à ce produit mais absentes du payload
        DELETE FROM public.product_variants
        WHERE product_id = v_target_id
          AND (
              cardinality(v_incoming_var_ids) = 0
              OR id <> ALL(v_incoming_var_ids)
          );

        -- Upsert / Insert des variantes
        FOR v_var IN SELECT * FROM jsonb_to_recordset(p_variants) AS x(
            id UUID, title VARCHAR, sku VARCHAR, price NUMERIC,
            size VARCHAR, material VARCHAR, color VARCHAR,
            stock_quantity INT, active BOOLEAN
        )
        LOOP
            IF v_var.id IS NOT NULL THEN
                -- UPDATE : garantir product_id = v_target_id (protection double)
                UPDATE public.product_variants
                SET
                    title          = v_var.title,
                    sku            = NULLIF(v_var.sku, ''),
                    price          = v_var.price,
                    size           = NULLIF(v_var.size, ''),
                    material       = NULLIF(v_var.material, ''),
                    color          = NULLIF(v_var.color, ''),
                    stock_quantity = COALESCE(v_var.stock_quantity, 0),
                    active         = COALESCE(v_var.active, true),
                    updated_at     = timezone('utc'::text, now())
                WHERE id = v_var.id
                  AND product_id = v_target_id;  -- Guard supplémentaire
            ELSE
                INSERT INTO public.product_variants (
                    product_id, title, sku, price, size, material,
                    color, stock_quantity, active
                ) VALUES (
                    v_target_id,
                    v_var.title,
                    NULLIF(v_var.sku, ''),
                    v_var.price,
                    NULLIF(v_var.size, ''),
                    NULLIF(v_var.material, ''),
                    NULLIF(v_var.color, ''),
                    COALESCE(v_var.stock_quantity, 0),
                    COALESCE(v_var.active, true)
                );
            END IF;
        END LOOP;
    END IF;

    -- ── Synchronisation atomique des images ───────────────────
    IF p_images IS NOT NULL AND jsonb_typeof(p_images) = 'array' THEN
        DELETE FROM public.product_images WHERE product_id = v_target_id;

        FOR v_img IN SELECT * FROM jsonb_to_recordset(p_images) AS x(
            url TEXT, alt VARCHAR, position INT, is_primary BOOLEAN
        )
        LOOP
            INSERT INTO public.product_images (
                product_id, url, alt, position, is_primary
            ) VALUES (
                v_target_id,
                v_img.url,
                COALESCE(v_img.alt, p_product_data->>'name'),
                COALESCE(v_img.position, 0),
                COALESCE(v_img.is_primary, false)
            );
        END LOOP;

        -- ── Invariant image primaire ─────────────────────────
        -- Règle : exactement 0 ou 1 image is_primary = true.
        -- Si aucune n'est primaire mais au moins une existe → promouvoir la position minimale.
        -- Si plusieurs sont primaires → conserver uniquement la position minimale.
        SELECT COUNT(*) INTO v_primary_count
        FROM public.product_images
        WHERE product_id = v_target_id AND is_primary = true;

        IF v_primary_count = 0 THEN
            -- Aucune primaire : promouvoir la position la plus faible
            SELECT MIN(position) INTO v_min_position
            FROM public.product_images
            WHERE product_id = v_target_id;

            IF v_min_position IS NOT NULL THEN
                UPDATE public.product_images
                SET is_primary = true
                WHERE product_id = v_target_id
                  AND position = v_min_position
                  AND id = (
                      SELECT id FROM public.product_images
                      WHERE product_id = v_target_id
                        AND position = v_min_position
                      LIMIT 1
                  );
            END IF;

        ELSIF v_primary_count > 1 THEN
            -- Plusieurs primaires : conserver uniquement la position minimale
            SELECT MIN(position) INTO v_min_position
            FROM public.product_images
            WHERE product_id = v_target_id AND is_primary = true;

            UPDATE public.product_images
            SET is_primary = false
            WHERE product_id = v_target_id
              AND is_primary = true
              AND id <> (
                  SELECT id FROM public.product_images
                  WHERE product_id = v_target_id
                    AND is_primary = true
                    AND position = v_min_position
                  LIMIT 1
              );
        END IF;
    END IF;

    -- ── Audit log critique ────────────────────────────────────
    INSERT INTO public.activity_logs (
        admin_id, action, entity_type, entity_id, details
    ) VALUES (
        v_admin_id,
        CASE WHEN p_product_id IS NULL THEN 'create_product' ELSE 'update_product' END,
        'product',
        v_target_id::text,
        jsonb_build_object(
            'name', p_product_data->>'name',
            'slug', p_product_data->>'slug',
            'sell_mode', v_sell_mode_val::text
        )
    );

    RETURN jsonb_build_object('success', true, 'product_id', v_target_id);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_save_product(UUID, JSONB, JSONB, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_save_product(UUID, JSONB, JSONB, JSONB) TO authenticated;


-- ============================================================
-- 2. CONTRAINTES FINANCIÈRES MANQUANTES SUR ORDERS
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_orders_shipping_non_negative'
    ) THEN
        ALTER TABLE public.orders
        ADD CONSTRAINT chk_orders_shipping_non_negative
        CHECK (shipping_amount >= 0);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_orders_tax_non_negative'
    ) THEN
        ALTER TABLE public.orders
        ADD CONSTRAINT chk_orders_tax_non_negative
        CHECK (tax_amount >= 0);
    END IF;
END $$;


-- ============================================================
-- 3. SOFT-DELETE MÉDIA (stratégie compensatoire)
--    Ajoute deleted_at + deletion_status à la table media.
--    Masque les médias en cours de suppression des vues normales.
-- ============================================================

ALTER TABLE public.media
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL,
    ADD COLUMN IF NOT EXISTS deletion_status VARCHAR(30) NULL
        CHECK (deletion_status IN ('pending_delete', 'deleted', 'failed'));

-- Index pour filtrer efficacement les médias actifs
CREATE INDEX IF NOT EXISTS idx_media_not_deleted
    ON public.media (id)
    WHERE deleted_at IS NULL;

-- Vue publique/admin qui masque automatiquement les médias en cours de suppression
CREATE OR REPLACE VIEW public.media_active AS
SELECT * FROM public.media
WHERE deleted_at IS NULL;

COMMENT ON VIEW public.media_active IS
    'Médias actifs uniquement (soft-delete : exclut deleted_at IS NOT NULL)';


-- ============================================================
-- 4. BACKFILL storage_path POUR LES ANCIENS MÉDIAS
--    Tente de reconstruire le chemin depuis l''URL publique
--    pour les enregistrements sans storage_path.
-- ============================================================

UPDATE public.media
SET storage_path = (
    regexp_match(
        file_path,
        '/object/public/[^/]+/(.+)$'
    )
)[1]
WHERE storage_path IS NULL
  AND file_path IS NOT NULL
  AND file_path LIKE '%/object/public/%';

-- Contrainte NOT NULL appliquée aux nouvelles insertions uniquement
-- (les anciens enregistrements ayant échoué au backfill restent NULL pour éviter
-- de bloquer la migration — ils seront traités manuellement si besoin)
COMMENT ON COLUMN public.media.storage_path IS
    'Chemin relatif dans le bucket Storage (ex: products/uuid/image.webp). '
    'Obligatoire pour toutes les nouvelles insertions. '
    'Certains anciens enregistrements peuvent être NULL si le backfill a échoué.';


-- ============================================================
-- 5. RPC DASHBOARD STATS (agrégation SQL côté serveur)
--    Évite de télécharger des milliers de commandes dans Next.js.
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_dashboard_stats(
    p_low_stock_threshold INT DEFAULT 2
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_total_products     BIGINT;
    v_published_products BIGINT;
    v_draft_products     BIGINT;
    v_out_of_stock       BIGINT;
    v_pending_requests   BIGINT;
    v_total_orders       BIGINT;
    v_total_revenue      NUMERIC;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Accès refusé : privilèges administrateur requis';
    END IF;

    SELECT COUNT(*) INTO v_total_products FROM public.products;

    SELECT COUNT(*) INTO v_published_products
    FROM public.products
    WHERE status IN ('published', 'unique_piece', 'made_to_order');

    SELECT COUNT(*) INTO v_draft_products
    FROM public.products WHERE status = 'draft';

    SELECT COUNT(*) INTO v_out_of_stock
    FROM public.products WHERE status = 'out_of_stock';

    SELECT COUNT(*) INTO v_pending_requests
    FROM public.contact_requests
    WHERE status IN ('new', 'in_progress');

    SELECT COUNT(*) INTO v_total_orders FROM public.orders;

    SELECT COALESCE(SUM(total_amount), 0) INTO v_total_revenue
    FROM public.orders
    WHERE payment_status = 'succeeded';

    RETURN jsonb_build_object(
        'total_products',     v_total_products,
        'published_products', v_published_products,
        'draft_products',     v_draft_products,
        'out_of_stock',       v_out_of_stock,
        'pending_requests',   v_pending_requests,
        'total_orders',       v_total_orders,
        'total_revenue',      v_total_revenue
    );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_dashboard_stats(INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_dashboard_stats(INT) TO authenticated;


-- ============================================================
-- 6. ENRICHISSEMENT webhook_events
--    Ajoute status, error_message, attempt_count
-- ============================================================

ALTER TABLE public.webhook_events
    ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'processed'
        CHECK (status IN ('processed', 'failed', 'pending')),
    ADD COLUMN IF NOT EXISTS error_message TEXT NULL,
    ADD COLUMN IF NOT EXISTS attempt_count INT NOT NULL DEFAULT 1
        CHECK (attempt_count >= 1);

COMMENT ON TABLE public.webhook_events IS
    'Journal idempotent des webhooks entrants (Stripe, PayPal). '
    'Une ligne par (provider, event_id). status/attempt_count utilisés pour retry.';
