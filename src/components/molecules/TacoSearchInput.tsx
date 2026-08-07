import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TacoSearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  icon?: React.ReactNode;
}

export const TacoSearchInput = React.forwardRef<HTMLInputElement, TacoSearchInputProps>(
  (
    {
      placeholder = '+ Buscar alimento na base TACO (ex: Frango, Arroz)...',
      className = '',
      icon = <Search size={16} className="text-text-muted shrink-0" />,
      ...props
    },
    ref,
  ) => {
    return (
      <div className="relative flex items-center w-full">
        <div className="absolute left-3 text-text-muted pointer-events-none flex items-center justify-center">
          {icon}
        </div>
        <Input
          ref={ref}
          placeholder={placeholder}
          className={cn('pl-9 pr-3', className)}
          {...props}
        />
      </div>
    );
  },
);

TacoSearchInput.displayName = 'TacoSearchInput';
