# Data Model: Integridade e Recuperação da Dieta

## Existing persisted entities

### `NutritionSnapshot`

This feature preserves the current snapshot shape; no schema migration is planned.

| Field group | Required behavior |
| --- | --- |
| Source identity | Keep `sourceType`, `sourceId`, `sourceVersion`, display name and description for the selected source. Supported source kinds remain those already modeled: system TACO, account custom food, recipe and ready-meal provenance. |
| Nutrition basis | Keep reference quantity/unit, reference nutrients, energy source, calculation version, conversion snapshot and composition snapshot unchanged when the source stays the same. |
| Prescribed values | When the quantity changes, replace `prescribedQuantity` and recompute `prescribedNutrients` from the frozen reference basis using the recorded unit/conversion. |
| Source replacement | When the nutrition source changes, create a complete snapshot from the deliberately selected source and its current version; do not retain the previous source identity or nutrient values. |

The source validator must accept a complete snapshot for each modeled source type while retaining uniqueness, parent, quantity, nutrient and provenance checks. A ready-meal insertion may retain the selected food/recipe as the nutrition source and the ready meal as composition provenance.

### `DietEditableDocument`

- `name`, `mode`, variations, meal/item snapshots and targets keep their current shape.
- `weightReferenceKg` is optional and remains optional for legacy data.
- New drafts retain the weight captured at creation. Editing a saved diet carries its captured value unchanged through every conversion.
- If an existing plan has no recoverable weight reference, leave the field absent; do not fill it from the current patient profile.

### `DietDraft`

No persistence fields are added. Continue using:

- `draftId` and `draftRevision` to identify a recoverable local edit;
- `baseDietId`/`baseDietVersion` for edits to an active plan;
- `targetDietId` for idempotent creation of a new confirmed diet;
- the captured editable document as the exact revision passed to confirmation.

Cleanup may remove only the revision known to be confirmed. A newer revision must never be removed by recovery of an older commit.

### `DietPlan`

No column migration is planned. `weightReferenceKg` remains optional in the stored plan. The plan’s status/version, snapshots and source provenance continue to be written in the existing confirmation transaction.

### Save and checkpoint outcomes

Keep `SaveOutcome` discriminated by status. Add only the checkpoint-pending state and the local committed result it must preserve. Reconciliation uses the stable diet ID and revision to distinguish committed, not committed, cleanup pending and review required. User-visible states and next actions are defined in `contracts/diet-editor-save.md`. The profile checkpoint remains the existing workspace/checkpoint revision pair and `ProfileSessionSyncState`; no second sync queue or file format is added.

## Editor transient state

The page needs explicit load and confirmation state in addition to the current plan/draft values:

| State | Meaning |
| --- | --- |
| `loading` | Patient/profile and editor context are being opened. |
| `ready` | Patient and editable draft are available. |
| `error` | Open failed; preserve the error category/message and expose retry or safe return. |
| `confirmationBusy` | Explicit Save is flushing the final editor revision or confirming it; the existing editor region is inert and callbacks reject mutation. |

Background autosave remains a separate nonblocking state; it must not be mistaken for explicit confirmation busy. No persisted load-state field is added.

## Compatibility and migration

- No schema, `.nutridiet` envelope, account scope or external integration migration.
- Previously saved plans with missing `weightReferenceKg` remain missing; no automatic historical backfill.
- Existing complete snapshots remain readable if their source catalog entry has since changed or been archived.
- The canonical type’s existing source kinds remain valid for confirmation when each snapshot satisfies the current source/provenance contract.
