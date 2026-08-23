# Data Model: Duas Tabelas Especializadas

## Estruturas de Dados

```typescript
// Modelo da Tabela de Avaliações
export interface AssessmentRowData {
  assessment: BodyAssessment;
  date: string;
  weightKg?: number;
  bodyFatPercent?: number;
  muscleMassKg?: number;
  waistCm?: number;
  hasPerimeters: boolean;
}

// Modelo da Tabela de Dietas
export interface DietRowData {
  diet: HistoricalDiet;
  date: string;
  name: string;
  status: 'Ativa' | 'Histórica';
  targetKcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
}
```
