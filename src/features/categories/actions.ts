'use server';

// ==============================================================================
// PERLE NOIRE - CATEGORIES SERVICE
// Server-side retrieval and administration of categories with product protection
// ==============================================================================

import { revalidatePath } from 'next/cache';
import { Category } from '@/types/database';
import { createClient } from '@/lib/supabase/server';
import { CategorySchema } from '@/lib/validation/schemas';
import { requireAdmin } from '@/lib/auth/admin';

export interface CategoryWithCount extends Category {
  products_count: number;
}

/**
 * Admin: Fetch all categories with product counts.
 */
export async function getCategoriesAdmin(): Promise<{
  categories: CategoryWithCount[];
  isConfigured: boolean;
  error?: string;
}> {
  try {
    await requireAdmin();
  } catch (authError: unknown) {
    return {
      categories: [],
      isConfigured: false,
      error: authError instanceof Error ? authError.message : 'Non autorisé',
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    return { categories: [], isConfigured: false, error: 'Base de données non configurée' };
  }

  try {
    const supabase = await createClient();
    const [catRes, prodRes] = await Promise.all([
      supabase.from('categories').select('*').order('position', { ascending: true }),
      supabase.from('products').select('category_id'),
    ]);

    if (catRes.error) {
      return { categories: [], isConfigured: true, error: catRes.error.message };
    }

    const products = prodRes.data || [];
    const categoriesWithCount = (catRes.data || []).map((cat) => ({
      ...cat,
      products_count: products.filter((p) => p.category_id === cat.id).length,
    }));

    return { categories: categoriesWithCount, isConfigured: true };
  } catch (err: unknown) {
    return {
      categories: [],
      isConfigured: true,
      error: err instanceof Error ? err.message : 'Erreur lors de la récupération des catégories',
    };
  }
}

/**
 * Admin: Create a new category.
 */
export async function createCategoryAction(payload: unknown): Promise<{
  success: boolean;
  category?: Category;
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
    const validated = CategorySchema.parse(payload);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('categories')
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
      action: 'create_category',
      entity_type: 'category',
      entity_id: data.id,
      details: { name: validated.name, slug: validated.slug },
    });

    revalidatePath('/collections');
    revalidatePath('/admin/categories');
    return { success: true, category: data as Category };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur lors de la création' };
  }
}

/**
 * Admin: Update an existing category.
 */
export async function updateCategoryAction(
  id: string,
  payload: unknown
): Promise<{ success: boolean; category?: Category; error?: string }> {
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
    const validated = CategorySchema.parse(payload);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('categories')
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
      action: 'update_category',
      entity_type: 'category',
      entity_id: id,
      details: { name: validated.name },
    });

    revalidatePath('/collections');
    revalidatePath('/admin/categories');
    return { success: true, category: data as Category };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
  }
}

/**
 * Admin: Delete a category with safety checks for assigned products.
 */
export async function deleteCategoryAction(
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

    // 1. Check if products use this category
    const { count, error: countErr } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id);

    if (countErr) return { success: false, error: countErr.message };

    const assignedCount = count || 0;

    if (assignedCount > 0 && strategy === 'prevent') {
      return {
        success: false,
        affectedProducts: assignedCount,
        error: `Cette catégorie est associée à ${assignedCount} produit(s). Choisissez de détacher les produits avant de la supprimer.`,
      };
    }

    // 2. Detach products if requested
    if (assignedCount > 0 && strategy === 'detach') {
      await supabase
        .from('products')
        .update({ category_id: null })
        .eq('category_id', id);
    }

    // 3. Delete category
    const { error: delErr } = await supabase.from('categories').delete().eq('id', id);
    if (delErr) return { success: false, error: delErr.message };

    await supabase.from('activity_logs').insert({
      admin_id: admin.id,
      action: 'delete_category',
      entity_type: 'category',
      entity_id: id,
      details: { detachedProducts: assignedCount },
    });

    revalidatePath('/collections');
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
  }
}

/**
 * Admin: Toggle category active status.
 */
export async function toggleCategoryActiveAction(
  id: string,
  active: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();
    const supabase = await createClient();

    const { error } = await supabase
      .from('categories')
      .update({ active, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) return { success: false, error: error.message };

    await supabase.from('activity_logs').insert({
      admin_id: admin.id,
      action: 'update_category',
      entity_type: 'category',
      entity_id: id,
      details: { active },
    });

    revalidatePath('/collections');
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
  }
}
