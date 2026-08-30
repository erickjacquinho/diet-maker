import React from 'react';
import { Pencil, Trash2, ArrowLeftRight, CopyPlus } from 'lucide-react';
import { Button, ButtonProps } from './Button';
import { cn } from '@/lib/utils';

export type IconButtonProps = Omit<ButtonProps, 'iconOnly'> & {
  'aria-label'?: string;
  title?: string;
  icon?: React.ReactNode;
  size?: 'compact' | 'standard';
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * IconButton - Icon-only action button composed over the atom Button (normative recipe geometry).
 */
export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  children,
  className = '',
  'aria-label': ariaLabel,
  title,
  variant = 'quiet',
  size = 'standard',
  ref,
  ...props
}) => {
  const label = ariaLabel || title;
  if (!label) {
    throw new Error('IconButton requires an explicit accessible name (aria-label or title).');
  }
  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      iconOnly
      aria-label={label}
      title={title || ariaLabel}
      className={`shrink-0 cursor-pointer ${className}`}
      {...props}
    >
      {icon || children}
    </Button>
  );
};

export type ExplicitIconButtonProps = Omit<IconButtonProps, 'icon'> & {
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * EditIconButton - Secondary icon-only component for Edit actions across the application.
 */
export const EditIconButton: React.FC<ExplicitIconButtonProps> = ({
  className = '',
  title = 'Editar',
  variant = 'secondary',
  ref,
  ...props
}) => (
  <IconButton
    ref={ref}
    variant={variant}
    title={title}
    aria-label={title}
    className={className}
    {...props}
  >
    <Pencil size={14} className="shrink-0" />
  </IconButton>
);

/**
 * DeleteIconButton - Destructive icon-only component for Delete actions across the application.
 */
export const DeleteIconButton: React.FC<ExplicitIconButtonProps> = ({
  className = '',
  title = 'Excluir',
  variant = 'destructive-outline',
  ref,
  ...props
}) => (
  <IconButton
    ref={ref}
    variant={variant}
    title={title}
    aria-label={title}
    className={className}
    {...props}
  >
    <Trash2 size={14} className="shrink-0" />
  </IconButton>
);

/**
 * SubstituteIconButton - Muted outlined icon-only component for Substitute/Replace food actions.
 */
export const SubstituteIconButton: React.FC<ExplicitIconButtonProps> = ({
  className = '',
  title = 'Substituir alimento',
  variant = 'secondary',
  ref,
  ...props
}) => (
  <IconButton
    ref={ref}
    variant={variant}
    title={title}
    aria-label={title}
    className={cn(
      'border-border-subtle bg-surface text-text-muted hover:border-button-secondary-border-hover hover:bg-button-secondary-hover hover:text-text-primary',
      className
    )}
    {...props}
  >
    <ArrowLeftRight size={14} className="shrink-0" />
  </IconButton>
);

/**
 * DuplicateIconButton - Muted outlined icon-only component for duplicating food rows.
 */
export const DuplicateIconButton: React.FC<ExplicitIconButtonProps> = ({
  className = '',
  title = 'Duplicar alimento',
  variant = 'secondary',
  ref,
  ...props
}) => (
  <IconButton
    ref={ref}
    variant={variant}
    title={title}
    aria-label={title}
    className={cn(
      'border-border-subtle bg-surface text-text-muted hover:border-button-secondary-border-hover hover:bg-button-secondary-hover hover:text-text-primary',
      className
    )}
    {...props}
  >
    <CopyPlus size={14} className="shrink-0" />
  </IconButton>
);
