# Implementation Log: Prova técnica e base local

## Execution metadata

- Feature: `30-08-26-prova-tecnica-base-local`
- Scope: `poc/local-db-proof/`
- Adapter status: approved as a candidate for the next SDD, within the isolated PoC scope.
- Checkpoint before implementation: `4361e39` (`chore(persistence): checkpoint before local db proof`)
- Runtime: Node `22.23.1`, npm `10.9.8`

## Task evidence

### T001–T003 — Setup

- Added an isolated package with exact dependency versions for PGlite, Drizzle, Vite, Vitest and Playwright.
- Added browser-only Vite harness entry point and local ignore rules.
- Added separate Vitest and Playwright configurations.
- Verification: `npm install` passed in `poc/local-db-proof/`.
- Verification: `npm run type-check` passed.
- Verification: `npm test` passed with no tests present yet.
- Verification: `npx playwright install --dry-run chromium` resolved Chromium `151.0.7922.34`.

### T004–T009 — Foundation

- Added domain-facing contracts and typed PoC errors without importing Drizzle or PGlite into the contract layer.
- Added deterministic multi-account fixture with active/snapshot diets, archived patient, recipes, nutrition snapshots and contextual draft.
- Added relational schema for accounts, patients, recipes, diet plans, meals and meal items, including foreign keys, checks and one-active-plan partial index.
- Generated `drizzle/0000_initial.sql` with Drizzle Kit and added an explicit browser-compatible migration executor.
- Added PGlite client opening with persistent IndexedDB mode for browser runs and explicit persistence errors; memory mode remains test-only.
- Added nominal evidence report serialization with runtime, browser, viewport and diagnostic timing fields.
- Verification: `npm run type-check` passed.
- Verification: `npm run db:generate` reported no schema changes after the generated migration was installed.
- Verification: `npm run build` passed.
- Verification: `npm test -- --run tests/fixture.test.ts` passed (`2` tests).

### T010–T013 — US1

- Wrote the persistence/reopen and explicit-storage-failure tests before adding the repository implementation; the first run was red because `repositories.ts` did not exist.
- Added the repository seam for fixture seed, scoped reads and composed diet writes.
- Added the browser-only harness for initialization, seed, reopen and diagnostic timings.
- Browser evidence: Chromium `151.0.7922.34`, `1280x900`; initial open/migration `3732.60 ms`, query `163.00 ms`, fixture write `58.60 ms`; reopen recovered `3` diets.
- Verification: `npm test -- --run tests/db.integration.test.ts` passed (`2` tests).
- Verification: `npm test` passed (`4` tests).
- Verification: browser run through `with_server.py` and `scripts/us1_browser_check.py` passed.
- Evidence recorded in `poc-report.md`; adapter decision remains `needs re-evaluation` pending US2–US4.

### T014–T021 — US2

- Wrote tests for rollback, cross-account scope, child relation scope, active-plan replacement, draft isolation and two-tab behavior.
- Added explicit aggregate-child relation validation in the repository; transaction rollback covers the previous ACTIVE-to-SNAPSHOT transition as well as new rows.
- Added an IndexedDB draft store with an independent database/object-store namespace, validation, update ordering and removal.
- Added fail-closed Web Locks acquisition before PGlite initialization and released the lock before closing the client.
- Verification: `npm test -- --run tests/transaction.integration.test.ts tests/drafts.integration.test.ts` passed (`6` tests).
- Verification: `npm run test:browser -- tests/browser/single-tab.spec.ts` passed (`1` scenario).
- Evidence recorded in `poc-report.md`; adapter decision remains `needs re-evaluation` pending US3–US4.

### T022–T027 — US3

- Wrote migration and logical portability tests before adding the second migration and transfer module; initial runs exposed the missing migration/version API and transfer module.
- Added additive `0001_add_fixture_metadata.sql` and a migration executor that journals applied IDs and skips re-execution.
- Added a versioned logical JSON envelope with explicit schema/format validation and relationship checks before mutation.
- Added transactional replacement of one account’s confirmed sample while preserving other account scopes.
- Verification: migration tests passed (`2` tests), including applying v2 over a populated v1 database and re-running it.
- Verification: portability tests passed (`2` tests), including round-trip, draft exclusion and invalid relation rejection.
- Verification: `npm run db:generate` reported no schema changes.

### T028–T031 — US4

- Wrote the browser scenario for an unprepared-resource error and prepared-resource offline execution.
- Added an explicit preparation gate and offline workflow that repeats read, composed write, logical round-trip and reopen.
- Integrated controls into the minimal browser harness with keyboard-operable native buttons and no product UI imports.
- Verification: `npm run test:browser -- tests/browser/offline.spec.ts` passed (`1` scenario), including `OFFLINE_RESOURCE_NOT_READY` and successful offline reopen.
- Evidence recorded in `poc-report.md`; adapter decision is now ready for final cross-cutting validation.

### T032–T035 — Polish e validação final

- Consolidated the final report with FR/NFR/SC matrix, explicit `approved` decision, versions, execution mode, diagnostic timings and limitations.
- Added the isolated `lint` script/configuration and pinned TypeScript `5.9.3` so the PoC has a supported ESLint/type-aware lint toolchain.
- Replaced the portable JSON importer's unsafe double type assertion with runtime guards for every persisted collection; drafts now validate on read as well as on write.
- Boundary audit found no `localStorage`/`sessionStorage`, legacy migrator, remote request or root application import in the PoC; engine imports remain confined to `poc/local-db-proof/src/db/` and its isolated package.
- Verification: `npm install`, `npm run db:generate`, `npm run type-check`, `npm run lint`, `npm test`, `npm run test:browser` and `npm run build` passed; Vitest reported 6 files/14 tests and Playwright reported 2 scenarios.
- Verification: `npm audit --omit=dev --audit-level=high` found 0 production vulnerabilities; the full install reported 4 moderate development/transitive advisories.
