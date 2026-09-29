import React from 'react';
import Link from 'next/link';
import { getAdminDashboardStats } from '@/features/admin/actions';
import { ModeQuickToggle } from '@/components/admin/ModeQuickToggle';
import { DatabaseNotConfiguredBanner } from '@/components/admin/DatabaseNotConfiguredBanner';
import { EmptyState } from '@/components/admin/EmptyState';
import { formatPrice, formatDate } from '@/lib/utils';
import {
  Gem,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* DB Configuration Warning if Supabase is offline */}
      {!stats.isConfigured && (
        <DatabaseNotConfiguredBanner
          message="Supabase n’est pas configuré dans votre fichier .env.local. Les statistiques et données affichées reflètent uniquement les données réelles enregistrées en base PostgreSQL. Aucune donnée fictive n’est simulée."
        />
      )}

      {/* Mode Status & Controller Card */}
      <div className="bg-[#1C1C1A] border border-[#2D2D2A] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                stats.settings.commerce_enabled ? 'bg-[#27AE60] animate-pulse' : 'bg-[#C5A880]'
              }`}
            />
            <span className="text-[10px] uppercase tracking-widest text-[#9E9589] font-medium">
              Statut de la Boutique
            </span>
          </div>
          <h1 className="font-editorial text-2xl md:text-3xl text-[#FAF8F5] font-normal">
            {stats.settings.commerce_enabled
              ? 'Mode Vente en Ligne Actif'
              : 'Mode Vitrine de Présentation Actif'}
          </h1>
          <p className="text-xs text-[#9E9589] max-w-2xl leading-relaxed">
            {stats.settings.commerce_enabled
              ? 'Le panier et la commande sont ouverts. Vos clients peuvent ajouter des produits au panier et régler en ligne.'
              : 'Les produits sont présentés avec ou sans prix. Aucun achat direct en ligne : les visiteurs sont invités à prendre contact via vos canaux de conciergerie.'}
          </p>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
          <ModeQuickToggle initialCommerceEnabled={stats.settings.commerce_enabled} />
          <Link
            href="/admin/parametres"
            className="text-[11px] uppercase tracking-wider text-[#C5A880] hover:text-[#FAF8F5] underline underline-offset-4"
          >
            Tous les réglages
          </Link>
        </div>
      </div>

      {/* Real Supabase KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : Produits */}
        <div className="bg-[#181816] border border-[#282725] p-5 space-y-3">
          <div className="flex items-center justify-between text-[#8C827A]">
            <span className="text-[10px] uppercase tracking-widest font-medium">Produits au Catalogue</span>
            <Gem className="w-4 h-4 text-[#C5A880]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-editorial text-3xl text-[#FAF8F5]">{stats.totalProducts}</span>
            <span className="text-[11px] text-[#A08154]">
              {stats.publishedProducts} publié{stats.publishedProducts > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-[#222220] text-[10px] text-[#736B5E]">
            <span>{stats.draftProducts} brouillon(s)</span>
            <Link
              href="/admin/produits"
              className="text-[#C5A880] hover:text-[#FAF8F5] flex items-center gap-1 uppercase tracking-wider"
            >
              <span>Gérer</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* KPI 2 : Demandes Clients */}
        <div className="bg-[#181816] border border-[#282725] p-5 space-y-3">
          <div className="flex items-center justify-between text-[#8C827A]">
            <span className="text-[10px] uppercase tracking-widest font-medium">Demandes Clients</span>
            <Users className="w-4 h-4 text-[#C5A880]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-editorial text-3xl text-[#FAF8F5]">{stats.pendingRequestsCount}</span>
            <span className="text-[11px] text-[#C5A880]">En attente</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-[#222220] text-[10px] text-[#736B5E]">
            <span>Contact & Rendez-vous</span>
            <Link
              href="/admin/clients"
              className="text-[#C5A880] hover:text-[#FAF8F5] flex items-center gap-1 uppercase tracking-wider"
            >
              <span>Traiter</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* KPI 3 : Stocks Faibles */}
        <div className="bg-[#181816] border border-[#282725] p-5 space-y-3">
          <div className="flex items-center justify-between text-[#8C827A]">
            <span className="text-[10px] uppercase tracking-widest font-medium">Alertes Stock</span>
            <Boxes className="w-4 h-4 text-[#C5A880]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-editorial text-3xl text-[#FAF8F5]">{stats.lowStockCount}</span>
            <span className="text-[11px] text-amber-400">
              Seuil ≤ {stats.settings.low_stock_threshold}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-[#222220] text-[10px] text-[#736B5E]">
            <span>{stats.outOfStockProducts} en rupture</span>
            <Link
              href="/admin/stocks"
              className="text-[#C5A880] hover:text-[#FAF8F5] flex items-center gap-1 uppercase tracking-wider"
            >
              <span>Ajuster</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* KPI 4 : Commandes / Ventes */}
        <div className="bg-[#181816] border border-[#282725] p-5 space-y-3">
          <div className="flex items-center justify-between text-[#8C827A]">
            <span className="text-[10px] uppercase tracking-widest font-medium">Ventes En Ligne</span>
            <ShoppingBag className="w-4 h-4 text-[#C5A880]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-editorial text-3xl text-[#FAF8F5]">
              {formatPrice(stats.totalRevenue, stats.settings.currency)}
            </span>
            <span className="text-[11px] text-[#6FCF97]">
              {stats.totalOrdersCount} commande{stats.totalOrdersCount > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-[#222220] text-[10px] text-[#736B5E]">
            <span>Chiffre d’affaires réel</span>
            <Link
              href="/admin/commandes"
              className="text-[#C5A880] hover:text-[#FAF8F5] flex items-center gap-1 uppercase tracking-wider"
            >
              <span>Consulter</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Two-Column Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Derniers Produits & Alertes Stock (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section: Derniers Produits */}
          <div className="bg-[#181816] border border-[#282725] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#242422] pb-4">
              <div>
                <h2 className="text-sm font-medium text-[#FAF8F5] uppercase tracking-wider">
                  Derniers Produits Enregistrés
                </h2>
                <p className="text-xs text-[#736B5E]">
                  Les créations ajoutées récemment à la base de données
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/admin/produits/nouveau">
                  <Button variant="champagne" size="sm" className="flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nouveau Produit</span>
                  </Button>
                </Link>
              </div>
            </div>

            {stats.recentProducts.length === 0 ? (
              <EmptyState
                icon={Gem}
                title="Aucun produit en base"
                description="Votre catalogue est vide. Créez votre première fiche produit pour commencer."
                actionLabel="Ajouter un produit"
                actionHref="/admin/produits/nouveau"
              />
            ) : (
              <div className="divide-y divide-[#242422]">
                {stats.recentProducts.map((p) => (
                  <div
                    key={p.id}
                    className="py-3 flex items-center justify-between gap-4 hover:bg-[#1E1E1C] px-2 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-[#121212] border border-[#2D2D2A] shrink-0 flex items-center justify-center text-[#736B5E]">
                        <Gem className="w-4 h-4 text-[#C5A880]" />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/produits/${p.id}`}
                          className="text-xs font-medium text-[#FAF8F5] hover:text-[#C5A880] truncate block"
                        >
                          {p.name}
                        </Link>
                        <span className="text-[10px] text-[#736B5E] font-mono block">
                          SKU: {p.sku || '—'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-xs font-mono text-[#FAF8F5]">
                        {formatPrice(p.base_price, stats.settings.currency)}
                      </span>
                      <span
                        className={`text-[9px] uppercase tracking-wider px-2 py-0.5 border ${
                          p.status === 'published'
                            ? 'text-[#6FCF97] border-[#22442C] bg-[#16271C]'
                            : 'text-[#8C827A] border-[#333] bg-[#222]'
                        }`}
                      >
                        {p.status}
                      </span>
                      <Link
                        href={`/admin/produits/${p.id}`}
                        className="text-xs text-[#8C827A] hover:text-[#FAF8F5]"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Stocks Faibles */}
          <div className="bg-[#181816] border border-[#282725] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#242422] pb-4">
              <div>
                <h2 className="text-sm font-medium text-[#FAF8F5] uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Articles en Stock Faible ou Rupture</span>
                </h2>
                <p className="text-xs text-[#736B5E]">
                  Quantité inférieure ou égale au seuil ({stats.settings.low_stock_threshold} unités)
                </p>
              </div>
              <Link
                href="/admin/stocks"
                className="text-xs text-[#C5A880] hover:text-[#FAF8F5] uppercase tracking-wider flex items-center gap-1"
              >
                <span>Voir tout le stock</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {stats.lowStockItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6FCF97] bg-[#152319] border border-[#22442C] p-4">
                Tous les stocks sont au niveau optimal. Aucune rupture détectée.
              </div>
            ) : (
              <div className="divide-y divide-[#242422]">
                {stats.lowStockItems.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs text-[#FAF8F5] font-medium block">
                        {item.productName}
                      </span>
                      {item.variantTitle && (
                        <span className="text-[10px] text-[#A89E90]">
                          Variante: {item.variantTitle}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-mono font-medium px-2 py-0.5 ${
                          item.stock === 0
                            ? 'bg-red-950/80 text-red-300 border border-red-800'
                            : 'bg-amber-950/60 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {item.stock} en stock
                      </span>
                      <Link
                        href="/admin/stocks"
                        className="text-[11px] text-[#C5A880] hover:underline"
                      >
                        Réapprovisionner
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Demandes & Commandes Récentes (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          {/* Section: Dernières Demandes Clients */}
          <div className="bg-[#181816] border border-[#282725] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#242422] pb-4">
              <div>
                <h2 className="text-sm font-medium text-[#FAF8F5] uppercase tracking-wider">
                  Demandes Récentes
                </h2>
                <p className="text-[11px] text-[#736B5E]">Messages de contact & demandes</p>
              </div>
              <Link
                href="/admin/clients"
                className="text-[10px] text-[#C5A880] hover:underline uppercase tracking-wider"
              >
                Tout voir
              </Link>
            </div>

            {stats.recentRequests.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#736B5E]">
                Aucune demande client pour le moment.
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 bg-[#1D1D1B] border border-[#2A2926] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#FAF8F5]">{req.name}</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 bg-[#262624] text-[#C5A880]">
                        {req.preferred_channel}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9E9589] line-clamp-2 italic">
                      “{req.message}”
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[10px] text-[#736B5E]">
                      <span>{formatDate(req.created_at)}</span>
                      <Link
                        href="/admin/clients"
                        className="text-[#C5A880] hover:underline"
                      >
                        Répondre
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Dernières Commandes */}
          <div className="bg-[#181816] border border-[#282725] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#242422] pb-4">
              <div>
                <h2 className="text-sm font-medium text-[#FAF8F5] uppercase tracking-wider">
                  Dernières Ventes
                </h2>
                <p className="text-[11px] text-[#736B5E]">Commandes de la boutique</p>
              </div>
              <Link
                href="/admin/commandes"
                className="text-[10px] text-[#C5A880] hover:underline uppercase tracking-wider"
              >
                Tout voir
              </Link>
            </div>

            {stats.recentOrders.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#736B5E]">
                Aucune commande enregistrée.
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3 bg-[#1D1D1B] border border-[#2A2926] space-y-1"
                  >
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="text-[#FAF8F5] font-medium">{ord.order_number}</span>
                      <span className="text-[#C5A880]">
                        {formatPrice(ord.total_amount, ord.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#736B5E]">
                      <span>{ord.guest_name || 'Client invité'}</span>
                      <span className="uppercase text-[#6FCF97]">{ord.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
