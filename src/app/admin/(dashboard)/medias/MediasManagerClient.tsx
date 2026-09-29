'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MediaItem } from '@/types/database';
import {
  uploadMediaAction,
  deleteMediaAction,
  updateMediaAltAction,
} from '@/features/media/actions';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/admin/EmptyState';
import {
  Image as ImageIcon,
  Upload,
  Search,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  ShieldCheck,
  HardDrive,
} from 'lucide-react';

interface MediaWithUsage extends MediaItem {
  usage_count: number;
}

interface MediasManagerClientProps {
  initialMedia: MediaWithUsage[];
}

export function MediasManagerClient({ initialMedia }: MediasManagerClientProps) {
  const router = useRouter();
  const [mediaList, setMediaList] = useState<MediaWithUsage[]>(initialMedia);
  const [search, setSearch] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Uploading state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Delete state
  const [mediaToDelete, setMediaToDelete] = useState<MediaWithUsage | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Alt edit state
  const [editingMedia, setEditingMedia] = useState<MediaWithUsage | null>(null);
  const [newAlt, setNewAlt] = useState('');

  const filteredMedia = mediaList.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.filename.toLowerCase().includes(q) ||
      (m.alt_text ? m.alt_text.toLowerCase().includes(q) : false)
    );
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('altText', file.name.replace(/\.[^/.]+$/, ''));

      const res = await uploadMediaAction(formData);
      if (res.success && res.media) {
        setMediaList((prev) => [{ ...res.media!, usage_count: 0 }, ...prev]);
      } else {
        setUploadError(res.error || `Erreur d’envoi pour ${file.name}`);
      }
    }

    setUploading(false);
    router.refresh();
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleDelete = async () => {
    if (!mediaToDelete) return;
    setDeleteLoading(true);
    setDeleteError(null);

    const res = await deleteMediaAction(mediaToDelete.id);
    setDeleteLoading(false);

    if (res.success) {
      setMediaList((prev) => prev.filter((m) => m.id !== mediaToDelete.id));
      setMediaToDelete(null);
      router.refresh();
    } else {
      setDeleteError(res.error || 'Erreur lors de la suppression.');
    }
  };

  const handleSaveAlt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedia) return;

    const res = await updateMediaAltAction(editingMedia.id, newAlt);
    if (res.success) {
      setMediaList((prev) =>
        prev.map((m) => (m.id === editingMedia.id ? { ...m, alt_text: newAlt } : m))
      );
      setEditingMedia(null);
      router.refresh();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 o';
    const k = 1024;
    const sizes = ['o', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload & Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-[#181816] border border-[#282725] space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#C5A880]">
            <HardDrive className="w-4 h-4" />
            <span className="font-medium">Bucket Supabase Storage</span>
          </div>
          <span className="text-sm font-mono text-[#FAF8F5] block">jewelry-media</span>
          <span className="text-[10px] text-[#736B5E]">Stockage objet persistant</span>
        </div>

        <div className="p-4 bg-[#181816] border border-[#282725] space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#6FCF97]">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-medium">Types MIME Autorisés</span>
          </div>
          <span className="text-xs text-[#FAF8F5] block">image/jpeg, png, webp, avif</span>
          <span className="text-[10px] text-[#736B5E]">Taille max : 10 Mo par fichier</span>
        </div>

        <div className="p-4 bg-[#181816] border border-[#282725] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#9E9589] block">Total Médias</span>
            <span className="font-editorial text-2xl text-[#FAF8F5]">
              {mediaList.length}
            </span>
          </div>
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
            <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#C5A880] hover:bg-[#B39368] text-[#121212] text-xs font-medium uppercase tracking-wider transition-colors">
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>{uploading ? 'Upload...' : 'Téléverser'}</span>
            </span>
          </label>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#736B5E]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom de fichier ou alt..."
          className="w-full bg-[#121212] border border-[#282725] pl-9 pr-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C5A880]"
        />
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title={mediaList.length === 0 ? 'Aucun média dans la bibliothèque' : 'Aucun fichier trouvé'}
          description={
            mediaList.length === 0
              ? 'Téléversez vos photos de produits, bannières et visuels joailliers dans votre bucket Supabase.'
              : 'Aucun média ne correspond à votre recherche.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="bg-[#181816] border border-[#282725] flex flex-col justify-between overflow-hidden hover:border-[#3E3D3A] transition-colors"
            >
              {/* Image Preview */}
              <div className="relative w-full h-44 bg-[#121212] overflow-hidden">
                <Image
                  src={item.file_path}
                  alt={item.alt_text || item.filename}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {item.usage_count > 0 && (
                  <span className="absolute top-2 left-2 text-[9px] uppercase tracking-wider px-2 py-0.5 bg-[#121212]/90 border border-[#3E3D3A] text-[#C5A880] font-medium">
                    Utilisé par {item.usage_count} produit{item.usage_count > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Metadata */}
              <div className="p-3 space-y-1 text-xs">
                <span className="font-mono text-[#FAF8F5] truncate block" title={item.filename}>
                  {item.filename}
                </span>
                <div className="flex items-center justify-between text-[10px] text-[#736B5E]">
                  <span>{formatFileSize(item.file_size)}</span>
                  <span>{item.mime_type.split('/')[1]?.toUpperCase()}</span>
                </div>
                {item.alt_text && (
                  <p className="text-[10px] text-[#9E9589] truncate italic" title={item.alt_text}>
                    Alt : {item.alt_text}
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="p-3 pt-2 border-t border-[#222220] flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => copyToClipboard(item.file_path)}
                  className="text-[#8C827A] hover:text-[#FAF8F5] flex items-center gap-1 text-[11px]"
                  title="Copier le lien public"
                >
                  {copiedUrl === item.file_path ? (
                    <Check className="w-3.5 h-3.5 text-[#6FCF97]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedUrl === item.file_path ? 'Copié' : 'Lien'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingMedia(item);
                      setNewAlt(item.alt_text || '');
                    }}
                    className="text-[#C5A880] hover:underline text-[11px]"
                  >
                    Alt
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMediaToDelete(item);
                      setDeleteError(null);
                    }}
                    className="p-1 text-red-400 hover:text-red-300"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Alt Modal */}
      {editingMedia && (
        <Modal
          isOpen={Boolean(editingMedia)}
          onClose={() => setEditingMedia(null)}
          title="Modifier le texte alternatif (SEO & Accessibilité)"
        >
          <form onSubmit={handleSaveAlt} className="space-y-4">
            <div className="relative w-full h-36 bg-[#121212] border border-[#282725] overflow-hidden">
              <Image
                src={editingMedia.file_path}
                alt={newAlt}
                fill
                className="object-contain"
                unoptimized
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] mb-1">
                Texte Alternatif (Alt Text)
              </label>
              <input
                type="text"
                value={newAlt}
                onChange={(e) => setNewAlt(e.target.value)}
                placeholder="Description du bijou pour les lecteurs d'écran et Google..."
                className="w-full bg-[#121212] border border-[#282725] px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262624]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingMedia(null)}
                className="border-[#3E3D3A] text-[#FAF8F5]"
              >
                Annuler
              </Button>
              <Button type="submit" variant="champagne" size="sm">
                Enregistrer
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {mediaToDelete && (
        <Modal
          isOpen={Boolean(mediaToDelete)}
          onClose={() => setMediaToDelete(null)}
          title="Supprimer ce média ?"
        >
          <div className="space-y-4 text-xs">
            <p className="text-[#9E9589]">
              Êtes-vous certain de vouloir supprimer définitivement le fichier « <strong className="text-[#FAF8F5]">{mediaToDelete.filename}</strong> » du stockage Supabase ?
            </p>

            {mediaToDelete.usage_count > 0 && (
              <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <p className="leading-relaxed">
                  Ce média est actuellement utilisé par {mediaToDelete.usage_count} produit(s). Vous devez le retirer de la galerie du produit avant de pouvoir le supprimer du stockage.
                </p>
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
                onClick={() => setMediaToDelete(null)}
                className="border-[#3E3D3A] text-[#FAF8F5]"
              >
                Annuler
              </Button>
              <button
                type="button"
                disabled={deleteLoading || mediaToDelete.usage_count > 0}
                onClick={handleDelete}
                className="px-4 py-2 text-xs uppercase tracking-wider font-medium bg-red-700 hover:bg-red-600 text-white disabled:opacity-40 transition-colors"
              >
                {deleteLoading ? 'Suppression...' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
