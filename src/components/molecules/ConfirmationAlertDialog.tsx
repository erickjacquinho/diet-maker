'use client';

import React, { type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ConfirmationAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description: ReactNode;
  confirmLabel: ReactNode;
  onConfirm: () => void;
  cancelLabel?: ReactNode;
  confirmVariant?: ButtonProps['variant'];
  cancelVariant?: ButtonProps['variant'];
  confirmSize?: ButtonProps['size'];
  cancelSize?: ButtonProps['size'];
  icon?: ReactNode;
  className?: string;
  overlayLayer?: 'overlay' | 'modal';
}

export function ConfirmationAlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  cancelLabel = 'Cancelar',
  confirmVariant = 'primary',
  cancelVariant = 'secondary',
  confirmSize = 'compact',
  cancelSize = 'compact',
  icon = <AlertTriangle className="size-4 shrink-0 text-warning" aria-hidden="true" />,
  className,
  overlayLayer = 'overlay',
}: ConfirmationAlertDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent overlayLayer={overlayLayer} className={cn('max-w-sm', className)}>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-text-primary">
            {icon}
            <span>{title}</span>
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant={cancelVariant} size={cancelSize}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction variant={confirmVariant} size={confirmSize} onClick={onConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
