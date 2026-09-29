import { Metadata } from 'next';
import Link from 'next/link';
import { getProducts, getCategories } from '@/features/products/actions';
import { getStoreSettings } from '@/features/settings/actions';
import { ProductCard } from '@/components/storefront/ProductCard';

export const metadata: Metadata = {
  title: 'Créations de Haute Joaillerie',
  description:
    'Explorez l’ensemble de nos bijoux : bagues solitaires, colliers, boucles d’oreilles et créations uniques en or 18 carats et perles de Tahiti.',
};

export default async function BijouxPage(props: {
  searchParams: Promise<{ categorie?: string }>;
}) {
  const searchParams = await props.searchParams;
  const currentCategory = searchParams.categorie;

  const [products, categories, settings] = await Promise.all([
    getProducts({ categorySlug: currentCategory }),
    getCategories(),
    getStoreSettings(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-[11px] uppercase tracking-widest text-[#A08154] font-medium block mb-2">
          Le Catalogue de l’Atelier
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl text-[#141414] font-normal">
          Nos Créations Joaillières
        </h1>
        <div className="w-12 h-px bg-[#C5A880] mx-auto mt-4" />
        <p className="text-xs sm:text-sm text-[#736B5E] mt-4 font-light leading-relaxed">
          Chaque joyau est une composition originale pensée pour mettre en valeur les nuances infinies de la nacre polynésienne et l’éclat pur des diamants.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center justify-center flex-wrap gap-2 mb-12 border-b border-[#E6DFD3] pb-4">
        <Link
          href="/bijoux"
          className={`px-4 py-2 text-xs uppercase tracking-wider transition-colors ${
            !currentCategory
              ? 'bg-[#141414] text-[#FAF8F5]'
              : 'text-[#554E45] hover:text-[#141414] bg-transparent'
          }`}
        >
          Toutes les Pièces
        </Link>
        {categories.map((cat) => {
          const isActive = currentCategory === cat.slug;
          return (
            <Link
              key={cat.id}
              href={`/bijoux?categorie=${cat.slug}`}
              className={`px-4 py-2 text-xs uppercase tracking-wider transition-colors ${
                isActive
                  ? 'bg-[#141414] text-[#FAF8F5]'
                  : 'text-[#554E45] hover:text-[#141414] bg-transparent'
              }`}
            >
              {cat.name}
            </Link>
          );
        })}
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-20 border border-[#E6DFD3] bg-[#FAF8F5] p-8">
          <p className="font-editorial text-xl text-[#141414]">Aucune création dans cette catégorie</p>
          <p className="text-xs text-[#736B5E] mt-2">
            Nos orfèvres préparent de nouvelles pièces au sein de l’atelier.
          </p>
          <div className="mt-6">
            <Link
              href="/bijoux"
              className="inline-block text-xs uppercase tracking-wider bg-[#141414] text-[#FAF8F5] px-6 py-3"
            >
              Voir toutes les créations
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              settings={settings}
            />
          ))}
        </div>
      )}
    </div>
  );
}
