# Data Model: Conta e pacientes

**Feature**: [spec.md](./spec.md)  
**Scope**: Conta local, objetivos e pacientes; relações clínicas futuras são
referenciadas sem serem criadas ou migradas nesta etapa.

## Model boundaries

1. **Canonical local data**: Account, ObjectiveOption e Patient persistidos no
   banco relacional local aprovado na etapa 1.
2. **Read projections**: PatientProfile, PatientListRow e PatientTimeline
   compostos por consultas; não são fontes de escrita independentes.
3. **Future related records**: DietPlan, BodyAssessment, ConsultationRecord e
   DietDraft pertencem a outros SDDs. Nesta etapa são dependências de contrato
   e preservação, não tabelas/fluxos novos.
4. **Legacy test data**: chaves do armazenamento anterior não participam do
   modelo e são descartadas antes da primeira execução.

## Entities

### Account

Representa a Conta/perfil local proprietário do consultório.

| Field | Type/shape | Rules |
| --- | --- | --- |
| `id` | global identifier | Required, immutable and stable; boundary for ownership |
| `displayName` | short text | Required for the local profile/context |
| `createdAt` | timestamp | Required |
| `updatedAt` | timestamp | Required and updated on profile mutation |

V1 possui uma Conta local ativa. O modelo mantém a entidade para evitar
acoplamento dos registros clínicos a uma identidade implícita e permitir
evolução futura.

### ObjectiveOption

Opção de objetivo padrão ou personalizada do catálogo da Conta.

| Field | Type/shape | Rules |
| --- | --- | --- |
| `id` | global identifier | Required and immutable |
| `accountId` | Account reference | Required; option belongs to exactly one Account |
| `label` | short text | Required after trimming |
| `normalizedLabel` | normalized short text | Required; equality key for idempotency |
| `origin` | `SYSTEM` or `CUSTOM` | Identifies seeded default vs user-created option |
| `archivedAt` | nullable timestamp | Optional; removing option does not change patients |
| `createdAt` / `updatedAt` | timestamps | Required |

Uniqueness is enforced for active options by `(accountId, normalizedLabel)`.
System defaults may be seeded for the active Account; the physical seeding
mechanism belongs to the implementation plan, not to the UI.

### Patient

Representa o estado cadastral atual de uma pessoa vinculada à Conta.

| Field | Type/shape | Rules |
| --- | --- | --- |
| `id` | global identifier | Required and immutable; generated outside components |
| `accountId` | Account reference | Required; must match the active Account context |
| `displayCode` | presentation code | Optional/derived display value; never relation authority |
| `name` | short text | Required after trimming; source for initials projection |
| `age` | non-negative number | Domain-validated current value |
| `gender` | catalog value | Required according to the existing interface catalog |
| `heightCm` | positive number | Required for the current form contract |
| `weightKg` | positive number | Required for the current form contract |
| `phone` | normalized phone | Optional; one canonical representation |
| `whatsapp` | normalized phone | Optional; one canonical representation |
| `currentObjective` | canonical objective label/value | Required according to the patient form contract; remains readable if its catalog option is archived |
| `defaultMacroTargets` | protein/carbs/fats/kcal | Non-negative defaults; not historical snapshots |
| `createdAt` / `updatedAt` | timestamps | Required |
| `version` | positive integer | Starts at 1 and increments on explicit update/archive/restore |
| `archivedAt` | nullable timestamp | Null means active; value means logically archived |

The physical model may use flattened columns for demographics, contacts and
macro targets, but the domain contract exposes these concepts without leaking
table names or provider types.

### PatientProfile

Read projection used by `/pacientes/[id]`. It contains the canonical Patient,
derived initials, available objective labels and related-record summaries when
those future repositories are available. It must not be persisted as a second
patient record.

### PatientListRow

Read projection used by `/pacientes`. It contains an active Patient, display
code/name/objective and non-authoritative indicators from related readers. It
must never include archived patients and must not trigger a mutation.

### PatientTimeline

Derived chronological view of persisted related events. This stage preserves
the reader contract but does not introduce a timeline table or duplicate
`lastConsultation`.

## Future related records and references

```text
Account 1 ─── N ObjectiveOption
Account 1 ─── N Patient
Patient 1 ─── N DietPlan (future SDD)
Patient 1 ─── N BodyAssessment (future SDD)
Patient 1 ─── N ConsultationRecord (future SDD)
```

Every future clinical record carries `accountId` and `patientId`, with a
relationship validated against the same Account. A future `DietDraft` may
carry contextual references only; it is not a Patient child in this model.

## Invariants

- `Account.id`, `Patient.id` and `ObjectiveOption.id` are immutable.
- Every patient and objective option belongs to the active Account; an
  operation cannot select an arbitrary owner from the UI.
- `Patient.name` is trimmed before validation and persistence.
- Phone/WhatsApp and objective labels use one normalized representation for
  equality and display retains the canonical label.
- Age and macro targets are non-negative; height and weight, when present, are
  positive.
- Active patient listing is equivalent to `archivedAt IS NULL`.
- A patient archive never deletes related records and never becomes a physical
  delete in normal application flows.
- An archived patient cannot receive new clinical records; restoration removes
  the archive marker without duplicating the patient.
- Patient updates, archive and restore require the expected `version`; success
  increments it atomically.
- Initials, last activity and timeline are derived; no canonical arrays for
  diets, assessments or consultations are embedded in Patient.
- Removing/archiving an ObjectiveOption does not rewrite `Patient.currentObjective`.
- A transaction failure leaves the previous Account/ObjectiveOption/Patient
  state intact.
- The new module performs no read or write to legacy `localStorage` keys.

## State transitions

```text
Patient: (new) ──create──> ACTIVE(version 1)
ACTIVE ──explicit update──> ACTIVE(version + 1)
ACTIVE ──archive──> ARCHIVED(version + 1)
ARCHIVED ──restore contract──> ACTIVE(version + 1)
```

Invalid transitions are rejected: create with invalid data, update with a
stale version, update/archive of a missing patient, clinical mutation of an
archived patient, restore of an active patient, and cross-Account access.

## Normalization and validation

- Trim leading/trailing spaces from names, objective labels and textual contact
  input before validation.
- Compare objective labels case-insensitively using the project locale rules;
  preserve one canonical label for the option selected by the user.
- Persist dates/timestamps in an unambiguous canonical form; localized
  `dd/mm` presentation remains a view concern.
- Return field-level validation findings for forms and typed domain errors for
  scope, version, missing entity, archived state and persistence failure.

## Legacy and migration boundary

The model has no converter from `nutridiet_patients`,
`nutridiet_assessments_*`, `nutridiet_diets_*` or custom-objective keys. Test
fixtures for this feature are created through the new repository/application
boundary and start with a clean local namespace.
