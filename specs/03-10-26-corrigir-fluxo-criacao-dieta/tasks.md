# Tasks: Corrigir Integridade e Recuperação na Criação de Dieta

**Input**: Design documents from specs/03-10-26-corrigir-fluxo-criacao-dieta/

**Prerequisites**: spec.md and plan.md required; research.md, data-model.md, contracts/ and quickstart.md available.

**Tests**: Regressions are required before implementation by project Constitution IV and Validation Strategy in plan.md. They are deterministic and stay under tests/.

**Organization**: Phases follow the four prioritized user stories; tests for each story precede its implementation.

## Format: [ID] [P?] [Story] Description

- [P] means the task can run in parallel with other marked tasks because it owns different files and has no dependency on unfinished work.
- [Story] maps each story-phase task to spec.md.

## Phase 1: Setup

**Purpose**: Preserve existing user work before touching overlapping files.

- [ ] T001 [skill: $ponytail] Review and record the current diffs for src/app/pacientes/[id]/dieta/[dietaId]/page.tsx, src/hooks/useDietBuilderPage.ts, src/hooks/useDietBuilderModals.ts, src/lib/application/diets/legacy-diet-adapter.ts and src/components/templates/DietBuilderTemplate.tsx; preserve every unrelated change during implementation.

## Phase 2: Foundational

**Purpose**: Shared runtime, test fixtures, and persistence contracts.

No package, schema, or shared framework setup is required. Existing profile, diet, and test fixtures are reused; story work can start after T001.

## Phase 3: User Story 1 - Prescrição reproduz fielmente o que foi editado (Priority: P1)

**Goal**: Keep item snapshots, valid source provenance, and prescription weight faithful across edits and reloads.

**Independent Test**: Change quantity/source on a recovered or copied diet, save and reopen it, and compare the confirmed source/quantity/nutrients and g/kg; verify missing historical weight is never inferred.

### Tests for User Story 1

- [ ] T002 [skill: $tdd] [P] [US1] Extend tests/infrastructure/diet-snapshot-roundtrip.integration.test.ts for changed quantities and saved/reopened snapshot equality using the frozen reference.
- [ ] T003 [skill: $tdd] [P] [US1] Extend tests/hooks/useDietMealActions.test.ts for changing quantity and substituting a source without retaining the old snapshot.
- [ ] T004 [skill: $tdd] [P] [US1] Extend tests/lib/diets/diet-validation.test.ts for complete snapshots from all modeled editor sources while rejecting malformed provenance/quantities.
- [ ] T005 [skill: $tdd] [P] [US1] Extend tests/hooks/useDietCalculations.test.ts for using the diet weight reference and leaving g/kg unavailable when a legacy reference is absent.

### Implementation for User Story 1

- [ ] T006 [skill: $ponytail] [P] [US1] Preserve weightReferenceKg in both directions of src/lib/application/diets/legacy-diet-adapter.ts and add the optional legacy field in src/lib/legacy-diet-types.ts.
- [ ] T007 [skill: $ponytail] [P] [US1] Update quantity/substitution snapshots in src/hooks/useDietMealActions.ts using the existing source snapshot helpers in src/lib/library-ui-adapter.ts.
- [ ] T008 [skill: $ponytail] [P] [US1] Use the plan's reference weight in src/hooks/useDietCalculations.ts and avoid profile-weight fallback for plans with no recoverable reference.
- [ ] T009 [skill: $ponytail] [P] [US1] Align src/lib/domain/diets/diet-validation.ts with modeled snapshot source types while retaining identity, provenance, quantity, and nutrient validation.

**Checkpoint**: US1 round-trip tests pass for the editor's supported source types and legacy weight behavior.

## Phase 4: User Story 2 - Salvamento e recuperação comunicam o resultado verdadeiro (Priority: P1)

**Goal**: Distinguish local commit, draft cleanup, file checkpoint, rollback, conflict, and uncertain commit; retry only the unfinished operation.

**Independent Test**: Simulate a local commit, cleanup failure, checkpoint failure, rollback, conflict, and unknown result; verify the response and retry do not duplicate the clinical mutation.

### Tests for User Story 2

- [ ] T010 [skill: $tdd] [P] [US2] Extend tests/lib/diets/save-diet-as-active.test.ts for committed cleanup retry, stable-ID reconciliation, and preserving a newer draft revision.
- [ ] T011 [skill: $tdd] [P] [US2] Add tests/application/diets/diet-application-checkpoint.test.ts for committed reconciliation checkpointing, noncommitted no-checkpoint, and file-sync failure after local commit.
- [ ] T012 [skill: $tdd] [P] [US2] Add tests/hooks/useDietBuilderSaveOutcome.test.ts for RESULT_UNKNOWN reconciliation and CHECKPOINT_PENDING/CLEANUP_PENDING actions without resubmitting the diet.

### Implementation for User Story 2

- [ ] T013 [skill: $backend-architect-ddd] [US2] Add the minimum discriminated outcome fields/statuses in src/lib/domain/diets/diet-model.ts and src/lib/application/diets/diet-ports.ts for checkpoint-pending and cleanup reconciliation.
- [ ] T014 [skill: $backend-architect-ddd] [US2] Update src/lib/application/diets/save-diet-as-active.ts so reconciliation confirms the stable ID, cleans only the confirmed revision, and distinguishes committed, not committed, cleanup pending, and review required.
- [ ] T015 [skill: $backend-architect-ddd] [US2] Update src/lib/application/diets/diet-application.ts to checkpoint after local commit or committed reconciliation, preserve the local outcome if profile sync fails, and never repeat the diet mutation for checkpoint retry.
- [ ] T016 [skill: $nextjs-fullstack-master] [US2] Update src/hooks/useDietBuilderPage.ts so unknown results reconcile before retry, cleanup-pending exposes cleanup-only retry, committed/checkpoint-pending outcomes return to the patient profile, and file retry never resubmits the diet.

