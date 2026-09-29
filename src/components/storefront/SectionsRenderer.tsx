'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HomepageSection,
  Product,
  Category,
  Collection,
  StoreSettings,
} from '@/types/database';
import { ProductCard } from './ProductCard';
import { LuxuryImage } from './LuxuryImage';
import { ShieldCheck, Truck, RotateCcw, Headphones, ArrowRight, Check } from 'lucide-react';

interface SectionsRendererProps {
  sections: HomepageSection[];
  products: Product[];
  categories: Category[];
  collections?: Collection[];
  settings: StoreSettings;
}

export function SectionsRenderer({
  sections,
  products,
  categories,
  collections = [],
  settings,
}: SectionsRendererProps) {
  // Find custom configured sections from database / mock-data
  const heroSection = sections.find((s) => s.section_type === 'hero');
  const categoriesSection = sections.find((s) => s.section_type === 'categories');
  const featuredSection = sections.find((s) => s.section_type === 'featured_products');
  const editorialSection = sections.find((s) => s.section_type === 'editorial');
  const reassuranceSection = sections.find((s) => s.section_type === 'reassurance');

  // Featured / Bestseller products: 4 pieces
  const bestsellers = products.filter((p) => p.featured).slice(0, 4);
  const bestsellerList = bestsellers.length >= 2 ? bestsellers : products.slice(0, 4);

  // New arrivals: 4 recent pieces
  const newArrivals = [...products]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-24 sm:space-y-36">
      {/* 1. HERO SECTION */}
      <HeroSection section={heroSection} />

      {/* 2. CATEGORIES SECTION (3 or 4 visual cards) */}
      <CategoriesSection
        section={categoriesSection}
        categories={categories}
      />

      {/* 3. BESTSELLERS SECTION ("Nos incontournables") */}
      <BestsellersSection
        section={featuredSection}
        products={bestsellerList}
        settings={settings}
      />

      {/* 4. LARGE EDITORIAL SECTION (Image + Text) */}
      <EditorialSection section={editorialSection} />

      {/* 5. NOUVEAUTÉS */}
      {newArrivals.length > 0 && (
        <NewArrivalsSection
          products={newArrivals}
          settings={settings}
        />
      )}

      {/* 6. COLLECTION BANNER */}
      <CollectionBannerSection
        collection={collections[0]}
      />

      {/* 7. RÉASSURANCE (4 subtle linear elements) */}
      <ReassuranceSection section={reassuranceSection} />

      {/* 8. NEWSLETTER */}
      <NewsletterSection />
    </div>
  );
}

