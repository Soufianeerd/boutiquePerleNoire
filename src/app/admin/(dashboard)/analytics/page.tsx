import { Metadata } from 'next';
import { BarChart3, TrendingUp, Users, ShoppingBag } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Statistiques & Performance Joaillière | Perle Noire Admin',
};

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-medium block mb-1">
          Performances & Mesures d’Audience
        </span>
        <h1 className="font-editorial text-3xl text-[#FAF8F5]">
          Statistiques de Fréquentation & Intérêt Client
        </h1>
        <p className="text-xs text-[#9E9589] mt-1">
          Analysez le taux de consultation en vitrine, le volume de prises de rendez-vous et les conversions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[#181816] border border-[#282725] space-y-2">
          <div className="flex items-center justify-between text-[#8C827A] text-[10px] uppercase tracking-widest">
            <span>Visites Vitrine</span>
            <Users className="w-4 h-4 text-[#C5A880]" />
          </div>
          <span className="font-editorial text-3xl text-[#FAF8F5] block">1 840</span>
          <span className="text-[10px] text-[#6FCF97] flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +14% ce mois
          </span>
        </div>

        <div className="p-5 bg-[#181816] border border-[#282725] space-y-2">
          <div className="flex items-center justify-between text-[#8C827A] text-[10px] uppercase tracking-widest">
            <span>Taux de Contact</span>
            <BarChart3 className="w-4 h-4 text-[#C5A880]" />
          </div>
          <span className="font-editorial text-3xl text-[#FAF8F5] block">4.8 %</span>
          <span className="text-[10px] text-[#A08154]">Haute Joaillerie</span>
        </div>

        <div className="p-5 bg-[#181816] border border-[#282725] space-y-2">
          <div className="flex items-center justify-between text-[#8C827A] text-[10px] uppercase tracking-widest">
            <span>Canal Préféré</span>
            <span className="text-[10px] text-[#C5A880] font-medium">WhatsApp</span>
          </div>
          <span className="font-editorial text-3xl text-[#FAF8F5] block">62 %</span>
          <span className="text-[10px] text-[#8C827A]">Prise de contact directe</span>
        </div>

        <div className="p-5 bg-[#181816] border border-[#282725] space-y-2">
          <div className="flex items-center justify-between text-[#8C827A] text-[10px] uppercase tracking-widest">
            <span>Panier Moyen</span>
            <ShoppingBag className="w-4 h-4 text-[#C5A880]" />
          </div>
          <span className="font-editorial text-3xl text-[#FAF8F5] block">4 200 €</span>
          <span className="text-[10px] text-[#6FCF97]">Acquisitions privées</span>
        </div>
      </div>

      <div className="p-6 bg-[#181816] border border-[#282725] space-y-4">
        <h3 className="font-editorial text-xl text-[#FAF8F5]">
          Répartition des Demandes par Canal Joaillier
        </h3>
        <div className="space-y-3 pt-2">
          <div>
            <div className="flex justify-between text-xs text-[#9E9589] mb-1">
              <span>WhatsApp Concierge Direct</span>
              <span className="font-mono text-[#FAF8F5]">62%</span>
            </div>
            <div className="w-full h-2 bg-[#242422]">
              <div className="h-full bg-[#C5A880]" style={{ width: '62%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-[#9E9589] mb-1">
              <span>Rendez-vous Salons Place Vendôme (Formulaire)</span>
              <span className="font-mono text-[#FAF8F5]">26%</span>
            </div>
            <div className="w-full h-2 bg-[#242422]">
              <div className="h-full bg-[#A08154]" style={{ width: '26%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-[#9E9589] mb-1">
              <span>Ligne Téléphonique Directe</span>
              <span className="font-mono text-[#FAF8F5]">12%</span>
            </div>
            <div className="w-full h-2 bg-[#242422]">
              <div className="h-full bg-[#736B5E]" style={{ width: '12%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
