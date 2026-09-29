'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Category,
  Collection,
  Product,
  ProductSellMode,
  ProductStatus,
} from '@/types/database';
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
  duplicateProductAction,
} from '@/features/products/actions';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  Save,
  Trash2,
  Copy,
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface ProductEditorFormProps {
  initialProduct?: Product | null;
  categories: Category[];
  collections: Collection[];
  currency?: string;
}

interface VariantItem {
  id?: string;
  title: string;
  sku: string;
  price: string;
  size: string;
  material: string;
  color: string;
  stock_quantity: string;
  active: boolean;
}

export function ProductEditorForm({
  initialProduct,
  categories,
  collections,
  currency = 'EUR',
}: ProductEditorFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialProduct?.id);

  // 1. INFORMATIONS
  const [name, setName] = useState(initialProduct?.name || '');
  const [slug, setSlug] = useState(initialProduct?.slug || '');
  const [sku, setSku] = useState(initialProduct?.sku || '');
  const [shortDescription, setShortDescription] = useState(initialProduct?.short_description || '');
  const [description, setDescription] = useState(initialProduct?.description || '');

  // 2. PRIX
  const [basePrice, setBasePrice] = useState(initialProduct ? String(initialProduct.base_price) : '0');
  const [compareAtPrice, setCompareAtPrice] = useState(
    initialProduct?.compare_at_price ? String(initialProduct.compare_at_price) : ''
  );

  // 3. ORGANISATION
  const [categoryId, setCategoryId] = useState(initialProduct?.category_id || '');
  const [collectionId, setCollectionId] = useState(initialProduct?.collection_id || '');
  const [status, setStatus] = useState<ProductStatus>(initialProduct?.status || 'draft');
  const [sellMode, setSellMode] = useState<ProductSellMode>(initialProduct?.sell_mode || 'inherit');
  const [featured, setFeatured] = useState<boolean>(initialProduct?.featured || false);

  // 4. CARACTÉRISTIQUES
  const [materialDetails, setMaterialDetails] = useState(initialProduct?.material_details || '');
  const [gemstoneDetails, setGemstoneDetails] = useState(initialProduct?.gemstone_details || '');

  // 5. STOCK DIRECT
  const [stockQuantity, setStockQuantity] = useState(
    initialProduct?.stock_quantity !== undefined ? String(initialProduct.stock_quantity) : '0'
  );

  // 6. MÉDIAS
  const [images, setImages] = useState<
    { url: string; alt: string; position: number; is_primary: boolean }[]
  >(
    initialProduct?.images?.map((img, idx) => ({
      url: img.url,
      alt: img.alt,
      position: img.position ?? idx,
      is_primary: img.is_primary,
    })) || []
  );

  // 7. VARIANTES
  const [variants, setVariants] = useState<VariantItem[]>(
    initialProduct?.variants?.map((v) => ({
      id: v.id,
      title: v.title,
      sku: v.sku || '',
      price: String(v.price),
      size: v.size || '',
      material: v.material || '',
      color: v.color || '',
      stock_quantity: String(v.stock_quantity),
      active: v.active,
    })) || []
  );

  // 8. SEO
  const [metaTitle, setMetaTitle] = useState(initialProduct?.meta_title || '');
  const [metaDescription, setMetaDescription] = useState(initialProduct?.meta_description || '');

  // Form states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Auto slug generator
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing || !slug) {
      setSlug(
        val
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        title: `Taille ${variants.length + 50}`,
        sku: sku ? `${sku}-V${variants.length + 1}` : '',
        price: basePrice,
        size: '',
        material: materialDetails || '',
        color: '',
        stock_quantity: '1',
        active: true,
      },
    ]);
  };

  const updateVariant = (
    index: number,
    field: keyof VariantItem,
    value: string | boolean
  ) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, idx) => idx !== index));
  };

  const handleSave = async (targetStatus?: ProductStatus) => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const chosenStatus = targetStatus || status;

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      sku: sku.trim() || undefined,
      description: description.trim(),
      short_description: shortDescription.trim() || undefined,
      base_price: parseFloat(basePrice) || 0,
      compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
      category_id: categoryId || undefined,
      collection_id: collectionId || undefined,
      status: chosenStatus,
      sell_mode: sellMode,
      featured,
      material_details: materialDetails.trim() || undefined,
      gemstone_details: gemstoneDetails.trim() || undefined,
      stock_quantity: parseInt(stockQuantity, 10) || 0,
      meta_title: metaTitle.trim() || undefined,
      meta_description: metaDescription.trim() || undefined,
      images,
      variants: variants.map((v) => ({
        id: v.id,
        title: v.title,
        sku: v.sku.trim() || undefined,
        price: parseFloat(v.price) || 0,
        size: v.size.trim() || undefined,
        material: v.material.trim() || undefined,
        color: v.color.trim() || undefined,
        stock_quantity: parseInt(v.stock_quantity, 10) || 0,
        active: v.active,
      })),
    };

    try {
      if (isEditing && initialProduct?.id) {
        const res = await updateProductAction(initialProduct.id, payload);
        if (res.success) {
          setSuccessMsg('Produit mis à jour avec succès.');
          router.refresh();
        } else {
          setError(res.error || 'Erreur lors de la mise à jour.');
        }
      } else {
        const res = await createProductAction(payload);
        if (res.success && res.product) {
          router.push(`/admin/produits/${res.product.id}`);
          router.refresh();
        } else {
          setError(res.error || 'Erreur lors de la création du produit.');
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur technique lors de l’enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialProduct?.id) return;
    setDeleteLoading(true);
    const res = await deleteProductAction(initialProduct.id);
    setDeleteLoading(false);
    if (res.success) {
      router.push('/admin/produits');
      router.refresh();
    } else {
      setError(res.error || 'Impossible de supprimer ce produit.');
      setIsDeleteOpen(false);
    }
  };

  const handleDuplicate = async () => {
    if (!initialProduct?.id) return;
    setLoading(true);
    const res = await duplicateProductAction(initialProduct.id);
    setLoading(false);
    if (res.success && res.product) {
      router.push(`/admin/produits/${res.product.id}`);
      router.refresh();
    } else {
      setError(res.error || 'Erreur lors de la duplication.');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#282725] pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/produits"
            className="w-8 h-8 rounded-full bg-[#1C1C1A] border border-[#2D2D2A] flex items-center justify-center text-[#8C827A] hover:text-[#FAF8F5] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-medium block">
              {isEditing ? 'Édition Produit' : 'Création Produit'}
            </span>
            <h1 className="font-editorial text-2xl sm:text-3xl text-[#FAF8F5]">
              {isEditing ? initialProduct?.name : 'Nouveau Produit'}
            </h1>
          </div>
        </div>

        {/* Global Save Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {isEditing && (
            <>
              <button
                type="button"
                onClick={handleDuplicate}
                disabled={loading}
                className="px-3 py-2 text-xs text-[#8C827A] hover:text-[#FAF8F5] bg-[#181816] border border-[#2D2D2A] flex items-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Dupliquer</span>
              </button>
              <button
                type="button"
                onClick={() => setIsDeleteOpen(true)}
                disabled={loading}
                className="px-3 py-2 text-xs text-red-400 hover:text-red-300 bg-[#241717] border border-[#442323] flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer</span>
              </button>
            </>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => handleSave('draft')}
            className="border-[#3E3D3A] text-[#FAF8F5]"
          >
            Brouillon
          </Button>

          <Button
            type="button"
            variant="champagne"
            size="sm"
            disabled={loading}
            onClick={() => handleSave('published')}
            className="flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{loading ? 'Enregistrement...' : 'Publier'}</span>
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-[#17261B] border border-[#2A4D33] text-[#6FCF97] text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. INFORMATIONS GÉNÉRALES */}
      <div className="bg-[#181816] border border-[#282725] p-6 space-y-6">
        <div className="border-b border-[#242422] pb-3">
          <h2 className="text-xs uppercase tracking-wider text-[#C5A880] font-semibold">
            1. Informations Générales
          </h2>
          <p className="text-xs text-[#736B5E]">Identité, appellation commerciale et descriptifs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] mb-1">
              Nom du Produit *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ex: Bague Solitaire Éclipse Noire"
              className="w-full bg-[#121212] border border-[#282725] px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C5A880]"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] mb-1">
              Identifiant URL (Slug) *
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="bague-solitaire-eclipse-noire"
              className="w-full bg-[#121212] border border-[#282725] px-3 py-2 text-xs text-[#FAF8F5] font-mono focus:outline-none focus:border-[#C5A880]"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] mb-1">
              Référence SKU
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="PN-SOL-01"
              className="w-full bg-[#121212] border border-[#282725] px-3 py-2 text-xs text-[#FAF8F5] font-mono focus:outline-none focus:border-[#C5A880]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] mb-1">
              Description Courte
            </label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Accroche synthétique pour les listes et cartes de présentation (500 car. max)"
              maxLength={500}
              className="w-full bg-[#121212] border border-[#282725] px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C5A880]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] mb-1">
              Description Complète *
            </label>
            <textarea
              rows={5}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détaillez le travail, l'histoire et les caractéristiques de la pièce..."
              className="w-full bg-[#121212] border border-[#282725] p-3 text-xs text-[#FAF8F5] leading-relaxed focus:outline-none focus:border-[#C5A880]"
            />
          </div>
        </div>
      </div>

      {/* 2. PRIX & VALEUR */}
      <div className="bg-[#181816] border border-[#282725] p-6 space-y-6">
        <div className="border-b border-[#242422] pb-3">
          <h2 className="text-xs uppercase tracking-wider text-[#C5A880] font-semibold">
            2. Tarification ({currency})
          </h2>
          <p className="text-xs text-[#736B5E]">Prix de vente et référence barrée</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] mb-1">
              Prix Principal ({currency}) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              className="w-full bg-[#121212] border border-[#282725] px-3 py-2 text-xs text-[#FAF8F5] font-mono focus:outline-none focus:border-[#C5A880]"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] mb-1">
              Ancien Prix Barré (Optionnel)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
              placeholder="Ex: 4200"
              className="w-full bg-[#121212] border border-[#282725] px-3 py-2 text-xs text-[#FAF8F5] font-mono focus:outline-none focus:border-[#C5A880]"
            />
          </div>
        </div>
      </div>

      {/* 3. ORGANISATION & COMMERCIALISATION */}
      <div className="bg-[#181816] border border-[#282725] p-6 space-y-6">
        <div className="border-b border-[#242422] pb-3">
          <h2 className="text-xs uppercase tracking-wider text-[#C5A880] font-semibold">
            3. Organisation & Statut
          </h2>
          <p className="text-xs text-[#736B5E]">Affectation au catalogue et règles de vente</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] mb-1">
              Catégorie
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-[#121212] border border-[#282725] px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C5A880]"
            >
              <option value="">Aucune catégorie</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] mb-1">
              Collection
            </label>
            <select
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              className="w-full bg-[#121212] border border-[#282725] px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C5A880]"
            >
              <option value="">Aucune collection</option>
              {collections.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] mb-1">
              Statut
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProductStatus)}
              className="w-full bg-[#121212] border border-[#282725] px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C5A880]"
            >
              <option value="draft">Brouillon (Non visible)</option>
              <option value="published">Publié (En ligne)</option>
              <option value="unique_piece">Pièce Unique</option>
              <option value="made_to_order">Sur Commande</option>
              <option value="coming_soon">Bientôt Disponible</option>
              <option value="out_of_stock">Rupture de Stock</option>
              <option value="hidden">Masqué</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] mb-1">
              Mode de Vente
            </label>
            <select
              value={sellMode}
              onChange={(e) => setSellMode(e.target.value as ProductSellMode)}
              className="w-full bg-[#121212] border border-[#282725] px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C5A880]"
            >
              <option value="inherit">Hérité (Selon mode général boutique)</option>
              <option value="online">Achat en ligne autorisé</option>
              <option value="contact_only">Sur demande uniquement (Conciergerie)</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-5">
            <input
              type="checkbox"
              id="featured-check"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 rounded bg-[#121212] border-[#2D2D2A] text-[#C5A880] focus:ring-0"
            />
            <label htmlFor="featured-check" className="text-xs text-[#FAF8F5] cursor-pointer">
              Mettre en avant sur la page d’accueil
            </label>
          </div>
        </div>
      </div>

      {/* 4. CARACTÉRISTIQUES */}
      <div className="bg-[#181816] border border-[#282725] p-6 space-y-6">
        <div className="border-b border-[#242422] pb-3">
          <h2 className="text-xs uppercase tracking-wider text-[#C5A880] font-semibold">
            4. Matières & Gemmes
          </h2>
          <p className="text-xs text-[#736B5E]">Composition technique de la création</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] mb-1">
              Métal / Matière Principale
            </label>
            <input
              type="text"
              value={materialDetails}
              onChange={(e) => setMaterialDetails(e.target.value)}
              placeholder="Ex: Or Blanc 18K (750/1000)"
              className="w-full bg-[#121212] border border-[#282725] px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C5A880]"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] mb-1">
              Pierres & Détails des Gemmes
            </label>
            <input
              type="text"
              value={gemstoneDetails}
              onChange={(e) => setGemstoneDetails(e.target.value)}
              placeholder="Ex: Perle de culture 10mm & Pavage Diamants"
              className="w-full bg-[#121212] border border-[#282725] px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C5A880]"
            />
          </div>
        </div>
      </div>

      {/* 5. GESTION DES PHOTOS & SUPABASE STORAGE */}
      <div className="bg-[#181816] border border-[#282725] p-6 space-y-6">
        <div className="border-b border-[#242422] pb-3">
          <h2 className="text-xs uppercase tracking-wider text-[#C5A880] font-semibold">
            5. Galerie d’Images & Visuels
          </h2>
          <p className="text-xs text-[#736B5E]">
            Glissez-déposez vos photos. Bucket Supabase Storage : jewelry-media
          </p>
        </div>

        <ImageUploader
          productId={initialProduct?.id}
          images={images}
          onChange={setImages}
        />
      </div>

      {/* 6. VARIANTES DE PRODUIT */}
      <div className="bg-[#181816] border border-[#282725] p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#242422] pb-3">
          <div>
            <h2 className="text-xs uppercase tracking-wider text-[#C5A880] font-semibold">
              6. Déclinaisons & Variantes
            </h2>
            <p className="text-xs text-[#736B5E]">
              Tailles de bague, longueurs de chaîne ou variations de matière avec stocks individuels
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addVariant}
            className="flex items-center gap-1.5 border-[#3E3D3A] text-xs text-[#FAF8F5]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter une variante</span>
          </Button>
        </div>

        {variants.length === 0 ? (
          <div className="p-4 bg-[#141414] border border-[#242422] text-xs text-[#736B5E] text-center">
            Aucune variante configurée. Le produit est géré comme une pièce unique ou unitaire avec le stock direct ci-dessous.
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#282725]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141414] text-[#8C827A] uppercase text-[10px] border-b border-[#282725]">
                <tr>
                  <th className="py-2.5 px-3">Titre</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Prix ({currency})</th>
                  <th className="py-2.5 px-3">Taille</th>
                  <th className="py-2.5 px-3">Matière</th>
                  <th className="py-2.5 px-3">Stock</th>
                  <th className="py-2.5 px-3">Actif</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222220]">
                {variants.map((v, idx) => (
                  <tr key={idx} className="hover:bg-[#1C1C1A]">
                    <td className="p-2">
                      <input
                        type="text"
                        value={v.title}
                        onChange={(e) => updateVariant(idx, 'title', e.target.value)}
                        className="w-28 bg-[#121212] border border-[#282725] px-2 py-1 text-xs text-[#FAF8F5]"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                        placeholder="SKU"
                        className="w-24 bg-[#121212] border border-[#282725] px-2 py-1 text-xs font-mono text-[#FAF8F5]"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        step="0.01"
                        value={v.price}
                        onChange={(e) => updateVariant(idx, 'price', e.target.value)}
                        className="w-20 bg-[#121212] border border-[#282725] px-2 py-1 text-xs font-mono text-[#FAF8F5]"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={v.size}
                        onChange={(e) => updateVariant(idx, 'size', e.target.value)}
                        placeholder="52"
                        className="w-16 bg-[#121212] border border-[#282725] px-2 py-1 text-xs text-[#FAF8F5]"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={v.material}
                        onChange={(e) => updateVariant(idx, 'material', e.target.value)}
                        placeholder="Or blanc"
                        className="w-24 bg-[#121212] border border-[#282725] px-2 py-1 text-xs text-[#FAF8F5]"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="0"
                        value={v.stock_quantity}
                        onChange={(e) => updateVariant(idx, 'stock_quantity', e.target.value)}
                        className="w-16 bg-[#121212] border border-[#282725] px-2 py-1 text-xs font-mono text-[#FAF8F5]"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="checkbox"
                        checked={v.active}
                        onChange={(e) => updateVariant(idx, 'active', e.target.checked)}
                        className="w-3.5 h-3.5 rounded bg-[#121212] border-[#2D2D2A] text-[#C5A880]"
                      />
                    </td>
                    <td className="p-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeVariant(idx)}
                        className="p-1 text-red-400 hover:text-red-300"
                        title="Supprimer la variante"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Stock direct pour produit sans variantes */}
        {variants.length === 0 && (
          <div className="pt-2">
            <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] mb-1">
              Quantité en Stock Direct (Pièce sans déclinaisons)
            </label>
            <input
              type="number"
              min="0"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              className="w-36 bg-[#121212] border border-[#282725] px-3 py-2 text-xs text-[#FAF8F5] font-mono focus:outline-none focus:border-[#C5A880]"
            />
          </div>
        )}
      </div>

      {/* 7. RÉFÉRENCEMENT (SEO) */}
      <div className="bg-[#181816] border border-[#282725] p-6 space-y-6">
        <div className="border-b border-[#242422] pb-3">
          <h2 className="text-xs uppercase tracking-wider text-[#C5A880] font-semibold">
            7. Métadonnées SEO
          </h2>
          <p className="text-xs text-[#736B5E]">Optimisation des moteurs de recherche</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] mb-1">
              Balise Titre (Meta Title)
            </label>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Ex: Solitaire Éclipse Noire | Maison Perle Noire"
              className="w-full bg-[#121212] border border-[#282725] px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C5A880]"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] mb-1">
              Meta Description
            </label>
            <textarea
              rows={2}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Description visible dans les résultats Google..."
              className="w-full bg-[#121212] border border-[#282725] p-3 text-xs text-[#FAF8F5] leading-relaxed focus:outline-none focus:border-[#C5A880]"
            />
          </div>
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-[#262624]">
        <Link
          href="/admin/produits"
          className="text-xs text-[#8C827A] hover:text-[#FAF8F5] uppercase tracking-wider"
        >
          ← Retour aux produits
        </Link>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => handleSave('draft')}
            className="border-[#3E3D3A] text-[#FAF8F5]"
          >
            Enregistrer en Brouillon
          </Button>
          <Button
            type="button"
            variant="champagne"
            size="sm"
            disabled={loading}
            onClick={() => handleSave('published')}
            className="flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{loading ? 'Enregistrement...' : 'Enregistrer et Publier'}</span>
          </Button>
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Supprimer ce produit définitivement ?"
        message={`Êtes-vous certain de vouloir supprimer « ${name} » ? Cette action est irréversible et supprimera également les variantes et références d’images.`}
        confirmLabel="Supprimer le produit"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}
