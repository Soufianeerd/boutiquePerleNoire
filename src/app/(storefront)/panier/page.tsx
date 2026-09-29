import { Metadata } from 'next';
import Link from 'next/link';
import { getStoreSettings } from '@/features/settings/actions';
import { Button } from '@/components/ui/Button';
import { ShoppingBag, ArrowRight, ShieldCheck, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Votre Panier d’Acquisition | Perle Noire Joaillerie',
  description: 'Consultez votre sélection de Haute Joaillerie avant validation de commande.',
};

export default async function PanierPage() {
  const settings = await getStoreSettings();

  // If E-Commerce is deactivated, show Mode Vitrine luxury guidance
  if (!settings.commerce_enabled) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center space-y-8">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#F5F1EA] border border-[#E6DFD3] flex items-center justify-center text-[#A08154]">
          <Lock className="w-7 h-7 stroke-[1.5]" />
        </div>

        <div className="space-y-3">
          <span className="text-[11px] uppercase tracking-widest text-[#A08154] font-semibold block">
            Mode Vitrine Exclusif Actif
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl text-[#141414] font-normal">
            Le Panier en Ligne est Temporairement Désactivé
          </h1>
          <div className="w-12 h-px bg-[#C5A880] mx-auto mt-4" />
        </div>

        <p className="text-xs sm:text-sm text-[#554E45] max-w-lg mx-auto font-light leading-relaxed">
          La Maison Perle Noire opère actuellement en mode vitrine éditoriale. Les acquisitions s’effectuent en salon privé à la Place Vendôme ou auprès de notre conciergerie personnalisée.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/contact">
            <Button variant="primary" size="md">
              Contacter le Concierge Joaillier
            </Button>
          </Link>
          <Link href="/bijoux">
            <Button variant="outline" size="md">
              Explorer les Créations
            </Button>
          </Link>
        </div>

        <div className="pt-8 border-t border-[#E6DFD3] text-[11px] text-[#736B5E]">
          <span>Administrateur de la bijouterie ? Activez l’e-commerce en 1 clic dans </span>
          <Link href="/admin/parametres" className="underline text-[#141414] font-medium">
            Paramètres &gt; Mode de Vente
          </Link>.
        </div>
      </div>
    );
  }

  // When E-commerce IS active
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-[11px] uppercase tracking-widest text-[#A08154] font-medium block mb-2">
          Sélection Joaillière
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl text-[#141414] font-normal">
          Votre Panier d’Acquisition
        </h1>
        <div className="w-10 h-px bg-[#C5A880] mx-auto mt-3" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Cart items listing */}
        <div className="lg:col-span-8 bg-[#FAF8F5] border border-[#E6DFD3] p-6 space-y-6">
          <div className="py-4 border-b border-[#EAE4D9] flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#141414] font-medium">
              Création sélectionnée
            </span>
            <span className="text-xs uppercase tracking-wider text-[#141414] font-medium">
              Prix
            </span>
          </div>

          {/* Sample cart item representation */}
          <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#F0EAE1] border border-[#DDD5C7] flex items-center justify-center shrink-0">
                <ShoppingBag className="w-6 h-6 text-[#A08154]" />
              </div>
              <div>
                <h3 className="font-editorial text-lg text-[#141414]">
                  Bague Solitaire Éclipse Noire
                </h3>
                <p className="text-[11px] text-[#736B5E]">Taille 52 • Or Blanc 18K & Perle de Tahiti</p>
                <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block mt-1">Qté : 1</span>
              </div>
            </div>
            <span className="font-editorial text-lg text-[#141414]">
              3 850,00 €
            </span>
          </div>

          <div className="pt-4 border-t border-[#EAE4D9] text-right">
            <Link href="/bijoux" className="text-xs uppercase tracking-wider text-[#736B5E] hover:text-[#141414] underline">
              Continuer mes sélections
            </Link>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-4 bg-[#F5F1EA] border border-[#E6DFD3] p-6 space-y-6 h-fit">
          <h2 className="font-editorial text-xl text-[#141414] border-b border-[#E6DFD3] pb-3">
            Récapitulatif
          </h2>

          <div className="space-y-3 text-xs text-[#554E45]">
            <div className="flex justify-between">
              <span>Sous-total HT</span>
              <span>3 208,33 €</span>
            </div>
            <div className="flex justify-between">
              <span>TVA (20%)</span>
              <span>641,67 €</span>
            </div>
            <div className="flex justify-between">
              <span>Livraison blindée assurée</span>
              <span className="text-[#A08154] font-medium">Offerte</span>
            </div>
            <div className="pt-3 border-t border-[#DDD5C7] flex justify-between text-sm font-medium text-[#141414]">
              <span>Total TTC</span>
              <span className="font-editorial text-xl">3 850,00 €</span>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <Link href="/checkout" className="block">
              <Button variant="primary" size="md" fullWidth className="flex items-center gap-2">
                <span>Passer la Commande</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#736B5E] uppercase tracking-wider pt-2">
              <ShieldCheck className="w-4 h-4 text-[#A08154]" />
              <span>Commande invité sans création de compte</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
