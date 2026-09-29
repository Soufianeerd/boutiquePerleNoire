import { Metadata } from 'next';
import { getStoreSettings } from '@/features/settings/actions';
import { ContactFormClient } from '@/components/storefront/ContactFormClient';
import { Phone, MessageSquare, Mail, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact & Rendez-vous | Perle Noire',
  description:
    'Prenez contact avec notre équipe pour toute information, commande spéciale ou demande de rendez-vous.',
};

export default async function ContactPage() {
  const settings = await getStoreSettings();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
        <span className="text-[11px] uppercase tracking-eyebrow text-[#77716A] font-light block">
          À Votre Écoute
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl text-[#171717] font-normal uppercase tracking-editorial">
          Contact
        </h1>
        <p className="text-xs sm:text-sm text-[#77716A] font-light leading-relaxed max-w-md mx-auto">
          Pour une question, un conseil ou une demande particulière, notre service clientèle vous accompagne avec attention.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left Information */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#F6F1EA] border border-[#E7E0D7] p-8 space-y-6">
            <h2 className="font-editorial text-2xl text-[#171717]">
              Coordonnées
            </h2>

            <ul className="space-y-4 text-xs text-[#77716A] font-light">
              <li className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-[#171717] shrink-0 mt-0.5 stroke-[1.25]" />
                <div>
                  <strong className="block text-[#171717] font-medium">Accueil & Rendez-vous</strong>
                  <span>{settings.address || 'Sur rendez-vous privé'}</span>
                </div>
              </li>

              {settings.phone && (
                <li className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#171717] shrink-0 mt-0.5 stroke-[1.25]" />
                  <div>
                    <strong className="block text-[#171717] font-medium">Téléphone</strong>
                    <a href={`tel:${settings.phone}`} className="hover:text-[#171717] hover-underline">
                      {settings.phone}
                    </a>
                  </div>
                </li>
              )}

              {settings.whatsapp && (
                <li className="flex items-start gap-3">
                  <MessageSquare className="w-4 h-4 text-[#171717] shrink-0 mt-0.5 stroke-[1.25]" />
                  <div>
                    <strong className="block text-[#171717] font-medium">WhatsApp</strong>
                    <a
                      href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#171717] hover-underline"
                    >
                      Échanger sur WhatsApp ({settings.whatsapp})
                    </a>
                  </div>
                </li>
              )}

              {settings.contact_email && (
                <li className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#171717] shrink-0 mt-0.5 stroke-[1.25]" />
                  <div>
                    <strong className="block text-[#171717] font-medium">E-mail</strong>
                    <a href={`mailto:${settings.contact_email}`} className="hover:text-[#171717] hover-underline">
                      {settings.contact_email}
                    </a>
                  </div>
                </li>
              )}
            </ul>
          </div>

          <div className="p-6 bg-[#FCFAF7] border border-[#E7E0D7] text-xs text-[#77716A] space-y-1.5 font-light">
            <h3 className="font-editorial text-lg text-[#171717]">Discrétion & Attention</h3>
            <p className="leading-relaxed">
              Toutes les demandes font l’objet d’un traitement soigné et confidentiel.
            </p>
          </div>
        </div>

        {/* Right Form */}
        <div className="lg:col-span-7 bg-[#FCFAF7] border border-[#E7E0D7] p-8 sm:p-10">
          <ContactFormClient defaultContactMethod={settings.default_contact_method} />
        </div>
      </div>
    </div>
  );
}
