---

description: "Implementation tasks for the reusable surface foundation and Atomic Design migration"
---

# Tasks: Unificar superfícies e adequar componentes ao Atomic Design

**Input**: Design documents from `specs/05-08-26-unificar-superficies-atomic/`

**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, and `quickstart.md`

**Implementation gate**: These tasks are a handoff for `/speckit-implement`. No runtime implementation is part of this SDD session.

**Task format**: Every implementation task has exactly one `[skill: $name]` annotation. `[P]` identifies work that can run in parallel after its dependencies are satisfied.

## Phase 1: Setup and inventory

**Purpose**: Confirm the migration boundary before touching reusable UI primitives or consumers.

- [X] T001 [skill: $code-reviewer-expert] [P] Re-audit all repeated surface styles and record each usage as base, layout-only, or registered exception in `specs/05-08-26-unificar-superficies-atomic/data-model.md`, covering `src/components/molecules/MetricBox.tsx`, `src/components/molecules/MacroMetricCard.tsx`, `src/components/molecules/RecipeCard.tsx`, `src/components/molecules/MealItemRow.tsx`, `src/components/organisms/MetricBoxGroup.tsx`, `src/components/organisms/MacroTrackerHeader.tsx`, `src/components/organisms/MealCardContainer.tsx`, `src/components/templates/DietBuilderTemplate.tsx`, and their direct page consumers.
- [X] T002 [skill: $code-reviewer-expert] Verify that the migration matrix does not include Breadcrumb, Sidebar, ContextMenu, DropdownMenu, Select, Combobox, Empty, domain/data changes, or route changes, and document any discovered scope conflict in `specs/05-08-26-unificar-superficies-atomic/research.md`.

## Phase 2: Foundational surface contract

**Purpose**: Establish the reusable visual base and its architectural boundaries. This phase blocks consumer migration.

- [X] T003 [skill: $design-system] Define the `surface` recipe with canonical `default`/`subtle` variants, `compact`/`standard`/`highlight` density, the `shadow-none` elevation policy, state classes, and exported recipe types in `src/design-system/recipes.ts` and `src/design-system/types.ts`, following `specs/05-08-26-unificar-superficies-atomic/contracts/surface.contract.md`.
- [X] T004 [skill: $shadcn] Add a contract test that proves `src/components/ui/card.tsx` remains a generic Shadcn primitive with no domain imports or nutrition-specific API in `tests/components/ui/card-preservation.test.tsx`.
- [X] T005 [skill: $vercel-composition-patterns] [P] Add the atom API contract test first in `tests/components/atoms/surface.test.tsx`, covering children composition, canonical variants, density, `shadow-none` elevation policy, HTML attributes, `className`, stateless rendering, and absence of boolean/domain mode props; keep the test failing until `Surface` exists.

**Checkpoint**: The surface contract, recipe vocabulary, and Shadcn preservation guard are explicit before consumers are migrated.

## Phase 3: User Story 1 — Reusable visual surface (Priority: P1) — MVP

**Goal**: Provide one product-generic surface atom that specialized boxes and cards can compose without copying visual classes.

**Independent test**: Render `Surface` with each supported variant and density, then verify semantic output, class composition, children, focus behavior, and state styling through `tests/components/atoms/surface.test.tsx`.

### Implementation for User Story 1

- [X] T006 [skill: $vercel-composition-patterns] Implement `Surface` as a stateless, children-first atom in `src/components/atoms/Surface.tsx`, wrapping the generic `Card` primitive only where appropriate, exposing named variants instead of boolean mode props, and preventing imports from molecules, organisms, templates, app routes, or domain modules.
- [X] T007 [skill: $vercel-composition-patterns] Export `Surface` and its public types from `src/components/atoms/index.ts` without changing the generic contract of existing atoms.
- [X] T008 [skill: $design-system] [P] Add the canonical Surface profile and registry entry in `design-system/components/profiles/atoms/surface.md` and `design-system/components/registry.json`, referencing the `surfaces` category and the source export `src/components/atoms/Surface.tsx`.
- [X] T009 [skill: $design-system] Update `design-system/components/categories/surfaces.md` to register `atom-surface` as a consumer of the existing `default`/`subtle` surface vocabulary and distinguish it from generic `src/components/ui/card.tsx`, layout-only `div`, and domain-specific composed components; do not add `tinted` or `inline` as Surface variants.
- [X] T010 [skill: $vercel-composition-patterns] [P] Add the architecture test `tests/architecture/surface-composition.test.ts` that rejects upward Atomic dependencies and domain imports from `src/components/atoms/Surface.tsx`.

