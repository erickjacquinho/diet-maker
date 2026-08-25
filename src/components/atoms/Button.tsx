'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button as ShadcnButton, ButtonProps as ShadcnButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ButtonProps = Omit<ShadcnButtonProps, 'variant' | 'size' | 'iconOnly'> & {
  variant?: 'primary' | 'secondary' | 'quiet' | 'destructive' | 'destructive-outline';
  size?: 'compact' | 'standard';
  iconOnly?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
};

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

export interface HoldToDeleteButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /**
   * Callback executado após a retenção completa do botão pelo tempo configurado em delayMs.
   */
  onConfirm?: () => void | Promise<void>;
  /**
   * Tempo de pressionamento necessário em milissegundos para confirmar a exclusão.
   * @default 1500 (1,5 segundos)
   */
  delayMs?: number;
  /**
   * Variante visual do botão.
   * @default 'destructive'
   */
  variant?: 'destructive' | 'destructive-outline';
  /**
   * Tamanho do botão.
   * @default 'standard'
   */
  size?: 'compact' | 'standard';
  /**
   * Ícone exibido ao lado do texto. Passe `null` para omitir o ícone.
   */
  icon?: React.ReactNode;
  /**
   * Conteúdo/rótulo exibido enquanto o botão está sendo ativamente pressionado.
   */
  holdingLabel?: React.ReactNode;
  /**
   * Rótulo acessível do botão para leitores de tela.
   */
  ariaLabel?: string;
  /**
   * Referência ao elemento HTML button.
   */
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * HoldToDeleteButton — Botão padronizado e adaptável com confirmação por retenção (press-delay de 1,5s)
 * e barra de progresso interna. Empregado exclusivamente em alertas e diálogos de confirmação de exclusão.
 */
export const HoldToDeleteButton: React.FC<HoldToDeleteButtonProps> = ({
  onConfirm,
  delayMs = 1500,
  variant = 'destructive',
  size = 'standard',
  icon,
  children = 'Excluir',
  holdingLabel,
  ariaLabel,
  disabled = false,
  className = '',
  title,
  ref,
  ...props
}) => {
  const [isHolding, setIsHolding] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleStartHold = useCallback(
    (e?: React.SyntheticEvent) => {
      if (disabled || isCompleted) return;
      setIsHolding(true);
      clearTimer();

      timerRef.current = setTimeout(() => {
        setIsCompleted(true);
        setIsHolding(false);
        if (onConfirm) {
          onConfirm();
        }
      }, delayMs);
    },
    [disabled, isCompleted, clearTimer, delayMs, onConfirm]
  );

  const handleCancelHold = useCallback(() => {
    if (isCompleted) return;
    clearTimer();
    setIsHolding(false);
  }, [isCompleted, clearTimer]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  useEffect(() => {
    if (disabled) {
      handleCancelHold();
    }
  }, [disabled, handleCancelHold]);

  const defaultIcon = icon !== undefined ? icon : (
    <Trash2 size={size === 'compact' ? 14 : 16} className="shrink-0 text-current" aria-hidden="true" />
  );

  const delaySecondsText = (delayMs / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  const defaultAriaLabel = ariaLabel || `Pressione e segure por ${delaySecondsText} segundos para confirmar a exclusão`;
  const defaultTitle = title || `Pressione e segure por ${delaySecondsText}s para excluir`;

  const progressBgClass = variant === 'destructive-outline' ? 'bg-error/20' : 'bg-black/25';

  return (
    <ShadcnButton
      ref={ref}
      type="button"
      variant={variant}
      size={size}
      disabled={disabled}
      aria-label={defaultAriaLabel}
      title={defaultTitle}
      onPointerDown={(e) => {
        if (e.button === 0) handleStartHold(e);
      }}
      onPointerUp={handleCancelHold}
      onPointerLeave={handleCancelHold}
      onPointerCancel={handleCancelHold}
      onTouchStart={handleStartHold}
      onTouchEnd={handleCancelHold}
      onTouchCancel={handleCancelHold}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          if (!isHolding && !e.repeat) {
            handleStartHold(e);
          }
        }
      }}
      onKeyUp={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          handleCancelHold();
        }
      }}
      onBlur={handleCancelHold}
      onClick={(e) => {
        e.preventDefault();
      }}
      className={cn(
        'relative overflow-hidden select-none cursor-pointer transition-all',
        isHolding && 'scale-[0.98]',
        className
      )}
      {...props}
    >
      {/* Barra Interna de Progresso */}
      <span
        aria-hidden="true"
        data-testid="hold-progress-bar"
        className={cn(
          'absolute inset-y-0 left-0 pointer-events-none rounded-inherit transition-all',
          progressBgClass
        )}
        style={{
          width: isHolding ? '100%' : '0%',
          transition: isHolding ? `width ${delayMs}ms linear` : 'width 200ms ease-out',
        }}
      />

      {/* Conteúdo do Botão (Ícone e Rótulo) */}
      <span className="relative z-10 flex items-center justify-center gap-1.5 w-full pointer-events-none">
        {defaultIcon}
        <span>{isHolding && holdingLabel ? holdingLabel : children}</span>
      </span>
    </ShadcnButton>
  );
};
