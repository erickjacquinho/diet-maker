# Data Model: Prova técnica e base local

**Feature**: [spec.md](./spec.md)
**Scope**: Fixture mínima e contratos de dados necessários para a PoC; não é o schema clínico completo da V1.

## Model boundaries

O modelo tem duas fronteiras deliberadas:

1. **Dados confirmados**: registros relacionais da fixture, usados para validar escopo, relações, transações, snapshots e portabilidade.
2. **Edição local**: `DietDraft`, guardado separadamente, sem linha equivalente no conjunto confirmado.

O motor e a forma física das tabelas são detalhes do adaptador. Os nomes abaixo descrevem conceitos que a PoC precisa exercitar.

## Entities

### Account

Representa a Conta/perfil local proprietário dos dados.

| Field | Type/shape | Rules |
| --- | --- | --- |
| `id` | global identifier | Required, stable across export/import; unique |
| `displayName` | short text | Required for fixture readability |
| `createdAt` | timestamp | Required |
| `updatedAt` | timestamp | Required and monotonic within the fixture |

### Patient

Representa um paciente pertencente a uma Conta.

| Field | Type/shape | Rules |
| --- | --- | --- |
| `id` | global identifier | Required, unique |
| `accountId` | Account reference | Required; must reference the same Account as dependent records |
| `name` | short text | Required in the fixture |
| `archived` | boolean | Defaults to false; archive does not remove history |
| `createdAt` | timestamp | Required |
| `updatedAt` | timestamp | Required |

### Recipe

Receita sintética pertencente à Conta, incluída para exercitar uma relação de composição e rendimento sem implementar a biblioteca reutilizável completa.

| Field | Type/shape | Rules |
| --- | --- | --- |
| `id` | global identifier | Required, unique and stable across export/import |
| `accountId` | Account reference | Required; recipe belongs to exactly one Account |
| `name` | short text | Required |
| `yieldPortions` | positive number | Required |
| `createdAt` | timestamp | Required |
| `updatedAt` | timestamp | Required |

### RecipeIngredient

Item da composição de uma receita, usado para exercitar relação pai/filhos e valores nutricionais de origem.

| Field | Type/shape | Rules |
| --- | --- | --- |
| `id` | global identifier | Required, unique |
| `recipeId` | Recipe reference | Required |
| `sourceKind` | `TACO` or `CUSTOM` | Required |
| `sourceId` | source identifier | Required |
| `quantityG` | positive number | Required; represented in grams |

### DietPlan

Cabeçalho mínimo de uma dieta confirmada usado para provar estado, escopo e exclusividade.

| Field | Type/shape | Rules |
| --- | --- | --- |
| `id` | global identifier | Stable across retries and export/import |
| `accountId` | Account reference | Required |
| `patientId` | Patient reference | Required; patient must belong to `accountId` |
| `status` | `ACTIVE` or `SNAPSHOT` | At most one `ACTIVE` per patient in the exercised fixture |
| `version` | positive integer | Increments on explicit confirmed update |
| `createdAt` | timestamp | Required |
| `updatedAt` | timestamp | Required |

### DietMeal

Filho do cabeçalho que exercita uma gravação composta e a ordenação da refeição.

| Field | Type/shape | Rules |
| --- | --- | --- |
| `id` | global identifier | Required, unique |
| `dietPlanId` | DietPlan reference | Required |
| `position` | non-negative integer | Unique within a diet plan for the fixture |
| `name` | short text | Required |

### DietMealItem

Item nutricional filho de uma refeição, com os valores usados na prescrição.

| Field | Type/shape | Rules |
| --- | --- | --- |
| `id` | global identifier | Required, unique |
| `mealId` | DietMeal reference | Required |
| `sourceKind` | `TACO` or `CUSTOM` | Required; TACO is system-owned, custom belongs to Account |
| `sourceId` | source identifier | Required for the fixture |
| `quantityG` | positive number | Required; represented in grams |
| `energyKcal` | non-negative number | Snapshot of the value used by the item |
| `proteinG` | non-negative number | Snapshot |
| `carbsG` | non-negative number | Snapshot |
| `fatG` | non-negative number | Snapshot |

### DietDraft (outside the relational model)

Edição local em andamento; não é uma prescrição confirmada.

| Field | Type/shape | Rules |
| --- | --- | --- |
| `draftId` | stable identifier | Required for update/delete and retry reconciliation |
| `accountId` | Account reference | Required for context validation; does not create a relational row |
| `patientId` | Patient reference | Required for context validation |
| `targetDietId` | optional DietPlan reference | Identifies the plan intended for update, if any |
| `expectedVersion` | optional positive integer | Rejects stale update context when present |
| `payload` | draft document | Contains only local editing state |
| `updatedAt` | timestamp | Used to order autosave writes |

**Invariant**: Creating, updating or deleting `DietDraft` cannot create, update or delete `DietPlan`, `DietMeal`, `DietMealItem`, vigência or histórico.

### PortableSample

Envelope lógico usado somente para testar a capacidade de transporte do adaptador.

| Field | Type/shape | Rules |
| --- | --- | --- |
| `formatVersion` | supported format identifier | Required; unsupported versions are rejected before mutation |
| `schemaVersion` | supported model identifier | Required; must match an implemented migration/converter |
| `exportedAt` | timestamp | Required |
| `accountId` | Account reference | Required |
| `records` | confirmed fixture records | Excludes drafts and preserves IDs, relations and nutritional snapshots |

This is not the complete `.nutridiet` backup contract. The full Account export/restoration belongs to the later backup SDD.

## Relationships and invariants

```text
Account 1 ──── N Patient
Account 1 ──── N DietPlan
Account 1 ──── N Recipe
Patient 1 ──── N DietPlan
DietPlan 1 ─── N DietMeal
DietMeal 1 ─── N DietMealItem
Recipe 1 ─── N RecipeIngredient

DietDraft ─ ─ ─ contextual references only; no confirmed-row relationship
```

- Every confirmed record with an owner carries `accountId` directly or through a validated parent.
- A `Patient` can reference only its own `Account`.
- A `DietPlan` can reference only a `Patient` in the same `Account`.
- A patient has at most one `ACTIVE` plan in the exercised fixture; prior plans become `SNAPSHOT`.
- A transaction that writes a `DietPlan` and children either commits all rows or leaves no new rows.
- Nutritional values on `DietMealItem` are snapshots; the PoC never recomputes existing rows from a changed catalog.
- IDs and relations remain unchanged in `PortableSample` round-trip.
- Draft state is never included in `PortableSample`.

## State transitions

```text
DietPlan:  (new) ──explicit commit──> ACTIVE
ACTIVE ──replacement commit──> SNAPSHOT
SNAPSHOT ──read──> SNAPSHOT (read-only in this PoC)

DietDraft: absent ──autosave──> present
present ──autosave──> present (latest ordered state)
present ──discard/successful reconciliation──> absent
```

The PoC does not implement the complete diet editor or clinical history UI; these transitions only provide data for the technical gate.

## Deterministic fixture requirements

The fixture must include:

- at least two Account scopes so an invalid cross-owner relation can be exercised;
- multiple Patients, including an archived patient that retains a confirmed record;
- a DietPlan set containing one `ACTIVE` and at least one `SNAPSHOT` state;
- multiple meals and nutritional items with stable snapshots;
- at least one draft referencing a patient and, when applicable, an expected diet version;
- values and identifiers stable enough to compare before/after close, migration and round-trip import.

The exact fixture values belong to the PoC source and report, not to the product's clinical dataset.