**Checkpoint**: Surface can be consumed independently and the design-system catalog describes its contract.

## Phase 4: User Story 2 — Compose specialized metric and content components (Priority: P1)

**Goal**: Make existing specialized boxes/cards compose the same Surface foundation while preserving their public behavior and domain responsibilities.

**Independent test**: Existing MetricBox and MacroMetricCard tests pass while asserting Surface composition, stable content, tone/size behavior, and accessible semantics.

### Tests for User Story 2

- [X] T011 [skill: $tdd] Migrate or update the MetricBox contract coverage in `tests/components/molecules/metric-box.test.tsx` first to assert the public API and use of the Surface base, including compact/standard sizing, tone, label/value/unit content, and existing accessibility semantics.
- [X] T012 [skill: $tdd] Migrate or update the MacroMetricCard contract coverage in `tests/components/molecules/macro-metric-card.test.tsx` first to assert composition, macro tone behavior, current content hierarchy, and preserved interaction/state behavior.
- [X] T013 [skill: $tdd] [P] Add focused regression coverage in `tests/components/molecules/surface-consumers.test.tsx` for `RecipeCard.tsx`, `MealItemRow.tsx`, and other molecule consumers that currently own repeated surface classes.

### Implementation for User Story 2

- [X] T014 [skill: $vercel-composition-patterns] Refactor `src/components/molecules/MetricBox.tsx` to compose `Surface`, preserving its existing props, content slots, tone/size behavior, and stable DOM semantics while removing duplicated surface geometry classes.
- [X] T015 [skill: $vercel-composition-patterns] Refactor `src/components/molecules/MacroMetricCard.tsx` to compose `Surface`, preserving macro-specific presentation and behavior while keeping nutrition/domain logic in the molecule rather than in the atom.
- [X] T016 [skill: $vercel-composition-patterns] [P] Refactor `src/components/molecules/RecipeCard.tsx` and `src/components/molecules/MealItemRow.tsx` to compose `Surface` only for their reusable surface regions, leaving layout-only wrappers and domain-specific children explicit.
- [X] T017 [skill: $design-system] [P] Update `design-system/components/profiles/molecules/metric-box.md`, `design-system/components/profiles/molecules/macro-metric-card.md`, `design-system/components/profiles/molecules/recipe-card.md`, and `design-system/components/profiles/molecules/meal-item-row.md` to declare Surface composition and remove obsolete duplicated surface contracts.

**Checkpoint**: The two principal metric components and the named molecule consumers use one shared surface foundation without changing their public API.

## Phase 5: User Story 3 — Propagate composition through Atomic layers (Priority: P1)

**Goal**: Migrate the related organisms, templates, and direct consumers without inverting the dependency direction or forcing domain behavior into Surface.

**Independent test**: Atomic and design-system audits report no upward imports, every named surface consumer has a base/exception decision, and organism/template tests preserve composition and layout behavior.

### Tests for User Story 3

- [X] T018 [skill: $tdd] [P] Add or update organism regression tests in `tests/components/organisms/surface-consumers.test.tsx` for `MetricBoxGroup.tsx`, `MacroTrackerHeader.tsx`, and `MealCardContainer.tsx`, asserting composition and existing hierarchy.
- [X] T019 [skill: $tdd] [P] Add or update template/integration coverage in `tests/components/templates/diet-builder-template.surface.test.tsx` for the direct Surface consumers and their empty/loading/interactive states.

### Implementation for User Story 3

- [X] T020 [skill: $vercel-composition-patterns] Migrate `src/components/organisms/MetricBoxGroup.tsx`, `src/components/organisms/MacroTrackerHeader.tsx`, and `src/components/organisms/MealCardContainer.tsx` to compose the already-defined molecule/Surface contracts without duplicating surface variants or introducing boolean mode APIs.
- [X] T021 [skill: $vercel-composition-patterns] [P] Audit and migrate direct surface consumers in `src/components/templates/DietBuilderTemplate.tsx` and the `src/app/` routes identified by T001, retaining raw `div` only where it is layout-only or recorded as a justified exception in `specs/05-08-26-unificar-superficies-atomic/data-model.md`.
- [X] T022 [skill: $design-system] Update `design-system/components/profiles/organisms/metric-box-group.md`, `design-system/components/profiles/organisms/macro-tracker-header.md`, `design-system/components/profiles/organisms/meal-card-container.md`, and `design-system/components/profiles/templates/diet-builder-template.md` with their final Surface composition and layer dependencies.
- [X] T023 [skill: $code-reviewer-expert] Run the Atomic dependency audit over `src/components/ui`, `src/components/atoms`, `src/components/molecules`, `src/components/organisms`, `src/components/templates`, and `src/app/`; fix any upward dependency, duplicated visual contract, or domain import introduced by the migration.

