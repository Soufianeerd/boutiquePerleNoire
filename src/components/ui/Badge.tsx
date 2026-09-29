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
  let customStyle = 'bg-[#F6F1EA] text-[#171717] border border-[#E7E0D7]';

  if (status) {
    switch (status) {
      case 'published':
        label = label || 'Disponible';
        customStyle = 'bg-[#FCFAF7] text-[#171717] border border-[#E7E0D7]';
        break;
      case 'unique_piece':
        label = label || 'Pièce Unique';
        customStyle = 'bg-[#171717] text-[#FCFAF7] border border-[#171717]';
        break;
      case 'made_to_order':
        label = label || 'Sur commande';
        customStyle = 'bg-[#F6F1EA] text-[#77716A] border border-[#E7E0D7]';
        break;
      case 'coming_soon':
        label = label || 'Bientôt disponible';
        customStyle = 'bg-[#F6F1EA] text-[#77716A] border border-[#E7E0D7]';
        break;
      case 'out_of_stock':
        label = label || 'Rupture';
        customStyle = 'bg-[#FCFAF7] text-[#77716A] border border-[#E7E0D7] line-through';
        break;
      case 'draft':
        label = label || 'Brouillon';
        customStyle = 'bg-[#F6F1EA] text-[#77716A] border border-[#E7E0D7]';
        break;
      case 'hidden':
        label = label || 'Masqué';
        customStyle = 'bg-[#F6F1EA] text-[#77716A] border border-[#E7E0D7]';
        break;
    }
  } else {
    switch (variant) {
      case 'accent':
        customStyle = 'bg-[#B99A64] text-[#FCFAF7]';
        break;
      case 'dark':
        customStyle = 'bg-[#171717] text-[#FCFAF7] border border-[#171717]';
        break;
      case 'outline':
        customStyle = 'bg-transparent text-[#171717] border border-[#E7E0D7]';
        break;
      default:
        break;
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-[10px] tracking-widest uppercase font-light',
        customStyle,
        className
      )}
    >
      {label}
    </span>
  );
}
