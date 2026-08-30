# Data Model: MacroSummary Component

## Interfaces e Entidades

### `MacroSummaryProps`

```typescript
export interface MacroSummaryProps {
  /** Quantidade de proteínas em gramas ou texto formatado */
  protein: number | string;
  /** Quantidade de carboidratos em gramas ou texto formatado */
  carbs: number | string;
  /** Quantidade de gorduras em gramas ou texto formatado */
  fats: number | string;
  /** Quantidade de calorias (kcal) calculadas ou meta */
  kcal?: number | string;
  /** Flag explícita para forçar a exibição ou ocultação das calorias */
  showKcal?: boolean;
  /** Unidade de medida para os macronutrientes (padrão: "g") */
  unit?: string;
  /** Sufixo de texto para calorias (padrão: "kcal") */
  kcalSuffix?: string;
  /** Exibe os identificadores semânticos "P", "C", "G" (padrão: true) */
  showLabels?: boolean;
  /** Classes adicionais para customização controlada */
  className?: string;
  /** Test identifier para testes automatizados */
  'data-testid'?: string;
}
```

### Regras de Precedência e Derivação

- `isKcalVisible = (showKcal !== false) && (kcal !== undefined && kcal !== null && kcal !== '');`
- `proteinDisplay = showLabels ? 'P ' + protein + unit : protein + unit;`
- `carbsDisplay = showLabels ? 'C ' + carbs + unit : carbs + unit;`
- `fatsDisplay = showLabels ? 'G ' + fats + unit : fats + unit;`
