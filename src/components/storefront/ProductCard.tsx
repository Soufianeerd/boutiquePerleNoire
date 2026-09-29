'use client';

import React from 'react';
import Link from 'next/link';
import { Product, StoreSettings } from '@/types/database';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import { LuxuryImage } from './LuxuryImage';

interface ProductCardProps {
  product: Product;
  settings: StoreSettings;
  aspectRatio?: '4/5' | '3/4' | '1/1';
}

export function ProductCard({ product, settings, aspectRatio = '4/5' }: ProductCardProps) {
  const primaryImage = product.images && product.images.length > 0 ? product.images[0].url : null;
  const secondaryImage = product.images && product.images.length > 1 ? product.images[1].url : null;

  return (
    <article className="group relative flex flex-col">
      {/* Product Image Frame */}
      <Link
        href={`/bijoux/${product.slug}`}
        className="relative block w-full overflow-hidden bg-[#F6F1EA]"
        aria-label={`Voir le bijou ${product.name}`}
      >
        <LuxuryImage
          src={primaryImage}
          secondarySrc={secondaryImage}
          alt={product.name}
          aspectRatio={aspectRatio}
          label={product.category?.name || 'Joaillerie'}
        />

        {/* Discreet Status Badge */}
        {product.status && product.status !== 'published' && (
          <div className="absolute top-3 left-3 z-10">
            <Badge status={product.status} />
          </div>
        )}

        {/* Subtle hover prompt on desktop */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-linear-to-t from-[#171717]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-end justify-center pointer-events-none">
          <span className="text-[10px] uppercase tracking-widest text-[#FCFAF7] bg-[#171717]/80 backdrop-blur-xs px-3 py-1">
            Découvrir
          </span>
        </div>
      </Link>

      {/* Product Information */}
      <div className="pt-4 pb-2 flex flex-col space-y-1">
        {product.category && (
          <span className="text-[10px] uppercase tracking-widest text-[#77716A]">
            {product.category.name}
          </span>
        )}

        <h3 className="font-editorial text-lg sm:text-xl text-[#171717] font-normal leading-snug line-clamp-1">
          <Link
            href={`/bijoux/${product.slug}`}
            className="hover-underline"
          >
            {product.name}
          </Link>
        </h3>

        {/* Price or Inquire */}
        <div className="pt-0.5 flex items-baseline gap-2">
          {settings.show_prices ? (
            <>
              <span className="font-editorial text-base text-[#171717]">
                {formatPrice(product.base_price, settings.currency, settings.locale)}
              </span>
              {product.compare_at_price && (
                <span className="text-xs text-[#77716A] line-through font-light">
                  {formatPrice(product.compare_at_price, settings.currency, settings.locale)}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs text-[#77716A] italic font-light">
              Prix sur demande
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
