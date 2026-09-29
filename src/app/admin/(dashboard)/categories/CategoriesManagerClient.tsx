'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CategoryWithCount,
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  toggleCategoryActiveAction,
} from '@/features/categories/actions';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/admin/EmptyState';
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  Gem,
} from 'lucide-react';

interface CategoriesManagerClientProps {
  initialCategories: CategoryWithCount[];
}

export function CategoriesManagerClient({
  initialCategories,
}: CategoriesManagerClientProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryWithCount[]>(initialCategories);

  // Modal create/edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [heroUrl, setHeroUrl] = useState('');
  const [position, setPosition] = useState('0');
  const [active, setActive] = useState(true);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete state
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryWithCount | null>(null);
  const [deleteStrategy, setDeleteStrategy] = useState<'prevent' | 'detach'>('prevent');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('');
    setHeroUrl('');
    setPosition(String(categories.length));
    setActive(true);
    setMetaTitle('');
    setMetaDescription('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CategoryWithCount) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImageUrl(cat.image_url || '');
    setHeroUrl(cat.hero_url || '');
    setPosition(String(cat.position));
    setActive(cat.active);
    setMetaTitle(cat.meta_title || '');
    setMetaDescription(cat.meta_description || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
      image_url: imageUrl.trim() || undefined,
      hero_url: heroUrl.trim() || undefined,
      position: parseInt(position, 10) || 0,
      active,
      meta_title: metaTitle.trim() || undefined,
      meta_description: metaDescription.trim() || undefined,
    };

    if (editingCategory) {
      const res = await updateCategoryAction(editingCategory.id, payload);
      setFormLoading(false);
      if (res.success && res.category) {
        setCategories(
          categories.map((c) =>
            c.id === editingCategory.id ? { ...res.category!, products_count: c.products_count } : c
          )
        );
        setIsModalOpen(false);
        router.refresh();
      } else {
        setFormError(res.error || 'Erreur lors de la mise à jour.');
      }
    } else {
      const res = await createCategoryAction(payload);
      setFormLoading(false);
      if (res.success && res.category) {
        setCategories([...categories, { ...res.category, products_count: 0 }]);
        setIsModalOpen(false);
        router.refresh();
      } else {
        setFormError(res.error || 'Erreur lors de la création.');
      }
    }
  };

  const handleToggleActive = async (cat: CategoryWithCount) => {
    const res = await toggleCategoryActiveAction(cat.id, !cat.active);
    if (res.success) {
      setCategories(
        categories.map((c) => (c.id === cat.id ? { ...c, active: !c.active } : c))
      );
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    setDeleteLoading(true);
    setDeleteError(null);

    const res = await deleteCategoryAction(categoryToDelete.id, deleteStrategy);
    setDeleteLoading(false);

    if (res.success) {
      setCategories(categories.filter((c) => c.id !== categoryToDelete.id));
      setCategoryToDelete(null);
      router.refresh();
    } else {
      setDeleteError(res.error || 'Impossible de supprimer.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action */}
      <div className="flex justify-end">
        <Button
          variant="champagne"
          size="sm"
          onClick={openCreateModal}
          className="flex items-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nouvelle Catégorie</span>
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="Aucune catégorie enregistrée"
          description="Créez votre première catégorie pour organiser les familles de produits (Bagues, Colliers, etc.)."
          actionLabel="Créer une catégorie"
          onAction={openCreateModal}
        />
      ) : (
        <div className="bg-[#181816] border border-[#282725] overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141414] text-[#8C827A] uppercase tracking-wider text-[10px] border-b border-[#282725]">
              <tr>
                <th className="py-3 px-4">Ordre</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Slug URL</th>
                <th className="py-3 px-4">Produits associés</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242422]">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[#1E1E1C] transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[#736B5E]">
                    {cat.position}
                  </td>

                  <td className="py-3.5 px-4 font-medium text-[#FAF8F5]">
                    <div className="flex items-center gap-2">
                      <FolderTree className="w-4 h-4 text-[#C5A880]" />
                      <span>{cat.name}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[#8C827A]">
                    /{cat.slug}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-[#FAF8F5]">
                      <Gem className="w-3 h-3 text-[#A08154]" />
                      <span>{cat.products_count} produit{cat.products_count > 1 ? 's' : ''}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(cat)}
                      className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 border ${
                        cat.active
                          ? 'text-[#6FCF97] border-[#22442C] bg-[#16271C]'
                          : 'text-[#8C827A] border-[#3E3D3A] bg-[#222220]'
                      }`}
                    >
                      {cat.active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>{cat.active ? 'Actif' : 'Inactif'}</span>
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(cat)}
                        className="p-1.5 text-[#C5A880] hover:text-[#FAF8F5] transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCategoryToDelete(cat);
                          setDeleteStrategy(cat.products_count > 0 ? 'detach' : 'prevent');
                          setDeleteError(null);
                        }}
                        className="p-1.5 text-red-400 hover:text-red-300 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] mb-1">
                Nom de la catégorie *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex: Bagues"
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
                placeholder="bagues"
                className="w-full bg-[#121212] border border-[#282725] px-3 py-2 text-xs font-mono text-[#FAF8F5] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description courte de la catégorie..."
                className="w-full bg-[#121212] border border-[#282725] p-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] mb-1">
                  Ordre d’affichage
                </label>
                <input
                  type="number"
                  min="0"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full bg-[#121212] border border-[#282725] px-3 py-2 text-xs font-mono text-[#FAF8F5]"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="cat-active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#121212] border-[#2D2D2A] text-[#C5A880]"
                />
                <label htmlFor="cat-active" className="text-xs text-[#FAF8F5] cursor-pointer">
                  Catégorie active
                </label>
              </div>
            </div>

            {formError && (
              <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262624]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="border-[#3E3D3A] text-[#FAF8F5]"
              >
                Annuler
              </Button>
              <Button type="submit" variant="champagne" size="sm" disabled={formLoading}>
                {formLoading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete / Detach Confirmation Modal */}
      {categoryToDelete && (
        <Modal
          isOpen={Boolean(categoryToDelete)}
          onClose={() => setCategoryToDelete(null)}
          title="Suppression de catégorie"
        >
          <div className="space-y-4 text-xs">
            <p className="text-[#9E9589]">
              Êtes-vous certain de vouloir supprimer la catégorie « <strong className="text-[#FAF8F5]">{categoryToDelete.name}</strong> » ?
            </p>

            {categoryToDelete.products_count > 0 && (
              <div className="p-3 bg-amber-950/50 border border-amber-800 text-amber-200 space-y-2">
                <div className="font-semibold flex items-center gap-1.5 text-amber-300">
                  <AlertCircle className="w-4 h-4" />
                  <span>Protection : {categoryToDelete.products_count} produit(s) associé(s)</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Cette catégorie contient actuellement des produits. Que souhaitez-vous faire ?
                </p>
                <div className="space-y-1.5 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="strategy"
                      checked={deleteStrategy === 'detach'}
                      onChange={() => setDeleteStrategy('detach')}
                      className="text-[#C5A880]"
                    />
                    <span>Détacher les produits (conserver les produits sans catégorie)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="strategy"
                      checked={deleteStrategy === 'prevent'}
                      onChange={() => setDeleteStrategy('prevent')}
                      className="text-[#C5A880]"
                    />
                    <span>Annuler la suppression pour réassigner manuellement</span>
                  </label>
                </div>
              </div>
            )}

            {deleteError && (
              <div className="p-3 bg-red-950/60 border border-red-800 text-red-200">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262624]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCategoryToDelete(null)}
                className="border-[#3E3D3A] text-[#FAF8F5]"
              >
                Annuler
              </Button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDelete}
                className="px-4 py-2 text-xs uppercase tracking-wider font-medium bg-red-700 hover:bg-red-600 text-white transition-colors"
              >
                {deleteLoading ? 'Suppression...' : 'Confirmer la suppression'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
