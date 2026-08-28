# Data Model: Refatoração do botão Puxar Metas Anteriores com Modal de Seleção de Dietas

## 1. Entidades e Tipos de Dados

### 1.1. PreviousDietSummary (Resumo para Listagem no Modal)
Representa uma dieta anterior formatada para exibição e seleção na tabela do modal:

```typescript
export interface PreviousDietSummary {
  id: string;
  name: string;
  date: string;
  mode: 'simple' | 'carb_cycling';
  modeLabel: string;
  targetKcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  mealsCount: number;
  fullPlan?: FullDietPlan;
  historicalDiet?: HistoricalDiet;
}
```

### 1.2. ImportActionType
Ações disponíveis a partir da seleção de uma dieta anterior:

```typescript
export type ImportActionType = 'macros_only' | 'all_meals';
```

### 1.3. ImportPreviousDietModalProps
Contrato de propriedades do componente `ImportPreviousDietModal`:

```typescript
export interface ImportPreviousDietModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
  diets: PreviousDietSummary[];
  onPullMacrosOnly: (selectedDiet: PreviousDietSummary) => void;
  onPullAllMeals: (selectedDiet: PreviousDietSummary) => void;
}
```

### 1.4. DietBuilderTemplateProps (Atualização)
Extensão das props do template da página da dieta:

```typescript
export interface DietBuilderTemplateProps {
  // ...props existentes
  hasPreviousDiets?: boolean;
  onOpenImportPreviousDietModal?: () => void;
}
```

## 2. Regras de Transformação e Duplicação

### 2.1. Clonagem de Refeições para Duplicação
Ao executar `onPullAllMeals`, cada refeição e item do plano de origem é clonado gerando identificadores únicos:

```typescript
function cloneMealsWithFreshIds(meals: DietMeal[]): DietMeal[] {
  return meals.map((meal) => ({
    ...meal,
    id: `meal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    items: meal.items.map((item) => ({
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    })),
  }));
}
```

### 2.2. Preservação de Identificador de Rascunho
```typescript
const duplicatedPlan: FullDietPlan = {
  ...sourcePlan,
  id: 'nova', // ou dietaId da rota atual
  patientId: currentPatientId,
  name: `${sourcePlan.name} (Cópia)`, // ou mantém nome base para personalização
  updatedAt: new Date().toLocaleDateString('pt-BR'),
  simpleMeals: cloneMealsWithFreshIds(sourcePlan.simpleMeals || []),
  carbCyclingVariations: (sourcePlan.carbCyclingVariations || []).map((variation) => ({
    ...variation,
    meals: cloneMealsWithFreshIds(variation.meals || []),
  })),
};
```
