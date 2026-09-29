import { Metadata } from 'next';
import { getStoreSettings } from '@/features/settings/actions';
import { SettingsFormClient } from './SettingsFormClient';

export const metadata: Metadata = {
  title: 'Paramètres & Configuration des Modes | Perle Noire Admin',
};

export default async function AdminParametresPage() {
  const settings = await getStoreSettings();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-medium block mb-1">
          Centre de Contrôle Global
        </span>
        <h1 className="font-editorial text-3xl text-[#FAF8F5]">
          Paramètres & Modes Opérationnels
        </h1>
        <p className="text-xs text-[#9E9589] mt-1">
          Configurez instantanément le mode vitrine vs e-commerce, l’affichage des prix, les canaux de conciergerie et les coordonnées officielles.
        </p>
      </div>

      <div className="bg-[#181816] border border-[#282725] p-6 sm:p-8">
        <SettingsFormClient initialSettings={settings} />
      </div>
    </div>
  );
}
