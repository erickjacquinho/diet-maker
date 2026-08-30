# Data model: Dietas — rascunho, salvamento e histórico

**Status**: proposto para implementação após validação humana  
**Source**: [spec.md](./spec.md), [research.md](./research.md)

## Aggregate boundaries

```text
IndexedDB document                         Canonical relational database

DietDraft                                  Account
└── DietEditableDocument                     └── Patient
    └── variations                                └── DietPlan
        └── meals                                      ├── DietVariation
            └── options                                │   └── VariationDay
                └── items + snapshots                 └── DietMeal
                                                           └── DietMealOption
                                                               └── DietMealItem
                                                                   └── DietItemSnapshot
```

`DietDraft` is an editing document and is never joined into patient history.
`DietPlan` and all descendants are one confirmed aggregate. Source catalog
records are provenance only; the aggregate is readable without them.

## Canonical value objects

### Identifiers and dates

- IDs are opaque, generated outside UI components and stable after creation.
- Internal dates are ISO strings. Display formatting is never persisted.
- `draftRevision` and `DietPlan.version` are positive monotonic integers with
  different scopes.
- `targetDietId` is reserved once before the first clinical transaction.

### DecimalString

Quantity/nutrient values cross domain, IndexedDB and application boundaries as
canonical decimal strings. New relational columns use fixed-precision
`numeric` without Drizzle `mode: number`. The nutrition module parses and
calculates them through the direct production dependency `decimal.js` 10.6.0,
with explicit precision and `ROUND_HALF_UP`. Validation rejects exponent-only
or non-canonical inputs at persistence boundaries, `NaN` and infinities;
quantities and reference divisors are positive, nutrients are non-negative.
Missing remains distinct from zero. No display rounding changes stored values.

Presentation applies decimal half-up rounding:

| Value | Presentation |
| --- | --- |
| protein/carbohydrate/fat/fiber | 1 decimal place |
| energy | whole kcal |
| g/kg | 2 decimal places |

### NutritionSnapshot

| Field | Rule |
| --- | --- |
| `sourceType` | `SYSTEM_TACO` in this stage; future types are not selectable |
| `sourceId` | original catalog identity, provenance only |
| `sourceVersion` | explicit bundled TACO dataset version |
| `displayName`, `description` | enough to render without the source |
| `measurementBasis` | `PER_100G`, `PER_100ML` or `PER_UNIT` |
| `foodState` | `RAW`, `COOKED`, `PREPARED` or `AS_SOLD` |
| `referenceQuantity`, `referenceUnit` | positive frozen calculation base |
| `referenceNutrients` | protein, carbs, fat, fiber and optional/reference kcal |
| `prescribedQuantity`, `prescribedUnit` | positive amount used in the diet |
| `prescribedNutrients` | unrounded values scaled from the frozen base |
| `energySource` | `REFERENCE` or `CALCULATED_449` |
| `calculationVersion` | rule version used for calculation |
| `conversionSnapshot` | explicit density/unit/edible-portion conversion, or empty |
| `compositionSnapshot` | self-contained composition needed by future export/read |

When reference kcal is present, including zero, `energySource=REFERENCE` and
4–4–9 cannot replace it. `CALCULATED_449` is allowed only for absent energy.

## DietDraft (IndexedDB only)

| Field | Type / rule |
| --- | --- |
| `draftId` | stable opaque ID, object-store key |
| `contextKey` | unique `(accountId, patientId, routeDietId)` |
| `accountId`, `patientId` | required validated scope |
| `routeDietId` | `nova` or the current active plan ID |
| `payloadSchemaVersion` | positive version of the draft document shape |
| `draftRevision` | positive integer incremented for each persisted edit |
| `state` | `EDITABLE` or `INVALIDATED_BY_PATIENT_ARCHIVE` |
| `baseDietId`, `baseDietVersion` | required only when editing ACTIVE |
| `targetDietId` | absent until first save attempt; then immutable for that draft |
| `payload` | complete `DietEditableDocument` |
| `createdAt` | ISO creation timestamp |
| `updatedAt` | ISO informational timestamp, not ordering authority |

