# Implementation Plan: Tabela de variações no histórico de ciclo

**Branch**: `[27-08-26-historico-variacoes-ciclo]` | **Date**: 2026-08-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from [spec.md](./spec.md)

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Reformular a expansão de uma prescrição de ciclo de carboidratos no histórico do perfil para apresentar uma linha tabular por variação, com uma única coluna de dias no formato `Ter, Qui`, macros, calorias e refeições. A linha principal da prescrição continua sendo o resumo da média semanal ponderada e permanece com altura padrão. A mudança reutiliza o histórico já normalizado e os contratos visuais existentes, sem alterar o armazenamento da dieta ou o construtor de ciclos.

The implementation will keep the outer prescription table and its existing action contracts intact while making its controls iconographic and compact. The `Plano Alimentar` cell will show only the diet type, and the status will remain as a compact dedicated column with `Ativo`/`Histórico`. The expanded content will remain a compact, read-only variation table/list with stable rows, explicit empty states, canonical weekly-day ordering, accessible semantic context, no card grid, and no horizontal scrolling.

## Technical Context

<!--
  Project technical context for this feature.
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.7, React 19, Next.js 15.1.6

**Primary Dependencies**: Existing `DataTable` molecule, table primitives, design-system typography/tokens, `HistoricalDiet`/`HistoricalDietVariation` history types, and canonical day labels from the diet domain.

**Storage**: Existing browser-local historical diet records; no new persistence or schema migration.

**Testing**: Vitest, Testing Library, project type-check, ESLint, and the existing table/design-system audits where applicable.

**Target Platform**: Desktop web application at 1024px and above.

**Project Type**: Next.js desktop web application with client-side profile history views.

**Performance Goals**: Expanding a history row with up to eight variations must remain visually stable and immediately usable, without a layout defect caused by card wrapping or row-content overflow.

**Constraints**: Main and variation rows must preserve the standard table height; the main and variation tables must fit the available desktop width from 1024px without horizontal scrolling; the plan cell shows only the diet type; status remains a compact dedicated column; days are one comma-separated text value; long variation names truncate with an accessible full-value path; the history is read-only; desktop scope, WCAG 2.2 AA, canonical tokens, accessible table context, and existing action contracts are mandatory.

**Scale/Scope**: One profile history table, one expanded cycle at a time, one row per historical variation, validated for one through at least eight variations. No changes to diet construction, persistence, imports, or external integrations.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence / Plan |
|-----------|--------|----------------|
| I. Atomic Design Architecture | PASS | Keep domain presentation in the patient organism; reuse existing molecule/atoms/primitives and do not move domain rules into `src/components/ui`. |
| II. Canonical Design System | PASS | Use the existing DataTable/table family, canonical typography, spacing, semantic colors, focus, and row-height tokens. No new local visual language. |
| III. Desktop Scope and Accessibility | PASS | Target remains desktop `>=1024px`; requirements cover table semantics, keyboard operation, focus, accessible names/state, units, and non-color meaning. |
| IV. Test-First Quality and Isolation | PASS | Add deterministic component and integration scenarios for 4+ variations, empty data, unassigned days, height preservation, and simple-diet regression before implementation validation. |
| V. Spec-Driven Execution | PASS | This plan is derived from the approved spec and is intended to be executed only through `/speckit-implement` after human validation. |

## Project Structure

### Documentation (this feature)

```text
specs/27-08-26-historico-variacoes-ciclo/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Not created: no external interface contract is introduced
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
<!--
  Concrete source layout for this feature.
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── components/
│   ├── molecules/
│   ├── organisms/patient/PatientDietsTable.tsx
│   └── ui/
├── lib/
│   ├── dietStore.ts
│   ├── patientProfileSelectors.ts
│   └── patientsStoreTypes.ts
└── app/pacientes/[id]/page.tsx

tests/
├── app/pacientes/patient-profile-history.test.tsx
├── components/organisms/patient-diets-table.test.tsx
└── lib/patient-profile-selectors.test.ts
```

