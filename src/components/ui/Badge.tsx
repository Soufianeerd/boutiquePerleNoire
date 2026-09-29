import React from 'react';
import { cn } from '@/lib/utils';
import { ProductStatus } from '@/types/database';

interface BadgeProps {
  children?: React.ReactNode;
  status?: ProductStatus;
  variant?: 'neutral' | 'accent' | 'outline' | 'dark';
  className?: string;
}

export function Badge({ children, status, variant = 'neutral', className }: BadgeProps) {
  let label = children;
  let customStyle = 'bg-[#F0EAE1] text-[#141414] border border-[#E4DCD0]';

  if (status) {
    switch (status) {
      case 'published':
        label = label || 'Disponible';
        customStyle = 'bg-[#FAF8F5] text-[#2D2D2A] border border-[#DCD4C7]';
        break;
      case 'unique_piece':
        label = label || 'Pièce Unique';
        customStyle = 'bg-[#141414] text-[#FAF8F5] border border-[#141414] tracking-widest uppercase';
        break;
      case 'made_to_order':
        label = label || 'Sur Commande';
        customStyle = 'bg-[#F4EFE6] text-[#A08154] border border-[#C5A880]/40';
        break;
      case 'coming_soon':
        label = label || 'Bientôt Disponible';
        customStyle = 'bg-[#F0EAE1] text-[#736B5E] border border-[#DCD4C7]';
        break;
      case 'out_of_stock':
        label = label || 'Épuisé';
        customStyle = 'bg-[#FAF8F5] text-[#8C827A] border border-[#E6DFD3] line-through';
        break;
      case 'draft':
        label = label || 'Brouillon';
        customStyle = 'bg-[#EAE4D9] text-[#554E45] border border-[#D0C5B4]';
        break;
      case 'hidden':
        label = label || 'Masqué';
        customStyle = 'bg-[#E5E0D8] text-[#7A7368] border border-[#D0C5B4]';
        break;
    }
  } else {
    switch (variant) {
      case 'accent':
        customStyle = 'bg-[#C5A880] text-[#141414] font-medium';
        break;
      case 'dark':
        customStyle = 'bg-[#141414] text-[#FAF8F5] border border-[#2D2D2A]';
        break;
      case 'outline':
        customStyle = 'bg-transparent text-[#141414] border border-[#DCD4C7]';
        break;
      default:
        break;
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider',
        customStyle,
        className
      )}
    >
      {label}
    </span>
  );
}
