import { Metadata } from 'next';
import { getProductsAdmin, getCategories } from '@/features/products/actions';
import { getStoreSettings } from '@/features/settings/actions';
import { ProductsManagerClient } from './ProductsManagerClient';
import { DatabaseNotConfiguredBanner } from '@/components/admin/DatabaseNotConfiguredBanner';

export const metadata: Metadata = {
  title: 'Gestion des Produits | Perle Noire Admin',
};

export default async function AdminProduitsPage() {
  const [productsRes, categories, settings] = await Promise.all([
    getProductsAdmin(),
    getCategories(),
    getStoreSettings(),
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {!productsRes.isConfigured && (
        <DatabaseNotConfiguredBanner message="Supabase n’est pas configuré. Les produits affichés proviennent strictement de votre base de données réelle. Aucune fausse création n’est simulée." />
      )}

      <div>
        <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-medium block mb-1">
          Catalogue & Pièces
        </span>
        <h1 className="font-editorial text-3xl text-[#FAF8F5]">
          Gestion des Produits
        </h1>
        <p className="text-xs text-[#9E9589] mt-1">
          Créez, modifiez, dupliquez et publiez vos créations. Gérez les galeries d’images et les déclinaisons de tailles.
        </p>
      </div>

      <ProductsManagerClient
        initialProducts={productsRes.products}
        categories={categories}
        currency={settings.currency}
      />
    </div>
  );
}
