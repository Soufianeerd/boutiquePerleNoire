import { Metadata } from 'next';
import { getAdminDashboardStats } from '@/features/admin/actions';
import { getContactRequestsAdmin } from '@/features/contact/actions';
import { DatabaseNotConfiguredBanner } from '@/components/admin/DatabaseNotConfiguredBanner';
import { formatPrice } from '@/lib/utils';
import { BarChart3, Users, ShoppingBag, Gem } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Statistiques & Performance | Perle Noire Admin',
};

export default async function AdminAnalyticsPage() {
  const [stats, requestsData] = await Promise.all([
    getAdminDashboardStats(),
    getContactRequestsAdmin(),
  ]);

  const requests = requestsData.requests || [];
  const totalRequests = requests.length;

  const whatsappCount = requests.filter((r) => r.preferred_channel === 'whatsapp').length;
  const formCount = requests.filter((r) => r.preferred_channel === 'contact_form').length;
  const phoneCount = requests.filter((r) => r.preferred_channel === 'phone').length;
  const emailCount = requests.filter((r) => r.preferred_channel === 'email').length;

  const whatsappPct = totalRequests > 0 ? Math.round((whatsappCount / totalRequests) * 100) : 0;
  const formPct = totalRequests > 0 ? Math.round((formCount / totalRequests) * 100) : 0;
  const phonePct = totalRequests > 0 ? Math.round((phoneCount / totalRequests) * 100) : 0;
  const emailPct = totalRequests > 0 ? Math.round((emailCount / totalRequests) * 100) : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {!stats.isConfigured && (
        <DatabaseNotConfiguredBanner message="Supabase n’est pas configuré. Les statistiques affichées proviennent exclusivement de vos données réelles." />
      )}

      <div>
        <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-medium block mb-1">
          Performances & Mesures Réelles
        </span>
        <h1 className="font-editorial text-3xl text-[#FAF8F5]">
          Statistiques de l’Activité
        </h1>
        <p className="text-xs text-[#9E9589] mt-1">
          Mesures basées sur vos produits enregistrés, vos commandes en ligne réelles et vos demandes clients.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[#181816] border border-[#282725] space-y-2">
          <div className="flex items-center justify-between text-[#8C827A] text-[10px] uppercase tracking-widest">
            <span>Produits au Catalogue</span>
            <Gem className="w-4 h-4 text-[#C5A880]" />
          </div>
          <span className="font-editorial text-3xl text-[#FAF8F5] block">
            {stats.totalProducts}
          </span>
          <span className="text-[10px] text-[#A08154]">
            {stats.publishedProducts} en ligne
          </span>
        </div>

        <div className="p-5 bg-[#181816] border border-[#282725] space-y-2">
          <div className="flex items-center justify-between text-[#8C827A] text-[10px] uppercase tracking-widest">
            <span>Demandes Clients</span>
            <Users className="w-4 h-4 text-[#C5A880]" />
          </div>
          <span className="font-editorial text-3xl text-[#FAF8F5] block">
            {totalRequests}
          </span>
          <span className="text-[10px] text-[#C5A880]">
            {stats.pendingRequestsCount} en attente de réponse
          </span>
        </div>

        <div className="p-5 bg-[#181816] border border-[#282725] space-y-2">
          <div className="flex items-center justify-between text-[#8C827A] text-[10px] uppercase tracking-widest">
            <span>Commandes Payées</span>
            <ShoppingBag className="w-4 h-4 text-[#C5A880]" />
          </div>
          <span className="font-editorial text-3xl text-[#FAF8F5] block">
            {stats.totalOrdersCount}
          </span>
          <span className="text-[10px] text-[#6FCF97]">
            Ventes e-commerce
          </span>
        </div>

        <div className="p-5 bg-[#181816] border border-[#282725] space-y-2">
          <div className="flex items-center justify-between text-[#8C827A] text-[10px] uppercase tracking-widest">
            <span>Chiffre d’Affaires Réel</span>
            <BarChart3 className="w-4 h-4 text-[#C5A880]" />
          </div>
          <span className="font-editorial text-3xl text-[#FAF8F5] block">
            {formatPrice(stats.totalRevenue, stats.settings.currency)}
          </span>
          <span className="text-[10px] text-[#736B5E]">
            Règlements validés
          </span>
        </div>
      </div>

      {/* Real Channel Distribution */}
      <div className="p-6 bg-[#181816] border border-[#282725] space-y-4">
        <h3 className="font-editorial text-xl text-[#FAF8F5]">
          Répartition Réelle des Demandes par Canal
        </h3>
        {totalRequests === 0 ? (
          <p className="text-xs text-[#736B5E] py-4">
            Aucune demande client enregistrée pour l’instant. La répartition par canal apparaîtra dès que des messages parviendront à la boutique.
          </p>
        ) : (
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs text-[#9E9589] mb-1">
                <span>WhatsApp ({whatsappCount} demande{whatsappCount > 1 ? 's' : ''})</span>
                <span className="font-mono text-[#FAF8F5]">{whatsappPct}%</span>
              </div>
              <div className="w-full h-2 bg-[#242422]">
                <div className="h-full bg-[#25D366]" style={{ width: `${whatsappPct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-[#9E9589] mb-1">
                <span>Formulaire de contact ({formCount} demande{formCount > 1 ? 's' : ''})</span>
                <span className="font-mono text-[#FAF8F5]">{formPct}%</span>
              </div>
              <div className="w-full h-2 bg-[#242422]">
                <div className="h-full bg-[#C5A880]" style={{ width: `${formPct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-[#9E9589] mb-1">
                <span>Téléphone ({phoneCount} demande{phoneCount > 1 ? 's' : ''})</span>
                <span className="font-mono text-[#FAF8F5]">{phonePct}%</span>
              </div>
              <div className="w-full h-2 bg-[#242422]">
                <div className="h-full bg-[#A08154]" style={{ width: `${phonePct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-[#9E9589] mb-1">
                <span>E-mail direct ({emailCount} demande{emailCount > 1 ? 's' : ''})</span>
                <span className="font-mono text-[#FAF8F5]">{emailPct}%</span>
              </div>
              <div className="w-full h-2 bg-[#242422]">
                <div className="h-full bg-[#736B5E]" style={{ width: `${emailPct}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
