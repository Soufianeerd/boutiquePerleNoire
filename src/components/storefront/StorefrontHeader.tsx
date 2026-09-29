'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { StoreSettings } from '@/types/database';
import { ShoppingBag, Menu, X, ShieldCheck } from 'lucide-react';
import { InquiryModal } from './InquiryModal';

interface StorefrontHeaderProps {
  settings: StoreSettings;
}

export function StorefrontHeader({ settings }: StorefrontHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  const navigation = [
    { name: 'Créations', href: '/bijoux' },
    { name: 'Collections', href: '/collections' },
    { name: 'La Maison', href: '/a-propos' },
    { name: 'Conciergerie & Salons', href: '/contact' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-xs border-b border-[#E6DFD3] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile menu trigger */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-[#141414] hover:text-[#A08154] transition-colors"
                aria-label="Ouvrir le menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 stroke-[1.5]" /> : <Menu className="w-5 h-5 stroke-[1.5]" />}
              </button>
            </div>

            {/* Main Navigation (Desktop) */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-[11px] uppercase tracking-widest transition-colors ${
                      isActive ? 'text-[#141414] font-semibold border-b border-[#141414] pb-0.5' : 'text-[#554E45] hover:text-[#141414]'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Brand Logo / Monogram */}
            <div className="text-center">
              <Link href="/" className="inline-block group">
                <span className="font-editorial text-2xl sm:text-3xl tracking-wide uppercase text-[#141414] block leading-none">
                  {settings.brand_name}
                </span>
                <span className="text-[9px] uppercase tracking-[0.3em] text-[#8C827A] block mt-1">
                  Place Vendôme Paris
                </span>
              </Link>
            </div>

            {/* Right Action Icons & Mode indicator */}
            <div className="flex items-center space-x-4">
              {/* Quick Admin Access link */}
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#736B5E] hover:text-[#141414] px-2.5 py-1 border border-[#DDD5C7] hover:border-[#141414] transition-colors"
                title="Accès Administration & Gestion des Modes"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#A08154]" />
                <span>Admin</span>
              </Link>

              {settings.commerce_enabled ? (
                /* E-Commerce Active: Shopping Bag */
                <Link
                  href="/panier"
                  className="relative p-2 text-[#141414] hover:text-[#A08154] transition-colors flex items-center gap-1.5"
                  aria-label="Mon Panier"
                >
                  <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
                  <span className="hidden md:inline text-[11px] uppercase tracking-wider font-medium">Panier</span>
                </Link>
              ) : (
                /* Vitrine Mode: Private Appointment CTA */
                <button
                  type="button"
                  onClick={() => setInquiryOpen(true)}
                  className="hidden sm:inline-flex items-center text-[10px] uppercase tracking-widest px-3.5 py-2 bg-[#141414] text-[#FAF8F5] hover:bg-[#2D2D2A] transition-colors"
                >
                  Rendez-vous
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E6DFD3] bg-[#FAF8F5] px-6 py-6 space-y-4">
            <nav className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs uppercase tracking-widest text-[#141414] py-1 border-b border-[#F0EAE1]"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="pt-4 flex flex-col gap-2">
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-[11px] uppercase tracking-wider text-[#736B5E] py-2 border border-[#DDD5C7]"
              >
                Espace Administrateur
              </Link>
              {!settings.commerce_enabled && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setInquiryOpen(true);
                  }}
                  className="w-full text-center text-[11px] uppercase tracking-wider bg-[#141414] text-[#FAF8F5] py-2.5"
                >
                  Prendre Rendez-vous
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <InquiryModal
        isOpen={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
      />
    </>
  );
}
