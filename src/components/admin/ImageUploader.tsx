'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { uploadMediaAction } from '@/features/media/actions';
import {
  Upload,
  X,
  Star,
  ArrowUp,
  ArrowDown,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface ImageUploaderProps {
  productId?: string;
  images: { url: string; alt: string; position: number; is_primary: boolean }[];
  onChange: (images: { url: string; alt: string; position: number; is_primary: boolean }[]) => void;
}

export function ImageUploader({ productId, images, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    const newImages = [...images];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Client-side quick validation
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) {
        setError(`Format non autorisé pour ${file.name}. Seuls JPEG, PNG, WebP, AVIF sont acceptés.`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name} dépasse la limite autorisée de 10 Mo.`);
        continue;
      }

      const formData = new FormData();
      formData.append('file', file);
      if (productId) formData.append('productId', productId);
      formData.append('altText', file.name.replace(/\.[^/.]+$/, ''));

      const res = await uploadMediaAction(formData);

      if (res.success && res.url) {
        newImages.push({
          url: res.url,
          alt: file.name.replace(/\.[^/.]+$/, ''),
          position: newImages.length,
          is_primary: newImages.length === 0,
        });
      } else {
        setError(res.error || `Erreur d’envoi pour ${file.name}`);
      }
    }

    onChange(newImages);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const setPrimary = (index: number) => {
    const updated = images.map((img, idx) => ({
      ...img,
      is_primary: idx === index,
    }));
    onChange(updated);
  };

  const removeImage = (index: number) => {
    const updated = images
      .filter((_, idx) => idx !== index)
      .map((img, idx) => ({
        ...img,
        position: idx,
        is_primary: img.is_primary || (idx === 0 && !images.some((i, iIdx) => iIdx !== index && i.is_primary)),
      }));
    onChange(updated);
  };

  const movePosition = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const reordered = [...images];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    onChange(reordered.map((img, idx) => ({ ...img, position: idx })));
  };

  const updateAlt = (index: number, newAlt: string) => {
    const updated = [...images];
    updated[index].alt = newAlt;
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-[#C5A880] bg-[#22201C]'
            : 'border-[#2D2D2A] bg-[#161614] hover:border-[#3E3D3A]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          {uploading ? (
            <Loader2 className="w-8 h-8 text-[#C5A880] animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-[#736B5E]" />
          )}
          <div className="text-xs">
            <span className="text-[#FAF8F5] font-medium">
              {uploading ? 'Téléversement en cours sur Supabase Storage...' : 'Cliquez pour sélectionner'}
            </span>{' '}
            <span className="text-[#8C827A]">ou glissez-déposez vos images ici</span>
          </div>
          <span className="text-[10px] text-[#736B5E] block">
            JPEG, PNG, WebP, AVIF — 10 Mo max par photo
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Uploaded Images List */}
      {images.length > 0 && (
        <div className="space-y-3">
          <span className="text-[11px] uppercase tracking-wider text-[#8C827A] font-medium block">
            Galerie ({images.length} visuel{images.length > 1 ? 's' : ''})
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`bg-[#181816] border p-3 flex flex-col justify-between space-y-3 transition-colors ${
                  img.is_primary ? 'border-[#C5A880]' : 'border-[#282725]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative w-16 h-16 bg-[#121212] border border-[#2D2D2A] shrink-0 overflow-hidden">
                    <Image
                      src={img.url}
                      alt={img.alt || 'Photo bijou'}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono text-[#736B5E]">
                        Position {idx + 1}
                      </span>
                      {img.is_primary && (
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-[#C5A880] text-[#121212] font-semibold">
                          Principale
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={img.alt}
                      onChange={(e) => updateAlt(idx, e.target.value)}
                      placeholder="Texte alternatif (alt)"
                      className="w-full bg-[#121212] border border-[#282725] px-2 py-1 text-[11px] text-[#FAF8F5] focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#222220] text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => movePosition(idx, 'up')}
                      className="p-1 text-[#736B5E] hover:text-[#FAF8F5] disabled:opacity-30"
                      title="Monter"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={() => movePosition(idx, 'down')}
                      className="p-1 text-[#736B5E] hover:text-[#FAF8F5] disabled:opacity-30"
                      title="Descendre"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {!img.is_primary && (
                      <button
                        type="button"
                        onClick={() => setPrimary(idx)}
                        className="text-[10px] text-[#C5A880] hover:underline flex items-center gap-1"
                      >
                        <Star className="w-3 h-3" />
                        <span>Définir principale</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="p-1 text-red-400 hover:text-red-300"
                      title="Supprimer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
