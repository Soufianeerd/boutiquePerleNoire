import React from 'react';
import Link from 'next/link';
import { StoreSettings } from '@/types/database';
import { MapPin, Phone, MessageSquare, Mail } from 'lucide-react';

interface StorefrontFooterProps {
  settings: StoreSettings;
}

export function StorefrontFooter({ settings }: StorefrontFooterProps) {
  return (
    <footer className="bg-[#141414] text-[#FAF8F5] pt-16 pb-12 border-t border-[#262624]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#282725]">
          {/* Brand Philosophy */}
          <div className="md:col-span-1 space-y-4">
            <span className="font-editorial text-2xl uppercase tracking-wider text-[#FAF8F5] block">
              {settings.brand_name}
            </span>
            <p className="text-xs text-[#9E9589] leading-relaxed">
              Haute Joaillerie parisienne dédiée à la valorisation de la perle noire de Tahiti et des pierres précieuses éthiques de premier ordre.
            </p>
            <div className="text-[10px] uppercase tracking-widest text-[#C5A880]">
              Maison Fondée Place Vendôme
            </div>
          </div>

          {/* Salons & Atelier */}
          <div className="space-y-3">
            <h4 className="text-[11px] uppercase tracking-widest text-[#C5A880] font-medium">
              Salons Privés
            </h4>
            <ul className="space-y-2 text-xs text-[#C8BDAE]">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#A08154] shrink-0 mt-0.5" />
                <span>{settings.address || '18 Place Vendôme, 75001 Paris'}</span>
              </li>
              <li className="pt-1 text-[#8C827A] text-[11px]">
                Du Mardi au Samedi, sur rendez-vous exclusif uniquement.
              </li>
            </ul>
          </div>

          {/* Conciergerie */}
          <div className="space-y-3">
            <h4 className="text-[11px] uppercase tracking-widest text-[#C5A880] font-medium">
              Conciergerie & Contact
            </h4>
            <ul className="space-y-2 text-xs text-[#C8BDAE]">
              {settings.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#A08154]" />
                  <a href={`tel:${settings.phone}`} className="hover:text-[#FAF8F5] transition-colors">
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.whatsapp && (
                <li className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-[#A08154]" />
                  <a
                    href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#FAF8F5] transition-colors"
                  >
                    WhatsApp Concierge ({settings.whatsapp})
                  </a>
                </li>
              )}
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#A08154]" />
                <a href={`mailto:${settings.contact_email}`} className="hover:text-[#FAF8F5] transition-colors">
                  {settings.contact_email}
                </a>
              </li>
              {settings.instagram_url && (
                <li className="flex items-center gap-2 pt-1">
                  <svg className="w-3.5 h-3.5 text-[#A08154]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                  <a
                    href={settings.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#FAF8F5] transition-colors"
                  >
                    @perlenoirejoaillerie
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Collections Navigation */}
          <div className="space-y-3">
            <h4 className="text-[11px] uppercase tracking-widest text-[#C5A880] font-medium">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-[#A89E90]">
              <li>
                <Link href="/bijoux" className="hover:text-[#FAF8F5] transition-colors">
                  Toutes les Créations
                </Link>
              </li>
              <li>
                <Link href="/collections" className="hover:text-[#FAF8F5] transition-colors">
                  Collections Thématiques
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="hover:text-[#FAF8F5] transition-colors">
                  L’Atelier & Savoir-Faire
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#FAF8F5] transition-colors">
                  Demande de Rendez-vous
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#C5A880] transition-colors text-[11px] flex items-center gap-1">
                  <span>Accès Administration</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#736B5E] gap-4">
          <p>© {new Date().getFullYear()} {settings.brand_name}. Tous droits réservés.</p>
          <div className="flex items-center space-x-6 text-[11px]">
            <span>Mentions Légales</span>
            <span>Confidentialité</span>
            <span>Certificats & Gemmologie</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
