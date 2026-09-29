import { Metadata } from 'next';
import Link from 'next/link';
import { getCollections } from '@/features/products/actions';
import { LuxuryImage } from '@/components/storefront/LuxuryImage';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Nos Collections | Perle Noire',
  description:
    'Découvrez les collections thématiques de bijoux contemporains façonnés avec élégance.',
};

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
        <span className="text-[11px] uppercase tracking-eyebrow text-[#77716A] font-light block">
          Univers Thématiques
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl text-[#171717] font-normal uppercase tracking-editorial">
          Collections
        </h1>
        <p className="text-xs sm:text-sm text-[#77716A] font-light leading-relaxed max-w-md mx-auto">
          Chaque collection exprime un dialogue singulier entre pureté des lignes, équilibre des volumes et éclat des matières.
        </p>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {collections.map((col) => (
          <Link
            key={col.id}
            href={`/collections/${col.slug}`}
            className="group flex flex-col bg-[#FCFAF7] border border-[#E7E0D7] hover:border-[#171717] transition-all duration-300"
            aria-label={`Explorer la collection ${col.name}`}
          >
            <div className="relative aspect-4/5 w-full bg-[#F6F1EA] overflow-hidden">
              <LuxuryImage
                src={col.image_url || col.hero_url}
                alt={col.name}
                aspectRatio="4/5"
                label={col.name}
              />
            </div>

            <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
              <div>
                <h2 className="font-editorial text-2xl text-[#171717] group-hover:text-[#77716A] transition-colors">
                  {col.name}
                </h2>
                {col.description && (
                  <p className="text-xs text-[#77716A] mt-2 line-clamp-3 leading-relaxed font-light">
                    {col.description}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-[#E7E0D7] flex items-center justify-between text-xs uppercase tracking-wider text-[#171717]">
                <span className="hover-underline font-medium">Découvrir les pièces</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[1.25] transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
