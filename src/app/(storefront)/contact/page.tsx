import { Metadata } from 'next';
import { getStoreSettings } from '@/features/settings/actions';
import { ContactFormClient } from './ContactFormClient';
import { MapPin, Phone, MessageSquare, Mail, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Conciergerie & Rendez-vous en Salon | Perle Noire Joaillerie',
  description:
    'Prenez contact avec la conciergerie de la Maison Perle Noire. Réservez une visite privée de nos salons de la Place Vendôme ou échangez avec nos gemmologues.',
};

export default async function ContactPage() {
  const settings = await getStoreSettings();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-[11px] uppercase tracking-widest text-[#A08154] font-medium block mb-2">
          Conciergerie Privée
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl text-[#141414] font-normal">
          Nous Contacter & Prendre Rendez-vous
        </h1>
        <div className="w-12 h-px bg-[#C5A880] mx-auto mt-4" />
        <p className="text-xs sm:text-sm text-[#736B5E] mt-4 font-light leading-relaxed">
          Que ce soit pour une commande personnalisée, une acquisition ou une présentation privée au salon, nos conseillers joailliers vous accompagnent avec la plus haute discrétion.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Information */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-[#F5F1EA] border border-[#E6DFD3] p-8 space-y-6">
            <h2 className="font-editorial text-2xl text-[#141414]">
              Les Salons Vendôme
            </h2>

            <ul className="space-y-4 text-xs text-[#554E45]">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#A08154] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#141414] font-medium">Adresse</strong>
                  <span>{settings.address || '18 Place Vendôme, 75001 Paris'}</span>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#A08154] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#141414] font-medium">Horaires d’accueil</strong>
                  <span>Du Mardi au Samedi : 10h30 — 19h00 (Sur rendez-vous exclusif)</span>
                </div>
              </li>

              {settings.phone && (
                <li className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#A08154] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#141414] font-medium">Ligne directe salon</strong>
                    <a href={`tel:${settings.phone}`} className="hover:text-[#141414] underline">
                      {settings.phone}
                    </a>
                  </div>
                </li>
              )}

              {settings.whatsapp && (
                <li className="flex items-start gap-3">
                  <MessageSquare className="w-4 h-4 text-[#A08154] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#141414] font-medium">Conciergerie WhatsApp</strong>
                    <a
                      href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#141414] underline"
                    >
                      Échanger instantanément ({settings.whatsapp})
                    </a>
                  </div>
                </li>
              )}

              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#A08154] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#141414] font-medium">Correspondance</strong>
                  <a href={`mailto:${settings.contact_email}`} className="hover:text-[#141414] underline">
                    {settings.contact_email}
                  </a>
                </div>
              </li>
            </ul>
          </div>

          <div className="p-6 bg-[#FAF8F5] border border-[#E6DFD3] text-xs text-[#736B5E] space-y-2">
            <h3 className="font-editorial text-lg text-[#141414]">Confidentialité & Sécurité</h3>
            <p className="leading-relaxed font-light">
              Toutes les correspondances et visites privées sont soumises à la plus stricte confidentialité bancaire et joaillière.
            </p>
          </div>
        </div>

        {/* Right Form */}
        <div className="lg:col-span-7 bg-[#FAF8F5] border border-[#E6DFD3] p-8 md:p-10">
          <ContactFormClient defaultContactMethod={settings.default_contact_method} />
        </div>
      </div>
    </div>
  );
}
