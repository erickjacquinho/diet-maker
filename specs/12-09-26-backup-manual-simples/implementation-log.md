# Implementation log — Backup manual simples

## Initial state

- Feature: `specs/12-09-26-backup-manual-simples`
- Checkpoint: `88328de592cf91a019d212098b8c45efa6b51af0` — `chore(backup): checkpoint before implementing manual backup`
- Preflight: both checklists complete; `check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks` resolved the feature directory.
- Hook: the configured mandatory `before_implement` command `speckit-implement` does not resolve as a PowerShell executable; the current explicit `$sdd-implement` invocation is the active implementation route.

## Task evidence

### T001 — inventory

- `logical-export-schema.ts` had no runtime consumers; it only exposed the diet-only shape `LogicalAccountExport`.
- Legacy `.diet` labels were confined to `SidebarQuickActions.tsx`, `SidebarUserProfile.tsx` and their existing tests, with historical references in `refs/dieta-db/` and an older ADR.
- The canonical persistence sources are `src/lib/infrastructure/local-db/schema.ts`, `migrations.ts`, the local account context, PGlite repositories, the IndexedDB draft store and the existing Sidebar composition.

### T002 — fixtures and helper

- Added deterministic complete/empty backup fixtures in `tests/fixtures/backup.ts` covering all 17 logical tables, active/archived data, historical diet snapshots, clinical records, reusable library rows and the draft boundary.
- Added `tests/helpers/backup.ts` with isolated in-memory PGlite database creation and dependency-ordered fixture seeding.

### T003–T005 — contract and pure validation

- RED evidence: `npm test -- --reporter=dot tests/lib/backup.test.ts` initially failed because `src/lib/application/backup-application.ts` was absent.
- Added the single `.nutridiet` envelope contract, schema-inferred row types, strict runtime key lists, version constants, port and named error codes.
- Added pure JSON parsing/validation with no SQL, code execution or persistence side effect.
- GREEN evidence: `npm test -- --reporter=dot tests/lib/backup.test.ts` — 1 file, 9 tests passed; `npm run type-check` — passed.
- One validation-order correction was required: the local account identity is checked before row scopes so a foreign account reports `BACKUP_APP_MISMATCH` consistently.

### T006–T010 — repository, rollback, draft guard and composition

- RED evidence: `npm test -- --reporter=dot tests/infrastructure/backup-repository.integration.test.ts` initially failed because the PGlite adapter was absent.
- Added consistent transactional reads for all 17 tables, scoped joins for diet children without direct account columns, reverse dependency deletion, dependency-ordered insertion and injected rollback failure points.
- RED evidence: `npm test -- --reporter=dot tests/infrastructure/backup-drafts.integration.test.ts` initially failed because `listRecoverableByAccount` was absent.
- Added the account-wide editable-draft query without reading, writing or deleting draft payloads; updated existing typed test doubles for the expanded port.
- Composed one shared draft store, `PGliteBackupRepository` and `backupApplication` in the browser runtime; the UI still receives only the application seam.
- GREEN evidence: `npm test -- --reporter=dot tests/infrastructure/backup-repository.integration.test.ts tests/infrastructure/backup-drafts.integration.test.ts tests/infrastructure/diet-draft-store.integration.test.ts` — 3 files, 9 tests passed; `npm run type-check` — passed.

### T011–T016 — boundary and export journey

- Added the architecture boundary test for the single `.nutridiet` contract, no legacy storage, no competing `.diet` UI and application-seam-only composition.
- Implemented `exportBackup` with deterministic `.nutridiet` naming, UTF-8 JSON and repository-only confirmed data capture; export failures are named and non-mutating.
- Migrated quick actions and account menu to `Exportar backup`/`Restaurar backup` with equivalent expanded/collapsed accessible names and loading/disabled behavior.
- Added adapter-level download and browser coverage. Targeted UI/boundary evidence: 2 files, 7 tests passed. Browser export evidence: offline after runtime warm-up, no request during the action, `.nutridiet` download and no draft content.

### T017–T024 — restore safety and limits

- Added application restore cases for malformed/foreign files, duplicate IDs, orphan relations, duplicate active diets, cancellation, pending drafts and transactional failure classification.
- Implemented the controlled file input, strict pre-confirmation validation, total-replacement dialog, pending-draft blocking state, rollback-safe repository integration and post-restore reload.
- Dialog copy explicitly communicates no merge, no password/cryptography, confirmed data only, draft exclusion and responsibility for guarding the file.
- Browser evidence: 4/4 backup tests passed, including invalid-file rejection, cancel, valid restore after reload, pending draft blocking, transactional rollback and offline export.
- Fixed validation for nullable optional clinical circumference fields defined by the canonical schema.

### T025–T026 — references and gates

- Updated the persistence index and Decisions 11, 13 and 14 to link the completed stages 5–6 and the backup validation report.
- Final gate evidence is recorded in `validation-report.md`: 221 Vitest files / 805 tests, type-check, lint, Atomic Design, z-index, table, Design System, legacy, links, browser and build all passed.

### T027 — convergence

- Final read-only convergence checked `spec.md`, `plan.md`, `tasks.md`, checklists, contracts, quickstart, constitution and the scoped implementation.
- Coverage: 18 functional requirements, 7 success criteria, 3 user stories and 3 acceptance scenarios; all 27 tasks are complete.
- Result: converged with zero `missing`, `partial`, `contradicts` or `unrequested` findings. No convergence phase was appended to `tasks.md`.
