'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { textStyle } from '@/design-system';
import { cn } from '@/lib/utils';
import type { SelectFieldProps, SelectOption } from './select-field-types';

export * from './select-field-types';

export function SelectField<T extends string = string>({
  id,
  label,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  options = [],
  children,
  size = 'standard',
  state = 'default',
  errorMessage,
  layer = 'dropdown',
  disabled = false,
  required = false,
  className = '',
  triggerClassName = '',
  'aria-label': ariaLabel,
}: SelectFieldProps<T>) {
  return (
    <div className={cn('flex flex-col gap-1 w-full', className)}>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            textStyle('field-label'),
            state === 'error' && 'text-error-border',
          )}
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      <Select
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange as (val: string) => void}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          size={size}
          state={state}
          aria-label={ariaLabel || label}
          aria-required={required}
          aria-invalid={state === 'error'}
          className={cn('w-full', triggerClassName)}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent layer={layer}>
          {options.length > 0
            ? options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  <div className="flex items-center gap-2">
                    {option.icon && (
                      <span className="shrink-0">{option.icon}</span>
                    )}
                    <span className="truncate">{option.label}</span>
                    {option.description && (
                      <span className="text-style-legal text-text-muted ml-auto">
                        {option.description}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))
            : children}
        </SelectContent>
      </Select>

      {state === 'error' && errorMessage && (
        <span
          role="alert"
          className="text-style-legal text-error font-medium mt-0.5"
        >
          {errorMessage}
        </span>
      )}
    </div>
  );
}

SelectField.displayName = 'SelectField';
