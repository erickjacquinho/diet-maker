import React from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button as ShadcnButton, ButtonProps as ShadcnButtonProps } from '@/components/ui/button';

export type ButtonProps = Omit<ShadcnButtonProps, 'variant' | 'size'> & {
  variant?: 'primary' | 'secondary' | 'quiet' | 'terracotta' | 'emerald' | 'ghost' | 'danger' | 'default' | 'destructive' | 'outline' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'default' | 'icon' | 'compact' | 'standard';
  ref?: React.Ref<HTMLButtonElement>;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'standard',
  className = '',
  ref,
  ...props
}) => {
  let shadcnVariant: ShadcnButtonProps['variant'] = 'secondary';
  if (variant === 'primary' || variant === 'default' || variant === 'terracotta' || variant === 'emerald') {
    shadcnVariant = 'primary';
  } else if (variant === 'danger' || variant === 'destructive') {
    shadcnVariant = 'destructive';
  } else if (variant === 'ghost' || variant === 'quiet') {
    shadcnVariant = 'quiet';
  } else if (variant === 'outline' || variant === 'secondary') {
    shadcnVariant = 'secondary';
  } else if (variant === 'link') {
    shadcnVariant = 'link';
  }

  let shadcnSize: ShadcnButtonProps['size'] = 'standard';
  if (size === 'sm' || size === 'compact') {
    shadcnSize = 'compact';
  } else if (size === 'lg' || size === 'standard' || size === 'default') {
    shadcnSize = 'standard';
  } else if (size === 'icon') {
    shadcnSize = 'icon';
  }

  return (
    <ShadcnButton
      ref={ref}
      variant={shadcnVariant}
      size={shadcnSize}
      className={className}
      {...props}
    />
  );
};

export interface CreateButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  children: React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * CreateButton - Standardized Primary Creation Action Button ("+ Nova Dieta", "+ Novo Treino", "+ Novo Paciente", etc.)
 * Follows UI/UX Pro Max design consistency & Vercel Composition Patterns (patterns-explicit-variants).
 */
export const CreateButton: React.FC<CreateButtonProps> = ({
  icon,
  children,
  className = '',
  ref,
  ...props
}) => (
  <ShadcnButton
    ref={ref}
    variant="primary"
    size="standard"
    className={`gap-1.5 cursor-pointer ${className}`}
    {...props}
  >
    {icon !== null && (icon || <Plus size={14} className="shrink-0 text-on-primary text-white" />)}
    <span>{children}</span>
  </ShadcnButton>
);

export interface SecondaryActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  children: React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * SecondaryActionButton - Standardized Secondary Action Button across the application
 * Follows UI/UX Pro Max design consistency & Vercel Composition Patterns (patterns-explicit-variants).
 */
export const SecondaryActionButton: React.FC<SecondaryActionButtonProps> = ({
  icon,
  children,
  className = '',
  ref,
  ...props
}) => (
  <ShadcnButton
    ref={ref}
    variant="secondary"
    size="standard"
    className={`gap-1.5 cursor-pointer ${className}`}
    {...props}
  >
    {icon}
    <span>{children}</span>
  </ShadcnButton>
);

export type IconButtonProps = ShadcnButtonProps & {
  'aria-label'?: string;
  title?: string;
  icon?: React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * IconButton - Icon-only action button component wrapper over UI Button
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
  const label = ariaLabel || title || 'Botão de ação';
  return (
    <ShadcnButton
      ref={ref}
      variant={variant}
      size="icon"
      aria-label={label}
      title={title || ariaLabel}
      className={`shrink-0 cursor-pointer ${className}`}
      {...props}
    >
      {icon || children}
    </ShadcnButton>
  );
};

export type ExplicitIconButtonProps = Omit<IconButtonProps, 'icon'> & {
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * EditIconButton - Standardized icon-only component for Edit actions across the application.
 */
export const EditIconButton: React.FC<ExplicitIconButtonProps> = ({
  className = '',
  title = 'Editar',
  ref,
  ...props
}) => (
  <IconButton
    ref={ref}
    title={title}
    aria-label={title}
    className={`bg-surface-subtle border border-border-subtle text-text-muted hover:text-text-primary hover:bg-surface hover:border-border-hover transition-colors duration-standard cursor-pointer ${className}`}
    {...props}
  >
    <Pencil size={14} className="text-text-muted" />
  </IconButton>
);

/**
 * DeleteIconButton - Standardized icon-only component for Delete actions across the application.
 */
export const DeleteIconButton: React.FC<ExplicitIconButtonProps> = ({
  className = '',
  title = 'Excluir',
  ref,
  ...props
}) => (
  <IconButton
    ref={ref}
    title={title}
    aria-label={title}
    className={`bg-surface-subtle border border-border-subtle text-error hover:bg-error-soft hover:border-error-border transition-colors duration-standard cursor-pointer ${className}`}
    {...props}
  >
    <Trash2 size={14} className="text-error" />
  </IconButton>
);
