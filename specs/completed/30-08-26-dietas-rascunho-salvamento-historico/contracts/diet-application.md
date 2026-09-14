# Contract: Diet application and persistence boundaries

**Status**: proposed  
**Scope**: application-facing ports, use cases and observable route states  
**Source**: [spec.md](../spec.md), [data-model.md](../data-model.md)

This is a behavioral contract. Names may be adapted to project conventions,
but no implementation may weaken the inputs, outcomes or failure distinctions.

## DietApplication

```text
DietApplication
├── openEditor(patientId, routeDietId)
├── autosaveDraft(draftId, expectedRevision, document)
├── flushDraft(draftId, document)
├── discardDraft(draftId, expectedRevision)
├── listPreviousDietSources(patientId)
├── pullTargets(draftId, sourceDietId, sourceVariationId, targetVariationId)
├── pullCompleteDiet(draftId, sourceDietId)
├── saveDietAsActive(draftId, expectedRevision)
├── reconcileUnknownSave(draftId)
├── getPatientDietSummary(patientId)
├── getDietSnapshot(patientId, dietId)
└── invalidatePatientDrafts(patientId)
```

Every method derives `accountId` from `AccountContext`, verifies patient scope
and returns typed results. UI cannot supply account authority or persistence
handles.

## Editor operations

### `openEditor`

| Input | Success | Required failures |
| --- | --- | --- |
| active patient + `nova` | recover context draft or create empty SIMPLE draft with zero targets | context missing, patient missing/archived, draft storage unavailable |
| active patient + ACTIVE plan ID | recover matching draft or create a deep editable document with base ID/version | cross-scope, plan missing, plan already SNAPSHOT, storage failure |
| SNAPSHOT plan ID | no editable result | `READ_ONLY_DIET` with copy guidance |

Creating/recovering never calls the confirmed repository mutation path.
A new draft snapshots the patient's current valid reference weight; it does
not derive non-zero targets. An ACTIVE edit preserves its confirmed reference
weight.

### `autosaveDraft`

Input contains the current `draftId`, last acknowledged revision and complete
document. Success returns the persisted revision and `updatedAt`.

```text
AutosaveResult =
  | { status: SAVED; revision }
  | { status: SUPERSEDED; currentRevision }
  | { status: INVALIDATED }
```

`SUPERSEDED` cannot overwrite the current record. Storage/quota/serialization
failure is explicit and does not imply clinical save.

### `flushDraft`

Uses the same path as autosave without debounce and resolves only after the
last visible document is persistently acknowledged. Navigation and clinical
save call this operation.

### `discardDraft`

Requires the user-confirmed action at UI level, cancels queued tokens, and
removes only the local context. Confirmed repositories are never called.

```text
DiscardResult = REMOVED | ALREADY_REMOVED | SUPERSEDED_REVISION
```

## Previous-diet copy

`listPreviousDietSources` returns only confirmed plans for the same
account/patient, newest first. Drafts and current unrelated patients never
appear. The trigger is disabled for zero sources; actions are disabled until a
single row is selected.

`pullTargets` copies protein/carbohydrate/fat/kcal targets from the selected
source variation to the active target variation. For cycle sources it uses the
explicit active source variation, not a weekly average. It preserves target
meals and destination weight reference.

`pullCompleteDiet` replaces the destination document with a deep copy of the
source mode, weight reference, variations/days, targets, meals/options/items and
snapshots. It keeps `draftId`, does not copy plan identity/base version and
generates fresh editable IDs. Both operations persist a new draft revision
before announcing success. Closing/canceling the modal changes nothing.

## Explicit save

### Preconditions

1. The editor is frozen and duplicate submit blocked.
2. The last visible document is flushed.
3. A new diet has a stable `targetDietId` stored in the draft; an edit uses the
   ACTIVE plan ID and `baseDietVersion`.
4. Account and patient exist in the same scope and patient is active.
5. The prescribed mode has at least one meal with at least one valid `PRIMARY`
   item in the option counted toward totals; cycle evaluates this globally.
6. All relations, quantities, units, snapshots, day assignments and targets
   satisfy domain validation.

If any precondition fails, no confirmed transaction starts and the draft
remains available with an actionable validation result.

### `DietRepository.confirmActive`

```text
ConfirmActiveCommand
├── accountId / patientId
├── targetDietId
├── baseDietId? / baseDietVersion?
├── draftId / confirmedDraftRevision
└── complete validated aggregate

ConfirmActiveResult =
  | { status: COMMITTED_NEW; planId; version: 1 }
  | { status: COMMITTED_UPDATE; planId; version }
  | { status: ALREADY_COMMITTED; planId; version }
```

