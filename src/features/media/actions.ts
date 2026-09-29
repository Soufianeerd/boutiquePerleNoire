'use server';

// ==============================================================================
// PERLE NOIRE - MEDIA STORAGE SERVICE
// Secure Supabase Storage file uploads, deletion and media library queries
// ==============================================================================

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { MediaItem } from '@/types/database';

const MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

const ALLOWED_MIME_TYPES = Object.keys(MIME_TO_EXTENSION);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'jewelry-media';

export interface UploadResult {
  success: boolean;
  media?: MediaItem;
  url?: string;
  error?: string;
}

export interface MediaUsageDetails {
  productsCount: number;
  categoriesCount: number;
  collectionsCount: number;
  isUsedInLogo: boolean;
  isUsedInHomepage: boolean;
  totalUsage: number;
  usageDescription: string;
}

/**
 * Validates the file buffer against known image magic bytes / signatures.
 */
function validateMagicBytes(buffer: Buffer, declaredMime: string): boolean {
  if (buffer.length < 12) return false;

  switch (declaredMime) {
    case 'image/jpeg':
      // JPEG starts with FF D8 FF
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;

    case 'image/png':
      // PNG starts with 89 50 4E 47 0D 0A 1A 0A
      return (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a
      );

    case 'image/webp':
      // WebP starts with RIFF (bytes 0-3) and WEBP (bytes 8-11)
      return (
        buffer.toString('ascii', 0, 4) === 'RIFF' &&
        buffer.toString('ascii', 8, 12) === 'WEBP'
      );

    case 'image/avif':
      // AVIF / ISO-BMFF: bytes 4-8 are 'ftyp'
      return buffer.toString('ascii', 4, 8) === 'ftyp';

    default:
      return false;
  }
}

/**
 * Uploads an image file to Supabase Storage with strict MIME, magic bytes, and size validation.
 * Stores storage_path explicitly for reliable operations.
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

  // 1. Validate MIME from whitelist
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

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Inspect magic bytes for actual content / MIME integrity
    const isValidSignature = validateMagicBytes(buffer, file.type);
    if (!isValidSignature) {
      return {
        success: false,
        error: `Incohérence détectée : le contenu réel du fichier ne correspond pas au format déclaré (${file.type}).`,
      };
    }

    // 4. Derive canonical extension strictly from verified MIME, never from user filename
    const canonicalExtension = MIME_TO_EXTENSION[file.type] || 'webp';
    const randomUuid = crypto.randomUUID();
    const folder = productId ? `products/${productId}` : 'uploads';
    const storagePath = `${folder}/${randomUuid}.${canonicalExtension}`;

    // 5. Upload to Supabase Storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (storageError) {
      return { success: false, error: `Erreur Storage : ${storageError.message}` };
    }

    // 6. Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    const publicUrl = publicUrlData.publicUrl;

    // 7. Insert record into `media` table with explicit storage_path
    const { data: mediaRecord, error: dbError } = await supabase
      .from('media')
      .insert({
        filename: file.name.replace(/[^a-zA-Z0-9.-]/g, '_'),
        file_path: publicUrl,
        storage_path: storagePath,
        file_size: file.size,
        mime_type: file.type,
        alt_text: altText || file.name,
        bucket: BUCKET_NAME,
      })
      .select('*')
      .single();

    if (dbError) {
      // Rollback storage file on DB insert failure
      await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
      return { success: false, error: `Erreur DB : ${dbError.message}` };
    }

    // 8. Activity log
    await supabase.from('activity_logs').insert({
      admin_id: admin.id,
      action: 'upload_media',
      entity_type: 'media',
      entity_id: mediaRecord.id,
      details: {
        filename: mediaRecord.filename,
        storage_path: storagePath,
        mime_type: file.type,
      },
    });

    revalidatePath('/admin/medias');
    return {
      success: true,
      media: mediaRecord as MediaItem,
      url: publicUrl,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erreur lors du téléversement',
    };
  }
}

/**
 * Checks usage of a media URL across product images, categories, collections, settings, and sections.
 */
