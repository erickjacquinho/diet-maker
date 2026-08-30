import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CheckboxCheckedState = boolean | 'indeterminate';

export interface CheckboxProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: CheckboxCheckedState;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  'aria-label'?: string;
  className?: string;
}

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    {
      checked = false,
      onCheckedChange,
      disabled = false,
      className,
      onClick,
      onKeyDown,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const isChecked = checked === true;
    const isIndeterminate = checked === 'indeterminate';

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      e.stopPropagation();
      onClick?.(e);
      if (!e.defaultPrevented) {
        onCheckedChange?.(!isChecked);
      }
    };


    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;
      onKeyDown?.(e);
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onCheckedChange?.(!isChecked);
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={isIndeterminate ? 'mixed' : isChecked}
        disabled={disabled}
        aria-label={ariaLabel}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'size-4 rounded-compact border flex items-center justify-center transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus select-none',
          isChecked && 'bg-primary border-primary text-on-primary',
          isIndeterminate && 'bg-primary-soft border-primary text-primary',
          !isChecked && !isIndeterminate && 'border-border-subtle bg-surface hover:border-border-hover',
          disabled && 'opacity-disabled cursor-not-allowed pointer-events-none',
          !disabled && 'cursor-pointer',
          className
        )}
        {...props}
      >
        {isChecked && <Check size={12} strokeWidth={3} className="shrink-0" aria-hidden="true" />}
        {isIndeterminate && (
          <span className="w-2 h-0.5 bg-primary rounded-round shrink-0" aria-hidden="true" />
        )}
      </button>
    );
  }
);

Checkbox.displayName = 'Checkbox';

