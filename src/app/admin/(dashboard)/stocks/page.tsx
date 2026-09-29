import { Metadata } from 'next';
import { getInventoryAdmin } from '@/features/inventory/actions';
import { StocksManagerClient } from './StocksManagerClient';
import { DatabaseNotConfiguredBanner } from '@/components/admin/DatabaseNotConfiguredBanner';

export const metadata: Metadata = {
  title: 'Gestion des Stocks & Inventaire | Perle Noire Admin',
};

export default async function AdminStocksPage() {
  const inventoryData = await getInventoryAdmin();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {!inventoryData.isConfigured && (
        <DatabaseNotConfiguredBanner message="Supabase n’est pas configuré. Les stocks affichés proviennent strictement des quantités réelles enregistrées dans la base de données. Aucun stock fictif n’est simulé." />
      )}

      <div>
        <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-medium block mb-1">
          Inventaire & Disponibilités Réelles
        </span>
        <h1 className="font-editorial text-3xl text-[#FAF8F5]">
          Supervision des Stocks & Mouvements
        </h1>
        <p className="text-xs text-[#9E9589] mt-1">
          Surveillez les pièces disponibles, ajustez manuellement les quantités avec traçabilité et recevez des alertes (seuil d’alerte : {inventoryData.lowStockThreshold} unités).
        </p>
      </div>

      <StocksManagerClient
        initialRows={inventoryData.rows}
        movements={inventoryData.movements}
        lowStockThreshold={inventoryData.lowStockThreshold}
      />
    </div>
  );
}
