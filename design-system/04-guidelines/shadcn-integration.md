# 04-guidelines / shadcn-integration — Preservação do Shadcn UI & Componentes Filhos

> **NutriDiet Design System — Regra Fundamental de Código e Manutenibilidade**

---

## 🛡️ Regra da Preservação do Shadcn UI

Os componentes base do **Shadcn UI** gerados em `src/components/ui/` (ex: `button.tsx`, `dialog.tsx`, `input.tsx`, `badge.tsx`, `card.tsx`) **NÃO DEVEM** ser poluídos com regras de negócio da nutrição, nem modificados com classes hardcoded que restrinjam seu reuso.

### Princípios de Extensão:

1. **Camada Base Intocada (`src/components/ui/`)**:
   - Permanece 100% genérica, limpa e atualizável pela CLI do Shadcn.

2. **Componentes Filhos / Wrappers (`src/components/atoms/`, `src/components/molecules/`)**:
   - Toda lógica de domínio (cálculo de g/kg, cores de macronutrientes, formatação TACO) deve ser implementada em **componentes filhos** que importam os componentes de `src/components/ui/`.
   - Exemplo: `NutriButton` estende `Button` do Shadcn UI aplicando os tokens `bg-charcoal-900` ou `bg-emerald-700`.

3. **Primitivos obrigatórios**:
   - Button, Input, Label, Badge, Checkbox, Switch, RadioGroup, Select, Dialog, Popover, Table, Tabs, Tooltip, Sheet e Sonner permanecem genéricos em `src/components/ui/`.
   - Wrappers nutricionais compõem esses primitivos; não reimplementam foco, trapping de modal ou navegação por teclado.

4. **Toasts**:
   - A infraestrutura usa Sonner.
   - `NutriToast` define conteúdo e anatomia visual das variantes semânticas.
   - O wrapper não cria estado paralelo de toast nem altera o primitivo da biblioteca.

5. **Classes e tokens**:
   - Usar `cn()` para composição.
   - Nenhum wrapper usa valor hex, sombra ou gradiente.
   - Classes de foco, z-index e cor devem existir no mapa Tailwind oficial.

---

## 💻 Exemplo Prático de Implementação (Padrão Wrapper)

```tsx
// src/components/atoms/Button.tsx
import React from 'react';
import { Button as ShadcnButton, ButtonProps as ShadcnButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface NutriButtonProps extends Omit<ShadcnButtonProps, 'variant'> {
  variant?: 'primary' | 'emerald' | 'secondary' | 'ghost' | 'pill';
}

export const NutriButton = React.forwardRef<HTMLButtonElement, NutriButtonProps>(
  ({ className, variant = 'primary', children, ...props }, ref) => {
    const variantStyles = {
      primary: 'bg-charcoal-900 text-white hover:bg-charcoal-800 active:scale-[0.98]',
      emerald: 'bg-emerald-700 text-white hover:bg-emerald-600 active:scale-[0.98]',
      secondary: 'bg-warm-card text-warm-main border border-warm-border hover:bg-warm-inner',
      ghost: 'bg-transparent text-warm-secondary hover:bg-warm-inner hover:text-warm-main',
      pill: 'bg-warm-inner text-warm-secondary border border-warm-border rounded-full px-3.5 py-1.5 text-xs',
    };

    return (
      <ShadcnButton
        ref={ref}
        className={cn(
          'rounded-xl font-body font-medium transition-all duration-150',
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </ShadcnButton>
    );
  }
);

NutriButton.displayName = 'NutriButton';
```
