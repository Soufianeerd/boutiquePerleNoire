import { Metadata } from 'next';
import { initialOrders } from '@/lib/data/mock-data';
import { formatPrice, formatDate } from '@/lib/utils';
import { ShoppingBag, CheckCircle2, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Gestion des Commandes | Perle Noire Admin',
};

export default function AdminCommandesPage() {
  const orders = initialOrders;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-medium block mb-1">
          Ventes & Expéditions Sécurisées
        </span>
        <h1 className="font-editorial text-3xl text-[#FAF8F5]">
          Commandes de Joaillerie
        </h1>
        <p className="text-xs text-[#9E9589] mt-1">
          Suivez les commandes passées en mode e-commerce, les statuts de paiement Stripe et la livraison confidentielle.
        </p>
      </div>

      <div className="bg-[#181816] border border-[#282725] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#141414] text-[#8C827A] uppercase tracking-wider text-[10px] border-b border-[#282725]">
            <tr>
              <th className="py-3 px-4">N° Commande</th>
              <th className="py-3 px-4">Acquéreur</th>
              <th className="py-3 px-4">Destination</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Paiement</th>
              <th className="py-3 px-4">Statut Commande</th>
              <th className="py-3 px-4 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#242422]">
            {orders.map((ord) => {
              const shipping = ord.shipping_address as { city?: string; country?: string };
              return (
                <tr key={ord.id} className="hover:bg-[#1E1E1C] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-[#FAF8F5]">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>{ord.order_number}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[#FAF8F5] block font-medium">{ord.guest_name}</span>
                    <span className="text-[10px] text-[#736B5E]">{ord.guest_email}</span>
                  </td>
                  <td className="py-3.5 px-4 text-[#A89E90]">
                    {shipping.city || 'Paris'}, {shipping.country || 'France'}
                  </td>
                  <td className="py-3.5 px-4 font-editorial text-sm text-[#FAF8F5]">
                    {formatPrice(ord.total_amount, ord.currency)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#6FCF97]">
                      <CheckCircle2 className="w-3 h-3" /> {ord.payment_status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#222220] text-[#FAF8F5] border border-[#3E3D3A]">
                      <Clock className="w-3 h-3 text-[#C5A880]" /> {ord.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-[11px] text-[#8C827A]">
                    {formatDate(ord.created_at)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
