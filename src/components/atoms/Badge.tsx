import React from 'react';
import { Badge as ShadcnBadge, BadgeProps as ShadcnBadgeProps } from '@/components/ui/badge';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'emerald' | 'rose' | 'amber' | 'teal' | 'neutral' | 'default' | 'secondary' | 'destructive' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  className = '',
  children,
  ...props
}) => {
  let shadcnVariant: ShadcnBadgeProps['variant'] = 'secondary';
  if (variant === 'rose') shadcnVariant = 'destructive';
  else if (variant === 'neutral') shadcnVariant = 'outline';
  else if (variant === 'default') shadcnVariant = 'default';
  else if (variant === 'secondary') shadcnVariant = 'secondary';
  else if (variant === 'destructive') shadcnVariant = 'destructive';
  else if (variant === 'outline') shadcnVariant = 'outline';

  return (
    <ShadcnBadge variant={shadcnVariant} className={className} {...props}>
      {children}
    </ShadcnBadge>
  );
};

