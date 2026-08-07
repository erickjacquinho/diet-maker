import React from 'react';
import { recipes } from '@/design-system';
import { cn } from '@/lib/utils';
import { Avatar as AvatarUI, AvatarFallback as AvatarFallbackUI } from '@/components/ui/avatar';

export interface AvatarProps {
  initials: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'emerald' | 'charcoal' | 'inner';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  initials,
  size = 'md',
  variant = 'inner',
  className = '',
}) => {
  const sizeMap = { sm: 'compact', md: 'standard', lg: 'large' } as const;
  const toneMap = { emerald: 'success', charcoal: 'primary', inner: 'neutral' } as const;

  return (
    <AvatarUI
      className={cn(recipes.avatar({ size: sizeMap[size], tone: toneMap[variant] }), className)}
      aria-label={initials}
    >
      <AvatarFallbackUI className="bg-transparent text-inherit font-medium">
        {initials}
      </AvatarFallbackUI>
    </AvatarUI>
  );
};

