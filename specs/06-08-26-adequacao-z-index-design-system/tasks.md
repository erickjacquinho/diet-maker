---

description: "Implementation tasks for the canonical z-index audit and Design System alignment"
---

# Tasks: Adequação da hierarquia z-index ao Design System

**Input**: Design documents from `specs/06-08-26-adequacao-z-index-design-system/`

**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/stacking-contract.md` and `quickstart.md`

**Implementation gate**: These tasks are a handoff for `/speckit-implement`. No runtime implementation is part of this SDD session.

**Task format**: Every task has exactly one `[skill: $name]` annotation immediately after its ID. `[P]` marks work that can run in parallel after dependencies are satisfied.

## Phase 1: Setup and inventory — User Story 1

**Goal**: Freeze a reproducible baseline of every explicit and semantic stacking usage before changing runtime code.

**Independent test criteria**: The inventory contains 19 explicit `z-*` utility matches and 10 `layer="modal"` consumers, with one record per source occurrence and a canonical decision for every row.

- [ ] T001 [skill: $code-reviewer-expert] [P] [US1] Generate the baseline inventory at `specs/06-08-26-adequacao-z-index-design-system/baseline/z-index-inventory.json` from `src/`, including path, line, source kind, Atomic layer, visual category, current token/utility, expected token, context and decision for all 19 explicit usages and 10 semantic modal-select consumers.
- [ ] T002 [skill: $tdd] [P] [US1] Add the red inventory contract test in `tests/design-system/z-index-inventory.test.ts`, asserting one record per usage, the official token set, six numeric `z-10` findings, one `SheetContent` mismatch, one `DatePickerField` local override, and ten closed modal Select contexts.
- [ ] T003 [skill: $code-reviewer-expert] [US1] Run the current baseline gates (`npm run verify:design-system` and `npm run verify:design-system-legacy`) and record their pre-migration results in `specs/06-08-26-adequacao-z-index-design-system/baseline/validation-baseline.md`, explicitly noting that these existing gates do not classify z-index semantics.

## Phase 2: Primitive stacking contract — User Story 2

**Goal**: Make the canonical layer mapping and modal context behavior live in the shared primitives before migrating consumers.

**Independent test criteria**: Dialog/Sheet, Select, Popover, DropdownMenu and Tooltip expose only canonical semantic layers; modal children remain above the modal content and ordinary overlays keep their default layer.

- [ ] T004 [skill: $tdd] [P] [US2] Add failing primitive behavior tests in `tests/components/ui/overlay-layer.test.tsx` for backdrop/content ordering, default versus modal context, Escape, focus return and rejection of numeric/arbitrary layer overrides.
- [ ] T005 [skill: $tdd] [P] [US2] Add the failing static gate contract in `tests/design-system/z-index-audit.test.ts`, covering numeric utilities, `z-[N]`, static inline `zIndex`, primitive-family mismatches and consumer-owned z-index classes.
- [ ] T006 [skill: $shadcn] [US2] Correct `src/components/ui/sheet.tsx` so `SheetOverlay` uses `z-overlay` and `SheetContent` uses `z-modal`, preserving Radix portal, dismissal, focus and existing geometry/motion contracts.
- [ ] T007 [skill: $shadcn] [US2] Align `src/components/ui/select.tsx` with the canonical mapping by exposing only `layer="default"|"modal"`, using `z-dropdown` for the default Select content and `z-modal` only for `layer="modal"`, without accepting arbitrary class-based layer values.
- [ ] T008 [skill: $shadcn] [US2] Extend `src/components/ui/popover.tsx` with the same closed modal-context strategy needed by portalled popovers, keeping `z-popover` as default and preserving collision, focus and dismissal behavior.
- [ ] T009 [skill: $shadcn] [US2] Align `src/components/ui/dropdown-menu.tsx` and its submenu content with `z-dropdown`, reserving `z-popover` for the Popover family and preserving menu keyboard navigation and portal behavior.
- [ ] T010 [skill: $design-system] [US2] Update the shared layer contract in `design-system/07-icons-motion-and-layers.md`, `design-system/components/categories/overlays.md`, `design-system/components/categories/selection.md`, `design-system/components/profiles/ui/sheet.md`, `design-system/components/profiles/ui/select.md`, `design-system/components/profiles/ui/popover.md`, `design-system/components/profiles/ui/dropdown-menu.md` and `design-system/components/profiles/ui/dialog.md` so foundation, category, profile and implementation use the same token/context mapping.

## Phase 3: Consumer migration — User Story 3

**Goal**: Remove local stacking decisions from pages and domain compositions while preserving content, semantics and existing flows.

**Independent test criteria**: No consumer owns a numeric or modal z-index class; local overlaps use `z-raised`; DatePicker and ingredient results use the shared overlay context; all modal selects remain above their parent dialog.

- [ ] T011 [skill: $tdd] [P] [US3] Add focused regression coverage in `tests/components/molecules/date-picker-field.test.tsx` for normal and modal hosting, calendar visibility, selection, Escape, focus return, long content and zoom-safe access.
- [ ] T012 [skill: $tdd] [P] [US3] Add focused regression coverage in `tests/components/molecules/create-recipe-modal.test.tsx` for ingredient search empty, single-result, many-result, keyboard selection, scrolling, dismissal and modal layering.
- [ ] T013 [skill: $tdd] [P] [US3] Add or update `tests/components/organisms/patient-list-table.test.tsx` and the relevant page tests to assert the local overlap contract for the patient link and the five search-icon consumers without accepting `z-10`.
- [ ] T014 [skill: $ui-styling] [P] [US3] Replace the six numeric `z-10` usages with `z-raised` in `src/app/alimentos/page.tsx`, `src/app/pacientes/page.tsx`, `src/app/presets/page.tsx`, `src/app/receitas/page.tsx`, `src/app/refeicoes-prontas/page.tsx` and `src/components/organisms/PatientListTable.tsx`, preserving pointer-events, focus and link/search semantics.
- [ ] T015 [skill: $vercel-composition-patterns] [US3] Remove the consumer-owned `z-modal` class from `src/components/molecules/DatePickerField.tsx` and pass the closed modal context through the shared Popover composition, preserving `fields` ownership and the generic `ui` primitive boundary.
- [ ] T016 [skill: $vercel-composition-patterns] [US3] Recompose the ingredient results in `src/components/molecules/CreateRecipeModal.tsx` with the approved Popover/overlay composition and modal context, preserving `TacoSearchInput`, result buttons, domain state, empty/long-result behavior and keyboard dismissal.
- [ ] T017 [skill: $shadcn] [US3] Audit and normalize the ten modal Select consumers in `src/app/pacientes/[id]/page.tsx`, `src/components/molecules/CreatePatientModal.tsx`, `src/components/molecules/CustomFoodModal.tsx`, `src/components/molecules/CreatePresetModal.tsx`, `src/components/molecules/CreateRecipeModal.tsx` and `src/components/molecules/EditPatientModal.tsx`, keeping `layer="modal"` only where the Select is portalled from an active modal.

## Phase 4: Gate, documentation and homologation — User Story 4

**Goal**: Make the final rule executable, traceable and protected against regression.

**Independent test criteria**: The z-index gate and existing catalog/legacy gates pass; design-system documentation is synchronized; the manual overlay matrix has evidence for isolated and nested contexts.

- [ ] T018 [skill: $design-system] [P] [US4] Synchronize the affected component profiles and category/index documents in `design-system/components/profiles/molecules/date-picker-field.md`, `design-system/components/profiles/molecules/create-recipe-modal.md`, `design-system/components/profiles/organisms/patient-list-table.md`, `design-system/components/token-index.md` and `design-system/13-implementation-and-compliance.md`, documenting context ownership and removing contradictory local rules.
- [ ] T019 [skill: $design-system] [P] [US4] Update the implementation-facing layer map in `tailwind.config.js` and the public design-system contract only where needed to keep semantic aliases available, without introducing numeric utilities or a second token source.
- [ ] T020 [skill: $code-reviewer-expert] [US4] Implement the deterministic audit in `scripts/verify-design-system-z-index.mjs`, add `verify:design-system-z-index` to `package.json`, and emit exit codes 0/1/2 plus nominal findings for forbidden values, family mismatches, invalid contexts and consumer overrides.
- [ ] T021 [skill: $tdd] [P] [US4] Add contract coverage for the audit output and exit semantics in `tests/design-system/z-index-audit.test.ts`, including valid fixtures for all official tokens and invalid fixtures for numeric, arbitrary, local-modal and family-mismatch cases.
- [ ] T022 [skill: $webapp-testing] [US4] Execute the manual desktop matrix from `specs/06-08-26-adequacao-z-index-design-system/quickstart.md` at 1024px or wider and 200% zoom, and record screenshots/observations in `specs/06-08-26-adequacao-z-index-design-system/evidence/manual-overlay-matrix.md` for search icons, all modal selects, DatePicker, ingredient results and nested confirmation dialog.
- [ ] T023 [skill: $code-reviewer-expert] [US4] Run `npm run verify:design-system-z-index`, `npm run verify:design-system`, `npm run verify:design-system-legacy`, `npm run type-check`, `npm run lint`, the focused test suite and `git diff --check`; record final evidence in `specs/06-08-26-adequacao-z-index-design-system/evidence/final-validation.md` and resolve all blocking findings within scope.

## Dependencies and execution order

### Phase dependencies

- Phase 1 can begin immediately and freezes the baseline before runtime edits.
- Phase 2 depends on T001–T003; T004 and T005 are written first and must fail before T006–T009 implement the contract.
- T010 depends on the primitive mapping decisions from T006–T009 and must be completed before final documentation is considered synchronized.
- Phase 3 depends on the primitive contract from Phase 2; T011–T013 are written before T014–T017 implement consumer changes.
- Phase 4 depends on the consumer migration and focused regressions from Phase 3; T020–T023 form the final homologation gate.

### Parallel opportunities

- T001, T002 and T003 can run in parallel because they produce independent baseline artifacts.
- T004 and T005 can run in parallel after the baseline is frozen.
- T006, T007, T008 and T009 can run in parallel after the primitive contract tests are in place, provided each file has a single owner.
- T011, T012 and T013 can run in parallel because they target separate test areas.
- T014, T015, T016 and T017 can run in parallel after their corresponding tests and primitive contracts are ready.
- T018 and T019 can run in parallel once the final semantic mapping is accepted; T021 follows the audit implementation so it can assert the final output contract.

### MVP delivery

The MVP is Phase 1 plus the primitive contract slice (T004–T010) and the six numeric consumer replacements in T014. It proves the official scale and removes the direct numeric violations before the broader DatePicker/search composition and governance gate.

### Implementation rules

- Do not edit runtime files before their corresponding contract test exists when a task is marked test-first.
- Do not change the official numeric values or add a new z-index token without a separate governance decision.
- Do not use `!z-*`, `z-10`, `z-[N]`, inline static `zIndex` or a free-form `layer` prop.
- Keep `src/components/ui` generic and preserve Radix/Shadcn semantics, portal, focus, keyboard and dismissal behavior.
- Keep domain search state in `CreateRecipeModal`; only overlay infrastructure belongs in the shared primitive/composition.
- Preserve existing worktree changes, including the current `SelectContent layer="modal"` baseline, and do not revert unrelated files.
- After human validation of this SDD, execute the tasks through `/speckit-implement`.

## Suggested MVP scope

Implement T001–T010 and T014 first, then run the primitive and static gates. The remaining consumer composition, documentation synchronization and manual homologation must still be completed before the feature is considered done.
