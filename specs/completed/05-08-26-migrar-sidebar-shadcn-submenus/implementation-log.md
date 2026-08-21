# Implementation Log: Sidebar Shadcn Migration

## Preflight

- Feature directory: `specs/05-08-26-migrar-sidebar-shadcn-submenus/`.
- Checkpoint: `a67bbd5 chore(sidebar): checkpoint before migrating sidebar`.
- Preflight prerequisites passed with all design artifacts and tasks available.
- Checklists: `requirements.md` and `navigation.md` passed with no incomplete items.
- `npx shadcn@latest info --json` confirmed Next.js 15, TypeScript, Tailwind v3, Radix base, `@/components/ui`, and Lucide.
- Shadcn dry-runs confirmed `collapsible.tsx` is one new source plus `@radix-ui/react-collapsible`; `sidebar` would overwrite five existing UI files and add unsupported mobile sources, so adoption remains selective.

## Validation cycles

### T002 — dependency installation

- Hypothesis: the dependency can be added without changing unrelated versions.
- Command: `npm install @radix-ui/react-collapsible@^1.1.12 --save-exact=false --package-lock-only`
- Result: blocked by the pre-existing peer conflict between `eslint@8.57.1` and `eslint-config-next@16.3.0` requiring ESLint `>=9.0.0`.
- Classification: environment/dependency configuration.
- Next action: retry with `--legacy-peer-deps`, which bypasses the unrelated peer-resolution conflict while preserving declared versions.
- Retry: `npm install @radix-ui/react-collapsible@^1.1.12 --save-exact=false --package-lock-only --legacy-peer-deps`.
- Retry result: passed; `package.json` and `package-lock.json` contain only the `@radix-ui/react-collapsible` addition.

### T003/T004 — primitive and token setup

- `src/components/ui/collapsible.tsx` was added from the Shadcn/Radix source reviewed by dry-run and `--view`.
- Sidebar component tokens were added for the canonical 224px/64px widths and light semantic color roles; Tailwind maps the roles to those tokens without dark-mode variables.
- `npm run type-check`: passed after installing the dependency locally.
- `git diff --check`: passed.

### T006/T007/T008 — contract tests and navigation model

- Initial focused run was red because `sidebar.tsx` and `sidebar-navigation-model.ts` did not yet exist, with no test execution beyond import resolution.
- `npm test -- tests/components/organisms/sidebar-navigation-model.test.ts`: passed; 4 tests.
- The model preserves the six flat routes, segment-safe prefix matching, patient-prefix matching, empty-group omission, and active ancestor derivation.

### T005/T006 — Shadcn Sidebar primitive

- `src/components/ui/sidebar.tsx` now exposes the provider, sidebar slots, menu/submenu composition, trigger, and context projection.
- Persistence and the Ctrl+B/Cmd+B listener are opt-in (`persist`/`shortcutKey`); current product usage will not enable either.
- `npm run type-check`: passed.
- `npm test -- tests/components/ui/sidebar.test.tsx`: passed; 5 tests covering controlled/uncontrolled state, width aliases, no default persistence, and no default shortcut listener.

### T009/T010/T012/T015/T016/T017 — User Story 1 MVP

- The first preservation run identified missing current-route semantics, collapsed Shadcn state projection, and a null pathname edge case outside a Next router.
- `SidebarNav` now owns the single Shadcn provider state, composes header/content/footer slots, keeps `AppLayoutShell` as the main scroll owner, and exposes `navigationItems` without changing the default flat topology.
- `SidebarNavItem` now renders real links through `SidebarMenuButton`, sets `aria-current="page"`, and retains collapsed accessible labels/tooltips.
- `npm run type-check`: passed.
- `npm test -- tests/components/organisms/sidebar-nav.test.tsx tests/components/templates/app-layout-shell.test.tsx`: passed; 10 tests.
- `npm test -- tests/components/architecture/layer-boundaries.test.ts tests/components/molecules/composition.test.ts`: passed; 5 tests.
- The focused User Story 1 checkpoint is green.

