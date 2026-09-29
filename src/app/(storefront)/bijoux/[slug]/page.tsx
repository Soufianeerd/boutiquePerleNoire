import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug, getProducts } from '@/features/products/actions';
import { getStoreSettings } from '@/features/settings/actions';
import { ProductDetailClient } from '@/components/storefront/ProductDetailClient';
import { ProductCard } from '@/components/storefront/ProductCard';

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Bijou non trouvé' };
  }

  const title = `${product.name} | Perle Noire`;
  const description =
    product.short_description ||
    product.description ||
    'Découvrez cette création joaillière façonnée avec exigence.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: product.images && product.images.length > 0 ? [product.images[0].url] : undefined,
    },
  };
}

export default async function ProductDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const [product, settings, allProducts] = await Promise.all([
    getProductBySlug(slug),
    getStoreSettings(),
    getProducts({}),
  ]);

  if (!product) {
    notFound();
  }

  // Recommended products (excluding current product)
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .filter((p) => !product.category_id || p.category_id === product.category_id || true)
    .slice(0, 4);

  // Structured Data (JSON-LD) for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.short_description || product.description,
    sku: product.sku || undefined,
    offers: {
      '@type': 'Offer',
      price: product.base_price,
      priceCurrency: settings.currency || 'EUR',
      availability:
        product.status === 'out_of_stock'
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-20 sm:space-y-28">
      {/* JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Main Product Component */}
      <ProductDetailClient
        product={product}
        settings={settings}
      />

      {/* "Vous aimerez aussi" Section */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-[#E7E0D7] space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[10px] uppercase tracking-eyebrow text-[#77716A] font-light block">
              Suggestions
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl text-[#171717] font-normal">
              Vous aimerez aussi
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                settings={settings}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
