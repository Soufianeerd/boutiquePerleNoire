'use client';

import React from 'react';
import Link from 'next/link';
import {
  HomepageSection,
  Product,
  Category,
  StoreSettings,
} from '@/types/database';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/Button';
import { Sparkles, ArrowRight, ShieldCheck, Gem, Award, Clock } from 'lucide-react';

interface SectionsRendererProps {
  sections: HomepageSection[];
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
}

export function SectionsRenderer({
  sections,
  products,
  categories,
  settings,
}: SectionsRendererProps) {
  return (
    <div className="space-y-24 md:space-y-32">
      {sections.map((section) => {
        switch (section.section_type) {
          case 'hero':
            return (
              <HeroSection
                key={section.id}
                section={section}
              />
            );
          case 'categories':
            return (
              <CategoriesSection
                key={section.id}
                section={section}
                categories={categories}
              />
            );
          case 'featured_products':
            return (
              <FeaturedProductsSection
                key={section.id}
                section={section}
                products={products}
                settings={settings}
              />
            );
          case 'editorial':
            return (
              <EditorialSection
                key={section.id}
                section={section}
              />
            );
          case 'reassurance':
            return (
              <ReassuranceSection
                key={section.id}
                section={section}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

function HeroSection({
  section,
}: {
  section: HomepageSection;
}) {
  const content = section.content_json as Record<string, string>;

  return (
    <section className="relative overflow-hidden bg-[#FAF8F5] pt-12 pb-20 md:py-28 border-b border-[#E6DFD3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Text Editorial */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-[#A08154]">
              <span className="w-8 h-px bg-[#C5A880]" />
              <span>{content.eyebrow || 'Place Vendôme — Paris'}</span>
            </div>

            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-[#141414] font-normal leading-[1.1] tracking-tight">
              {content.heading || section.title || 'L’Incomparable Éclat de la Nacre Noire'}
            </h1>

            <p className="text-sm md:text-base text-[#554E45] max-w-xl font-light leading-relaxed">
              {content.subheading ||
                'Des joyaux singuliers façonnés dans le secret de notre atelier parisien, mariant perles rares de Polynésie et haute tradition joaillière.'}
            </p>

            <div className="pt-4 flex flex-wrap gap-4 items-center">
              <Link href={content.primary_cta_url || '/bijoux'}>
                <Button variant="primary" size="md">
                  {content.primary_cta_label || 'Découvrir la Collection'}
                </Button>
              </Link>
              <Link href={content.secondary_cta_url || '/contact'}>
                <Button variant="outline" size="md">
                  {content.secondary_cta_label || 'Prendre Rendez-vous'}
                </Button>
              </Link>
            </div>
          </div>

          {/* Luxury Visual Frame */}
          <div className="lg:col-span-5">
            <div className="relative aspect-3/4 bg-[#F0EAE1] border border-[#DDD5C7] p-8 flex flex-col justify-between items-center text-center shadow-xs">
              <div className="text-[10px] uppercase tracking-widest text-[#8C827A] pt-2">
                Atelier Place Vendôme • Pièce N° 01/2026
              </div>

              {/* Graphic Medallion Representation */}
              <div className="relative my-auto">
                <div className="w-36 h-36 rounded-full border border-[#D5C9B8] bg-[#FAF8F5] flex items-center justify-center p-3 relative shadow-inner">
                  <div className="w-24 h-24 rounded-full bg-linear-to-br from-[#1C1C1A] via-[#2A2926] to-[#0A0A09] shadow-xl border border-[#C5A880]/40 flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-[#C5A880] animate-pulse" />
                  </div>
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#141414] text-[#FAF8F5] text-[9px] uppercase tracking-widest px-3 py-1 border border-[#C5A880]/30 whitespace-nowrap">
                  Or 18K & Perle de Tahiti
                </div>
              </div>

              <div className="border-t border-[#DDD5C7] w-full pt-4">
                <span className="font-editorial text-lg text-[#141414] block">
                  Bague Solitaire Éclipse Noire
                </span>
                <span className="text-[11px] text-[#736B5E]">
                  Façonnée à la main • Série Restreinte
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoriesSection({
  section,
  categories,
}: {
  section: HomepageSection;
  categories: Category[];
}) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-[11px] uppercase tracking-widest text-[#A08154] font-medium block mb-2">
          {section.subtitle || 'Univers Joailliers'}
        </span>
        <h2 className="font-editorial text-3xl md:text-4xl text-[#141414] font-normal">
          {section.title || 'Nos Lignées Joaillières'}
        </h2>
        <div className="w-12 h-px bg-[#C5A880] mx-auto mt-4" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/bijoux?categorie=${cat.slug}`}
            className="group relative p-6 bg-[#FAF8F5] border border-[#E6DFD3] hover:border-[#141414] transition-all duration-300 flex flex-col justify-between aspect-4/5 text-center"
          >
            <div className="w-10 h-10 mx-auto rounded-full bg-[#F0EAE1] flex items-center justify-center text-[#141414] group-hover:bg-[#141414] group-hover:text-[#FAF8F5] transition-colors">
              <Gem className="w-4 h-4 stroke-[1.5]" />
            </div>

            <div className="py-4">
              <h3 className="font-editorial text-base md:text-lg text-[#141414] group-hover:text-[#A08154] transition-colors">
                {cat.name}
              </h3>
              <p className="text-[11px] text-[#8C827A] mt-1 line-clamp-2 hidden sm:block font-light">
                {cat.description}
              </p>
            </div>

            <span className="text-[10px] uppercase tracking-widest text-[#736B5E] group-hover:text-[#141414] transition-colors inline-flex items-center justify-center gap-1">
              Explorer <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FeaturedProductsSection({
  section,
  products,
  settings,
}: {
  section: HomepageSection;
  products: Product[];
  settings: StoreSettings;
}) {
  const featured = products.slice(0, 4);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-[#A08154] font-medium block mb-1">
            {section.subtitle || 'Sélection Exclusive'}
          </span>
          <h2 className="font-editorial text-3xl md:text-4xl text-[#141414] font-normal">
            {section.title || 'Créations Emblématiques'}
          </h2>
        </div>
        <Link
          href="/bijoux"
          className="text-xs uppercase tracking-widest text-[#141414] hover:text-[#A08154] inline-flex items-center gap-1.5 transition-colors border-b border-[#141414] pb-0.5 self-start sm:self-auto"
        >
          Voir toutes les pièces <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featured.map((product) => (
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

function EditorialSection({ section }: { section: HomepageSection }) {
  const content = section.content_json as Record<string, string>;

  return (
    <section className="bg-[#1E1E1C] text-[#FAF8F5] py-20 border-y border-[#2D2D2A]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8">
        <span className="text-[11px] uppercase tracking-widest text-[#C5A880] font-medium block">
          {section.subtitle || 'L’Art de la Nacre Sombre'}
        </span>

        <blockquote className="font-editorial text-2xl sm:text-3xl md:text-4xl font-normal leading-relaxed text-[#FAF8F5] italic">
          “{content.quote ||
            'Une perle noire n’est jamais monochrome. Elle recèle des reflets d’émeraude, d’aubergine et d’aurore boréale que seul l’or le plus pur peut révéler.'}”
        </blockquote>

        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-[#C5A880] font-semibold">
            {content.author || 'Atelier Perle Noire'}
          </p>
          <p className="text-[11px] text-[#9E9589] tracking-wider">
            {content.location || '18 Place Vendôme, Paris'}
          </p>
        </div>

        <div className="pt-4">
          <Link href={content.cta_url || '/a-propos'}>
            <Button variant="champagne" size="sm">
              {content.cta_label || 'Découvrir notre Atelier'}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function ReassuranceSection({ section }: { section: HomepageSection }) {
  const content = section.content_json as {
    items?: Array<{ title: string; desc: string }>;
  };

  const defaultItems = [
    {
      title: 'Certificat d’Authenticité',
      desc: 'Chaque perle et diamant fait l’objet d’une expertise gemmologique rigoureuse et d’un certificat numéroté.',
      icon: Award,
    },
    {
      title: 'Atelier sur Rendez-vous',
      desc: 'Présentation privée dans nos salons de la Place Vendôme ou consultation vidéo personnalisée.',
      icon: Clock,
    },
    {
      title: 'Transport Sécurisé en Valeur Déclarée',
      desc: 'Expédition confidentielle et assurée par convoyeur de fonds spécialisé en joaillerie.',
      icon: ShieldCheck,
    },
    {
      title: 'Mise à Taille Offerte',
      desc: 'Ajustement parfait réalisé gracieusement dans notre atelier parisien pour toute création.',
      icon: Gem,
    },
  ];

  const items = content?.items || defaultItems;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-[11px] uppercase tracking-widest text-[#A08154] font-medium block mb-2">
          {section.subtitle || 'Privilèges & Engagements'}
        </span>
        <h2 className="font-editorial text-2xl md:text-3xl text-[#141414] font-normal">
          {section.title || 'La Promesse d’une Grande Maison'}
        </h2>
        <div className="w-10 h-px bg-[#C5A880] mx-auto mt-3" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {items.map((item, idx) => {
          const Icon = defaultItems[idx % defaultItems.length].icon;
          return (
            <div
              key={idx}
              className="p-6 bg-[#FAF8F5] border border-[#E6DFD3] text-center space-y-3"
            >
              <div className="w-8 h-8 mx-auto text-[#A08154] flex items-center justify-center">
                <Icon className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h3 className="font-editorial text-lg text-[#141414]">
                {item.title}
              </h3>
              <p className="text-xs text-[#736B5E] leading-relaxed font-light">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
