import React from 'react';
import { Badge as ShadcnBadge, BadgeProps as ShadcnBadgeProps } from '@/components/ui/badge';

export type BadgeProps = ShadcnBadgeProps;

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
