import { Metadata } from 'next';
import { getContactRequestsAdmin } from '@/features/contact/actions';
import { ClientsManagerClient } from './ClientsManagerClient';
import { DatabaseNotConfiguredBanner } from '@/components/admin/DatabaseNotConfiguredBanner';

export const metadata: Metadata = {
  title: 'Demandes Clients & Messages | Perle Noire Admin',
};

export default async function AdminClientsPage() {
  const reqData = await getContactRequestsAdmin();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {!reqData.isConfigured && (
        <DatabaseNotConfiguredBanner message="Supabase n’est pas configuré. Les demandes affichées proviennent directement des messages réels enregistrés en base." />
      )}

      <div>
        <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-medium block mb-1">
          Correspondance & Rendez-vous
        </span>
        <h1 className="font-editorial text-3xl text-[#FAF8F5]">
          Demandes Clients & Messages
        </h1>
        <p className="text-xs text-[#9E9589] mt-1">
          Consultez et traitez les messages reçus via le formulaire de contact, les demandes d’information sur les bijoux et les demandes de rendez-vous.
        </p>
      </div>

      <ClientsManagerClient initialRequests={reqData.requests} />
    </div>
  );
}
