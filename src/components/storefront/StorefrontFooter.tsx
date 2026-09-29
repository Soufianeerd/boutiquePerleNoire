import React from 'react';
import Link from 'next/link';
import { StoreSettings } from '@/types/database';

interface StorefrontFooterProps {
  settings: StoreSettings;
}

export function StorefrontFooter({ settings }: StorefrontFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#171717] text-[#FCFAF7] pt-16 pb-12 border-t border-[#262626]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-16 border-b border-[#262626]">
          {/* Column 1: Boutique */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-[#B99A64] font-medium">
              Boutique
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A69B8D] font-light">
              <li>
                <Link href="/bijoux?tri=nouveautes" className="hover:text-[#FCFAF7] transition-colors">
                  Nouveautés
                </Link>
              </li>
              <li>
                <Link href="/bijoux" className="hover:text-[#FCFAF7] transition-colors">
                  Tous les bijoux
                </Link>
              </li>
              <li>
                <Link href="/collections" className="hover:text-[#FCFAF7] transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/bijoux?categorie=bagues" className="hover:text-[#FCFAF7] transition-colors">
                  Bagues & Solitaires
                </Link>
              </li>
              <li>
                <Link href="/bijoux?categorie=colliers" className="hover:text-[#FCFAF7] transition-colors">
                  Colliers & Pendentifs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Informations */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-[#B99A64] font-medium">
              Informations
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A69B8D] font-light">
              <li>
                <Link href="/a-propos" className="hover:text-[#FCFAF7] transition-colors">
                  À propos de la marque
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#FCFAF7] transition-colors">
                  Sur rendez-vous
                </Link>
              </li>
              <li>
                <Link href="/bijoux" className="hover:text-[#FCFAF7] transition-colors">
                  Guide des créations
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Aide */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-[#B99A64] font-medium">
              Aide & Services
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A69B8D] font-light">
              <li>
                <Link href="/contact" className="hover:text-[#FCFAF7] transition-colors">
                  Service client & Conciergerie
                </Link>
              </li>
              <li>
                <span className="text-[#A69B8D]">Livraison suivie offerte</span>
              </li>
              <li>
                <span className="text-[#A69B8D]">Retours sous 30 jours</span>
              </li>
              {settings.contact_email && (
                <li>
                  <a href={`mailto:${settings.contact_email}`} className="hover:text-[#FCFAF7] transition-colors">
                    {settings.contact_email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Column 4: Réseaux & Contact */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-[#B99A64] font-medium">
              Contact & Réseaux
            </h4>
            <div className="space-y-3 text-xs text-[#A69B8D] font-light">
              <p>
                Pour toute demande d’information ou commande sur mesure, notre équipe vous répond avec attention.
              </p>
              {settings.whatsapp && (
                <div>
                  <a
                    href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-[#FCFAF7] hover:underline hover-underline"
                  >
                    WhatsApp : {settings.whatsapp}
                  </a>
                </div>
              )}
              {settings.instagram_url && (
                <div>
                  <a
                    href={settings.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-[#FCFAF7] hover:underline hover-underline"
                  >
                    Instagram
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Legal & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#77716A] gap-4 font-light">
          <p>© {currentYear} {settings.brand_name || 'Perle Noire'}. Tous droits réservés.</p>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <span className="hover:text-[#FCFAF7] transition-colors cursor-pointer">
              Mentions légales
            </span>
            <span className="hover:text-[#FCFAF7] transition-colors cursor-pointer">
              CGV
            </span>
            <span className="hover:text-[#FCFAF7] transition-colors cursor-pointer">
              Confidentialité
            </span>
            <span className="hover:text-[#FCFAF7] transition-colors cursor-pointer">
              Livraison & Retours
            </span>
            <Link href="/admin" className="hover:text-[#B99A64] transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
