# Implementation Log: Adequação da Sidebar ao Design System

**Feature**: `06-08-26-adequar-sidebar-design-system`
**Started**: 2026-08-06
**Checkpoint**: `b9afd47` — `chore(sidebar): checkpoint before implementing design system fixes`

## T001 — Navigation fixtures

- **Status**: completed
- **Files**: `tests/components/organisms/sidebar-navigation-fixtures.ts`
- **Change**: Added the six production routes, nested patient pathname, future group fixture and empty group fixture required by the data model.
- **Verification**: `npm run type-check` — passed.

## T002 — Canonical token mapping

- **Status**: completed
- **Files**: `src/design-system/tokens.css`, `tailwind.config.js`
- **Change**: Verified that the existing component, semantic color, sidebar width and motion aliases already map to the canonical Design System values; no new token was necessary.
- **Verification**: `npm run verify:design-system` — passed with 0 blocking findings.

## T003 — Visual/UX delta audit

- **Status**: completed
- **Files reviewed**: `src/components/ui/sidebar.tsx`, `src/components/organisms/SidebarNav.tsx`, sidebar molecules, `design-system/components/categories/navigation.md`.
- **Required deltas**: rail border-divider; canonical 224/64/36px geometry; icon-16; typography roles; complete collapsed labels; visible focus/offset; reduced motion for rail/chevron/tooltip/popover; honest profile/actions; skip link; route ownership in the app adapter.
- **UX evidence**: the UI Pro Max Next.js search returned the high-severity guidance to use real `next/link` links for internal navigation; existing navigation is link-based and the implementation must preserve that contract.
- **Verification**: visual delta list reconciled with `spec.md`/`navigation.md` and recorded for manual acceptance.

## T004–T006 — Contract tests (red baseline)

- **Status**: completed — failing tests intentionally captured before implementation.
- **Files**: `tests/components/organisms/sidebar-navigation-model.test.ts`, `tests/components/app/sidebar-navigation-adapter.test.tsx`, `tests/components/ui/sidebar.test.tsx`
- **Verification**: `npm run test -- tests/components/organisms/sidebar-navigation-model.test.ts tests/components/app/sidebar-navigation-adapter.test.tsx tests/components/ui/sidebar.test.tsx` — red as expected: missing `validateSidebarNavigationItems`, missing adapter module, and missing rail/motion/submenu classes.
- **Next correction**: implement the model validator, generic primitive contract and application adapter in their respective tasks.

## T007 — Navigation model invariants

- **Status**: completed
- **Files**: `src/components/organisms/sidebar-navigation-model.ts`, `tests/components/organisms/sidebar-navigation-model.test.ts`
- **Change**: Added deterministic validation for non-empty labels/IDs, absolute hrefs, non-empty groups and duplicate destinations while preserving route matching and empty-group rendering rules.
- **Verification**: `npx vitest run --pool=forks --maxWorkers=1 tests/components/organisms/sidebar-navigation-model.test.ts` — 5 tests passed.
- **Environment note**: the package test command timed out at 124s under the default 16-worker pool; a single-worker fork run passed. An attempted `--minWorkers` option was rejected by Vitest 4 and was not retained.

## T008–T009 — Sidebar conformance tests (red baseline)

- **Status**: completed — failing tests intentionally captured before the visual and adapter corrections.
- **Files**: `tests/components/organisms/sidebar-nav-conformance.test.tsx`, `tests/components/organisms/sidebar-nav.test.tsx`
- **Verification**: `npx vitest run --pool=forks --maxWorkers=1 tests/components/organisms/sidebar-nav-conformance.test.tsx tests/components/organisms/sidebar-nav.test.tsx` — red as expected for missing rail/reduced-motion classes, collapsed brand name, canonical submenu height and prop-driven route matching.

## T010 — Generic sidebar primitive correction

- **Status**: completed
- **Files**: `src/components/ui/sidebar.tsx`
- **Change**: Added the canonical left rail border, reduced-motion fallback, canonical 36px submenu height, tokenized submenu padding and motion-safe menu/submenu transitions without adding product data to the primitive.
- **Verification**: `npx vitest run --pool=forks --maxWorkers=1 tests/components/ui/sidebar.test.tsx` — 6 tests passed.

## T011 — Sidebar brand conformance

- **Status**: completed
- **Files**: `src/components/molecules/SidebarBrand.tsx`
- **Change**: Replaced ad-hoc spacing and sizes with canonical control/typography aliases, added explicit 16px icon sizing and preserved the complete product identity as the collapsed brand accessible name.
- **Verification**: `npx vitest run --pool=forks --maxWorkers=1 tests/components/organisms/sidebar-nav-conformance.test.tsx tests/components/ui/sidebar.test.tsx` — passed.

## T012 — Sidebar route item conformance

- **Status**: completed
- **Files**: `src/components/molecules/SidebarNavItem.tsx`
- **Change**: Removed route-context ownership from the molecule, kept real `next/link` navigation, added explicit current-page semantics, canonical 36px control sizing, 16px icons and complete collapsed labels/tooltips.
- **Verification**: `npx vitest run --pool=forks --maxWorkers=1 tests/components/organisms/sidebar-nav.test.tsx tests/components/organisms/sidebar-nav-conformance.test.tsx` — passed.

## T013 — Prop-driven SidebarNav organism

- **Status**: completed
- **Files**: `src/components/organisms/SidebarNav.tsx`
- **Change**: Made `pathname` and `navigationItems` required inputs, removed `usePathname` and the production default from the organism, preserved the compound API, and applied canonical icon/motion classes to flat and grouped routes.
- **Verification**: `npx vitest run --pool=forks --maxWorkers=1 tests/components/organisms/sidebar-nav.test.tsx tests/components/organisms/sidebar-nav-conformance.test.tsx tests/components/ui/sidebar.test.tsx` — 16 tests passed. The adapter import remains intentionally red until T024/T025.
