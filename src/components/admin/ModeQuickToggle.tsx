'use client';

import React, { useState } from 'react';
import { toggleCommerceMode } from '@/features/settings/actions';
import { ShoppingBag, Eye, RefreshCw } from 'lucide-react';

interface ModeQuickToggleProps {
  initialCommerceEnabled: boolean;
}

export function ModeQuickToggle({ initialCommerceEnabled }: ModeQuickToggleProps) {
  const [commerceEnabled, setCommerceEnabled] = useState(initialCommerceEnabled);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    const nextState = !commerceEnabled;
    const res = await toggleCommerceMode(nextState);
    setLoading(false);

    if (res.success) {
      setCommerceEnabled(res.commerce_enabled);
      // Synchronize client cookie for middleware
      document.cookie = `pn_vitrine_mode=${!res.commerce_enabled}; path=/; max-age=31536000`;
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="text-right hidden sm:block">
        <span className="text-[10px] uppercase tracking-widest text-[#736B5E] block">
          Mode Actuel Boutique
        </span>
        <span
          className={`text-xs font-semibold uppercase tracking-wider ${
            commerceEnabled ? 'text-[#3E7B54]' : 'text-[#C5A880]'
          }`}
        >
          {commerceEnabled ? 'Mode E-Commerce Actif' : 'Mode Vitrine Actif'}
        </span>
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={handleToggle}
        className={`px-3.5 py-2 text-xs font-medium uppercase tracking-wider flex items-center gap-2 border transition-all duration-200 ${
          commerceEnabled
            ? 'bg-[#1C281F] text-[#6FCF97] border-[#27442F] hover:bg-[#27442F]'
            : 'bg-[#262119] text-[#C5A880] border-[#443825] hover:bg-[#382E1E]'
        }`}
      >
        {loading ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        ) : commerceEnabled ? (
          <ShoppingBag className="w-3.5 h-3.5" />
        ) : (
          <Eye className="w-3.5 h-3.5" />
        )}
        <span>
          {loading
            ? 'Bascule...'
            : commerceEnabled
            ? 'Basculer en Vitrine'
            : 'Activer E-Commerce'}
        </span>
      </button>
    </div>
  );
}
