import React from 'react';
import { recipes } from '@/design-system';
import { cn } from '@/lib/utils';

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
    <div
      className={cn(recipes.avatar({ size: sizeMap[size], tone: toneMap[variant] }), className)}
      aria-label={initials}
    >
      {initials}
    </div>
  );
};
