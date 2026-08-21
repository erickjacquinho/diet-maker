# Tasks: Reorganização do cabeçalho da criação de dieta

**Input**: Design documents from `/specs/05-08-26-reorganizar-cabecalho-nova-dieta/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/diet-builder-header.md`, `quickstart.md`

**Tests**: Required by the project constitution and feature specification. Tests must be written before the corresponding implementation task.

**Organization**: Tasks are grouped by user story so each story can be reviewed and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the baseline and affected file boundaries before changing the screen.

- [X] T001 [skill: general] Run the baseline checks from `specs/05-08-26-reorganizar-cabecalho-nova-dieta/quickstart.md` against `src/components/templates/DietBuilderTemplate.tsx`, `src/components/molecules/DietModeSwitcher.tsx` and the existing route consumer, recording any pre-existing failures without modifying unrelated files. [SC-004]

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create deterministic test seams for the template and mode selector before user-story implementation.

- [X] T002 [skill: $tdd] Add deterministic render helpers and minimal valid props to `tests/components/templates/diet-builder-template.test.tsx` so the template can be tested without `localStorage`, network calls or real route data. [FR-010, FR-011]
- [X] T003 [skill: $tdd] [P] Add deterministic mode fixtures for `simple`, `carb_cycling`, two variations and three variations in `tests/components/molecules/diet-mode-switcher.test.tsx`, using the existing `CarbCyclingVariation` type from `src/lib/dietStore.ts`. [FR-007, FR-008]

**Checkpoint**: Test seams are available; user-story work can proceed without changing domain stores.

---

## Phase 3: User Story 1 - Entender o contexto e retornar ao prontuário (Priority: P1) 🎯 MVP

**Goal**: Make the first visual region identify the task, provide the patient-context route back and expose a stable page heading.

**Independent Test**: Render the template with a patient id and assert that the back link, context overline and one `h1` appear before mode, macro and meal regions.

### Tests for User Story 1

- [X] T004 [skill: $tdd] [US1] Write failing composition tests in `tests/components/templates/diet-builder-template.test.tsx` for the back link target `/pacientes/{patientId}`, accessible name `Voltar ao Prontuário`, context text `Pacientes / Dieta`, page heading `Elaboração de Plano Alimentar`, and DOM order before `DietModeSwitcher`, `MacroTrackerHeader` and `Refeições`. [FR-001, FR-002, FR-012, SC-001]

### Implementation for User Story 1

- [X] T005 [skill: $ui-ux-pro-max:ui-ux-pro-max] [US1] Replace the current top navigation markup in `src/components/templates/DietBuilderTemplate.tsx` with the patient-profile structure: icon-only `ArrowLeft` link, context overline, `h1`, and a header action region while preserving the existing `patientId` route interpolation. [FR-001, FR-002, FR-009, FR-012, SC-007]

**Checkpoint**: The route has a predictable page header and back path, independently testable without action regrouping or mode behavior changes.

---

## Phase 4: User Story 2 - Salvar a prescrição sem competir com ações secundárias (Priority: P1)

**Goal**: Keep save as the only primary header action and move WhatsApp/PDF into an accessible secondary menu without changing callbacks.

**Independent Test**: Render the template with all callbacks, inspect the header action group, open `Mais ações` with keyboard, and assert that each existing callback is invoked from its new location.

### Tests for User Story 2

- [X] T006 [skill: $tdd] [US2] Extend `tests/components/templates/diet-builder-template.test.tsx` with failing tests that assert only `Salvar Prescrição` uses primary treatment, `Mais ações` exposes `WhatsApp` and `PDF`, `Nova Refeição`/`Escalar` are absent from the global header, and the menu supports keyboard open/close and callback invocation. [FR-003, FR-006, FR-011, SC-003, SC-004, SC-006]

### Implementation for User Story 2

- [X] T007 [skill: $shadcn] [US2] Recompose the action region in `src/components/templates/DietBuilderTemplate.tsx` using the existing button atom and `src/components/ui/dropdown-menu.tsx`: keep `onSaveDiet` as the single primary action, render textual `Mais ações`, wire `onWhatsAppShare` and `onExportPDF` to menu items, and remove the old global `Nova Refeição`/`Escalar`/WhatsApp/PDF buttons. [FR-003, FR-006, FR-013, SC-003, SC-004]

**Checkpoint**: The header is reduced to navigation, title, save and one discoverable secondary menu; all existing action callbacks remain available.

---

## Phase 5: User Story 3 - Escolher o modelo e revisar o contexto do paciente (Priority: P1)

**Goal**: Put the diet mode before patient/macros context, keep cycle controls progressive and associate `Escalar` with the macro region.

**Independent Test**: Render simple and cycle modes, assert conditional controls and selected state, then assert that patient context is present once and `Escalar` is adjacent to macros rather than the page header.

### Tests for User Story 3

- [X] T008 [skill: $tdd] [P] [US3] Write failing mode-state tests in `tests/components/molecules/diet-mode-switcher.test.tsx` for simple mode hiding cycle-only controls, carb cycling revealing variation count/tabs/copy, selected mode announcements and preservation of existing callbacks. [FR-007, FR-008, FR-011, SC-002, SC-006]
- [X] T009 [skill: $tdd] [US3] Extend `tests/components/templates/diet-builder-template.test.tsx` with a failing region-order test for `DietModeSwitcher` before `MacroTrackerHeader`, one patient name occurrence in the main context, and `Escalar` rendered outside the global header but adjacent to the macro region. [FR-005, FR-007, FR-009, FR-012, SC-002]

### Implementation for User Story 3

