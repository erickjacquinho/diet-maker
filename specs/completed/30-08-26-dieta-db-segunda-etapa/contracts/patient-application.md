# Contract: Patient application boundary

**Feature**: [Conta e pacientes](../spec.md)  
**Status**: Proposed for implementation; not a public HTTP API

This contract keeps route components independent from the relational adapter.
Names are conceptual TypeScript ports; the implementation may split files while
preserving the semantics below.

## AccountContext

The application obtains the active ownership boundary from a validated context.
The UI cannot provide an arbitrary `accountId` as authority.

```text
AccountContext
├── getActive(): AccountContextSnapshot
└── requireActive(): AccountContextSnapshot | AccountContextError
```

`AccountContextSnapshot` includes `accountId` and the local profile identity.
Failure to establish the context is explicit and blocks patient mutations.

## Repositories and transaction port

```text
PatientRepository
├── create(accountId, input)
├── getById(accountId, patientId)
├── listActive(accountId)
├── update(accountId, patientId, expectedVersion, input)
├── archive(accountId, patientId, expectedVersion)
└── restore(accountId, patientId, expectedVersion)

ObjectiveCatalogRepository
├── list(accountId)
├── addCustom(accountId, label)
└── archiveCustom(accountId, objectiveId)

PatientProfileReader
├── getProfile(accountId, patientId)
└── listActiveSummaries(accountId)

TransactionRunner
└── run(operation): committed result | typed failure
```

Repositories receive the validated Account scope on every operation. They do
not expose SQL, tables, provider-specific types, `localStorage` keys or direct
IndexedDB handles.

## Use cases

| Use case | Input | Successful result | Required failures |
| --- | --- | --- | --- |
| `createPatient` | Account context + validated form | created Patient | invalid field, missing context, persistence failure |
| `listActivePatients` | Account context + optional query | ordered active PatientListRows | missing context, read failure |
| `getPatientProfile` | Account context + patientId | PatientProfile | not found, cross-Account, read failure |
| `updatePatient` | Account context + patientId + expectedVersion + form | updated Patient | invalid field, stale version, archived, not found |
| `addObjectiveOption` | Account context + label | existing/new ObjectiveOption | invalid label, duplicate conflict, persistence failure |
| `archivePatient` | Account context + patientId + expectedVersion | archived Patient | stale version, not found, already archived, persistence failure |
| `restorePatient` | Account context + patientId + expectedVersion | active Patient | stale version, not found, already active, persistence failure |

All mutation results are durable before the UI reports success. A failed
transaction returns no partial entity and leaves the prior state available for
retry. An uncertain result must be reconciled by the adapter boundary before a
caller repeats the operation.

## Patient form contract

`CreatePatientModal` and `EditPatientModal` own temporary form state only. They
emit normalized input to the consumer; they do not import repositories or
storage. The consumer maps validation findings to labels and
`aria-describedby` messages.

Required behavior:

- create starts with the existing product defaults and submits only after an
  explicit action or the existing save shortcut;
- edit starts from a copy of the loaded Patient and preserves its version;
- cancel/close/escape/backdrop with dirty state asks whether to discard;
- submit disables duplicate confirmation while pending and exposes loading;
- validation failure keeps the form open; persistence failure keeps entered
  values recoverable; success closes and refreshes the relevant view;
- objective creation leaves the patient unchanged until patient save;
- archive uses the destructive overlay with copy explaining preservation, then
  navigates to the active list only after durable success.

## Route state contract

### `/pacientes`

| State | Required outcome |
| --- | --- |
| loading | announce `Carregando pacientes...` without implying empty data |
| active list | show active rows, search by name/objective, live count and create action |
| first empty | explain first registration and offer create action |
| filtered empty | explain no match and offer clear search |
| read error | show actionable error and retry; never masquerade as empty |

### `/pacientes/[id]`

| State | Required outcome |
| --- | --- |
| active profile | show identity/current cadastral data and edit/archive actions |
| not found | show context error and return to `/pacientes`; no mutation controls |
| archived profile | reject clinical starts and expose no normal active-list entry |
| mutation pending | preserve context, disable duplicate submit and announce busy |
| mutation error/conflict | keep modal open with actionable message and current input |

The profile may continue rendering future clinical read sections through their
own readers, but this SDD does not add their persistence or mutation behavior.

## Compatibility and design-system contract

- Keep existing component IDs/exports unless a later approved change is needed.
- `DeletePatientModal` may retain its code name for compatibility while its
  content and callback semantics become archive-oriented.
- Reuse `ui-dialog`, `ui-alert-dialog`, `ui-input`, `ui-select` and existing
  atoms/molecules; do not place patient vocabulary or storage logic in
  `src/components/ui` or generic atoms.
- Preserve `overlays`, `fields`, `selection`, `data-display`, `feedback` and
  `loading` category state matrices, desktop tokens and WCAG 2.2 AA behavior.
