import { Metadata } from 'next';
import Link from 'next/link';
import { getStoreSettings } from '@/features/settings/actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Lock, ShieldCheck, CreditCard } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Finalisation de votre Acquisition | Perle Noire Joaillerie',
  description: 'Tunnel de commande sécurisé et confidentiel.',
};

export default async function CheckoutPage() {
  const settings = await getStoreSettings();

  if (!settings.commerce_enabled) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center space-y-8">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#F5F1EA] border border-[#E6DFD3] flex items-center justify-center text-[#A08154]">
          <Lock className="w-7 h-7 stroke-[1.5]" />
        </div>

        <div className="space-y-3">
          <span className="text-[11px] uppercase tracking-widest text-[#A08154] font-semibold block">
            Mode Vitrine
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl text-[#141414] font-normal">
            Le Paiement en Ligne est Réservé
          </h1>
          <div className="w-12 h-px bg-[#C5A880] mx-auto mt-4" />
        </div>

        <p className="text-xs sm:text-sm text-[#554E45] max-w-lg mx-auto font-light leading-relaxed">
          Pour acquérir cette création pendant la période de présentation vitrine, veuillez nous contacter directement ou solliciter un rendez-vous privé en salon.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/contact">
            <Button variant="primary" size="md">
              Demande d’Acquisition
            </Button>
          </Link>
          <Link href="/bijoux">
            <Button variant="outline" size="md">
              Retour aux Créations
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="text-center max-w-lg mx-auto mb-12">
        <span className="text-[11px] uppercase tracking-widest text-[#A08154] font-medium block mb-2">
          Tunnel Sécurisé
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl text-[#141414] font-normal">
          Finalisation de votre Acquisition
        </h1>
        <div className="w-10 h-px bg-[#C5A880] mx-auto mt-3" />
      </div>

      <div className="bg-[#FAF8F5] border border-[#E6DFD3] p-8 md:p-10 space-y-8">
        {/* Step 1: Customer identification */}
        <div className="space-y-4">
          <h3 className="font-editorial text-xl text-[#141414] border-b border-[#EAE4D9] pb-2">
            1. Informations de l’Acquéreur (Commande Invité)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Prénom *" placeholder="Claire" required />
            <Input label="Nom de famille *" placeholder="de Latour" required />
            <Input label="Adresse e-mail de confirmation *" type="email" placeholder="claire@exemple.com" required />
            <Input label="Téléphone de livraison *" type="tel" placeholder="+33 6 00 00 00 00" required />
          </div>
        </div>

        {/* Step 2: Shipping */}
        <div className="space-y-4">
          <h3 className="font-editorial text-xl text-[#141414] border-b border-[#EAE4D9] pb-2">
            2. Adresse de Livraison Confidentielle
          </h3>
          <div className="space-y-4">
            <Input label="Adresse (Ligne 1) *" placeholder="12 Avenue Victor Hugo" required />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="Code postal *" placeholder="75016" required />
              <Input label="Ville *" placeholder="Paris" required />
              <Input label="Pays *" defaultValue="France" required />
            </div>
          </div>
        </div>

        {/* Step 3: Payment preparation */}
        <div className="space-y-4">
          <h3 className="font-editorial text-xl text-[#141414] border-b border-[#EAE4D9] pb-2">
            3. Paiement Sécurisé (Préparation Stripe)
          </h3>
          <div className="p-4 bg-[#F5F1EA] border border-[#E6DFD3] text-xs text-[#554E45] space-y-2">
            <div className="flex items-center gap-2 font-medium text-[#141414]">
              <CreditCard className="w-4 h-4 text-[#A08154]" />
              <span>Passerelle Bancaire Chiffrée 256 bits</span>
            </div>
            <p className="font-light">
              Le module Stripe est configuré et prêt pour l’activation de vos clés de production Stripe (Carte bancaire, Apple Pay, Virement sécurisé).
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#EAE4D9]">
          <span className="font-editorial text-2xl text-[#141414]">
            Total : 3 850,00 € TTC
          </span>
          <Button variant="primary" size="lg" className="w-full sm:w-auto">
            Confirmer & Procéder au Paiement
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 text-[10px] text-[#736B5E] uppercase tracking-wider pt-2">
          <ShieldCheck className="w-4 h-4 text-[#A08154]" />
          <span>Garantie de discrétion & Valeur déclarée assurée à 100%</span>
        </div>
      </div>
    </div>
  );
}
