# Research: Modularização da Barra de Proporção de Macronutrientes

## Decision 1: API de Props e Padrão de Composição da Molécula
- **Decision**: Projetar a molécula `MacroProportionBar` com interface declarativa, aceitando valores numéricos simples (`proteinG`, `carbsG`, `fatsG`), com cálculo interno automático de `% VET` via `calculateMacroDistributionPct` e suporte a customizações opcionais (`title`, `showLegend`, `showCalories`, `showKcalPerMacro`, `showGrams`, `showTotalPct`, `size`, `emptyMessage`, `className`).
- **Rationale**: Permite que qualquer consumidor (cards compactos, modais detalhados, resumos em páginas) use o componente com 1 linha de código sem ter que calcular calorias ou percentuais externamente.
- **Alternatives Considered**: 
  - Exigir que o chamador passe os percentuais calculados: Rejeitado porque gera duplicação de lógica e risco de inconsistência matemática nos consumidores.
  - Criar dois componentes separados (`MealProportionBar` e `GoalsProportionBar`): Rejeitado porque a renderização e regras visuais são idênticas (violação do princípio DRY e Atomic Design).

## Decision 2: Ordem Canônica Normativa e Cores Semânticas
- **Decision**: Impor estritamente a ordem canônica do Design System (`1º Proteína`, `2º Carboidrato`, `3º Gordura`, `4º Calorias`) e os tokens semânticos (`bg-macro-protein`, `bg-macro-carbohydrate`, `bg-macro-fat`, `text-macro-*`).
- **Rationale**: Alinhamento com a Constituição do projeto e com `design-system/components/categories/nutrition-domain.md`.
- **Alternatives Considered**: Permitir ordenação customizada via props: Rejeitado porque o Design System proíbe expressamente inverter a ordem canônica nutricional.

## Decision 3: Acessibilidade e Semântica WCAG 2.2 AA
- **Decision**: Utilizar `role="progressbar"`, `aria-label="Distribuição calórica dos macronutrientes"` (ou customizável via prop), `aria-valuenow={100}`, `aria-valuemin={0}`, `aria-valuemax={100}` e atributos `title` informativos em cada segmento da barra.
- **Rationale**: Garante leitura precisa por leitores de tela e conformidade estrita com o Princípio III da Constituição.
