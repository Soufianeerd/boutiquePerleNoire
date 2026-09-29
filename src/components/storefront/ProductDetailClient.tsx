'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product, StoreSettings, ProductVariant } from '@/types/database';
import { canPurchaseOnline } from '@/types/store';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LuxuryImage } from '@/components/storefront/LuxuryImage';
import { InquiryModal } from '@/components/storefront/InquiryModal';
import {
  ShoppingBag,
  MessageSquare,
  Phone,
  Check,
  ChevronDown,
} from 'lucide-react';

interface ProductDetailClientProps {
  product: Product;
  settings: StoreSettings;
}

export function ProductDetailClient({ product, settings }: ProductDetailClientProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  // Accordion state
  const [openAccordion, setOpenAccordion] = useState<string | null>('desc');

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const images = product.images || [];
  const primaryImageUrl =
    images.length > 0 && images[selectedImageIndex]
      ? images[selectedImageIndex].url
      : null;

  const isBuyableOnline = canPurchaseOnline(product, settings);
  const isOutOfStock = product.status === 'out_of_stock';
  const isComingSoon = product.status === 'coming_soon';

  const handleAddToCart = () => {
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 4500);
  };

  const handleWhatsAppContact = () => {
    const rawNumber = settings.whatsapp ? settings.whatsapp.replace(/[^0-9]/g, '') : '';
    const text = encodeURIComponent(
      `Bonjour, je souhaiterais des renseignements ou commander la création « ${product.name} » (Réf: ${product.sku || 'Atelier'}).`
    );
    window.open(`https://wa.me/${rawNumber}?text=${text}`, '_blank');
  };

  const handlePhoneContact = () => {
    if (settings.phone) {
      window.location.href = `tel:${settings.phone}`;
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* ================================================================= */}
        {/* LEFT COLUMN: GALLERY                                              */}
        {/* ================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Visual View */}
          <div className="relative aspect-4/5 w-full overflow-hidden bg-[#F6F1EA] border border-[#E7E0D7]/60">
            {product.status && product.status !== 'published' && (
              <div className="absolute top-4 left-4 z-10">
                <Badge status={product.status} />
              </div>
            )}

            <LuxuryImage
              src={primaryImageUrl}
              alt={product.name}
              aspectRatio="4/5"
              priority
              containerClassName="w-full h-full"
              label={product.category?.name || 'Joaillerie'}
            />
          </div>

          {/* Thumbnails if multiple images exist */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 aspect-4/5 shrink-0 overflow-hidden bg-[#F6F1EA] border transition-all ${
                    selectedImageIndex === idx
                      ? 'border-[#171717] opacity-100'
                      : 'border-[#E7E0D7] opacity-60 hover:opacity-100'
                  }`}
                  aria-label={`Afficher la photo ${idx + 1}`}
                >
                  <LuxuryImage
                    src={img.url}
                    alt={`${product.name} vue ${idx + 1}`}
                    aspectRatio="4/5"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN: DETAILS & ACTIONS                                   */}
        {/* ================================================================= */}
        <div className="lg:col-span-5 space-y-8">
          {/* Breadcrumb */}
          <nav
            aria-label="Fil d'ariane"
            className="text-[11px] uppercase tracking-widest text-[#77716A] flex items-center space-x-2 font-light"
          >
            <Link href="/" className="hover:text-[#171717] transition-colors">
              Accueil
            </Link>
            <span>/</span>
            <Link href="/bijoux" className="hover:text-[#171717] transition-colors">
              Bijoux
            </Link>
            {product.category && (
              <>
                <span>/</span>
                <Link
                  href={`/bijoux?categorie=${product.category.slug}`}
                  className="hover:text-[#171717] transition-colors"
                >
                  {product.category.name}
                </Link>
              </>
            )}
          </nav>

          {/* Title & SKU */}
          <div className="space-y-2">
            <h1 className="font-editorial text-3xl sm:text-4xl text-[#171717] font-normal leading-tight">
              {product.name}
            </h1>
            {product.sku && (
              <span className="text-[10px] uppercase tracking-wider text-[#77716A] block font-light">
                Réf. {product.sku}
              </span>
            )}
          </div>

          {/* Price display */}
          <div className="py-4 border-y border-[#E7E0D7] flex items-baseline justify-between">
            <div>
              {settings.show_prices ? (
                <div className="flex items-baseline gap-3">
                  <span className="font-editorial text-2xl sm:text-3xl text-[#171717]">
                    {formatPrice(product.base_price, settings.currency, settings.locale)}
                  </span>
                  {product.compare_at_price && (
                    <span className="text-sm text-[#77716A] line-through font-light">
                      {formatPrice(product.compare_at_price, settings.currency, settings.locale)}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-sm text-[#77716A] italic font-light">
                  Prix sur demande
                </span>
              )}
            </div>

            <span className="text-[10px] uppercase tracking-wider text-[#77716A] font-light">
              TVA & Écrin inclus
            </span>
          </div>

          {/* Short description */}
          {product.short_description && (
            <p className="text-xs sm:text-sm text-[#77716A] leading-relaxed font-light">
              {product.short_description}
            </p>
          )}

          {/* Variant Selector (if any) */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2.5">
              <label className="block text-[11px] uppercase tracking-wider text-[#171717] font-medium">
                Taille & Déclinaison
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`px-3.5 py-2 text-xs transition-colors ${
                        isSelected
                          ? 'border border-[#171717] bg-[#171717] text-[#FCFAF7]'
                          : 'border border-[#E7E0D7] bg-[#FCFAF7] text-[#171717] hover:border-[#171717]'
                      }`}
                    >
                      {v.size ? `Taille ${v.size}` : v.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* ACTION BUTTON (E-COMMERCE vs VITRINE)                           */}
          {/* =============================================================== */}
          <div className="pt-2 space-y-3">
            {isBuyableOnline ? (
              /* E-Commerce Mode */
              <>
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className="flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 stroke-[1.25]" />
                  <span>
                    {isOutOfStock
                      ? 'Rupture de stock'
                      : isComingSoon
                      ? 'Bientôt disponible'
                      : 'Ajouter au panier'}
                  </span>
                </Button>

                {addedNotice && (
                  <div className="p-3 bg-[#F6F1EA] border border-[#E7E0D7] text-xs text-[#171717] flex items-center justify-between animate-in fade-in">
                    <span className="flex items-center gap-1.5 font-normal">
                      <Check className="w-4 h-4 text-[#B99A64]" />
                      Pièce ajoutée à votre sélection
                    </span>
                    <Link
                      href="/panier"
                      className="underline underline-offset-4 text-[11px] uppercase tracking-wider font-medium text-[#171717]"
                    >
                      Voir le panier
                    </Link>
                  </div>
                )}
              </>
            ) : (
              /* Vitrine Mode / Contact Only */
              <div className="space-y-3">
                {settings.default_contact_method === 'whatsapp' ? (
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleWhatsAppContact}
                    className="flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4 stroke-[1.25]" />
                    <span>Commander via WhatsApp</span>
                  </Button>
                ) : settings.default_contact_method === 'phone' ? (
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handlePhoneContact}
                    className="flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4 stroke-[1.25]" />
                    <span>Nous contacter par téléphone</span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() => setInquiryOpen(true)}
                    className="flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4 stroke-[1.25]" />
                    <span>Faire une demande</span>
                  </Button>
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  fullWidth
                  onClick={() => setInquiryOpen(true)}
                  className="text-xs"
                >
                  Formulaire de contact
                </Button>
              </div>
            )}
          </div>

          {/* =============================================================== */}
          {/* ACCORDIONS (Description, Matières & entretien, Retours)        */}
          {/* =============================================================== */}
          <div className="border-t border-[#E7E0D7] pt-4 divide-y divide-[#E7E0D7]">
            {/* 1. Description */}
            <div>
              <button
                type="button"
                onClick={() => toggleAccordion('desc')}
                className="w-full py-4 flex items-center justify-between text-left text-xs uppercase tracking-wider text-[#171717] font-medium"
              >
                <span>Description & Caractéristiques</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#77716A] stroke-[1.25] transition-transform duration-200 ${
                    openAccordion === 'desc' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openAccordion === 'desc' && (
                <div className="pb-4 space-y-3 text-xs text-[#77716A] font-light leading-relaxed animate-in fade-in">
                  <p>{product.description}</p>
                  {product.material_details && (
                    <div className="pt-2">
                      <strong className="text-[#171717] font-medium">Métal : </strong>
                      <span>{product.material_details}</span>
                    </div>
                  )}
                  {product.gemstone_details && (
                    <div>
                      <strong className="text-[#171717] font-medium">Pierres & Détails : </strong>
                      <span>{product.gemstone_details}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. Matières & Entretien */}
            <div>
              <button
                type="button"
                onClick={() => toggleAccordion('materials')}
                className="w-full py-4 flex items-center justify-between text-left text-xs uppercase tracking-wider text-[#171717] font-medium"
              >
                <span>Matières & Entretien</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#77716A] stroke-[1.25] transition-transform duration-200 ${
                    openAccordion === 'materials' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openAccordion === 'materials' && (
                <div className="pb-4 space-y-2 text-xs text-[#77716A] font-light leading-relaxed animate-in fade-in">
                  <p>
                    Nos bijoux sont façonnés dans des métaux précieux rigoureusement sélectionnés pour leur éclat et leur durabilité.
                  </p>
                  <p>
                    Pour préserver la beauté de votre bijou, nous vous recommandons d’éviter le contact direct avec parfums et cosmétiques, et de le ranger dans son écrin lorsqu’il n’est pas porté.
                  </p>
                </div>
              )}
            </div>

            {/* 3. Livraison & Retours */}
            <div>
              <button
                type="button"
                onClick={() => toggleAccordion('shipping')}
                className="w-full py-4 flex items-center justify-between text-left text-xs uppercase tracking-wider text-[#171717] font-medium"
              >
                <span>Livraison & Retours</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#77716A] stroke-[1.25] transition-transform duration-200 ${
                    openAccordion === 'shipping' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openAccordion === 'shipping' && (
                <div className="pb-4 space-y-2 text-xs text-[#77716A] font-light leading-relaxed animate-in fade-in">
                  <p>
                    • Livraison suivie offerte pour toute commande.
                  </p>
                  <p>
                    • Chaque création est livrée dans son écrin protecteur.
                  </p>
                  <p>
                    • Retours et échanges acceptés sous 30 jours dans leur état d’origine.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <InquiryModal
        isOpen={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
        product={product}
      />
    </>
  );
}
