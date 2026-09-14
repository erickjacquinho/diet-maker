# Implementation log — Onboarding de Profile e Sessão por Save

## Initial state

- Feature: `specs/12-09-26-onboarding-profile-load-session`
- Branch: `backend-refactor`
- Checkpoint: `113db9bab2f70ee4cae43ab43d2319e34a15fc25` — `chore(onboarding): checkpoint before implementing profile session`
- The checkpoint preserved the existing main-repository changes before implementation. The nested gitlink `.agents/skills_link/ui-ux-pro-max` remains dirty with pre-existing untracked files and was not modified.
- Secret review: no environment files, private keys, credentials, tokens or secret-like files were included in the checkpoint.

## Preflight

- `check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks` resolved `C:\Programmer\diet-maker\specs\12-09-26-onboarding-profile-load-session`.
- Checklists: `requirements.md` 13/13 complete; `ux.md` 28/28 complete.
- `tasks.md` contains 19 executable tasks, all currently pending, with exactly one `[skill: ...]` assignment per task.
- The configured mandatory `before_implement` hook `speckit-implement` was invoked, but no executable with that name exists in the workspace PATH. The explicit `$sdd-implement` invocation is the active implementation route.
- The local `speckit-analyze` instructions were read and applied read-only because no `speckit-analyze` executable is available. No critical coverage or constitutional conflict was found. Existing non-blocking artifact notes: FR-024 and FR-025 duplicate the same requirement; phone-format validation remains product-defined.
- Project validation commands discovered: `npm run lint`, `npm run type-check`, `npm run test`, `npm run test:browser`, `npm run build`, plus the design-system and architecture audit scripts in `package.json`.

## Task evidence

Pending implementation tasks will be recorded here with the specific command, result and affected files after each validation.

## T001 — persistence inventory

- Active host-bound sources: `src/lib/infrastructure/local-db/client.ts` defaults to `idb://nutridiet-local-db-v1`; `src/lib/application/browser-composition.ts` creates that runtime and `IndexedDbDietDraftStore`; `/presets` still imports `src/lib/presetsStore.ts`.
- Legacy or compatibility sources: `src/lib/storage.ts`, `legacyClinicalStore.ts`, `presetsStore.ts`, `recipesStore.ts`, `readyMealsStore.ts` and `tacoStore.ts` write through localStorage; `library-ui-adapter.ts` still persists favorites there. Most clinical views consume canonical application data but retain legacy display types.
- Evidence command: `rg -n "getPatientsFromStorage|savePatientToStorage|getStorageItem|setStorageItem|removeStorageItem|IndexedDbDietDraftStore|openLocalDatabase|createActiveAccountContext" src -g '*.ts' -g '*.tsx'`.

## T002 — deterministic NutriDiet fixtures

- Added `tests/fixtures/nutridiet/empty.nutridiet`, `tests/fixtures/nutridiet/valid-jacques-regiani.nutridiet` and `tests/fixtures/nutridiet/invalid.nutridiet`.
- Evidence command: PowerShell `ConvertFrom-Json` validation reported all three files with all 17 required collections; the valid fixture has one account named `Jacques Regiani` and one patient, the empty fixture has zero patients, and the invalid fixture uses `other-application`.

## T003–T005 — RED evidence

- Command: `npm run test -- --reporter=dot tests/lib/infrastructure/local-db/client.test.ts tests/architecture/host-persistence-boundary.test.ts tests/lib/infrastructure/backup-roundtrip.test.ts tests/lib/application/profile-session.test.ts`.
- Result: expected RED state — `profile-session.ts` and `in-memory-diet-draft-store.ts` do not exist yet; current backup validation still requires a context and schema 4; the runtime still uses the pre-feature host-persistent path. The initial test matcher was corrected from an unsupported Vitest matcher to an explicit error-code assertion before implementation.

## T003–T008 — Foundation GREEN evidence

- Implemented `memory://`-only PGlite opening, explicit account context, per-runtime in-memory drafts, schema 5/phone migration and schema 4 normalization to `phone: null`.
- Added the minimal save-file port, browser-only File System Access adapter and profile-session state machine with atomic candidate runtimes, busy protection, cancellation, permission-paused state and write-failure preservation.
- Command: `npm run test -- --reporter=dot tests/lib/infrastructure/local-db/client.test.ts tests/architecture/host-persistence-boundary.test.ts tests/lib/infrastructure/backup-roundtrip.test.ts tests/lib/application/profile-session.test.ts` — 4 files and 13 tests passed.
- Command: `npm run type-check` — passed.

## T009–T010 — US1 gate evidence

- Added the client-side `SessionAwareAppShell`, moved the existing sidebar inside the gate, changed `/` to redirect to `/Home`, removed the eager bootstrap and added the public onboarding route.
- Command: `npm run test -- --reporter=dot tests/app/session-aware-app-shell.test.tsx` — 3 tests passed.
- Command: `npm run test:browser -- tests/browser/profile-session-gate.spec.ts` — 1 browser test passed; direct `/pacientes` navigation reached `/Home` without a visible navigation landmark.

