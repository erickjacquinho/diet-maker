# Tasks: Persistência e desempenho dos perfis de pacientes

**Input**: Design documents in `specs/17-09-26-persistencia-e-telas-pacientes/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`

**Organization**: Tasks are grouped by the three user stories in `spec.md`. Tests precede behavior changes per the project constitution.

## Phase 1: Setup

**Purpose**: O projeto já possui Vitest, Playwright, PGlite, `fake-indexeddb` e a fixture de 100 pacientes/2.000 dietas/2.000 avaliações. Não há dependência ou scaffolding novo a criar.

## Phase 2: Foundational

**Purpose**: Preparar paginação remota acessível e tabelas locais derivadas usadas pelas histórias.

- [ ] T001 [skill: $tdd] Add a failing remote-pagination test with total pages and bounded rows in `tests/components/molecules/data-table.test.tsx`.
- [ ] T002 [skill: $proj-table-adequation-v2] Add optional remote row count to `src/components/molecules/data-table/types.ts` and `src/components/molecules/DataTable.tsx`, retain local slicing when absent, and update `design-system/components/profiles/molecules/data-table.md`; pass T001 and the existing table tests.
- [ ] T003 [skill: $tdd] [P] Add failing migration assertions for checkpoint and diet-summary tables in `tests/lib/infrastructure/local-db/client.test.ts`.
- [ ] T004 [skill: $database-migrations-pro] Add `profile_checkpoint_state` and `diet_variation_history_summaries` to `src/lib/infrastructure/local-db/schema.ts` and `src/lib/infrastructure/local-db/migrations.ts`; pass T003 without adding them to the `.nutridiet` envelope.

## Phase 3: User Story 1 - Save principal e recuperação local (Priority: P1)

**Goal**: O `.nutridiet` continua autoritativo; saves confirmados ficam recuperáveis no navegador e o arquivo só recebe checkpoints necessários.

**Requirements**: FR-001–FR-009; SC-003–SC-004.

**Independent Test**: Confirmar uma mutação, falhar a escrita do arquivo, recarregar e recuperar o workspace; retry grava o arquivo. Um sync limpo não escreve novamente.

- [ ] T005 [skill: $tdd] [P] Add failing tests for `idb://` persistence, stable account isolation and reopening in `tests/lib/infrastructure/local-db/client.test.ts`.
- [ ] T006 [skill: $frontend-architecture-mindset] Support browser `idb://` workspaces keyed by account and retain `memory://` in `src/lib/infrastructure/local-db/client.ts` and `src/lib/application/browser-composition.ts`; connect the existing `IndexedDbDietDraftStore` and pass T005.
- [ ] T007 [skill: $tdd] [P] Add failing tests for clean-sync no-op, dirty revision, failed write and mutation during checkpoint in `tests/lib/application/profile-session.test.ts`.
- [ ] T008 [skill: $frontend-architecture-mindset] Track workspace/checkpoint revisions and make `ProfileSession.sync()` write only dirty snapshots in `src/lib/application/profile-session.ts`; mark confirmed operations in `src/lib/application/composition-root.ts` and pass T007.
- [ ] T009 [skill: $tdd] [P] Add failing restore tests for invalid/incompatible files, required save-or-discard choice when data is pending, preservation after failed replacement and successful replacement in `tests/infrastructure/backup-repository.integration.test.ts`.
- [ ] T010 [skill: $frontend-architecture-mindset] Make explicit `.nutridiet` restore validate and replace the local workspace atomically only after the pending-data choice, resetting checkpoint state only after success in `src/lib/application/profile-session.ts` and `src/lib/infrastructure/local-db/backup-repository.ts`; pass T009.
- [ ] T011 [skill: $tdd] [P] Add browser tests for field edits/autosave, explicit save and Ctrl+S, clean navigation, failed write, reload recovery, retry and simultaneous checkpoint triggers in `tests/browser/profile-save-load.spec.ts`.
- [ ] T012 [skill: $frontend-architecture-mindset] Retry pending checkpoints after pathname changes without blocking navigation in `src/app/SessionAwareAppShell.tsx`; keep pending status and retry action consistent in `src/app/navigation/SidebarNavigationAdapter.tsx`; pass T011.

## Phase 4: User Story 2 - Lista de pacientes com muitos cadastros (Priority: P1)

**Goal**: Manter busca, agrupamento, ordenação, resumos e ações atuais, exibindo 25 pacientes por página sem carregar históricos completos.

**Requirements**: FR-010–FR-011; SC-001.

**Independent Test**: Com a fixture grande, conferir 25 linhas por página, navegação completa, mesma busca/ordem e resumos em lote.

- [ ] T013 [skill: $tdd] [P] Add failing database-page tests for 100+ patients covering account scope, 25-row cap including exact-page boundaries, total, search, global group/order parity across page boundaries, and batch query count in `tests/infrastructure/patient-loading.integration.test.ts` and `tests/lib/patients/create-list.integration.test.ts`.
- [ ] T014 [skill: $backend-patterns] Apply search and current business ordering before `LIMIT/OFFSET` in `src/lib/infrastructure/local-db/patient-repository.ts`; return page plus total through `src/lib/persistence/patient-repository.ts`, `src/lib/persistence/patient-profile-reader.ts`, `src/lib/application/patients/patient-profile-reader.ts` and `src/lib/application/patients/list-active-patients.ts`; fetch summaries only for page IDs and pass T013.
- [ ] T015 [skill: $tdd] [P] Add failing UI tests for remote page count, search reset, stable row actions and empty/error states in `tests/components/organisms/patient-list-table.test.tsx`.
- [ ] T016 [skill: $proj-table-adequation-v2] Pass page index/search to the application and use remote totals in `src/hooks/usePatientsPage.ts` and `src/components/organisms/PatientListTable.tsx`; preserve result order and pass T015.