- [X] T010 [skill: $ui-ux-pro-max:ui-ux-pro-max] [US3] Reduce the visual composition in `src/components/molecules/DietModeSwitcher.tsx` to a compact single surface with one primary row, preserving `DietModeSwitcherProps`, selected states, variation controls, accessible labels and keyboard behavior. [FR-007, FR-008, FR-011, FR-013, SC-002, SC-007]
- [X] T011 [skill: $ui-styling] [US3] Update `src/components/templates/DietBuilderTemplate.tsx` so `DietModeSwitcher` remains before `MacroTrackerHeader` and `Escalar` is rendered as a contextual secondary action aligned with the macro region, preserving `onScaleDiet` and `onAdjustGoals` behavior. [FR-005, FR-009, FR-012, FR-013, SC-004, SC-007]

**Checkpoint**: Simple and cycle modes are independently testable, patient context remains singular and macro actions are spatially associated with macro work.

---

## Phase 6: User Story 4 - Trabalhar com refeições e ações de saída no lugar certo (Priority: P2)

**Goal**: Add a contextual meals section header, preserve the meal grid and leave a single clear empty-state path.

**Independent Test**: Render with populated and empty `mealsData`, assert the section heading/action placement, one empty-state creation path and unchanged meal callbacks.

### Tests for User Story 4

- [X] T012 [skill: $tdd] [US4] Extend `tests/components/templates/diet-builder-template.test.tsx` with failing populated/empty meal tests for `Refeições` heading, contextual `Nova Refeição`, preserved `MealCardContainer` rendering, and no duplicate empty-state CTA. [FR-004, FR-010, FR-015, SC-003, SC-005]

### Implementation for User Story 4

- [X] T013 [skill: $ui-ux-pro-max:ui-ux-pro-max] [US4] Add the `Refeições` section heading and contextual `Nova Refeição` action in `src/components/templates/DietBuilderTemplate.tsx`, retain the existing `mealsData` grid, and simplify the empty state so it provides one clear creation path without duplicating the section action. [FR-004, FR-010, FR-015, SC-003, SC-005]

**Checkpoint**: Meal creation is discoverable where meals are managed, populated meals remain intact and the empty state has no competing CTA.

---

## Phase 7: Polish & Cross-Cutting Validation

**Purpose**: Validate the complete feature against the design-system, accessibility and visual requirements.

- [X] T014 [skill: general] [P] Run `npm run type-check` and the directed Vitest files `tests/components/templates/diet-builder-template.test.tsx` and `tests/components/molecules/diet-mode-switcher.test.tsx`; fix only regressions caused by this feature in the affected files. [FR-010, FR-011, SC-004, SC-006]
- [X] T015 [skill: general] [P] Run `npm test`, `npm run verify:design-system-legacy` and `npm run audit:atomic-design`; record the result in `specs/05-08-26-reorganizar-cabecalho-nova-dieta/quickstart.md` and do not suppress unrelated pre-existing findings. [FR-013, FR-014, SC-005, SC-007]
- [X] T016 [skill: $webapp-testing] Execute the manual scenarios in `specs/05-08-26-reorganizar-cabecalho-nova-dieta/quickstart.md` at 1024px, 1280px and 1440px for simple mode, carb cycling, empty meals and `Mais ações`, documenting any visual or keyboard discrepancy before completion. [FR-011, FR-012, FR-014, SC-001, SC-002, SC-005, SC-006]
- [X] T017 [skill: $ui-ux-pro-max:ui-ux-pro-max] Perform the final UI/UX review against `specs/05-08-26-reorganizar-cabecalho-nova-dieta/contracts/diet-builder-header.md`, checking hierarchy, density, action placement, focus visibility, readable labels and absence of header action competition. [FR-003, FR-004, FR-005, FR-006, FR-013, SC-003, SC-007]

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies; establishes the baseline.
- **Phase 2 (Foundational)**: Depends on T001; creates the deterministic test seams and fixtures.
- **Phase 3 (US1)**: Depends on T002; delivers the MVP header orientation.
- **Phase 4 (US2)**: Depends on T005; builds on the header action region created for US1.
- **Phase 5 (US3)**: Depends on T005 and T007; uses the final header order and removes macro actions from the old header.
- **Phase 6 (US4)**: Depends on T007 and T011; places the remaining contextual actions after the global action group is stable.
- **Phase 7 (Polish)**: Depends on T013; validates all user stories together.

### User Story Dependencies

- **US1 (P1)**: Independent after Foundational; MVP for navigation and orientation.
- **US2 (P1)**: Depends on US1's header region but preserves existing callbacks.
- **US3 (P1)**: Depends on the final page-header order from US1 and action grouping from US2.
- **US4 (P2)**: Depends on the action grouping from US2 and macro-region placement from US3.

### Parallel Opportunities

- T003 can run in parallel with T002 because it edits a different test file.
- T008 can run in parallel with T009 because they edit different test files.
- T014 and T015 can run in parallel after T013 because they are read/validation commands.
- T016 and T017 can run in parallel after automated checks are green because they inspect different validation dimensions.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001–T003.
2. Write and fail T004.
3. Implement T005.
4. Run the US1 directed test and validate the header visually.
5. Stop for review if only orientation/return is needed.

### Incremental Delivery

1. Add US1 to establish the page hierarchy.
2. Add US2 to remove header competition and preserve all secondary exits.
3. Add US3 to compact the mode selector and align macro actions.
4. Add US4 to contextualize meal creation and empty state.
5. Run the cross-cutting validation phase.

### Required Execution Gate

This task list is documentation only. Implementation must be started through `/speckit-implement` after human validation of the SDD artifacts; do not edit application source files as part of SDD generation.
