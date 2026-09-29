'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ContactRequest } from '@/types/database';
import {
  updateContactStatusAction,
  deleteContactRequestAction,
} from '@/features/contact/actions';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/admin/EmptyState';
import { formatDate } from '@/lib/utils';
import {
  Users,
  Phone,
  MessageSquare,
  Mail,
  Sparkles,
  Trash2,
  CheckCircle2,
  Search,
  Filter,
  ExternalLink,
} from 'lucide-react';

interface ClientsManagerClientProps {
  initialRequests: ContactRequest[];
}

export function ClientsManagerClient({
  initialRequests,
}: ClientsManagerClientProps) {
  const router = useRouter();
  const [requests, setRequests] = useState<ContactRequest[]>(initialRequests);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Detail Modal State
  const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null);
  const [status, setStatus] = useState<'new' | 'in_progress' | 'answered' | 'closed'>('new');
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const filteredRequests = requests.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = r.name.toLowerCase().includes(q);
      const matchEmail = r.email.toLowerCase().includes(q);
      const matchPhone = r.phone ? r.phone.includes(q) : false;
      const matchMessage = r.message.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchMessage) return false;
    }
    return true;
  });

  const openDetail = (req: ContactRequest) => {
    setSelectedRequest(req);
    setStatus(req.status);
    setAdminNotes(req.admin_notes || '');
    setSaveSuccess(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setSaving(true);
    setSaveSuccess(false);

    const res = await updateContactStatusAction(selectedRequest.id, status, adminNotes);
    setSaving(false);

    if (res.success) {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? { ...r, status, admin_notes: adminNotes }
            : r
        )
      );
      setSaveSuccess(true);
      router.refresh();
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer définitivement cette demande client ?')) return;

    const res = await deleteContactRequestAction(id);
    if (res.success) {
      setRequests((prev) => prev.filter((r) => r.id !== id));
      if (selectedRequest?.id === id) setSelectedRequest(null);
      router.refresh();
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
            placeholder="Rechercher par nom, email, téléphone..."
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
            <option value="all">Tous statuts ({requests.length})</option>
            <option value="new">Nouveau (new)</option>
            <option value="in_progress">En cours (in_progress)</option>
            <option value="answered">Répondu (answered)</option>
            <option value="closed">Traité (closed)</option>
          </select>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <EmptyState
          icon={Users}
          title={requests.length === 0 ? 'Aucune demande client' : 'Aucune demande trouvée'}
          description={
            requests.length === 0
              ? 'Les messages envoyés depuis la page Contact et les demandes de devis sur-mesure apparaîtront ici.'
              : 'Aucun message ne correspond à vos filtres actuels.'
          }
        />
      ) : (
        <div className="bg-[#181816] border border-[#282725] overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141414] text-[#8C827A] uppercase tracking-wider text-[10px] border-b border-[#282725]">
              <tr>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Canal</th>
                <th className="py-3 px-4">Pièce Concernée</th>
                <th className="py-3 px-4">Message</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions Directes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242422]">
              {filteredRequests.map((req) => (
                <tr
                  key={req.id}
                  className="hover:bg-[#1E1E1C] cursor-pointer transition-colors"
                  onClick={() => openDetail(req)}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#242422] flex items-center justify-center text-[#C5A880] text-[11px] font-medium shrink-0">
                        {req.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-[#FAF8F5] font-medium block">{req.name}</span>
                        <span className="text-[10px] text-[#736B5E]">{req.email}</span>
                        {req.phone && (
                          <span className="text-[10px] text-[#8C827A] block font-mono">
                            {req.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 border border-[#3E3D3A] text-[#C5A880]">
                      {req.preferred_channel}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    {req.product ? (
                      <div className="text-[11px] text-[#FAF8F5] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#A08154] shrink-0" />
                        <span className="truncate max-w-[180px]">{req.product.name}</span>
                      </div>
                    ) : (
                      <span className="text-[#736B5E]">Demande Générale</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-[#9E9589] max-w-xs truncate italic">
                    “{req.message}”
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[9px] uppercase tracking-wider px-2 py-0.5 border ${
                        req.status === 'new'
                          ? 'bg-amber-950/50 text-amber-300 border-amber-800'
                          : req.status === 'in_progress'
                          ? 'bg-blue-950/50 text-blue-300 border-blue-800'
                          : req.status === 'answered'
                          ? 'bg-[#16271C] text-[#6FCF97] border-[#22442C]'
                          : 'bg-[#222220] text-[#736B5E] border-[#333]'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-[#736B5E] font-mono text-[11px]">
                    {formatDate(req.created_at)}
                  </td>

                  <td
                    className="py-3.5 px-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-3">
                      {req.phone && (
                        <a
                          href={`tel:${req.phone}`}
                          className="text-[#C5A880] hover:text-[#FAF8F5]"
                          title="Appeler"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {req.phone && (
                        <a
                          href={`https://wa.me/${req.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#6FCF97] hover:underline"
                          title="WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <a
                        href={`mailto:${req.email}`}
                        className="text-[#8C827A] hover:text-[#FAF8F5]"
                        title="Envoyer un e-mail"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDelete(req.id)}
                        className="p-1 text-red-400 hover:text-red-300"
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

      {/* Detail / Update Status Modal */}
      {selectedRequest && (
        <Modal
          isOpen={Boolean(selectedRequest)}
          onClose={() => setSelectedRequest(null)}
          title={`Détail de la demande : ${selectedRequest.name}`}
        >
          <form onSubmit={handleUpdate} className="space-y-5 text-xs">
            {/* Header info */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-[#121212] border border-[#282725]">
              <div>
                <span className="text-[10px] uppercase text-[#736B5E] block">Client</span>
                <span className="text-[#FAF8F5] font-medium block">{selectedRequest.name}</span>
                <span className="text-[#9E9589] block">{selectedRequest.email}</span>
                {selectedRequest.phone && (
                  <span className="text-[#C5A880] font-mono block">{selectedRequest.phone}</span>
                )}
              </div>
              <div>
                <span className="text-[10px] uppercase text-[#736B5E] block">Canal Préféré</span>
                <span className="text-[#C5A880] uppercase tracking-wider block font-medium">
                  {selectedRequest.preferred_channel}
                </span>
                <span className="text-[10px] text-[#736B5E] block mt-1">
                  Reçue le {formatDate(selectedRequest.created_at)}
                </span>
              </div>
            </div>

            {/* Product inquiry */}
            {selectedRequest.product && (
              <div className="p-3 bg-[#1B1A18] border border-[#3E3A33] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-[#C5A880] block">Bijou concerné</span>
                  <span className="text-sm font-medium text-[#FAF8F5]">
                    {selectedRequest.product.name}
                  </span>
                </div>
                <Link
                  href={`/bijoux/${selectedRequest.product.slug}`}
                  target="_blank"
                  className="text-xs text-[#C5A880] hover:underline flex items-center gap-1"
                >
                  <span>Fiche produit</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}

            {/* Message Body */}
            <div>
              <span className="text-[10px] uppercase text-[#9E9589] font-medium block mb-1">
                Message du Client
              </span>
              <div className="p-3 bg-[#121212] border border-[#282725] text-[#FAF8F5] leading-relaxed whitespace-pre-wrap">
                {selectedRequest.message}
              </div>
            </div>

            {/* Status Selector */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] mb-1">
                Statut de traitement
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'new' | 'in_progress' | 'answered' | 'closed')}
                className="w-full bg-[#121212] border border-[#282725] px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C5A880]"
              >
                <option value="new">Nouveau (new)</option>
                <option value="in_progress">En cours de traitement (in_progress)</option>
                <option value="answered">Réponse transmise (answered)</option>
                <option value="closed">Dossier clôturé (closed)</option>
              </select>
            </div>

            {/* Internal Admin Notes */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] mb-1">
                Notes internes (privé)
              </label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Historique des échanges téléphoniques, préférences du client, date de rendez-vous convenu..."
                className="w-full bg-[#121212] border border-[#282725] p-2.5 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            {saveSuccess && (
              <div className="p-2 bg-[#17261B] border border-[#2A4D33] text-[#6FCF97] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Statut et notes enregistrés.</span>
              </div>
            )}

            {/* Direct Contact Links */}
            <div className="flex items-center gap-3 pt-2">
              {selectedRequest.phone && (
                <a
                  href={`tel:${selectedRequest.phone}`}
                  className="px-3 py-2 bg-[#1D1D1B] border border-[#2D2D2A] text-[#C5A880] hover:text-[#FAF8F5] flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Appeler</span>
                </a>
              )}
              {selectedRequest.phone && (
                <a
                  href={`https://wa.me/${selectedRequest.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-[#18261C] border border-[#24472D] text-[#6FCF97] hover:underline flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              )}
              <a
                href={`mailto:${selectedRequest.email}`}
                className="px-3 py-2 bg-[#1D1D1B] border border-[#2D2D2A] text-[#FAF8F5] hover:underline flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>E-mail</span>
              </a>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262624]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedRequest(null)}
                className="border-[#3E3D3A] text-[#FAF8F5]"
              >
                Fermer
              </Button>
              <Button type="submit" variant="champagne" size="sm" disabled={saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
