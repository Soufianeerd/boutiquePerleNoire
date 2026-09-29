'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#141414]/70 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative w-full bg-[#FAF8F5] border border-[#DDD5C7] p-8 md:p-10 shadow-2xl z-10 max-h-[90vh] overflow-y-auto',
          maxWidths[maxWidth]
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[#736B5E] hover:text-[#141414] transition-colors p-1"
          aria-label="Fermer la boîte de dialogue"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        {(title || subtitle) && (
          <div className="mb-6 pr-8">
            {subtitle && (
              <p className="text-[11px] uppercase tracking-widest text-[#A08154] font-medium mb-1">
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="font-editorial text-2xl md:text-3xl text-[#141414] font-normal leading-tight">
                {title}
              </h2>
            )}
            <div className="w-12 h-px bg-[#C5A880] mt-3" />
          </div>
        )}

        <div>{children}</div>
      </div>
    </div>
  );
}
