import { Metadata } from 'next';
import { getHomepageSections } from '@/features/products/actions';
import { Check, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Contenu Homepage & Storytelling | Perle Noire Admin',
};

export default async function AdminContenuPage() {
  const sections = await getHomepageSections();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-medium block mb-1">
            Édition Dynamique Sans Code
          </span>
          <h1 className="font-editorial text-3xl text-[#FAF8F5]">
            Sections & Storytelling de la Page d’Accueil
          </h1>
          <p className="text-xs text-[#9E9589] mt-1">
            Activez, désactivez et réorganisez les blocs éditoriaux sans toucher au code frontend.
          </p>
        </div>
        <a href="/" target="_blank" rel="noreferrer">
          <Button variant="outline" size="sm" className="flex items-center gap-2 text-[#FAF8F5] border-[#3E3D3A]">
            <Eye className="w-3.5 h-3.5" />
            <span>Aperçu en Direct</span>
          </Button>
        </a>
      </div>

      <div className="space-y-3">
        {sections.map((section, idx) => (
          <div
            key={section.id}
            className="p-5 bg-[#181816] border border-[#282725] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#3E3D3A] transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-[#262624] border border-[#3E3D3A] flex items-center justify-center text-[#C5A880] text-xs font-mono font-medium">
                {idx + 1}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-[#FAF8F5]">
                    {section.title || section.section_type}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 bg-[#222220] border border-[#3E3D3A] text-[#C5A880]">
                    type: {section.section_type}
                  </span>
                </div>
                <p className="text-xs text-[#736B5E] mt-0.5">
                  {section.subtitle || 'Section paramétrée via contenu JSON'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#6FCF97]">
                <Check className="w-3 h-3" /> Active
              </span>
              <button
                type="button"
                className="px-3 py-1.5 text-[11px] uppercase tracking-wider text-[#8C827A] hover:text-[#FAF8F5] border border-[#333] hover:border-[#555] transition-colors"
              >
                Éditer le JSON
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
