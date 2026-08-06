---

description: "Implementation tasks for primitive family and compound child architecture alignment"
---

# Tasks: Alinhamento da Arquitetura de Primitivos e Filhos

**Input**: Design documents from `/specs/05-08-26-alinhamento-primitivos-componentes/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/component-family-contract.md`

**Scope boundary**: Do not modify `.agents/rules/atomic-design.md`, `.agents/rules/shadcn-preservation.md` or any other rules file.

## Phase 1: Setup (Shared Baseline)

**Purpose**: Establish the implementation baseline without changing rules or unrelated worktree changes.

- [X] T001 [skill: $design-system] Create a committed-scope inventory of the 16 primitive families, public parts, atom wrappers and known consumers in `specs/05-08-26-alinhamento-primitivos-componentes/data-model.md` and `design-system/components/registry.json`.
- [X] T002 [skill: general] [P] Record the pre-change results of `npm run type-check`, `npm run lint`, `npm run audit:atomic-design`, `npm run verify:design-system` and `npm run test` in `specs/05-08-26-alinhamento-primitivos-componentes/quickstart.md` or an implementation handoff note.
- [X] T003 [skill: $code-reviewer-expert] [P] Confirm that the implementation diff excludes `.agents/rules/` and unrelated pre-existing worktree changes before editing scoped files.

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the catalog and boundary checks needed by every user story.

- [X] T004 [skill: $design-system] [P] Add or update the primitive-family contract metadata for all 16 families and their public parts in `design-system/components/registry.json`, preserving one entry per family.
- [X] T005 [skill: $frontend-architecture-mindset] [P] Add a deterministic layer-boundary contract test in `tests/components/architecture/layer-boundaries.test.ts` that rejects imports from higher Atomic layers and domain imports from `src/components/ui`.
- [X] T006 [skill: $shadcn] [P] Add a contract fixture or helper for classifying root aliases, visual roots and compound child parts in `tests/components/ui/primitive-family-contract.test.tsx`.

**Checkpoint**: The family catalog and automated dependency boundaries are ready before story-specific migration.

## Phase 3: User Story 1 - Contrato dos Primitivos (Priority: P1) MVP

**Goal**: Make the root/child responsibilities and public compound anatomy explicit for every primitive family.

**Independent Test**: The primitive contract tests and registry audit identify every family, every public part and its role without requiring a page-specific interpretation.

### Tests for User Story 1

- [X] T007 [skill: $shadcn] [P] [US1] Extend `tests/components/ui/primitive-family-contract.test.tsx` to cover all 16 family roots and all public compound exports listed in `design-system/components/registry.json`.
- [X] T008 [skill: $shadcn] [P] [US1] Extend `tests/components/ui/shadcn-isolation.test.ts` to include `calendar.tsx` and `spinner.tsx` and preserve the no-higher-layer-import contract.

### Implementation for User Story 1

- [X] T009 [skill: $design-system] [US1] Document root, provider, trigger, content, item and visual-slot responsibilities for each family in the relevant `design-system/components/profiles/` files and `design-system/components/registry.json`.
- [X] T010 [skill: $shadcn] [US1] Align the public compound exports and child composition of `src/components/ui/dialog.tsx`, `src/components/ui/sheet.tsx`, `src/components/ui/popover.tsx`, `src/components/ui/dropdown-menu.tsx`, `src/components/ui/select.tsx`, `src/components/ui/scroll-area.tsx`, `src/components/ui/table.tsx`, `src/components/ui/tabs.tsx`, `src/components/ui/tooltip.tsx`, `src/components/ui/card.tsx` and `src/components/ui/calendar.tsx` with the family contract without splitting context-dependent children into separate families.
- [X] T011 [skill: $shadcn] [US1] Consolidate the visual-root contracts in `src/components/ui/button.tsx`, `src/components/ui/input.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/spinner.tsx` and `src/components/ui/separator.tsx`, including applicable states and accessible names.
- [X] T012 [skill: $shadcn] [US1] Resolve the duplicated `state` and `loading` API behavior in `src/components/ui/button.tsx` while preserving supported public usage and documenting any migration-required compatibility.

**Checkpoint**: All primitive families have an explicit root/child contract and independently verifiable public exports.

## Phase 4: User Story 2 - Consumo entre UI e Atoms (Priority: P1)

**Goal**: Remove ambiguous wrappers and enforce the existing downward dependency direction without changing rules files.

**Independent Test**: The boundary test passes, every maintained atom has documented added value, and no molecule imports or reexports an organism.

### Tests for User Story 2

