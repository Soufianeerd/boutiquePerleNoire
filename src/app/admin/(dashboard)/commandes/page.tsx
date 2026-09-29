import { Metadata } from 'next';
import { getOrdersAdmin } from '@/features/orders/actions';
import { getStoreSettings } from '@/features/settings/actions';
import { OrdersManagerClient } from './OrdersManagerClient';
import { DatabaseNotConfiguredBanner } from '@/components/admin/DatabaseNotConfiguredBanner';

export const metadata: Metadata = {
  title: 'Gestion des Commandes | Perle Noire Admin',
};

export default async function AdminCommandesPage() {
  const [orderData, settings] = await Promise.all([
    getOrdersAdmin(),
    getStoreSettings(),
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {!orderData.isConfigured && (
        <DatabaseNotConfiguredBanner message="Supabase n’est pas configuré. Aucune commande fictive n’est injectée. Les commandes affichées proviennent de votre table PostgreSQL réelle." />
      )}

      <div>
        <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-medium block mb-1">
          Ventes & Expéditions
        </span>
        <h1 className="font-editorial text-3xl text-[#FAF8F5]">
          Commandes de la Boutique
        </h1>
        <p className="text-xs text-[#9E9589] mt-1">
          Suivez les commandes passées en mode e-commerce, les statuts de paiement et gérez les étapes d’expédition.
        </p>
      </div>

      <OrdersManagerClient
        orders={orderData.orders}
        currency={settings.currency}
      />
    </div>
  );
}
