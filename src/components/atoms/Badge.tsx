import React from 'react';
import { Badge as ShadcnBadge, BadgeProps as ShadcnBadgeProps, BadgeVariant } from '@/components/ui/badge';

export type BadgeProps = Omit<ShadcnBadgeProps, 'variant'> & {
  variant?: BadgeVariant;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  className = '',
  children,
  ...props
}) => (
  <ShadcnBadge variant={variant} className={className} {...props}>
    {children}
  </ShadcnBadge>
);
