import { Metadata } from 'next';
import { Image as ImageIcon, Upload, ShieldCheck, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Médiathèque & Fichiers | Perle Noire Admin',
};

export default function AdminMediasPage() {
  const mediaItems = [
    {
      name: 'solitaire-eclipse-noire-hd.webp',
      type: 'image/webp',
      size: '1.4 Mo',
      dimension: '2400 x 3000',
      date: '24 Septembre 2026',
      bucket: 'jewelry-media',
    },
    {
      name: 'pendentif-horizon-infini-angle1.webp',
      type: 'image/webp',
      size: '1.8 Mo',
      dimension: '2400 x 3000',
      date: '20 Septembre 2026',
      bucket: 'jewelry-media',
    },
    {
      name: 'bague-haute-joaillerie-vendome-7.webp',
      type: 'image/webp',
      size: '2.1 Mo',
      dimension: '3000 x 3750',
      date: '15 Septembre 2026',
      bucket: 'jewelry-media',
    },
    {
      name: 'boucles-constellation-studio.webp',
      type: 'image/webp',
      size: '1.2 Mo',
      dimension: '2400 x 3000',
      date: '10 Septembre 2026',
      bucket: 'jewelry-media',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-medium block mb-1">
            Actifs Visuels & Sécurité Supabase Storage
          </span>
          <h1 className="font-editorial text-3xl text-[#FAF8F5]">
            Médiathèque Haute Joaillerie
          </h1>
          <p className="text-xs text-[#9E9589] mt-1">
            Stockage sécurisé, vérification stricte des types MIME (JPEG, PNG, WebP, AVIF) et compression de luxe.
          </p>
        </div>
        <Button variant="champagne" size="sm" className="flex items-center gap-2">
          <Upload className="w-3.5 h-3.5" />
          <span>Téléverser un Média</span>
        </Button>
      </div>

      {/* Storage & Security Notice Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-[#181816] border border-[#282725] space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#C5A880]">
            <HardDrive className="w-4 h-4" />
            <span className="font-medium">Bucket Supabase Actif</span>
          </div>
          <span className="text-sm font-mono text-[#FAF8F5] block">jewelry-media</span>
          <span className="text-[10px] text-[#736B5E]">Stockage objet CDN sécurisé</span>
        </div>

        <div className="p-4 bg-[#181816] border border-[#282725] space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#6FCF97]">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-medium">Sécurité Validation MIME</span>
          </div>
          <span className="text-xs text-[#FAF8F5] block">image/jpeg, png, webp, avif</span>
          <span className="text-[10px] text-[#736B5E]">Taille maximale : 10 Mo par asset</span>
        </div>

        <div className="p-4 bg-[#181816] border border-[#282725] space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#C5A880]">
            <ImageIcon className="w-4 h-4" />
            <span className="font-medium">Optimisation Automatique</span>
          </div>
          <span className="text-xs text-[#FAF8F5] block">Cache CDN & Next/Image</span>
          <span className="text-[10px] text-[#736B5E]">Résolution haute fidélité</span>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {mediaItems.map((item, idx) => (
          <div
            key={idx}
            className="bg-[#181816] border border-[#282725] overflow-hidden flex flex-col justify-between"
          >
            <div className="aspect-4/3 bg-[#121212] flex items-center justify-center border-b border-[#282725] text-[#C5A880]">
              <ImageIcon className="w-8 h-8 opacity-60" />
            </div>
            <div className="p-3.5 space-y-1 text-xs">
              <span className="font-mono text-[11px] text-[#FAF8F5] truncate block">
                {item.name}
              </span>
              <div className="flex justify-between text-[10px] text-[#736B5E]">
                <span>{item.dimension}</span>
                <span>{item.size}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
