'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    handleClose();
    router.push(`/bijoux?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Recherche"
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 sm:pt-32 bg-[#171717]/40 backdrop-blur-xs transition-all duration-300 animate-in fade-in"
    >
      <div className="w-full max-w-2xl mx-4 bg-[#FCFAF7] border border-[#E7E0D7] shadow-xl p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-[#E7E0D7]">
          <span className="text-[10px] uppercase tracking-widest text-[#77716A]">
            Rechercher une création
          </span>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fermer la recherche"
            className="p-1 text-[#77716A] hover:text-[#171717] transition-colors"
          >
            <X className="w-5 h-5 stroke-[1.25]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-[#77716A] absolute left-0 stroke-[1.25]" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Bague, collier, or blanc..."
              className="w-full pl-8 pr-4 py-2 bg-transparent text-lg sm:text-xl font-editorial text-[#171717] placeholder:text-[#A69B8D] border-b border-[#171717] focus:outline-none"
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-[#77716A]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider">Suggestions :</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push('/bijoux?categorie=bagues');
                }}
                className="hover:text-[#171717] underline underline-offset-4"
              >
                Bagues
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push('/bijoux?categorie=colliers');
                }}
                className="hover:text-[#171717] underline underline-offset-4"
              >
                Colliers
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push('/bijoux?categorie=bracelets');
                }}
                className="hover:text-[#171717] underline underline-offset-4"
              >
                Bracelets
              </button>
            </div>

            <button
              type="submit"
              className="px-4 py-1.5 bg-[#171717] text-[#FCFAF7] text-[10px] uppercase tracking-wider hover:bg-[#2b2b2b] transition-colors"
            >
              Rechercher
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
