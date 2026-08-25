# MacroProportionBar

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-macro-proportion-bar` |
| Nature | `domain-nutrition` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/MacroProportionBar.tsx` |
| Public exports | `MacroProportionBarProps` (type), `MacroProportionBar` (component) |

## Purpose

Apresentar a barra de proporção multi-segmentada e distribuição calórica percentual (% VET) dos macronutrientes (Proteínas, Carboidratos e Gorduras) e total calórico, seguindo a ordem canônica normativa do domínio de nutrição.

## Category inheritance

Herda integralmente [nutrition-domain](../../categories/nutrition-domain.md) e [data-display](../../categories/data-display.md). Fundamentos globais e ordem canônica normativa prevalecem sobre este perfil.

## Specific anatomy

Root `MacroProportionBar` renderiza:
1. Header opcional com título e percentual total (100%).
2. Barra horizontal multi-segmentada (`role="progressbar"`) com segmentos coloridos proporcionais (`bg-macro-protein`, `bg-macro-carbohydrate`, `bg-macro-fat`).
3. Legenda descritiva seguindo estritamente a ordem canônica normativa (`1º Proteínas`, `2º Carboidratos`, `3º Gorduras`, `4º Total Calorias`).
4. Fallback amigável de estado vazio para quando todos os macronutrientes somam zero.

## Allowed variants

- `size`: `compact` (barra h-2, padding reduzido para cards) ou `standard` (barra h-2.5 para modais e visões detalhadas).
- `showLegend`: `boolean` (exibe ou oculta a legenda inferior).
- `showCalories`: `boolean` (exibe ou oculta o total de calorias).
- `showKcalPerMacro`: `boolean` (exibe calorias calculadas por macro na legenda).
- `showGrams`: `boolean` (exibe gramaturas de cada macro).
- `showTotalPct`: `boolean` (exibe `100%` no header).

## Composition

Base declarada: `src/components/molecules/MacroProportionBar.tsx`. Dependências: `calculateMacroDistributionPct` e `calculatePresetCalories` em `src/lib/nutrition/`.

## Consumers

- `AdjustDietGoalsModal` (`src/components/molecules/AdjustDietGoalsModal.tsx`)
- `MealCardContainer` (`src/components/organisms/MealCardContainer.tsx`)

## Acceptance criteria

- Ordem canônica (`P → C → G → kcal`) respeitada em todos os modos;
- Cores semânticas oficiais aplicadas em barras e indicadores;
- Acessibilidade WCAG 2.2 AA com `role="progressbar"`, `aria-label` e `title` descritivos;
- 100% dos testes unitários e de integração aprovados.

## Implementation status

Implementado em `molecule`; perfil homologado documentalmente.
