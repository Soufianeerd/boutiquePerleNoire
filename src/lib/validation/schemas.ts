// ==============================================================================
// PERLE NOIRE - ZOD VALIDATION SCHEMAS
// Server-side strict input validation
// ==============================================================================

import { z } from 'zod';

export const StoreSettingsSchema = z.object({
  brand_name: z.string().min(2, 'Le nom de marque est requis').max(100),
  tagline: z.string().max(255).nullable().optional(),
  contact_email: z.string().email('Adresse e-mail invalide'),
  phone: z.string().max(50).nullable().optional(),
  whatsapp: z.string().max(50).nullable().optional(),
  instagram_url: z.string().url('URL Instagram invalide').nullable().or(z.literal('')).optional(),
  address: z.string().max(255).nullable().optional(),

  // Modes vitrine vs e-commerce
  commerce_enabled: z.boolean(),
  show_prices: z.boolean(),
  allow_guest_checkout: z.boolean(),

  default_contact_method: z.enum(['contact_form', 'whatsapp', 'phone', 'email']),
  currency: z.string().min(3).max(5),
  locale: z.string().min(2).max(10),

  stripe_enabled: z.boolean(),
  paypal_enabled: z.boolean(),

  low_stock_threshold: z.number().int().min(0).max(100),
  maintenance_mode: z.boolean(),
});

export const ProductSchema = z.object({
  name: z.string().min(2, 'Le nom du bijou est requis').max(255),
  slug: z.string().min(2).max(255).regex(/^[a-z0-9-]+$/, 'Slug invalide (minuscules et tirets uniquement)'),
  description: z.string().min(10, 'La description doit faire au moins 10 caractères'),
  short_description: z.string().max(500).nullable().optional(),
  sku: z.string().max(100).nullable().optional(),
  base_price: z.number().min(0, 'Le prix de base doit être positif'),
  compare_at_price: z.number().min(0).nullable().optional(),
  category_id: z.string().uuid('Catégorie invalide').nullable().optional(),
  collection_id: z.string().uuid('Collection invalide').nullable().optional(),
  status: z.enum([
    'draft',
    'published',
    'hidden',
    'out_of_stock',
    'coming_soon',
    'made_to_order',
    'unique_piece',
  ]),
  featured: z.boolean(),
  sell_mode: z.enum(['inherit', 'online', 'contact_only']),
  material_details: z.string().max(255).nullable().optional(),
  gemstone_details: z.string().max(255).nullable().optional(),
});

export const ContactInquirySchema = z.object({
  product_id: z.string().uuid().nullable().optional(),
  name: z.string().min(2, 'Veuillez renseigner votre nom complet').max(100),
  email: z.string().email('Adresse e-mail invalide'),
  phone: z.string().max(50).nullable().optional(),
  preferred_channel: z.enum(['contact_form', 'whatsapp', 'phone', 'email']),
  message: z.string().min(10, 'Votre message doit comporter au moins 10 caractères').max(3000),
});

export const MediaUploadValidationSchema = z.object({
  filename: z.string().min(1),
  size: z.number().max(10 * 1024 * 1024, 'La taille du fichier ne doit pas dépasser 10 Mo'),
  mimeType: z.enum([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
  ], {
    message: 'Seuls les formats JPEG, PNG, WebP et AVIF sont acceptés pour la joaillerie',
  }),
});

export const CategorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(1000).nullable().optional(),
  position: z.number().int().min(0),
  active: z.boolean(),
});

export const CollectionSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(1000).nullable().optional(),
  position: z.number().int().min(0),
  active: z.boolean(),
});
