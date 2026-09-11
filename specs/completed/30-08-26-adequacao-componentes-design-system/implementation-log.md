# Implementation log

Append-only execution record for `$sdd-implement`. The checkpoint before code
changes is `1c5b9d8ef1ceada89f669c3bd7c53ef676531fcc`.

## 2026-08-30 — T013–T017 regression characterization

- Command: `npx vitest run tests/components/component-adequation/actions-macros.test.tsx tests/components/component-adequation/selection-cycling.test.tsx tests/components/component-adequation/search-substitution.test.tsx tests/components/component-adequation/patient-tables.test.tsx tests/components/component-adequation/diet-overlays.test.tsx --reporter=verbose`
- Result: 9 passed, 6 failed across 4 files.
- Relevant failures: `MacroProportionBar` rendered derived `370` when `kcal={0}`; `MacroSummary` rendered an absent value as an empty number followed by `g`; category/mode/cycle controls exposed `tab` semantics despite not owning tab panels; ready-meal/recipe empty states were outside the canonical `DataTable`; `PatientDietsTable` bypassed `DataTable` for an empty collection.
- Hypothesis: the failures are implementation deviations identified by the approved contracts, not fixture or environment failures.
- Cause confirmed by source inspection: truthy kcal fallback in `MacroProportionBar`, no explicit missing-value formatter in `MacroSummary`, explicit `role="tab"` on ToggleGroup consumers/cards without associated panels, and early-return empty branches in the result/table components.
- T017 overlay characterization passed, including async rejection keeping the import modal open and read-only snapshot content remaining non-editable.
- Next fix strategy: make the focused component changes in T018–T026, then rerun each affected test file and the existing regression suites. No store, domain calculation, primitive, token, or global test configuration changes are authorized.

## 2026-08-30 — T018 actions and macro summaries

- Changes: `IconButton` now defaults to `type="button"`; `MacroProportionBar` preserves explicit zero kcal, computes kcal only when the prop is absent and renders missing macro values without inventing units/values; `MacroSummary` accepts missing values and renders an explicit em dash while preserving zero and the `MacroNutrientSummary` alias.
- Validation: `npx vitest run tests/components/component-adequation/actions-macros.test.tsx tests/components/molecules/macro-proportion-bar.test.tsx tests/components/molecules/MacroSummary.test.tsx src/components/atoms/__tests__/IconButton.test.tsx tests/design-system/button-variants.test.tsx --reporter=verbose` — 5 files, 30 tests passed.
- Validation: `npm run type-check` — passed. A pre-existing type-check issue in the new catalog contract test was fixed by adding a local finding shape annotation; no production contract was widened unsafely.

## 2026-08-30 — T019 cycle coordinator migration

- Changes: moved `CarbCyclingVariationPanel` and `DietModeSwitcher` from `molecules` to `organisms/diet`; updated `DietContextSection`, template types, barrels, affected tests, and app synchronization queries. Replaced unsupported tab semantics with the existing button/group selection semantics while preserving callbacks, selected variation, drag/keyboard ordering, and mode/cycle separation.
- Initial validation: the combined architecture seam test also reported the expected absence of the future `organisms/foods/FoodSearchModal.tsx` target, which belongs to T022; no T019 source was implicated.
- Validation: `npx vitest run tests/components/component-adequation/selection-cycling.test.tsx tests/components/molecules/CarbCyclingVariationPanel.test.tsx tests/components/molecules/diet-mode-switcher.test.tsx src/components/molecules/food-search/__tests__/FoodSearchCategorySelector.test.tsx tests/components/templates/diet-builder-template.test.tsx tests/app/pacientes/diet-nova-carb-cycling-sync.test.tsx --reporter=verbose` — 6 files, 23 tests passed. Existing app tests emitted act-environment warnings only.

## 2026-08-30 — T020 category selector semantics

- Changes: `FoodSearchCategorySelector` now uses the existing single-select `ToggleGroup` button semantics (`aria-pressed`/`data-state`), removes unsupported tab semantics, keeps controlled selection and labels, and maps active category emphasis to the canonical primary semantic tokens without touching primitives or token sources.
- Validation: `npx vitest run tests/components/component-adequation/selection-cycling.test.tsx src/components/molecules/food-search/__tests__/FoodSearchCategorySelector.test.tsx --reporter=verbose` — 2 files, 5 tests passed.

## 2026-08-30 — T021 result tables and empty states

- Changes: kept `ReadyMealSearchResultsList` and `RecipeSearchResultsList` on the resolved canonical `DataTable` for empty collections as well as populated results. Contextual empty copy and Lucide affordances now flow through `emptyMessage`; selection, stable IDs, sortable typed columns, sticky header, modal height, and virtualization remain unchanged.
- Validation: `npx vitest run tests/components/component-adequation/search-substitution.test.tsx src/components/molecules/food-search/__tests__/ReadyMealSearchResultsList.test.tsx src/components/molecules/food-search/__tests__/RecipeSearchResultsList.test.tsx --reporter=verbose` — 3 files, 9 tests passed.
- Validation: `npm run verify:table -- --target src/components/molecules/food-search/ReadyMealSearchResultsList.tsx --target src/components/molecules/food-search/RecipeSearchResultsList.tsx --strict` — 2/2 targets without errors; 0 errors, 0 warnings.

