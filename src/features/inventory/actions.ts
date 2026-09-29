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
  try {
    await requireAdmin();
  } catch (authError: unknown) {
    return {
      rows: [],
      movements: [],
      lowStockCount: 0,
      lowStockThreshold: 2,
      isConfigured: false,
      error: authError instanceof Error ? authError.message : 'Non autorisé',
    };
  }

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
 * Admin: Update stock quantity atomically via PostgreSQL RPC admin_adjust_stock.
 * Guarantees that stock modification cannot succeed without its audit movement.
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

    // 1. Try atomic PostgreSQL RPC admin_adjust_stock
    const { data: rpcData, error: rpcError } = await supabase.rpc('admin_adjust_stock', {
      p_product_id: validated.product_id || null,
      p_variant_id: validated.variant_id || null,
      p_new_quantity: validated.new_quantity,
      p_reason: validated.reason,
      p_reference_id: validated.reference_id || null,
    });

    if (!rpcError && rpcData) {
      revalidatePath('/admin/stocks');
      revalidatePath('/admin/produits');
      revalidatePath('/admin');
      return {
        success: true,
        newStock: Number(rpcData.new_quantity ?? validated.new_quantity),
      };
    }

    // If RPC failed due to validation/business error, propagate immediately
    if (rpcError && !rpcError.message.includes('function public.admin_adjust_stock') && !rpcError.message.includes('could not find function')) {
      return { success: false, error: rpcError.message };
    }

    // 2. Strict Fallback: Sequential update with immediate rollback on audit failure
    let previousQuantity = 0;
    let targetProductId = validated.product_id;

    if (validated.variant_id) {
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

      const { error: updateErr } = await supabase
        .from('product_variants')
        .update({
          stock_quantity: validated.new_quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', validated.variant_id);

      if (updateErr) return { success: false, error: updateErr.message };

      const difference = validated.new_quantity - previousQuantity;

      // Insert audit movement - if it fails, rollback the stock change immediately
      const { error: movErr } = await supabase.from('inventory_movements').insert({
        product_id: targetProductId || null,
        variant_id: validated.variant_id,
        change_amount: difference,
        previous_quantity: previousQuantity,
        new_quantity: validated.new_quantity,
        reason: validated.reason,
        reference_id: validated.reference_id || null,
        created_by: admin.id,
      });

      if (movErr) {
        // Rollback stock update to guarantee audit trail integrity
        await supabase
          .from('product_variants')
          .update({ stock_quantity: previousQuantity })
          .eq('id', validated.variant_id);
        return {
          success: false,
          error: `Échec de l'enregistrement de l'audit de stock : ${movErr.message}. Modification annulée.`,
        };
      }
    } else if (validated.product_id) {
      const { data: product, error: prodErr } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', validated.product_id)
        .single();

      if (prodErr || !product) {
        return { success: false, error: 'Produit introuvable' };
      }

      previousQuantity = product.stock_quantity ?? 0;

      const { error: updateErr } = await supabase
        .from('products')
        .update({
          stock_quantity: validated.new_quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', validated.product_id);

      if (updateErr) return { success: false, error: updateErr.message };

      const difference = validated.new_quantity - previousQuantity;

      const { error: movErr } = await supabase.from('inventory_movements').insert({
        product_id: validated.product_id,
        variant_id: null,
        change_amount: difference,
        previous_quantity: previousQuantity,
        new_quantity: validated.new_quantity,
        reason: validated.reason,
        reference_id: validated.reference_id || null,
        created_by: admin.id,
      });

      if (movErr) {
        // Rollback stock update
        await supabase
          .from('products')
          .update({ stock_quantity: previousQuantity })
          .eq('id', validated.product_id);
        return {
          success: false,
          error: `Échec de l'enregistrement de l'audit de stock : ${movErr.message}. Modification annulée.`,
        };
      }
    } else {
      return { success: false, error: 'Veuillez spécifier un produit ou une variante' };
    }

    // Critical Activity Log
    const { error: actErr } = await supabase.from('activity_logs').insert({
      admin_id: admin.id,
      action: 'adjust_stock',
      entity_type: validated.variant_id ? 'product_variant' : 'product',
      entity_id: validated.variant_id || validated.product_id || '',
      details: {
        previousQuantity,
        newQuantity: validated.new_quantity,
        difference: validated.new_quantity - previousQuantity,
        reason: validated.reason,
      },
    });

    if (actErr) {
      console.warn('Activity log insert error for adjust_stock:', actErr.message);
    }

    revalidatePath('/admin/stocks');
    revalidatePath('/admin/produits');
    revalidatePath('/admin');
    return { success: true, newStock: validated.new_quantity };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur de mise à jour du stock' };
  }
}
