import { Metadata } from 'next';
import { getCategories, getCollections } from '@/features/products/actions';
import { getStoreSettings } from '@/features/settings/actions';
import { ProductEditorForm } from '@/components/admin/ProductEditorForm';

export const metadata: Metadata = {
  title: 'Nouveau Produit | Perle Noire Admin',
};

export default async function NewProductPage() {
  const [categories, collections, settings] = await Promise.all([
    getCategories(),
    getCollections(),
    getStoreSettings(),
  ]);

  return (
    <ProductEditorForm
      categories={categories}
      collections={collections}
      currency={settings.currency}
    />
  );
}