## 2026-08-30 — T022 food modal coordinator migration

- Changes: moved the concrete `FoodSearchModal` and `SubstituteFoodModal` implementations to `organisms/foods`; updated the diet route, `useDietBuilderModals` type import, organism barrel, and all affected tests. Internal dependencies now point downward to molecule result/summary components through absolute imports. The TACO-only behavior, selection payload, quantity preservation, focus/dismissal behavior, and hook logic were preserved.
- Compatibility check: `rg` found no obsolete molecule modal imports or source references; the architecture seam confirms both organism owners exist and no molecule-to-organism dependency was introduced.
- Validation: `npx vitest run tests/components/component-adequation/search-substitution.test.tsx tests/components/molecules/food-search-modal.test.tsx tests/components/molecules/substitute-food-modal.test.tsx src/components/molecules/__tests__/FoodSearchModal.test.tsx --reporter=verbose` — 4 files, 24 tests passed.
- Validation: `npx vitest run tests/architecture/component-adequation.test.ts --reporter=verbose` — 1 file, 2 tests passed.
- Validation: `npm run type-check` — passed.

## 2026-08-30 — T027 architecture and compatibility seam

- Changes: closed the final barrel, route, hook, template, and test import graph for the migrated organisms; confirmed the molecule barrel contains only the remaining molecule implementations and the organism barrel owns each migrated coordinator. No legacy molecule implementation path or ascending molecule-to-organism dependency remains.
- Validation: `npx vitest run tests/architecture/component-adequation.test.ts tests/components/molecules/composition.test.ts tests/components/overlays-accessibility.test.tsx tests/tooling/table-conformance.test.ts tests/components/component-adequation/actions-macros.test.tsx tests/components/component-adequation/selection-cycling.test.tsx tests/components/component-adequation/search-substitution.test.tsx tests/components/component-adequation/patient-tables.test.tsx tests/components/component-adequation/diet-overlays.test.tsx --reporter=verbose` — 9 files, 24 tests passed.
- Validation: `npm run type-check` — passed.
- Validation: `npm run lint` — passed.

## 2026-08-30 — T028 final design-system catalog reconciliation

- Changes: reconciled the affected organism profiles and registry entries with their live final paths/layers, changed completed migrations to `implemented`, updated direct consumers and the baseline discovery count to 71, and corrected the MacroProportionBar/ReadOnlyDietModal relationship. No category, trait, token, primitive, rule, validator, or auditor definition was changed.
- Validation: `npm run verify:design-system` — passed: 40 current source files covered, 0 uncovered public visual exports, 11 categories homologated, 4 proposed components specified, 0 blocking findings.
- Validation: `npx vitest --config specs/30-08-26-adequacao-componentes-design-system/vitest.catalog.config.ts run --reporter=verbose` — 2 files, 31 tests passed.
- Validation: `npm run verify:table -- --strict` — 12/12 targets without errors; 0 errors, 0 warnings, including the five baseline TABLE016 ownership warnings resolved by catalog/profile ownership.

## 2026-08-30 — T029/T030 browser evidence

- Changes: added the feature-local Playwright config with a dedicated `3217`
  server, `reuseExistingServer: false`, a feature-only `testMatch`, one worker,
  and disposable browser contexts. Added `tests/browser/component-adequation.spec.ts`
  using the immutable synthetic fixture to cover catalog families, patient
  history, cycles, search/substitution, read-only and import overlays.
- Follow-up fix found by browser validation: controlled food-search modal now
  accepts the explicit add-food trigger ref and returns focus to it through the
  existing Dialog close lifecycle; the Dialog primitive/design-system sources
  were not changed.
- Validation: `npx --no-install playwright test --config specs/30-08-26-adequacao-componentes-design-system/playwright.config.ts` — 3 tests passed; final `.last-run.json` status `passed`.
- Visual review: screenshots were reviewed manually in
  `evidence/browser/test-results/` for `1024×900`, `1440×900`, reduced motion,
  and the two 200% zoom simulations. Keyboard focus, dialog headers/footers,
  the read-only scroll region, empty/long-label states, stable nutrition data,
  and callback outcomes were observed. See `evidence/browser/run.md`.

## 2026-08-31 — T031–T034 final gates and reconciliation

- Validation: quickstart gates were executed and recorded in
  `evidence/final-gates/results.md`. Type-check, lint, build, links, Atomic,
  z-index, legacy, design-system, tables, catalog and feature-scoped tests
  passed. `npm test` global was executed, stayed without progress for 90s and
  exited 1; it remains an explicit global blocker already represented in the
  baseline.
