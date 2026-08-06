# Data Model: Reorganização do cabeçalho da criação de dieta

**Feature**: [spec.md](./spec.md)  
**Decision**: Nenhuma entidade persistente nova.

## Existing UI Data Flow

```text
page route
  └── dietPlan + patient + currentMeals + callbacks
      └── DietBuilderTemplate
          ├── DietModeSwitcher
          ├── MacroTrackerHeader
          │   └── PatientBadgeHeader + MacroMetricCard[]
          └── MealCardContainer[]
```

## Template Inputs

`DietBuilderTemplate` mantém o contrato atual:

```ts
interface DietBuilderTemplateProps {
  patientId?: string;
  patientName?: string;
  dietaId?: string;
  dietModeProps?: DietModeSwitcherProps;
  macroTrackerData: MacroTrackerHeaderProps;
  mealsData: MealCardContainerProps[];
  onAddMeal?: () => void;
  onScaleDiet?: () => void;
  onWhatsAppShare?: () => void;
  onExportPDF?: () => void;
  onSaveDiet?: () => void;
}
```

The redesign changes only where these inputs are presented; it does not rename, remove or reinterpret them.

## Mode Selection State

`DietModeSwitcherProps` remains the source of truth for selection:

```ts
type DietMode = 'simple' | 'carb_cycling';

interface DietModeSwitcherProps {
  mode: DietMode;
  onModeChange: (mode: DietMode) => void;
  variationsCount: 2 | 3;
  onVariationsCountChange: (count: 2 | 3) => void;
  variations: CarbCyclingVariation[];
  activeVariationId: string;
  onSelectVariation: (id: string) => void;
  onCopyMealsBetweenVariations?: () => void;
}
```

### State rules

| State | Visible mode controls | Visible contextual actions | Expected hierarchy |
| --- | --- | --- | --- |
| `simple` | Simple/carb cycling selection | Save, Adjust Goals, Scale, New Meal, More Actions | Header → mode → patient/macros → meals |
| `carb_cycling` | Mode selection + count + variation tabs + optional copy | Same as simple | Extra controls stay inside mode context |
| `mealsData.length > 0` | Same as selected mode | New Meal in section header | Meal grid follows section heading |
| `mealsData.length === 0` | Same as selected mode | One New Meal path | Empty state does not add a competing CTA |
| Optional callback absent | Existing controls only | No empty placeholder | No broken-looking action gap |

## Action Mapping

| Existing callback | Label | New region | Priority |
| --- | --- | --- | --- |
| `onSaveDiet` | Salvar Prescrição | Page header | Primary |
| Link to `/pacientes/${patientId}` | Voltar ao Prontuário | Page header | Navigation |
| `onAddMeal` | Nova Refeição | Refeições section | Contextual secondary |
| `onScaleDiet` | Escalar | Patient/macros region | Contextual secondary |
| `onWhatsAppShare` | WhatsApp | Mais ações menu | Secondary menu item |
| `onExportPDF` | PDF | Mais ações menu | Secondary menu item |
| `onAdjustGoals` | Ajustar Metas | Existing PatientBadgeHeader | Contextual secondary |

## Persistence Boundary

No storage keys, domain entities, calculations, serialization formats or route parameters change. The route continues to construct the same template inputs from the existing patient and diet stores.
