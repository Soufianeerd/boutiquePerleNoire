import { Metadata } from 'next';
import { getCategoriesAdmin } from '@/features/categories/actions';
import { CategoriesManagerClient } from './CategoriesManagerClient';
import { DatabaseNotConfiguredBanner } from '@/components/admin/DatabaseNotConfiguredBanner';

export const metadata: Metadata = {
  title: 'Gestion des Catégories | Perle Noire Admin',
};

export default async function AdminCategoriesPage() {
  const catData = await getCategoriesAdmin();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {!catData.isConfigured && (
        <DatabaseNotConfiguredBanner message="Supabase n’est pas configuré. Les catégories affichées proviennent strictement de la base de données réelle." />
      )}

      <div>
        <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-medium block mb-1">
          Arborescence & Familles de Produits
        </span>
        <h1 className="font-editorial text-3xl text-[#FAF8F5]">
          Catégories de Bijoux
        </h1>
        <p className="text-xs text-[#9E9589] mt-1">
          Structurez les grandes familles de pièces (Bagues, Colliers, Boucles, Bracelets) et définissez leur ordre d’apparition dans la navigation.
        </p>
      </div>

      <CategoriesManagerClient initialCategories={catData.categories} />
    </div>
  );
}
