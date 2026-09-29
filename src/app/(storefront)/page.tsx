import { Metadata } from 'next';
import { getStoreSettings } from '@/features/settings/actions';
import { getHomepageSections, getProducts, getCategories } from '@/features/products/actions';
import { SectionsRenderer } from '@/components/storefront/SectionsRenderer';

export const metadata: Metadata = {
  title: 'Perle Noire | Haute Joaillerie & Perles de Tahiti — Place Vendôme',
  description:
    'Découvrez les créations de la Maison Perle Noire. Des bijoux d’exception façonnés à la main dans notre atelier de la Place Vendôme à Paris.',
};

export default async function HomePage() {
  const [settings, sections, products, categories] = await Promise.all([
    getStoreSettings(),
    getHomepageSections(),
    getProducts({ featuredOnly: true }),
    getCategories(),
  ]);

  return (
    <div className="py-6 sm:py-10">
      <SectionsRenderer
        sections={sections}
        products={products}
        categories={categories}
        settings={settings}
      />
    </div>
  );
}
