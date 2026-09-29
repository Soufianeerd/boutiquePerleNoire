'use server';

// ==============================================================================
// PERLE NOIRE - ADMIN DASHBOARD & AUDIT LOGS SERVICE
// Server-side real statistics, metrics aggregation and activity logs
// ==============================================================================

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import {
  ActivityLog,
  ContactRequest,
  Order,
  Product,
  StoreSettings,
} from '@/types/database';
import { getStoreSettings } from '@/features/settings/actions';

export interface DashboardStats {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  outOfStockProducts: number;
  lowStockCount: number;
  pendingRequestsCount: number;
  totalOrdersCount: number;
  totalRevenue: number;
  recentProducts: Product[];
  lowStockItems: {
    id: string;
    productName: string;
    variantTitle: string | null;
    stock: number;
    sku: string;
  }[];
  recentRequests: ContactRequest[];
  recentOrders: Order[];
  settings: StoreSettings;
  isConfigured: boolean;
  error?: string;
}

/**
 * Fetch real dashboard statistics directly from Supabase (never simulated).
 * Uses exact counts and unconstrained aggregations so metrics stay accurate with 10 or 10,000 orders.
 */
export async function getAdminDashboardStats(): Promise<DashboardStats> {
  const settings = await getStoreSettings();

  // 1. Enforce admin authentication
  try {
    await requireAdmin();
  } catch (authError: unknown) {
    return {
      totalProducts: 0,
      publishedProducts: 0,
      draftProducts: 0,
      outOfStockProducts: 0,
      lowStockCount: 0,
      pendingRequestsCount: 0,
      totalOrdersCount: 0,
      totalRevenue: 0,
      recentProducts: [],
      lowStockItems: [],
      recentRequests: [],
      recentOrders: [],
      settings,
      isConfigured: false,
      error: authError instanceof Error ? authError.message : 'Non autorisé',
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    return {
      totalProducts: 0,
      publishedProducts: 0,
      draftProducts: 0,
      outOfStockProducts: 0,
      lowStockCount: 0,
      pendingRequestsCount: 0,
      totalOrdersCount: 0,
      totalRevenue: 0,
      recentProducts: [],
      lowStockItems: [],
      recentRequests: [],
      recentOrders: [],
      settings,
      isConfigured: false,
      error: 'Base de données non configurée',
    };
  }

  try {
    const supabase = await createClient();
    const threshold = settings.low_stock_threshold ?? 2;

    // Execute separate, precise queries for global aggregates and recent lists
    const [
      totalProductsRes,
      publishedProductsRes,
      draftProductsRes,
      outOfStockProductsRes,
      pendingRequestsRes,
      totalOrdersRes,
      paidOrdersRevenueRes,
      recentProductsRes,
      recentRequestsRes,
      recentOrdersRes,
      lowStockVariantsRes,
      lowStockProductsRes,
    ] = await Promise.all([
      // A. Global Product Counts
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .in('status', ['published', 'unique_piece', 'made_to_order']),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'out_of_stock'),

      // B. Global Inquiries Count (new + in_progress)
      supabase
        .from('contact_requests')
        .select('*', { count: 'exact', head: true })
        .in('status', ['new', 'in_progress']),

      // C. Global Orders Count (head query, no row limit)
      supabase.from('orders').select('*', { count: 'exact', head: true }),

      // D. Global Total Revenue from ALL succeeded orders (no row limit)
      supabase
        .from('orders')
        .select('total_amount')
        .eq('payment_status', 'succeeded'),

      // E. Recent Products (5 latest)
      supabase
        .from('products')
        .select('*, variants:product_variants(*), images:product_images(*)')
        .order('created_at', { ascending: false })
        .limit(5),

      // F. Recent Inquiries (5 latest)
      supabase
        .from('contact_requests')
        .select('*, product:products(name)')
        .order('created_at', { ascending: false })
        .limit(5),

      // G. Recent Orders (5 latest)
      supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5),

      // H. Low Stock Variants (lte threshold)
      supabase
        .from('product_variants')
        .select('id, title, sku, stock_quantity, product:products(name)')
        .lte('stock_quantity', threshold)
        .order('stock_quantity', { ascending: true })
        .limit(10),

      // I. Low Stock Standalone Products (lte threshold, without variants)
      supabase
        .from('products')
        .select('id, name, sku, stock_quantity, variants:product_variants(id)')
        .lte('stock_quantity', threshold)
        .order('stock_quantity', { ascending: true })
        .limit(10),
    ]);

    // Calculate exact revenue across ALL paid orders
    const paidOrders = paidOrdersRevenueRes.data || [];
    const totalRevenue = paidOrders.reduce(
      (sum, row) => sum + Number(row.total_amount || 0),
      0
    );

    // Format low stock items
    const lowStockItems: DashboardStats['lowStockItems'] = [];

    // From variants
    for (const v of lowStockVariantsRes.data || []) {
      const prodName = (v.product as { name?: string } | null)?.name || 'Bijou';
      lowStockItems.push({
        id: v.id,
        productName: prodName,
        variantTitle: v.title,
        stock: v.stock_quantity,
        sku: v.sku || '—',
      });
    }

    // From standalone products (only if no variants attached)
    for (const p of lowStockProductsRes.data || []) {
      const variantList = p.variants as { id: string }[] | undefined;
      if (!variantList || variantList.length === 0) {
        lowStockItems.push({
          id: p.id,
          productName: p.name,
          variantTitle: null,
          stock: p.stock_quantity ?? 0,
          sku: p.sku || '—',
        });
      }
    }

    return {
      totalProducts: totalProductsRes.count ?? 0,
      publishedProducts: publishedProductsRes.count ?? 0,
      draftProducts: draftProductsRes.count ?? 0,
      outOfStockProducts: outOfStockProductsRes.count ?? 0,
      lowStockCount: lowStockItems.length,
      pendingRequestsCount: pendingRequestsRes.count ?? 0,
      totalOrdersCount: totalOrdersRes.count ?? 0,
      totalRevenue,
      recentProducts: (recentProductsRes.data as Product[]) || [],
      lowStockItems: lowStockItems.slice(0, 6),
      recentRequests: (recentRequestsRes.data as ContactRequest[]) || [],
      recentOrders: (recentOrdersRes.data as Order[]) || [],
      settings,
      isConfigured: true,
    };
  } catch (err: unknown) {
    return {
      totalProducts: 0,
      publishedProducts: 0,
      draftProducts: 0,
      outOfStockProducts: 0,
      lowStockCount: 0,
      pendingRequestsCount: 0,
      totalOrdersCount: 0,
      totalRevenue: 0,
      recentProducts: [],
      lowStockItems: [],
      recentRequests: [],
      recentOrders: [],
      settings,
      isConfigured: true,
      error: err instanceof Error ? err.message : 'Erreur serveur',
    };
  }
}

/**
 * Fetch administrative activity audit logs with admin authentication.
 */
export async function getActivityLogsAdmin(limit = 20): Promise<{
  logs: ActivityLog[];
  isConfigured: boolean;
  error?: string;
}> {
  try {
    await requireAdmin();
  } catch (authError: unknown) {
    return {
      logs: [],
      isConfigured: false,
      error: authError instanceof Error ? authError.message : 'Non autorisé',
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    return { logs: [], isConfigured: false, error: 'Base de données non configurée' };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*, admin:admins(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { logs: [], isConfigured: true, error: error.message };
    }

    return { logs: (data as ActivityLog[]) || [], isConfigured: true };
  } catch (err: unknown) {
    return {
      logs: [],
      isConfigured: true,
      error: err instanceof Error ? err.message : 'Erreur lors de la récupération des logs',
    };
  }
}
