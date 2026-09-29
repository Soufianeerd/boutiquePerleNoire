import { Metadata } from 'next';
import Link from 'next/link';
import { getCollections } from '@/features/products/actions';
import { ArrowRight, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Les Collections | Perle Noire Joaillerie',
  description:
    'Découvrez les collections thématiques de la Maison Perle Noire, inspirées par les mystères de la Polynésie et l’artisanat de la Place Vendôme.',
};

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-[11px] uppercase tracking-widest text-[#A08154] font-medium block mb-2">
          Récits & Métaux Précieux
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl text-[#141414] font-normal">
          Nos Collections Thématiques
        </h1>
        <div className="w-12 h-px bg-[#C5A880] mx-auto mt-4" />
        <p className="text-xs sm:text-sm text-[#736B5E] mt-4 font-light leading-relaxed">
          Chaque collection incarne un chapitre singulier de notre recherche stylistique, unissant le feu des gemmes et la profondeur nacrée des lagons.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {collections.map((col) => (
          <Link
            key={col.id}
            href={`/collections/${col.slug}`}
            className="group flex flex-col bg-[#FAF8F5] border border-[#E6DFD3] hover:border-[#141414] transition-all duration-300"
          >
            <div className="relative aspect-4/5 w-full bg-[#F0EAE1] overflow-hidden flex items-center justify-center p-8">
              <div className="w-28 h-28 rounded-full border border-[#D8CFC4] bg-[#FAF8F5] flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                <Sparkles className="w-8 h-8 text-[#C5A880]" />
              </div>
              <span className="absolute bottom-4 left-4 text-[10px] uppercase tracking-widest text-[#8C827A]">
                Collection Atelier
              </span>
            </div>

            <div className="p-6 flex flex-col justify-between flex-1">
              <div>
                <h3 className="font-editorial text-2xl text-[#141414] group-hover:text-[#A08154] transition-colors">
                  {col.name}
                </h3>
                <p className="text-xs text-[#736B5E] mt-2 line-clamp-3 leading-relaxed font-light">
                  {col.description}
                </p>
              </div>

              <div className="pt-6 border-t border-[#EAE4D9] mt-6 flex items-center justify-between text-xs uppercase tracking-wider text-[#141414] font-medium">
                <span>Découvrir l’univers</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