async function inspectMediaUsage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  targetUrl: string,
  targetStoragePath?: string | null
): Promise<MediaUsageDetails> {
  const [
    prodImagesRes,
    catImagesRes,
    catHeroRes,
    colImagesRes,
    colHeroRes,
    settingsRes,
    sectionsRes,
  ] = await Promise.all([
    supabase.from('product_images').select('product_id').eq('url', targetUrl),
    supabase.from('categories').select('id').eq('image_url', targetUrl),
    supabase.from('categories').select('id').eq('hero_url', targetUrl),
    supabase.from('collections').select('id').eq('image_url', targetUrl),
    supabase.from('collections').select('id').eq('hero_url', targetUrl),
    supabase.from('store_settings').select('id').eq('logo_url', targetUrl),
    supabase.from('homepage_sections').select('id, content_json'),
  ]);

  const productsCount = prodImagesRes.data?.length || 0;
  const categoriesCount = (catImagesRes.data?.length || 0) + (catHeroRes.data?.length || 0);
  const collectionsCount = (colImagesRes.data?.length || 0) + (colHeroRes.data?.length || 0);
  const isUsedInLogo = (settingsRes.data?.length || 0) > 0;

  // Search homepage sections content_json
  let isUsedInHomepage = false;
  if (sectionsRes.data) {
    for (const sec of sectionsRes.data) {
      const jsonStr = JSON.stringify(sec.content_json || {});
      if (jsonStr.includes(targetUrl) || (targetStoragePath && jsonStr.includes(targetStoragePath))) {
        isUsedInHomepage = true;
        break;
      }
    }
  }

  const totalUsage =
    productsCount +
    categoriesCount +
    collectionsCount +
    (isUsedInLogo ? 1 : 0) +
    (isUsedInHomepage ? 1 : 0);

  const parts: string[] = [];
  if (productsCount > 0) parts.push(`${productsCount} bijou(x)`);
  if (categoriesCount > 0) parts.push(`${categoriesCount} catégorie(s)`);
  if (collectionsCount > 0) parts.push(`${collectionsCount} collection(s)`);
  if (isUsedInLogo) parts.push('Logo boutique');
  if (isUsedInHomepage) parts.push('Page d’accueil');

  return {
    productsCount,
    categoriesCount,
    collectionsCount,
    isUsedInLogo,
    isUsedInHomepage,
    totalUsage,
    usageDescription: parts.join(', ') || 'Non utilisé',
  };
}

/**
 * Admin: Fetch all uploaded media items with accurate usage counts across products, categories, collections, settings.
 */
