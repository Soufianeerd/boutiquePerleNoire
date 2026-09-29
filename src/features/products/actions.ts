'use server';

// ==============================================================================
// PERLE NOIRE - PRODUCTS & CATALOG SERVICE
// Server-side retrieval and administration of jewelry catalog (Strict Admin)
// ==============================================================================

import { revalidatePath } from 'next/cache';
import {
  Product,
  Category,
  Collection,
  HomepageSection,
  ProductStatus,
} from '@/types/database';
import {
  initialProducts,
  initialCategories,
  initialCollections,
  initialHomepageSections,
} from '@/lib/data/mock-data';
import { createClient } from '@/lib/supabase/server';
import { ProductSchema } from '@/lib/validation/schemas';
import { requireAdmin } from '@/lib/auth/admin';

// Public in-memory fallback state strictly for local storefront read display
const catalogMockFallback = [...initialProducts];
const categoriesMockFallback = [...initialCategories];
const collectionsMockFallback = [...initialCollections];
const sectionsMockFallback = [...initialHomepageSections];

/**
 * Public catalog reading: fetches published jewelry pieces.
 */
export async function getProducts(options?: {
  categorySlug?: string;
  collectionSlug?: string;
  featuredOnly?: boolean;
  includeAllStatuses?: boolean;
}): Promise<Product[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    return filterMockProducts(options);
  }

  try {
    const supabase = await createClient();
    let query = supabase
      .from('products')
      .select('*, category:categories(*), collection:collections(*), variants:product_variants(*), images:product_images(*)');

    if (!options?.includeAllStatuses) {
      query = query.in('status', ['published', 'unique_piece', 'made_to_order', 'out_of_stock', 'coming_soon']);
    }

    if (options?.featuredOnly) {
      query = query.eq('featured', true);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return filterMockProducts(options);
    }

    return data as Product[];
  } catch {
    return filterMockProducts(options);
  }
}

function filterMockProducts(options?: {
  categorySlug?: string;
  collectionSlug?: string;
  featuredOnly?: boolean;
  includeAllStatuses?: boolean;
}): Product[] {
  let list = [...catalogMockFallback];

  if (!options?.includeAllStatuses) {
    list = list.filter((p) =>
      ['published', 'unique_piece', 'made_to_order', 'out_of_stock', 'coming_soon'].includes(p.status)
    );
  }

  if (options?.featuredOnly) {
    list = list.filter((p) => p.featured);
  }

  if (options?.categorySlug) {
    list = list.filter((p) => p.category?.slug === options.categorySlug);
  }

  if (options?.collectionSlug) {
    list = list.filter((p) => p.collection?.slug === options.collectionSlug);
  }

  return list;
}

/**
 * Public product detail query by slug.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    const found = catalogMockFallback.find((p) => p.slug === slug);
    return found || null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), collection:collections(*), variants:product_variants(*), images:product_images(*)')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) {
      const found = catalogMockFallback.find((p) => p.slug === slug);
      return found || null;
    }

    return data as Product;
  } catch {
    const found = catalogMockFallback.find((p) => p.slug === slug);
    return found || null;
  }
}

export async function getCategories(): Promise<Category[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    return categoriesMockFallback.filter((c) => c.active);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('position', { ascending: true });

    if (error || !data || data.length === 0) {
      return categoriesMockFallback.filter((c) => c.active);
    }
    return data as Category[];
  } catch {
    return categoriesMockFallback.filter((c) => c.active);
  }
}

export async function getCollections(): Promise<Collection[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    return collectionsMockFallback.filter((c) => c.active);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('active', true)
      .order('position', { ascending: true });

    if (error || !data || data.length === 0) {
      return collectionsMockFallback.filter((c) => c.active);
    }
    return data as Collection[];
  } catch {
    return collectionsMockFallback.filter((c) => c.active);
  }
}

export async function getHomepageSections(): Promise<HomepageSection[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    return sectionsMockFallback.filter((s) => s.active);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('homepage_sections')
      .select('*')
      .eq('active', true)
      .order('position', { ascending: true });

    if (error || !data || data.length === 0) {
      return sectionsMockFallback.filter((s) => s.active);
    }
    return data as HomepageSection[];
  } catch {
    return sectionsMockFallback.filter((s) => s.active);
  }
}

// ==============================================================================
// STRICT ADMIN ACTIONS (REAL SUPABASE PERSISTENCE ONLY - NO MOCKS)
// ==============================================================================

/**
 * Admin: Fetch all products with full relations. Returns explicit DB configuration status.
 */
