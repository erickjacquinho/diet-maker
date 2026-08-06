import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button, ButtonProps } from './Button';

export type IconButtonProps = Omit<ButtonProps, 'iconOnly'> & {
  'aria-label'?: string;
  title?: string;
  icon?: React.ReactNode;
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
      size="standard"
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
 * EditIconButton - Quiet icon-only component for Edit actions across the application.
 */
export const EditIconButton: React.FC<ExplicitIconButtonProps> = ({
  className = '',
  title = 'Editar',
  ref,
  ...props
}) => (
  <IconButton
    ref={ref}
    variant="quiet"
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
  ref,
  ...props
}) => (
  <IconButton
    ref={ref}
    variant="destructive"
    title={title}
    aria-label={title}
    className={className}
    {...props}
  >
    <Trash2 size={14} className="shrink-0" />
  </IconButton>
);
