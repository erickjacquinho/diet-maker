'use client';

import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface DropdownActionItem {
  /** Identificador único da ação */
  id: string;
  /** Rótulo textual da ação */
  label: string;
  /** Ícone opcional exibido à esquerda */
  icon?: React.ReactNode;
  /** Callback acionado ao selecionar o item */
  onSelect: () => void;
  /** Variante semântica visual do item */
  variant?: 'default' | 'destructive';
  /** Se o item está desabilitado */
  disabled?: boolean;
}

export interface ActionDropdownProps {
  /** Elemento customizado para disparar o dropdown */
  trigger?: React.ReactNode;
  /** Rótulo textual para o botão gatilho padrão */
  triggerLabel?: string;
  /** Ícone para o botão gatilho padrão */
  triggerIcon?: React.ReactNode;
  /** Variante do botão gatilho padrão */
  triggerVariant?: 'primary' | 'secondary' | 'quiet';
  /** Tamanho do botão gatilho */
  size?: 'compact' | 'standard';
  /** Alinhamento do menu suspenso em relação ao gatilho */
  align?: 'start' | 'center' | 'end';
  /** Lista de ações executáveis */
  items: readonly DropdownActionItem[] | DropdownActionItem[];
  /** Classes CSS adicionais para o container ou trigger */
  className?: string;
  /** Rótulo acessível do botão */
  'aria-label'?: string;
}

export function ActionDropdown({
  trigger,
  triggerLabel,
  triggerIcon = <MoreHorizontal size={15} aria-hidden="true" />,
  triggerVariant = 'secondary',
  size = 'compact',
  align = 'end',
  items,
  className = '',
  'aria-label': ariaLabel,
}: ActionDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant={triggerVariant}
            size={size}
            aria-label={ariaLabel || triggerLabel || 'Mais ações'}
            className={cn('flex items-center gap-1.5', className)}
          >
            {triggerIcon}
            {triggerLabel && <span>{triggerLabel}</span>}
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} className="min-w-44">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.id}
            disabled={item.disabled}
            onSelect={item.onSelect}
            className={cn(
              'flex items-center gap-2 cursor-pointer',
              item.variant === 'destructive' && 'text-error focus:text-error',
            )}
          >
            {item.icon && <span className="shrink-0">{item.icon}</span>}
            <span>{item.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

ActionDropdown.displayName = 'ActionDropdown';