- [X] T013 [skill: $frontend-architecture-mindset] [P] [US2] Add wrapper-value assertions to `tests/components/architecture/layer-boundaries.test.ts` for atoms in `src/components/atoms/`.
- [X] T014 [skill: $frontend-architecture-mindset] [P] [US2] Add a regression test for the sidebar dependency direction in `tests/components/architecture/layer-boundaries.test.ts`.

### Implementation for User Story 2

- [X] T015 [skill: $design-system] [US2] Classify `src/components/atoms/Button.tsx`, `src/components/atoms/Badge.tsx`, `src/components/atoms/Input.tsx`, `src/components/atoms/FieldTrigger.tsx`, `src/components/atoms/IconButton.tsx`, `src/components/atoms/Avatar.tsx` and `src/components/atoms/ProgressBar.tsx` as maintained, consolidated, deprecated or migration-required in `design-system/components/registry.json`.
- [X] T016 [skill: $frontend-architecture-mindset] [US2] Remove the molecule-to-organism import/reexport from `src/components/molecules/SidebarBrand.tsx` and expose the shared sidebar contract from the correct lower layer without changing `src/components/organisms/SidebarNav.tsx` behavior.
- [X] T017 [skill: $shadcn] [US2] Consolidate or remove the transparent `Input` wrapper in `src/components/atoms/Input.tsx` and migrate its consumers to the canonical import path in `src/components/molecules/MealItemRow.tsx`, `src/components/molecules/DatePickerField.tsx` and affected `src/app/**/*.tsx` files.
- [X] T018 [skill: $frontend-architecture-mindset] [US2] Define the canonical `ui` versus `atoms` import policy in `design-system/components/registry.json` and migrate direct consumers in `src/components/molecules/`, `src/components/organisms/` and `src/components/templates/` where the current path duplicates a product contract.

**Checkpoint**: No upward layer dependency remains and each atom has an explicit reason to exist.

## Phase 5: User Story 3 - Tokens e Overrides Visuais (Priority: P1)

**Goal**: Make primitive identity consistent and move repeated visual decisions out of pages.

**Independent Test**: The scoped primitive files use canonical tokens, repeated identity overrides have a documented owner, and existing component behavior remains covered.

### Tests for User Story 3

- [X] T019 [skill: $ui-styling] [P] [US3] Add token and forbidden-legacy-class assertions for scoped primitives in `tests/components/ui/primitive-family-contract.test.tsx`.
- [X] T020 [skill: $webapp-testing] [P] [US3] Extend `tests/components/ui/accessibility.test.tsx` and `tests/components/overlays-accessibility.test.tsx` for preserved focus, keyboard, naming and applicable loading/error/empty states.

### Implementation for User Story 3

- [X] T021 [skill: $ui-styling] [P] [US3] Migrate canonical tokens and spacing utilities in `src/components/ui/dropdown-menu.tsx`, `src/components/ui/popover.tsx`, `src/components/ui/sheet.tsx`, `src/components/ui/tabs.tsx` and `src/components/ui/tooltip.tsx`.
- [X] T022 [skill: $ui-styling] [P] [US3] Migrate canonical tokens and structural exceptions in `src/components/ui/table.tsx` and `src/components/ui/scroll-area.tsx`, documenting any Radix measurement variables that must remain.
- [X] T023 [skill: $ui-styling] [US3] Normalize repeated Button, Badge, Card, Dialog and Select identity overrides in `src/components/templates/DietBuilderTemplate.tsx`, `src/components/molecules/ReadOnlyDietModal.tsx`, `src/components/molecules/DietModeSwitcher.tsx`, `src/components/molecules/EditAssessmentModal.tsx`, `src/components/molecules/FoodSearchModal.tsx`, `src/app/alimentos/page.tsx` and `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx` into existing variants or product wrappers.
- [X] T024 [skill: $frontend-architecture-mindset] [US3] Preserve layout-only page composition in the affected `src/app/**/*.tsx` files while removing duplicated color, typography, state and geometry contracts from page-local `className` values.

**Checkpoint**: Primitive identity comes from the primitive or an explicit product wrapper; pages own composition only.

## Phase 6: User Story 4 - Registry, Testes e Validação (Priority: P2)

**Goal**: Keep code, registry, tests and validation evidence synchronized for all public families.

**Independent Test**: Registry verification and the complete test/audit suite report all 16 families, known consumers and applicable contracts without blocking findings.

### Tests for User Story 4

- [X] T025 [skill: $webapp-testing] [P] [US4] Add Calendar coverage to `tests/components/ui/calendar.test.tsx` and the shared primitive family suite.
- [X] T026 [skill: $webapp-testing] [P] [US4] Add Spinner coverage to `tests/components/ui/primitives.test.tsx` or a dedicated `tests/components/ui/spinner.test.tsx`, including accessible loading status.
- [X] T027 [skill: $webapp-testing] [P] [US4] Update `tests/components/ui/primitives.test.tsx` to enumerate 16 primitive families instead of the stale 14-family list.
- [X] T028 [skill: $webapp-testing] [P] [US4] Update `tests/components/ui/select.test.tsx` and `tests/components/overlays-accessibility.test.tsx` for the final canonical consumer and state contracts.

