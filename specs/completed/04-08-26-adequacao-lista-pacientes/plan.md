# Implementation Plan: Adequacao da Lista de Pacientes

**Branch**: `tela-pacientes` | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/04-08-26-adequacao-lista-pacientes/spec.md`

## Summary

Substituir a grade de cards da rota `/pacientes` por uma tabela desktop continua, orientada pela prioridade do proximo acompanhamento e enriquecida com BF atual, variacao percentual, indicadores historicos de avaliacao/dieta e estados textuais. A implementacao deve evoluir o organismo de tabela existente, manter o formulario de cadastro e usar a projecao pura de linhas para combinar dados de paciente, eventos, avaliacoes corporais e dietas locais.

## Technical Context

**Language/Version**: TypeScript 5.7, React 19, Next.js 15 App Router

**Primary Dependencies**: Tailwind CSS 3.4, Lucide React 0.475, Shadcn/Radix primitives already present, `ui-table`

**Storage**: Existing browser local persistence through `localStorage`; no new remote storage

**Testing**: Vitest, Testing Library, TypeScript check, ESLint and design-system validators

**Target Platform**: Web desktop from `1024px`; mobile and tablet out of scope

**Project Type**: Next.js client-rendered web application with local/offline-first data

**Performance Goals**: Search and priority projection must remain synchronous and responsive for the current local patient scale; preserve the project target of sub-100ms search feedback where measurable

**Constraints**: No new network dependency; preserve existing patient/diet/assessment persistence; use design-system tokens; keep `src/components/ui` generic; no sidebar redesign; no mobile layout

**Scale/Scope**: One route (`/pacientes`), one domain organism, current local patient dataset, four event-priority states and the existing registration modal

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence / action |
| --- | --- | --- |
| Atomic Design Architecture | PASS | Page owns route state; `PatientListTable` remains an organism; `ui-table` remains generic. |
| Canonical Design System | PASS | Visual decisions consume category `data-display`, existing tokens and Lucide; inline CSS from the reference is not copied. |
| Desktop Scope and Accessibility | PASS | Target starts at `1024px`; semantic table, caption, keyboard focus and non-color status communication are required. |
| Test-First Quality and Isolation | PASS | New projection and organism/page coverage is planned under `tests/`; tests remain deterministic and local. |
| Spec-Driven Execution | PASS | This plan ends at design artifacts; implementation is reserved for `/speckit-implement` after human approval. |

## Project Structure

### Documentation (this feature)

```text
specs/04-08-26-adequacao-lista-pacientes/
|- spec.md
|- plan.md
|- research.md
|- data-model.md
|- quickstart.md
|- checklists/requirements.md
|- checklists/ux.md
`- tasks.md              # created by /speckit-tasks
```

### Source Code (repository root)

```text
src/
|- app/pacientes/page.tsx
|- components/
|  |- organisms/PatientListTable.tsx
|  `- ui/table.tsx
`- lib/
   |- patientListView.ts
   `- patientsStore.ts

tests/
|- app/pacientes/page.test.tsx
|- components/organisms/patient-list-table.test.tsx
`- lib/patient-list-view.test.ts

design-system/components/profiles/organisms/patient-list-table.md
design-system/components/registry.json
```

**Structure Decision**: Single Next.js project. The page remains responsible for local state and modal orchestration; the organism owns the semantic table and row interaction; pure list projection and formatting stay in `src/lib`; generic Shadcn primitives remain untouched. The profile is updated because its content contract changes from last clinical record to body-fat evolution and historical record indicators. The registry changes only if the public component identity, source or consumer metadata changes.

## Implementation Design

### Data flow

1. The page loads `Patient` records from the existing local store.
2. The page obtains assessment history and diet-existence summaries for the patients in scope without changing persisted `Patient` objects.
3. `filterPatients` applies the name/objective query before priority projection, preserving the approved search-before-order behavior.
4. `patientListView` normalizes dates, sorts valid assessments, derives BF current/delta/period and creates the two historical-record flags.
5. The same projection classifies the next event and flattens rows into overdue, today, upcoming by date and no-event order.
6. `PatientListTable` renders the resulting row contract; the page renders loading, empty-list and no-results states around it.

### Row contract

`PatientListTableProps` remains a small organism contract: a render-ready `rows` collection and a route navigation callback. `PatientListRow` gains a history summary containing:

