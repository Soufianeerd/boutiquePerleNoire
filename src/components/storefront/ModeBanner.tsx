import React from 'react';
import Link from 'next/link';
import { StoreSettings } from '@/types/database';

interface ModeBannerProps {
  settings: StoreSettings;
}

export function ModeBanner({ settings }: ModeBannerProps) {
  if (settings.maintenance_mode) {
    return (
      <aside aria-label="Maintenance" className="bg-[#141414] text-[#FAF8F5] text-[11px] uppercase tracking-widest text-center py-2 px-4 border-b border-[#282725]">
        Salon en maintenance privée • Réouverture prochaine
      </aside>
    );
  }

  if (!settings.commerce_enabled) {
    return (
      <aside aria-label="Mode de la boutique" className="bg-[#1E1E1C] text-[#E4DCD0] text-[11px] py-2 px-4 border-b border-[#2D2D2A]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] inline-block" />
            <span className="tracking-wider uppercase text-[10px] text-[#C5A880] font-semibold">Mode Vitrine</span>
            <span className="text-[#A89E90] hidden md:inline">— Présentation exclusive de nos créations. Vente en salon privé ou sur demande.</span>
          </div>
          <Link
            href="/contact"
            className="text-[10px] uppercase tracking-widest text-[#FAF8F5] underline underline-offset-4 hover:text-[#C5A880] transition-colors"
          >
            Prendre Rendez-vous à l’Atelier
          </Link>
        </div>
      </aside>
    );
  }

  return (
    <aside aria-label="Informations de livraison" className="bg-[#F0EAE1] text-[#2D2D2A] text-[11px] py-1.5 px-4 border-b border-[#DDD5C7] text-center tracking-widest uppercase">
      <span>Expédition sécurisée en valeur déclarée offerte • Écrin & Certificat joaillier inclus</span>
    </aside>
  );
}
