'use server';

// ==============================================================================
// PERLE NOIRE - PRODUCTS & CATALOG SERVICE
// Server-side retrieval and administration of high jewelry catalog (Hardened)
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

/**
 * Admin mutation: creates a new jewelry piece.
 * STRICT: Requires verified active admin and real PostgreSQL database persistence.
 */
export async function createProductAction(payload: unknown): Promise<{
  success: boolean;
  product?: Product;
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

  // 2. Reject if Supabase database is unconfigured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    return {
      success: false,
      error: 'Supabase n’est pas configuré. Impossible d’enregistrer une création sans base de données.',
    };
  }

  try {
    // 3. Strict schema validation
    const validated = ProductSchema.parse(payload);
    const supabase = await createClient();

    // 4. Insert into PostgreSQL - let database generate canonical UUID
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
      })
      .select('*, category:categories(*), collection:collections(*), variants:product_variants(*), images:product_images(*)')
      .single();

    if (insertError || !insertedProduct) {
      return {
        success: false,
        error: insertError?.message || 'Erreur lors de l’insertion du bijou en base de données.',
      };
    }

    // 5. Audit log
    await supabase.from('activity_logs').insert({
      admin_id: admin.id,
      action: 'create_product',
      entity_type: 'product',
      entity_id: insertedProduct.id,
      details: { name: validated.name, sku: validated.sku },
    });

    revalidatePath('/bijoux');
    revalidatePath('/admin/produits');
    return { success: true, product: insertedProduct as Product };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur lors de la création du bijou';
    return { success: false, error: msg };
  }
}
