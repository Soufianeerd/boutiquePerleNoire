import { Metadata } from 'next';
import { getStoreSettings } from '@/features/settings/actions';
import {
  getHomepageSections,
  getProducts,
  getCategories,
  getCollections,
} from '@/features/products/actions';
import { SectionsRenderer } from '@/components/storefront/SectionsRenderer';

export const metadata: Metadata = {
  title: 'Perle Noire | Joaillerie Précieuse',
  description:
    'Découvrez des créations joaillières contemporaines et intemporelles. Bagues, colliers, bracelets et boucles d’oreilles pensés pour accompagner chaque moment.',
};

export default async function HomePage() {
  const [settings, sections, products, categories, collections] = await Promise.all([
    getStoreSettings(),
    getHomepageSections(),
    getProducts({}),
    getCategories(),
    getCollections(),
  ]);

  return (
    <div className="pb-24">
      <SectionsRenderer
        sections={sections}
        products={products}
        categories={categories}
        collections={collections}
        settings={settings}
      />
    </div>
  );
}

