'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Button, Input } from '@/components/atoms';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { CreateProfileInput } from '@/lib/application/profile-session';
import { formatWhatsappContact } from '@/lib/whatsapp';

export interface ProfileCreateDialogProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  onSubmit(input: CreateProfileInput): Promise<void>;
}

interface ActionError {
  readonly code?: string;
  readonly message: string;
}

function getActionError(error: unknown): ActionError {
  if (error instanceof Error) {
    return { code: 'code' in error && typeof error.code === 'string' ? error.code : undefined, message: error.message };
  }
  return { message: 'Não foi possível criar o profile.' };
}

export function ProfileCreateDialog({ open, onOpenChange, onSubmit }: ProfileCreateDialogProps) {
  const idPrefix = useId();
  const nameId = `${idPrefix}-profile-name`;
  const phoneId = `${idPrefix}-profile-phone`;
  const nameErrorId = `${nameId}-error`;
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setNameError(null);
      setFormError(null);
    }
  }, [open]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!displayName.trim()) {
      setNameError('Informe o nome do profile.');
      setFormError(null);
      nameRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    setNameError(null);
    setFormError(null);
    try {
      await onSubmit({ displayName, phone });
      onOpenChange(false);
      setDisplayName('');
      setPhone('');
    } catch (error) {
      const actionError = getActionError(error);
      if (actionError.code === 'PROFILE_NAME_REQUIRED') {
        setNameError(actionError.message);
        nameRef.current?.focus();
      } else {
        setFormError(actionError.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isSubmitting && onOpenChange(nextOpen)}>
      <DialogContent aria-busy={isSubmitting || undefined}>
        <DialogHeader>
          <DialogTitle>Criar profile</DialogTitle>
          <DialogDescription>Informe os dados que identificarão este arquivo NutriDiet.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor={nameId} className="text-style-field-label font-semibold text-text-primary">
                Nome
              </label>
              <Input
                ref={nameRef}
                id={nameId}
                name="displayName"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                aria-invalid={nameError ? 'true' : undefined}
                aria-describedby={nameError ? nameErrorId : undefined}
                autoComplete="name"
                required
              />
              {nameError ? <p id={nameErrorId} role="alert" className="text-style-validation-error">{nameError}</p> : null}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor={phoneId} className="text-style-field-label font-semibold text-text-primary">Telefone</label>
              <Input
                id={phoneId}
                name="phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(formatWhatsappContact(event.target.value))}
                autoComplete="tel"
                inputMode="tel"
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          {formError ? <p role="alert" className="rounded-control border border-error-border bg-error-soft p-3 text-style-body-small text-error">{formError}</p> : null}

          <DialogFooter>
            <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
              Salvar profile
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
