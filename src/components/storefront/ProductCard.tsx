'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product, StoreSettings } from '@/types/database';
import { getProductAction } from '@/types/store';
import { Badge } from '@/components/ui/Badge';
import { InquiryModal } from '@/components/storefront/InquiryModal';
import { formatPrice } from '@/lib/utils';
import { Sparkles, MessageSquare, ArrowUpRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  settings: StoreSettings;
}

export function ProductCard({ product, settings }: ProductCardProps) {
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const action = getProductAction(product, settings);

  return (
    <>
      <div className="group relative flex flex-col bg-[#FAF8F5] border border-[#E6DFD3] transition-all duration-300 hover:border-[#141414]/40">
        {/* Visual Frame */}
        <Link
          href={`/bijoux/${product.slug}`}
          className="relative aspect-4/5 w-full overflow-hidden bg-[#F0EAE1] flex items-center justify-center p-6"
        >
          {/* Status Badge */}
          <div className="absolute top-3 left-3 z-10">
            <Badge status={product.status} />
          </div>

          {/* Luxury jewelry illustration / neutral artwork representation */}
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 transition-transform duration-700 group-hover:scale-105">
            <div className="w-24 h-24 rounded-full border border-[#D8CFC4] bg-[#FAF8F5] flex items-center justify-center shadow-inner relative">
              <span className="w-14 h-14 rounded-full bg-linear-to-tr from-[#1E1E1C] via-[#353330] to-[#121212] shadow-md border border-[#C5A880]/30 flex items-center justify-center text-[#E4DCD0]">
                <Sparkles className="w-5 h-5 text-[#C5A880] opacity-80" />
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-[#8C827A] mt-4">
              Atelier Perle Noire
            </span>
          </div>

          {/* Quick discover hover overlay */}
          <div className="absolute inset-0 bg-[#141414]/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
            <span className="text-[11px] uppercase tracking-widest text-[#141414] bg-[#FAF8F5]/90 backdrop-blur-xs px-3 py-1.5 border border-[#DDD5C7] flex items-center gap-1">
              Explorer la pièce <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>

        {/* Product Details */}
        <div className="p-5 flex flex-col flex-1 justify-between gap-4">
          <div>
            {product.category && (
              <span className="text-[10px] uppercase tracking-widest text-[#A08154] font-medium block mb-1">
                {product.category.name}
              </span>
            )}
            <h3 className="font-editorial text-lg md:text-xl text-[#141414] leading-snug line-clamp-1">
              <Link href={`/bijoux/${product.slug}`} className="hover:text-[#A08154] transition-colors">
                {product.name}
              </Link>
            </h3>
            {product.material_details && (
              <p className="text-xs text-[#736B5E] mt-1 line-clamp-1 font-light">
                {product.material_details}
              </p>
            )}
          </div>

          {/* Pricing & Call to Action */}
          <div className="pt-3 border-t border-[#EAE4D9] flex items-center justify-between gap-3">
            <div>
              {settings.show_prices ? (
                <div className="flex items-baseline gap-2">
                  <span className="font-editorial text-base text-[#141414]">
                    {formatPrice(product.base_price, settings.currency, settings.locale)}
                  </span>
                  {product.compare_at_price && (
                    <span className="text-xs text-[#9E9589] line-through">
                      {formatPrice(product.compare_at_price, settings.currency, settings.locale)}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-xs text-[#736B5E] italic">
                  Prix sur demande
                </span>
              )}
            </div>

            <div>
              {action.type === 'cart' ? (
                <Link
                  href={`/bijoux/${product.slug}`}
                  className="inline-flex items-center text-[10px] uppercase tracking-widest px-3 py-2 bg-[#141414] text-[#FAF8F5] hover:bg-[#2B2B28] transition-colors"
                >
                  Acquérir
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsInquiryOpen(true)}
                  className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest px-3 py-2 border border-[#141414] text-[#141414] hover:bg-[#141414] hover:text-[#FAF8F5] transition-colors"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Demande</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <InquiryModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        product={product}
      />
    </>
  );
}
