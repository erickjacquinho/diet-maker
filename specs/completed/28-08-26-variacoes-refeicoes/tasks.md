# Tasks: Variações opcionais de refeições

**Input**: Design documents from `C:\Programmer\diet-maker\specs\28-08-26-variacoes-refeicoes\`
**Prerequisites**: `spec.md`, `research.md`, `data-model.md`, `contracts\meal-variations.md`, `plan.md`

**Tests**: included because the specification requires regression coverage for persistence, calculations, simple/carb-cycling contexts, and the meal-card interactions.

## Format

Each task follows the required format:

`- [ ] T### [P] [US#] Description with exact file path`

- `[P]` means the task can be performed in parallel with other tasks in the same phase because it touches different files and has no unfinished dependency.
- `[US#]` identifies the user story. Setup and foundational tasks intentionally have no story label.

## Phase 1: Setup

**Purpose**: Prepare reusable test data for the feature without changing runtime behavior.

- [x] T001 [skill: $tdd] [P] Create shared meal-variation fixtures covering a legacy single-option meal, a five-option meal, simple-diet context, and carb-cycling day context in `tests/fixtures/meal-variations.ts`

---

## Phase 2: Foundational

**Purpose**: Establish the compatible domain shape, persistence behavior, active-option projection, and mutation targeting required by every user story.

**CRITICAL**: No user-story UI work should start before this phase is complete.

- [x] T002 [skill: $frontend-architecture-mindset] Define the optional meal-variation types, stable variation identifiers, maximum of five options, and compatibility rules while preserving the existing `DietMeal.items` representation in `src/lib/dietStore.ts`
- [x] T003 [skill: $tdd] Write unit tests for legacy normalization, append-to-last, active-option selection, automatic renumbering, deep cloning, five-option limit, and collapse-to-single behavior in `tests/lib/meal-variations.test.ts`
- [x] T004 [skill: $backend-patterns] Implement pure meal-variation helpers for normalization, active-option resolution, append, removal, renumbering, deep cloning, and limit validation in `src/lib/mealVariations.ts`
- [x] T005 [skill: $backend-patterns] Integrate variation normalization into diet load/save paths so existing meals remain valid single-option meals and new variation data round-trips through local storage in `src/lib/dietStore.ts`
- [x] T006 [skill: $backend-patterns] Extend diet-group duplication to deep-copy every variation, food item, quantity, order, and value with fresh identifiers in `src/lib/dietDuplication.ts`
- [x] T007 [skill: $frontend-architecture-mindset] Add context-scoped active-variation state for simple diets and each carb-cycling day, including the default-to-first behavior after reload, in `src/hooks/useDietBuilderPage.ts`
- [x] T008 [skill: $frontend-architecture-mindset] Update calculation selectors to project only the active variation into the current meal list while leaving each variation's macros independently recalculable in `src/hooks/useDietCalculations.ts`
- [x] T009 [skill: $frontend-architecture-mindset] Route meal-item and meal-header mutations through the active variation context without changing the existing single-option behavior in `src/hooks/useDietMealActions.ts` and `src/hooks/useDietBuilderModals.ts`

**Checkpoint**: The domain can read old data, store optional variations, resolve one active option for calculations, and target mutations without any UI change.

---

## Phase 3: User Story 1 — Criar variações a partir da refeição (Priority: P1)

**Goal**: Let the nutritionist opt into variations from an unchanged meal card and immediately open the newly appended copy.

**Independent Test**: Starting from a meal without variations, add options from the open variation and verify that the original becomes Variação 1, each new copy is appended and opened, and a sixth option is blocked.

- [x] T010 [skill: $tdd] [US1] Add hook tests for first creation, copying the active variation, appending as the last option, selecting the new option, preserving copied values, and enforcing the five-option limit in `tests/hooks/useDietMealActions.test.ts`
- [x] T011 [skill: $frontend-architecture-mindset] [US1] Implement add-variation behavior that converts the legacy meal into Variação 1 on first use, deep-copies the open variation, appends the copy, and selects the new last variation in `src/hooks/useDietMealActions.ts` and `src/hooks/useDietBuilderPage.ts`
- [x] T012 [skill: $frontend-architecture-mindset] [US1] Expose the variation action and active-variation context through the page/template meal-card mapping in `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx`, `src/components/templates/dietBuilderTemplateTypes.ts`, and `src/components/organisms/diet/DietMealsSection.tsx`
- [x] T013 [skill: $tdd] [US1] Add meal-card tests for the optional add-variation action, immediate activation of the new option, understandable limit feedback at five options, and unchanged single-option rendering in `tests/components/organisms/meal-card-container.test.tsx`
- [x] T014 [skill: $ui-styling] [US1] Render the add-variation control using the existing meal-card action treatment, preserve the current layout when the meal has one option, and communicate the five-option limit accessibly in `src/components/organisms/MealCardContainer.tsx`

