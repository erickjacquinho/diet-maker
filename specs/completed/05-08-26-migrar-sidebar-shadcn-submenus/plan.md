# Implementation Plan: Migração da Sidebar para Shadcn com Submenus Futuros

**Branch**: `05-08-26-migrar-sidebar-shadcn-submenus` | **Date**: 2026-08-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/05-08-26-migrar-sidebar-shadcn-submenus/spec.md`

## Summary

Migrate the product-owned `SidebarNav` organism from its custom `<aside>` implementation to the local Radix-based Shadcn `Sidebar` primitive while preserving the current flat route list, brand, collapsed/expanded behavior, current-route semantics, tooltips, profile, quick actions, public exports, and `AppLayoutShell` integration. The implementation will add a data-driven navigation contract capable of representing future submenu groups, but the production hierarchy remains flat in this delivery. The primitive will be adapted to avoid cookie persistence and inactive Ctrl+B/Cmd+B shortcuts by default, and the existing sidebar molecule reexports will be repaired into lower-layer implementations.

## Technical Context

**Language/Version**: TypeScript 5.7, React 19, TSX, Next.js 15 App Router.

**Primary Dependencies**: Local desktop-oriented Radix-based Shadcn source, `@radix-ui/react-slot`, `@radix-ui/react-collapsible`, existing Radix primitives, `class-variance-authority`, `lucide-react`, `next/link`, and `next/navigation`.

**Storage**: N/A for the sidebar state. `initialCollapsed` is in-memory only; no cookie, local storage, route, file, API, or nutrition-domain persistence is introduced.

**Testing**: Vitest 4 with Testing Library/JSDOM for component behavior and deterministic contract tests; existing `npm run type-check`, `npm run audit:atomic-design`, `npm run verify:design-system`, `npm run verify:design-system-legacy`, and `npm run lint` gates.

**Target Platform**: Web desktop at `>=1024px`, one light theme, persistent left sidebar, current main-content scroll region.

**Project Type**: Next.js desktop web application with Atomic Design component organization.

**Performance Goals**: Sidebar toggle and route-state updates remain synchronous UI interactions with no new network or storage work; submenu fixtures must not add work proportional to unrelated page content.

**Constraints**: Preserve all existing route URLs and public `SidebarNav` exports; keep product behavior in `src/components/organisms` and molecule children; keep `src/components/ui` generic; use semantic design tokens; do not add mobile/tablet/dark-mode behavior, new pages, route changes, or data changes; do not activate Ctrl+B/Cmd+B in this delivery.

**Scale/Scope**: One persistent sidebar, six current first-level destinations, one `AppLayoutShell` consumer, one future-capable discriminated navigation model, four sidebar molecule children, and deterministic tests for current and representative future-group states.

## Constitution Check

*GATE: Must pass before Phase 0 research and re-check after Phase 1 design.*

| Principle | Gate | Plan evidence |
|---|---|---|
| I. Atomic Design Architecture | PASS | `SidebarNav` remains an organism; four molecule files become lower-layer implementations; the Shadcn source remains under `src/components/ui`; no page imports the generic primitive. |
| II. Canonical Design System | PASS | Navigation category geometry, states, tokens, focus, overflow, and light desktop scope are used; generated Shadcn colors are mapped to existing semantic tokens. |
| III. Desktop Scope and Accessibility | PASS | The supported target is `>=1024px`; route links, `aria-current`, submenu disclosure semantics, accessible collapsed labels, keyboard operation, and visible focus are explicit. |
| IV. Test-First Quality and Isolation | PASS | Tests precede implementation tasks for route state, collapse, future groups, shortcut non-activation, callbacks, tooltips, and shell integration; tests remain deterministic under `tests/`. |
| V. Spec-Driven Execution | PASS | This plan, its design artifacts, and the ordered tasks are the only implementation authority; execution is deferred to `/speckit-implement`. |

No constitution violation requires a complexity exception.

## Design Decisions

### State ownership and provider placement

`SidebarNav` will render the internal `SidebarProvider` and pass `defaultOpen={!initialCollapsed}`. The provider will be sized as a sidebar-only child of the current shell, while `AppLayoutShell` keeps its existing flex/main scroll contract. The organism will project Shadcn state through the compatibility `useSidebarContext` hook without creating a second state source.

The local provider adaptation will expose generic opt-in controls for persistence and keyboard shortcut registration, both disabled by default. The product wrapper will not pass a shortcut key in this feature.

### Navigation model

The organism will use a discriminated `SidebarNavigationItem` union:

- `route`: `href`, `label`, `icon`, and route-match behavior;
- `group`: stable `id`, `label`, optional `icon`, child `route` items, and disclosure defaults.

`DEFAULT_NAVIGATION_ITEMS` contains the current six `route` items in their existing order. A future group fixture can exercise `SidebarMenuSub` and `Collapsible` without changing current production route placement.

### Shadcn composition

The product composition will use `SidebarHeader` for brand, `SidebarContent` for the navigation landmark and menu, and `SidebarFooter` for profile and quick actions. Route links use `SidebarMenuButton asChild` with `isActive`; future groups use `Collapsible`, `SidebarMenuSub`, and `SidebarMenuSubButton`. When the sidebar is collapsed, future group children use a keyboard-operable popover/sub-navigation surface rather than becoming unreachable; leaf items continue to use the primitive tooltip contract.

`SidebarInset` is not introduced because the existing `AppLayoutShell` already owns a separate `main` scroll region and the feature explicitly excludes a generic shell replacement.

### Visual and geometry mapping

The primitive will consume existing semantic colors and design-system text/geometry classes. New component aliases will expose the canonical widths through tokens, not raw values in product TSX. The product wrapper will enforce:

- expanded width: `var(--cmp-sidebar-width-expanded)` = 224px;
- collapsed width: `var(--cmp-sidebar-width-collapsed)` = 64px;
- navigation item height: the category control height and `textStyle('nav-item')` equivalent;
- no default rail shadow, pill radius, undocumented border, mobile breakpoint, or dark theme.

### Public API compatibility

Existing `SidebarNavProps`, `SidebarBrandProps`, `SidebarNavItemProps`, `SidebarUserProfileProps`, `SidebarQuickActionsProps`, `useSidebarContext`, `SidebarNavComponent`, and `SidebarNav` remain available. An optional `navigationItems` prop may be added as a backward-compatible product model input, defaulting to the unchanged flat list. Existing molecule module paths remain valid and become real implementations rather than organism reexports.

## Implementation Phases

### Phase 0 — Source and primitive preparation

1. Review the official Shadcn `sidebar` and `collapsible` sources against the project’s existing UI primitives; do not overwrite existing files without a per-file diff decision.
2. Add or adapt only the required generic primitives and dependencies.
3. Add sidebar width component tokens and map the primitive color roles to the existing light semantic token system.

### Phase 1 — Product composition and compatibility

1. Extract the existing four sidebar child implementations into their molecule files without changing public labels, callbacks, or accessible names.
2. Refactor `SidebarNav` to compose `SidebarProvider`, `Sidebar`, the header/content/footer slots, and the data-driven navigation renderer.
3. Preserve route matching, `aria-current`, `initialCollapsed`, tooltip behavior, profile, save/open actions, and shell structure.
4. Add future group rendering and collapsed-state discoverability without adding a visible group to the default navigation.
5. Keep shortcut registration disabled and preserve a future adapter seam.

### Phase 2 — Verification and catalog synchronization

1. Add deterministic component tests before implementation changes and make them pass.
2. Run type, lint, atomic, legacy design-system, component-catalog, and focused test gates.
3. Update the UI primitive profiles, `SidebarNav` profile, molecule profiles, registry, navigation category consumer list, and human registry summary to reflect source files, exports, primitive base, consumers, and lifecycle status.

## Project Structure

### Documentation (this feature)

```text
specs/05-08-26-migrar-sidebar-shadcn-submenus/
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── sidebar-navigation.md
├── checklists/
│   ├── requirements.md
│   └── navigation.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ui/
│   │   ├── sidebar.tsx          # generic desktop Shadcn Sidebar primitive
│   │   └── collapsible.tsx      # generic disclosure primitive for future groups
│   ├── molecules/
│   │   ├── SidebarBrand.tsx
│   │   ├── SidebarNavItem.tsx
│   │   ├── SidebarQuickActions.tsx
│   │   └── SidebarUserProfile.tsx
│   ├── organisms/
│   │   ├── SidebarNav.tsx
│   │   └── sidebar-navigation-model.ts
│   └── templates/
│       └── AppLayoutShell.tsx
├── app/
│   └── globals.css
└── design-system/
    └── tokens.css

