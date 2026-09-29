'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product, Category, ProductStatus } from '@/types/database';
import {
  deleteProductAction,
  duplicateProductAction,
  toggleProductStatusAction,
} from '@/features/products/actions';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { EmptyState } from '@/components/admin/EmptyState';
import { formatPrice } from '@/lib/utils';
import {
  Plus,
  Filter,
  Search,
  Gem,
  Edit,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Boxes,
  ExternalLink,
} from 'lucide-react';

interface ProductsManagerClientProps {
  initialProducts: Product[];
  categories: Category[];
  currency: string;
}

export function ProductsManagerClient({
  initialProducts,
  categories,
  currency,
}: ProductsManagerClientProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSellMode, setFilterSellMode] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Deletion state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Duplication & Toggle loading ids
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const filteredProducts = products.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku ? p.sku.toLowerCase().includes(q) : false;
      if (!matchName && !matchSku) return false;
    }
    if (filterCategory !== 'all' && p.category_id !== filterCategory) return false;
    if (filterSellMode !== 'all' && p.sell_mode !== filterSellMode) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    return true;
  });

  const handleDuplicate = async (p: Product) => {
    setActionLoadingId(p.id);
    const res = await duplicateProductAction(p.id);
    setActionLoadingId(null);
    if (res.success && res.product) {
      setProducts([res.product, ...products]);
      router.refresh();
    }
  };

  const handleToggleStatus = async (p: Product) => {
    const nextStatus: ProductStatus = p.status === 'published' ? 'draft' : 'published';
    setActionLoadingId(p.id);
    const res = await toggleProductStatusAction(p.id, nextStatus);
    setActionLoadingId(null);
    if (res.success) {
      setProducts(
        products.map((item) => (item.id === p.id ? { ...item, status: nextStatus } : item))
      );
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    setDeleteLoading(true);
    const res = await deleteProductAction(productToDelete.id);
    setDeleteLoading(false);
    if (res.success) {
      setProducts(products.filter((p) => p.id !== productToDelete.id));
      setProductToDelete(null);
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#181816] border border-[#282725] p-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#736B5E]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou SKU..."
            className="w-full bg-[#121212] border border-[#282725] pl-9 pr-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C5A880]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-[#736B5E]">
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filtres :</span>
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#121212] border border-[#282725] px-2.5 py-1.5 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C5A880]"
          >
            <option value="all">Toutes catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#121212] border border-[#282725] px-2.5 py-1.5 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C5A880]"
          >
            <option value="all">Tous statuts</option>
            <option value="published">Publiés</option>
            <option value="draft">Brouillons</option>
            <option value="out_of_stock">En rupture</option>
            <option value="unique_piece">Pièce unique</option>
            <option value="made_to_order">Sur commande</option>
          </select>

          <select
            value={filterSellMode}
            onChange={(e) => setFilterSellMode(e.target.value)}
            className="bg-[#121212] border border-[#282725] px-2.5 py-1.5 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C5A880]"
          >
            <option value="all">Tous modes</option>
            <option value="inherit">Hérité</option>
            <option value="online">En ligne</option>
            <option value="contact_only">Sur demande</option>
          </select>

          <Link href="/admin/produits/nouveau">
            <Button variant="champagne" size="sm" className="flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau Produit</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={Gem}
          title={products.length === 0 ? 'Aucun produit enregistré' : 'Aucun résultat trouvé'}
          description={
            products.length === 0
              ? 'Votre catalogue est vide. Ajoutez votre premier bijou pour commencer à gérer votre boutique.'
              : 'Aucun produit ne correspond à vos critères de recherche ou de filtre actuels.'
          }
          actionLabel={products.length === 0 ? 'Créer un produit' : undefined}
          actionHref={products.length === 0 ? '/admin/produits/nouveau' : undefined}
        />
      ) : (
        <div className="bg-[#181816] border border-[#282725] overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141414] text-[#8C827A] uppercase text-[10px] tracking-wider border-b border-[#282725]">
              <tr>
                <th className="py-3 px-4">Visuel & Produit</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Prix</th>
                <th className="py-3 px-4">Variantes</th>
                <th className="py-3 px-4">Mode Vente</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242422]">
              {filteredProducts.map((p) => {
                const primaryImage =
                  p.images?.find((img) => img.is_primary)?.url || p.images?.[0]?.url;
                const variantsCount = p.variants?.length || 0;
                const isLoading = actionLoadingId === p.id;

                return (
                  <tr key={p.id} className="hover:bg-[#1C1C1A] transition-colors">
                    {/* Visual & Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 bg-[#121212] border border-[#282725] shrink-0 overflow-hidden flex items-center justify-center">
                          {primaryImage ? (
                            <Image
                              src={primaryImage}
                              alt={p.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <Gem className="w-4 h-4 text-[#736B5E]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/produits/${p.id}`}
                            className="font-medium text-[#FAF8F5] hover:text-[#C5A880] truncate block"
                          >
                            {p.name}
                          </Link>
                          <span className="text-[10px] text-[#736B5E] font-mono block">
                            SKU: {p.sku || '—'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-[#A89E90]">
                      {p.category?.name || '—'}
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-mono font-medium text-[#FAF8F5]">
                      {formatPrice(p.base_price, currency)}
                    </td>

                    {/* Variants */}
                    <td className="py-3.5 px-4">
                      {variantsCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#C5A880]">
                          <Boxes className="w-3.5 h-3.5" />
                          <span>{variantsCount} taille{variantsCount > 1 ? 's' : ''}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#736B5E]">Stock: {p.stock_quantity ?? 0}</span>
                      )}
                    </td>

                    {/* Sell Mode */}
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#222220] text-[#9E9589] border border-[#2D2D2A]">
                        {p.sell_mode}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] uppercase tracking-wider px-2 py-0.5 border ${
                          p.status === 'published'
                            ? 'text-[#6FCF97] border-[#22442C] bg-[#16271C]'
                            : p.status === 'draft'
                            ? 'text-[#8C827A] border-[#3E3D3A] bg-[#222220]'
                            : p.status === 'out_of_stock'
                            ? 'text-red-400 border-red-900 bg-red-950/40'
                            : 'text-[#C5A880] border-[#443E33] bg-[#22201C]'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Storefront view link */}
                        <Link
                          href={`/bijoux/${p.slug}`}
                          target="_blank"
                          className="p-1.5 text-[#736B5E] hover:text-[#FAF8F5] transition-colors"
                          title="Voir sur le site"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        {/* Quick Toggle Status */}
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleToggleStatus(p)}
                          className="p-1.5 text-[#8C827A] hover:text-[#C5A880] transition-colors"
                          title={p.status === 'published' ? 'Passer en brouillon' : 'Publier'}
                        >
                          {p.status === 'published' ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Duplicate */}
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleDuplicate(p)}
                          className="p-1.5 text-[#8C827A] hover:text-[#FAF8F5] transition-colors"
                          title="Dupliquer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        <Link
                          href={`/admin/produits/${p.id}`}
                          className="p-1.5 text-[#C5A880] hover:text-[#FAF8F5] transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>

                        {/* Delete */}
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => setProductToDelete(p)}
                          className="p-1.5 text-red-400 hover:text-red-300 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm Deletion Modal */}
      <ConfirmDialog
        isOpen={Boolean(productToDelete)}
        title="Supprimer définitivement ce produit ?"
        message={`Êtes-vous sûr de vouloir supprimer « ${productToDelete?.name} » ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
}
