'use client';

import React, { useState } from 'react';
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
  Menu,
  X,
} from 'lucide-react';

interface AdminSidebarProps {
  admin?: AdminUser;
}

export function AdminSidebar({ admin }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { name: 'Vue d’Ensemble', href: '/admin', icon: LayoutDashboard },
    { name: 'Produits', href: '/admin/produits', icon: Gem },
    { name: 'Catégories', href: '/admin/categories', icon: FolderTree },
    { name: 'Collections', href: '/admin/collections', icon: Sparkles },
    { name: 'Médiathèque', href: '/admin/medias', icon: ImageIcon },
    { name: 'Gestion des Stocks', href: '/admin/stocks', icon: Boxes },
    { name: 'Commandes', href: '/admin/commandes', icon: ShoppingBag },
    { name: 'Demandes Clients', href: '/admin/clients', icon: Users },
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

  const navContent = (
    <>
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-[#262624] flex items-center justify-between">
          <Link href="/admin" onClick={() => setMobileOpen(false)} className="block">
            <span className="font-editorial text-xl tracking-wider uppercase text-[#FAF8F5] block">
              Perle Noire
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#C5A880] block mt-0.5">
              Administration Boutique
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1 text-[#8C827A] hover:text-[#FAF8F5]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {admin && (
          <div className="px-6 py-3 border-b border-[#222220] bg-[#161614]">
            <span className="text-xs text-[#FAF8F5] block truncate font-medium">
              {admin.full_name}
            </span>
            <span className="text-[10px] text-[#736B5E] block truncate">
              {admin.email}
            </span>
          </div>
        )}

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
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#222220] text-[#C5A880] border-l-2 border-[#C5A880]'
                    : 'text-[#9E9589] hover:text-[#FAF8F5] hover:bg-[#1C1C1A]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-[#C5A880]' : 'text-[#736B5E]'
                  }`}
                />
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
            <span>Voir la boutique</span>
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
    </>
  );

  return (
    <>
      {/* Mobile Floating Menu Button */}
      <div className="md:hidden fixed top-3 left-3 z-50">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="w-10 h-10 rounded-md bg-[#1C1C1A] border border-[#3E3D3A] text-[#C5A880] flex items-center justify-center shadow-lg"
          aria-label="Ouvrir le menu d'administration"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-full bg-[#141414] text-[#FAF8F5] flex flex-col justify-between z-10 shadow-2xl overflow-y-auto">
            {navContent}
          </div>
        </div>
      )}

      {/* Desktop Fixed Sidebar */}
      <aside className="w-64 bg-[#141414] text-[#FAF8F5] border-r border-[#262624] hidden md:flex flex-col justify-between shrink-0">
        {navContent}
      </aside>
    </>
  );
}
