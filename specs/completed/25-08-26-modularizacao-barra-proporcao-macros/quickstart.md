# Quickstart: Como Utilizar a MacroProportionBar

A molécula `MacroProportionBar` é exportada diretamente em `@/components/molecules` e pode ser instanciada em qualquer tela, modal ou componente.

## Exemplo 1: Uso Básico em Card de Refeição (Compacto)

```tsx
import { MacroProportionBar } from '@/components/molecules';

export function MealSummary({ meal }) {
  return (
    <MacroProportionBar
      proteinG={meal.proteinG}
      carbsG={meal.carbsG}
      fatsG={meal.fatsG}
      kcal={meal.kcal}
    />
  );
}
```

## Exemplo 2: Uso Detalhado com Título e Kcal por Macro (Modal de Metas)

```tsx
import { MacroProportionBar } from '@/components/molecules';

export function GoalsDistributionPanel({ protG, carbG, fatG }) {
  return (
    <MacroProportionBar
      proteinG={protG}
      carbsG={carbG}
      fatsG={fatG}
      title="Distribuição Calórica (% VET)"
      showTotalPct
      showKcalPerMacro
      emptyMessage="Nenhuma meta inserida. Digite os valores para visualizar a distribuição calórica (% VET)."
    />
  );
}
```

## Exemplo 3: Apenas a Barra Visual (Sem Legenda)

```tsx
import { MacroProportionBar } from '@/components/molecules';

export function MinimalMacroBar({ protG, carbG, fatG }) {
  return (
    <MacroProportionBar
      proteinG={protG}
      carbsG={carbG}
      fatsG={fatG}
      showLegend={false}
    />
  );
}
```
