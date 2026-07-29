import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export interface TacoSearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
}

export const TacoSearchInput: React.FC<TacoSearchInputProps> = ({
  placeholder = '+ Buscar alimento na base TACO (ex: Frango, Arroz)...',
  className = '',
  ...props
}) => {
  return (
    <div className="relative flex items-center">
      <Input
        placeholder={placeholder}
        className={`pr-9 ${className}`}
        {...props}
      />
      <div className="absolute right-3 text-warm-muted pointer-events-none">
        <Search size={14} />
      </div>
    </div>
  );
};

