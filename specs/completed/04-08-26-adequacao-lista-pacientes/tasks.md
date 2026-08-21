# Tasks: Adequacao da Lista de Pacientes

**Input**: Design documents from `/specs/04-08-26-adequacao-lista-pacientes/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: Required by the project constitution for this flow; new tests belong under `tests/` and use deterministic local fixtures.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish deterministic fixtures and confirm the migration boundary before changing the route.

- [X] T001 [skill: tdd] [P] Create deterministic patient-list fixtures covering overdue, today, upcoming, no-event, two-assessment BF history and diet/assessment indicator combinations in `tests/fixtures/patient-list.ts`.
- [X] T002 [skill: webapp-testing] [P] Record the approved target columns, labels, event order and out-of-scope sidebar boundary in `specs/04-08-26-adequacao-lista-pacientes/quickstart.md` and use it as the implementation handoff reference.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Expose the existing local histories through typed read-only helpers without changing persisted patient data.

- [X] T003 [skill: frontend-architecture-mindset] Add typed read-only assessment-history and historical-diet-existence helpers in `src/lib/patientsStore.ts`, preserving the existing `localStorage` keys and error fallbacks.
- [X] T004 [skill: tdd] [P] Add pure date, BF and record-history fixture expectations to `tests/lib/patient-list-view.test.ts` before implementing the derived row projection.

**Checkpoint**: Existing patient, assessment and diet records can be read into deterministic test inputs without modifying the persisted `Patient` entity.

---

## Phase 3: User Story 1 - Triar pacientes em uma lista continua (Priority: P1) MVP

**Goal**: Replace the card grid with one semantic table ordered by next accompaniment priority and linked to patient profiles.

**Independent Test**: With patients in all four event states, the page presents one table in overdue, today, upcoming-by-date and no-event order; each row can open its profile by keyboard and profile link.

### Tests for User Story 1

- [X] T005 [skill: tdd] [US1] Add projection tests for event classification, fixed priority order, deterministic tie-breaking, search-before-order filtering and event labels in `tests/lib/patient-list-view.test.ts`.
- [X] T006 [skill: tdd] [P] [US1] Add semantic table and row-navigation tests for headers, caption, profile href, chevron action, hover/focus contract and Enter/Space behavior in `tests/components/organisms/patient-list-table.test.tsx`.

### Implementation for User Story 1

- [X] T007 [skill: frontend-architecture-mindset] [US1] Update the pure row projection and event-formatting rules in `src/lib/patientListView.ts` so filtering precedes the fixed overdue/today/upcoming/no-event flattening and invalid dates fall back to no-event.
- [X] T008 [skill: ui-styling] [US1] Replace the card-only content in `src/components/organisms/PatientListTable.tsx` with the continuous semantic table columns `Paciente`, `Objetivo`, `Evolucao de gordura`, `Proximo acompanhamento` and the profile chevron column, preserving row-level keyboard navigation.
- [X] T009 [skill: frontend-architecture-mindset] [US1] Compose the table panel in `src/app/pacientes/page.tsx`, remove the baseline card grid and card-only weight/calorie/last-consultation metrics, and keep the existing profile routes and registration dialog intact.

**Checkpoint**: The route no longer depends on patient cards and provides an independently testable continuous table with the approved event priority.

---

## Phase 4: User Story 2 - Avaliar contexto corporal e de acompanhamento (Priority: P1)

**Goal**: Add BF current/delta context and the two fixed historical-record indicators without using weight as the list metric.

**Independent Test**: Given current and previous assessments plus diet-history combinations, the table shows BF and `delta% dias`, explicit missing-data text and correctly aligned assessment/diet indicators.

### Tests for User Story 2

- [X] T010 [skill: tdd] [US2] Add tests for latest/previous assessment selection, signed BF delta, elapsed days, single-assessment fallback, invalid history dates and assessment/diet indicator flags in `tests/lib/patient-list-view.test.ts`.
- [X] T011 [skill: tdd] [P] [US2] Add table assertions for Mars/Venus icons, two vertically reserved indicator slots, accessible indicator descriptions, BF labels and absence of the weight column in `tests/components/organisms/patient-list-table.test.tsx`.

### Implementation for User Story 2

- [X] T012 [skill: frontend-architecture-mindset] [US2] Extend the pure patient-row model in `src/lib/patientListView.ts` with `PatientListHistory`, BF current/delta/period formatting in `pt-BR`, `hasAssessment`, `hasDiet` and accessible indicator labels without writing derived values back to storage.
- [X] T013 [skill: ui-styling] [US2] Render BF current and signed variation, Mars/Venus gender icons, fixed assessment/diet indicator slots and non-color accessible descriptions in `src/components/organisms/PatientListTable.tsx` using existing design-system tokens.
- [X] T014 [skill: design-system] [US2] Update the component contract and acceptance criteria from last clinical record to BF evolution and historical indicators in `design-system/components/profiles/organisms/patient-list-table.md`, and update `design-system/components/registry.json` only if source/export/consumer metadata changes.

**Checkpoint**: The table communicates body-fat evolution and record availability without the excluded current-weight metric or color-only meaning.

---

## Phase 5: User Story 3 - Buscar, cadastrar e reconhecer estados da lista (Priority: P2)

**Goal**: Complete the operational toolbar and preserve all list, loading, empty and modal states around the new table.

**Independent Test**: Search changes the filtered rows and live count, `+ Novo paciente` opens the existing modal, and empty/no-results/no-event/no-BF states remain understandable.

### Tests for User Story 3

- [X] T015 [skill: tdd] [P] [US3] Add page-level tests for toolbar search, live patient count, `+ Novo paciente` placement/label, no-results reset and empty-list guidance in `tests/app/pacientes/page.test.tsx`.

### Implementation for User Story 3

- [X] T016 [skill: ui-styling] [US3] Move the creation action into the toolbar in `src/app/pacientes/page.tsx`, remove the visible `Prioridade do acompanhamento` control and related imports, and keep the existing modal open/submit behavior.
- [X] T017 [skill: frontend-architecture-mindset] [US3] Implement the panel header, toolbar, loading, empty-list and no-results composition in `src/app/pacientes/page.tsx`, preserving the sidebar as an external layout concern and keeping `+ Novo paciente` available in the intended states.
- [X] T018 [skill: ui-styling] [US3] Complete event, missing-BF and missing-next-event copy plus accessible status announcements in `src/components/organisms/PatientListTable.tsx` and `src/app/pacientes/page.tsx`.

**Checkpoint**: The page supports the full pre-profile triage flow without reintroducing cards or an unsupported priority control.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate design-system compliance, quality gates and the visual migration against the approved reference.

- [X] T019 [skill: code-reviewer-expert] [P] Run `npm run type-check`, `npm test`, `npm run lint` and `npm run verify:design-system`; fix findings in `src/app/pacientes/page.tsx`, `src/components/organisms/PatientListTable.tsx`, `src/lib/patientListView.ts`, `tests/lib/patient-list-view.test.ts` and `tests/components/organisms/patient-list-table.test.tsx` before marking the feature ready.
- [X] T020 [skill: design-system] [P] Verify the organism remains registered at the correct Atomic layer and that no domain behavior was added to `src/components/ui/table.tsx`, using `design-system/components/registry.json` and `.agents/rules/shadcn-preservation.md` as the audit sources.
- [X] T021 [skill: webapp-testing] Compare the desktop main content at `1024px` or wider with `refs/pacientes-list-view.html`, ignoring the sidebar, and record the validation result against `specs/04-08-26-adequacao-lista-pacientes/quickstart.md`.
- [X] T022 [skill: code-reviewer-expert] Confirm the final diff distinguishes removed card behavior, implemented table behavior and updated documentation in `src/app/pacientes/page.tsx`, `src/components/organisms/PatientListTable.tsx`, `src/lib/patientListView.ts` and `design-system/components/profiles/organisms/patient-list-table.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No code dependencies; creates fixtures and handoff context.
- **Foundational (Phase 2)**: Depends on Setup; blocks row-history projection.
- **User Story 1 (Phase 3)**: Depends on Foundational; delivers the MVP table and priority order.
- **User Story 2 (Phase 4)**: Depends on Foundational and the table contract from US1; adds BF and historical indicators.
- **User Story 3 (Phase 5)**: Depends on the page/table composition from US1 and the row states from US2.
- **Polish (Phase 6)**: Depends on all selected stories being complete.

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2; no dependency on another user story.
- **US2 (P1)**: Starts after Phase 2 and integrates into the table contract created by US1.
- **US3 (P2)**: Depends on the final table and row state contracts from US1/US2, but remains independently testable through page-level states.