## T011–T012 — US2 onboarding evidence

- Added the molecule dialog and onboarding organism with exactly Nome/Telefone, required-name feedback, loading/disabled states, keyboard-safe Radix dialog focus handling and live error/status regions.
- Command: `npm run test -- --reporter=dot tests/components/organisms/profile-onboarding.test.tsx` — 4 tests passed.
- Command: `npm run type-check` — passed after the UI integration.

## T013–T014 — US3 load evidence

- Added Playwright file-system fakes and valid/invalid load scenarios, including a `localhost` origin variant; load validates before creating a candidate runtime and imports the complete envelope through the existing transactional repository.
- First browser run: create and valid load passed; invalid assertion was corrected to target the product's actionable application-mismatch message.
- Command: `npm run test:browser -- tests/browser/profile-save-load.spec.ts` — 3 tests passed, including create, portable load from `localhost:3100` and invalid-file preservation.

## T015–T017 — US4 synchronization and host boundary

- Added `createConfirmedOperationCoordinator` and connected it to patient, clinical, library and confirmed-diet mutations. Draft autosave, flush, discard, pull and keystroke paths remain outside the coordinator.
- Converted the listed legacy adapters and storage facade to explicit ephemeral memory compatibility; `/presets` no longer reads or writes a host store. The active sidebar now renders the profile file sync state and account display name.
- Command: `npm run test -- --reporter=dot tests/lib/application/confirmed-operation.test.ts tests/architecture/host-persistence-boundary.test.ts tests/architecture/library-legacy-boundary.test.ts tests/lib/patients/legacy-cutover.test.ts tests/lib/diets/legacy-cutover.test.ts tests/app/receitas/recipes-page.test.tsx src/lib/__tests__/patientsStore.test.ts` — 7 files and 17 tests passed.
- Command: `npm run test:browser -- tests/browser/profile-save-load.spec.ts` — 3 browser tests passed in 52.7s.
- Command: `npm run type-check` — passed after the coordinator and host-boundary changes.

## T018 — Design system and accessibility review

- Read and applied the canonical design-system skill, categories for actions, fields, overlays, feedback, loading and structure, plus the button, input, dialog, form-field and sidebar profiles.
- Added catalog profiles/registry entries for `ProfileCreateDialog` and `ProfileOnboarding`, and documented the sidebar sync-status prop without changing `src/components/ui` primitives.
- Command: `npm run verify:design-system -- --strict` — 40 current source files covered, 0 uncovered public visual exports, 11 categories homologated and 0 blocking findings.
- Command: `npm run test -- --reporter=dot tests/components/organisms/profile-onboarding.test.tsx tests/app/session-aware-app-shell.test.tsx tests/components/organisms/sidebar-nav.test.tsx` — 3 files and 16 tests passed.

## T019 — Quickstart and final validation

- Executed the required quickstart commands and recorded the evidence in `quickstart.md`.
- `npm run lint` — passed.
- `npm run type-check` — passed after narrowing the optional IndexedDB database name in `tests/browser/diet-offline-persistence.spec.ts`.
- `npm run test` — 228 test files and 829 tests passed.
- `npm run test:browser` — 15 scenarios passed in 4.4 minutes. The browser fixtures were aligned with the new session gate and memory-only contract; archived patient verification returns through browser history because the active list intentionally excludes archived patients.
- `npm run build` — passed with `NODE_OPTIONS=--max-old-space-size=4096`; Next.js 15.5.22 generated the application routes. A first attempt ended with the generic Windows worker code `4294967295` during type validation; the retry passed and standalone `npm run type-check` is green.
- `npm run verify:design-system -- --strict` — passed with 40 current source files covered, 0 uncovered public visual exports and 0 blocking findings.
- `npm run verify:design-system-legacy -- --strict` — passed with 0 legacy findings across 295 files.
- Manual converge pass: rechecked `spec.md`, `plan.md`, `tasks.md`, implementation coverage, host-persistence boundary and validation outputs; no residual required work was found, so no new task was appended.

## Post-implementation requirement — retomada do save ativo (2026-09-13)

- Persisted only the selected browser file handle in `nutridiet-profile-session-v1` IndexedDB, plus non-clinical filename metadata in localStorage; no profile, envelope, draft or runtime data is stored there.
- Added automatic same-origin hydration before the route gate redirects, read-permission probing, explicit “Reabrir último save” recovery when a browser gesture is required, and stale-file cleanup.
- Updated the save-file port, browser adapter, profile-session contract, onboarding profile and SDD artifacts to reflect the new behavior.
- Validation: `npm run lint`, `npm run type-check` and `npm run build` passed. Browser/test suites were not executed per the active implementation instruction.