**Checkpoint**: Every save result has one truthful user state and retries cannot create a second active diet.

## Phase 5: User Story 3 - O editor preserva o rascunho durante navegação e salvamento (Priority: P1)

**Goal**: Gate exits on a successful flush and prevent all edits during explicit confirmation without blocking background autosave.

**Independent Test**: Force non-SAVED flush outcomes for each editor exit, trigger edits during explicit Save, and verify the draft remains available and the captured revision is not changed.

### Tests for User Story 3

- [ ] T017 [skill: $tdd] [P] [US3] Extend tests/app/pacientes/diet-editor-persistence.test.tsx for back/cycle-matrix exits and preview guards when flush is failed, superseded, invalidated, or successful.
- [ ] T018 [skill: $tdd] [P] [US3] Extend tests/components/templates/DietBuilderTemplate.test.tsx and tests/hooks/useDietBuilderPage.test.ts for dialog shortcut blocking, inert editor region during explicit confirmation, and nonblocking autosave.

### Implementation for User Story 3

- [ ] T019 [skill: $nextjs-fullstack-master] [US3] Gate back/cycle-matrix exits in src/hooks/useDietBuilderPage.ts and src/app/pacientes/[id]/dieta/[dietaId]/page.tsx on flush status SAVED; preserve existing PDF/page preview guards.
- [ ] T020 [skill: $ui-styling] [US3] Add confirmationBusy distinct from background autosave in src/hooks/useDietBuilderPage.ts; disable the save shortcut while edit dialogs are open and inert the existing editable region with accessible busy status in src/components/templates/DietBuilderTemplate.tsx.
- [ ] T021 [skill: $ponytail] [US3] Guard hook-level mutation entry points in src/hooks/useDietBuilderPage.ts, src/hooks/useDietBuilderModals.ts, and src/hooks/useDietMealActions.ts so callbacks cannot change the captured revision during confirmation.

**Checkpoint**: Explicit Save captures one fixed revision; failed flushes keep the editor open, and routine autosave remains editable.

## Phase 6: User Story 4 - Falhas ao abrir a dieta têm uma saída acionável (Priority: P2)

**Goal**: Replace indefinite loading with actionable errors for patient/editor open failures.

**Independent Test**: Simulate patient missing/archived, diet missing, and persistence unavailable; verify each leaves loading and offers retry or safe return.

### Tests for User Story 4

- [ ] T022 [skill: $tdd] [P] [US4] Add tests/app/pacientes/diet-editor-load-errors.test.tsx for patient, diet, and persistence open failures, retry, and safe return.

### Implementation for User Story 4

- [ ] T023 [skill: $nextjs-fullstack-master] [US4] Preserve openEditor failure categories in src/hooks/useDietPresets.ts and src/hooks/useDietBuilderPage.ts, with loading, ready, and error states.
- [ ] T024 [skill: $ui-styling] [US4] Render the actionable error state in src/app/pacientes/[id]/dieta/[dietaId]/page.tsx and retain accessible retry/back actions.

**Checkpoint**: No supported open failure remains on an indefinite spinner.

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T025 [skill: $webapp-testing] Update specs/03-10-26-corrigir-fluxo-criacao-dieta/quickstart.md with implementation outcomes, then run its focused tests, npm run type-check, npm run test, and the desktop accessibility/browser smoke.

## Dependencies & Execution Order

### Phase Dependencies

- Setup: T001 only; no dependency or schema initialization.
- Foundational: no tasks; existing layers/fixtures are sufficient.
- User stories: execute in priority order because US2 and US3 touch the same save hook, and US3/US4 share route state.
- Polish: T025 after all four user stories.

### User Story Dependencies

- US1: independent after T001; supplies the item/weight correctness baseline.
- US2: can be developed independently after T001, but in the MVP sequence it follows US1 so committed snapshots are valid.
- US3: follows US2 because it consumes the explicit save outcomes in useDietBuilderPage.
- US4: follows US3 because both change the editor hook and route; loading/error state remains independently testable.

### Within Each Story

- Regression tests precede implementation.
- US1 implementation tasks T006-T009 touch different source files and can run in parallel after T002-T005.
- US2 test tasks T010-T012 can run in parallel; implementation tasks T013-T016 are sequential by contract dependency.
- US3 test tasks T017-T018 can run in parallel; route and confirmation lock implementations follow T019, T020, T021.
- US4 test T022 precedes T023-T024.

### Parallel Opportunities

- US1: T002, T003, T004, and T005; then T006, T007, T008, and T009.
- US2: T010, T011, and T012.
- US3: T017 and T018.
- US4: no additional parallel task is justified.

## Implementation Strategy

- MVP: complete US1 first so the editor cannot confirm stale snapshots or move historical g/kg values.
- Add US2 before altering the save UI so the outcome union is stable.
- Add US3 against those explicit outcomes; keep regular autosave responsive.
- Add US4 last, reusing the domain error causes from openEditor.
- Finish with the focused suites, project type-check, full suite, and one desktop/accessibility smoke. No commit, push, merge, or publication is included.