The local implementation owns one real database transaction that:

- rechecks account/patient and active state;
- for edit, compares ID/status/version before replacing descendants;
- for new, looks up the stable ID before inserting;
- demotes the prior ACTIVE only for new diet;
- writes plan, variations, days, meals, options, items and 1:1 item snapshots;
- enforces one ACTIVE through schema and transaction;
- returns only after the adapter's durable confirmation.

`ALREADY_COMMITTED` is reconciliation of the same stable identity, not a new
write. It never generates a replacement ID.

### Save outcomes exposed to UI

| Outcome | Draft | Confirmed data | UI action |
| --- | --- | --- | --- |
| validation/scope | preserve | unchanged | keep editor, focus/announce issue |
| `ROLLED_BACK` | preserve | prior state intact | show retryable error |
| `VERSION_CONFLICT` | preserve | latest state intact | offer review/copy |
| `RESULT_UNKNOWN` | preserve | unknown | show reconciliation state; no retry button yet |
| commit + cleanup | exact revision removed | ACTIVE confirmed | success, refresh and navigate |
| commit + cleanup failure | preserve as cleanup-pending | ACTIVE confirmed | announce saved; retry cleanup only |

### `reconcileUnknownSave`

- New diet: read `targetDietId` in the same account/patient. Presence means
  committed; absence after conclusive read means not committed.
- Active edit: read base ID. Version `baseVersion + 1` means committed for the
  single-tab attempt; unchanged version means not committed; another state or
  inconclusive read requires user review.
- The operation never resubmits. After `NOT_COMMITTED`, the user may invoke the
  normal save path with the same identity.

## DietDraftStore port

```text
DietDraftStore
├── create(document, context)
├── getByContext(accountId, patientId, routeDietId)
├── get(draftId)
├── putIfNewer(draft, expectedPreviousRevision)
├── reserveTargetId(draftId, expectedRevision, targetDietId)
├── removeIfRevision(draftId, expectedRevision)
├── invalidateByPatient(accountId, patientId)
└── listRecoverableByPatient(accountId, patientId)
```

All reads return structured clones. The adapter never calls `DietRepository`.
No `localStorage` fallback or cross-device sync exists.

## PatientDietReader port

```text
PatientDietReader
├── getPatientDietSummary(accountId, patientId)
├── listHistory(accountId, patientId)
├── listPreviousSources(accountId, patientId)
├── getSnapshot(accountId, patientId, dietId)
└── countConfirmed(accountId, patientId)
```

History includes ACTIVE and SNAPSHOT only. It returns read models with explicit
capabilities and never accepts a draft store as a fallback.

## Patient archive integration

The patient application confirms relational archive first, then calls
`invalidateByPatient`. Its observable result distinguishes:

```text
ARCHIVED_AND_DRAFTS_INVALIDATED
ARCHIVED_CLEANUP_PENDING
```

Both results leave the patient archived. Save always revalidates active state,
so cleanup failure cannot publish an old draft. Restore does not reactivate it.

## Route and UI states

### Diet editor

| State | Required presentation |
| --- | --- |
| loading | structural loading without empty assertion |
| ready + clean | editor with local state indicator |
| local changes pending | non-success status; save/navigation flushes |
| autosaving | `aria-busy`, operation label, editing remains available unless save starts |
| autosave error | persistent actionable feedback; no clinical success copy |
| invalid minimum | “Adicione ao menos uma refeição com um alimento”; keep draft |
| committing | controls/shortcut guarded, initiating focus preserved, busy announced |
| version conflict | editor retained; review/copy action |
| result unknown | reconciliation progress; clinical retry disabled |
| cleanup pending | saved confirmation plus cleanup action; do not call commit again |

### Patient profile/history

| State | Required presentation |
| --- | --- |
| no confirmed diet | empty history; current card absent |
| recoverable draft | separate “Em Criação / Retomar rascunho” affordance, not a table row/count |
| ACTIVE | `Vigente`; open/read and edit actions |
| SNAPSHOT | `Histórico`; open/read only; no edit/delete |
| read error | retryable error, not empty history |

### Read-only diet

The overlay renders the complete frozen snapshot and all cycle/meal options.
It has no mutation controls and does not recalculate energy from macros when a
reference kcal snapshot exists. Closing by button/Escape follows the overlays
contract and creates no draft.

## Architecture boundary

Forbidden imports are enforced by an architecture test:

- `src/app/**`, `src/components/**`, and UI hooks cannot import PGlite,
  Drizzle, raw IndexedDB, `storage.ts` or diet legacy helpers.
- domain/application files cannot import React/Next or provider row types.
- `src/components/ui/**` remains generic and receives no nutrition/storage
  semantics.