- Review: `validation-report.md` maps FR/NFR/SC to tasks, sources and
  evidence. `evidence/review.md` records no code blocker in scope, the global
  test blocker, the baseline hash-record inconsistency, preserved concurrent
  work, pending human review and absence of commit/deploy.
- Protection check: registry `schemaVersion`, categories and traits are equal
  to the checkpoint; protected sources have no feature-attributable diff. The
  literal hash mismatch for `src/app/globals.css` is a baseline-record issue
  and was not hidden by rewriting the evidence.

## 2026-08-30 — T026 patient rows and parent ownership

- Changes: preserved the canonical table row composition for consultation history and patient lists; kept the profile navigation as a real keyboard-focusable link, removed the competing row `role="link"`, prevented row-key activation when the link itself is the event target, and removed the arbitrary minimum-height utility. Standardized the active row marker to the existing 1px border contract without changing tokens or primitives.
- Validation: `npx vitest run tests/components/component-adequation/patient-tables.test.tsx tests/components/organisms/patient-list-table.test.tsx tests/components/organisms/patient-consultation-history-table.test.tsx tests/components/organisms/patient-diets-table.test.tsx --reporter=verbose` — 4 files, 27 tests passed; existing jsdom navigation notices only.
- Validation: `npm run verify:table -- --target src/components/organisms/PatientConsultationHistoryTable.tsx --target src/components/organisms/PatientListTable.tsx --strict` — 2/2 targets without errors; 0 errors, 0 warnings.

## 2026-08-30 — T025 patient data tables

- Changes: retained both patient tables and their expanded row parts on the canonical `DataTable` composition. Removed the `PatientDietsTable` empty collection early return so the table owns the empty status and keeps the same caption/headers; assessment and diet callbacks, units, stable IDs, cycle expansion, row actions, and macro presentation remain unchanged.
- Validation: `npx vitest run tests/components/component-adequation/patient-tables.test.tsx tests/components/organisms/patient-assessments-table.test.tsx tests/components/organisms/patient-diets-table.test.tsx tests/components/organisms/patient-consultation-history-table.test.tsx tests/components/organisms/patient-list-table.test.tsx --reporter=verbose` — 5 files, 30 tests passed. Existing jsdom navigation notices only.
- Validation: `npm run verify:table -- --target src/components/organisms/patient/PatientAssessmentsTable.tsx --target src/components/organisms/patient/PatientDietsTable.tsx --strict` — 2/2 targets without errors; 0 errors, 0 warnings.

## 2026-08-30 — T023 import modal implementation migration

- Changes: replaced the inverted organism façade with the concrete `ImportPreviousDietModal` implementation under `organisms/diets`; removed the molecule barrel export and updated the adequation/legacy tests and table-conformance target. The existing DataTable, single selection, cycle expansion, async action locking, rejection behavior, focus shortcut, and import callbacks remain intact.
- Compatibility check: the molecule implementation path is absent and no source/test import still targets it; the organism path is the sole public implementation.
- Validation: `npx vitest run tests/components/component-adequation/diet-overlays.test.tsx tests/components/molecules/ImportPreviousDietModal.test.tsx tests/components/organisms/import-previous-diet-modal.test.tsx --reporter=verbose` — 3 files, 14 tests passed; existing React act warnings only.
- Validation: `npm run resolve:table -- --target src/components/organisms/diets/ImportPreviousDietModal.tsx --json` — resolved the canonical `DataTable` and typed selection/expansion contract.
- Validation: `npm run verify:table -- --target src/components/organisms/diets/ImportPreviousDietModal.tsx --strict` — 1/1 target without errors; 0 errors, 0 warnings.

## 2026-08-30 — T024 read-only snapshot modal

- Changes: kept the active `DietPlan` snapshot modal as the organism implementation, made the body the only scrollable region, retained static surface/divider borders, normalized item typography and numeric presentation, and kept the footer visible with its single close action. The modal still reads only the supplied snapshot and has no draft, write, edit, delete, or live-calculation path.
- Legacy proof: no source or test consumer referenced `src/components/molecules/ReadOnlyDietModal.tsx`; the old `HistoricalDiet` modal was therefore removed without converting its data contract. The molecule barrel and structural test were updated to reflect the actual layer.
- Validation: `npx vitest run tests/components/component-adequation/diet-overlays.test.tsx tests/components/organisms/read-only-diet-modal.test.tsx tests/components/overlays-accessibility.test.tsx tests/components/molecules/composition.test.ts tests/architecture/component-adequation.test.ts --reporter=verbose` — 5 files, 11 tests passed.
- Validation: `npm run type-check` — passed.

## 2026-08-31 — T035 convergence status reconciliation

- Changes: updated the task-file status so it reflects the completed technical
  execution in scope while keeping the global test gate and human review
  pending states explicit; no application or design-system source changed.
- Validation: task inventory contains T001–T035 checked; the status wording is
  consistent with `validation-report.md` and `evidence/review.md`.
