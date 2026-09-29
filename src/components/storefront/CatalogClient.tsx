'use client';

import React, { useState, useMemo } from 'react';
import { Product, Category, Collection, StoreSettings } from '@/types/database';
import { ProductCard } from './ProductCard';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';

interface CatalogClientProps {
  initialProducts: Product[];
  categories: Category[];
  collections: Collection[];
  settings: StoreSettings;
  initialCategory?: string;
  initialCollection?: string;
  initialSort?: string;
  initialQuery?: string;
}

export function CatalogClient({
  initialProducts,
  categories,
  collections,
  settings,
  initialCategory,
  initialCollection,
  initialSort = 'nouveautes',
  initialQuery = '',
}: CatalogClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedCollection, setSelectedCollection] = useState<string>(initialCollection || 'all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>(initialSort);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.short_description && p.short_description.toLowerCase().includes(q)) ||
          (p.material_details && p.material_details.toLowerCase().includes(q)) ||
          (p.category && p.category.name.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(
        (p) => p.category?.slug === selectedCategory || p.category_id === selectedCategory
      );
    }

    // Collection filter
    if (selectedCollection !== 'all') {
      result = result.filter(
        (p) => p.collection?.slug === selectedCollection || p.collection_id === selectedCollection
      );
    }

    // Price range filter
    if (selectedPriceRange !== 'all') {
      switch (selectedPriceRange) {
        case 'under-1000':
          result = result.filter((p) => p.base_price < 1000);
          break;
        case '1000-2500':
          result = result.filter((p) => p.base_price >= 1000 && p.base_price <= 2500);
          break;
        case 'above-2500':
          result = result.filter((p) => p.base_price > 2500);
          break;
      }
    }

    // Availability filter
    if (selectedAvailability !== 'all') {
      switch (selectedAvailability) {
        case 'available':
          result = result.filter((p) => p.status === 'published');
          break;
        case 'unique':
          result = result.filter((p) => p.status === 'unique_piece');
          break;
        case 'order':
          result = result.filter((p) => p.status === 'made_to_order');
          break;
      }
    }

    // Sorting
    switch (sortOption) {
      case 'prix-asc':
        result.sort((a, b) => a.base_price - b.base_price);
        break;
      case 'prix-desc':
        result.sort((a, b) => b.base_price - a.base_price);
        break;
      case 'popularite':
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      case 'nouveautes':
      default:
        result.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
    }

    return result;
  }, [
    initialProducts,
    selectedCategory,
    selectedCollection,
    selectedPriceRange,
    selectedAvailability,
    sortOption,
    searchQuery,
  ]);

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedCollection !== 'all' ||
    selectedPriceRange !== 'all' ||
    selectedAvailability !== 'all' ||
    searchQuery.trim().length > 0;

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedCollection('all');
    setSelectedPriceRange('all');
    setSelectedAvailability('all');
    setSearchQuery('');
  };

  return (
    <div className="space-y-8">
      {/* Search notice if active query */}
      {searchQuery && (
        <div className="flex items-center justify-between p-3 bg-[#F6F1EA] text-xs text-[#171717]">
          <span>
            Résultats pour la recherche : <strong className="font-medium">« {searchQuery} »</strong>
          </span>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-[10px] uppercase tracking-wider text-[#77716A] hover:text-[#171717]"
          >
            Effacer
          </button>
        </div>
      )}

      {/* TOP FILTER & SORT BAR */}
      <div className="border-y border-[#E7E0D7] py-4">
        {/* Desktop Filters */}
        <div className="hidden lg:flex items-center justify-between gap-6">
          <div className="flex items-center flex-wrap gap-4 text-xs">
            {/* Category Dropdown */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-transparent pr-7 py-1 text-xs text-[#171717] border-b border-transparent hover:border-[#171717] focus:outline-none cursor-pointer"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#77716A] absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none stroke-[1.25]" />
            </div>

            {/* Collection Dropdown */}
            {collections.length > 0 && (
              <div className="relative">
                <select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  className="appearance-none bg-transparent pr-7 py-1 text-xs text-[#171717] border-b border-transparent hover:border-[#171717] focus:outline-none cursor-pointer"
                >
                  <option value="all">Toutes les collections</option>
                  {collections.map((col) => (
                    <option key={col.id} value={col.slug}>
                      {col.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#77716A] absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none stroke-[1.25]" />
              </div>
            )}

            {/* Price Range */}
            <div className="relative">
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="appearance-none bg-transparent pr-7 py-1 text-xs text-[#171717] border-b border-transparent hover:border-[#171717] focus:outline-none cursor-pointer"
              >
                <option value="all">Tous les prix</option>
                <option value="under-1000">Moins de 1 000 €</option>
                <option value="1000-2500">1 000 € — 2 500 €</option>
                <option value="above-2500">Plus de 2 500 €</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#77716A] absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none stroke-[1.25]" />
            </div>

            {/* Availability */}
            <div className="relative">
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="appearance-none bg-transparent pr-7 py-1 text-xs text-[#171717] border-b border-transparent hover:border-[#171717] focus:outline-none cursor-pointer"
              >
                <option value="all">Disponibilité</option>
                <option value="available">Disponible</option>
                <option value="unique">Pièce unique</option>
                <option value="order">Sur commande</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#77716A] absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none stroke-[1.25]" />
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-[#77716A] hover:text-[#171717] transition-colors ml-2"
              >
                <X className="w-3 h-3 stroke-[1.25]" />
                <span>Réinitialiser</span>
              </button>
            )}
          </div>

          {/* Right: Counter & Sorting */}
          <div className="flex items-center space-x-6">
            <span className="text-xs text-[#77716A] font-light">
              {filteredProducts.length} {filteredProducts.length > 1 ? 'pièces' : 'pièce'}
            </span>

            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase tracking-wider text-[#77716A]">Tri :</span>
              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="appearance-none bg-transparent pr-6 py-1 text-xs text-[#171717] border-b border-transparent hover:border-[#171717] focus:outline-none cursor-pointer"
                >
                  <option value="nouveautes">Nouveautés</option>
                  <option value="prix-asc">Prix croissant</option>
                  <option value="prix-desc">Prix décroissant</option>
                  <option value="popularite">Popularité</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#77716A] absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none stroke-[1.25]" />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="inline-flex items-center gap-2 py-1 text-[#171717]"
          >
            <SlidersHorizontal className="w-4 h-4 stroke-[1.25]" />
            <span>Filtres {hasActiveFilters && '•'}</span>
          </button>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-[#77716A] font-light">
              {filteredProducts.length} {filteredProducts.length > 1 ? 'pièces' : 'pièce'}
            </span>

            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="appearance-none bg-transparent pr-5 py-1 text-xs text-[#171717] focus:outline-none cursor-pointer"
              >
                <option value="nouveautes">Nouveautés</option>
                <option value="prix-asc">Prix ↑</option>
                <option value="prix-desc">Prix ↓</option>
                <option value="popularite">Popularité</option>
              </select>
              <ChevronDown className="w-3 h-3 text-[#77716A] absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none stroke-[1.25]" />
            </div>
          </div>
        </div>

        {/* Mobile Filter Expandable Drawer */}
        {mobileFilterOpen && (
          <div className="lg:hidden pt-4 mt-3 border-t border-[#E7E0D7] space-y-4 animate-in slide-in-from-top-1">
            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-wider text-[#77716A]">Catégorie</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 bg-[#F6F1EA] text-xs text-[#171717] focus:outline-none"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {collections.length > 0 && (
              <div className="space-y-1">
                <label className="block text-[10px] uppercase tracking-wider text-[#77716A]">Collection</label>
                <select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  className="w-full p-2 bg-[#F6F1EA] text-xs text-[#171717] focus:outline-none"
                >
                  <option value="all">Toutes les collections</option>
                  {collections.map((col) => (
                    <option key={col.id} value={col.slug}>
                      {col.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-wider text-[#77716A]">Prix</label>
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="w-full p-2 bg-[#F6F1EA] text-xs text-[#171717] focus:outline-none"
              >
                <option value="all">Tous les prix</option>
                <option value="under-1000">Moins de 1 000 €</option>
                <option value="1000-2500">1 000 € — 2 500 €</option>
                <option value="above-2500">Plus de 2 500 €</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-wider text-[#77716A]">Disponibilité</label>
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="w-full p-2 bg-[#F6F1EA] text-xs text-[#171717] focus:outline-none"
              >
                <option value="all">Toutes les pièces</option>
                <option value="available">Disponible</option>
                <option value="unique">Pièce unique</option>
                <option value="order">Sur commande</option>
              </select>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-[#77716A] underline"
                >
                  Réinitialiser tous les filtres
                </button>
              )}
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="ml-auto px-4 py-2 bg-[#171717] text-[#FCFAF7] text-xs uppercase tracking-wider"
              >
                Appliquer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PRODUCTS GRID */}
      {filteredProducts.length === 0 ? (
        <div className="py-24 text-center space-y-4">
          <p className="font-editorial text-2xl text-[#171717]">
            Aucune création ne correspond à vos critères
          </p>
          <p className="text-xs text-[#77716A] font-light max-w-sm mx-auto">
            Veuillez ajuster vos filtres pour découvrir d’autres créations de la collection.
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 px-6 py-2.5 bg-[#171717] text-[#FCFAF7] text-xs uppercase tracking-wider hover:bg-[#2b2b2b] transition-colors"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              settings={settings}
            />
          ))}
        </div>
      )}
    </div>
  );
}
