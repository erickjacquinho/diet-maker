import * as React from 'react';
import { cn } from '@/lib/utils';

export interface VariationCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
}

export const VariationCard = React.forwardRef<HTMLButtonElement, VariationCardProps>(
  ({ className, isActive = false, children, type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        aria-pressed={isActive}
        className={cn(
          'group p-4 rounded-surface border text-left transition-colors duration-fast flex flex-col justify-between gap-3 cursor-pointer w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          isActive
            ? 'bg-surface border-success ring-2 ring-success shadow-none'
            : 'bg-surface-subtle border-border-subtle hover:border-border-hover hover:bg-surface',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

VariationCard.displayName = 'VariationCard';