import React from 'react';
import { Button as ShadcnButton, ButtonProps as ShadcnButtonProps } from '@/components/ui/button';

export interface ButtonProps extends Omit<ShadcnButtonProps, 'variant' | 'size'> {
  variant?: 'primary' | 'secondary' | 'terracotta' | 'ghost' | 'danger' | 'default' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'default' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', className = '', ...props }, ref) => {
    let shadcnVariant: ShadcnButtonProps['variant'] = 'secondary';
    if (variant === 'primary') shadcnVariant = 'default';
    else if (variant === 'terracotta') shadcnVariant = 'default';
    else if (variant === 'danger') shadcnVariant = 'destructive';
    else if (variant === 'ghost') shadcnVariant = 'ghost';
    else if (variant === 'outline') shadcnVariant = 'outline';

    let shadcnSize: ShadcnButtonProps['size'] = 'default';
    if (size === 'sm') shadcnSize = 'sm';
    else if (size === 'lg') shadcnSize = 'lg';
    else if (size === 'icon') shadcnSize = 'icon';

    return (
      <ShadcnButton
        ref={ref}
        variant={shadcnVariant}
        size={shadcnSize}
        className={className}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

