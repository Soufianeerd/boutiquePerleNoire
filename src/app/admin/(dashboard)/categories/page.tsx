import { Metadata } from 'next';
import { getCategories } from '@/features/products/actions';
import { FolderTree, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Gestion des Catégories | Perle Noire Admin',
};

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-medium block mb-1">
            Arborescence & Lignées Joaillières
          </span>
          <h1 className="font-editorial text-3xl text-[#FAF8F5]">
            Catégories de Bijoux
          </h1>
          <p className="text-xs text-[#9E9589] mt-1">
            Structurez vos familles de bijoux (Bagues, Colliers, Boucles, Bracelets, Haute Joaillerie).
          </p>
        </div>
        <Button variant="champagne" size="sm" className="flex items-center gap-2">
          <Plus className="w-3.5 h-3.5" />
          <span>Nouvelle Catégorie</span>
        </Button>
      </div>

      <div className="bg-[#181816] border border-[#282725] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#141414] text-[#8C827A] uppercase tracking-wider text-[10px] border-b border-[#282725]">
            <tr>
              <th className="py-3 px-4">Ordre</th>
              <th className="py-3 px-4">Nom de la Catégorie</th>
              <th className="py-3 px-4">Identifiant Slug</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#242422]">
            {categories.map((cat, idx) => (
              <tr key={cat.id} className="hover:bg-[#1E1E1C] transition-colors">
                <td className="py-3.5 px-4 font-mono text-[#736B5E]">
                  0{idx + 1}
                </td>
                <td className="py-3.5 px-4 font-medium text-[#FAF8F5]">
                  <div className="flex items-center gap-2">
                    <FolderTree className="w-4 h-4 text-[#C5A880]" />
                    <span>{cat.name}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono text-[#8C827A]">
                  /{cat.slug}
                </td>
                <td className="py-3.5 px-4 text-[#9E9589] max-w-xs truncate">
                  {cat.description || '—'}
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#6FCF97]">
                    <Check className="w-3 h-3" /> Actif
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