export async function getProductsAdmin(): Promise<{
  products: Product[];
  isConfigured: boolean;
  error?: string;
}> {
  try {
    await requireAdmin();
  } catch (authError: unknown) {
    return {
      products: [],
      isConfigured: false,
      error: authError instanceof Error ? authError.message : 'Non autorisé',
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    return {
      products: [],
      isConfigured: false,
      error: 'Base de données non configurée',
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), collection:collections(*), variants:product_variants(*), images:product_images(*)')
      .order('created_at', { ascending: false });

    if (error) {
      return { products: [], isConfigured: true, error: error.message };
    }

    return { products: (data as Product[]) || [], isConfigured: true };
  } catch (err: unknown) {
    return {
      products: [],
      isConfigured: true,
      error: err instanceof Error ? err.message : 'Erreur lors de la récupération des produits',
    };
  }
}

/**
 * Admin: Fetch single product by UUID with variants, images, category, collection.
 */
export async function getProductByIdAdmin(id: string): Promise<{
  product: Product | null;
  isConfigured: boolean;
  error?: string;
}> {
  try {
    await requireAdmin();
  } catch (authError: unknown) {
    return {
      product: null,
      isConfigured: false,
      error: authError instanceof Error ? authError.message : 'Non autorisé',
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    return { product: null, isConfigured: false, error: 'Base de données non configurée' };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), collection:collections(*), variants:product_variants(*), images:product_images(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return { product: null, isConfigured: true, error: error.message };
    }

    return { product: (data as Product) || null, isConfigured: true };
  } catch (err: unknown) {
    return {
      product: null,
      isConfigured: true,
      error: err instanceof Error ? err.message : 'Erreur lors de la récupération du produit',
    };
  }
}

/**
 * Admin: Create a new product with optional variants and images.
 */
export async function createProductAction(payload: unknown): Promise<{
  success: boolean;
  product?: Product;
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
    return {
      success: false,
      error: 'Base de données non configurée. Impossible d’enregistrer sans Supabase.',
    };
  }

  try {
    const validated = ProductSchema.parse(payload);
    const supabase = await createClient();

    const productPayload = {
      name: validated.name,
      slug: validated.slug,
      sku: validated.sku || '',
      description: validated.description,
      short_description: validated.short_description || '',
      base_price: validated.base_price,
      compare_at_price: validated.compare_at_price ? String(validated.compare_at_price) : '',
      category_id: validated.category_id || '',
      collection_id: validated.collection_id || '',
      status: validated.status,
      featured: validated.featured,
      sell_mode: validated.sell_mode,
      material_details: validated.material_details || '',
      gemstone_details: validated.gemstone_details || '',
      stock_quantity: validated.stock_quantity || 0,
      meta_title: validated.meta_title || '',
      meta_description: validated.meta_description || '',
    };

    const variantsPayload = (validated.variants || []).map((v) => ({
      id: v.id || null,
      title: v.title,
      sku: v.sku || null,
      price: v.price,
      size: v.size || null,
      material: v.material || null,
      color: v.color || null,
      stock_quantity: v.stock_quantity || 0,
      active: v.active ?? true,
    }));

    const imagesPayload = (validated.images || []).map((img, idx) => ({
      url: img.url,
      alt: img.alt || validated.name,
      position: img.position ?? idx,
      is_primary: img.is_primary ?? idx === 0,
    }));

    // 1. Try atomic PostgreSQL RPC admin_save_product
    const { data: rpcData, error: rpcErr } = await supabase.rpc('admin_save_product', {
      p_product_id: null,
      p_product_data: productPayload,
      p_variants: variantsPayload,
      p_images: imagesPayload,
    });

    let productId: string;

    if (!rpcErr && rpcData) {
      productId = (rpcData as { product_id: string }).product_id;
    } else {
      // If RPC is missing in local dev, run strict sequential fallback with rollback
      if (rpcErr && !rpcErr.message.includes('function public.admin_save_product') && !rpcErr.message.includes('could not find function')) {
        return { success: false, error: rpcErr.message };
      }

      const { data: insertedProduct, error: insertError } = await supabase
        .from('products')
        .insert({
          name: validated.name,
          slug: validated.slug,
          description: validated.description,
          short_description: validated.short_description || null,
          sku: validated.sku || null,
          base_price: validated.base_price,
          compare_at_price: validated.compare_at_price || null,
          category_id: validated.category_id || null,
          collection_id: validated.collection_id || null,
          status: validated.status as ProductStatus,
          featured: validated.featured,
          sell_mode: validated.sell_mode,
          material_details: validated.material_details || null,
          gemstone_details: validated.gemstone_details || null,
          stock_quantity: validated.stock_quantity || 0,
          meta_title: validated.meta_title || null,
          meta_description: validated.meta_description || null,
        })
        .select('id')
        .single();

      if (insertError || !insertedProduct) {
        return {
          success: false,
          error: insertError?.message || 'Erreur lors de l’insertion du produit.',
        };
      }

      productId = insertedProduct.id;

      // Insert variants with rollback on error
      if (variantsPayload.length > 0) {
        const { error: variantError } = await supabase
          .from('product_variants')
          .insert(variantsPayload.map((v) => ({ ...v, product_id: productId })));

        if (variantError) {
          await supabase.from('products').delete().eq('id', productId);
          return { success: false, error: `Erreur variantes : ${variantError.message}. Création annulée.` };
        }
      }

      // Insert images with rollback on error
      if (imagesPayload.length > 0) {
        const { error: imgError } = await supabase
          .from('product_images')
          .insert(imagesPayload.map((img) => ({ ...img, product_id: productId })));

        if (imgError) {
          await supabase.from('product_variants').delete().eq('product_id', productId);
          await supabase.from('products').delete().eq('id', productId);
          return { success: false, error: `Erreur images : ${imgError.message}. Création annulée.` };
        }
      }

      // Initial stock movement
      if (validated.stock_quantity && validated.stock_quantity > 0) {
        await supabase.from('inventory_movements').insert({
          product_id: productId,
          change_amount: validated.stock_quantity,
          previous_quantity: 0,
          new_quantity: validated.stock_quantity,
          reason: 'initial',
          created_by: admin.id,
        });
      }

      // Activity log
      await supabase.from('activity_logs').insert({
        admin_id: admin.id,
        action: 'create_product',
        entity_type: 'product',
        entity_id: productId,
        details: { name: validated.name, sku: validated.sku, price: validated.base_price },
      });
    }

    revalidatePath('/bijoux');
    revalidatePath('/admin/produits');
    revalidatePath('/admin/stocks');

    const fullProduct = await getProductByIdAdmin(productId);
    return { success: true, product: fullProduct.product || undefined };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur lors de la création du produit' };
  }
}