## Phase 5: User Story 3 - Histórico paginado do perfil particular (Priority: P1)

**Goal**: Paginar avaliações e dietas no banco, manter os mesmos resumos e carregar o cardápio completo apenas quando aberto.

**Requirements**: FR-012–FR-016; SC-002, SC-005–SC-006.

**Independent Test**: Em perfil com 2.000 avaliações e dietas, cada página retorna até 25 registros, mantém totais/ordem e abre o detalhe completo da dieta selecionada.

- [ ] T017 [skill: $tdd] [P] Add failing assessment-page tests for total, stable ordering, account scope and latest-assessment summary in `tests/infrastructure/clinical-repository.integration.test.ts`.
- [ ] T018 [skill: $tdd] [P] Add failing diet-page tests for account/patient scope, totals and stable ordering, exact cached-summary tests in `tests/infrastructure/diet-repository.integration.test.ts`, plus schema 4/5/6 cache-rebuild tests in `tests/infrastructure/diet-summary-import.integration.test.ts`.
- [ ] T019 [skill: $backend-architect-ddd] Expose page results and patient-profile read methods in `src/lib/persistence/clinical-repository.ts`, `src/lib/application/patients/patient-profile-reader.ts`, `src/lib/application/diets/diet-ports.ts` and `src/lib/application/diets/diet-application.ts`, without limiting full reads used by editors.
- [ ] T020 [skill: $backend-patterns] Implement account/patient-scoped `LIMIT/OFFSET` pages and totals before loading related data in `src/lib/infrastructure/local-db/clinical-repository.ts` and `src/lib/infrastructure/local-db/diets/pglite-diet-repository.ts`; pass T017/T018 and verify query plans before adding indexes.
- [ ] T021 [skill: $database-migrations-pro] Write exact per-variation nutrition summaries in the diet confirmation transaction and rebuild them after compatible backup imports in `src/lib/infrastructure/local-db/diets/pglite-diet-repository.ts` and `src/lib/infrastructure/local-db/backup-repository.ts`; keep displayed rounding and weighted cycle averages unchanged.
- [ ] T022 [skill: $tdd] Add failing profile UI tests for page changes, empty/error states, no diet-history reload after clinical save, preserved actions and on-demand full diet detail in `tests/app/pacientes/patient-profile-history.test.tsx`.
- [ ] T023 [skill: $frontend-architecture-mindset] Load page data and remote totals in `src/hooks/usePatientProfilePage.ts`, `src/components/organisms/patient/PatientAssessmentsTable.tsx` and `src/components/organisms/patient/PatientDietsTable.tsx`; retain latest assessment, existing actions, valid page after archive and on-demand diet details; pass T022.

## Phase 6: Polish and cross-cutting concerns

**Purpose**: Alinhar as decisões de arquitetura e validar todos os critérios de aceite.

- [ ] T024 [skill: general] [P] Record `.nutridiet` as the primary save and the browser database as its local workspace in `docs/adr/ADR-009-nutridiet-principal.md` and `refs/dieta-db/index.md`, replacing the conflicting backup-only description.
- [ ] T025 [skill: general] Run `npm run type-check`, `npm test`, `npm run test:browser` and the checks in `specs/17-09-26-persistencia-e-telas-pacientes/quickstart.md`; record timings for SC-001/SC-002 and fix regressions before completion.

## Dependencies and execution order

### Phase dependencies

- Setup has no code changes or new dependencies.
- Foundational tasks T001–T004 establish the shared table contract and local schema before stories use them.
- User stories follow the foundational phase; within a story, test tasks precede implementation.
- Polish depends on all three stories.

### User story dependencies

- US1 depends on the checkpoint schema in T004; it is independent from US2 and US3 afterward.
- US2 depends on the DataTable behavior in T002 and is otherwise independent from the save/session work.
- US3 depends on T002, T004 and US1 restore behavior in T010 because both restore paths rebuild local derived data; its assessment and diet repository tests (T017/T018) can run in parallel.

### Parallel opportunities

- T001 and T003 can run in parallel; their implementation tasks T002 and T004 follow their respective tests.
- After T004, US1 and US2 can proceed in parallel. US3 follows T010; within US3, T017 and T018 use separate test files and can proceed in parallel.
- The US3 data-access work can proceed alongside US1 route/checkpoint work after shared migrations are complete; keep changes to `profile-session.ts` separate from repository files. T019 waits for T010 because both touch backup import.

## Implementation strategy

1. Finish shared table/schema contracts.
2. Deliver US1 so confirmed data survives a failed or deferred file checkpoint.
3. Deliver US2 and US3 independently; prioritize US3 if only the main profile-loading bottleneck is being released first.
4. Run the complete verification in `quickstart.md` before treating the feature as done.
