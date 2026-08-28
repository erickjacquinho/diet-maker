# Data Model: Tabela de variações no histórico de ciclo

## HistoricalDiet

The read-only history record representing one prescription in the profile.

| Field | Type / shape | Role in this feature | Rules |
|-------|--------------|----------------------|-------|
| `id` | Stable string | Links the parent row and its expanded region | Required and unique within the history list |
| `name` | String | Identifies the prescription | Required; may need accessible full-value support when long |
| `date` | Display date string | Identifies when it was prescribed | Preserves existing history formatting |
| `status` | `Ativa` or `Histórica` | Preserves current history state | Existing status rules remain unchanged |
| `targetKcal` | Number | Weighted weekly summary calories | For a cycle, remains the official weekly weighted average |
| `proteinG` | Number | Weighted weekly protein summary | Preserves existing macro semantics |
| `carbsG` | Number | Weighted weekly carbohydrate summary | Preserves existing macro semantics |
| `fatsG` | Number | Weighted weekly fat summary | Preserves existing macro semantics |
| `mode` | `simple` or `carb_cycling` | Selects whether cycle details are available | Simple diets do not receive cycle detail rows |
| `carbCyclingVariations` | Ordered list of `HistoricalDietVariation` | Supplies expanded rows | May be absent or empty for incomplete historical records |

## HistoricalDietVariation

An immutable historical snapshot of one cycle variation.

| Field | Type / shape | Role in this feature | Rules |
|-------|--------------|----------------------|-------|
| `id` | Stable string | Row identity | Required and stable for the expansion lifetime |
| `name` | String | Variation label | Required; long values cannot force a second visual row |
| `type` | `high`, `medium`, `low`, `zero`, or `custom` | Variation semantic label | Display must not rely on color alone |
| `assignedDays` | Zero or more canonical day IDs | Source for the single formatted days column | Preserve source order semantically, display in canonical weekly order |
| `targetKcal` | Number | Variation calorie target | Display with explicit `kcal` unit |
| `proteinG` | Number | Variation protein target | Display with explicit `g` unit |
| `carbsG` | Number | Variation carbohydrate target | Display with explicit `g` unit |
| `fatsG` | Number | Variation fat target | Display with explicit `g` unit |
| `mealsCount` | Non-negative integer | Variation meal count | Zero is displayed as an explicit no-meals state |

## Presentation projection

The expanded view may derive a display-only row projection without persistence:

| Derived value | Source | Rule |
|---------------|--------|------|
| `formattedDays` | `assignedDays` | Map known IDs to canonical short labels, sort by weekly order, join with `, `; use `Nenhum dia atribuído` when empty |
| `formattedMeals` | `mealsCount` | Use singular/plural language; use `Nenhuma refeição` when zero |
| `variationLabel` | `name` + `type` | Preserve the name and expose the type as supporting context where useful |

## Relationships and invariants

- One `HistoricalDiet` may have zero or more `HistoricalDietVariation` records.
- Only a cycle prescription with variation records exposes the expanded variation view.
- The parent summary is calculated independently from the detail row formatting and is not replaced by any individual variation.
- Variation order is preserved from the historical snapshot.
- A variation with no days or meals remains a visible record; missing data is represented explicitly, never by removing the row.
- The profile history is read-only; this feature introduces no state transition for persisted diet data.

## UI state transitions

| State | Trigger | Result |
|-------|---------|--------|
| Collapsed | Initial history load or close action | Parent prescription row only; standard height preserved |
| Expanded | Accessible expand action | One detail region appears below the parent row with one row per variation |
| Re-collapsed | Same control activated again | Detail region is removed; parent summary and height remain unchanged |
| Empty details | Expanded cycle has no variation records | Contextual empty message; no fabricated values |