tests/
└── components/
    ├── organisms/
    │   └── sidebar-nav.test.tsx
    └── templates/
        └── app-layout-shell.test.tsx

design-system/components/
├── registry.json
├── categories/navigation.md
├── profiles/ui/sidebar.md
├── profiles/ui/collapsible.md
├── profiles/organisms/sidebar-nav.md
└── profiles/molecules/sidebar-*.md
```

**Structure Decision**: Use the existing single Next.js project and its Atomic Design tree. Generic Shadcn/Radix source remains in `src/components/ui`; product composition remains in molecules and the `SidebarNav` organism; the template remains the shell integration boundary.

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Shadcn CLI overwrites existing `button`, `separator`, `sheet`, `tooltip`, or `input` files | Use dry-run/diff review and selective source adoption; preserve existing project APIs and tests. |
| Generated provider silently persists state or activates Ctrl/Cmd+B | Make both behaviors explicit opt-in and assert non-activation in tests. |
| Shadcn default 16rem/3rem geometry diverges from 224/64 | Use canonical component width tokens and assert both computed state classes/variables in focused tests. |
| Existing molecule reexports create a dependency cycle during refactor | Implement molecules first against lower layers, then make the organism compose them. |
| Active child semantics are lost when future groups are added | Centralize route matching and ancestor-active derivation in pure functions with fixture coverage. |
| Tooltip or future collapsed submenu is clipped | Keep the existing TooltipProvider/portal behavior and define popover placement and overflow requirements in the contract. |

## Constitution Re-check After Design

All five gates remain PASS after design. The only deliberate source adaptation is generic: optional persistence/shortcut controls and token mapping in the local Shadcn primitive. No product route, nutrition-domain data, page, or external integration is added.

## Complexity Tracking

No constitution violations or complexity exceptions are required.
