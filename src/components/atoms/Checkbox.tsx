'use client';

import type { ComponentProps } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type CheckboxState = boolean | 'indeterminate';

export interface CheckboxProps extends Omit<ComponentProps<'button'>, 'onChange' | 'onClick'> {
  checked?: CheckboxState;
  onCheckedChange?: (checked: boolean) => void;
  'aria-label': string;
}

export function Checkbox({
  checked = false,
  disabled = false,
  onCheckedChange,
  'aria-label': ariaLabel,
  className,
  ...props
}: CheckboxProps) {
  const isChecked = checked === true;
  const isIndeterminate = checked === 'indeterminate';

  return (
    <Button
      {...props}
      type="button"
      variant="quiet"
      size="compact"
      iconOnly
      role="checkbox"
      aria-checked={isIndeterminate ? 'mixed' : isChecked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onCheckedChange?.(!isChecked);
      }}
      className={cn(
        'group flex size-8 items-center justify-center rounded-compact border-transparent bg-transparent p-0 transition-colors duration-fast hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        disabled ? 'pointer-events-none cursor-not-allowed opacity-disabled' : 'cursor-pointer',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'flex size-4 items-center justify-center rounded-compact border transition-colors duration-fast',
          isChecked && 'border-primary bg-primary text-on-primary',
          isIndeterminate && 'border-primary bg-primary-soft text-primary',
          !isChecked && !isIndeterminate && 'border-border-subtle bg-surface group-hover:border-border-hover',
        )}
      >
        {isChecked && <Check size={12} className="shrink-0" aria-hidden="true" />}
        {isIndeterminate && <span className="h-px w-2 rounded-round bg-primary" aria-hidden="true" />}
      </span>
    </Button>
  );
}