- current BF label;
- signed BF delta label and elapsed days when comparable;
- `hasAssessment` and `hasDiet` flags;
- accessible description for the two indicators;
- existing event state/type/date labels and profile href.

The organism does not read `localStorage`, calculate clinical values or decide ordering. Those responsibilities remain in the page/store boundary and pure list projection.

### Presentation contract

- Header: page title and preparation subtitle.
- Toolbar: search, live patient count and `+ Novo paciente` aligned to the right; no visible `Prioridade do acompanhamento` control.
- Panel: `Lista de pacientes` and the subtitle about upcoming appointments and body-fat evolution.
- Table: `Paciente`, `Evolucao de gordura`, `Proximo acompanhamento` and a chevron action column, with `Objetivo` as the second column.
- Patient cell: fixed two-slot vertical indicator rail, name, gender icon and age.
- Body-fat cell: current `BF` value followed by signed percent delta and days, or explicit insufficient-data text.
- Event cell: status, type and `dd/mm` date; text communicates state independently of color.

### Accessibility contract

- Use the existing semantic table primitive with caption and column scopes.
- Keep one row-level navigation contract with a real profile link fallback; avoid competing nested actions.
- Preserve visible focus for row keyboard activation and the new-patient action.
- Mark Mars, Venus, chevron and purely decorative dots appropriately; provide an accessible summary for the indicator rail.
- Never use the blue/taupe indicator colors as the only source of meaning.
- Keep row height, borders, typography, radius and focus ring within the `data-display` category and design-system tokens.

### Migration boundaries

- Remove the baseline card grid and its card-only metrics from the main list: avatar card, weight, calorie target and last-consultation blocks.
- Keep the registration dialog and its existing persistence contract.
- Keep the global sidebar and all profile routes unchanged.
- Remove the unused visible sort control and related icon/imports.
- Treat any current uncommitted table implementation as partial migration work; reconcile it with this plan and verify it before describing the feature as conforming.

### Design-system documentation

Update `design-system/components/profiles/organisms/patient-list-table.md` so its anatomy, content rules, states and acceptance criteria describe BF evolution, the two history indicators and the approved toolbar/table relationship. Review `registry.json` during implementation; modify it only if the component source, export or consumer metadata changes. Do not modify `src/components/ui/table.tsx` for domain behavior.

### Error and empty behavior

- Loading: preserve a named busy status before patients are available.
- Empty list: show the existing patient-registration guidance and keep `+ Novo paciente` available where the page structure permits.
- No results: show a clear filter-reset action and preserve the toolbar.
- Missing BF: show explicit text without an invented value or delta.
- Missing next event: show explicit text and profile guidance.
- Invalid history/event dates: exclude invalid values from calculations and fall back to the appropriate empty state.

## Phase 0: Research Summary

The decisions and alternatives are recorded in [research.md](./research.md). No external API contract or migration is required. The main unknowns were resolved from the existing `Patient`, `BodyAssessment`, local diet storage and design-system contracts.

## Phase 1: Design Artifacts

- [data-model.md](./data-model.md) defines existing entities, the derived history summary, the render-ready row and validation rules.
- No `contracts/` directory is needed because this change exposes no external API or integration contract; the UI contract is documented in the component profile and this plan.
- [quickstart.md](./quickstart.md) defines automated and manual validation against the HTML reference and desktop accessibility requirements.

## Constitution Re-check After Design

| Principle | Status | Evidence / action |
| --- | --- | --- |
| Atomic Design Architecture | PASS | The design keeps domain composition in the organism and projection logic in `lib`; no higher-layer import is introduced. |
| Canonical Design System | PASS | `data-display` is the category source; the profile is updated as part of the same change set; raw reference CSS remains non-authoritative. |
| Desktop Scope and Accessibility | PASS | The plan defines `1024px` desktop behavior, semantic table structure, row keyboard operation, focus, labels and non-color communication. |
| Test-First Quality and Isolation | PASS | Tests are planned before implementation tasks and reside under `tests/` with local deterministic fixtures. |
| Spec-Driven Execution | PASS | The plan, model and quickstart are complete; implementation remains blocked until human approval and `/speckit-implement`. |

## Complexity Tracking

No constitution violations identified; no complexity exception is required.