**Structure Decision**: Keep the feature within the existing profile-history organism and its current historical-data adapter. The expanded variation view is a presentation concern owned by `PatientDietsTable`; domain calculation and normalization remain in the existing selector/domain modules. No new top-level package or external contract is required.

## Design Decisions

### Expanded variation view

- Replace the current multi-column card grid with a compact read-only tabular view.
- Render one vertical row per historical variation, preserving the stored variation order.
- Keep columns in a stable order: variation name/type, assigned days, protein, carbohydrates, fats, calories, and meals.
- Render assigned days in one text column, with canonical short labels separated by comma and space, such as `Ter, Qui`.
- Keep the visual row at the standard table height. Long text receives an accessible full-value path instead of forcing a second content line.
- Keep semantic headers available even if their visual treatment is discreet; do not remove context solely to make the view look simpler.
- Keep the parent prescription row and its weighted weekly summary unchanged when the details are opened or closed.
- Reduce the variation-identification column to the space needed for the visible type and truncate only the variation name; keep the remaining metric columns compact and prevent horizontal scrolling.

### Main prescription table density

- Keep the existing column order and dedicated status column, but replace the visible plan name/tag combination with the mode label `Simples` or `Ciclo de carboidratos`.
- Use `Ativo` and `Histórico` for status and keep the status badge compact rather than allocating unnecessary minimum width.
- Render view, edit, and delete as compact icon controls; preserve their accessible names, titles, links, callbacks, and action isolation.
- Use a full-width fixed table without unnecessary minimum-width constraints so the principal table does not create horizontal overflow from 1024px onward.

### Data flow

1. The existing profile selector supplies the historical prescription summary and the preserved cycle variation snapshots.
2. The organism reads the variation snapshots without re-reading browser storage or mutating the saved plan.
3. A small presentation projection formats canonical day labels and explicit empty values for missing days or meals.
4. The existing controlled expansion state inserts one detail region below the parent row.

### Empty and inconsistent historical data

- No variations: show a contextual empty message inside the expanded region.
- No assigned days: keep the variation row and show `Nenhum dia atribuído`.
- No meals: keep the variation row and show `Nenhuma refeição`.
- Repeated or unknown historical day IDs: preserve the row and available values without destructive normalization; known IDs use canonical labels and unknown IDs remain understandable as stored values.

### Accessibility and interaction

- Use a named expansion control with `aria-expanded`, a relationship to the detail region, visible focus, and equivalent keyboard/pointer behavior.
- Keep the variation data read-only and ensure the expansion control cannot trigger view, edit, or delete actions.
- Provide semantic table headers or an equivalent accessible name/value relationship for every data column.
- Keep units attached to macro, calorie, and meal values so the table does not rely on visual position or color.
- Verify both table containers at 1024px and 1440px with no horizontal overflow and no clipping of critical values.

## Constitution Check — Post-Design

| Principle | Status | Design evidence |
|-----------|--------|-----------------|
| I. Atomic Design Architecture | PASS | The expanded view remains a patient-organism concern and consumes existing generic table primitives; no upward dependency or domain logic is introduced into UI primitives. |
| II. Canonical Design System | PASS | The design explicitly reuses the canonical table family, semantic headers, standard row geometry, typography, spacing, color, focus, and icon rules. |
| III. Desktop Scope and Accessibility | PASS | The design is desktop-only and specifies semantic context, keyboard operation, focus, accessible states, units, and non-color meaning. |
| IV. Test-First Quality and Isolation | PASS | The quickstart and future tasks will exercise 4–8 variations, empty/incomplete data, row-height invariants, expansion isolation, and simple-diet regression with deterministic tests. |
| V. Spec-Driven Execution | PASS | Data model, UX decisions, edge cases, and validation commands are traceable to the spec; implementation remains gated behind human validation and `/speckit-implement`. |

## Complexity Tracking

No constitution violations. The feature remains within the existing profile organism, selector, canonical table family, and test locations; the follow-up density changes do not alter domain types or persistence.
