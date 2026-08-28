# Data Model: Adequação e Centralização da Página de Elaboração de Dieta

## Entidades e Contratos de Tipos

### BadgeVariant
```typescript
export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'emerald'
  | 'charcoal'
  | 'neutral'
  | 'protein'
  | 'carbohydrate'
  | 'fat'
  | 'kcal';
```

### DietMeal
```typescript
export interface DietMeal {
  id: string;
  name: string;
  time: string;
  items: DietItem[];
}
```

### DietItem
```typescript
export interface DietItem {
  id: string;
  foodId?: string;
  name: string;
  quantityGrams: number;
  protein: number;
  carbs: number;
  fats: number;
  kcal: number;
}
```

### FullDietPlan
```typescript
export interface FullDietPlan {
  id: string;
  patientId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  mode: 'simple' | 'carb_cycling';
  simpleTargetKcal: number;
  simpleTargetProtein: number;
  simpleTargetCarbs: number;
  simpleTargetFats: number;
  simpleMeals: DietMeal[];
  carbCyclingVariationsCount: 2 | 3;
  carbCyclingVariations: CarbCyclingVariation[];
}
```
