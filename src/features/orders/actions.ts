'use server';

// ==============================================================================
// PERLE NOIRE - ORDERS SERVICE
// Server-side retrieval and status management of customer orders
// ==============================================================================

import { revalidatePath } from 'next/cache';
import { Order, OrderStatus, PaymentStatus } from '@/types/database';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';

/**
 * Admin: Fetch all orders from Supabase with joined items and customer details.
 */
export async function getOrdersAdmin(): Promise<{
  orders: Order[];
  isConfigured: boolean;
  error?: string;
}> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    return { orders: [], isConfigured: false, error: 'Base de données non configurée' };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*, customer:customers(*), items:order_items(*)')
      .order('created_at', { ascending: false });

    if (error) {
      return { orders: [], isConfigured: true, error: error.message };
    }

    return { orders: (data as Order[]) || [], isConfigured: true };
  } catch (err: unknown) {
    return {
      orders: [],
      isConfigured: true,
      error: err instanceof Error ? err.message : 'Erreur lors de la récupération des commandes',
    };
  }
}

/**
 * Admin: Update order status or payment status.
 */
export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus,
  paymentStatus?: PaymentStatus
): Promise<{ success: boolean; error?: string }> {
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
    const supabase = await createClient();
    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (paymentStatus) {
      updateData.payment_status = paymentStatus;
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) return { success: false, error: error.message };

    await supabase.from('activity_logs').insert({
      admin_id: admin.id,
      action: 'update_order_status',
      entity_type: 'order',
      entity_id: orderId,
      details: { status, paymentStatus },
    });

    revalidatePath('/admin/commandes');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
  }
}
