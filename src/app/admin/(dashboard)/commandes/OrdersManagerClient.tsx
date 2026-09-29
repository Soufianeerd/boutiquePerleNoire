'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Order, OrderStatus } from '@/types/database';
import { updateOrderStatusAction } from '@/features/orders/actions';
import { formatPrice, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/admin/EmptyState';
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  Search,
  Filter,
} from 'lucide-react';

interface OrdersManagerClientProps {
  orders: Order[];
  currency: string;
}

export function OrdersManagerClient({
  orders: initialOrdersInput,
  currency,
}: OrdersManagerClientProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(initialOrdersInput);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Order Detail Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const filteredOrders = orders.filter((ord) => {
    if (filterStatus !== 'all' && ord.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNumber = ord.order_number.toLowerCase().includes(q);
      const matchName = ord.guest_name ? ord.guest_name.toLowerCase().includes(q) : false;
      const matchEmail = ord.guest_email ? ord.guest_email.toLowerCase().includes(q) : false;
      if (!matchNumber && !matchName && !matchEmail) return false;
    }
    return true;
  });

  const openDetail = (ord: Order) => {
    setSelectedOrder(ord);
    setNewStatus(ord.status);
    setSuccess(false);
  };

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setLoading(true);
    setSuccess(false);

    const res = await updateOrderStatusAction(selectedOrder.id, newStatus);
    setLoading(false);

    if (res.success) {
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: newStatus } : o))
      );
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#181816] border border-[#282725] p-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#736B5E]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par N° de commande, nom, email..."
            className="w-full bg-[#121212] border border-[#282725] pl-9 pr-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C5A880]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#736B5E]" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#121212] border border-[#282725] px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C5A880]"
          >
            <option value="all">Tous statuts ({orders.length})</option>
            <option value="pending">En attente (pending)</option>
            <option value="paid">Payée (paid)</option>
            <option value="processing">En préparation (processing)</option>
            <option value="shipped">Expédiée (shipped)</option>
            <option value="delivered">Livrée (delivered)</option>
            <option value="cancelled">Annulée (cancelled)</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title={orders.length === 0 ? 'Aucune commande enregistrée' : 'Aucune commande trouvée'}
          description={
            orders.length === 0
              ? 'Lorsque vos clients effectuent des commandes en ligne via le panier et le paiement Stripe, elles apparaîtront automatiquement ici.'
              : 'Aucune commande ne correspond à vos critères de recherche.'
          }
        />
      ) : (
        <div className="bg-[#181816] border border-[#282725] overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141414] text-[#8C827A] uppercase tracking-wider text-[10px] border-b border-[#282725]">
              <tr>
                <th className="py-3 px-4">N° Commande</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Montant Total</th>
                <th className="py-3 px-4">Paiement</th>
                <th className="py-3 px-4">Statut Commande</th>
                <th className="py-3 px-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242422]">
              {filteredOrders.map((ord) => (
                <tr
                  key={ord.id}
                  onClick={() => openDetail(ord)}
                  className="hover:bg-[#1E1E1C] cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono font-medium text-[#FAF8F5]">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>{ord.order_number}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="text-[#FAF8F5] block font-medium">
                      {ord.guest_name || 'Client Invité'}
                    </span>
                    <span className="text-[10px] text-[#736B5E]">{ord.guest_email}</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-medium text-[#FAF8F5]">
                    {formatPrice(ord.total_amount, ord.currency || currency)}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 border ${
                        ord.payment_status === 'succeeded'
                          ? 'text-[#6FCF97] border-[#22442C] bg-[#16271C]'
                          : ord.payment_status === 'failed'
                          ? 'text-red-400 border-red-900 bg-red-950/40'
                          : 'text-[#C5A880] border-[#3E3D3A] bg-[#222220]'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{ord.payment_status}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 border ${
                        ord.status === 'delivered'
                          ? 'text-[#6FCF97] border-[#22442C] bg-[#16271C]'
                          : ord.status === 'shipped'
                          ? 'text-blue-300 border-blue-900 bg-blue-950/40'
                          : 'text-[#C5A880] border-[#3E3D3A] bg-[#222220]'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>{ord.status}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right text-[11px] font-mono text-[#736B5E]">
                    {formatDate(ord.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title={`Commande ${selectedOrder.order_number}`}
        >
          <div className="space-y-5 text-xs">
            {/* Summary Grid */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-[#121212] border border-[#282725]">
              <div>
                <span className="text-[10px] uppercase text-[#736B5E] block">Client</span>
                <span className="text-[#FAF8F5] font-medium block">
                  {selectedOrder.guest_name || 'Invité'}
                </span>
                <span className="text-[#9E9589] block">{selectedOrder.guest_email}</span>
                {selectedOrder.guest_phone && (
                  <span className="text-[#C5A880] font-mono block">
                    {selectedOrder.guest_phone}
                  </span>
                )}
              </div>
              <div>
                <span className="text-[10px] uppercase text-[#736B5E] block">Montant Total</span>
                <span className="font-mono text-base font-semibold text-[#FAF8F5] block">
                  {formatPrice(selectedOrder.total_amount, selectedOrder.currency)}
                </span>
                <span className="text-[10px] text-[#736B5E] block mt-0.5">
                  Paiement : {selectedOrder.payment_status}
                </span>
              </div>
            </div>

            {/* Items */}
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#9E9589] font-medium block mb-2">
                Articles Commandés
              </span>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <div className="divide-y divide-[#242422] border border-[#282725]">
                  {selectedOrder.items.map((it) => (
                    <div key={it.id} className="p-3 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-medium text-[#FAF8F5] block">
                          {it.product_name}
                        </span>
                        {it.variant_title && (
                          <span className="text-[10px] text-[#A89E90] block">
                            Déclinaison : {it.variant_title}
                          </span>
                        )}
                        <span className="text-[10px] text-[#736B5E] font-mono">
                          Quantité : {it.quantity}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-[#C5A880]">
                        {formatPrice(it.price * it.quantity, selectedOrder.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-[#121212] border border-[#282725] text-[#736B5E]">
                  Aucun détail d’article renseigné pour cette commande.
                </div>
              )}
            </div>

            {/* Update Status Form */}
            <form onSubmit={handleStatusChange} className="space-y-3 pt-3 border-t border-[#262624]">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] mb-1">
                  Mettre à jour le statut de la commande
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full bg-[#121212] border border-[#282725] px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C5A880]"
                >
                  <option value="pending">En attente (pending)</option>
                  <option value="paid">Payée (paid)</option>
                  <option value="processing">En cours de préparation (processing)</option>
                  <option value="shipped">Expédiée (shipped)</option>
                  <option value="delivered">Livrée (delivered)</option>
                  <option value="cancelled">Annulée (cancelled)</option>
                  <option value="refunded">Remboursée (refunded)</option>
                </select>
              </div>

              {success && (
                <div className="p-2 bg-[#17261B] border border-[#2A4D33] text-[#6FCF97] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Statut de la commande mis à jour.</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                  className="border-[#3E3D3A] text-[#FAF8F5]"
                >
                  Fermer
                </Button>
                <Button type="submit" variant="champagne" size="sm" disabled={loading}>
                  {loading ? 'Mise à jour...' : 'Enregistrer le statut'}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}
