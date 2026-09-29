// ==============================================================================
// PERLE NOIRE - DATABASE SCHEMA TYPES
// ==============================================================================

export type ProductStatus =
  | 'draft'
  | 'published'
  | 'hidden'
  | 'out_of_stock'
  | 'coming_soon'
  | 'made_to_order'
  | 'unique_piece';

export type ProductSellMode = 'inherit' | 'online' | 'contact_only';

export type ContactMethod = 'contact_form' | 'whatsapp' | 'phone' | 'email';

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus =
  | 'pending'
  | 'authorized'
  | 'succeeded'
  | 'failed'
  | 'refunded';

export type AdminRole = 'super_admin' | 'admin' | 'manager' | 'editor';

export interface AdminUser {
  id: string;
  user_id: string | null;
  email: string;
  full_name: string;
  role: AdminRole;
  active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  hero_url: string | null;
  position: number;
  active: boolean;
  meta_title?: string | null;
  meta_description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  hero_url: string | null;
  position: number;
  active: boolean;
  meta_title?: string | null;
  meta_description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt: string;
  position: number;
  is_primary: boolean;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  title: string;
  sku: string | null;
  price: number;
  size: string | null;
  material: string | null;
  color: string | null;
  stock_quantity: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  sku: string | null;
  base_price: number;
  compare_at_price: number | null;
  category_id: string | null;
  collection_id: string | null;
  status: ProductStatus;
  featured: boolean;
  sell_mode: ProductSellMode;
  material_details: string | null;
  gemstone_details: string | null;
  stock_quantity?: number;
  meta_title?: string | null;
  meta_description?: string | null;
  created_at: string;
  updated_at: string;

  // Joined relations
  images?: ProductImage[];
  variants?: ProductVariant[];
  category?: Category | null;
  collection?: Collection | null;
}

export interface InventoryMovement {
  id: string;
  product_id: string | null;
  variant_id: string | null;
  change_amount: number;
  previous_quantity?: number | null;
  new_quantity?: number | null;
  reason: 'restock' | 'sale' | 'adjustment' | 'return' | 'initial' | 'manual_adjustment';
  reference_id: string | null;
  created_by: string | null;
  created_at: string;
  product?: Product | null;
  variant?: ProductVariant | null;
  admin?: AdminUser | null;
}

export interface Customer {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  postal_code: string | null;
  city: string | null;
  country: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  variant_title: string | null;
  sku: string | null;
  price: number;
  quantity: number;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  guest_email: string | null;
  guest_name: string | null;
  guest_phone: string | null;
  shipping_address: Record<string, unknown>;
  billing_address: Record<string, unknown>;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal_amount: number;
  shipping_amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface ContactRequest {
  id: string;
  product_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  preferred_channel: ContactMethod;
  message: string;
  status: 'new' | 'in_progress' | 'answered' | 'closed';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  product?: Product | null;
}

export interface StoreSettings {
  id: number;
  brand_name: string;
  tagline: string | null;
  logo_url: string | null;
  contact_email: string;
  phone: string | null;
  whatsapp: string | null;
  instagram_url: string | null;
  address: string | null;

  // Mode Vitrine vs Mode E-Commerce
  commerce_enabled: boolean;
  show_prices: boolean;
  allow_guest_checkout: boolean;

  default_contact_method: ContactMethod;
  currency: string;
  locale: string;

  stripe_enabled: boolean;
  paypal_enabled: boolean;

  low_stock_threshold: number;
  maintenance_mode: boolean;

  updated_at: string;
}

export interface HomepageSection {
  id: string;
  section_type:
    | 'hero'
    | 'categories'
    | 'featured_products'
    | 'collection_banner'
    | 'new_arrivals'
    | 'editorial'
    | 'reassurance'
    | 'newsletter'
    | 'instagram'
    | 'custom';
  title: string | null;
  subtitle: string | null;
  position: number;
  active: boolean;
  content_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface MediaItem {
  id: string;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  alt_text: string | null;
  bucket: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  admin_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
  admin?: AdminUser | null;
}
