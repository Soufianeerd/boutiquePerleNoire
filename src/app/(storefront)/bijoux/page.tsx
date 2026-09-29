import { Metadata } from 'next';
import { getProducts, getCategories, getCollections } from '@/features/products/actions';
import { getStoreSettings } from '@/features/settings/actions';
import { CatalogClient } from '@/components/storefront/CatalogClient';

export const metadata: Metadata = {
  title: 'Tous les bijoux | Perle Noire',
  description:
    'Découvrez l’ensemble de nos créations : bagues, solitaires, colliers, bracelets et boucles d’oreilles façonnés avec élégance.',
};

export default async function BijouxPage(props: {
  searchParams: Promise<{
    categorie?: string;
    collection?: string;
    tri?: string;
    q?: string;
  }>;
}) {
  const searchParams = await props.searchParams;

  const [products, categories, collections, settings] = await Promise.all([
    getProducts({}),
    getCategories(),
    getCollections(),
    getStoreSettings(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-3">
        <span className="text-[11px] uppercase tracking-eyebrow text-[#77716A] font-light block">
          Le Catalogue
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl text-[#171717] font-normal uppercase tracking-editorial">
          Bijoux
        </h1>
        <p className="text-xs sm:text-sm text-[#77716A] font-light leading-relaxed max-w-md mx-auto">
          Des pièces aux silhouettes équilibrées, pensées pour traverser le temps et révéler chaque silhouette.
        </p>
      </div>

      {/* Catalog & Filter System */}
      <CatalogClient
        initialProducts={products}
        categories={categories}
        collections={collections}
        settings={settings}
        initialCategory={searchParams.categorie}
        initialCollection={searchParams.collection}
        initialSort={searchParams.tri || 'nouveautes'}
        initialQuery={searchParams.q || ''}
      />
    </div>
  );
}
