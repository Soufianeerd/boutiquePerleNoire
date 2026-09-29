import { Metadata } from 'next';
import { getHomepageSectionsAdmin } from '@/features/homepage/actions';
import { HomepageSectionsManagerClient } from './HomepageSectionsManagerClient';
import { DatabaseNotConfiguredBanner } from '@/components/admin/DatabaseNotConfiguredBanner';

export const metadata: Metadata = {
  title: 'Contenu Page d’Accueil | Perle Noire Admin',
};

export default async function AdminContenuPage() {
  const sectionsData = await getHomepageSectionsAdmin();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {!sectionsData.isConfigured && (
        <DatabaseNotConfiguredBanner message="Supabase n’est pas configuré. Les sections affichées proviennent de votre table homepage_sections réelle." />
      )}

      <div>
        <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-medium block mb-1">
          Mise en Page & Présentation
        </span>
        <h1 className="font-editorial text-3xl text-[#FAF8F5]">
          Contenu de la Page d’Accueil
        </h1>
        <p className="text-xs text-[#9E9589] mt-1">
          Activez, masquez et réordonnez les blocs éditoriaux de votre vitrine. Modifiez les textes sans toucher au code frontend.
        </p>
      </div>

      <HomepageSectionsManagerClient initialSections={sectionsData.sections} />
    </div>
  );
}
