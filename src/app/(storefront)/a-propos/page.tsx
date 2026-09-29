import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Award, Compass, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'La Maison & L’Atelier | Perle Noire Joaillerie',
  description:
    'Découvrez l’histoire de la Maison Perle Noire, notre atelier de la Place Vendôme à Paris et notre passion pour les perles de culture de Tahiti.',
};

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-20">
      {/* Title */}
      <div className="text-center space-y-4">
        <span className="text-[11px] uppercase tracking-widest text-[#A08154] font-medium block">
          Tradition & Rareté Géologique
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl text-[#141414] font-normal leading-tight">
          L’Art Éternel de la Perle Sombre
        </h1>
        <div className="w-16 h-px bg-[#C5A880] mx-auto mt-4" />
      </div>

      {/* Narrative Section 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-4 text-xs sm:text-sm text-[#554E45] leading-relaxed font-light">
          <h2 className="font-editorial text-2xl sm:text-3xl text-[#141414] font-normal">
            Le Secret de la Place Vendôme
          </h2>
          <p>
            Établie au cœur du 18 Place Vendôme à Paris, la Maison Perle Noire s’est construite autour d’une obsession : sublimer la gemme la plus mystérieuse que la nature ait créée.
          </p>
          <p>
            Contrairement aux pierres taillées par la main de l’homme, la perle noire de Tahiti naît parfaite dans l’intimité de la nacre de l’huître Pinctada Margaritifera. Chaque lustre, chaque reflet aubergine, vert scarabée ou paon est une empreinte irremplaçable du temps océanique.
          </p>
        </div>

        <div className="aspect-4/3 bg-[#F0EAE1] border border-[#DDD5C7] p-8 flex flex-col justify-center items-center text-center">
          <div className="w-24 h-24 rounded-full border border-[#D5C9B8] bg-[#FAF8F5] flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-[#C5A880]" />
          </div>
          <span className="font-editorial text-xl text-[#141414] mt-4 block">
            Atelier de Haute Joaillerie
          </span>
          <span className="text-[10px] uppercase tracking-widest text-[#8C827A] mt-1">
            Paris • Salons Privés
          </span>
        </div>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-[#E6DFD3]">
        <div className="p-6 bg-[#FAF8F5] border border-[#E6DFD3] space-y-3">
          <Compass className="w-6 h-6 text-[#A08154] stroke-[1.5]" />
          <h3 className="font-editorial text-xl text-[#141414]">Sélection à la Source</h3>
          <p className="text-xs text-[#736B5E] leading-relaxed font-light">
            Nos gemmologues sélectionnent rigoureusement les perles directement auprès de fermes perlières familiales respectueuses de l’écosystème marin des Tuamotu.
          </p>
        </div>

        <div className="p-6 bg-[#FAF8F5] border border-[#E6DFD3] space-y-3">
          <Award className="w-6 h-6 text-[#A08154] stroke-[1.5]" />
          <h3 className="font-editorial text-xl text-[#141414]">Savoir-Faire Français</h3>
          <p className="text-xs text-[#736B5E] leading-relaxed font-light">
            Fonte, ciselure, sertissage grain et polissage miroir sont exécutés manuellement à l’établi par nos artisans orfèvres héritiers des gestes de la haute tradition parisienne.
          </p>
        </div>

        <div className="p-6 bg-[#FAF8F5] border border-[#E6DFD3] space-y-3">
          <Sparkles className="w-6 h-6 text-[#A08154] stroke-[1.5]" />
          <h3 className="font-editorial text-xl text-[#141414]">L’Écrin Sur-Mesure</h3>
          <p className="text-xs text-[#736B5E] leading-relaxed font-light">
            Chaque création est remise dans un coffret de cuir pleine fleur gainé de soie noire, accompagnée de son passeport d’expertise gemmologique officielle.
          </p>
        </div>
      </div>

      {/* Call to visit */}
      <div className="text-center pt-8 space-y-6">
        <h2 className="font-editorial text-3xl text-[#141414] font-normal">
          Vivez l’Expérience en Salon Privé
        </h2>
        <p className="text-xs sm:text-sm text-[#736B5E] max-w-lg mx-auto font-light leading-relaxed">
          Nous vous accueillons en toute discrétion au 18 Place Vendôme pour concevoir un bijou sur-mesure ou admirer nos pièces d’exception.
        </p>
        <Link href="/contact">
          <Button variant="primary" size="md">
            Solliciter un Rendez-vous
          </Button>
        </Link>
      </div>
    </div>
  );
}
