'use server';

// ==============================================================================
// PERLE NOIRE - SETTINGS ACTIONS & SERVICE
// Centralized control for Mode Vitrine vs Mode E-Commerce (Strictly Secured)
// ==============================================================================

import { revalidatePath } from 'next/cache';
import { StoreSettings } from '@/types/database';
import { initialStoreSettings } from '@/lib/data/mock-data';
import { StoreSettingsSchema } from '@/lib/validation/schemas';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';

// Read-only memory fallback strictly reserved for public local storefront rendering
const localSettingsFallback: StoreSettings = { ...initialStoreSettings };

/**
 * Public read access: returns store settings.
 * Falls back to mock data if database is temporarily unavailable.
 */
export async function getStoreSettings(): Promise<StoreSettings> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    return localSettingsFallback;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error || !data) {
      return localSettingsFallback;
    }

    return data as StoreSettings;
  } catch {
    return localSettingsFallback;
  }
}

/**
 * Admin mutation: updates store settings.
 * STRICT: Requires active admin authentication and verified database persistence.
 */
export async function updateStoreSettings(payload: Partial<StoreSettings>): Promise<{
  success: boolean;
  settings?: StoreSettings;
  error?: string;
}> {
  // 1. Mandatory server authorization check
  let admin;
  try {
    admin = await requireAdmin();
  } catch (authError: unknown) {
    const msg = authError instanceof Error ? authError.message : 'Non autorisé';
    return { success: false, error: msg };
  }

  // 2. Reject if Supabase database is not configured (no unauthenticated or ghost writes)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    return {
      success: false,
      error: 'Supabase n’est pas configuré. Les modifications administratives nécessitent une connexion active à la base de données.',
    };
  }

  try {
    const supabase = await createClient();

    // Fetch existing settings to ensure complete merge
    const current = await getStoreSettings();
    const merged = {
      ...current,
      ...payload,
      id: 1,
      updated_at: new Date().toISOString(),
    };

    // Strict schema validation
    const validated = StoreSettingsSchema.parse(merged);

    // Persist to Supabase PostgreSQL
    const { data: updatedRecord, error: upsertError } = await supabase
      .from('store_settings')
      .upsert({
        ...validated,
        id: 1,
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (upsertError || !updatedRecord) {
      return {
        success: false,
        error: upsertError?.message || 'Échec de l’enregistrement dans la base de données.',
      };
    }

    // Audit log
    await supabase.from('activity_logs').insert({
      admin_id: admin.id,
      action: 'update_settings',
      entity_type: 'store_settings',
      entity_id: '1',
      details: payload as Record<string, unknown>,
    });

    // Revalidate paths
    revalidatePath('/');
    revalidatePath('/bijoux');
    revalidatePath('/panier');
    revalidatePath('/checkout');
    revalidatePath('/admin/parametres');
    revalidatePath('/admin');

    return { success: true, settings: updatedRecord as StoreSettings };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour des paramètres';
    return { success: false, error: message };
  }
}

/**
 * Admin mutation: toggles commerce_enabled mode.
 * Strictly calls updateStoreSettings with full authentication.
 */
export async function toggleCommerceMode(enabled: boolean): Promise<{
  success: boolean;
  commerce_enabled: boolean;
  error?: string;
}> {
  const result = await updateStoreSettings({ commerce_enabled: enabled });
  if (result.success && result.settings) {
    return { success: true, commerce_enabled: result.settings.commerce_enabled };
  }
  return { success: false, commerce_enabled: !enabled, error: result.error };
}
