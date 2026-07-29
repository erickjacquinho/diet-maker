import React from 'react';
import { Button } from '@/components/ui/button';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string; // Mandatory for accessibility
  icon: React.ReactNode;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className = '', 'aria-label': ariaLabel, ...props }, ref) => (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      aria-label={ariaLabel}
      className={className}
      {...props}
    >
      {icon}
    </Button>
  )
);

IconButton.displayName = 'IconButton';

