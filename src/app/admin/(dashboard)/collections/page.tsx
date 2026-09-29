import { Metadata } from 'next';
import { getCollectionsAdmin } from '@/features/collections/actions';
import { CollectionsManagerClient } from './CollectionsManagerClient';
import { DatabaseNotConfiguredBanner } from '@/components/admin/DatabaseNotConfiguredBanner';

export const metadata: Metadata = {
  title: 'Gestion des Collections | Perle Noire Admin',
};

export default async function AdminCollectionsPage() {
  const colData = await getCollectionsAdmin();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {!colData.isConfigured && (
        <DatabaseNotConfiguredBanner message="Supabase n’est pas configuré. Les collections affichées proviennent directement de votre base de données." />
      )}

      <div>
        <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-medium block mb-1">
          Univers & Séries Thématiques
        </span>
        <h1 className="font-editorial text-3xl text-[#FAF8F5]">
          Collections de Produits
        </h1>
        <p className="text-xs text-[#9E9589] mt-1">
          Regroupez vos pièces par univers créatifs et soignez leur présentation avec des récits et visuels dédiés.
        </p>
      </div>

      <CollectionsManagerClient initialCollections={colData.collections} />
    </div>
  );
}
