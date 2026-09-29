import { Metadata } from 'next';
import { getProducts, getCategories } from '@/features/products/actions';
import { getStoreSettings } from '@/features/settings/actions';
import { ProductsManagerClient } from './ProductsManagerClient';

export const metadata: Metadata = {
  title: 'Gestion des Bijoux & Créations | Perle Noire Admin',
};

export default async function AdminProduitsPage() {
  const [products, categories, settings] = await Promise.all([
    getProducts({ includeAllStatuses: true }),
    getCategories(),
    getStoreSettings(),
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-medium block mb-1">
          Catalogue & Inventaire Prêt-à-Porter
        </span>
        <h1 className="font-editorial text-3xl text-[#FAF8F5]">
          Bijoux & Créations Joaillières
        </h1>
        <p className="text-xs text-[#9E9589] mt-1">
          Gérez vos pièces, déclinaisons, statuts et modes de commercialisation (En ligne, Sur demande ou Hérité).
        </p>
      </div>

      <ProductsManagerClient
        initialProducts={products}
        categories={categories}
        currency={settings.currency}
      />
    </div>
  );
}