### Draft invariants

1. At most one recoverable draft exists for each context key.
2. A lower revision cannot replace a higher revision.
3. Copying an entire diet replaces `payload`, keeps the draft identity and
   gives fresh identities to copied variation/meal/option/item entities.
4. `removeIfRevision` removes only the exact confirmed revision.
5. Discard and archive invalidation cancel queued callbacks; a stale callback
   cannot recreate the document.
6. An invalidated draft cannot be automatically recovered after restore.
7. A draft may be incomplete; the minimum applies only to clinical commit.

## DietEditableDocument

| Field | Rule |
| --- | --- |
| `name` | non-empty normalized display name |
| `mode` | `SIMPLE` or `CARB_CYCLING` |
| `weightReferenceKg` | positive `DecimalString` snapshot when used for g/kg |
| `variations` | one internal variation for SIMPLE; ordered set for cycle |

A document is eligible for clinical confirmation when its prescribed mode has
at least one meal with at least one valid `PRIMARY` item. Meals/items in an
inactive mode, alternatives not counted in totals, or orphan substitutes do
not satisfy the minimum. For cycle, the minimum is global across the prescribed
variations; no additional minimum is imposed per variation.

A new draft captures the patient's current valid weight as its reference while
starting every target at zero. Editing ACTIVE preserves its confirmed weight;
target-only copy preserves the destination weight and full copy adopts the
source weight.

## DietPlan (`diet_plans`)

| Field | Rule |
| --- | --- |
| `id` | `targetDietId` for new; existing plan ID for edit |
| `accountId`, `patientId` | required scope with composite FK to patient |
| `name` | non-empty |
| `mode` | `SIMPLE` or `CARB_CYCLING` |
| `status` | `ACTIVE` or `SNAPSHOT`; never `IN_CREATION` |
| `weightReferenceKg` | positive optional `DecimalString` snapshot |
| `version` | starts at 1 and increments on explicit ACTIVE edit |
| `createdAt`, `updatedAt` | ISO timestamps |
| `activatedAt` | confirmation time |
| `supersededAt` | null for ACTIVE; set when another plan replaces it |

### Plan invariants

- Unique partial key `(accountId, patientId) WHERE status = ACTIVE`.
- Editing ACTIVE retains ID and `createdAt`, increments version and replaces its
  descendants in the same transaction.
- Creating a new ACTIVE demotes the prior ACTIVE and inserts every descendant
  in the same transaction.
- SNAPSHOT cannot be edited or physically deleted by normal use cases.
- A patient must exist in the same account and be active at commit time.

## DietVariation (`diet_variations`)

| Field | Rule |
| --- | --- |
| `id`, `dietPlanId`, `accountId`, `patientId` | scoped identities and FKs |
| `position` | non-negative unique order within plan |
| `kind` | `SIMPLE`, `HIGH`, `MEDIUM`, `LOW`, `ZERO`, `CUSTOM` |
| `name` | required display name |
| `inputMode` | `GRAMS`, `G_PER_KG`, `PERCENTAGE`, `DELTA_BASE` |
| target values | non-negative protein/carbs/fat/kcal |
| g/kg inputs | optional, non-negative, preserved when user supplied them |

SIMPLE has exactly one variation with no assigned days. Cycle keeps existing
variation count/order; this SDD adds no new required count.

## VariationDay (`diet_variation_days`)

| Field | Rule |
| --- | --- |
| `variationId` | parent FK |
| `dayCode` | `MON` through `SUN` |
| `position` | stable presentation order |

The same day cannot be repeated within a plan, so it belongs to at most one
variation. Days may remain unassigned. This preserves the editor's current
cycle assignment rule without requiring all seven days.

## DietMeal (`diet_meals`)

| Field | Rule |
| --- | --- |
| `id`, `dietPlanId`, `variationId`, scope fields | composite integrity |
| `position` | non-negative unique order within variation |
| `name` | required |
| `time` | canonical 24-hour value when provided |

