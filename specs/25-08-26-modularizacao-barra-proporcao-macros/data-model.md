# Data Model & Tipagem: MacroProportionBar

## MacroProportionBarProps

```typescript
export interface MacroProportionBarProps {
  /** Gramas de proteína (P) */
  proteinG: number;
  /** Gramas de carboidrato (C) */
  carbsG: number;
  /** Gramas de gorduras (G) */
  fatsG: number;
  /** Calorias totais (kcal). Opcional; se omitido, calcula via fatores de Atwater (4-4-9). */
  kcal?: number;
  /** Título opcional exibido no topo da barra (ex: "Distribuição Calórica (% VET)") */
  title?: React.ReactNode;
  /** Exibir percentual total (ex: "100%") à direita do título. Padrão: false */
  showTotalPct?: boolean;
  /** Exibir a legenda com macros. Padrão: true */
  showLegend?: boolean;
  /** Exibir o total de calorias na legenda/barra. Padrão: true */
  showCalories?: boolean;
  /** Exibir calorias individuais calculadas por macro (ex: "320 kcal"). Padrão: false */
  showKcalPerMacro?: boolean;
  /** Exibir gramaturas na legenda (ex: "80g"). Padrão: true */
  showGrams?: boolean;
  /** Exibir percentuais individuais na legenda (ex: "40%"). Padrão: true */
  showPct?: boolean;
  /** Densidade visual / tamanho da barra e fontes. Padrão: 'compact' */
  size?: 'compact' | 'standard';
  /** Mensagem customizada para estado vazio (quando macros = 0). Opcional */
  emptyMessage?: string;
  /** Classes CSS adicionais do container */
  className?: string;
}
```

## MacroDistribution (Retorno de `calculateMacroDistributionPct`)

```typescript
export interface MacroDistribution {
  proteinPct: number;
  carbsPct: number;
  fatsPct: number;
  proteinKcal: number;
  carbsKcal: number;
  fatsKcal: number;
  totalKcal: number;
}
```
