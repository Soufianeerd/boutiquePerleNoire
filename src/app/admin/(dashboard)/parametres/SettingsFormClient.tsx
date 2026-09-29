'use client';

import React, { useState } from 'react';
import { StoreSettings } from '@/types/database';
import { updateStoreSettings } from '@/features/settings/actions';
import { Button } from '@/components/ui/Button';
import {
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Eye,
  Info,
} from 'lucide-react';

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
        message: 'Les paramètres ont été enregistrés avec succès dans la base de données.',
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

      {/* 1. SECTION : BASCULE MODE VITRINE VS E-COMMERCE */}
      <div className="space-y-4 border-b border-[#282725] pb-8">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-semibold block">
            Mode Opérationnel
          </span>
          <h2 className="font-editorial text-2xl text-[#FAF8F5]">
            Fonctionnement de la Boutique
          </h2>
          <p className="text-xs text-[#8C827A] mt-1">
            Basculez entre le mode vitrine de présentation et la vente en ligne en un clic.
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
                Mode Vitrine
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
              <li>• Produits visibles avec ou sans prix affiché</li>
              <li>• Panier et tunnel de paiement désactivés</li>
              <li>• Bouton d’action orienté vers la prise de contact</li>
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
                Mode Vente en Ligne
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
              <li>• Panier d’achat et commande actifs</li>
              <li>• Commande invité et règlement en ligne</li>
              <li>• Décompte automatique des stocks</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 2. IDENTITÉ */}
      <div className="space-y-6 border-b border-[#282725] pb-8">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-semibold block">
            Image de Marque
          </span>
          <h3 className="font-editorial text-xl text-[#FAF8F5]">
            Identité de la Boutique
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] font-medium mb-1.5">
              Nom de la Marque *
            </label>
            <input
              type="text"
              required
              value={settings.brand_name}
              onChange={(e) => setSettings({ ...settings, brand_name: e.target.value })}
              className="w-full bg-[#121212] border border-[#3E3D3A] px-3.5 py-2 text-xs text-[#FAF8F5] focus:border-[#C5A880] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] font-medium mb-1.5">
              Slogan / Tagline
            </label>
            <input
              type="text"
              value={settings.tagline || ''}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full bg-[#121212] border border-[#3E3D3A] px-3.5 py-2 text-xs text-[#FAF8F5] focus:border-[#C5A880] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] font-medium mb-1.5">
              URL du Logo
            </label>
            <input
              type="text"
              value={settings.logo_url || ''}
              onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
              placeholder="https://..."
              className="w-full bg-[#121212] border border-[#3E3D3A] px-3.5 py-2 text-xs text-[#FAF8F5] focus:border-[#C5A880] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. CONTACT */}
      <div className="space-y-6 border-b border-[#282725] pb-8">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-semibold block">
            Canaux & Conciergerie
          </span>
          <h3 className="font-editorial text-xl text-[#FAF8F5]">
            Coordonnées de Contact
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] font-medium mb-1.5">
              E-mail de Contact *
            </label>
            <input
              type="email"
              required
              value={settings.contact_email}
              onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
              className="w-full bg-[#121212] border border-[#3E3D3A] px-3.5 py-2 text-xs text-[#FAF8F5] focus:border-[#C5A880] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] font-medium mb-1.5">
              Téléphone
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
              Numéro WhatsApp
            </label>
            <input
              type="text"
              value={settings.whatsapp || ''}
              onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
              className="w-full bg-[#121212] border border-[#3E3D3A] px-3.5 py-2 text-xs text-[#FAF8F5] focus:border-[#C5A880] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] font-medium mb-1.5">
              URL Instagram
            </label>
            <input
              type="text"
              value={settings.instagram_url || ''}
              onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
              placeholder="https://instagram.com/..."
              className="w-full bg-[#121212] border border-[#3E3D3A] px-3.5 py-2 text-xs text-[#FAF8F5] focus:border-[#C5A880] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] font-medium mb-1.5">
              Adresse Physique de la Boutique
            </label>
            <input
              type="text"
              value={settings.address || ''}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full bg-[#121212] border border-[#3E3D3A] px-3.5 py-2 text-xs text-[#FAF8F5] focus:border-[#C5A880] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 4. MODES & EXPÉRIENCE */}
      <div className="space-y-6 border-b border-[#282725] pb-8">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-semibold block">
            Règles d’expérience client
          </span>
          <h3 className="font-editorial text-xl text-[#FAF8F5]">
            Affichage & Commandes
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start justify-between p-4 bg-[#141414] border border-[#262624]">
            <div className="space-y-1 pr-4">
              <span className="text-xs font-medium text-[#FAF8F5] block">
                Afficher les Prix Publics
              </span>
              <span className="text-[11px] text-[#8C827A] block font-light">
                Si désactivé, le libellé « Prix sur demande » apparaît sur tous les produits en vitrine.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.show_prices}
              onChange={(e) => setSettings({ ...settings, show_prices: e.target.checked })}
              className="mt-1 h-4 w-4 rounded accent-[#C5A880] cursor-pointer"
            />
          </div>

          <div className="flex items-start justify-between p-4 bg-[#141414] border border-[#262624]">
            <div className="space-y-1 pr-4">
              <span className="text-xs font-medium text-[#FAF8F5] block">
                Commande Invité Sans Compte
              </span>
              <span className="text-[11px] text-[#8C827A] block font-light">
                Permet d’acheter sans inscription obligatoire pour un parcours d’achat fluide.
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

        <div className="space-y-2">
          <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] font-medium">
            Canal de contact par défaut (Bouton d’action principal en mode vitrine)
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
            <option value="whatsapp">WhatsApp direct</option>
            <option value="phone">Téléphone direct</option>
            <option value="contact_form">Formulaire de contact</option>
            <option value="email">Courriel direct</option>
          </select>
        </div>
      </div>

      {/* 5. CONFIGURATION BOUTIQUE */}
      <div className="space-y-6 border-b border-[#282725] pb-8">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-semibold block">
            Paramètres Techniques de la Boutique
          </span>
          <h3 className="font-editorial text-xl text-[#FAF8F5]">
            Devise & Alertes de Stock
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] font-medium mb-1.5">
              Devise Principale
            </label>
            <input
              type="text"
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value.toUpperCase() })}
              placeholder="EUR"
              className="w-full bg-[#121212] border border-[#3E3D3A] px-3.5 py-2 text-xs text-[#FAF8F5] font-mono focus:border-[#C5A880] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] font-medium mb-1.5">
              Langue / Locale
            </label>
            <input
              type="text"
              value={settings.locale}
              onChange={(e) => setSettings({ ...settings, locale: e.target.value })}
              placeholder="fr-FR"
              className="w-full bg-[#121212] border border-[#3E3D3A] px-3.5 py-2 text-xs text-[#FAF8F5] font-mono focus:border-[#C5A880] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] font-medium mb-1.5">
              Seuil d’Alerte Stock Faible (unités)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={settings.low_stock_threshold}
              onChange={(e) =>
                setSettings({ ...settings, low_stock_threshold: parseInt(e.target.value, 10) || 0 })
              }
              className="w-full bg-[#121212] border border-[#3E3D3A] px-3.5 py-2 text-xs text-[#FAF8F5] font-mono focus:border-[#C5A880] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 6. PASSERELLES DE PAIEMENT */}
      <div className="space-y-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-semibold block">
            Paiements en Ligne
          </span>
          <h3 className="font-editorial text-xl text-[#FAF8F5]">
            Passerelles Bancaires
          </h3>
        </div>

        <div className="p-4 bg-[#191917] border border-[#3E3D3A] text-xs text-[#9E9589] flex items-start gap-3">
          <Info className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#FAF8F5]">Configuration technique requise :</strong> l’activation de ces passerelles nécessite les clés d’API secrètes et publiques configurées dans votre environnement de production (ex: <code className="text-[#C5A880]">STRIPE_SECRET_KEY</code>). En mode développement, les toggles reflètent vos préférences d’activation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-[#141414] border border-[#262624]">
            <div className="space-y-1">
              <span className="text-xs font-medium text-[#FAF8F5] block">
                Paiement Stripe (Cartes Bancaires)
              </span>
              <span className="text-[10px] text-[#8C827A] block">
                Visa, Mastercard, American Express, Apple Pay
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.stripe_enabled}
              onChange={(e) => setSettings({ ...settings, stripe_enabled: e.target.checked })}
              className="h-4 w-4 rounded accent-[#C5A880] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#141414] border border-[#262624]">
            <div className="space-y-1">
              <span className="text-xs font-medium text-[#FAF8F5] block">
                Paiement PayPal
              </span>
              <span className="text-[10px] text-[#8C827A] block">
                Compte PayPal et paiement 4x
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.paypal_enabled}
              onChange={(e) => setSettings({ ...settings, paypal_enabled: e.target.checked })}
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