At least one meal across the prescribed document contains at least one valid
primary item. Empty meals may coexist but cannot alone satisfy the save
minimum.

## DietMealOption (`diet_meal_options`)

| Field | Rule |
| --- | --- |
| `id`, `dietMealId` | stable parent relation |
| `position` | base option first, alternatives ordered after it |
| `label` | e.g. “Variação 1” |
| `countsTowardTotals` | exactly one option per meal when options exist |

Options are alternatives and are not summed simultaneously. Copy creates new
option IDs. The read model exposes the selected option used in displayed
totals while preserving all options.

## DietMealItem (`diet_meal_items`)

| Field | Rule |
| --- | --- |
| `id`, `dietMealOptionId`, scoped ancestor IDs | stable relation and FK |
| `position` | non-negative unique order within option |
| `role` | `PRIMARY` or `SUBSTITUTE` |
| `parentItemId` | required only for a direct substitute in the same option |

Substitutes cannot form nested chains. They remain persisted and visible but
are not summed with the primary option and do not independently satisfy the
minimum content rule.

## DietItemSnapshot (`diet_item_snapshots`)

| Field | Rule |
| --- | --- |
| `dietMealItemId` | one-to-one PK/FK with the prescribed item |
| provenance/display/base/prescribed fields | complete `NutritionSnapshot` |
| `conversionSnapshot` | ordered JSON value with explicit schema version |
| `compositionSnapshot` | self-contained JSON value with explicit schema version |

Each persisted item is sufficient for read-only rendering, total calculation
and future logical export if the catalog row changes or disappears. Catalog
archiving/deletion cannot cascade to this table.

## Read models

### DietHistoryRow

Contains plan ID/version, date, name, mode, `VIGENTE`/`HISTÓRICO`, snapshot
targets/totals, meal count and cycle summaries. It has capabilities rather than
UI-inferred rules: `canEdit`, `canOpenReadOnly`, `canUseAsSource`; confirmed
plans always have `canDelete=false`.

### PatientDietSummary

Contains current ACTIVE summary, ordered history, confirmed count and optional
recoverable-draft summary. The draft summary is rendered separately with
`resume`/`discard`; it is not counted as a plan.

### PreviousDietSource

Contains only confirmed plans from the same account/patient, ordered newest
first. It exposes complete data for deep copy and active-variation target data
for target-only copy.

## State transitions

```text
no draft ── open editor ──► EDITABLE draft
EDITABLE ── autosave ─────► EDITABLE (revision + 1)
EDITABLE ── discard ──────► removed
EDITABLE ── patient archive ─► INVALIDATED_BY_PATIENT_ARCHIVE

EDITABLE ── valid explicit save ──► committing
committing ── rollback ───────────► EDITABLE preserved
committing ── unknown ────────────► reconciliation required, draft preserved
committing ── commit + cleanup ───► ACTIVE, exact draft revision removed
committing ── commit + cleanup error ► ACTIVE, cleanup pending

ACTIVE ── explicit edit save ─────► ACTIVE (same ID, version + 1)
ACTIVE ── another plan commits ───► SNAPSHOT
SNAPSHOT ── edit/delete ──────────► rejected
SNAPSHOT ── copy ─────────────────► new EDITABLE draft
```

## Migration contract

- Append a new immutable migration after the current last ID; never rewrite an
  applied migration.
- Add the seven relational diet tables, constraints, composite indexes and
  ACTIVE unique partial index.
- Add only the patient composite uniqueness required by the diet FK.
- Upgrade from a populated stage-2 database must preserve accounts, objective
  options and patients field-for-field.
- Reapplying migrations is idempotent through `__nutridiet_migrations`.
- Legacy `nutridiet_diets_*`, `dietHistory[]` and session transport are not
  imported and cannot remain fallback sources.
- Schema version and future logical export contract advance together, without
  implementing the stage-6 export UI.
