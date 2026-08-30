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

Apresentar a barra de proporção multi-segmentada e distribuição calórica percentual (% VET) dos macronutrientes (Proteínas, Carboidratos e Gorduras) e total calórico, acompanhada de grade de detalhamento com divisores verticais, seguindo a ordem canônica normativa do domínio de nutrição.

## Category inheritance

Herda integralmente [nutrition-domain](../../categories/nutrition-domain.md) e [data-display](../../categories/data-display.md). Fundamentos globais e ordem canônica normativa prevalecem sobre este perfil.

## Specific anatomy

Root `MacroProportionBar` renderiza:
1. **Header de Contexto**: Título opcional (`Distribuição Calórica (% VET)`) com token `text-style-chart-micro font-semibold text-text-muted` e percentual total (`100%`) em `font-bold text-text-primary`.
2. **Barra Multi-Segmentada**: Horizontal (`role="progressbar"`), com segmentos coloridos proporcionais (`bg-macro-protein`, `bg-macro-carbohydrate`, `bg-macro-fat`).
3. **Grade Inferior com Divisores Verticais (Variação de Refeição)**: `grid divide-x divide-border-divider` com 4 colunas perfeitamente alinhadas verticalmente:
   - **Coluna 1 (Proteínas)**: Ponto colorido `bg-macro-protein` + `Proteínas` → Linha 2 com gramatura em destaque `text-macro-protein` + `·` + percentual e calorias do macro em `text-style-chart-micro`.
   - **Coluna 2 (Carboidratos)**: Ponto colorido `bg-macro-carbohydrate` + `Carboidratos` → Linha 2 com gramatura em destaque `text-macro-carbohydrate` + `·` + percentual e calorias do macro em `text-style-chart-micro`.
   - **Coluna 3 (Gorduras)**: Ponto colorido `bg-macro-fat` + `Gorduras` → Linha 2 com gramatura em destaque `text-macro-fat` + `·` + percentual e calorias do macro em `text-style-chart-micro`.
   - **Coluna 4 (Calorias)**: Ícone `Flame text-warning` + `Calorias` → Linha 2 com total calórico em destaque `text-text-primary` + `·` + `Total`.
4. **Fallback de Estado Vazio**: Mensagem amigável estilizada para quando não há metas/alimentos inseridos.

## Typography Tokens Validation

O componente utiliza estritamente a escala tipográfica canônica:
- **Títulos & Rótulos de Seção**: `text-style-chart-micro` (`font-size: 11px`, `line-height: 14px`, `font-semibold`).
- **Valores Numéricos Principais**: `text-style-body` (`font-size: 14px`, `font-bold`, `tabular-nums`).
- **Unidades de Medida (g, kcal)**: `text-style-legal` (`font-size: 12px`, `font-medium`, `text-text-muted`).
- **Separadores & Subtítulos**: `text-style-chart-micro` (`font-size: 11px`, `font-normal`, `text-text-muted`, `tabular-nums`).

## Allowed variants

- `size`: `compact` (barra h-2, padding reduzido para cards) ou `standard` (barra h-2.5 para modais e visões completas de refeição).
- `showDividers`: `boolean` (exibe a grade inferior com divisores verticais; padrão `true`).
- `showCalories`: `boolean` (inclui a 4ª coluna de Calorias Totais; padrão `true`).
- `showTotalPct`: `boolean` (exibe `100%` no header; padrão `true`).
- `title`: `ReactNode | false` (título contextual; padrão `"Distribuição Calórica (% VET)"`).

## Consumers

- `MealCardContainer` (`src/components/organisms/MealCardContainer.tsx`)
- `AdjustDietGoalsModal` (`src/components/molecules/AdjustDietGoalsModal.tsx`)
- `ReadOnlyDietModal` (`src/components/molecules/ReadOnlyDietModal.tsx`)
- `ReadyMealsPage` (`src/app/refeicoes-prontas/page.tsx`)

## Acceptance criteria

- Ordem canônica (`P → C → G → kcal`) rigorosamente respeitada;
- Alinhamento vertical centralizado de todos os itens da linha de métricas;
- Cores semânticas oficiais aplicadas em barras, pontos e números;
- Acessibilidade WCAG 2.2 AA com `role="progressbar"`, `aria-label` e `title` descritivos;
- 100% dos testes unitários e de integração aprovados.

## Implementation status

Implementado em `molecule`; perfil homologado documentalmente.
