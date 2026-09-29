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
    return { title: 'Collection Introuvable' };
  }

  return {
    title: `Collection ${collection.name} | Perle Noire Joaillerie`,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <nav className="text-[11px] uppercase tracking-widest text-[#8C827A] mb-8 flex items-center space-x-2">
        <Link href="/" className="hover:text-[#141414] transition-colors">
          Accueil
        </Link>
        <span>/</span>
        <Link href="/collections" className="hover:text-[#141414] transition-colors">
          Collections
        </Link>
        <span>/</span>
        <span className="text-[#141414] font-medium">{collection.name}</span>
      </nav>

      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-[11px] uppercase tracking-widest text-[#A08154] font-medium block mb-2">
          Collection Joaillière
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl text-[#141414] font-normal">
          {collection.name}
        </h1>
        <div className="w-12 h-px bg-[#C5A880] mx-auto mt-4" />
        <p className="text-xs sm:text-sm text-[#736B5E] mt-4 font-light leading-relaxed">
          {collection.description}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 bg-[#F5F1EA] border border-[#E6DFD3] p-8">
          <p className="font-editorial text-xl text-[#141414]">Pièces en cours de sertissage</p>
          <p className="text-xs text-[#736B5E] mt-2">
            Les créations de cette collection sont actuellement en cours d’élaboration dans notre atelier.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} settings={settings} />
          ))}
        </div>
      )}
    </div>
  );
}
