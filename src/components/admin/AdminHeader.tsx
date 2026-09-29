import React from 'react';
import { getStoreSettings } from '@/features/settings/actions';
import { AdminUser } from '@/types/database';
import { ModeQuickToggle } from './ModeQuickToggle';
import { ShieldCheck } from 'lucide-react';

interface AdminHeaderProps {
  admin?: AdminUser;
}

export async function AdminHeader({ admin }: AdminHeaderProps = {}) {
  const settings = await getStoreSettings();

  return (
    <header className="h-16 bg-[#181816] border-b border-[#282725] px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-xs text-[#9E9589] uppercase tracking-wider">
          Maison Perle Noire
        </span>
        <span className="text-[#3E3D3A]">/</span>
        <span className="text-xs text-[#FAF8F5] font-medium">
          Panneau de Direction
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* Instant Mode Toggle Button */}
        <ModeQuickToggle initialCommerceEnabled={settings.commerce_enabled} />

        {/* Administrator Profile Pill */}
        <div className="flex items-center gap-2 pl-4 border-l border-[#282725]">
          <div className="w-8 h-8 rounded-full bg-[#262624] border border-[#3E3D3A] flex items-center justify-center text-[#C5A880]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-left hidden md:block">
            <span className="text-xs text-[#FAF8F5] font-medium block leading-none">
              {admin?.full_name || 'Directeur Joaillier'}
            </span>
            <span className="text-[10px] text-[#736B5E] block mt-0.5 capitalize">
              {admin?.role?.replace('_', ' ') || 'Super Admin'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
