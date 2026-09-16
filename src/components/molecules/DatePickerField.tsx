"use client"

import * as React from 'react';
import { CalendarDays } from 'lucide-react';
import { ptBR } from 'date-fns/locale/pt-BR';

import { textStyle } from '@/design-system';
import { Button } from '@/components/atoms';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { formatDateOnly, parseDateOnly, serializeDateOnly } from '@/lib/date-only';

export interface DatePickerFieldProps {
  id: string;
  label: string;
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
}

function formatDateInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
    .filter(Boolean)
    .join('/');
}

function parseDisplayDate(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);

  if (!match) {
    return '';
  }

  const [, day, month, year] = match;
  const date = parseDateOnly(`${year}-${month}-${day}`);

  return date ? serializeDateOnly(date) : '';
}

function DatePickerField({
  id,
  label,
  value,
  onValueChange,
  placeholder = 'DD/MM/AAAA',
  description,
  error,
  required = false,
  disabled = false,
  name,
}: DatePickerFieldProps) {
  const [open, setOpen] = React.useState(false);
  const selectedDate = parseDateOnly(value);
  const displayedValue = formatDateOnly(value);
  const [inputValue, setInputValue] = React.useState(displayedValue);
  const isEditing = React.useRef(false);
  const descriptionIds = [
    description ? `${id}-description` : undefined,
    error ? `${id}-error` : undefined,
  ].filter(Boolean).join(' ') || undefined;

  React.useEffect(() => {
    if (!isEditing.current) {
      setInputValue(displayedValue);
    }
  }, [displayedValue]);

  const handleSelect = (date?: Date) => {
    if (!date) {
      return;
    }

    const nextValue = serializeDateOnly(date);

    isEditing.current = false;
    setInputValue(formatDateOnly(nextValue));
    onValueChange(nextValue);
    setOpen(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextInputValue = formatDateInput(event.target.value);

    isEditing.current = true;
    setInputValue(nextInputValue);
    onValueChange(parseDisplayDate(nextInputValue));
  };

  const handleInputBlur = () => {
    const nextValue = parseDisplayDate(inputValue);

    isEditing.current = false;

    if (!inputValue) {
      onValueChange('');
      return;
    }

    if (!nextValue) {
      setInputValue(displayedValue);
      return;
    }

    setInputValue(formatDateOnly(nextValue));
    onValueChange(nextValue);
  };

  return (
    <div className="flex flex-col gap-1">
      <label id={`${id}-label`} htmlFor={id} className={textStyle('field-label')}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>

      <Popover open={open} onOpenChange={setOpen}>
        <div className="relative">
          <Input
            id={id}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            inputMode="numeric"
            maxLength={10}
            autoComplete="off"
            required={required}
            disabled={disabled}
            aria-required={required ? 'true' : undefined}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={descriptionIds}
            className="pr-10"
          />
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="quiet"
              size="compact"
              iconOnly
              disabled={disabled}
              aria-label={`Abrir calendário para ${label}`}
              aria-haspopup="dialog"
              aria-expanded={open}
              className="absolute inset-y-0 right-1 my-auto"
            >
              <CalendarDays aria-hidden="true" className="size-4" />
            </Button>
          </PopoverTrigger>
        </div>

        <PopoverContent
          align="start"
          side="bottom"
          layer="modal"
          className="w-auto overflow-hidden rounded-surface border-border-subtle bg-surface p-0 shadow-floating"
        >
          <Calendar
            mode="single"
            locale={ptBR}
            selected={selectedDate}
            defaultMonth={selectedDate}
            onSelect={handleSelect}
            autoFocus
          />
        </PopoverContent>
      </Popover>

      <Input type="hidden" name={name ?? id} value={value ?? ''} aria-hidden="true" />

      {description ? (
        <p id={`${id}-description`} className={textStyle('helper')}>
          {description}
        </p>
      ) : null}

      {error ? (
        <p id={`${id}-error`} role="alert" className={cn(textStyle('validation-error'))}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { DatePickerField };
