'use server';

// ==============================================================================
// PERLE NOIRE - SETTINGS ACTIONS & SERVICE
// Centralized control for Mode Vitrine vs Mode E-Commerce
// ==============================================================================

import { revalidatePath } from 'next/cache';
import { StoreSettings } from '@/types/database';
import { initialStoreSettings } from '@/lib/data/mock-data';
import { StoreSettingsSchema } from '@/lib/validation/schemas';
import { createClient } from '@/lib/supabase/server';

// In-memory fallback cache for development when Supabase credentials are in placeholder mode
let localSettingsCache: StoreSettings = { ...initialStoreSettings };

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error || !data) {
      return localSettingsCache;
    }

    return data as StoreSettings;
  } catch {
    return localSettingsCache;
  }
}

export async function updateStoreSettings(payload: Partial<StoreSettings>): Promise<{
  success: boolean;
  settings?: StoreSettings;
  error?: string;
}> {
  try {
    const merged = { ...localSettingsCache, ...payload, id: 1, updated_at: new Date().toISOString() };
    const validated = StoreSettingsSchema.parse(merged);

    localSettingsCache = {
      ...localSettingsCache,
      ...validated,
      updated_at: new Date().toISOString(),
    };

    try {
      const supabase = await createClient();
      await supabase
        .from('store_settings')
        .upsert({ ...localSettingsCache, id: 1 });
    } catch {
      // Supabase in test/placeholder mode, local state retained
    }

    // Revalidate all storefront and admin paths affected by settings
    revalidatePath('/');
    revalidatePath('/bijoux');
    revalidatePath('/panier');
    revalidatePath('/checkout');
    revalidatePath('/admin/parametres');
    revalidatePath('/admin');

    return { success: true, settings: localSettingsCache };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour des paramètres';
    return { success: false, error: message };
  }
}

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