---

## Phase 4: User Story 2 — Alternar e editar uma opção (Priority: P1)

**Goal**: Let the nutritionist and patient switch between options while edits and macro totals apply only to the selected option.

**Independent Test**: Create two options, edit food and quantity in each, switch tabs, and verify that content and totals follow the active option without locking or equalizing macros.

- [x] T015 [skill: $tdd] [US2] Add calculation and mutation tests proving that only the active variation contributes to meal/diet totals and that food, quantity, reorder, scale, and header edits remain isolated per option in `tests/hooks/useDietCalculations.test.ts` and `tests/hooks/useDietMealActions.test.ts`
- [x] T016 [skill: $frontend-architecture-mindset] [US2] Implement active-option projection and per-option mutation propagation through the diet page callbacks so all existing meal actions operate on the selected variation in `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx`, `src/hooks/useDietCalculations.ts`, and `src/hooks/useDietMealActions.ts`
- [x] T017 [skill: $ui-styling] [US2] Add the tabbed variation presentation beside the shared meal name, using the existing `Tabs` primitive with manual activation, keyboard semantics, and a controlled active value in `src/components/organisms/MealCardContainer.tsx`
- [x] T018 [skill: $frontend-architecture-mindset] [US2] Connect tab selection to the scoped active-variation state and keep the selected option stable across item edits and re-renders in `src/components/organisms/diet/DietMealsSection.tsx`, `src/components/templates/dietBuilderTemplateTypes.ts`, and `src/hooks/useDietBuilderPage.ts`

---

## Phase 5: User Story 3 — Identidade única da refeição (Priority: P1)

**Goal**: Make every option visibly belong to the same meal while keeping the existing card structure intact.

**Independent Test**: Compare a meal with one option to the same meal after adding options; verify the meal name/time remain shared, badges are automatic, and the one-option state has no variation badge or tab.

- [x] T019 [skill: $tdd] [US3] Add component and state tests for shared name/time, automatic `Variação 1...5` labels, renumbering after deletion, and removal of variation UI when one option remains in `tests/components/organisms/meal-card-container.test.tsx` and `tests/lib/meal-variations.test.ts`
- [x] T020 [skill: $ui-styling] [US3] Implement shared meal identity with generated variation badges, conditional multi-option controls, and the existing meal-card header hierarchy without introducing editable variation names in `src/components/organisms/MealCardContainer.tsx`
- [x] T021 [skill: $ui-styling] [US3] Preserve the existing meal-card actions, summary, item rows, and empty state while threading variation metadata only through the existing component contract in `src/components/organisms/MealCardContainer.tsx` and `src/components/molecules/MealItemRow.tsx`

---

## Phase 6: User Story 4 — Gerenciar, excluir e duplicar grupos (Priority: P2)

**Goal**: Remove an option safely and duplicate a complete meal group with all of its options.

**Independent Test**: Delete the active middle/first/last option and verify renumbering plus selection of the last remaining option; duplicate a meal group and verify that all options and contents are copied independently.

- [x] T022 [skill: $tdd] [US4] Add tests for active-option deletion, last-remaining selection, single-option collapse, fresh identifiers, full-group duplication, and independent edits after duplication in `tests/lib/meal-variations.test.ts` and `tests/lib/dietDuplication.test.ts`
- [x] T023 [skill: $backend-patterns] [US4] Implement deletion and automatic renumbering so the last remaining option is selected and a one-option group returns to the normal meal state in `src/lib/mealVariations.ts` and `src/hooks/useDietMealActions.ts`
- [x] T024 [skill: $frontend-architecture-mindset] [US4] Wire variation deletion to the active context and reset selection safely after removal in `src/hooks/useDietBuilderPage.ts` and `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx`
- [x] T025 [skill: $backend-patterns] [US4] Update meal duplication to copy the complete variation group, insert it using the existing duplicate-meal flow, and select the first option of the duplicated group in `src/lib/dietDuplication.ts` and `src/hooks/useDietMealActions.ts`
- [x] T026 [skill: $ui-styling] [US4] Add the variation-management affordances to the existing meal-card action area without changing the established copy, paste, duplicate, scale, or delete layout in `src/components/organisms/MealCardContainer.tsx`

---

## Phase 7: User Story 5 — Funcionar nos dois modos de dieta (Priority: P2)

**Goal**: Apply the same meal-variation behavior to simple diets and independently inside every carb-cycling day.

