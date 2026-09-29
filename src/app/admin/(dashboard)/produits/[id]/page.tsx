import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getProductByIdAdmin,
  getCategories,
  getCollections,
} from '@/features/products/actions';
import { getStoreSettings } from '@/features/settings/actions';
import { ProductEditorForm } from '@/components/admin/ProductEditorForm';

export const metadata: Metadata = {
  title: 'Modifier le Produit | Perle Noire Admin',
};

export default async function EditProductPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const [productRes, categories, collections, settings] = await Promise.all([
    getProductByIdAdmin(id),
    getCategories(),
    getCollections(),
    getStoreSettings(),
  ]);

  if (!productRes.product) {
    notFound();
  }

  return (
    <ProductEditorForm
      initialProduct={productRes.product}
      categories={categories}
      collections={collections}
      currency={settings.currency}
    />
  );
}
