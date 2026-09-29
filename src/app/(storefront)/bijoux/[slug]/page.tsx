import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlug } from '@/features/products/actions';
import { getStoreSettings } from '@/features/settings/actions';
import { canPurchaseOnline } from '@/types/store';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import { ProductDetailClient } from './ProductDetailClient';
import { Sparkles, Shield, Award, RotateCcw } from 'lucide-react';

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Bijou Introuvable' };
  }

  return {
    title: `${product.name} | Perle Noire Joaillerie`,
    description: product.short_description || product.description || undefined,
  };
}

export default async function ProductDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const [product, settings] = await Promise.all([
    getProductBySlug(slug),
    getStoreSettings(),
  ]);

  if (!product) {
    notFound();
  }

  const isBuyableOnline = canPurchaseOnline(product, settings);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Breadcrumb */}
      <nav className="text-[11px] uppercase tracking-widest text-[#8C827A] mb-8 flex items-center space-x-2">
        <Link href="/" className="hover:text-[#141414] transition-colors">
          Accueil
        </Link>
        <span>/</span>
        <Link href="/bijoux" className="hover:text-[#141414] transition-colors">
          Créations
        </Link>
        <span>/</span>
        <span className="text-[#141414] font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left: Jewelry Visual Frame */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-4/5 w-full bg-[#F0EAE1] border border-[#DDD5C7] flex flex-col items-center justify-center p-8">
            <div className="absolute top-4 left-4">
              <Badge status={product.status} />
            </div>

            {/* Haute Joaillerie Graphical Emblem */}
            <div className="w-48 h-48 rounded-full border border-[#D5C9B8] bg-[#FAF8F5] flex items-center justify-center p-4 relative shadow-sm">
              <div className="w-32 h-32 rounded-full bg-linear-to-tr from-[#141414] via-[#2F2D2A] to-[#121212] shadow-2xl border border-[#C5A880]/40 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-[#C5A880] opacity-90 animate-pulse" />
              </div>
            </div>

            <div className="absolute bottom-4 text-center">
              <span className="text-[10px] uppercase tracking-widest text-[#8C827A] block">
                Atelier Perle Noire • Place Vendôme
              </span>
              <span className="text-xs text-[#554E45] font-light">
                Photographie studio joaillier & certificat d’authenticité
              </span>
            </div>
          </div>
        </div>

        {/* Right: Technical Details, Pricing & Action Mode */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            <div>
              {product.category && (
                <span className="text-[11px] uppercase tracking-widest text-[#A08154] font-medium block mb-1">
                  {product.category.name}
                </span>
              )}
              <h1 className="font-editorial text-3xl sm:text-4xl text-[#141414] font-normal leading-tight">
                {product.name}
              </h1>
              <p className="text-[11px] uppercase tracking-wider text-[#8C827A] mt-1">
                Référence : {product.sku || 'PN-ATELIER-01'}
              </p>
            </div>

            {/* Price display */}
            <div className="py-4 border-y border-[#E6DFD3] flex items-baseline justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#8C827A] block mb-0.5">
                  Valeur de la pièce
                </span>
                {settings.show_prices ? (
                  <div className="flex items-baseline gap-3">
                    <span className="font-editorial text-3xl text-[#141414]">
                      {formatPrice(product.base_price, settings.currency, settings.locale)}
                    </span>
                    {product.compare_at_price && (
                      <span className="text-sm text-[#8C827A] line-through">
                        {formatPrice(product.compare_at_price, settings.currency, settings.locale)}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-[#736B5E] italic">
                    Prix communiqué sur demande
                  </span>
                )}
              </div>
              <span className="text-[10px] text-[#8C827A] uppercase tracking-wider">
                TVA & Écrin Inclus
              </span>
            </div>

            {/* Short Description */}
            <p className="text-xs sm:text-sm text-[#554E45] leading-relaxed font-light">
              {product.description}
            </p>

            {/* Interactive Buy vs Vitrine Inquire Client Section */}
            <ProductDetailClient
              product={product}
              settings={settings}
              isBuyableOnline={isBuyableOnline}
            />
          </div>

          {/* Specifications Table */}
          <div className="border-t border-[#E6DFD3] pt-6 space-y-4">
            <h4 className="text-[11px] uppercase tracking-widest text-[#141414] font-semibold">
              Spécifications de l’Œuvre
            </h4>
            <dl className="divide-y divide-[#EAE4D9] text-xs">
              {product.material_details && (
                <div className="py-2.5 flex justify-between">
                  <dt className="text-[#736B5E]">Métal précieux</dt>
                  <dd className="text-[#141414] font-medium text-right">{product.material_details}</dd>
                </div>
              )}
              {product.gemstone_details && (
                <div className="py-2.5 flex justify-between">
                  <dt className="text-[#736B5E]">Gemmes & Perles</dt>
                  <dd className="text-[#141414] font-medium text-right">{product.gemstone_details}</dd>
                </div>
              )}
              <div className="py-2.5 flex justify-between">
                <dt className="text-[#736B5E]">Provenance</dt>
                <dd className="text-[#141414] font-medium text-right">Perles de Tahiti — Atolls des Tuamotu</dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-[#736B5E]">Atelier de confection</dt>
                <dd className="text-[#141414] font-medium text-right">Place Vendôme, Paris</dd>
              </div>
            </dl>
          </div>

          {/* Maison Privileges */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#E6DFD3] text-center">
            <div className="p-3 bg-[#FAF8F5] border border-[#E6DFD3] space-y-1">
              <Award className="w-4 h-4 mx-auto text-[#A08154]" />
              <span className="text-[10px] uppercase tracking-wider text-[#141414] block font-medium">Certificat</span>
              <span className="text-[9px] text-[#8C827A] block">Expertise officielle</span>
            </div>
            <div className="p-3 bg-[#FAF8F5] border border-[#E6DFD3] space-y-1">
              <Shield className="w-4 h-4 mx-auto text-[#A08154]" />
              <span className="text-[10px] uppercase tracking-wider text-[#141414] block font-medium">Sécurité</span>
              <span className="text-[9px] text-[#8C827A] block">Valeur déclarée</span>
            </div>
            <div className="p-3 bg-[#FAF8F5] border border-[#E6DFD3] space-y-1">
              <RotateCcw className="w-4 h-4 mx-auto text-[#A08154]" />
              <span className="text-[10px] uppercase tracking-wider text-[#141414] block font-medium">Ajustement</span>
              <span className="text-[9px] text-[#8C827A] block">Mise à taille offerte</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
