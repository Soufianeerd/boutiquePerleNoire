import { Metadata } from 'next';
import { initialContactRequests } from '@/lib/data/mock-data';
import { Users, Phone, MessageSquare, Mail, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Clients & Demandes Privées | Perle Noire Admin',
};

export default function AdminClientsPage() {
  const requests = initialContactRequests;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-medium block mb-1">
          Carnet Privé & Conciergerie
        </span>
        <h1 className="font-editorial text-3xl text-[#FAF8F5]">
          Clients & Demandes de Rendez-vous
        </h1>
        <p className="text-xs text-[#9E9589] mt-1">
          Gérez les demandes de rendez-vous en salon, commandes sur-mesure et correspondances privées.
        </p>
      </div>

      <div className="bg-[#181816] border border-[#282725] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#141414] text-[#8C827A] uppercase tracking-wider text-[10px] border-b border-[#282725]">
            <tr>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Canal Souhaité</th>
              <th className="py-3 px-4">Pièce Concernée</th>
              <th className="py-3 px-4">Message / Souhait</th>
              <th className="py-3 px-4">Statut</th>
              <th className="py-3 px-4 text-right">Actions Directes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#242422]">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-[#1E1E1C] transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#C5A880] shrink-0" />
                    <div>
                      <span className="text-[#FAF8F5] font-medium block">{req.name}</span>
                      <span className="text-[10px] text-[#736B5E]">{req.email}</span>
                      {req.phone && (
                        <span className="text-[10px] text-[#8C827A] block font-mono">{req.phone}</span>
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
                      <Sparkles className="w-3 h-3 text-[#A08154]" />
                      <span className="truncate max-w-xs">{req.product.name}</span>
                    </div>
                  ) : (
                    <span className="text-[#736B5E]">Visite Générale Salon</span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-[#9E9589] max-w-xs truncate italic">
                  “{req.message}”
                </td>
                <td className="py-3.5 px-4">
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#222220] text-[#FAF8F5]">
                    {req.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-3 text-xs">
                    {req.phone && (
                      <a
                        href={`tel:${req.phone}`}
                        className="text-[#C5A880] hover:underline flex items-center gap-1"
                        title="Appeler"
                      >
                        <Phone className="w-3 h-3" />
                      </a>
                    )}
                    {req.phone && (
                      <a
                        href={`https://wa.me/${req.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#6FCF97] hover:underline flex items-center gap-1"
                        title="Ouvrir WhatsApp"
                      >
                        <MessageSquare className="w-3 h-3" />
                      </a>
                    )}
                    <a
                      href={`mailto:${req.email}`}
                      className="text-[#FAF8F5] hover:underline flex items-center gap-1"
                      title="Envoyer un e-mail"
                    >
                      <Mail className="w-3 h-3" />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