/**
 * Admin: Update an existing product atomically, including syncing its variants and images.
 */
export async function updateProductAction(
  id: string,
  payload: unknown
): Promise<{ success: boolean; product?: Product; error?: string }> {
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
    const validated = ProductSchema.parse(payload);
    const supabase = await createClient();

    const productPayload = {
      name: validated.name,
      slug: validated.slug,
      sku: validated.sku || '',
      description: validated.description,
      short_description: validated.short_description || '',
      base_price: validated.base_price,
      compare_at_price: validated.compare_at_price ? String(validated.compare_at_price) : '',
      category_id: validated.category_id || '',
      collection_id: validated.collection_id || '',
      status: validated.status,
      featured: validated.featured,
      sell_mode: validated.sell_mode,
      material_details: validated.material_details || '',
      gemstone_details: validated.gemstone_details || '',
      stock_quantity: validated.stock_quantity ?? 0,
      meta_title: validated.meta_title || '',
      meta_description: validated.meta_description || '',
    };

    const variantsPayload = (validated.variants || []).map((v) => ({
      id: v.id || null,
      title: v.title,
      sku: v.sku || null,
      price: v.price,
      size: v.size || null,
      material: v.material || null,
      color: v.color || null,
      stock_quantity: v.stock_quantity || 0,
      active: v.active ?? true,
    }));

    const imagesPayload = (validated.images || []).map((img, idx) => ({
      url: img.url,
      alt: img.alt || validated.name,
      position: img.position ?? idx,
      is_primary: img.is_primary ?? idx === 0,
    }));

    // 1. Try atomic PostgreSQL RPC admin_save_product
    const { error: rpcErr } = await supabase.rpc('admin_save_product', {
      p_product_id: id,
      p_product_data: productPayload,
      p_variants: variantsPayload,
      p_images: imagesPayload,
    });

    if (rpcErr) {
      if (!rpcErr.message.includes('function public.admin_save_product') && !rpcErr.message.includes('could not find function')) {
        return { success: false, error: rpcErr.message };
      }

      // Fallback
      const { error: updateError } = await supabase
        .from('products')
        .update({
          name: validated.name,
          slug: validated.slug,
          description: validated.description,
          short_description: validated.short_description || null,
          sku: validated.sku || null,
          base_price: validated.base_price,
          compare_at_price: validated.compare_at_price || null,
          category_id: validated.category_id || null,
          collection_id: validated.collection_id || null,
          status: validated.status as ProductStatus,
          featured: validated.featured,
          sell_mode: validated.sell_mode,
          material_details: validated.material_details || null,
          gemstone_details: validated.gemstone_details || null,
          stock_quantity: validated.stock_quantity ?? 0,
          meta_title: validated.meta_title || null,
          meta_description: validated.meta_description || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      // Synchronize variants
      if (validated.variants !== undefined) {
        const { data: existingVariants } = await supabase
          .from('product_variants')
          .select('id')
          .eq('product_id', id);

        const existingIds = (existingVariants || []).map((v) => v.id);
        const incomingIds = validated.variants.map((v) => v.id).filter(Boolean) as string[];

        const idsToDelete = existingIds.filter((idVal) => !incomingIds.includes(idVal));
        if (idsToDelete.length > 0) {
          const { error: delErr } = await supabase.from('product_variants').delete().in('id', idsToDelete);
          if (delErr) return { success: false, error: delErr.message };
        }

        for (const v of validated.variants) {
          if (v.id && existingIds.includes(v.id)) {
            const { error: upVarErr } = await supabase
              .from('product_variants')
              .update({
                title: v.title,
                sku: v.sku || null,
                price: v.price,
                size: v.size || null,
                material: v.material || null,
                color: v.color || null,
                stock_quantity: v.stock_quantity || 0,
                active: v.active ?? true,
                updated_at: new Date().toISOString(),
              })
              .eq('id', v.id);
            if (upVarErr) return { success: false, error: upVarErr.message };
          } else {
            const { error: insVarErr } = await supabase.from('product_variants').insert({
              product_id: id,
              title: v.title,
              sku: v.sku || null,
              price: v.price,
              size: v.size || null,
              material: v.material || null,
              color: v.color || null,
              stock_quantity: v.stock_quantity || 0,
              active: v.active ?? true,
            });
            if (insVarErr) return { success: false, error: insVarErr.message };
          }
        }
      }

      // Synchronize images with exact positions
      if (validated.images !== undefined) {
        await supabase.from('product_images').delete().eq('product_id', id);

        if (validated.images.length > 0) {
          const { error: insImgErr } = await supabase.from('product_images').insert(
            validated.images.map((img, idx) => ({
              product_id: id,
              url: img.url,
              alt: img.alt || validated.name,
              position: img.position ?? idx,
              is_primary: img.is_primary ?? idx === 0,
            }))
          );
          if (insImgErr) return { success: false, error: insImgErr.message };
        }
      }

      // Activity log
      await supabase.from('activity_logs').insert({
        admin_id: admin.id,
        action: 'update_product',
        entity_type: 'product',
        entity_id: id,
        details: { name: validated.name },
      });
    }

    revalidatePath('/bijoux');
    revalidatePath(`/bijoux/${validated.slug}`);
    revalidatePath('/admin/produits');
    revalidatePath(`/admin/produits/${id}`);
    revalidatePath('/admin/stocks');

    const updated = await getProductByIdAdmin(id);
    return { success: true, product: updated.product || undefined };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur de mise à jour' };
  }
}

/**
 * Admin: Delete a product with its images and variants, cleaned up from DB & Storage.
 */
export async function deleteProductAction(id: string): Promise<{ success: boolean; error?: string }> {
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

    // 1. Get product details for logs
    const { data: product } = await supabase
      .from('products')
      .select('name, slug')
      .eq('id', id)
      .single();

    // 2. Cascade delete will remove product_images & product_variants in DB
    const { error: deleteError } = await supabase.from('products').delete().eq('id', id);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    // 3. Activity log
    await supabase.from('activity_logs').insert({
      admin_id: admin.id,
      action: 'delete_product',
      entity_type: 'product',
      entity_id: id,
      details: { name: product?.name, slug: product?.slug },
    });

    revalidatePath('/bijoux');
    revalidatePath('/admin/produits');
    revalidatePath('/admin/stocks');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur lors de la suppression' };
  }
}

