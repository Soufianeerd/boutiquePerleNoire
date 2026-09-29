import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCollections, getProducts } from '@/features/products/actions';
import { getStoreSettings } from '@/features/settings/actions';
import { ProductCard } from '@/components/storefront/ProductCard';

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const collections = await getCollections();
  const collection = collections.find((c) => c.slug === slug);

  if (!collection) {
    return { title: 'Collection non trouvée' };
  }

  return {
    title: `${collection.name} | Perle Noire`,
    description: collection.description || undefined,
  };
}

export default async function CollectionDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const collections = await getCollections();
  const collection = collections.find((c) => c.slug === slug);

  if (!collection) {
    notFound();
  }

  const [products, settings] = await Promise.all([
    getProducts({ collectionSlug: slug }),
    getStoreSettings(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Breadcrumb */}
      <nav
        aria-label="Fil d'ariane"
        className="text-[11px] uppercase tracking-widest text-[#77716A] mb-8 flex items-center space-x-2 font-light"
      >
        <Link href="/" className="hover:text-[#171717] transition-colors">
          Accueil
        </Link>
        <span>/</span>
        <Link href="/collections" className="hover:text-[#171717] transition-colors">
          Collections
        </Link>
        <span>/</span>
        <span className="text-[#171717]">{collection.name}</span>
      </nav>

      {/* Collection Header */}
      <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
        <span className="text-[11px] uppercase tracking-eyebrow text-[#77716A] font-light block">
          Collection
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl text-[#171717] font-normal uppercase tracking-editorial">
          {collection.name}
        </h1>
        {collection.description && (
          <p className="text-xs sm:text-sm text-[#77716A] font-light leading-relaxed max-w-md mx-auto">
            {collection.description}
          </p>
        )}
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-20 bg-[#F6F1EA] border border-[#E7E0D7] p-8 space-y-3">
          <p className="font-editorial text-xl text-[#171717]">
            Pièces en préparation
          </p>
          <p className="text-xs text-[#77716A] font-light max-w-sm mx-auto">
            Les pièces de cette collection sont actuellement en cours d’élaboration.
          </p>
          <div className="pt-2">
            <Link
              href="/bijoux"
              className="inline-block px-6 py-2.5 bg-[#171717] text-[#FCFAF7] text-xs uppercase tracking-wider hover:bg-[#2b2b2b] transition-colors"
            >
              Voir tous les bijoux
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} settings={settings} />
          ))}
        </div>
      )}
    </div>
  );
}