### Implementation for User Story 4

- [X] T029 [skill: $design-system] [US4] Reconcile actual consumers and statuses for DropdownMenu, Select, Calendar, Spinner and every maintained atom in `design-system/components/registry.json`.
- [X] T030 [skill: $design-system] [US4] Update affected component profiles under `design-system/components/profiles/` and the applicable category documents so they reference the final family/child contract without changing rules files.
- [X] T031 [skill: $design-system] [US4] Update `design-system/components/audit-contract.md` or the applicable catalog validation metadata so missing public parts and stale consumers produce actionable findings.

**Checkpoint**: Catalog, source, tests and documented statuses agree for every maintained family.

## Phase 7: Polish & Cross-Cutting Validation

**Purpose**: Validate the complete initiative and preserve the explicit rules boundary.

- [X] T032 [skill: general] [P] Run `npm run type-check` and resolve only type errors caused by scoped changes.
- [X] T033 [skill: general] [P] Run `npm run lint` and resolve only lint errors caused by scoped changes.
- [X] T034 [skill: $webapp-testing] [P] Run `npm run test` and record the results in `specs/05-08-26-alinhamento-primitivos-componentes/quickstart.md`.
- [X] T035 [skill: $design-system] [P] Run `npm run audit:atomic-design` and `npm run verify:design-system`, then reconcile any scoped findings in `design-system/components/registry.json` or component profiles.
- [X] T036 [skill: $code-reviewer-expert] Confirm the final diff contains no changes to `.agents/rules/` and classify remaining divergences as conforming, migration-required, deprecated or removed in `design-system/components/registry.json`.
- [X] T037 [skill: $webapp-testing] Execute every validation scenario in `specs/05-08-26-alinhamento-primitivos-componentes/quickstart.md` and attach the evidence to the implementation handoff.

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 has no dependency and establishes the baseline.
- Phase 2 depends on Phase 1 and blocks all user-story work.
- User Stories 1, 2 and 3 depend on Phase 2; US1 should precede contract-sensitive work in US2/US3, while independent test preparation can run in parallel.
- User Story 4 depends on the completed contract and migration decisions from US1–US3.
- Phase 7 depends on all desired user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2; establishes the family and child contracts.
- **US2 (P1)**: Starts after T009–T011; depends on the family distinction to classify wrappers correctly.
- **US3 (P1)**: Starts after T009–T011; token migration can run in parallel with independent US2 wrapper work, but consumer changes must follow the chosen import policy.
- **US4 (P2)**: Starts after US1–US3; finalizes registry, tests and evidence.

### Parallel Opportunities

- T002, T003, T004, T005 and T006 can run in parallel after the baseline is captured.
- T007 and T008 can run in parallel.
- T013, T014, T019 and T020 can run in parallel because they target separate test concerns.
- T021 and T022 can run in parallel because they target separate primitive groups.
- T025–T028 can run in parallel after the final family contract is known.
- T032–T035 can run in parallel after implementation changes stabilize.

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete US1, including all 16 family contracts and tests.
3. Stop and validate the primitive contract baseline independently.

### Incremental Delivery

1. Deliver the family/root/child contract baseline.
2. Deliver layer and wrapper consolidation.
3. Deliver token and consumer migration by primitive group.
4. Deliver registry/test synchronization and final validation.

## Notes

- Every task names the expected file or validation result.
- Tests are included because the specification explicitly requires contract, accessibility and isolation coverage.
- No task authorizes changing any rule file.

## Phase 8: Convergence

- [X] T038 [skill: $webapp-testing] Make `npm run test -- --run` complete deterministically within the project's validation window and resolve or isolate the blocking test-run condition per SC-006 / FR-014 (partial).
- [X] T039 [skill: $design-system] Reconcile primitive-family statuses and completion evidence in `design-system/components/registry.json` and `specs/05-08-26-alinhamento-primitivos-componentes/quickstart.md`; only mark a family `conforming` after the required validation evidence exists per Constitution V / FR-016 (contradicts).
- [X] T040 [skill: $design-system] Reconcile `primitiveFamilies.consumers` with actual `Select`, `DropdownMenu`, `Calendar`, `Spinner`, `Input` and `Tabs` imports, marking stale or proposed references as migration-required and adding real route/component consumers per FR-012 / SC-005 / US4-AC2 (partial).
