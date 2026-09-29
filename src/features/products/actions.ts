'use server';

// ==============================================================================
// PERLE NOIRE - PRODUCTS & CATALOG SERVICE
// Server-side retrieval and administration of high jewelry catalog
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

// In-memory catalog state for instant local testing
const catalogMemory = [...initialProducts];
const categoriesMemory = [...initialCategories];
const collectionsMemory = [...initialCollections];
const sectionsMemory = [...initialHomepageSections];

export async function getProducts(options?: {
  categorySlug?: string;
  collectionSlug?: string;
  featuredOnly?: boolean;
  includeAllStatuses?: boolean;
}): Promise<Product[]> {
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
  let list = [...catalogMemory];

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

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), collection:collections(*), variants:product_variants(*), images:product_images(*)')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      const found = catalogMemory.find((p) => p.slug === slug);
      return found || null;
    }

    return data as Product;
  } catch {
    const found = catalogMemory.find((p) => p.slug === slug);
    return found || null;
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('position', { ascending: true });

    if (error || !data || data.length === 0) {
      return categoriesMemory.filter((c) => c.active);
    }
    return data as Category[];
  } catch {
    return categoriesMemory.filter((c) => c.active);
  }
}

export async function getCollections(): Promise<Collection[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('active', true)
      .order('position', { ascending: true });

    if (error || !data || data.length === 0) {
      return collectionsMemory.filter((c) => c.active);
    }
    return data as Collection[];
  } catch {
    return collectionsMemory.filter((c) => c.active);
  }
}

export async function getHomepageSections(): Promise<HomepageSection[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('homepage_sections')
      .select('*')
      .eq('active', true)
      .order('position', { ascending: true });

    if (error || !data || data.length === 0) {
      return sectionsMemory.filter((s) => s.active);
    }
    return data as HomepageSection[];
  } catch {
    return sectionsMemory.filter((s) => s.active);
  }
}

export async function createProductAction(payload: unknown): Promise<{
  success: boolean;
  product?: Product;
  error?: string;
}> {
  try {
    const validated = ProductSchema.parse(payload);
    const newProduct: Product = {
      id: `p-${Date.now()}`,
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    catalogMemory.unshift(newProduct);

    try {
      const supabase = await createClient();
      await supabase.from('products').insert(newProduct);
    } catch {
      // test fallback
    }

    revalidatePath('/bijoux');
    revalidatePath('/admin/produits');
    return { success: true, product: newProduct };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur lors de la création du bijou';
    return { success: false, error: msg };
  }
}