export async function getMediaListAdmin(): Promise<{
  items: (MediaItem & { usage_count: number; usage_details?: string })[];
  isConfigured: boolean;
  error?: string;
}> {
  try {
    await requireAdmin();
  } catch (authError: unknown) {
    return {
      items: [],
      isConfigured: false,
      error: authError instanceof Error ? authError.message : 'Non autorisé',
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    return { items: [], isConfigured: false, error: 'Base de données non configurée' };
  }

  try {
    const supabase = await createClient();

    // Fetch media and all usage tables concurrently
    const [
      mediaRes,
      productImagesRes,
      categoriesRes,
      collectionsRes,
      settingsRes,
      sectionsRes,
    ] = await Promise.all([
      supabase.from('media').select('*').order('created_at', { ascending: false }),
      supabase.from('product_images').select('url'),
      supabase.from('categories').select('image_url, hero_url'),
      supabase.from('collections').select('image_url, hero_url'),
      supabase.from('store_settings').select('logo_url').eq('id', 1).maybeSingle(),
      supabase.from('homepage_sections').select('content_json'),
    ]);

    if (mediaRes.error) {
      return { items: [], isConfigured: true, error: mediaRes.error.message };
    }

    const prodUrls = (productImagesRes.data || []).map((img) => img.url);
    const catUrls: string[] = [];
    for (const c of categoriesRes.data || []) {
      if (c.image_url) catUrls.push(c.image_url);
      if (c.hero_url) catUrls.push(c.hero_url);
    }
    const colUrls: string[] = [];
    for (const col of collectionsRes.data || []) {
      if (col.image_url) colUrls.push(col.image_url);
      if (col.hero_url) colUrls.push(col.hero_url);
    }
    const logoUrl = settingsRes.data?.logo_url;
    const sectionsJson = JSON.stringify((sectionsRes.data || []).map((s) => s.content_json));

    const items = (mediaRes.data || []).map((m: MediaItem) => {
      const url = m.file_path;
      const sPath = m.storage_path;

      const pCount = prodUrls.filter((u) => u === url).length;
      const cCount = catUrls.filter((u) => u === url).length;
      const colCount = colUrls.filter((u) => u === url).length;
      const inLogo = logoUrl === url;
      const inHomepage = sectionsJson.includes(url) || Boolean(sPath && sectionsJson.includes(sPath));

      const total = pCount + cCount + colCount + (inLogo ? 1 : 0) + (inHomepage ? 1 : 0);

      const parts: string[] = [];
      if (pCount > 0) parts.push(`${pCount} bijou(x)`);
      if (cCount > 0) parts.push(`${cCount} catégorie(s)`);
      if (colCount > 0) parts.push(`${colCount} collection(s)`);
      if (inLogo) parts.push('Logo');
      if (inHomepage) parts.push('Accueil');

      return {
        ...m,
        usage_count: total,
        usage_details: parts.join(', ') || 'Non utilisé',
      };
    });

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
 * Deletes a media file using a compensatory soft-delete strategy:
 *
 * 1. requireAdmin
 * 2. usage_count must be 0
 * 3. Mark media as pending_delete (soft-delete)
 * 4. Delete from Storage
 * 5a. If Storage OK → hard-delete DB record
 * 5b. If Storage fails → rollback soft-delete flag (set back to active)
 *
 * Il est INTERDIT de prétendre que Storage + DB sont transactionnels : ils ne le sont pas.
 * Cette stratégie compensatoire garantit la cohérence dans les deux cas d'échec.
 *
 * Note : le parsing URL legacy est conservé uniquement pour les anciens
 * enregistrements sans storage_path. Les nouveaux médias ont toujours storage_path.
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

    // 1. Fetch media record
    const { data: media, error: fetchErr } = await supabase
      .from('media')
      .select('*')
      .eq('id', mediaId)
      .single();

    if (fetchErr || !media) {
      return { success: false, error: 'Média introuvable' };
    }

    // 2. Refuse si déjà en cours de suppression
    if (media.deleted_at !== null && media.deleted_at !== undefined) {
      return {
        success: false,
        error: 'Ce média est déjà en cours de suppression ou a été supprimé.',
      };
    }

    // 3. Vérification d'usage complète
    const usage = await inspectMediaUsage(supabase, media.file_path, media.storage_path);
    if (usage.totalUsage > 0) {
      return {
        success: false,
        error: `Impossible de supprimer ce média : il est actuellement utilisé (${usage.usageDescription}). Veuillez le dissocier avant suppression.`,
      };
    }

    // 4. Soft-delete préventif (marquage pending_delete)
    const { error: markErr } = await supabase
      .from('media')
      .update({
        deleted_at: new Date().toISOString(),
        deletion_status: 'pending_delete',
      })
      .eq('id', mediaId);

    if (markErr) {
      return { success: false, error: `Impossible de marquer le média pour suppression : ${markErr.message}` };
    }

    // 5. Résolution du chemin Storage
    // storage_path est obligatoire pour les nouveaux médias.
    // Pour les anciens médias (LEGACY), tentative de reconstruction depuis l'URL publique.
    let relativeStoragePath: string | null = media.storage_path || null;
    if (!relativeStoragePath && media.file_path) {
      // LEGACY FALLBACK : reconstruction depuis URL — uniquement pour les enregistrements
      // antérieurs à la migration 00005 qui n'ont pas de storage_path.
      try {
        const urlObj = new URL(media.file_path);
        const match = urlObj.pathname.match(/\/object\/public\/[^/]+\/(.+)$/);
        if (match && match[1]) {
          relativeStoragePath = decodeURIComponent(match[1]);
        }
      } catch {
        relativeStoragePath = null;
      }
    }

    // 6. Suppression Storage
    if (relativeStoragePath) {
      const { error: storageRemoveErr } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([relativeStoragePath]);

      if (storageRemoveErr) {
        // ROLLBACK : remettre le média à l'état actif
        await supabase
          .from('media')
          .update({ deleted_at: null, deletion_status: 'failed' })
          .eq('id', mediaId);

        return {
          success: false,
          error: `Échec de la suppression Storage : ${storageRemoveErr.message}. Le média a été restauré à l'état actif.`,
        };
      }
    }

    // 7. Suppression DB (après succès Storage confirmé)
    const { error: deleteErr } = await supabase.from('media').delete().eq('id', mediaId);

    if (deleteErr) {
      // Storage supprimé mais DB échoue → marquer 'deleted' (orphan connu, pas rollback possible)
      await supabase
        .from('media')
        .update({ deletion_status: 'deleted' })
        .eq('id', mediaId);

      return {
        success: false,
        error: `Le fichier Storage a été supprimé mais l'enregistrement DB n'a pas pu être supprimé : ${deleteErr.message}. Il sera nettoyé lors du prochain passage de maintenance.`,
      };
    }

    // 8. Audit log
    await supabase.from('activity_logs').insert({
      admin_id: admin.id,
      action: 'delete_media',
      entity_type: 'media',
      entity_id: mediaId,
      details: {
        filename: media.filename,
        storage_path: relativeStoragePath,
      },
    });

    revalidatePath('/admin/medias');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur lors de la suppression' };
  }
}

/**
 * Updates alt text of an existing media item.
 */
export async function updateMediaAltAction(
  mediaId: string,
  altText: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
  } catch (authError: unknown) {
    return { success: false, error: authError instanceof Error ? authError.message : 'Non autorisé' };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('media')
      .update({ alt_text: altText.trim() })
      .eq('id', mediaId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/medias');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur de mise à jour' };
  }
}
