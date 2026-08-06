import React from 'react';

import { recipes } from '@/design-system';
import { cn } from '@/lib/utils';

export interface FieldTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'compact' | 'standard';
  state?: 'default' | 'error';
}

export const FieldTrigger = React.forwardRef<HTMLButtonElement, FieldTriggerProps>(
  ({ className, size = 'standard', state = 'default', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        recipes.input({ size, state }),
        'flex cursor-pointer items-center justify-start gap-2 text-left disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  ),
);

FieldTrigger.displayName = 'FieldTrigger';
