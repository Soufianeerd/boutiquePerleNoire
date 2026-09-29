import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="py-16 px-6 text-center border border-dashed border-[#2D2D2A] bg-[#161614] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-[#1F1F1D] border border-[#2F2E2B] flex items-center justify-center text-[#C5A880]">
        <Icon className="w-5 h-5 stroke-[1.5]" />
      </div>
      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-sm font-medium text-[#FAF8F5]">{title}</h3>
        <p className="text-xs text-[#8C827A] leading-relaxed">{description}</p>
      </div>
      {actionLabel && (
        <div className="pt-2">
          {actionHref ? (
            <a href={actionHref}>
              <Button variant="champagne" size="sm">
                {actionLabel}
              </Button>
            </a>
          ) : (
            <Button variant="champagne" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
