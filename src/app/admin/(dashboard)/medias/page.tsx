import { Metadata } from 'next';
import { getMediaListAdmin } from '@/features/media/actions';
import { MediasManagerClient } from './MediasManagerClient';
import { DatabaseNotConfiguredBanner } from '@/components/admin/DatabaseNotConfiguredBanner';

export const metadata: Metadata = {
  title: 'Médiathèque & Fichiers | Perle Noire Admin',
};

export default async function AdminMediasPage() {
  const mediaData = await getMediaListAdmin();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {!mediaData.isConfigured && (
        <DatabaseNotConfiguredBanner message="Supabase n’est pas configuré. La médiathèque affiche uniquement les vrais fichiers déposés sur votre bucket Supabase Storage." />
      )}

      <div>
        <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-medium block mb-1">
          Stockage Objet & CDN
        </span>
        <h1 className="font-editorial text-3xl text-[#FAF8F5]">
          Médiathèque des Fichiers
        </h1>
        <p className="text-xs text-[#9E9589] mt-1">
          Gérez vos photos de produits, bannières et éléments graphiques. Téléversez directement dans le bucket Supabase sécurisé.
        </p>
      </div>

      <MediasManagerClient initialMedia={mediaData.items} />
    </div>
  );
}
