# Data Model & Interfaces: Preset Backdrop & Multiplicative Calculation

## DietPreset Entity

```typescript
export type MacroMode = 'absoluto' | 'multiplicativo';

export interface DietPreset {
  id: string;
  title: string;
  category: string;
  targetKcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  proteinMode?: MacroMode;
  proteinValue?: number;
  carbsMode?: MacroMode;
  carbsValue?: number;
  fatsMode?: MacroMode;
  fatsValue?: number;
  referenceWeight?: number;
  mealsCount: number;
  description: string;
}
```

## Patient Resolution Interface

```typescript
export interface ResolvedPresetNutrients {
  proteinG: number;
  carbsG: number;
  fatsG: number;
  targetKcal: number;
}
```

## Function Signatures (`src/lib/presetUtils.ts`)

```typescript
export function resolvePresetForPatient(
  preset: Partial<DietPreset>,
  patientWeight: number
): ResolvedPresetNutrients;
```
