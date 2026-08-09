# Implementation Log: Shadcn DataTable

## Initial checkpoint

- Checkpoint commit: `4c14e54 chore(data-table): checkpoint before migrating tables`
- Initial branch: `tela-pacientes`
- Initial audit: three domain table consumers — `FoodTableSection`, `PatientListTable` and `PatientConsultationHistoryTable`; `src/components/ui/table.tsx` and catalog examples are infrastructure.
- Checklists: `data-table.md` 13/13 complete; `requirements.md` 15/15 complete.

## T001–T003 — Setup

- T001: `rg` audit confirmed the three domain consumers and the canonical Shadcn primitive. Result already recorded in `research.md`; no additional consumer was found.
- T002: `npx vitest run --pool=threads --maxWorkers=16 tests/components/organisms/patient-list-table.test.tsx tests/app/pacientes/page.test.tsx tests/app/pacientes/patient-profile-history.test.tsx tests/app/pacientes/patient-profile-visual.spec.ts` — PASS (4 files, 12 tests).
- T003 attempt: `npm uninstall @tanstack/react-table --save` — FAIL because the pre-existing `eslint@8` / `eslint-config-next@16` peer dependency conflict prevented npm resolution.
- T003 retry: `npm uninstall @tanstack/react-table --save --legacy-peer-deps` — returned success, but the pre-existing lockfile/package-manager state still retained stale TanStack entries. The dependency was then removed manually from `package.json`, `package-lock.json` and the installed package tree; `npm run type-check` passed afterward. npm reported 5 existing high-severity audit findings; no audit remediation was requested by this feature.

## T004–T011 — Shared DataTable molecule

- T004–T005: Added contract tests before implementation. The first run was intentionally red because `DataTable.tsx` did not exist.
- T006–T007: Added generic `DataTable<TData>`, typed column/sort/pagination contracts and molecule barrel export; `src/components/ui/table.tsx` was not changed.
- T008–T010: Added molecule/food consumer profiles, synchronized the `data-display` category and registered the molecule and food organism in `registry.json`; patient table primitive bases now point to `molecule-data-table`.
- T011: `npx vitest run --pool=threads --maxWorkers=16 tests/components/molecules/data-table.test.tsx` — PASS (1 file, 6 tests).

## T012–T017 — Food table migration

- T012–T013: Added deterministic food fixtures covering empty results, custom-food actions, supported sorting directions, 15-item pagination and boundary controls.
- T014–T016: Replaced TanStack column/state usage with `DataTableColumnDef<FoodItem>` and controlled generic sort/page state; filters remain computed before table sorting.
- T017: `npx vitest run --pool=threads --maxWorkers=16 tests/components/organisms/foods/food-table-section.test.tsx` — PASS (1 file, 4 tests).

## T018–T021 — Patient list migration

- T018: Extended the patient-list regression test with the DataTable accessible name/caption, header scope and link action-isolation assertions.
- T019–T020: Replaced the manual table shell with `DataTable` and kept the existing domain row renderer for priority, indicators, profile link and Enter/Space activation.
- T021: `npx vitest run --pool=threads --maxWorkers=16 tests/components/organisms/patient-list-table.test.tsx tests/app/pacientes/page.test.tsx` — PASS (2 files, 8 tests).

## T022–T026 — Consultation history migration

- T022–T023: Extended history tests with five scoped headers, accessible table caption/name, expansion controls and independent detail action coverage.
- T024–T025: Replaced the history table shell with `DataTable`; split the consultation main row and associated `colSpan` expanded row while keeping one controlled expanded date.
- T026: `npx vitest run --pool=threads --maxWorkers=16 tests/app/pacientes/patient-profile-history.test.tsx tests/app/pacientes/patient-profile-visual.spec.ts` — PASS (2 files, 5 tests).

## T027–T032 — Polish and final QA

- T027: `rg` audit returned no `@tanstack/react-table`, `useReactTable`, `react-table` or `table-core` references. The three domain consumers import `DataTable`; `src/components/ui/table.tsx` remained unchanged.
- T028: `npm run verify:design-system` PASS (0 blocking findings); `npm run verify:links` PASS (204 Markdown files, 315 local links); `npm run audit:atomic-design` PASS with 2 pre-existing violations outside this feature (`PageContextHeader` raw button and `ui/progress` inline transform).
- T029: `npm run test` PASS (86 files, 327 tests). The suite emitted only the existing jsdom navigation warnings.
- T030: `npm run type-check` PASS; `npm run lint` PASS with one pre-existing warning in `PageContextHeader`; `npm run build` PASS for all routes; `git diff --check` PASS.
- T031: `webapp-testing` smoke via `with_server.py` PASS at 1280px for `/alimentos`, `/pacientes` and `/pacientes/patient-profile-1`, covering table names, food sorting, patient link rendering, five history headers and expansion/re-collapse.
- T032: Final diff review PASS against the feature artifacts and Atomic Design rules. The registry now records 70 components and 66 current sources, including the extracted DataTable helpers; all 32 tasks are checked.

## Convergence

- Iteration 1: clean. Rechecked FR-001–FR-012, SC-001–SC-006, all user-story acceptance scenarios, plan touch-points, contract constraints and applicable constitution principles. No actionable finding was identified; `tasks.md` remained byte-for-byte unchanged.

## Final validation — current workspace

- DataTable foi decomposto em `DataTable.tsx`, `data-table/types.ts`, `utils.ts`, `DataTableStateRow.tsx` e `DataTablePagination.tsx`; todos os arquivos de `src/` ficaram com no máximo 200 linhas.
- `npm run test`: PASS — 86 arquivos, 327 testes.
- `npm run build`: PASS — 10 rotas geradas.
- `npm run type-check` e `npm run lint`: PASS, sem erros ou warnings.
- `npm run verify:design-system`, `npm run verify:design-system-legacy`, `npm run verify:links` e `npm run audit:atomic-design`: PASS; catálogo sem findings, auditoria legada sem findings, 315 links locais válidos e Atomic Design 100%.
- `rg` confirmou ausência de `@tanstack/react-table`, `useReactTable`, `react-table` e `table-core` em `src/`, `package.json` e `package-lock.json`.
- QA desktop Playwright, em build de produção na porta 3100 e viewport 1440px, passou nos cenários de `/alimentos`, `/pacientes` e perfil do paciente, incluindo nome da tabela, paginação, ordenação e expansão/recolhimento do histórico.
- Revisão final contra `spec.md`, `plan.md`, `data-model.md`, `contracts/data-table.md`, categoria `data-display` e regras Atomic/Shadcn: sem achados acionáveis.
