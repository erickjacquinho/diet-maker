# 03-components / 01-atoms — Átomos canônicos

> Wrappers tokenizados sobre Shadcn UI. Nenhum item desta lista é “futuro”: todos fazem parte do contrato do Design System.

## Contrato universal

- Estados: `default`, `hover`, `active`, `focus-visible`, `disabled`, `loading` e, quando aplicável, `error`/`success`.
- Foco: ring de 2px `ring-warm-focus`, offset de 2px.
- Touch: área clicável mínima de 44×44px; controles compactos podem manter aparência menor dentro dessa área.
- Ícones: somente Lucide React; botão apenas com ícone exige `aria-label`.
- Estilo: tokens semânticos, zero sombra e zero gradiente.

## 1. `NutriButton`

```ts
type ButtonVariant =
  | "primary"
  | "emerald"
  | "secondary"
  | "outline"
  | "ghost"
  | "pill"
  | "destructive"
  | "link";

type ButtonSize = "sm" | "md" | "lg" | "icon";
```

| Variante | Resting | Hover | Active |
| :--- | :--- | :--- | :--- |
| Primary | `bg-charcoal-900 text-white` | `bg-charcoal-800` | `bg-charcoal-950 scale-[.98]` |
| Emerald | `bg-emerald-700 text-white` | `bg-emerald-600` | `scale-[.98]` |
| Secondary/Outline | `bg-warm-card border-warm-border` | `bg-warm-inner border-warm-borderDark` | `scale-[.98]` |
| Ghost | `bg-transparent text-warm-secondary` | `bg-warm-inner text-warm-main` | `scale-[.98]` |
| Pill | `bg-warm-inner border-warm-border rounded-pill` | `bg-warm-card border-warm-borderDark` | `scale-[.96]` |
| Destructive | `bg-nutri-error-bg text-nutri-error-text` | fundo sólido rose e texto branco | `scale-[.98]` |
| Link | transparente, texto emerald e underline offset | underline visível | sem deslocar layout |

Disabled usa token muted, `aria-disabled`/`disabled` e não responde ao pointer. Loading mantém o rótulo, exibe spinner Lucide e usa `aria-busy`.

Subcomponentes: `CreateButton`, `EditIconButton` e `DeleteIconButton`.

## 2. `NutriInput`

- Base: `h-10 bg-warm-card border-warm-border rounded-control`.
- Label externa obrigatória; placeholder é exemplo, não label.
- Focus: `border-warm-borderDark ring-2 ring-warm-focus`.
- Error: borda e helper `nutri-error`, `aria-invalid="true"`.
- Success: borda e helper `nutri-success`.
- Disabled: `bg-warm-inner`, texto disabled.
- Numérico: `inputMode="decimal"` ou `"numeric"` conforme o domínio.

## 3. `NutriBadge`

Variantes: `neutral`, `info/fats`, `success/fibers`, `warning/carbs`, `error/protein`. Forma pill, borda de 1px e texto explícito. Status nunca é comunicado somente pela cor.

## 4. `NutriCard`

- Principal: `bg-warm-card border border-warm-border rounded-card p-lg`.
- Interno: `bg-warm-inner border border-warm-border rounded-control p-md`.
- Estático não tem hover.
- Interativo recebe foco, cursor, nome acessível e estados definidos em `component-states-rules.md`.

## 5. `ProgressBar`

- Trilha: `bg-warm-border h-2 rounded-pill`.
- Preenchimento: cor semântica sólida e `transition-transform`.
- Expõe `aria-valuemin`, `aria-valuemax`, `aria-valuenow` e rótulo textual visível.

## 6. `Avatar`

Tamanhos visuais: 32, 36 e 44px. Forma `rounded-pill`; variantes `emerald`, `charcoal` e `inner`. Imagem exige `alt`; iniciais decorativas usam nome completo adjacente ou acessível.

## 7. `SparklineLine`

SVG padrão 120×32px, stroke de 2px e nó terminal. Props incluem `data`, `width`, `height`, `label` e `summary`. Exige:

- título/descrição acessível ou `aria-hidden` quando duplicar texto;
- valor atual e tendência visíveis fora do SVG;
- nenhuma dependência exclusiva de cor;
- zero fill em gradiente.

## 8. `NutriCheckbox`

Controle circular de 20px dentro de hit area de 44px. Usa primitivo Shadcn Checkbox, ícone Lucide `Check`, label associado e estados checked, unchecked, indeterminate, focus e disabled.

## 9. `NutriStepper`

Botões `Minus`/`Plus`, display `font-mono` e container `rounded-control`. Exige valor mínimo/máximo, desabilitação nos limites, `aria-label` contextual e atualização por teclado.

## 10. `NutriSwitch`

Trilha 44×24px, knob 20px, forma pill e transição de 150ms. Usa Shadcn Switch ou Radix; label visível, `aria-checked` e estados focus/disabled.

## 11. `NutriSkeleton`

Reserva as dimensões finais, usa superfícies sólidas `warm-border`/`warm-inner`, pulso de 1.5s e desativa animação em reduced motion.

## 12. `GoalHistogram`

Conjunto compacto de barras verticais sólidas com `rounded-sm`, utilizado ao lado do stepper de metas.

- Cada barra representa valor temporal; o valor atual permanece visível em texto.
- Fornece resumo como “média de 7 dias” e alternativa tabular quando a série for essencial.
- Barras não usam gradiente, sombra ou cor como único indicador.
