import React from 'react';
import Link from 'next/link';
import { getStoreSettings } from '@/features/settings/actions';
import { getProducts } from '@/features/products/actions';
import { initialOrders, initialContactRequests } from '@/lib/data/mock-data';
import { ModeQuickToggle } from '@/components/admin/ModeQuickToggle';
import { formatPrice, formatDate } from '@/lib/utils';
import {
  Gem,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Phone,
  MessageSquare,
} from 'lucide-react';

export default async function AdminDashboardPage() {
  const [settings, products] = await Promise.all([
    getStoreSettings(),
    getProducts({ includeAllStatuses: true }),
  ]);

  const orders = initialOrders;
  const inquiries = initialContactRequests;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Central Mode Indicator & Controller Card */}
      <div className="bg-[#1C1C1A] border border-[#2D2D2A] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                settings.commerce_enabled ? 'bg-[#27AE60] animate-pulse' : 'bg-[#C5A880]'
              }`}
            />
            <span className="text-[10px] uppercase tracking-widest text-[#9E9589] font-medium">
              Statut Opérationnel de la Plateforme
            </span>
          </div>
          <h1 className="font-editorial text-2xl md:text-3xl text-[#FAF8F5] font-normal">
            {settings.commerce_enabled
              ? 'Mode E-Commerce Actif'
              : 'Mode Vitrine de Présentation Actif'}
          </h1>
          <p className="text-xs text-[#9E9589] max-w-2xl leading-relaxed">
            {settings.commerce_enabled
              ? 'Le panier et le checkout invité sont ouverts. Vos clients peuvent ajouter des bijoux au panier et procéder au règlement en ligne.'
              : 'Les bijoux sont visibles avec ou sans prix. Aucun achat en ligne : le panier et le tunnel de paiement sont inaccessibles. Les clients sont orientés vers la conciergerie (WhatsApp, Téléphone, Salon privé).'}
          </p>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
          <ModeQuickToggle initialCommerceEnabled={settings.commerce_enabled} />
          <Link
            href="/admin/parametres"
            className="text-[11px] uppercase tracking-wider text-[#C5A880] hover:text-[#FAF8F5] underline underline-offset-4"
          >
            Tous les réglages
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-[#181816] border border-[#282725] p-5 space-y-3">
          <div className="flex items-center justify-between text-[#8C827A]">
            <span className="text-[10px] uppercase tracking-widest">Créations Catalogue</span>
            <Gem className="w-4 h-4 text-[#C5A880]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-editorial text-3xl text-[#FAF8F5]">{products.length}</span>
            <span className="text-[11px] text-[#A08154]">Haute Joaillerie</span>
          </div>
          <Link
            href="/admin/produits"
            className="text-[10px] uppercase tracking-wider text-[#8C827A] hover:text-[#FAF8F5] flex items-center gap-1"
          >
            <span>Gérer les bijoux</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* KPI 2 */}
        <div className="bg-[#181816] border border-[#282725] p-5 space-y-3">
          <div className="flex items-center justify-between text-[#8C827A]">
            <span className="text-[10px] uppercase tracking-widest">Demandes Privées</span>
            <Users className="w-4 h-4 text-[#C5A880]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-editorial text-3xl text-[#FAF8F5]">{inquiries.length}</span>
            <span className="text-[11px] text-[#C5A880]">En attente</span>
          </div>
          <Link
            href="/admin/clients"
            className="text-[10px] uppercase tracking-wider text-[#8C827A] hover:text-[#FAF8F5] flex items-center gap-1"
          >
            <span>Traiter les demandes</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* KPI 3 */}
        <div className="bg-[#181816] border border-[#282725] p-5 space-y-3">
          <div className="flex items-center justify-between text-[#8C827A]">
            <span className="text-[10px] uppercase tracking-widest">Commandes Reçues</span>
            <ShoppingBag className="w-4 h-4 text-[#C5A880]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-editorial text-3xl text-[#FAF8F5]">{orders.length}</span>
            <span className="text-[11px] text-[#8C827A]">Historique</span>
          </div>
          <Link
            href="/admin/commandes"
            className="text-[10px] uppercase tracking-wider text-[#8C827A] hover:text-[#FAF8F5] flex items-center gap-1"
          >
            <span>Voir les commandes</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* KPI 4 */}
        <div className="bg-[#181816] border border-[#282725] p-5 space-y-3">
          <div className="flex items-center justify-between text-[#8C827A]">
            <span className="text-[10px] uppercase tracking-widest">Seuil de Stock</span>
            <AlertTriangle className="w-4 h-4 text-[#C5A880]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-editorial text-3xl text-[#FAF8F5]">1</span>
            <span className="text-[11px] text-amber-500">Pièce unique</span>
          </div>
          <Link
            href="/admin/stocks"
            className="text-[10px] uppercase tracking-wider text-[#8C827A] hover:text-[#FAF8F5] flex items-center gap-1"
          >
            <span>Superviser l’inventaire</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Two Column Layout: Inquiries & Latest Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Pending Inquiries & Appointments */}
        <div className="lg:col-span-7 bg-[#181816] border border-[#282725] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#282725] pb-3">
            <div>
              <h2 className="font-editorial text-xl text-[#FAF8F5]">
                Dernières Demandes Privées & Salons
              </h2>
              <p className="text-[11px] text-[#8C827A]">
                Réservations de rendez-vous et questions sur les pièces
              </p>
            </div>
            <Link
              href="/admin/clients"
              className="text-[10px] uppercase tracking-widest text-[#C5A880] hover:text-[#FAF8F5]"
            >
              Voir tout
            </Link>
          </div>

          <div className="divide-y divide-[#242422]">
            {inquiries.map((req) => (
              <div key={req.id} className="py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[#FAF8F5]">{req.name}</span>
                    <span className="text-[10px] text-[#8C827A]">({req.email})</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 border border-[#3E3D3A] text-[#C5A880]">
                    {req.preferred_channel}
                  </span>
                </div>

                {req.product && (
                  <div className="text-[11px] text-[#A08154] flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    <span>Intérêt pour : {req.product.name}</span>
                  </div>
                )}

                <p className="text-xs text-[#9E9589] line-clamp-2 italic">
                  “{req.message}”
                </p>

                <div className="flex items-center justify-between pt-1 text-[10px] text-[#736B5E]">
                  <span>Reçu {formatDate(req.created_at)}</span>
                  <div className="flex items-center gap-3">
                    {req.phone && (
                      <a
                        href={`tel:${req.phone}`}
                        className="text-[#C5A880] hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" /> Appeler
                      </a>
                    )}
                    {req.preferred_channel === 'whatsapp' && req.phone && (
                      <a
                        href={`https://wa.me/${req.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#C5A880] hover:underline flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" /> WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Orders & Mode Overview */}
        <div className="lg:col-span-5 bg-[#181816] border border-[#282725] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#282725] pb-3">
            <div>
              <h2 className="font-editorial text-xl text-[#FAF8F5]">
                Dernières Commandes
              </h2>
              <p className="text-[11px] text-[#8C827A]">
                Tunnel d’achat e-commerce
              </p>
            </div>
            <Link
              href="/admin/commandes"
              className="text-[10px] uppercase tracking-widest text-[#C5A880] hover:text-[#FAF8F5]"
            >
              Détails
            </Link>
          </div>

          <div className="divide-y divide-[#242422]">
            {orders.map((ord) => (
              <div key={ord.id} className="py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#FAF8F5]">
                    {ord.order_number}
                  </span>
                  <span className="font-editorial text-sm text-[#C5A880]">
                    {formatPrice(ord.total_amount, ord.currency)}
                  </span>
                </div>

                <div className="text-xs text-[#8C827A] flex items-center justify-between">
                  <span>{ord.guest_name}</span>
                  <span className="text-[10px] uppercase tracking-wider text-[#6FCF97]">
                    {ord.status}
                  </span>
                </div>

                <div className="text-[10px] text-[#736B5E]">
                  <span>{formatDate(ord.created_at)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#282725] space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-[#8C827A] block">
              Rappel d’Architecture :
            </span>
            <p className="text-xs text-[#9E9589] leading-relaxed">
              Le passage du mode vitrine au mode e-commerce est instantané et répercuté automatiquement sur le panier, le header et les fiches bijoux.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
