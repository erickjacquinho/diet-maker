import React from 'react';
import { Input as ShadcnInput } from '@/components/ui/input';

export type InputProps = React.ComponentProps<typeof ShadcnInput>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <ShadcnInput ref={ref} {...props} />
));

Input.displayName = 'Input';