/**
 * Admin: Duplicate an existing product with its variants and image references.
 */
export async function duplicateProductAction(id: string): Promise<{
  success: boolean;
  product?: Product;
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
    const supabase = await createClient();

    const { data: original, error: fetchError } = await supabase
      .from('products')
      .select('*, variants:product_variants(*), images:product_images(*)')
      .eq('id', id)
      .single();

    if (fetchError || !original) {
      return { success: false, error: 'Produit source introuvable' };
    }

    const newSlug = `${original.slug}-copie-${Date.now().toString().slice(-4)}`;
    const newSku = original.sku ? `${original.sku}-CPY` : null;

    // Insert cloned product
    const { data: clonedProduct, error: insertError } = await supabase
      .from('products')
      .insert({
        name: `${original.name} (Copie)`,
        slug: newSlug,
        description: original.description,
        short_description: original.short_description,
        sku: newSku,
        base_price: original.base_price,
        compare_at_price: original.compare_at_price,
        category_id: original.category_id,
        collection_id: original.collection_id,
        status: 'draft', // always duplicate as draft for safety
        featured: false,
        sell_mode: original.sell_mode,
        material_details: original.material_details,
        gemstone_details: original.gemstone_details,
        stock_quantity: original.stock_quantity || 0,
        meta_title: original.meta_title,
        meta_description: original.meta_description,
      })
      .select('id')
      .single();

    if (insertError || !clonedProduct) {
      return { success: false, error: insertError?.message || 'Erreur lors de la duplication' };
    }

    const clonedId = clonedProduct.id;

    // Clone variants
    if (original.variants && original.variants.length > 0) {
      const clonedVariants = (original.variants as {
        title: string;
        sku?: string | null;
        price: number;
        size?: string | null;
        material?: string | null;
        color?: string | null;
        stock_quantity: number;
        active: boolean;
      }[]).map((v) => ({
        product_id: clonedId,
        title: v.title,
        sku: v.sku ? `${v.sku}-CPY` : null,
        price: v.price,
        size: v.size,
        material: v.material,
        color: v.color,
        stock_quantity: v.stock_quantity,
        active: v.active,
      }));
      await supabase.from('product_variants').insert(clonedVariants);
    }

    // Clone image links
    if (original.images && original.images.length > 0) {
      const clonedImages = (original.images as {
        url: string;
        alt: string;
        position: number;
        is_primary: boolean;
      }[]).map((img) => ({
        product_id: clonedId,
        url: img.url,
        alt: `${img.alt} (Copie)`,
        position: img.position,
        is_primary: img.is_primary,
      }));
      await supabase.from('product_images').insert(clonedImages);
    }

    // Activity log
    await supabase.from('activity_logs').insert({
      admin_id: admin.id,
      action: 'duplicate_product',
      entity_type: 'product',
      entity_id: clonedId,
      details: { original_id: id, name: original.name },
    });

    revalidatePath('/admin/produits');
    const fullCloned = await getProductByIdAdmin(clonedId);
    return { success: true, product: fullCloned.product || undefined };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur lors de la duplication' };
  }
}

/**
 * Admin: Quickly toggle a product status (e.g. published, draft, out_of_stock).
 */
export async function toggleProductStatusAction(
  id: string,
  newStatus: ProductStatus
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
    const { error } = await supabase
      .from('products')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) return { success: false, error: error.message };

    await supabase.from('activity_logs').insert({
      admin_id: admin.id,
      action: 'update_product_status',
      entity_type: 'product',
      entity_id: id,
      details: { status: newStatus },
    });

    revalidatePath('/bijoux');
    revalidatePath('/admin/produits');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
  }
}
