'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product, StoreSettings, ProductVariant } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { InquiryModal } from '@/components/storefront/InquiryModal';
import { ShoppingBag, MessageSquare, Phone, Check } from 'lucide-react';

interface ProductDetailClientProps {
  product: Product;
  settings: StoreSettings;
  isBuyableOnline: boolean;
}

export function ProductDetailClient({
  product,
  settings,
  isBuyableOnline,
}: ProductDetailClientProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  const handleAddToCart = () => {
    // In scaffold mode, store cart item in localStorage or trigger confirmation
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 4000);
  };

  const handleDirectWhatsApp = () => {
    const rawNumber = settings.whatsapp ? settings.whatsapp.replace(/[^0-9]/g, '') : '33612345678';
    const msg = encodeURIComponent(
      `Bonjour, je vous contacte depuis le site Perle Noire concernant la pièce "${product.name}" (Réf: ${product.sku || 'Atelier'}). Pourriez-vous me renseigner ?`
    );
    window.open(`https://wa.me/${rawNumber}?text=${msg}`, '_blank');
  };

  const handleDirectPhone = () => {
    if (settings.phone) {
      window.location.href = `tel:${settings.phone}`;
    }
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Variant Selector (if any) */}
      {product.variants && product.variants.length > 0 && (
        <div className="space-y-2">
          <label className="block text-[11px] uppercase tracking-wider text-[#554E45] font-medium">
            Déclinaison & Taille Atelier
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => {
              const isSelected = selectedVariant?.id === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariant(v)}
                  className={`px-3.5 py-2 text-xs border transition-colors ${
                    isSelected
                      ? 'border-[#141414] bg-[#141414] text-[#FAF8F5]'
                      : 'border-[#DDD5C7] bg-[#FAF8F5] text-[#554E45] hover:border-[#141414]'
                  }`}
                >
                  {v.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ACTION AREA DEPENDING ON STORE MODE & PRODUCT SELL MODE */}
      {isBuyableOnline ? (
        /* MODE E-COMMERCE ACTIF */
        <div className="space-y-3">
          <Button
            type="button"
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleAddToCart}
            className="flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Ajouter au Panier</span>
          </Button>

          {addedNotice && (
            <div className="p-3 bg-[#F4EFE6] border border-[#C5A880]/50 text-xs text-[#141414] flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <Check className="w-4 h-4 text-[#A08154]" />
                Pièce ajoutée à votre sélection
              </span>
              <Link
                href="/panier"
                className="underline underline-offset-4 uppercase tracking-wider text-[10px] font-semibold text-[#141414]"
              >
                Accéder au Panier
              </Link>
            </div>
          )}

          <p className="text-[10px] text-[#736B5E] text-center uppercase tracking-wider">
            Paiement sécurisé Stripe • Expédition assurée
          </p>
        </div>
      ) : (
        /* MODE VITRINE OU PRODUIT SUR DEMANDE (CONTACT ONLY) */
        <div className="space-y-4 bg-[#F5F1EA] border border-[#E6DFD3] p-5">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-[#A08154] font-semibold block">
              Présentation Exclusive
            </span>
            <p className="text-xs text-[#554E45] leading-relaxed">
              {product.sell_mode === 'contact_only'
                ? 'Cette pièce de Haute Joaillerie est présentée uniquement sur rendez-vous privé.'
                : 'La Maison Perle Noire est actuellement en mode vitrine de présentation. Nos conseillers joailliers sont à votre entière disposition.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Button
              type="button"
              variant="primary"
              size="md"
              fullWidth
              onClick={() => setInquiryOpen(true)}
              className="flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Demande Privée</span>
            </Button>

            {settings.default_contact_method === 'phone' ? (
              <Button
                type="button"
                variant="outline"
                size="md"
                fullWidth
                onClick={handleDirectPhone}
                className="flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Appeler le Salon</span>
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="md"
                fullWidth
                onClick={handleDirectWhatsApp}
                className="flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-[#A08154]" />
                <span>WhatsApp Atelier</span>
              </Button>
            )}
          </div>
        </div>
      )}

      <InquiryModal
        isOpen={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
        product={product}
      />
    </div>
  );
}
