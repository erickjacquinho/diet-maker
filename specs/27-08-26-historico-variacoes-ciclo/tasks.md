# Tasks: Tabela de variações no histórico de ciclo

**Input**: Design documents from `specs/27-08-26-historico-variacoes-ciclo/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, and `quickstart.md`

**Tests**: Included because the specification requires deterministic component, integration, accessibility, and regression coverage.

**Organization**: Tasks are grouped by user story so the expanded history can be delivered incrementally without changing the persisted diet plan.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare deterministic fixtures for the supported variation counts and incomplete historical records.

- [X] T001 [skill: $tdd] [P] Add reusable historical cycle fixtures for one, four, and eight variations, including unassigned days and zero meals, in `tests/fixtures/patient-profile.ts`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the shared read-only formatting and data-boundary rules before user-story work.

- [X] T002 [skill: $proj-table-adequation-v2] Define the display projection rules for canonical day ordering, comma-separated day labels, meal-count text, and missing-value fallbacks in `src/components/organisms/patient/PatientDietsTable.tsx`, without re-reading storage or mutating historical data.

**Checkpoint**: Shared fixture and display-boundary foundation are ready; user-story work can begin.

---

## Phase 3: User Story 1 - Consultar todas as variações de um ciclo (Priority: P1) 🎯 MVP

**Goal**: Replace the variable-height card grid with one predictable table row per historical variation, including the selected single-column day format.

**Independent Test**: Expand a prescription containing four or eight variations and confirm that every variation remains visible in its own standard-height row with name, `Ter, Qui`-style days, macros, calories, and meals.

### Tests for User Story 1

> Write these tests first and ensure they fail before the corresponding implementation tasks.

- [X] T003 [skill: $tdd] [P] [US1] Add component scenarios for one, three, four, and eight variations, asserting one row per variation, preserved order, comma-separated days, required values, and absence of the old card-grid structure in `tests/components/organisms/patient-diets-table.test.tsx`.
- [X] T004 [skill: $tdd] [P] [US1] Add a profile-history integration scenario with at least four stored cycle variations and assert that the expanded variation rows preserve the weighted parent summary in `tests/app/pacientes/patient-profile-history.test.tsx`.

### Implementation for User Story 1

- [X] T005 [skill: $proj-table-adequation-v2] [US1] Replace the card grid in `DietCycleDetails` with a compact read-only tabular variation view in `src/components/organisms/patient/PatientDietsTable.tsx`.
- [X] T006 [skill: $proj-table-adequation-v2] [US1] Add stable variation columns for name/type, assigned days, protein, carbohydrates, fats, calories, and meals in `src/components/organisms/patient/PatientDietsTable.tsx`, keeping units and the required reading order explicit.
- [X] T007 [skill: $proj-table-adequation-v2] [US1] Format assigned days as a single comma-and-space-separated value such as `Ter, Qui`, ordered by the canonical week in `src/components/organisms/patient/PatientDietsTable.tsx`.
- [X] T008 [skill: $proj-table-adequation-v2] [US1] Keep variation rows at standard height by preventing textual wrapping from creating a second content band, while preserving an accessible full-value path for long names or day text in `src/components/organisms/patient/PatientDietsTable.tsx`.
- [X] T009 [skill: $proj-table-adequation-v2] [US1] Add explicit no-variation, no-assigned-day, and no-meal states without dropping historical variation rows in `src/components/organisms/patient/PatientDietsTable.tsx`.

**Checkpoint**: User Story 1 is independently usable with one through eight variations and no card-grid layout.

---

## Phase 4: User Story 2 - Preservar o resumo da prescrição (Priority: P1)

**Goal**: Keep the weighted weekly summary, parent-row height, status, and actions unchanged while details are opened and closed.

**Independent Test**: Expand and collapse a cycle with uneven day assignments and confirm that the parent row's weighted macros/calories, standard height, status, and actions do not change.

### Tests for User Story 2

- [X] T010 [skill: $tdd] [P] [US2] Add a selector regression scenario with uneven day assignments to assert the weighted weekly average remains the parent prescription summary in `tests/lib/patient-profile-selectors.test.ts`.
- [X] T011 [skill: $tdd] [US2] Add component assertions that the parent row retains the standard height before, during, and after expansion, and that its summary values remain unchanged in `tests/components/organisms/patient-diets-table.test.tsx`.

### Implementation for User Story 2

- [X] T012 [skill: $proj-table-adequation-v2] [US2] Preserve the existing weighted-summary data flow and ensure the parent prescription row remains a single standard-height row while the detail region is inserted below it in `src/components/organisms/patient/PatientDietsTable.tsx`.
- [X] T013 [skill: $proj-table-adequation-v2] [US2] Preserve the parent row's status, view-menu, edit, and delete action contracts while integrating the new variation detail rows in `src/components/organisms/patient/PatientDietsTable.tsx`.

**Checkpoint**: User Stories 1 and 2 work together without changing the longitudinal prescription summary or parent-row geometry.

---

## Phase 5: User Story 3 - Usar a expansão sem interferir nas ações existentes (Priority: P2)

**Goal**: Make the variation expansion semantically accessible and keep it isolated from existing prescription actions and simple-diet rows.

**Independent Test**: Operate the expansion with keyboard and pointer, inspect its accessible state and table context, and confirm simple diets and existing actions remain unchanged.

### Tests for User Story 3

- [X] T014 [skill: $tdd] [P] [US3] Add accessibility scenarios for named expansion state, expanded-region relationship, semantic variation headers, explicit units, visible focus, and keyboard operation in `tests/components/organisms/patient-diets-table.test.tsx`.
- [X] T015 [skill: $tdd] [P] [US3] Add regression scenarios proving expansion does not invoke view/edit/delete callbacks and that simple diets do not expose cycle details in `tests/components/organisms/patient-diets-table.test.tsx`.

### Implementation for User Story 3

- [X] T016 [skill: $ui-styling] [US3] Keep the expansion control's accessible name, expanded state, detail-region relationship, focus behavior, and event isolation intact while replacing the detail presentation in `src/components/organisms/patient/PatientDietsTable.tsx`.
- [X] T017 [skill: $ui-styling] [US3] Preserve the simple-diet rendering path and read-only behavior, including explicit non-color meaning for variation type and states, in `src/components/organisms/patient/PatientDietsTable.tsx`.

**Checkpoint**: All user stories are independently testable; expansion is accessible and cannot trigger unrelated prescription actions.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate the complete feature against project contracts and record reproducible manual checks.

- [X] T018 [skill: general] [P] Update the runnable expected outcomes and edge-case scenarios for the variation-row view in `specs/27-08-26-historico-variacoes-ciclo/quickstart.md`.
- [X] T019 [skill: $proj-table-adequation-v2] Run the focused Vitest suite, type-check, lint, table resolver, and design-system audits for the changed target; record any pre-existing baseline findings separately in `specs/27-08-26-historico-variacoes-ciclo/quickstart.md`.
- [X] T020 [skill: $webapp-testing] Perform the desktop manual scenario at 1024px and a wider viewport with four and eight variations, then record the observed pass/fail evidence in `specs/27-08-26-historico-variacoes-ciclo/quickstart.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; prepares deterministic fixtures.
- **Foundational (Phase 2)**: Depends on T001 and blocks all user-story implementation.
- **User Story 1 (Phase 3)**: Depends on T002; delivers the MVP variation-row presentation.
- **User Story 2 (Phase 4)**: Depends on T002 and integrates with the expansion structure from US1.
- **User Story 3 (Phase 5)**: Depends on the final detail structure from US1 and the parent-row contract from US2.
- **Polish (Phase 6)**: Depends on all desired user stories.

