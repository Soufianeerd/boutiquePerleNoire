'use server';

// ==============================================================================
// PERLE NOIRE - HOMEPAGE SECTIONS SERVICE
// Server-side administration of visual storytelling & homepage sections
// ==============================================================================

import { revalidatePath } from 'next/cache';
import { HomepageSection } from '@/types/database';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';

/**
 * Admin: Fetch all homepage sections ordered by position.
 */
export async function getHomepageSectionsAdmin(): Promise<{
  sections: HomepageSection[];
  isConfigured: boolean;
  error?: string;
}> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    return { sections: [], isConfigured: false, error: 'Base de données non configurée' };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('homepage_sections')
      .select('*')
      .order('position', { ascending: true });

    if (error) {
      return { sections: [], isConfigured: true, error: error.message };
    }

    return { sections: (data as HomepageSection[]) || [], isConfigured: true };
  } catch (err: unknown) {
    return {
      sections: [],
      isConfigured: true,
      error: err instanceof Error ? err.message : 'Erreur lors de la récupération des sections',
    };
  }
}

/**
 * Admin: Update a homepage section's metadata and structured JSON content.
 */
export async function updateHomepageSectionAction(
  id: string,
  payload: {
    title?: string | null;
    subtitle?: string | null;
    active?: boolean;
    content_json?: Record<string, unknown>;
  }
): Promise<{ success: boolean; section?: HomepageSection; error?: string }> {
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

    const updateFields: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (payload.title !== undefined) updateFields.title = payload.title;
    if (payload.subtitle !== undefined) updateFields.subtitle = payload.subtitle;
    if (payload.active !== undefined) updateFields.active = payload.active;
    if (payload.content_json !== undefined) updateFields.content_json = payload.content_json;

    const { data, error } = await supabase
      .from('homepage_sections')
      .update(updateFields)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || 'Erreur de mise à jour' };
    }

    await supabase.from('activity_logs').insert({
      admin_id: admin.id,
      action: 'update_homepage',
      entity_type: 'homepage_section',
      entity_id: id,
      details: { title: payload.title, active: payload.active },
    });

    revalidatePath('/');
    revalidatePath('/admin/contenu');
    return { success: true, section: data as HomepageSection };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
  }
}

/**
 * Admin: Toggle homepage section active status.
 */
export async function toggleHomepageSectionActiveAction(
  id: string,
  active: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();
    const supabase = await createClient();

    const { error } = await supabase
      .from('homepage_sections')
      .update({ active, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) return { success: false, error: error.message };

    await supabase.from('activity_logs').insert({
      admin_id: admin.id,
      action: 'update_homepage',
      entity_type: 'homepage_section',
      entity_id: id,
      details: { active },
    });

    revalidatePath('/');
    revalidatePath('/admin/contenu');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
  }
}

/**
 * Admin: Reorder homepage sections.
 */
export async function reorderHomepageSectionsAction(
  orderedIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();
    const supabase = await createClient();

    for (let i = 0; i < orderedIds.length; i++) {
      await supabase
        .from('homepage_sections')
        .update({ position: i, updated_at: new Date().toISOString() })
        .eq('id', orderedIds[i]);
    }

    await supabase.from('activity_logs').insert({
      admin_id: admin.id,
      action: 'update_homepage',
      entity_type: 'homepage_section',
      entity_id: null,
      details: { reordered: true, count: orderedIds.length },
    });

    revalidatePath('/');
    revalidatePath('/admin/contenu');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur lors du réordonnancement' };
  }
}
