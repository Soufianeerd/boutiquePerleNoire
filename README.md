# boutiquePerleNoire

Plateforme de Haute Joaillerie contemporaine — Maison Perle Noire (Place Vendôme, Paris).

## Architecture & Fonctionnalités

- **Storefront Client Luxe** :
  - **Mode Vitrine** : Présentation éditoriale sans panier, prix configurables (visibles ou sur demande), prise de rendez-vous en salon privé et conciergerie (WhatsApp direct, appel atelier, formulaire).
  - **Mode E-Commerce** : Panier actif, checkout invité confidentiel sans compte obligatoire, paiement Stripe prêt et emails transactionnels Resend.
  - **Bascule sans modification de code** : Configuration centralisée pilotable depuis l'espace d'administration.
  - **Mode de vente par produit (`sell_mode`)** : *inherit*, *online*, *contact_only*.

- **Administration Sécurisée (`/admin`)** :
  - Authentification et protection des routes
  - Bascule instantanée du mode de la boutique
  - Gestion des bijoux, catégories, collections, stocks et seuils d'alerte
  - Médiathèque avec validation stricte des formats MIME
  - Suivi des commandes et des demandes de rendez-vous en salon
  - Gestion modulaire des sections de la page d'accueil sans code

## Stack Technique

- **Framework** : Next.js 16 (App Router) & React 19
- **Langage** : TypeScript (mode strict)
- **Styling** : Tailwind CSS v4 & Cormorant Garamond / Geist
- **Base de données** : Supabase PostgreSQL avec migrations SQL et RLS
- **Validation** : Zod
- **Paiements** : Stripe (scaffold & webhooks)
- **E-mails** : Resend

## Installation & Démarrage

1. Installer les dépendances :
```bash
npm install
```

2. Configurer les variables d'environnement :
Copier `.env.example` vers `.env.local` et renseigner vos identifiants Supabase et Stripe.

3. Lancer le serveur de développement :
```bash
npm run dev
```
Accéder au storefront sur [http://localhost:3000](http://localhost:3000) et à l'administration sur [http://localhost:3000/admin](http://localhost:3000/admin).

4. Exécuter les vérifications :
```bash
npm run lint
npx tsc --noEmit
npm run build
```
