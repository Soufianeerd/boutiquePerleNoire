'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LuxuryImageProps {
  src?: string | null;
  secondarySrc?: string | null;
  alt: string;
  aspectRatio?: '4/5' | '3/4' | '1/1' | '16/9' | 'auto';
  sizes?: string;
  priority?: boolean;
  className?: string;
  containerClassName?: string;
  label?: string;
}

export function LuxuryImage({
  src,
  secondarySrc,
  alt,
  aspectRatio = '4/5',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  className,
  containerClassName,
  label,
}: LuxuryImageProps) {
  const hasImage = Boolean(src && src.trim().length > 0);
  const hasSecondary = Boolean(secondarySrc && secondarySrc.trim().length > 0);

  const aspectClass =
    aspectRatio === '4/5'
      ? 'aspect-4/5'
      : aspectRatio === '3/4'
      ? 'aspect-3/4'
      : aspectRatio === '1/1'
      ? 'aspect-square'
      : aspectRatio === '16/9'
      ? 'aspect-video'
      : '';

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden bg-[#F6F1EA] select-none',
        aspectClass,
        containerClassName
      )}
    >
      {hasImage ? (
        <>
          <Image
            src={src!}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className={cn(
              'object-cover object-center transition-all duration-700 ease-out img-calm-zoom',
              hasSecondary && 'group-hover:opacity-0',
              className
            )}
          />
          {hasSecondary && (
            <Image
              src={secondarySrc!}
              alt={`${alt} vue secondaire`}
              fill
              sizes={sizes}
              className={cn(
                'object-cover object-center transition-all duration-700 ease-out opacity-0 group-hover:opacity-100 group-hover:scale-102',
                className
              )}
            />
          )}
        </>
      ) : (
        /* Neutral luxury architectural placeholder */
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-linear-to-b from-[#FAF7F2] to-[#F3ECE1] transition-transform duration-700 ease-out group-hover:scale-[1.015]">
          <div className="w-full h-full max-w-[80%] max-h-[80%] border border-[#E7E0D7]/70 flex flex-col items-center justify-center p-4">
            <span className="w-8 h-px bg-[#D9CFBE] mb-3" />
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#A69B8D] font-light">
              {label || 'Joaillerie'}
            </span>
            <span className="w-8 h-px bg-[#D9CFBE] mt-3" />
          </div>
        </div>
      )}
    </div>
  );
}
