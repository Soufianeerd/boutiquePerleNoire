'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { StoreSettings } from '@/types/database';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';
import { SearchModal } from './SearchModal';

interface StorefrontHeaderProps {
  settings: StoreSettings;
}

export function StorefrontHeader({ settings }: StorefrontHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Nouveautés', href: '/bijoux?tri=nouveautes' },
    { name: 'Bijoux', href: '/bijoux' },
    { name: 'Collections', href: '/collections' },
    { name: 'À propos', href: '/a-propos' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-[#FCFAF7]/95 backdrop-blur-md transition-all duration-300 ${
          isScrolled ? 'border-b border-[#E7E0D7] shadow-[0_2px_12px_rgba(0,0,0,0.02)]' : 'border-b border-[#E7E0D7]/60'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 sm:h-20">
            {/* Mobile menu trigger */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 -ml-2 text-[#171717] hover:text-[#77716A] transition-colors"
                aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 stroke-[1.25]" />
                ) : (
                  <Menu className="w-5 h-5 stroke-[1.25]" />
                )}
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-xs tracking-wider transition-colors hover-underline ${
                      isActive
                        ? 'text-[#171717] font-medium'
                        : 'text-[#77716A] hover:text-[#171717]'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Brand Logo */}
            <div className="text-center">
              <Link href="/" className="inline-block group py-2">
                <span className="font-editorial text-2xl sm:text-3xl tracking-wide uppercase text-[#171717] block leading-none font-normal">
                  {settings.brand_name || 'Perle Noire'}
                </span>
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#77716A] block mt-1 font-light">
                  Joaillerie
                </span>
              </Link>
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center space-x-3 sm:space-x-5">
              {/* Search trigger */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-2 text-[#171717] hover:text-[#77716A] transition-colors flex items-center gap-1.5"
                aria-label="Rechercher"
              >
                <Search className="w-4.5 h-4.5 stroke-[1.25]" />
                <span className="hidden md:inline text-xs tracking-wider text-[#77716A] font-light">
                  Recherche
                </span>
              </button>

              {/* Cart: ONLY IF commerce_enabled = true */}
              {settings.commerce_enabled && (
                <Link
                  href="/panier"
                  className="p-2 text-[#171717] hover:text-[#77716A] transition-colors flex items-center gap-1.5 relative"
                  aria-label="Panier"
                >
                  <ShoppingBag className="w-4.5 h-4.5 stroke-[1.25]" />
                  <span className="hidden md:inline text-xs tracking-wider font-light">
                    Panier
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E7E0D7] bg-[#FCFAF7] px-6 py-8 space-y-6 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-editorial text-xl text-[#171717] py-1 border-b border-[#E7E0D7]/50"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="pt-4 border-t border-[#E7E0D7] flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchOpen(true);
                }}
                className="flex items-center gap-2 text-xs tracking-wider text-[#77716A] py-2"
              >
                <Search className="w-4 h-4 stroke-[1.25]" />
                <span>Rechercher un bijou</span>
              </button>

              {settings.commerce_enabled && (
                <Link
                  href="/panier"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-xs tracking-wider text-[#171717] py-2"
                >
                  <ShoppingBag className="w-4 h-4 stroke-[1.25]" />
                  <span>Mon panier</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}
