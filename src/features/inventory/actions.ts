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
 *
 * RÈGLE STRICTE : La RPC admin_adjust_stock est une dépendance obligatoire du schéma.
 * Aucune modification directe de stock n'est autorisée hors de cette RPC.
 * Si elle est absente (migration non exécutée), retourner une erreur explicite.
 *
 * Garanties :
 *  - FOR UPDATE côté PostgreSQL → pas de race condition
 *  - audit inventory_movement atomique
 *  - activity_log atomique
 */
export async function adjustStockAction(payload: unknown): Promise<{
  success: boolean;
  newStock?: number;
  error?: string;
}> {
  try {
    await requireAdmin();
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

    const { data: rpcData, error: rpcError } = await supabase.rpc('admin_adjust_stock', {
      p_product_id: validated.product_id || null,
      p_variant_id: validated.variant_id || null,
      p_new_quantity: validated.new_quantity,
      p_reason: validated.reason,
      p_reference_id: validated.reference_id || null,
    });

    // RPC absente (migration non exécutée) → erreur explicite, pas de fallback
    if (
      rpcError &&
      (rpcError.message.includes('function public.admin_adjust_stock') ||
        rpcError.message.includes('could not find function'))
    ) {
      return {
        success: false,
        error:
          'Migration de base de données manquante : admin_adjust_stock indisponible. ' +
          'Exécutez les migrations Supabase avant de modifier le stock.',
      };
    }

    if (rpcError) {
      return { success: false, error: rpcError.message };
    }

    if (!rpcData) {
      return { success: false, error: 'La RPC admin_adjust_stock n\'a retourné aucune donnée.' };
    }

    revalidatePath('/admin/stocks');
    revalidatePath('/admin/produits');
    revalidatePath('/admin');
    return {
      success: true,
      newStock: Number(rpcData.new_quantity ?? validated.new_quantity),
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur de mise à jour du stock' };
  }
}
