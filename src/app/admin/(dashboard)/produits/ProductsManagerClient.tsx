'use client';

import React, { useState } from 'react';
import { Product, Category, ProductStatus, ProductSellMode } from '@/types/database';
import { createProductAction } from '@/features/products/actions';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatPrice } from '@/lib/utils';
import { Plus, Filter, Gem, ShoppingBag, MessageSquare } from 'lucide-react';

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
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [filterSellMode, setFilterSellMode] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New product form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [basePrice, setBasePrice] = useState('3500');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [sellMode, setSellMode] = useState<ProductSellMode>('inherit');
  const [status, setStatus] = useState<ProductStatus>('published');
  const [materialDetails, setMaterialDetails] = useState('Or blanc 750/1000 (18K)');
  const [gemstoneDetails, setGemstoneDetails] = useState('Pierre précieuse & Finition artisanale');
  const [description, setDescription] = useState('Création d’exception façonnée manuellement au sein de notre atelier parisien.');
  const [sku, setSku] = useState('PN-NOUV-01');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const filteredProducts = products.filter((p) => {
    if (filterSellMode !== 'all' && p.sell_mode !== filterSellMode) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    return true;
  });

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    );
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    const res = await createProductAction({
      name,
      slug,
      base_price: parseFloat(basePrice),
      category_id: categoryId || undefined,
      sell_mode: sellMode,
      status,
      material_details: materialDetails,
      gemstone_details: gemstoneDetails,
      description,
      sku,
      featured: false,
    });

    setFormLoading(false);
    if (res.success && res.product) {
      setProducts([res.product, ...products]);
      setIsModalOpen(false);
      setName('');
      setSlug('');
    } else {
      setFormError(res.error || 'Erreur lors de la création');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#181816] border border-[#282725] p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-[#8C827A]">
            <Filter className="w-3.5 h-3.5" />
            <span>Mode Produit :</span>
          </div>
          <select
            value={filterSellMode}
            onChange={(e) => setFilterSellMode(e.target.value)}
            className="bg-[#121212] border border-[#3E3D3A] px-2.5 py-1.5 text-xs text-[#FAF8F5] focus:outline-none"
          >
            <option value="all">Tous les modes</option>
            <option value="inherit">Hérité du mode global</option>
            <option value="online">En ligne uniquement</option>
            <option value="contact_only">Sur demande uniquement</option>
          </select>

          <div className="flex items-center gap-2 text-xs text-[#8C827A] ml-2">
            <span>Statut :</span>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#121212] border border-[#3E3D3A] px-2.5 py-1.5 text-xs text-[#FAF8F5] focus:outline-none"
          >
            <option value="all">Tous les statuts</option>
            <option value="published">Publié</option>
            <option value="unique_piece">Pièce Unique</option>
            <option value="made_to_order">Sur Commande</option>
            <option value="coming_soon">Bientôt Disponible</option>
            <option value="out_of_stock">Épuisé</option>
            <option value="draft">Brouillon</option>
          </select>
        </div>

        <Button
          type="button"
          variant="champagne"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Créer une Pièce</span>
        </Button>
      </div>

      {/* Products Table */}
      <div className="bg-[#181816] border border-[#282725] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#141414] text-[#8C827A] uppercase tracking-wider text-[10px] border-b border-[#282725]">
            <tr>
              <th className="py-3 px-4">Création Joaillière</th>
              <th className="py-3 px-4">Réf. SKU</th>
              <th className="py-3 px-4">Catégorie</th>
              <th className="py-3 px-4">Prix de base</th>
              <th className="py-3 px-4">Mode Produit</th>
              <th className="py-3 px-4">Statut</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#242422]">
            {filteredProducts.map((p) => (
              <tr key={p.id} className="hover:bg-[#1E1E1C] transition-colors">
                <td className="py-3.5 px-4 font-medium text-[#FAF8F5]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#262624] border border-[#3E3D3A] flex items-center justify-center text-[#C5A880] shrink-0">
                      <Gem className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="block">{p.name}</span>
                      <span className="text-[10px] text-[#736B5E]">{p.material_details || 'Atelier'}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono text-[#8C827A]">
                  {p.sku || '—'}
                </td>
                <td className="py-3.5 px-4 text-[#A89E90]">
                  {p.category?.name || 'Joaillerie'}
                </td>
                <td className="py-3.5 px-4 font-editorial text-sm text-[#FAF8F5]">
                  {formatPrice(p.base_price, currency)}
                </td>
                <td className="py-3.5 px-4">
                  {p.sell_mode === 'contact_only' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#2B2215] text-[#C5A880] border border-[#443520]">
                      <MessageSquare className="w-3 h-3" /> Sur Demande
                    </span>
                  ) : p.sell_mode === 'online' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#18261C] text-[#6FCF97] border border-[#27442E]">
                      <ShoppingBag className="w-3 h-3" /> En ligne
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#222220] text-[#9E9589] border border-[#333330]">
                      Hérité (Global)
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <Badge status={p.status} />
                </td>
                <td className="py-3.5 px-4 text-right">
                  <a
                    href={`/bijoux/${p.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#C5A880] hover:underline"
                  >
                    Voir fiche
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Creation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ajouter une Pièce Joaillière"
        subtitle="Catalogue de l’Atelier"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nom de la création *"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ex: Solitaire Nuit Éternelle"
            />
            <Input
              label="Slug URL *"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="solitaire-nuit-eternelle"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Prix de base (€) *"
              type="number"
              required
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
            />
            <Input
              label="Référence SKU"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />
            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-wider text-[#554E45] font-medium">
                Catégorie
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#DDD5C7] px-3 py-2.5 text-xs text-[#141414] focus:border-[#C5A880] focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-wider text-[#554E45] font-medium">
                Mode de Vente du Produit (sell_mode)
              </label>
              <select
                value={sellMode}
                onChange={(e) => setSellMode(e.target.value as ProductSellMode)}
                className="w-full bg-[#FAF8F5] border border-[#DDD5C7] px-3 py-2.5 text-xs text-[#141414] focus:border-[#C5A880] focus:outline-none"
              >
                <option value="inherit">Hériter du mode global boutique</option>
                <option value="contact_only">Toujours sur demande (Contact Only)</option>
                <option value="online">En ligne si e-commerce actif</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-wider text-[#554E45] font-medium">
                Statut
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                className="w-full bg-[#FAF8F5] border border-[#DDD5C7] px-3 py-2.5 text-xs text-[#141414] focus:border-[#C5A880] focus:outline-none"
              >
                <option value="published">Publié (Disponible)</option>
                <option value="unique_piece">Pièce Unique de Haute Joaillerie</option>
                <option value="made_to_order">Sur Commande</option>
                <option value="coming_soon">Bientôt Disponible</option>
                <option value="out_of_stock">Épuisé</option>
                <option value="draft">Brouillon</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Détails du métal précieux"
              value={materialDetails}
              onChange={(e) => setMaterialDetails(e.target.value)}
              placeholder="Ex: Or blanc 750/1000 (18K) - 6.5g"
            />
            <Input
              label="Gemmes & Nacre"
              value={gemstoneDetails}
              onChange={(e) => setGemstoneDetails(e.target.value)}
              placeholder="Ex: Diamants taille brillant & Pierres fines"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] uppercase tracking-wider text-[#554E45] font-medium">
              Description éditoriale *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#DDD5C7] p-3 text-xs text-[#141414] focus:border-[#C5A880] focus:outline-none"
            />
          </div>

          {formError && <p className="text-xs text-red-600">{formError}</p>}

          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={formLoading}>
              {formLoading ? 'Création...' : 'Enregistrer la Pièce'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
