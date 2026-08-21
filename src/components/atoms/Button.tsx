import React from 'react';
import { Plus } from 'lucide-react';
import { Button as ShadcnButton, ButtonProps as ShadcnButtonProps } from '@/components/ui/button';

export type ButtonProps = Omit<ShadcnButtonProps, 'variant' | 'size' | 'iconOnly'> & {
  variant?: 'primary' | 'secondary' | 'quiet' | 'destructive' | 'destructive-outline';
  size?: 'compact' | 'standard';
  iconOnly?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'standard',
  iconOnly = false,
  className = '',
  ref,
  ...props
}) => (
  <ShadcnButton
    ref={ref}
    variant={variant}
    size={size}
    iconOnly={iconOnly}
    className={className}
    {...props}
  />
);

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
    {icon !== null && (icon || <Plus size={14} className="shrink-0 text-on-primary" />)}
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
