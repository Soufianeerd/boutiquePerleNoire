'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CollectionWithCount,
  createCollectionAction,
  updateCollectionAction,
  deleteCollectionAction,
  toggleCollectionActiveAction,
} from '@/features/collections/actions';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/admin/EmptyState';
import {
  Sparkles,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  Gem,
} from 'lucide-react';

interface CollectionsManagerClientProps {
  initialCollections: CollectionWithCount[];
}

export function CollectionsManagerClient({
  initialCollections,
}: CollectionsManagerClientProps) {
  const router = useRouter();
  const [collections, setCollections] = useState<CollectionWithCount[]>(initialCollections);

  // Modal create/edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<CollectionWithCount | null>(null);

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
  const [collectionToDelete, setCollectionToDelete] = useState<CollectionWithCount | null>(null);
  const [deleteStrategy, setDeleteStrategy] = useState<'prevent' | 'detach'>('prevent');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const openCreateModal = () => {
    setEditingCollection(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('');
    setHeroUrl('');
    setPosition(String(collections.length));
    setActive(true);
    setMetaTitle('');
    setMetaDescription('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (col: CollectionWithCount) => {
    setEditingCollection(col);
    setName(col.name);
    setSlug(col.slug);
    setDescription(col.description || '');
    setImageUrl(col.image_url || '');
    setHeroUrl(col.hero_url || '');
    setPosition(String(col.position));
    setActive(col.active);
    setMetaTitle(col.meta_title || '');
    setMetaDescription(col.meta_description || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCollection) {
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

    if (editingCollection) {
      const res = await updateCollectionAction(editingCollection.id, payload);
      setFormLoading(false);
      if (res.success && res.collection) {
        setCollections(
          collections.map((c) =>
            c.id === editingCollection.id
              ? { ...res.collection!, products_count: c.products_count }
              : c
          )
        );
        setIsModalOpen(false);
        router.refresh();
      } else {
        setFormError(res.error || 'Erreur lors de la mise à jour.');
      }
    } else {
      const res = await createCollectionAction(payload);
      setFormLoading(false);
      if (res.success && res.collection) {
        setCollections([...collections, { ...res.collection, products_count: 0 }]);
        setIsModalOpen(false);
        router.refresh();
      } else {
        setFormError(res.error || 'Erreur lors de la création.');
      }
    }
  };

  const handleToggleActive = async (col: CollectionWithCount) => {
    const res = await toggleCollectionActiveAction(col.id, !col.active);
    if (res.success) {
      setCollections(
        collections.map((c) => (c.id === col.id ? { ...c, active: !c.active } : c))
      );
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (!collectionToDelete) return;
    setDeleteLoading(true);
    setDeleteError(null);

    const res = await deleteCollectionAction(collectionToDelete.id, deleteStrategy);
    setDeleteLoading(false);

    if (res.success) {
      setCollections(collections.filter((c) => c.id !== collectionToDelete.id));
      setCollectionToDelete(null);
      router.refresh();
    } else {
      setDeleteError(res.error || 'Impossible de supprimer cette collection.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          variant="champagne"
          size="sm"
          onClick={openCreateModal}
          className="flex items-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nouvelle Collection</span>
        </Button>
      </div>

      {collections.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Aucune collection enregistrée"
          description="Créez votre première collection thématique pour regrouper vos créations en univers spécifiques."
          actionLabel="Créer une collection"
          onAction={openCreateModal}
        />
      ) : (
        <div className="bg-[#181816] border border-[#282725] overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141414] text-[#8C827A] uppercase tracking-wider text-[10px] border-b border-[#282725]">
              <tr>
                <th className="py-3 px-4">Ordre</th>
                <th className="py-3 px-4">Collection</th>
                <th className="py-3 px-4">Slug URL</th>
                <th className="py-3 px-4">Produits associés</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242422]">
              {collections.map((col) => (
                <tr key={col.id} className="hover:bg-[#1E1E1C] transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[#736B5E]">
                    {col.position}
                  </td>

                  <td className="py-3.5 px-4 font-medium text-[#FAF8F5]">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#C5A880]" />
                      <span>{col.name}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[#8C827A]">
                    /{col.slug}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-[#FAF8F5]">
                      <Gem className="w-3 h-3 text-[#A08154]" />
                      <span>{col.products_count} produit{col.products_count > 1 ? 's' : ''}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(col)}
                      className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 border ${
                        col.active
                          ? 'text-[#6FCF97] border-[#22442C] bg-[#16271C]'
                          : 'text-[#8C827A] border-[#3E3D3A] bg-[#222220]'
                      }`}
                    >
                      {col.active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>{col.active ? 'Active' : 'Inactive'}</span>
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(col)}
                        className="p-1.5 text-[#C5A880] hover:text-[#FAF8F5] transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCollectionToDelete(col);
                          setDeleteStrategy(col.products_count > 0 ? 'detach' : 'prevent');
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
          title={editingCollection ? 'Modifier la collection' : 'Nouvelle collection'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] mb-1">
                Nom de la collection *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex: Épure Minérale"
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
                placeholder="epure-minerale"
                className="w-full bg-[#121212] border border-[#282725] px-3 py-2 text-xs font-mono text-[#FAF8F5] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] mb-1">
                Description de la collection
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description de la collection..."
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
                  id="col-active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#121212] border-[#2D2D2A] text-[#C5A880]"
                />
                <label htmlFor="col-active" className="text-xs text-[#FAF8F5] cursor-pointer">
                  Collection active
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
      {collectionToDelete && (
        <Modal
          isOpen={Boolean(collectionToDelete)}
          onClose={() => setCollectionToDelete(null)}
          title="Suppression de collection"
        >
          <div className="space-y-4 text-xs">
            <p className="text-[#9E9589]">
              Êtes-vous certain de vouloir supprimer la collection « <strong className="text-[#FAF8F5]">{collectionToDelete.name}</strong> » ?
            </p>

            {collectionToDelete.products_count > 0 && (
              <div className="p-3 bg-amber-950/50 border border-amber-800 text-amber-200 space-y-2">
                <div className="font-semibold flex items-center gap-1.5 text-amber-300">
                  <AlertCircle className="w-4 h-4" />
                  <span>Protection : {collectionToDelete.products_count} produit(s) associé(s)</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Cette collection contient actuellement des produits. Que souhaitez-vous faire ?
                </p>
                <div className="space-y-1.5 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="col_strategy"
                      checked={deleteStrategy === 'detach'}
                      onChange={() => setDeleteStrategy('detach')}
                      className="text-[#C5A880]"
                    />
                    <span>Détacher les produits (conserver les produits sans collection)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="col_strategy"
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
                onClick={() => setCollectionToDelete(null)}
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