### User Story Dependencies

- **User Story 1 (P1)**: Can begin after the foundational phase and is the MVP.
- **User Story 2 (P1)**: Can be tested against the existing parent row after the foundational phase, but its final integration depends on US1's expanded detail structure.
- **User Story 3 (P2)**: Depends on US1 and US2 because accessibility and action isolation apply to the combined final interaction.

### Parallel Opportunities

- T003 and T004 can run in parallel because they modify different test files.
- T010 can run in parallel with T011 because selector and component regressions are in different test files.
- T014 and T015 may be authored in parallel only if the test file is coordinated; otherwise run sequentially to avoid merge conflicts.
- T018 can run in parallel with implementation tasks because it changes only the feature validation guide.

## Parallel Example: User Story 1

```text
Task: T003 [US1] Component coverage for one, three, four, and eight variations in tests/components/organisms/patient-diets-table.test.tsx
Task: T004 [US1] Profile-history integration coverage for four or more variations in tests/app/pacientes/patient-profile-history.test.tsx
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001 and T002.
2. Write and fail T003 and T004.
3. Implement T005 through T009.
4. Stop and validate the variation-row view independently with one through eight variations.

### Incremental Delivery

1. Deliver US1 with the compact variation-row view and explicit incomplete-data states.
2. Add US2 to lock the weighted parent summary and row-height invariant.
3. Add US3 to complete keyboard/accessibility and action-isolation coverage.
4. Run T018 through T020 before human acceptance.

## Notes

- Every task identifies an exact file or feature artifact and an observable outcome.
- The feature does not add persistence, migrations, external interfaces, editing, or changes to the diet constructor.
- Implementation must be executed through `/speckit-implement` after human validation of these artifacts.
