'use server';

// ==============================================================================
// PERLE NOIRE - MEDIA STORAGE SERVICE
// Secure Supabase Storage file uploads, deletion and media library queries
// ==============================================================================

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { MediaItem } from '@/types/database';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'jewelry-media';

export interface UploadResult {
  success: boolean;
  media?: MediaItem;
  url?: string;
  error?: string;
}

/**
 * Uploads an image file to Supabase Storage with strict validation and registers in media table.
 */
export async function uploadMediaAction(formData: FormData): Promise<UploadResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (authError: unknown) {
    return { success: false, error: authError instanceof Error ? authError.message : 'Non autorisé' };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    return { success: false, error: 'Base de données non configurée. Impossible de téléverser.' };
  }

  const file = formData.get('file') as File | null;
  const productId = (formData.get('productId') as string) || null;
  const altText = (formData.get('altText') as string) || '';

  if (!file) {
    return { success: false, error: 'Aucun fichier fourni' };
  }

  // 1. Validate MIME
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      success: false,
      error: `Format de fichier non autorisé (${file.type}). Formats acceptés : JPEG, PNG, WebP, AVIF.`,
    };
  }

  // 2. Validate Size
  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: `Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} Mo). Taille maximale : 10 Mo.`,
    };
  }

  try {
    const supabase = await createClient();

    // 3. Generate non-predictable safe path
    const extension = file.name.split('.').pop()?.toLowerCase() || 'webp';
    const randomUuid = crypto.randomUUID();
    const folder = productId ? `products/${productId}` : 'uploads';
    const filePath = `${folder}/${randomUuid}.${extension}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Upload to Supabase Storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (storageError) {
      return { success: false, error: `Erreur Storage : ${storageError.message}` };
    }

    // 5. Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    // 6. Insert record into `media` table
    const { data: mediaRecord, error: dbError } = await supabase
      .from('media')
      .insert({
        filename: file.name.replace(/[^a-zA-Z0-9.-]/g, '_'),
        file_path: publicUrl,
        file_size: file.size,
        mime_type: file.type,
        alt_text: altText || file.name,
        bucket: BUCKET_NAME,
      })
      .select('*')
      .single();

    if (dbError) {
      // Rollback storage file on DB insert failure
      await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      return { success: false, error: `Erreur DB : ${dbError.message}` };
    }

    // 7. Audit log
    await supabase.from('activity_logs').insert({
      admin_id: admin.id,
      action: 'upload_media',
      entity_type: 'media',
      entity_id: mediaRecord.id,
      details: { filename: file.name, size: file.size, path: filePath },
    });

    revalidatePath('/admin/medias');
    return { success: true, media: mediaRecord as MediaItem, url: publicUrl };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur lors du téléversement' };
  }
}

/**
 * Fetch real media items from Supabase media table with usage count.
 */
export async function getMediaListAdmin(): Promise<{
  items: (MediaItem & { usage_count: number })[];
  isConfigured: boolean;
  error?: string;
}> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    return { items: [], isConfigured: false, error: 'Base de données non configurée' };
  }

  try {
    const supabase = await createClient();

    const [mediaRes, imagesRes] = await Promise.all([
      supabase.from('media').select('*').order('created_at', { ascending: false }),
      supabase.from('product_images').select('url'),
    ]);

    if (mediaRes.error) {
      return { items: [], isConfigured: true, error: mediaRes.error.message };
    }

    const usedUrls = (imagesRes.data || []).map((img) => img.url);

    const items = (mediaRes.data || []).map((m) => ({
      ...m,
      usage_count: usedUrls.filter((u) => u === m.file_path).length,
    }));

    return { items, isConfigured: true };
  } catch (err: unknown) {
    return {
      items: [],
      isConfigured: true,
      error: err instanceof Error ? err.message : 'Erreur lors de la récupération des médias',
    };
  }
}

/**
 * Deletes a media file from Storage and DB.
 */
export async function deleteMediaAction(mediaId: string): Promise<{ success: boolean; error?: string }> {
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

    // 1. Fetch media record to get path
    const { data: media, error: fetchErr } = await supabase
      .from('media')
      .select('*')
      .eq('id', mediaId)
      .single();

    if (fetchErr || !media) {
      return { success: false, error: 'Média introuvable' };
    }

    // 2. Check if currently used by product_images
    const { count } = await supabase
      .from('product_images')
      .select('*', { count: 'exact', head: true })
      .eq('url', media.file_path);

    if (count && count > 0) {
      return {
        success: false,
        error: `Impossible de supprimer ce média : il est utilisé par ${count} produit(s). Retirez-le des produits avant suppression.`,
      };
    }

    // 3. Extract storage relative path if possible
    try {
      const urlObj = new URL(media.file_path);
      const parts = urlObj.pathname.split(`/${BUCKET_NAME}/`);
      if (parts[1]) {
        await supabase.storage.from(BUCKET_NAME).remove([parts[1]]);
      }
    } catch {
      // Ignored if URL parsing fails
    }

    // 4. Delete from media table
    const { error: deleteErr } = await supabase.from('media').delete().eq('id', mediaId);

    if (deleteErr) {
      return { success: false, error: deleteErr.message };
    }

    // 5. Audit log
    await supabase.from('activity_logs').insert({
      admin_id: admin.id,
      action: 'delete_media',
      entity_type: 'media',
      entity_id: mediaId,
      details: { filename: media.filename },
    });

    revalidatePath('/admin/medias');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur lors de la suppression' };
  }
}

/**
 * Updates alt text for a media item.
 */
export async function updateMediaAltAction(
  mediaId: string,
  altText: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { error } = await supabase
      .from('media')
      .update({ alt_text: altText })
      .eq('id', mediaId);

    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/medias');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur de mise à jour' };
  }
}
