'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HomepageSection } from '@/types/database';
import {
  updateHomepageSectionAction,
  toggleHomepageSectionActiveAction,
  reorderHomepageSectionsAction,
} from '@/features/homepage/actions';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  ArrowUp,
  ArrowDown,
  Edit,
  Check,
  X,
  Eye,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface HomepageSectionsManagerClientProps {
  initialSections: HomepageSection[];
}

export function HomepageSectionsManagerClient({
  initialSections,
}: HomepageSectionsManagerClientProps) {
  const router = useRouter();
  const [sections, setSections] = useState<HomepageSection[]>(initialSections);

  // Edit Modal State
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [active, setActive] = useState(true);

  // Structured content fields based on section_type
  const [contentFields, setContentFields] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openEditModal = (sec: HomepageSection) => {
    setEditingSection(sec);
    setTitle(sec.title || '');
    setSubtitle(sec.subtitle || '');
    setActive(sec.active);

    const json = sec.content_json || {};
    const flat: Record<string, string> = {};
    for (const [k, v] of Object.entries(json)) {
      if (typeof v === 'string') flat[k] = v;
      else if (typeof v === 'number' || typeof v === 'boolean') flat[k] = String(v);
    }
    setContentFields(flat);
    setSuccess(false);
    setError(null);
  };

  const handleToggle = async (sec: HomepageSection) => {
    const res = await toggleHomepageSectionActiveAction(sec.id, !sec.active);
    if (res.success) {
      setSections(
        sections.map((s) => (s.id === sec.id ? { ...s, active: !s.active } : s))
      );
      router.refresh();
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const reordered = [...sections];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    const updated = reordered.map((s, idx) => ({ ...s, position: idx }));
    setSections(updated);

    await reorderHomepageSectionsAction(updated.map((s) => s.id));
    router.refresh();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    // Merge structured content fields back
    const finalContentJson = {
      ...(editingSection.content_json || {}),
      ...contentFields,
    };

    const res = await updateHomepageSectionAction(editingSection.id, {
      title: title.trim() || null,
      subtitle: subtitle.trim() || null,
      active,
      content_json: finalContentJson,
    });

    setLoading(false);

    if (res.success && res.section) {
      setSections(
        sections.map((s) => (s.id === editingSection.id ? res.section! : s))
      );
      setSuccess(true);
      router.refresh();
      setTimeout(() => {
        setSuccess(false);
        setEditingSection(null);
      }, 1000);
    } else {
      setError(res.error || 'Erreur lors de la mise à jour.');
    }
  };

  const updateContentField = (key: string, val: string) => {
    setContentFields((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#8C827A]">
          Organisez les sections de la page d’accueil par glisser ou flèches de réordonnancement.
        </p>
        <a href="/" target="_blank" rel="noreferrer">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-[#FAF8F5] border-[#3E3D3A]"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Aperçu du site</span>
          </Button>
        </a>
      </div>

      <div className="space-y-3">
        {sections.map((section, idx) => (
          <div
            key={section.id}
            className={`p-4 bg-[#181816] border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
              section.active ? 'border-[#282725] hover:border-[#3E3D3A]' : 'border-[#222220] opacity-60'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Order Controls */}
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, 'up')}
                  className="p-1 text-[#736B5E] hover:text-[#FAF8F5] disabled:opacity-20"
                  title="Monter la section"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === sections.length - 1}
                  onClick={() => handleMove(idx, 'down')}
                  className="p-1 text-[#736B5E] hover:text-[#FAF8F5] disabled:opacity-20"
                  title="Descendre la section"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Number Badge */}
              <div className="w-7 h-7 rounded-full bg-[#242422] border border-[#3E3D3A] flex items-center justify-center text-[#C5A880] text-xs font-mono font-medium shrink-0">
                0{idx + 1}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-[#FAF8F5]">
                    {section.title || section.section_type}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 bg-[#222220] border border-[#3E3D3A] text-[#C5A880]">
                    {section.section_type}
                  </span>
                </div>
                <p className="text-xs text-[#736B5E] mt-0.5">
                  {section.subtitle || 'Section paramétrée via contenu visuel'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <button
                type="button"
                onClick={() => handleToggle(section)}
                className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-1 border ${
                  section.active
                    ? 'text-[#6FCF97] border-[#22442C] bg-[#16271C]'
                    : 'text-[#8C827A] border-[#3E3D3A] bg-[#222220]'
                }`}
              >
                {section.active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                <span>{section.active ? 'Actif' : 'Masqué'}</span>
              </button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openEditModal(section)}
                className="border-[#3E3D3A] text-xs text-[#FAF8F5] hover:text-[#C5A880] flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Modifier le contenu</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Content Modal */}
      {editingSection && (
        <Modal
          isOpen={Boolean(editingSection)}
          onClose={() => setEditingSection(null)}
          title={`Configuration : Section ${editingSection.section_type.toUpperCase()}`}
        >
          <form onSubmit={handleSave} className="space-y-5 text-xs">
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] mb-1">
                  Titre Principal de la Section
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Les Pièces d’Exception"
                  className="w-full bg-[#121212] border border-[#282725] px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] mb-1">
                  Sous-titre / Accroche
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Ex: Façonnées à la main avec une exigence rare"
                  className="w-full bg-[#121212] border border-[#282725] px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              {/* Dynamic structured fields according to section_type */}
              <div className="p-3 bg-[#121212] border border-[#282725] space-y-3">
                <span className="text-[10px] uppercase tracking-wider text-[#C5A880] font-semibold block">
                  Contenu Spécifique ({editingSection.section_type})
                </span>

                {editingSection.section_type === 'hero' && (
                  <>
                    <div>
                      <label className="block text-[10px] uppercase text-[#736B5E] mb-1">
                        Texte du Bouton CTA
                      </label>
                      <input
                        type="text"
                        value={contentFields['cta_text'] || ''}
                        onChange={(e) => updateContentField('cta_text', e.target.value)}
                        placeholder="Ex: Découvrir les créations"
                        className="w-full bg-[#181816] border border-[#2D2D2A] px-2 py-1.5 text-xs text-[#FAF8F5]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-[#736B5E] mb-1">
                        Lien du Bouton (URL)
                      </label>
                      <input
                        type="text"
                        value={contentFields['cta_link'] || ''}
                        onChange={(e) => updateContentField('cta_link', e.target.value)}
                        placeholder="Ex: /bijoux"
                        className="w-full bg-[#181816] border border-[#2D2D2A] px-2 py-1.5 text-xs text-[#FAF8F5]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-[#736B5E] mb-1">
                        Image de fond (URL)
                      </label>
                      <input
                        type="text"
                        value={contentFields['background_image'] || ''}
                        onChange={(e) => updateContentField('background_image', e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-[#181816] border border-[#2D2D2A] px-2 py-1.5 text-xs text-[#FAF8F5]"
                      />
                    </div>
                  </>
                )}

                {editingSection.section_type === 'editorial' && (
                  <>
                    <div>
                      <label className="block text-[10px] uppercase text-[#736B5E] mb-1">
                        Citation / Phrase Forte
                      </label>
                      <textarea
                        rows={2}
                        value={contentFields['quote'] || ''}
                        onChange={(e) => updateContentField('quote', e.target.value)}
                        placeholder="« Chaque création reflète une quête absolue de pureté... »"
                        className="w-full bg-[#181816] border border-[#2D2D2A] p-2 text-xs text-[#FAF8F5]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-[#736B5E] mb-1">
                        Auteur / Signature
                      </label>
                      <input
                        type="text"
                        value={contentFields['author'] || ''}
                        onChange={(e) => updateContentField('author', e.target.value)}
                        placeholder="Direction Créative"
                        className="w-full bg-[#181816] border border-[#2D2D2A] px-2 py-1.5 text-xs text-[#FAF8F5]"
                      />
                    </div>
                  </>
                )}

                {editingSection.section_type === 'collection_banner' && (
                  <>
                    <div>
                      <label className="block text-[10px] uppercase text-[#736B5E] mb-1">
                        Badge / Surtitre
                      </label>
                      <input
                        type="text"
                        value={contentFields['badge'] || ''}
                        onChange={(e) => updateContentField('badge', e.target.value)}
                        placeholder="Nouvel Univers"
                        className="w-full bg-[#181816] border border-[#2D2D2A] px-2 py-1.5 text-xs text-[#FAF8F5]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-[#736B5E] mb-1">
                        Lien de destination
                      </label>
                      <input
                        type="text"
                        value={contentFields['link'] || ''}
                        onChange={(e) => updateContentField('link', e.target.value)}
                        placeholder="/collections"
                        className="w-full bg-[#181816] border border-[#2D2D2A] px-2 py-1.5 text-xs text-[#FAF8F5]"
                      />
                    </div>
                  </>
                )}

                {editingSection.section_type === 'newsletter' && (
                  <>
                    <div>
                      <label className="block text-[10px] uppercase text-[#736B5E] mb-1">
                        Texte du Bouton
                      </label>
                      <input
                        type="text"
                        value={contentFields['button_text'] || ''}
                        onChange={(e) => updateContentField('button_text', e.target.value)}
                        placeholder="S’inscrire"
                        className="w-full bg-[#181816] border border-[#2D2D2A] px-2 py-1.5 text-xs text-[#FAF8F5]"
                      />
                    </div>
                  </>
                )}

                {!['hero', 'editorial', 'collection_banner', 'newsletter'].includes(
                  editingSection.section_type
                ) && (
                  <p className="text-[11px] text-[#736B5E]">
                    Cette section affiche automatiquement les données associées (catégories, produits récents ou engagements) selon votre catalogue.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="modal-sec-active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#121212] border-[#2D2D2A] text-[#C5A880]"
                />
                <label htmlFor="modal-sec-active" className="text-xs text-[#FAF8F5] cursor-pointer">
                  Section active sur la page d’accueil
                </label>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-2 bg-[#17261B] border border-[#2A4D33] text-[#6FCF97] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Section mise à jour avec succès.</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262624]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingSection(null)}
                className="border-[#3E3D3A] text-[#FAF8F5]"
              >
                Annuler
              </Button>
              <Button type="submit" variant="champagne" size="sm" disabled={loading}>
                {loading ? 'Enregistrement...' : 'Enregistrer la section'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
