# Tasks: Migração da Sidebar para Shadcn com Submenus Futuros

**Input**: Design documents from `/specs/05-08-26-migrar-sidebar-shadcn-submenus/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/sidebar-navigation.md](./contracts/sidebar-navigation.md), [quickstart.md](./quickstart.md)

**Tests**: Required by FR-019 and the project constitution. Test tasks are placed before the implementation tasks they protect.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the local Shadcn source and token integration without overwriting existing project primitives.

- [x] T001 [skill: $shadcn] Review the Shadcn Sidebar and Collapsible dry-run/diff output and record the selective-adoption decisions in `specs/05-08-26-migrar-sidebar-shadcn-submenus/research.md`.
- [x] T002 [skill: $shadcn] Add the `@radix-ui/react-collapsible` dependency and update `package.json` plus `package-lock.json` without changing unrelated dependency versions.
- [x] T003 [skill: $shadcn] [P] Add the desktop-relevant generic Shadcn support source in `src/components/ui/collapsible.tsx`, preserving the project aliases and Radix base; do not add the generated mobile-only `use-mobile` or skeleton sources.
- [x] T004 [skill: $design-system] [P] Add canonical Sidebar width aliases to `src/design-system/tokens.css` and map Sidebar semantic color roles to existing tokens in `tailwind.config.js` without adding dark-mode palette variables.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the generic primitive boundary, navigation model, and failing contract tests before product composition changes.

**Checkpoint**: Generic primitives, token mapping, data shape, and baseline tests are ready before user-story implementation begins.

- [x] T005 [skill: $shadcn] Add the adapted generic Shadcn primitive in `src/components/ui/sidebar.tsx`, preserving the official composition API while making persistence and keyboard shortcut registration opt-in and disabled by default.
- [x] T006 [skill: $tdd] [P] Create the failing primitive contract tests in `tests/components/ui/sidebar.test.tsx` for controlled/uncontrolled state projection, 224/64 width variables, no cookie/local-storage writes, and no Ctrl+B/Cmd+B listener when no shortcut option is provided.
- [x] T007 [skill: $tdd] [P] Create the failing navigation-model tests in `tests/components/organisms/sidebar-navigation-model.test.ts` for route matching, patient-prefix matching, unmatched routes, flat defaults, empty groups, and active future ancestors.
- [x] T008 [skill: $frontend-architecture-mindset] Define `SidebarNavigationItem`, route/group invariants, `DEFAULT_NAVIGATION_ITEMS`, and pure route/ancestor helpers in `src/components/organisms/sidebar-navigation-model.ts` without changing the current default route order.

---

## Phase 3: User Story 1 - Preserve existing sidebar behavior (Priority: P1) 🎯 MVP

**Goal**: Replace the custom rail with the Shadcn-backed product organism while retaining every current route, identity element, action callback, presentation state, tooltip, public export, and shell behavior.

**Independent Test**: Render `SidebarNav` through the desktop shell on each current route, exercise expanded/collapsed presentation and visible toggle, and assert route URLs, current state, accessible names, callbacks, and main scroll ownership.

### Tests for User Story 1

- [x] T009 [skill: $tdd] [P] [US1] Write failing preservation tests in `tests/components/organisms/sidebar-nav.test.tsx` for all six first-level routes, exact/nested/patient current state, brand, profile, Save/Open callbacks, absent callbacks, accessible collapsed labels, and public compound parts.
- [x] T010 [skill: $tdd] [P] [US1] Write failing shell integration assertions in `tests/components/templates/app-layout-shell.test.tsx` for persistent SidebarNav placement, independent `main` scroll region, and no page-level import of `src/components/ui/sidebar.tsx`.

### Implementation for User Story 1

- [x] T011 [skill: $ui-styling] [P] [US1] Convert `src/components/molecules/SidebarBrand.tsx` from an organism reexport into a real lower-layer molecule that preserves NutriDiet labels, brand route, expanded/collapsed identity, tooltip, and toggle callback.
- [x] T012 [skill: $ui-styling] [P] [US1] Convert `src/components/molecules/SidebarNavItem.tsx` from an organism reexport into a real lower-layer molecule that uses real links, active route semantics, Shadcn `SidebarMenuButton`, and collapsed accessible labels.
- [x] T013 [skill: $ui-styling] [P] [US1] Convert `src/components/molecules/SidebarUserProfile.tsx` from an organism reexport into a real lower-layer molecule that preserves doctor name, role, avatar, and collapsed accessible information.
- [x] T014 [skill: $ui-styling] [P] [US1] Convert `src/components/molecules/SidebarQuickActions.tsx` from an organism reexport into a real lower-layer molecule that preserves Save/Open labels, icon-only names, optional callbacks, and tooltip behavior.
- [x] T015 [skill: $vercel-composition-patterns] [US1] Refactor `src/components/organisms/SidebarNav.tsx` to own the Shadcn `SidebarProvider`, `Sidebar`, header/content/footer composition, compatibility `useSidebarContext` projection, and `initialCollapsed` mapping while preserving all public exports.
- [x] T016 [skill: $frontend-architecture-mindset] [US1] Preserve the existing shell contract in `src/components/templates/AppLayoutShell.tsx`, changing only the minimum layout classes required for the SidebarProvider child to retain 224/64 geometry and the current main scroll region.
- [x] T017 [skill: $webapp-testing] [US1] Run and stabilize the focused User Story 1 tests in `tests/components/organisms/sidebar-nav.test.tsx` and `tests/components/templates/app-layout-shell.test.tsx` until all preservation assertions pass.

**Checkpoint**: The Shadcn-backed sidebar is an independently testable MVP with no route, label, callback, or shell regression.

---

## Phase 4: User Story 2 - Prepare future nested navigation groups (Priority: P2)

**Goal**: Support a typed parent/child navigation contract and accessible submenu composition without reorganizing the current production routes.

**Independent Test**: Supply a representative group fixture to `SidebarNav`, exercise disclosure in expanded and collapsed presentations, assert child/ancestor active semantics, and confirm the default production model remains flat.

### Tests for User Story 2

- [x] T018 [skill: $tdd] [P] [US2] Write failing future-group contract tests in `tests/components/organisms/sidebar-nav-submenus.test.tsx` for `aria-expanded`, keyboard disclosure, child links, active ancestor, empty-group omission, flat default routes, and collapsed keyboard-operable child discoverability.

### Implementation for User Story 2

- [x] T019 [skill: $vercel-composition-patterns] [US2] Add future group rendering to `src/components/organisms/SidebarNav.tsx` using `Collapsible`, `SidebarMenuSub`, `SidebarMenuSubItem`, and `SidebarMenuSubButton`, while keeping `DEFAULT_NAVIGATION_ITEMS` entirely first-level.
- [x] T020 [skill: $ui-styling] [US2] Add the collapsed future-group sub-navigation surface in `src/components/organisms/SidebarNav.tsx` using the existing Shadcn Popover primitive, with no child route hidden without an accessible path.
- [x] T021 [skill: $webapp-testing] [US2] Stabilize future-group semantics and default-flat behavior in `tests/components/organisms/sidebar-nav-submenus.test.tsx`, including deep child current state and no empty disclosure control.

**Checkpoint**: Future submenu capability is structurally ready and tested, but no current production route has moved into a visible group.

---

## Phase 5: User Story 3 - Prepare keyboard toggle integration (Priority: P3)

**Goal**: Keep a product-owned toggle seam available for a later Ctrl+B/Cmd+B adapter while leaving no global shortcut active now.

**Independent Test**: Confirm the visible toggle remains operable by pointer, Enter, and Space; Ctrl+B/Cmd+B does not toggle or interfere; and the product action is reusable by a future adapter.

### Tests for User Story 3

- [x] T022 [skill: $tdd] [P] [US3] Write failing shortcut-readiness tests in `tests/components/organisms/sidebar-nav-shortcut.test.tsx` for visible toggle keyboard activation, Ctrl+B/Cmd+B non-activation, editable-control boundaries, no persistence, and route preservation.

### Implementation for User Story 3

- [x] T023 [skill: $frontend-architecture-mindset] [US3] Expose and document the product-owned toggle action in `src/components/organisms/SidebarNav.tsx` through the Shadcn-backed state projection without enabling a global keyboard listener.
- [x] T024 [skill: $shadcn] [US3] Stabilize provider shortcut and persistence options in `src/components/ui/sidebar.tsx` so future opt-in activation can delegate to the same toggle action while current tests remain non-active.
- [x] T025 [skill: $webapp-testing] [US3] Stabilize the visible toggle focus and keyboard behavior in `tests/components/organisms/sidebar-nav-shortcut.test.tsx` and preserve route context across both presentation states.

**Checkpoint**: Keyboard shortcut readiness exists as an explicit seam, while the current product has no active Ctrl+B/Cmd+B behavior.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Synchronize the design-system catalog, run all validation gates, and close traceability gaps.

- [x] T026 [skill: $design-system] [P] Update `design-system/components/profiles/ui/sidebar.md` and `design-system/components/profiles/ui/collapsible.md` with primitive APIs, generic boundaries, state/focus behavior, and lifecycle status.
- [x] T027 [skill: $design-system] [P] Update `design-system/components/profiles/organisms/sidebar-nav.md` and the four `design-system/components/profiles/molecules/sidebar-*.md` files with the new composition, primitive base, real molecule sources, public exports, flat default topology, and migration status.
- [x] T028 [skill: $design-system] Update `design-system/components/registry.json` with `ui-sidebar`, `ui-collapsible`, updated `organism-sidebar-nav.primitiveBase`, source/export metadata, consumers, and the molecule implementation roles.
- [x] T029 [skill: $design-system] Update `design-system/components/categories/navigation.md`, `design-system/15-component-registry.md`, and `design-system/13-implementation-and-compliance.md` so category consumers, structural boundaries, and migration evidence match the implemented source without declaring unverified visual conformity.
- [x] T030 [skill: $code-reviewer-expert] [P] Run `npm run type-check`, `npm run lint`, `npm run audit:atomic-design`, and `npm run verify:design-system-legacy`, recording any findings against the changed files.
- [x] T031 [skill: $code-reviewer-expert] Run `npm run verify:design-system` and the focused/full Vitest suites from `specs/05-08-26-migrar-sidebar-shadcn-submenus/quickstart.md`, resolving every changed-file finding before completion.
- [x] T032 [skill: $webapp-testing] Run the manual desktop acceptance scenarios in `specs/05-08-26-migrar-sidebar-shadcn-submenus/quickstart.md` at `>=1024px` and record the final evidence for route continuity, 224/64 geometry, accessibility, no shortcut activation, and shell scroll behavior.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001–T004 can begin immediately; T003 and T004 are parallelizable.
- **Foundational (Phase 2)**: T005–T008 depend on setup; T006 and T007 are test-first and may run in parallel after the primitive/model boundaries are agreed.
- **User Story 1 (Phase 3)**: T009–T010 precede T011–T016; T015 depends on T003–T008 and T011–T014; T017 is the checkpoint.
- **User Story 2 (Phase 4)**: T018 precedes T019–T020; T019 depends on T005 and T008; T021 is the checkpoint.
- **User Story 3 (Phase 5)**: T022 precedes T023–T024; T024 depends on T005; T025 is the checkpoint.
- **Polish (Phase 6)**: T026–T029 depend on the completed composition; T030–T032 run after the relevant implementation and documentation changes.

### User Story Dependencies

- **US1 (P1)**: Depends on the foundational primitive/model work; this is the MVP and preserves current user value independently.
- **US2 (P2)**: Depends on US1’s SidebarNav composition and the foundational model; it does not change the default production route topology.
- **US3 (P3)**: Depends on US1’s state projection; it is independently testable because shortcut activation remains disabled.

### Parallel Opportunities

- T003 and T004 can run in parallel.
- T006 and T007 can run in parallel after setup.
- T009 and T010 can run in parallel.
- T011–T014 can run in parallel because they modify different molecule files.
- T026 and T027 can run in parallel; T028 must follow their source/export decisions.
- T030 can run in parallel with final documentation review after implementation files stabilize.

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational phases.
2. Complete US1 only through T017.
3. Stop and validate route continuity, current state, identity/actions, geometry, accessibility, and shell integration.
4. Proceed to US2 and US3 only after the MVP checkpoint is green.

### Incremental Delivery

1. Deliver US1 as the safe Shadcn migration with unchanged visible route organization.
2. Add US2’s future-capable hierarchy and fixture coverage without changing default routes.
3. Add US3’s explicit toggle seam without activating the global shortcut.
4. Finish catalog synchronization and all quickstart gates.

## Traceability Summary

| User story | Requirements covered | Primary files |
|---|---|---|
| US1 | FR-001–FR-007, FR-016, FR-018, NFR-001–NFR-005, SC-001–SC-002, SC-006 | `src/components/organisms/SidebarNav.tsx`, four sidebar molecules, `src/components/ui/sidebar.tsx`, `AppLayoutShell.tsx`, focused tests |
| US2 | FR-008–FR-012, FR-019, SC-003 | navigation model, `SidebarNav.tsx`, `collapsible.tsx`, submenu tests, contract/data-model docs |
| US3 | FR-013–FR-015, FR-019, SC-004 | `sidebar.tsx`, `SidebarNav.tsx`, shortcut tests, contract/quickstart docs |
| Polish | FR-017, FR-020, SC-005, NFR-001–NFR-005 | design-system registry/profiles/category docs and validation commands |

## Notes

- `[P]` tasks modify different files and have no incomplete dependency on another parallel task.
- All implementation tasks use exact repository paths and must be checked off only after their verification succeeds.
- No task authorizes route, page-content, nutrition-data, file-format, mobile, tablet, or dark-mode changes.
