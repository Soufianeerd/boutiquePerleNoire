'use server';

// ==============================================================================
// PERLE NOIRE - ADMIN DASHBOARD & AUDIT LOGS SERVICE
// Server-side real statistics, metrics aggregation and activity logs
// ==============================================================================

import { createClient } from '@/lib/supabase/server';
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
 */
export async function getAdminDashboardStats(): Promise<DashboardStats> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const settings = await getStoreSettings();

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

    // Parallel queries to Supabase
    const [
      productsRes,
      requestsRes,
      ordersRes,
    ] = await Promise.all([
      supabase
        .from('products')
        .select('*, variants:product_variants(*), images:product_images(*)')
        .order('created_at', { ascending: false }),
      supabase
        .from('contact_requests')
        .select('*, product:products(name)')
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    if (productsRes.error) {
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
        error: productsRes.error.message,
      };
    }

    const allProducts = (productsRes.data as Product[]) || [];
    const allRequests = (requestsRes.data as ContactRequest[]) || [];
    const allOrders = (ordersRes.data as Order[]) || [];

    const totalProducts = allProducts.length;
    const publishedProducts = allProducts.filter((p) =>
      ['published', 'unique_piece', 'made_to_order'].includes(p.status)
    ).length;
    const draftProducts = allProducts.filter((p) => p.status === 'draft').length;
    const outOfStockProducts = allProducts.filter((p) => p.status === 'out_of_stock').length;

    // Calculate low stock items based on store_settings.low_stock_threshold
    const threshold = settings.low_stock_threshold ?? 2;
    const lowStockItems: DashboardStats['lowStockItems'] = [];

    for (const p of allProducts) {
      if (p.variants && p.variants.length > 0) {
        for (const v of p.variants) {
          if (v.stock_quantity <= threshold) {
            lowStockItems.push({
              id: v.id,
              productName: p.name,
              variantTitle: v.title,
              stock: v.stock_quantity,
              sku: v.sku || p.sku || '—',
            });
          }
        }
      } else {
        const directStock = p.stock_quantity ?? 0;
        if (directStock <= threshold) {
          lowStockItems.push({
            id: p.id,
            productName: p.name,
            variantTitle: null,
            stock: directStock,
            sku: p.sku || '—',
          });
        }
      }
    }

    const pendingRequests = allRequests.filter((r) => ['new', 'in_progress'].includes(r.status));
    const paidOrders = allOrders.filter((o) => o.payment_status === 'succeeded');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    return {
      totalProducts,
      publishedProducts,
      draftProducts,
      outOfStockProducts,
      lowStockCount: lowStockItems.length,
      pendingRequestsCount: pendingRequests.length,
      totalOrdersCount: allOrders.length,
      totalRevenue,
      recentProducts: allProducts.slice(0, 5),
      lowStockItems: lowStockItems.slice(0, 6),
      recentRequests: allRequests.slice(0, 5),
      recentOrders: allOrders.slice(0, 5),
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
 * Fetch administrative activity audit logs.
 */
export async function getActivityLogsAdmin(limit = 20): Promise<{
  logs: ActivityLog[];
  isConfigured: boolean;
}> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    return { logs: [], isConfigured: false };
  }

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('activity_logs')
      .select('*, admin:admins(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(limit);

    return { logs: (data as ActivityLog[]) || [], isConfigured: true };
  } catch {
    return { logs: [], isConfigured: true };
  }
}
