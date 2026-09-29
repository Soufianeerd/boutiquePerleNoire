'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InventoryRow, adjustStockAction } from '@/features/inventory/actions';
import { InventoryMovement } from '@/types/database';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  Boxes,
  AlertTriangle,
  History,
  Search,
  AlertCircle,
  Plus,
  Minus,
} from 'lucide-react';

interface StocksManagerClientProps {
  initialRows: InventoryRow[];
  movements: InventoryMovement[];
  lowStockThreshold: number;
}

export function StocksManagerClient({
  initialRows,
  movements: initialMovements,
  lowStockThreshold,
}: StocksManagerClientProps) {
  const router = useRouter();
  const [rows, setRows] = useState<InventoryRow[]>(initialRows);
  const movements = initialMovements;
  const [search, setSearch] = useState('');
  const [filterLowOnly, setFilterLowOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'history'>('inventory');

  // Adjust stock modal state
  const [selectedRow, setSelectedRow] = useState<InventoryRow | null>(null);
  const [newQuantity, setNewQuantity] = useState<string>('0');
  const [reason, setReason] = useState<
    'restock' | 'sale' | 'adjustment' | 'return' | 'initial' | 'manual_adjustment'
  >('manual_adjustment');
  const [referenceId, setReferenceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredRows = rows.filter((r) => {
    if (filterLowOnly && !r.isLow) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = r.productName.toLowerCase().includes(q);
      const matchVariant = r.variantTitle ? r.variantTitle.toLowerCase().includes(q) : false;
      const matchSku = r.sku.toLowerCase().includes(q);
      if (!matchName && !matchVariant && !matchSku) return false;
    }
    return true;
  });

  const openAdjustModal = (row: InventoryRow) => {
    setSelectedRow(row);
    setNewQuantity(String(row.stock));
    setReason('manual_adjustment');
    setReferenceId('');
    setError(null);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRow) return;

    setLoading(true);
    setError(null);

    const qty = parseInt(newQuantity, 10);
    if (isNaN(qty) || qty < 0) {
      setError('La quantité doit être un nombre entier positif.');
      setLoading(false);
      return;
    }

    const res = await adjustStockAction({
      product_id: selectedRow.variantId ? undefined : selectedRow.productId,
      variant_id: selectedRow.variantId || undefined,
      new_quantity: qty,
      reason,
      reference_id: referenceId.trim() || undefined,
    });

    setLoading(false);

    if (res.success && res.newStock !== undefined) {
      // Update local row
      const updatedRows = rows.map((r) => {
        if (r.id === selectedRow.id) {
          return {
            ...r,
            stock: res.newStock!,
            isLow: res.newStock! <= lowStockThreshold,
          };
        }
        return r;
      });
      setRows(updatedRows);
      setSelectedRow(null);
      router.refresh();
    } else {
      setError(res.error || 'Erreur lors de la mise à jour du stock.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Tabs: Inventory & Audit Movements */}
      <div className="flex items-center gap-2 border-b border-[#282725] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${
            activeTab === 'inventory'
              ? 'bg-[#222220] text-[#C5A880] border-b-2 border-[#C5A880]'
              : 'text-[#8C827A] hover:text-[#FAF8F5]'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Inventaire en temps réel ({rows.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${
            activeTab === 'history'
              ? 'bg-[#222220] text-[#C5A880] border-b-2 border-[#C5A880]'
              : 'text-[#8C827A] hover:text-[#FAF8F5]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Historique des mouvements ({movements.length})</span>
        </button>
      </div>

      {activeTab === 'inventory' ? (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#181816] border border-[#282725] p-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#736B5E]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par nom, variante ou SKU..."
                className="w-full bg-[#121212] border border-[#282725] pl-9 pr-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-[#9E9589] cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterLowOnly}
                  onChange={(e) => setFilterLowOnly(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#121212] border-[#2D2D2A] text-[#C5A880] focus:ring-0"
                />
                <span>Afficher uniquement les alertes stock</span>
              </label>
            </div>
          </div>

          {/* Table */}
          {filteredRows.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#736B5E] bg-[#181816] border border-[#282725]">
              Aucun article ne correspond à votre recherche.
            </div>
          ) : (
            <div className="bg-[#181816] border border-[#282725] overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141414] text-[#8C827A] uppercase text-[10px] tracking-wider border-b border-[#282725]">
                  <tr>
                    <th className="py-3 px-4">Produit</th>
                    <th className="py-3 px-4">Variante / Taille</th>
                    <th className="py-3 px-4">Référence SKU</th>
                    <th className="py-3 px-4">Quantité en Stock</th>
                    <th className="py-3 px-4">Alerte Seuil</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#242422]">
                  {filteredRows.map((row) => (
                    <tr key={row.id} className="hover:bg-[#1E1E1C] transition-colors">
                      <td className="py-3.5 px-4 font-medium text-[#FAF8F5]">
                        <div className="flex items-center gap-2">
                          <Boxes className="w-3.5 h-3.5 text-[#C5A880]" />
                          <span>{row.productName}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#A89E90]">
                        {row.variantTitle || 'Pièce Unitaire'}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[#8C827A]">
                        {row.sku}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-sm text-[#FAF8F5]">
                        {row.stock} {row.stock > 1 ? 'unités' : 'unité'}
                      </td>

                      <td className="py-3.5 px-4">
                        {row.isLow ? (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#2B1F17] text-amber-400 border border-[#523A1E]">
                            <AlertTriangle className="w-3 h-3" /> Stock Faible
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase tracking-wider text-[#6FCF97]">
                            Optimal
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openAdjustModal(row)}
                          className="border-[#3E3D3A] text-xs text-[#FAF8F5] hover:text-[#C5A880]"
                        >
                          Ajuster le stock
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* History Tab */
        <div className="bg-[#181816] border border-[#282725] overflow-x-auto">
          {movements.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#736B5E]">
              Aucun mouvement d’inventaire enregistré. Les ajustements manuels et ventes créeront un historique ici.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141414] text-[#8C827A] uppercase text-[10px] tracking-wider border-b border-[#282725]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Article</th>
                  <th className="py-3 px-4">Variation</th>
                  <th className="py-3 px-4">Nouveau Stock</th>
                  <th className="py-3 px-4">Raison</th>
                  <th className="py-3 px-4 text-right">Référence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242422]">
                {movements.map((mov) => {
                  const isPositive = mov.change_amount > 0;
                  return (
                    <tr key={mov.id} className="hover:bg-[#1E1E1C]">
                      <td className="py-3 px-4 text-[#8C827A] font-mono text-[11px]">
                        {formatDate(mov.created_at)}
                      </td>
                      <td className="py-3 px-4 text-[#FAF8F5] font-medium">
                        {mov.product?.name || 'Produit'}
                        {mov.variant?.title && (
                          <span className="text-[10px] text-[#736B5E] block">
                            {mov.variant.title}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium">
                        <span
                          className={`inline-flex items-center gap-1 ${
                            isPositive ? 'text-[#6FCF97]' : 'text-red-400'
                          }`}
                        >
                          {isPositive ? <Plus className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                          {Math.abs(mov.change_amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#FAF8F5]">
                        {mov.new_quantity !== undefined && mov.new_quantity !== null
                          ? `${mov.new_quantity} unités`
                          : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#222220] border border-[#2D2D2A] text-[#C5A880]">
                          {mov.reason}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-[#736B5E] font-mono text-[11px]">
                        {mov.reference_id || 'Manuel'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Adjust Stock Modal */}
      {selectedRow && (
        <Modal
          isOpen={Boolean(selectedRow)}
          onClose={() => setSelectedRow(null)}
          title={`Ajustement de stock : ${selectedRow.productName}`}
        >
          <form onSubmit={handleAdjustSubmit} className="space-y-4">
            {selectedRow.variantTitle && (
              <div className="text-xs text-[#C5A880]">
                Variante : {selectedRow.variantTitle} (SKU: {selectedRow.sku})
              </div>
            )}

            <div className="p-3 bg-[#121212] border border-[#282725] flex items-center justify-between text-xs">
              <span className="text-[#8C827A]">Stock actuel enregistré :</span>
              <span className="font-mono font-semibold text-[#FAF8F5]">
                {selectedRow.stock} unité{selectedRow.stock > 1 ? 's' : ''}
              </span>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] mb-1">
                Nouvelle Quantité Réelle en Stock *
              </label>
              <input
                type="number"
                min="0"
                required
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                className="w-full bg-[#121212] border border-[#282725] px-3 py-2 text-sm font-mono text-[#FAF8F5] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] mb-1">
                Motif du Mouvement d’Inventaire *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as 'restock' | 'sale' | 'adjustment' | 'return' | 'initial' | 'manual_adjustment')}
                className="w-full bg-[#121212] border border-[#282725] px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C5A880]"
              >
                <option value="restock">Réapprovisionnement / Fabrication (restock)</option>
                <option value="manual_adjustment">Ajustement d’inventaire manuel (manual_adjustment)</option>
                <option value="sale">Vente comptoir ou directe (sale)</option>
                <option value="return">Retour client / Remise en stock (return)</option>
                <option value="initial">Initialisation de stock (initial)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] mb-1">
                Référence / Note (Optionnel)
              </label>
              <input
                type="text"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                placeholder="Ex: Bon de livraison #1042 ou inventaire annuel"
                className="w-full bg-[#121212] border border-[#282725] px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262624]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedRow(null)}
                className="border-[#3E3D3A] text-[#FAF8F5]"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="champagne"
                size="sm"
                disabled={loading}
              >
                {loading ? 'Enregistrement...' : 'Valider le mouvement'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
