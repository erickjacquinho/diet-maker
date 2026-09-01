# Data Model: Biblioteca reutilizável por Conta

**Feature**: [Biblioteca reutilizável por Conta](./spec.md)
**Status**: Proposed for implementation
**Date**: 2026-09-01

## Model boundaries

- A Conta owns all persisted library records.
- TACO remains a system-owned, read-only dataset supplied by the existing
  adapter. It has no row in the Account library tables.
- A library record is not a patient diet meal. Its use in a diet is copied into
  a `DietDraft` and later frozen into the existing clinical snapshot model.
- Legacy `localStorage` keys are not input to this model and have no migration
  path.

## Entities

### FoodCatalogItem

Represents an account-owned custom food. The domain projection can also expose
a TACO record with `sourceType = SYSTEM_TACO`, but only account custom records
are stored in `food_catalog_items`.

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `id` | stable text ID | yes | unique within the local database |
| `accountId` | Account ID | yes for persisted custom food | must match active context |
| `sourceType` | `ACCOUNT_CUSTOM` | yes | TACO is read-only and not persisted here |
| `name` | text | yes | trimmed and non-empty |
| `description` | text | yes | may be empty, never omitted from snapshot |
| `brand` | text | no | preserved when supplied |
| `measurementBasis` | enum | yes | `PER_100G`, `PER_100ML`, `PER_UNIT` |
| `foodState` | enum | yes | `RAW`, `COOKED`, `PREPARED`, `AS_SOLD` |
| `servingReference` | quantity + unit | no | positive when present |
| `referenceNutrients` | decimal nutrient profile | yes | protein/carbs/fat/fiber ≥ 0; energy optional |
| `energySource` | enum | yes | `REFERENCE` or `CALCULATED_449` |
| `calculationVersion` | text | yes | identifies the nutrition rule |
| `status` | enum | yes | `ACTIVE` or `ARCHIVED` |
| `version` | positive integer | yes | increments on explicit update |
| `createdAt` / `updatedAt` | ISO text | yes | `updatedAt` changes on mutation |
| `archivedAt` | ISO text | no | set when status becomes `ARCHIVED` |

### Recipe

Represents a preparation owned by an Account. Ingredients are separate rows;
their snapshots make a recipe version independent from later catalog changes.

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `id` | stable text ID | yes | unique within the local database |
| `accountId` | Account ID | yes | must match every ingredient scope |
| `name` / `category` | text | yes | trimmed name is non-empty |
| `instructions` | text | yes | may be empty but remains explicit |
| `prepTimeMinutes` | non-negative integer | no | finite when supplied |
| `yieldPortions` | positive decimal | yes | no fallback to 1 |
| `preparedWeightGrams` | positive decimal | no | only when explicitly known |
| `status` | enum | yes | `ACTIVE` or `ARCHIVED` |
| `version` | positive integer | yes | increments on explicit update |
| `createdAt` / `updatedAt` | ISO text | yes | mutation timestamps |
| `archivedAt` | ISO text | no | set when archived |

### RecipeIngredient

Ordered ingredient in a recipe. `sourceId` may identify a static TACO record or
an account custom food; the repository validates the latter against the
recipe's Account. A polymorphic source is not treated as a live dependency for
clinical snapshots.

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `id` | stable text ID | yes | unique and new on duplication |
| `recipeId` / `accountId` | scoped IDs | yes | recipe and ingredient share Account |
| `position` | non-negative integer | yes | unique within recipe |
| `sourceType` | enum | yes | `SYSTEM_TACO` or `ACCOUNT_CUSTOM` |
| `sourceId` | text | yes | TACO ID or custom food ID |
| `sourceVersion` | text | yes | dataset version or custom food version |
| `quantity` / `unit` | decimal + enum | yes | positive; `g`, `ml` or `unit` |
| `ingredientSnapshot` | JSON value | yes | nutrition and composition used by this version |

### ReadyMeal

Represents a reusable meal template owned by an Account. It is not a
patient-specific `DietMeal` until copied into a draft.

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `id` | stable text ID | yes | unique and new on duplication |
| `accountId` | Account ID | yes | owner scope |
| `name` / `description` | text | yes | name is trimmed and non-empty |
| `suggestedTime` | time text | no | display metadata only |
| `status` | enum | yes | `ACTIVE` or `ARCHIVED` |
| `version` | positive integer | yes | increments on explicit update |
| `createdAt` / `updatedAt` | ISO text | yes | mutation timestamps |
| `archivedAt` | ISO text | no | set when archived |

### ReadyMealItem

Ordered item in a ready meal. It may reference a food or a recipe, but never
another ready meal. Its snapshot contains enough information to copy the item
to a draft without requiring the source to remain active.

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `id` | stable text ID | yes | new on duplication and draft insertion |
| `readyMealId` / `accountId` | scoped IDs | yes | item and template share Account |
| `position` | non-negative integer | yes | unique within template |
| `sourceType` | enum | yes | `FOOD` or `RECIPE` |
| `sourceId` / `sourceVersion` | text | yes | source and version used |
| `quantity` / `unit` | decimal + enum | conditional | required for food |
| `recipePortions` | positive decimal | conditional | required for recipe |
| `itemSnapshot` | JSON value | yes | source, nutrition and composition |

### LibrarySnapshot

An immutable value object captured in a recipe ingredient, ready meal item,
draft item or confirmed diet item. It includes source type/ID/version, display
metadata, reference basis, quantities, nutrients, energy provenance,
calculation version, conversions and composition.

It is copied on write and never rehydrated from a live catalog row when reading
a draft or confirmed diet.

## Relationships

```text
Account 1 ─── * FoodCatalogItem (custom only)
Account 1 ─── * Recipe 1 ─── * RecipeIngredient ─── source TACO | custom food
Account 1 ─── * ReadyMeal 1 ─── * ReadyMealItem ─── source food | recipe
Recipe/ReadyMeal ─── snapshot copy ───> DietDraft ─── save ───> DietPlan
```

Persisted child rows carry `accountId` where needed for composite scope
constraints. TACO references are validated against the static dataset; custom
food and recipe references are validated against the active Account. Ready
meal items cannot point to another ready meal, preventing cycles.

## State transitions

```text
ACTIVE ── explicit update ──> ACTIVE with version + 1
ACTIVE ── archive ──> ARCHIVED
ARCHIVED ── maintenance restore, if allowed ──> ACTIVE with explicit action
ACTIVE ── delete with no dependency ──> removed
ACTIVE/ARCHIVED with dependency ──> preserved; no physical delete
```

Archiving removes a record from default new-use lists but does not invalidate
existing recipe, ready-meal, draft or clinical snapshots.

## Diet snapshot compatibility

The existing diet snapshot model must accept the library origins
`ACCOUNT_CUSTOM`, `RECIPE` and `READY_MEAL` in addition to `SYSTEM_TACO`.
The next migration must update the source constraint without rewriting earlier
migrations. Domain snapshots retain the same decimal nutrition, energy source,
conversion and composition fields already used by confirmed diets.

## Validation invariants

1. Every persisted library entity has one Account owner and a positive version.
2. Every child position is unique inside its parent and starts at zero.
3. Every quantity, portion count and supplied nutrient is finite and valid.
4. An ingredient cannot reference an archived/missing/cross-account custom
   food when saving a new recipe.
5. A ready meal cannot contain a ready meal or create a recursive source graph.
6. A failed aggregate save leaves no orphaned children or version record.
7. A copy gets fresh IDs and never mutates its source.
8. Catalog mutations do not modify previously captured snapshots.
9. No model operation reads or writes the legacy library storage keys.