### Parallel Opportunities

- T001 and T002 can run in parallel.
- T003 and T004 can run in parallel after setup.
- T005 and T006 can run in parallel once fixtures exist.
- T010 and T011 can run in parallel after the US1 table contract exists.
- T015, T019 and T020 touch separate test/audit concerns and can run in parallel when their prerequisites are complete.

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete US1: continuous semantic table and fixed event-priority order.
3. Stop and validate the route against the core triage journey.

### Incremental Delivery

1. Add US2: BF evolution and two historical-record indicators.
2. Add US3: toolbar placement, search count, modal action and edge states.
3. Run the cross-cutting design-system and visual reference checks.

### Explicit Non-Goals for Implementation

- Do not redesign the sidebar or patient profile route.
- Do not add a visible sort menu or a new scheduling module.
- Do not add weight, calorie or macro metrics to the list.
- Do not copy inline CSS from the HTML reference.
- Do not change the generic Shadcn table primitive for patient-specific behavior.

## Phase 7: Convergence

- [X] T023 [skill: tdd] [US1] Normalize event date keys before formatting and sorting so `DD/MM/YYYY` and ISO values representing the same day render consistently and use deterministic name tie-breaking, with regression tests in `tests/lib/patient-list-view.test.ts` (partial; FR-009, Edge Cases, plan: date normalization).
