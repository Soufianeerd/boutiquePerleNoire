import { Metadata } from 'next';
import { getCollections } from '@/features/products/actions';
import { Sparkles, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Gestion des Collections | Perle Noire Admin',
};

export default async function AdminCollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-medium block mb-1">
            Univers & Séries Limitées
          </span>
          <h1 className="font-editorial text-3xl text-[#FAF8F5]">
            Collections Thématiques
          </h1>
          <p className="text-xs text-[#9E9589] mt-1">
            Organisez vos bijoux en récits et univers de collection (Collection Épure, Minérale, etc.).
          </p>
        </div>
        <Button variant="champagne" size="sm" className="flex items-center gap-2">
          <Plus className="w-3.5 h-3.5" />
          <span>Nouvelle Collection</span>
        </Button>
      </div>

      <div className="bg-[#181816] border border-[#282725] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#141414] text-[#8C827A] uppercase tracking-wider text-[10px] border-b border-[#282725]">
            <tr>
              <th className="py-3 px-4">Ordre</th>
              <th className="py-3 px-4">Collection</th>
              <th className="py-3 px-4">Slug URL</th>
              <th className="py-3 px-4">Récit / Description</th>
              <th className="py-3 px-4">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#242422]">
            {collections.map((col, idx) => (
              <tr key={col.id} className="hover:bg-[#1E1E1C] transition-colors">
                <td className="py-3.5 px-4 font-mono text-[#736B5E]">
                  0{idx + 1}
                </td>
                <td className="py-3.5 px-4 font-medium text-[#FAF8F5]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C5A880]" />
                    <span>{col.name}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono text-[#8C827A]">
                  /{col.slug}
                </td>
                <td className="py-3.5 px-4 text-[#9E9589] max-w-sm truncate">
                  {col.description || '—'}
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#6FCF97]">
                    <Check className="w-3 h-3" /> Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