### T018/T019/T020/T021 — User Story 2 future groups

- The first future-group run was red because group items were intentionally not yet rendered by `SidebarNav`.
- `SidebarNav` now renders non-empty groups with Radix `Collapsible`, Shadcn submenu parts, active ancestor derivation, and `aria-expanded` disclosure state.
- Collapsed groups use the existing Radix Popover portal so child links remain reachable by keyboard without changing the production default topology.
- `npm run type-check`: passed.
- `npm test -- tests/components/organisms/sidebar-nav-submenus.test.tsx`: passed; 4 tests.
- The active child opens its ancestor for discoverability; empty groups remain absent and `DEFAULT_NAVIGATION_ITEMS` remains six first-level routes.

### T022/T023/T024/T025 — User Story 3 shortcut readiness

- `SidebarNav` keeps the visible product toggle as the sole active control and exposes it through `useSidebarContext` for a future adapter.
- `SidebarProvider` supports explicit `shortcutKey` and `persist` options; the product wrapper passes neither, so Ctrl+B/Cmd+B and persistence remain inactive.
- Editable-target protection was verified for an explicit future shortcut adapter.
- `npm run type-check`: passed.
- `npm test -- tests/components/organisms/sidebar-nav-shortcut.test.tsx`: passed; 4 tests.
- The combined sidebar regression suite passed; 4 files and 19 tests.

### T026/T027/T028/T029 — Design System synchronization

- Added documented UI profiles for `ui-sidebar` and `ui-collapsible`, including generic boundaries, states, focus behavior, lifecycle and acceptance criteria.
- Updated the organism and four molecule profiles with the implemented composition, public contracts, primitive-base decisions, flat default topology and migration status.
- Updated `registry.json` with both UI families, `ui-sidebar` as the organism base, direct consumers and `SidebarContextValue` coverage. The registry verifier reports 40 current source files covered, 0 uncovered public visual exports and 0 blocking findings.
- Updated the navigation category, human registry summary and implementation/compliance evidence. The docs explicitly separate structural evidence from unverified visual conformity.
- Prerequisite check: `.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks` passed for this feature.

### T030 — Review and static validation

- `npm run type-check` — passed.
- `npm run lint` — passed.
- `npm run verify:design-system-legacy` — 0 findings across 94 files.
- First `npm run audit:atomic-design` run found one inline-style finding at the provider token bridge; the provider now uses Tailwind arbitrary-property classes, and the rerun reports 74/74 files conforming, 0 violations and 100% compliance.

### T031 — Catalog and Vitest validation

- `npm run verify:design-system` — 40 current source files covered, 0 uncovered public visual exports and 0 blocking findings.
- Consolidated focused run — 8 files and 32 tests passed.
- Full `npm test` — 75 files and 286 tests passed. The first full run exposed only stale catalog count assertions; updating them from 56/60 to 58/62 made the rerun green. A final rerun after the hook error-guard hardening also passed with 75/286.

### T032 — Manual desktop acceptance

- `npm run build` — passed; production server started on port 3124 for browser validation.
- `python C:\Users\Jacques\Skills\webapp-testing\scripts\with_server.py --server "npm run start -- -p 3124 -H 127.0.0.1" --port 3124 -- python specs/05-08-26-migrar-sidebar-shadcn-submenus/manual_acceptance.py` — passed.
- Evidence: viewport 1280x800; six production route hrefs preserved in documented order; rail measured 224px expanded and 64px collapsed; six collapsed route links kept accessible names; visible toggle returned to expanded; `/presets` retained `aria-current`; main shell scroll owner remained present; Control+B and Meta+B did not change the expanded state.

## Preserved concurrent worktree state

- The existing dirty submodule `.agents/skills_link/ui-ux-pro-max` was not changed.
- Concurrent changes in `.audit-report.json`, `.audit-report.md`, and `specs/05-08-26-unificar-superficies-atomic/` were preserved outside this feature scope.
