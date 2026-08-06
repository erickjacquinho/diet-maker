# Data Model: Lista de Pacientes

**Feature**: [spec.md](./spec.md)

## Existing domain entities

### Patient

Represents the patient already persisted by the application.

Relevant fields for this feature:

| Field | Role in the list | Rule |
| --- | --- | --- |
| `id` | Profile destination and row identity | Must be stable for the current patient record. |
| `name` | Primary identity | Displayed as the primary row label. |
| `age` | Identity metadata | Displayed with the patient name. |
| `gender` | Identity icon selection | Maps to the existing gender vocabulary; unknown values fall back to text-neutral treatment. |
| `objective` | Search and objective column | Searchable and displayed as a compact label. |
| `nextEvent` | Priority and next accompaniment | Contains date and event type when scheduled. |
| `lastActivity` | Legacy/activity context | May remain available to the domain but is not the primary evolution column. |

### BodyAssessment

Represents a physical assessment already persisted for a patient.

Relevant fields:

| Field | Role in the list | Rule |
| --- | --- | --- |
| `id` | Historical record identity | Used to distinguish records when dates coincide. |
| `date` | Current/previous comparison and elapsed period | Must be normalized before sorting and subtracting days. |
| `bodyFatPercent` | BF current and delta | Must be numeric and displayed with locale `pt-BR`. |
| Other measurements | Profile context only | Must not become additional columns in this list. |

### Diet record

Represents an existing persisted diet record associated with a patient.

Only existence is needed by the list. The list must not duplicate the full diet payload.

## Derived entity: PatientListHistory

Read-only projection built for each patient before table rendering.

| Field | Type/meaning | Rule |
| --- | --- | --- |
| `hasAssessment` | boolean | True when at least one physical assessment exists. |
| `hasDiet` | boolean | True when at least one historical diet exists. |
| `currentBodyFatPercent` | number or null | `bodyFatPercent` from the newest valid assessment. |
| `previousBodyFatPercent` | number or null | `bodyFatPercent` from the immediately previous valid assessment. |
| `bodyFatDeltaPercent` | number or null | `current - previous`; null when comparison is unavailable. |
| `bodyFatDeltaDays` | number or null | Days between current and previous assessment dates. |
| `bodyFatLabel` | string | Localized current BF, or the approved missing-data message. |
| `bodyFatDeltaLabel` | string or null | Localized signed delta plus days, e.g. `−0,4% 20d`. |

## Derived entity: PatientListRow

The render-ready row projection used by `PatientListTable`.

| Field | Role |
| --- | --- |
| `patient` | Original patient identity and profile id. |
| `group` | `overdue`, `today`, `upcoming` or `no-event`. |
| `href` | Profile route for row navigation. |
| `eventStatusLabel` | Human-readable state. |
| `eventTypeLabel` | Human-readable event type or null. |
| `eventDateLabel` | `dd/mm` date or null. |
| `history` | PatientListHistory summary. |
| `recordIndicatorLabel` | Accessible description of assessment/diet presence. |

## State transitions

1. A patient is loaded from existing local persistence.
2. Patient history is read and normalized into `PatientListHistory`.
3. The patient is classified by `nextEvent` into one of four priority groups.
4. Search filters the patient set by name or objective.
5. The filtered set is projected into `PatientListRow` and flattened in the fixed priority sequence.
6. Rendering selects normal, no-event, no-assessment, empty-list or no-results messaging without mutating the source data.

## Validation rules

- Invalid event dates do not enter overdue/today/upcoming groups.
- Invalid assessment dates are ignored for current/previous comparison.
- A single valid assessment can produce a current BF value but cannot produce a delta.
- A delta is displayed only when both assessment dates and BF values are valid.
- Delta days are non-negative and based on the current assessment date minus the previous assessment date.
- Search normalization follows `pt-BR` case-insensitive matching for patient name and objective.
- The projection must not write derived BF, diet flags or event labels back into `Patient`.
