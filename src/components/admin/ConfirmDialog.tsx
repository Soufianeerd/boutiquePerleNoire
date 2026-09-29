'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  isDestructive = true,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1C1C1A] border border-[#2F2E2B] max-w-md w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              isDestructive
                ? 'bg-red-950/60 border border-red-800 text-red-400'
                : 'bg-[#262420] border border-[#443E33] text-[#C5A880]'
            }`}
          >
            <AlertTriangle className="w-5 h-5 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-[#FAF8F5]">{title}</h3>
            <p className="text-xs text-[#9E9589] leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262624]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={loading}
            className="border-[#3E3D3A] text-[#9E9589] hover:text-[#FAF8F5]"
          >
            {cancelLabel}
          </Button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-medium transition-colors ${
              isDestructive
                ? 'bg-red-700 hover:bg-red-600 text-white'
                : 'bg-[#C5A880] hover:bg-[#B39368] text-[#121212]'
            }`}
          >
            {loading ? 'Traitement...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
