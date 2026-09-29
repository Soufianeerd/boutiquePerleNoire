'use server';

// ==============================================================================
// PERLE NOIRE - COLLECTIONS SERVICE
// Server-side retrieval and administration of collections with product safety
// ==============================================================================

import { revalidatePath } from 'next/cache';
import { Collection } from '@/types/database';
import { createClient } from '@/lib/supabase/server';
import { CollectionSchema } from '@/lib/validation/schemas';
import { requireAdmin } from '@/lib/auth/admin';

export interface CollectionWithCount extends Collection {
  products_count: number;
}

/**
 * Admin: Fetch all collections with product counts.
 */
export async function getCollectionsAdmin(): Promise<{
  collections: CollectionWithCount[];
  isConfigured: boolean;
  error?: string;
}> {
  try {
    await requireAdmin();
  } catch (authError: unknown) {
    return {
      collections: [],
      isConfigured: false,
      error: authError instanceof Error ? authError.message : 'Non autorisé',
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    return { collections: [], isConfigured: false, error: 'Base de données non configurée' };
  }

  try {
    const supabase = await createClient();
    const [colRes, prodRes] = await Promise.all([
      supabase.from('collections').select('*').order('position', { ascending: true }),
      supabase.from('products').select('collection_id'),
    ]);

    if (colRes.error) {
      return { collections: [], isConfigured: true, error: colRes.error.message };
    }

    const products = prodRes.data || [];
    const collectionsWithCount = (colRes.data || []).map((col) => ({
      ...col,
      products_count: products.filter((p) => p.collection_id === col.id).length,
    }));

    return { collections: collectionsWithCount, isConfigured: true };
  } catch (err: unknown) {
    return {
      collections: [],
      isConfigured: true,
      error: err instanceof Error ? err.message : 'Erreur lors de la récupération des collections',
    };
  }
}

/**
 * Admin: Create a new collection.
 */
export async function createCollectionAction(payload: unknown): Promise<{
  success: boolean;
  collection?: Collection;
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
    const validated = CollectionSchema.parse(payload);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('collections')
      .insert({
        name: validated.name,
        slug: validated.slug,
        description: validated.description || null,
        image_url: validated.image_url || null,
        hero_url: validated.hero_url || null,
        position: validated.position ?? 0,
        active: validated.active ?? true,
        meta_title: validated.meta_title || null,
        meta_description: validated.meta_description || null,
      })
      .select('*')
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || 'Erreur d’insertion' };
    }

    await supabase.from('activity_logs').insert({
      admin_id: admin.id,
      action: 'create_collection',
      entity_type: 'collection',
      entity_id: data.id,
      details: { name: validated.name, slug: validated.slug },
    });

    revalidatePath('/collections');
    revalidatePath('/admin/collections');
    return { success: true, collection: data as Collection };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur lors de la création' };
  }
}

/**
 * Admin: Update an existing collection.
 */
export async function updateCollectionAction(
  id: string,
  payload: unknown
): Promise<{ success: boolean; collection?: Collection; error?: string }> {
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
    const validated = CollectionSchema.parse(payload);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('collections')
      .update({
        name: validated.name,
        slug: validated.slug,
        description: validated.description || null,
        image_url: validated.image_url || null,
        hero_url: validated.hero_url || null,
        position: validated.position,
        active: validated.active,
        meta_title: validated.meta_title || null,
        meta_description: validated.meta_description || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || 'Erreur de mise à jour' };
    }

    await supabase.from('activity_logs').insert({
      admin_id: admin.id,
      action: 'update_collection',
      entity_type: 'collection',
      entity_id: id,
      details: { name: validated.name },
    });

    revalidatePath('/collections');
    revalidatePath('/admin/collections');
    return { success: true, collection: data as Collection };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
  }
}

/**
 * Admin: Delete a collection with safety checks for assigned products.
 */
export async function deleteCollectionAction(
  id: string,
  strategy: 'prevent' | 'detach' = 'prevent'
): Promise<{ success: boolean; affectedProducts?: number; error?: string }> {
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

    const { count, error: countErr } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('collection_id', id);

    if (countErr) return { success: false, error: countErr.message };

    const assignedCount = count || 0;

    if (assignedCount > 0 && strategy === 'prevent') {
      return {
        success: false,
        affectedProducts: assignedCount,
        error: `Cette collection est associée à ${assignedCount} produit(s). Choisissez de détacher les produits avant de la supprimer.`,
      };
    }

    if (assignedCount > 0 && strategy === 'detach') {
      await supabase
        .from('products')
        .update({ collection_id: null })
        .eq('collection_id', id);
    }

    const { error: delErr } = await supabase.from('collections').delete().eq('id', id);
    if (delErr) return { success: false, error: delErr.message };

    await supabase.from('activity_logs').insert({
      admin_id: admin.id,
      action: 'delete_collection',
      entity_type: 'collection',
      entity_id: id,
      details: { detachedProducts: assignedCount },
    });

    revalidatePath('/collections');
    revalidatePath('/admin/collections');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
  }
}

/**
 * Admin: Toggle collection active status.
 */
export async function toggleCollectionActiveAction(
  id: string,
  active: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();
    const supabase = await createClient();

    const { error } = await supabase
      .from('collections')
      .update({ active, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) return { success: false, error: error.message };

    await supabase.from('activity_logs').insert({
      admin_id: admin.id,
      action: 'update_collection',
      entity_type: 'collection',
      entity_id: id,
      details: { active },
    });

    revalidatePath('/collections');
    revalidatePath('/admin/collections');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
  }
}