/* ========================================================================== */
/* A. HERO SECTION                                                            */
/* ========================================================================== */
function HeroSection({ section }: { section?: HomepageSection }) {
  const content = (section?.content_json || {}) as Record<string, string>;

  const eyebrow = content.eyebrow || 'NOUVELLE COLLECTION';
  const heading = content.heading || section?.title || 'L’éclat dans sa forme la plus simple.';
  const subheading =
    content.subheading ||
    'Des pièces délicates pensées pour traverser les saisons et accompagner chaque moment.';
  const primaryCta = content.primary_cta_label || 'Découvrir la collection';
  const primaryUrl = content.primary_cta_url || '/bijoux';
  const secondaryCta = content.secondary_cta_label || 'Explorer les collections';
  const secondaryUrl = content.secondary_cta_url || '/collections';
  const heroImage = content.image_url || null;

  return (
    <section className="relative w-full overflow-hidden bg-[#F6F1EA] border-b border-[#E7E0D7]">
      {/* Wide Hero Frame */}
      <div className="relative min-h-[68vh] sm:min-h-[75vh] lg:min-h-[82vh] flex items-center justify-center">
        {/* Background Image / Neutral architectural placeholder */}
        {heroImage ? (
          <LuxuryImage
            src={heroImage}
            alt="Nouvelle Collection Joaillerie"
            aspectRatio="auto"
            priority
            containerClassName="absolute inset-0 w-full h-full"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-b from-[#F9F6F1] via-[#F4EDE2] to-[#ECE3D4] flex items-center justify-center pointer-events-none">
            {/* Subtle serene architectural framing for luxury feel */}
            <div className="w-[90%] max-w-4xl h-[80%] border border-[#E7E0D7]/60 flex items-center justify-center p-8">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#A69B8D] font-light">
                Photographie de collection
              </span>
            </div>
          </div>
        )}

        {/* Content Box */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 sm:py-24 text-center space-y-6">
          <span className="inline-block text-[11px] uppercase tracking-eyebrow text-[#77716A] font-light">
            {eyebrow}
          </span>

          <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#171717] font-normal leading-[1.08] tracking-tight">
            {heading}
          </h1>

          <p className="text-sm sm:text-base text-[#77716A] max-w-xl mx-auto font-light leading-relaxed">
            {subheading}
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={primaryUrl}
              className="px-8 py-3.5 bg-[#171717] text-[#FCFAF7] text-xs tracking-wider uppercase hover:bg-[#2b2b2b] transition-all duration-300"
            >
              {primaryCta}
            </Link>

            {secondaryCta && (
              <Link
                href={secondaryUrl}
                className="px-8 py-3.5 bg-transparent text-[#171717] border border-[#171717] text-xs tracking-wider uppercase hover:bg-[#171717] hover:text-[#FCFAF7] transition-all duration-300"
              >
                {secondaryCta}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================================================================== */
/* B. CATEGORIES SECTION (3-4 Large Cards)                                    */
/* ========================================================================== */
function CategoriesSection({
  section,
  categories,
}: {
  section?: HomepageSection;
  categories: Category[];
}) {
  // Display up to 4 categories
  const displayCats = categories.slice(0, 4);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <span className="text-[11px] uppercase tracking-eyebrow text-[#77716A] font-light block mb-2">
          {section?.subtitle || 'Univers'}
        </span>
        <h2 className="font-editorial text-3xl sm:text-4xl text-[#171717] font-normal">
          {section?.title || 'Découvrir par catégorie'}
        </h2>
        <div className="w-8 h-px bg-[#B99A64] mx-auto mt-4" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {displayCats.map((cat) => (
          <Link
            key={cat.id}
            href={`/bijoux?categorie=${cat.slug}`}
            className="group block relative"
            aria-label={`Explorer la catégorie ${cat.name}`}
          >
            <div className="relative aspect-3/4 overflow-hidden bg-[#F6F1EA]">
              <LuxuryImage
                src={cat.image_url || cat.hero_url}
                alt={cat.name}
                aspectRatio="3/4"
                label={cat.name}
              />
              <div className="absolute inset-0 bg-[#171717]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            <div className="pt-4 text-center">
              <h3 className="font-editorial text-xl text-[#171717] group-hover:text-[#77716A] transition-colors">
                {cat.name}
              </h3>
              <span className="text-[10px] uppercase tracking-widest text-[#77716A] mt-1 inline-block hover-underline font-light">
                Explorer
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ========================================================================== */
/* C. BESTSELLERS SECTION ("Nos incontournables")                             */
/* ========================================================================== */
function BestsellersSection({
  section,
  products,
  settings,
}: {
  section?: HomepageSection;
  products: Product[];
  settings: StoreSettings;
}) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-14 gap-4 border-b border-[#E7E0D7] pb-6">
        <div>
          <span className="text-[11px] uppercase tracking-eyebrow text-[#77716A] font-light block mb-1">
            {section?.subtitle || 'Sélection'}
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl text-[#171717] font-normal">
            {section?.title || 'Nos incontournables'}
          </h2>
        </div>

        <Link
          href="/bijoux"
          className="text-xs uppercase tracking-wider text-[#171717] hover:text-[#77716A] inline-flex items-center gap-1.5 transition-colors hover-underline self-start sm:self-auto font-light"
        >
          <span>Voir tous les bijoux</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[1.25]" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            settings={settings}
          />
        ))}
      </div>
    </section>
  );
}

/* ========================================================================== */
/* D. GRANDE SECTION ÉDITORIALE (Image à gauche / Texte à droite)            */
/* ========================================================================== */
function EditorialSection({ section }: { section?: HomepageSection }) {
  const content = (section?.content_json || {}) as Record<string, string>;

  const heading = content.heading || section?.title || 'Une allure qui vous ressemble';
  const description =
    content.description ||
    'Chaque pièce est imaginée avec rigueur et sensibilité, privilégiant la pureté du dessin et l’harmonie des proportions pour s’accorder naturellement à votre quotidien.';
  const ctaLabel = content.cta_label || 'Découvrir la collection';
  const ctaUrl = content.cta_url || '/bijoux';
  const imageUrl = content.image_url || null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Left: Generous Editorial Image */}
        <div className="lg:col-span-7">
          <div className="relative aspect-4/3 sm:aspect-16/10 overflow-hidden bg-[#F6F1EA]">
            <LuxuryImage
              src={imageUrl}
              alt={heading}
              aspectRatio="auto"
              containerClassName="h-full w-full"
              label="L’Atelier"
            />
          </div>
        </div>

        {/* Right: Refined Editorial Text */}
        <div className="lg:col-span-5 space-y-6">
          <span className="text-[11px] uppercase tracking-eyebrow text-[#77716A] font-light block">
            {section?.subtitle || 'L’Esprit du bijou'}
          </span>

          <h2 className="font-editorial text-3xl sm:text-4xl text-[#171717] font-normal leading-tight">
            {heading}
          </h2>

          <p className="text-sm text-[#77716A] font-light leading-relaxed">
            {description}
          </p>

          <div className="pt-2">
            <Link
              href={ctaUrl}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#171717] hover-underline font-medium"
            >
              <span>{ctaLabel}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[1.25]" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================================================================== */
/* E. NOUVEAUTÉS SECTION                                                      */
/* ========================================================================== */
function NewArrivalsSection({
  products,
  settings,
}: {
  products: Product[];
  settings: StoreSettings;
}) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-14 gap-4 border-b border-[#E7E0D7] pb-6">
        <div>
          <span className="text-[11px] uppercase tracking-eyebrow text-[#77716A] font-light block mb-1">
            Nouveautés
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl text-[#171717] font-normal">
            Dernières créations
          </h2>
        </div>

        <Link
          href="/bijoux?tri=nouveautes"
          className="text-xs uppercase tracking-wider text-[#171717] hover:text-[#77716A] inline-flex items-center gap-1.5 transition-colors hover-underline self-start sm:self-auto font-light"
        >
          <span>Toutes les nouveautés</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[1.25]" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
        {products.map((product) => (
          <ProductCard
            key={`new-${product.id}`}
            product={product}
            settings={settings}
          />
        ))}
      </div>
    </section>
  );
}

/* ========================================================================== */
/* F. COLLECTION BANNER SECTION                                               */
/* ========================================================================== */
function CollectionBannerSection({ collection }: { collection?: Collection }) {
  const title = collection?.name || 'Collection Épure';
  const description =
    collection?.description ||
    'Des pièces essentielles sculptées avec rigueur pour illuminer chaque geste.';
  const href = collection ? `/collections/${collection.slug}` : '/collections';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden bg-[#F6F1EA] border border-[#E7E0D7] p-10 sm:p-16 lg:p-24 text-center">
        {/* Background Neutral Artwork */}
        <div className="absolute inset-0 bg-linear-to-r from-[#F6F1EA] via-[#FBF9F5] to-[#F6F1EA] pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <span className="text-[10px] uppercase tracking-eyebrow text-[#77716A] font-light block">
            Collection à l’honneur
          </span>

          <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl text-[#171717] font-normal leading-tight">
            {title}
          </h2>

          <p className="text-xs sm:text-sm text-[#77716A] font-light leading-relaxed max-w-lg mx-auto">
            {description}
          </p>

          <div className="pt-2">
            <Link
              href={href}
              className="inline-block px-8 py-3 bg-[#171717] text-[#FCFAF7] text-xs tracking-wider uppercase hover:bg-[#2b2b2b] transition-colors"
            >
              Explorer l’univers
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================================================================== */
/* G. RÉASSURANCE (4 Subtle Linear Items)                                     */
/* ========================================================================== */
function ReassuranceSection({ section }: { section?: HomepageSection }) {
  const content = section?.content_json as {
    items?: Array<{ title: string; desc: string }>;
  };

  const defaultItems = [
    {
      title: 'Paiement sécurisé',
      desc: 'Transactions chiffrées et protégées.',
      icon: ShieldCheck,
    },
    {
      title: 'Livraison suivie',
      desc: 'Expédition soignée et remise contre signature.',
      icon: Truck,
    },
    {
      title: 'Retours sous 30 jours',
      desc: 'Échanges ou retours en toute simplicité.',
      icon: RotateCcw,
    },
    {
      title: 'Service client dédié',
      desc: 'À votre disposition par message ou téléphone.',
      icon: Headphones,
    },
  ];

  const items = (content?.items || defaultItems).slice(0, 4);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-12 border-y border-[#E7E0D7]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item, idx) => {
            const Icon = defaultItems[idx % defaultItems.length].icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-4"
              >
                <div className="text-[#171717] mt-0.5 shrink-0">
                  <Icon className="w-5 h-5 stroke-[1.25]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-editorial text-base text-[#171717] font-normal">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#77716A] font-light leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ========================================================================== */
/* H. NEWSLETTER SECTION                                                      */
/* ========================================================================== */
function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  };

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
      <div className="p-10 sm:p-14 bg-[#F6F1EA] border border-[#E7E0D7] space-y-4">
        <span className="text-[10px] uppercase tracking-eyebrow text-[#77716A] font-light block">
          Correspondance
        </span>

        <h2 className="font-editorial text-2xl sm:text-3xl text-[#171717] font-normal">
          Restez informée
        </h2>

        <p className="text-xs sm:text-sm text-[#77716A] font-light max-w-md mx-auto">
          Recevez nos annonces de nouvelles créations et invitations en avant-première.
        </p>

        {subscribed ? (
          <div className="pt-4 flex items-center justify-center gap-2 text-xs text-[#171717]">
            <Check className="w-4 h-4 text-[#B99A64]" />
            <span>Merci pour votre inscription.</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="pt-4 max-w-md mx-auto flex flex-col sm:flex-row gap-2"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre adresse email"
              required
              className="flex-1 px-4 py-2.5 bg-[#FCFAF7] border border-[#E7E0D7] text-xs text-[#171717] placeholder:text-[#A69B8D] focus:outline-none focus:border-[#171717]"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#171717] text-[#FCFAF7] text-xs uppercase tracking-wider hover:bg-[#2b2b2b] transition-colors"
            >
              S’inscrire
            </button>
          </form>
        )}

        <span className="text-[10px] text-[#A69B8D] font-light block pt-1">
          Aucun message superflu. Désinscription possible à tout moment.
        </span>
      </div>
    </section>
  );
}
