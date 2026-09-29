'use client';

import React, { useState } from 'react';
import { StoreSettings } from '@/types/database';
import { updateStoreSettings } from '@/features/settings/actions';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, AlertCircle, ShoppingBag, Eye } from 'lucide-react';

interface SettingsFormClientProps {
  initialSettings: StoreSettings;
}

export function SettingsFormClient({ initialSettings }: SettingsFormClientProps) {
  const [settings, setSettings] = useState<StoreSettings>(initialSettings);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const res = await updateStoreSettings(settings);
    setLoading(false);

    if (res.success && res.settings) {
      setSettings(res.settings);
      document.cookie = `pn_vitrine_mode=${!res.settings.commerce_enabled}; path=/; max-age=31536000`;
      setStatus({
        type: 'success',
        message: 'Les paramètres de la bijouterie ont été appliqués avec succès.',
      });
    } else {
      setStatus({
        type: 'error',
        message: res.error || 'Erreur lors de l’enregistrement.',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {status && (
        <div
          className={`p-4 border text-xs flex items-center gap-2.5 ${
            status.type === 'success'
              ? 'bg-[#19271E] border-[#294B33] text-[#6FCF97]'
              : 'bg-[#2B1B1B] border-[#552727] text-red-400'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      {/* 1. SECTION CENTRALE : BASCULE MODE VITRINE VS E-COMMERCE */}
      <div className="space-y-4 border-b border-[#282725] pb-8">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-semibold block">
            Choix Opérationnel Central
          </span>
          <h2 className="font-editorial text-2xl text-[#FAF8F5]">
            Mode de Fonctionnement de la Boutique
          </h2>
          <p className="text-xs text-[#8C827A] mt-1">
            Basculez entre le mode d’exposition vitrine et la vente en ligne en un clic, sans aucune modification de code.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Option Mode Vitrine */}
          <div
            onClick={() => setSettings({ ...settings, commerce_enabled: false })}
            className={`p-5 border cursor-pointer transition-all ${
              !settings.commerce_enabled
                ? 'bg-[#22201C] border-[#C5A880] text-[#FAF8F5]'
                : 'bg-[#181816] border-[#2E2C29] text-[#736B5E] hover:border-[#3E3D3A]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-2 font-medium text-sm text-[#FAF8F5]">
                <Eye className="w-4 h-4 text-[#C5A880]" />
                Mode Vitrine (Actuel)
              </span>
              <span
                className={`w-3.5 h-3.5 rounded-full border ${
                  !settings.commerce_enabled
                    ? 'bg-[#C5A880] border-[#C5A880]'
                    : 'border-[#3E3D3A]'
                }`}
              />
            </div>
            <ul className="text-xs space-y-1.5 text-[#9E9589] font-light">
              <li>• Bijoux visibles avec ou sans prix affiché</li>
              <li>• Panier et tunnel de paiement désactivés</li>
              <li>• CTA produit orienté vers la conciergerie</li>
              <li>• Idéal pour salons privés, présentations exclusives</li>
            </ul>
          </div>

          {/* Option Mode E-Commerce */}
          <div
            onClick={() => setSettings({ ...settings, commerce_enabled: true })}
            className={`p-5 border cursor-pointer transition-all ${
              settings.commerce_enabled
                ? 'bg-[#1B271F] border-[#27AE60] text-[#FAF8F5]'
                : 'bg-[#181816] border-[#2E2C29] text-[#736B5E] hover:border-[#3E3D3A]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-2 font-medium text-sm text-[#FAF8F5]">
                <ShoppingBag className="w-4 h-4 text-[#27AE60]" />
                Mode E-Commerce Complet
              </span>
              <span
                className={`w-3.5 h-3.5 rounded-full border ${
                  settings.commerce_enabled
                    ? 'bg-[#27AE60] border-[#27AE60]'
                    : 'border-[#3E3D3A]'
                }`}
              />
            </div>
            <ul className="text-xs space-y-1.5 text-[#9E9589] font-light">
              <li>• Panier d’achat actif</li>
              <li>• Checkout invité et paiements en ligne</li>
              <li>• Gestion dynamique des stocks</li>
              <li>• E-mails transactionnels automatisés</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 2. OPTIONS DE COMMERCE & AFFICHAGE */}
      <div className="space-y-6 border-b border-[#282725] pb-8">
        <h3 className="font-editorial text-xl text-[#FAF8F5]">
          Règles d’Affichage & Expérience Client
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Afficher les prix */}
          <div className="flex items-start justify-between p-4 bg-[#141414] border border-[#262624]">
            <div className="space-y-1 pr-4">
              <span className="text-xs font-medium text-[#FAF8F5] block">
                Afficher les Prix Publics
              </span>
              <span className="text-[11px] text-[#8C827A] block font-light">
                Si désactivé, le libellé « Prix sur demande » est affiché sur toutes les pièces en vitrine.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.show_prices}
              onChange={(e) => setSettings({ ...settings, show_prices: e.target.checked })}
              className="mt-1 h-4 w-4 rounded accent-[#C5A880] cursor-pointer"
            />
          </div>

          {/* Checkout invité */}
          <div className="flex items-start justify-between p-4 bg-[#141414] border border-[#262624]">
            <div className="space-y-1 pr-4">
              <span className="text-xs font-medium text-[#FAF8F5] block">
                Commande Invité Sans Compte
              </span>
              <span className="text-[11px] text-[#8C827A] block font-light">
                Permet d’acheter sans inscription obligatoire pour un parcours d’achat fluide et discret.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.allow_guest_checkout}
              onChange={(e) => setSettings({ ...settings, allow_guest_checkout: e.target.checked })}
              className="mt-1 h-4 w-4 rounded accent-[#C5A880] cursor-pointer"
            />
          </div>
        </div>

        {/* Canal de contact par défaut */}
        <div className="space-y-2">
          <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] font-medium">
            Canal de contact par défaut (Bouton CTA principal en mode vitrine)
          </label>
          <select
            value={settings.default_contact_method}
            onChange={(e) =>
              setSettings({
                ...settings,
                default_contact_method: e.target.value as StoreSettings['default_contact_method'],
              })
            }
            className="w-full bg-[#121212] border border-[#3E3D3A] px-3.5 py-2.5 text-xs text-[#FAF8F5] focus:border-[#C5A880] focus:outline-none"
          >
            <option value="whatsapp">WhatsApp Joaillerie direct</option>
            <option value="phone">Téléphone direct de l’Atelier</option>
            <option value="contact_form">Formulaire de correspondance privée</option>
            <option value="email">Courriel direct</option>
          </select>
        </div>
      </div>

      {/* 3. COORDONNÉES DE LA MAISON */}
      <div className="space-y-6 border-b border-[#282725] pb-8">
        <h3 className="font-editorial text-xl text-[#FAF8F5]">
          Identité & Coordonnées Officielles
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] font-medium mb-1.5">
              Nom de la Maison
            </label>
            <input
              type="text"
              value={settings.brand_name}
              onChange={(e) => setSettings({ ...settings, brand_name: e.target.value })}
              className="w-full bg-[#121212] border border-[#3E3D3A] px-3.5 py-2 text-xs text-[#FAF8F5] focus:border-[#C5A880] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] font-medium mb-1.5">
              Courriel de Conciergerie
            </label>
            <input
              type="email"
              value={settings.contact_email}
              onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
              className="w-full bg-[#121212] border border-[#3E3D3A] px-3.5 py-2 text-xs text-[#FAF8F5] focus:border-[#C5A880] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] font-medium mb-1.5">
              Numéro Téléphonique Salon
            </label>
            <input
              type="text"
              value={settings.phone || ''}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="w-full bg-[#121212] border border-[#3E3D3A] px-3.5 py-2 text-xs text-[#FAF8F5] focus:border-[#C5A880] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] font-medium mb-1.5">
              Numéro WhatsApp Concierge
            </label>
            <input
              type="text"
              value={settings.whatsapp || ''}
              onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
              className="w-full bg-[#121212] border border-[#3E3D3A] px-3.5 py-2 text-xs text-[#FAF8F5] focus:border-[#C5A880] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] font-medium mb-1.5">
            Adresse Physique des Salons
          </label>
          <input
            type="text"
            value={settings.address || ''}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            className="w-full bg-[#121212] border border-[#3E3D3A] px-3.5 py-2 text-xs text-[#FAF8F5] focus:border-[#C5A880] focus:outline-none"
          />
        </div>
      </div>

      {/* 4. SEUILS & PAIEMENTS */}
      <div className="space-y-6">
        <h3 className="font-editorial text-xl text-[#FAF8F5]">
          Seuils d’Inventaire & Maintenance
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] font-medium mb-1.5">
              Seuil d’alerte stock faible (unités)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={settings.low_stock_threshold}
              onChange={(e) =>
                setSettings({ ...settings, low_stock_threshold: parseInt(e.target.value) || 0 })
              }
              className="w-full bg-[#121212] border border-[#3E3D3A] px-3.5 py-2 text-xs text-[#FAF8F5] focus:border-[#C5A880] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-[#141414] border border-[#262624]">
            <div>
              <span className="text-xs font-medium text-[#FAF8F5] block">Mode Maintenance</span>
              <span className="text-[10px] text-[#8C827A] block">Ferme temporairement l’accès public</span>
            </div>
            <input
              type="checkbox"
              checked={settings.maintenance_mode}
              onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
              className="h-4 w-4 rounded accent-[#C5A880] cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" variant="champagne" size="lg" disabled={loading}>
          {loading ? 'Application...' : 'Enregistrer les Modifications'}
        </Button>
      </div>
    </form>
  );
}
