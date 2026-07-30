import React from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button as ShadcnButton, ButtonProps as ShadcnButtonProps } from '@/components/ui/button';

export interface ButtonProps extends Omit<ShadcnButtonProps, 'variant' | 'size'> {
  variant?: 'primary' | 'secondary' | 'terracotta' | 'emerald' | 'ghost' | 'danger' | 'default' | 'destructive' | 'outline' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'default' | 'icon';
  ref?: React.Ref<HTMLButtonElement>;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  className = '',
  ref,
  ...props
}) => {
  let shadcnVariant: ShadcnButtonProps['variant'] = 'secondary';
  if (variant === 'primary' || variant === 'default') shadcnVariant = 'default';
  else if (variant === 'terracotta') shadcnVariant = 'terracotta';
  else if (variant === 'emerald') shadcnVariant = 'emerald';
  else if (variant === 'danger' || variant === 'destructive') shadcnVariant = 'destructive';
  else if (variant === 'ghost') shadcnVariant = 'ghost';
  else if (variant === 'outline') shadcnVariant = 'outline';
  else if (variant === 'link') shadcnVariant = 'link';

  let shadcnSize: ShadcnButtonProps['size'] = 'default';
  if (size === 'sm') shadcnSize = 'sm';
  else if (size === 'lg') shadcnSize = 'lg';
  else if (size === 'icon') shadcnSize = 'icon';

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
    variant="emerald"
    className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer ${className}`}
    {...props}
  >
    {icon !== null && (icon || <Plus size={14} className="shrink-0" />)}
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
    variant="outline"
    className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer ${className}`}
    {...props}
  >
    {icon}
    <span>{children}</span>
  </ShadcnButton>
);

export interface IconButtonProps extends ShadcnButtonProps {
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
  variant = 'ghost',
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
      className={`h-8 w-8 rounded-lg shrink-0 cursor-pointer active:scale-95 transition-all ${className}`}
      {...props}
    >
      {icon || children}
    </ShadcnButton>
  );
};

export interface ExplicitIconButtonProps extends Omit<IconButtonProps, 'icon'> {
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
    className={`bg-warm-inner border border-warm-border text-warm-muted hover:text-warm-charcoal hover:bg-warm-card hover:border-warm-borderDark transition-all cursor-pointer ${className}`}
    {...props}
  >
    <Pencil size={14} className="text-warm-muted" />
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
    className={`bg-warm-inner border border-warm-border text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all cursor-pointer ${className}`}
    {...props}
  >
    <Trash2 size={14} />
  </IconButton>
);