**Independent Test**: Create and edit variations in a simple diet and in two different carb-cycling days; verify that each context keeps its own active option, content, and totals.

- [x] T027 [skill: $tdd] [US5] Add regression tests for simple-diet isolation, carb-cycling day isolation, default-first selection after reload, and active-option totals in `tests/hooks/useDietBuilderPage.test.ts`, `tests/hooks/useDietCalculations.test.ts`, and `tests/app/pacientes/dedicated-carb-cycling-page.test.tsx`
- [x] T028 [skill: $frontend-architecture-mindset] [US5] Complete context-aware read/write and selection wiring for each carb-cycling day without coupling meal variation state to the day-level carb-cycling variation selector in `src/hooks/useDietBuilderPage.ts`, `src/hooks/useDietCalculations.ts`, and `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx`
- [x] T029 [skill: $ui-styling] [US5] Verify that simple-diet and carb-cycling meal cards receive the same variation contract and preserve their existing mode-specific layout in `src/components/organisms/diet/DietMealsSection.tsx` and `src/components/templates/dietBuilderTemplateTypes.ts`

---

## Phase 8: Polish & Cross-Cutting Validation

**Purpose**: Align the changed organism with the design-system catalog and validate the complete feature without expanding scope into export or patient-delivery flows.

- [x] T030 [skill: $design-system] [P] Update the meal-card organism profile with the optional variation states, interaction contract, and accessibility behavior in `design-system/components/profiles/organisms/meal-card-container.md`
- [x] T031 [skill: $design-system] [P] Register any changed meal-card contract metadata while preserving the existing component identity and layer in `design-system/components/registry.json`
- [x] T032 [skill: $webapp-testing] Run the automated type, unit, lint, and design-system verification commands documented in `specs/28-08-26-variacoes-refeicoes/quickstart.md` and resolve failures in the affected source or test files
- [x] T033 [skill: $webapp-testing] Perform the manual acceptance matrix for creation, active-option editing, selection, deletion, duplication, simple diet, carb cycling, keyboard navigation, five-option limit, and the 95%-within-500ms tab-switch target documented in `specs/28-08-26-variacoes-refeicoes/quickstart.md`
- [x] T034 [skill: $frontend-architecture-mindset] Confirm that export/PDF/WhatsApp flows remain explicitly out of scope and that no changes were made to the generic primitive in `src/components/ui/tabs.tsx`

---

## Dependencies & Execution Order

### Phase dependencies

1. **Setup (Phase 1)**: starts immediately; no runtime dependency.
2. **Foundational (Phase 2)**: depends on Phase 1 fixtures and blocks all user stories.
3. **User Stories (Phases 3–7)**: start after Phase 2. Within the stories, P1 stories should be completed before P2 stories; the stories otherwise target independent acceptance outcomes but share the foundational contract.
4. **Polish (Phase 8)**: starts after the selected user stories and their regression tests are complete.

### User-story dependency graph

```text
T001
  ↓
T002 → T003 → T004 → T005 → T006
                       ├→ T007 → T008 → T009
                       └→ T006

T009 → US1: T010 → T011 → T012 → T013 → T014
T014 → US2: T015 → T016 → T017 → T018
T018 → US3: T019 → T020 → T021
T020 → US4: T022 → T023 → T024 → T025 → T026
T018 → US5: T027 → T028 → T029

US3/US4/US5 → T030/T031/T032/T033/T034
```

### Parallel opportunities

- `T001` can run in parallel with the initial type-definition work once the repository test conventions are known.
- `T003` can be prepared while `T002` is being reviewed, provided the test imports follow the agreed type contract.
- After the foundational checkpoint, test preparation in one user-story phase can run in parallel with design-system documentation planning for another phase, but implementation tasks touching the same source file remain sequential.
- `T030` and `T031` can run in parallel because they update separate design-system files.

### Recommended MVP scope

The smallest valuable delivery is **Phase 1 + Phase 2 + Phase 3 + Phase 4 + the relevant parts of Phase 8**: create variations, open the new copy, switch between options, edit each independently, and calculate only the active option. Phase 5 preserves the visual contract and should be included in the same delivery; Phase 6 and Phase 7 complete management and carb-cycling coverage.

### Implementation notes

- Keep the existing `DietMeal.items` as the compatible representation of Variação 1 and add optional variation records for Variações 2–5.
- Keep active selection as editor/UI state scoped by diet mode, carb-cycling day, and meal; do not persist it as patient data.
- Use the existing `Tabs` primitive; do not add or modify a generic primitive in `src/components/ui`.
- Do not implement export, PDF, or WhatsApp presentation in this feature.
