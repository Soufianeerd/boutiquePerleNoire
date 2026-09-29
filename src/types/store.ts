// ==============================================================================
// PERLE NOIRE - STORE & CART TYPES
// ==============================================================================

import { Product, StoreSettings } from './database';

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  title: string;
  variantTitle?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  sku?: string;
}

export interface InquiryFormData {
  productId?: string;
  productName?: string;
  name: string;
  email: string;
  phone?: string;
  preferredChannel: 'whatsapp' | 'phone' | 'email' | 'contact_form';
  message: string;
}

/**
 * Determines whether a product can be purchased online or requires contact inquiry.
 * Business Rules:
 * - If global commerce_enabled is FALSE -> ALWAYS Contact / Vitrine.
 * - If product.sell_mode is 'contact_only' -> ALWAYS Contact inquiry.
 * - If product is 'unique_piece' and sell_mode is 'contact_only' -> Contact inquiry.
 * - If global commerce_enabled is TRUE and product.sell_mode is 'inherit' or 'online' -> Can be bought online.
 */
export function canPurchaseOnline(
  product: Product,
  settings: StoreSettings
): boolean {
  if (!settings.commerce_enabled) return false;
  if (product.sell_mode === 'contact_only') return false;
  if (product.status === 'out_of_stock' || product.status === 'coming_soon') return false;
  return true;
}

/**
 * Returns the appropriate CTA label and action mode for a product.
 */
export function getProductAction(
  product: Product,
  settings: StoreSettings
): {
  type: 'cart' | 'inquiry' | 'sold_out';
  label: string;
  channel?: string;
} {
  if (canPurchaseOnline(product, settings)) {
    return { type: 'cart', label: 'Ajouter au Panier' };
  }

  if (product.status === 'out_of_stock') {
    return { type: 'sold_out', label: 'Épuisé' };
  }

  if (product.status === 'coming_soon') {
    return { type: 'inquiry', label: 'Être Averti' };
  }

  if (product.status === 'unique_piece') {
    return { type: 'inquiry', label: 'Prendre Rendez-vous en Salon' };
  }

  // Vitrine mode or contact_only
  switch (settings.default_contact_method) {
    case 'whatsapp':
      return { type: 'inquiry', label: 'Commander via WhatsApp', channel: 'whatsapp' };
    case 'phone':
      return { type: 'inquiry', label: 'Commander par Téléphone', channel: 'phone' };
    default:
      return { type: 'inquiry', label: 'Demande de Renseignement', channel: 'contact_form' };
  }
}
