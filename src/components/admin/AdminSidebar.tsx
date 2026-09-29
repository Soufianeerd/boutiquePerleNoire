'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AdminUser } from '@/types/database';
import {
  LayoutDashboard,
  Gem,
  FolderTree,
  Sparkles,
  Image as ImageIcon,
  Boxes,
  ShoppingBag,
  Users,
  Layers,
  BarChart3,
  Sliders,
  ExternalLink,
  LogOut,
} from 'lucide-react';

interface AdminSidebarProps {
  admin?: AdminUser;
}

export function AdminSidebar({ admin }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { name: 'Vue d’Ensemble', href: '/admin', icon: LayoutDashboard },
    { name: 'Bijoux & Créations', href: '/admin/produits', icon: Gem },
    { name: 'Catégories', href: '/admin/categories', icon: FolderTree },
    { name: 'Collections', href: '/admin/collections', icon: Sparkles },
    { name: 'Médiathèque', href: '/admin/medias', icon: ImageIcon },
    { name: 'Gestion des Stocks', href: '/admin/stocks', icon: Boxes },
    { name: 'Commandes', href: '/admin/commandes', icon: ShoppingBag },
    { name: 'Clients & Demandes', href: '/admin/clients', icon: Users },
    { name: 'Contenu Homepage', href: '/admin/contenu', icon: Layers },
    { name: 'Statistiques', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Paramètres & Modes', href: '/admin/parametres', icon: Sliders },
  ];

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignored
    }
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <aside className="w-64 bg-[#141414] text-[#FAF8F5] border-r border-[#262624] flex flex-col justify-between shrink-0">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-[#262624]">
          <Link href="/admin" className="block">
            <span className="font-editorial text-xl tracking-wider uppercase text-[#FAF8F5] block">
              Perle Noire
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#C5A880] block mt-0.5">
              Administration Joaillerie
            </span>
          </Link>
          {admin && (
            <div className="mt-3 pt-3 border-t border-[#222220]">
              <span className="text-xs text-[#FAF8F5] block truncate font-medium">
                {admin.full_name}
              </span>
              <span className="text-[10px] text-[#736B5E] block truncate">
                {admin.email}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          {links.map((link) => {
            const isActive =
              link.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#222220] text-[#C5A880] border-l-2 border-[#C5A880]'
                    : 'text-[#9E9589] hover:text-[#FAF8F5] hover:bg-[#1C1C1A]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#C5A880]' : 'text-[#736B5E]'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-[#262624] space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 text-xs text-[#9E9589] hover:text-[#FAF8F5] hover:bg-[#1C1C1A] transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Voir le Storefront</span>
          </span>
          <span className="text-[9px] uppercase tracking-widest text-[#736B5E]">Public</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#8C827A] hover:text-red-400 hover:bg-[#1C1C1A] transition-colors text-left"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
