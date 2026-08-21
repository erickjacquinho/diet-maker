import React from 'react';
import { recipes } from '@/design-system';
import { cn } from '@/lib/utils';

export interface FieldTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'compact' | 'standard';
  state?: 'default' | 'error';
}

export const FieldTrigger = React.forwardRef<HTMLButtonElement, FieldTriggerProps>(
  ({ className, size = 'standard', state = 'default', type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        recipes.input({ size, state }),
        'flex cursor-pointer items-center justify-start gap-2 text-left disabled:cursor-not-allowed font-regular text-style-field-value text-text-primary',
        className,
      )}
      {...props}
    />
  ),
);

FieldTrigger.displayName = 'FieldTrigger';


