import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'champagne';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth = false, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A880] disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider text-xs';

    const variants = {
      primary: 'bg-[#141414] text-[#FAF8F5] hover:bg-[#2B2B28] active:bg-[#0A0A0A]',
      secondary: 'bg-[#F0EAE1] text-[#141414] hover:bg-[#E4DCD0] border border-[#DDD5C7]',
      outline: 'bg-transparent text-[#141414] border border-[#141414] hover:bg-[#141414] hover:text-[#FAF8F5]',
      champagne: 'bg-[#C5A880] text-[#141414] hover:bg-[#B89768]',
      ghost: 'bg-transparent text-[#141414] hover:bg-[#F0EAE1]',
    };

    const sizes = {
      sm: 'py-2 px-4 text-[10px]',
      md: 'py-3.5 px-7 text-xs',
      lg: 'py-4.5 px-9 text-xs',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
