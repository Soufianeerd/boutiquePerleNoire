'use server';

// ==============================================================================
// PERLE NOIRE - INVENTORY & STOCK AUDIT SERVICE
// Server-side real inventory management, movements tracking and low-stock alerts
// ==============================================================================

import { revalidatePath } from 'next/cache';
import { InventoryMovement, ProductVariant } from '@/types/database';
import { createClient } from '@/lib/supabase/server';
import { InventoryAdjustmentSchema } from '@/lib/validation/schemas';
import { requireAdmin } from '@/lib/auth/admin';

export interface InventoryRow {
  id: string; // variant id or product id
  productId: string;
  productName: string;
  variantId: string | null;
  variantTitle: string | null;
  sku: string;
  stock: number;
  status: string;
  isLow: boolean;
}

/**
 * Admin: Fetch real inventory rows from products & variants and recent movements.
 */
export async function getInventoryAdmin(): Promise<{
  rows: InventoryRow[];
  movements: InventoryMovement[];
  lowStockCount: number;
  lowStockThreshold: number;
  isConfigured: boolean;
  error?: string;
}> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    return {
      rows: [],
      movements: [],
      lowStockCount: 0,
      lowStockThreshold: 2,
      isConfigured: false,
      error: 'Base de données non configurée',
    };
  }

  try {
    const supabase = await createClient();

    const [settingsRes, prodRes, movRes] = await Promise.all([
      supabase.from('store_settings').select('low_stock_threshold').eq('id', 1).maybeSingle(),
      supabase
        .from('products')
        .select('id, name, sku, status, stock_quantity, variants:product_variants(*)')
        .order('name', { ascending: true }),
      supabase
        .from('inventory_movements')
        .select('*, product:products(name), variant:product_variants(title)')
        .order('created_at', { ascending: false })
        .limit(30),
    ]);

    const threshold = settingsRes.data?.low_stock_threshold ?? 2;
    const products = prodRes.data || [];
    const rows: InventoryRow[] = [];

    for (const p of products) {
      const variants = p.variants as ProductVariant[] | undefined;
      if (variants && variants.length > 0) {
        for (const v of variants) {
          rows.push({
            id: v.id,
            productId: p.id,
            productName: p.name,
            variantId: v.id,
            variantTitle: v.title,
            sku: v.sku || p.sku || '—',
            stock: v.stock_quantity,
            status: p.status,
            isLow: v.stock_quantity <= threshold,
          });
        }
      } else {
        const prodStock = p.stock_quantity ?? 0;
        rows.push({
          id: p.id,
          productId: p.id,
          productName: p.name,
          variantId: null,
          variantTitle: null,
          sku: p.sku || '—',
          stock: prodStock,
          status: p.status,
          isLow: prodStock <= threshold,
        });
      }
    }

    const lowStockCount = rows.filter((r) => r.isLow).length;

    return {
      rows,
      movements: (movRes.data as InventoryMovement[]) || [],
      lowStockCount,
      lowStockThreshold: threshold,
      isConfigured: true,
    };
  } catch (err: unknown) {
    return {
      rows: [],
      movements: [],
      lowStockCount: 0,
      lowStockThreshold: 2,
      isConfigured: true,
      error: err instanceof Error ? err.message : 'Erreur lors de la récupération des stocks',
    };
  }
}

/**
 * Admin: Update stock quantity for a variant or standalone product with mandatory movement record.
 */
export async function adjustStockAction(payload: unknown): Promise<{
  success: boolean;
  newStock?: number;
  error?: string;
}> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (authError: unknown) {
    return { success: false, error: authError instanceof Error ? authError.message : 'Non autorisé' };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    return { success: false, error: 'Base de données non configurée' };
  }

  try {
    const validated = InventoryAdjustmentSchema.parse(payload);
    const supabase = await createClient();

    let previousQuantity = 0;
    let targetProductId = validated.product_id;

    if (validated.variant_id) {
      // 1. Fetch current variant stock
      const { data: variant, error: varErr } = await supabase
        .from('product_variants')
        .select('product_id, stock_quantity')
        .eq('id', validated.variant_id)
        .single();

      if (varErr || !variant) {
        return { success: false, error: 'Variante introuvable' };
      }

      previousQuantity = variant.stock_quantity;
      targetProductId = variant.product_id;

      // 2. Update variant stock
      const { error: updateErr } = await supabase
        .from('product_variants')
        .update({
          stock_quantity: validated.new_quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', validated.variant_id);

      if (updateErr) return { success: false, error: updateErr.message };
    } else if (validated.product_id) {
      // 1. Fetch current product direct stock
      const { data: product, error: prodErr } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', validated.product_id)
        .single();

      if (prodErr || !product) {
        return { success: false, error: 'Produit introuvable' };
      }

      previousQuantity = product.stock_quantity ?? 0;

      // 2. Update product stock
      const { error: updateErr } = await supabase
        .from('products')
        .update({
          stock_quantity: validated.new_quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', validated.product_id);

      if (updateErr) return { success: false, error: updateErr.message };
    } else {
      return { success: false, error: 'Veuillez spécifier un produit ou une variante' };
    }

    const difference = validated.new_quantity - previousQuantity;

    // 3. Insert into inventory_movements
    const { error: movErr } = await supabase.from('inventory_movements').insert({
      product_id: targetProductId || null,
      variant_id: validated.variant_id || null,
      change_amount: difference,
      previous_quantity: previousQuantity,
      new_quantity: validated.new_quantity,
      reason: validated.reason,
      reference_id: validated.reference_id || null,
      created_by: admin.id,
    });

    if (movErr) {
      console.error('Inventory movement log error:', movErr.message);
    }

    // 4. Activity log
    await supabase.from('activity_logs').insert({
      admin_id: admin.id,
      action: 'update_stock',
      entity_type: validated.variant_id ? 'product_variant' : 'product',
      entity_id: validated.variant_id || validated.product_id || '',
      details: {
        previousQuantity,
        newQuantity: validated.new_quantity,
        difference,
        reason: validated.reason,
      },
    });

    revalidatePath('/admin/stocks');
    revalidatePath('/admin/produits');
    revalidatePath('/admin');
    return { success: true, newStock: validated.new_quantity };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur de mise à jour du stock' };
  }
}
