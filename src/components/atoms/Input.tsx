import React from 'react';
import { Input as ShadcnInput } from '@/components/ui/input';

export type InputProps = React.ComponentProps<typeof ShadcnInput>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => (
    <ShadcnInput ref={ref} className={className} {...props} />
  )
);

Input.displayName = 'Input';

