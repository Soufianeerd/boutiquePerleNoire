import { Metadata } from 'next';
import { getProducts } from '@/features/products/actions';
import { getStoreSettings } from '@/features/settings/actions';
import { Product, ProductVariant } from '@/types/database';
import { Boxes, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Gestion des Stocks & Inventaire | Perle Noire Admin',
};

export default async function AdminStocksPage() {
  const [products, settings] = await Promise.all([
    getProducts({ includeAllStatuses: true }),
    getStoreSettings(),
  ]);

  const stockRows = products.flatMap((p: Product) => {
    if (p.variants && p.variants.length > 0) {
      return p.variants.map((v: ProductVariant) => ({
        productName: p.name,
        variantTitle: v.title,
        sku: v.sku || p.sku || '—',
        stock: v.stock_quantity,
        status: p.status,
        low: v.stock_quantity <= settings.low_stock_threshold,
      }));
    }
    return [
      {
        productName: p.name,
        variantTitle: 'Pièce Atelier',
        sku: p.sku || '—',
        stock: p.status === 'unique_piece' ? 1 : 2,
        status: p.status,
        low: (p.status === 'unique_piece' ? 1 : 2) <= settings.low_stock_threshold,
      },
    ];
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-medium block mb-1">
          Inventaire & Disponibilités
        </span>
        <h1 className="font-editorial text-3xl text-[#FAF8F5]">
          Supervision des Stocks & Mouvements
        </h1>
        <p className="text-xs text-[#9E9589] mt-1">
          Surveillez les pièces disponibles, les seuils d’alerte (seuil actuel : {settings.low_stock_threshold} unités) et l’audit d’atelier.
        </p>
      </div>

      <div className="bg-[#181816] border border-[#282725] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#141414] text-[#8C827A] uppercase tracking-wider text-[10px] border-b border-[#282725]">
            <tr>
              <th className="py-3 px-4">Bijou Joaillier</th>
              <th className="py-3 px-4">Déclinaison / Taille</th>
              <th className="py-3 px-4">Référence SKU</th>
              <th className="py-3 px-4">Quantité en Stock</th>
              <th className="py-3 px-4">Alerte Seuil</th>
              <th className="py-3 px-4 text-right">Statut Pièce</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#242422]">
            {stockRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-[#1E1E1C] transition-colors">
                <td className="py-3.5 px-4 font-medium text-[#FAF8F5]">
                  <div className="flex items-center gap-2">
                    <Boxes className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>{row.productName}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-[#A89E90]">{row.variantTitle}</td>
                <td className="py-3.5 px-4 font-mono text-[#8C827A]">{row.sku}</td>
                <td className="py-3.5 px-4 font-mono font-medium text-sm text-[#FAF8F5]">
                  {row.stock} {row.stock > 1 ? 'unités' : 'unité'}
                </td>
                <td className="py-3.5 px-4">
                  {row.low ? (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#2B1F17] text-amber-400 border border-[#523A1E]">
                      <AlertTriangle className="w-3 h-3" /> Stock Faible
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase tracking-wider text-[#6FCF97]">
                      Optimal
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right text-[#8C827A] uppercase text-[10px]">
                  {row.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