**Checkpoint**: All in-scope layers compose downward through Surface, while excluded components remain outside this change.

## Phase 6: User Story 4 — Preserve appearance, semantics, and accessibility (Priority: P2)

**Goal**: Confirm that the merge changes the ownership of visual primitives without introducing unintended visual, semantic, interaction, or accessibility regressions.

**Independent test**: The quickstart validation suite passes and the affected routes show no unintended geometry, hierarchy, focus, contrast, responsive, loading, or empty-state changes.

- [X] T024 [skill: $tdd] Add or update `tests/components/surface-accessibility.test.tsx` for focus-visible behavior, disabled/loading/read-only states, semantic elements, accessible names, and keyboard interaction of migrated surface consumers.
- [X] T025 [skill: $webapp-testing] Execute the manual route matrix from `specs/05-08-26-unificar-superficies-atomic/quickstart.md`, including the affected diet-builder, patient, recipe, and meal views at supported responsive widths, and record any visual regression in the feature artifacts.
- [X] T026 [skill: $design-system] Register every intentional visual exception in the relevant design-system profile and `design-system/components/registry.json`; remove or correct any unregistered repeated surface style found by the final catalog audit.

## Phase 7: Polish and validation

**Purpose**: Close the feature with reproducible checks and documentation consistency.

- [ ] T027 [skill: $tdd] Run the complete validation commands listed in `specs/05-08-26-unificar-superficies-atomic/quickstart.md` (`npm run type-check`, `npm run lint`, focused tests, `npm test`, and `git diff --check`) and resolve failures without expanding scope.
- [ ] T028 [skill: $code-reviewer-expert] Run the final design-system and Atomic catalog audits, confirm the success criteria in `specs/05-08-26-unificar-superficies-atomic/spec.md`, and record evidence in `specs/05-08-26-unificar-superficies-atomic/checklists/architecture.md`.
- [ ] T029 [skill: $design-system] Update implementation/compliance notes in `design-system/13-implementation-and-compliance.md` only if the migration introduces a new reusable surface rule, and ensure all component profiles and registry metadata remain synchronized.

## Dependencies and execution order

### Phase dependencies

- Phase 1 is the inventory gate and can begin immediately.
- Phase 2 depends on Phase 1 and blocks all consumer migrations.
- Phase 3 depends on T003–T005; T005 is intentionally written before T006 so the Surface contract test exists before implementation.
- Phase 4 depends on the completed Surface atom and its catalog entry from Phase 3.
- Phase 5 depends on the completed molecule migration from Phase 4.
- Phase 6 depends on all in-scope consumer migrations from Phases 4 and 5.
- Phase 7 depends on all previous phases and is the handoff gate for implementation completion.

### Parallel opportunities

- T001 and T002 can run in parallel.
- T004 and T005 can run in parallel after the inventory gate.
- T008 and T010 can run in parallel with the Surface implementation once the contract is stable.
- T011, T012, and T013 can run in parallel because they target separate test files.
- T016 and T017 can run in parallel after the shared Surface API is accepted.
- T018 and T019 can run in parallel with each other after molecule migration.
- T021 and T022 can run in parallel when their affected files do not overlap.

### MVP delivery

The MVP is Phase 1 + Phase 2 + Phase 3 + the MetricBox and MacroMetricCard slice of Phase 4 (T011, T012, T014, and T015). Stop and validate that slice before migrating the remaining consumers.

### Implementation rules

- Tests marked as first in a story must be written and observed failing before the corresponding implementation task.
- Do not modify `src/components/ui/card.tsx` to add nutrition/domain behavior; use `src/components/atoms/Surface.tsx` for product-specific composition.
- Do not migrate Breadcrumb, Sidebar, ContextMenu, DropdownMenu, Select, Combobox, Empty, or unrelated route/data behavior under this SDD.
- A raw `div` is acceptable only for layout-only markup or an exception with a documented reason and design-system registration.
- After human validation of this SDD, execute the tasks through `/speckit-implement`.
