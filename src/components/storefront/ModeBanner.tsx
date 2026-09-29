import React from 'react';
import { StoreSettings } from '@/types/database';

interface ModeBannerProps {
  settings: StoreSettings;
  customText?: string;
}

export function ModeBanner({ settings, customText }: ModeBannerProps) {
  if (settings.maintenance_mode) {
    return (
      <aside
        aria-label="Maintenance"
        className="bg-[#171717] text-[#FCFAF7] text-[10px] uppercase tracking-widest text-center py-2 px-4 border-b border-[#262626]"
      >
        Boutique en maintenance privée • Réouverture prochaine
      </aside>
    );
  }

  const text = customText || 'Livraison offerte à partir de 100 € • Expédition soignée';

  return (
    <aside
      aria-label="Annonce"
      className="bg-[#171717] text-[#FCFAF7] text-[10px] tracking-widest uppercase text-center py-1.5 px-4 font-light select-none"
    >
      <span>{text}</span>
    </aside>
  );
}
