import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent' | 'champagne';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth = false, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-normal transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B99A64] disabled:opacity-40 disabled:cursor-not-allowed tracking-wider text-xs';

    const variants = {
      primary: 'bg-[#171717] text-[#FCFAF7] hover:bg-[#2b2b2b] active:bg-[#0a0a0a]',
      secondary: 'bg-[#F6F1EA] text-[#171717] hover:bg-[#ede5da] border border-[#E7E0D7]',
      outline: 'bg-transparent text-[#171717] border border-[#171717] hover:bg-[#171717] hover:text-[#FCFAF7]',
      accent: 'bg-[#B99A64] text-[#FCFAF7] hover:bg-[#a68853]',
      champagne: 'bg-[#B99A64] text-[#FCFAF7] hover:bg-[#a68853]',
      ghost: 'bg-transparent text-[#171717] hover:bg-[#F6F1EA]',
    };

    const sizes = {
      sm: 'py-2 px-4 text-[11px]',
      md: 'py-3 px-6 text-xs',
      lg: 'py-4 px-8 text-xs',
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

