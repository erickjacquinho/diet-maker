# Research: Sidebar Shadcn Migration

**Feature**: `05-08-26-migrar-sidebar-shadcn-submenus`
**Date**: 2026-08-05

## Decision 1 — Use the local Radix-based Shadcn Sidebar as the primitive base

**Decision**: Use the official `sidebar` source as the basis for a local `src/components/ui/sidebar.tsx`, preserving the project’s existing Radix base, aliases, Lucide icons, Tailwind v3 setup, and `cn` utility. Add the official `collapsible` primitive locally for future submenu disclosure behavior, but omit the generated mobile-only `use-mobile` and skeleton pieces because the product contract is desktop-only.

**Rationale**:

- `npx shadcn@latest info --json` confirms `base: radix`, `tailwindVersion: v3`, alias `@/components/ui`, and Lucide icons.
- The official Sidebar composition supplies `SidebarProvider`, `Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarFooter`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarMenuSub`, `SidebarMenuSubItem`, and `useSidebar`.
- The local primitive keeps the desktop composition API and omits the unused mobile drawer path so it cannot introduce unsupported product behavior below the desktop contract.
- The existing `SidebarNav` can remain the product-facing organism while the generic primitive stays isolated in `src/components/ui`.

**Alternatives considered**:

- Keep the custom `<aside>` implementation: rejected because it does not provide the Shadcn composition contract or future submenu primitives.
- Put product rules into `src/components/ui/sidebar.tsx`: rejected by the Shadcn preservation rule and Atomic Design boundaries.
- Use a different base library: rejected because the project is already standardized on Radix-based Shadcn components.

**Sources**: [official Sidebar documentation](https://ui.shadcn.com/docs/components/radix/sidebar), `components.json`, `package.json`, `.agents/rules/shadcn-preservation.md`.

## Decision 2 — Keep `SidebarProvider` inside the product organism

**Decision**: `SidebarNav` owns the internal `SidebarProvider` and renders the Shadcn `Sidebar` beneath it. `AppLayoutShell` continues to consume `SidebarNav` as its sidebar slot and keeps ownership of the main scroll region.

**Rationale**:

- Preserves the existing public `SidebarNavProps.initialCollapsed` contract without moving sidebar state into the template.
- Keeps generic Shadcn context out of pages and keeps product behavior in the organism.
- Avoids introducing a second independent state source: the compatibility `useSidebarContext` hook will project state from Shadcn’s `useSidebar` rather than store its own state.

**Alternatives considered**:

- Move `SidebarProvider` to `AppLayoutShell`: rejected for this migration because it would widen the template API and move the existing initial-state contract upward.
- Keep the custom React context as the source of truth: rejected because it would duplicate Shadcn state and allow divergence.

## Decision 3 — Preserve the production flat route topology

**Decision**: The default navigation model contains all six current destinations as first-level route items. The model and renderer also accept future parent/child groups, but no current route is placed inside a visible submenu in this delivery.

**Rationale**:

- Implements the user’s clarification Q1 = C.
- Preserves URLs, route order, and current visual organization.
- Makes future submenu support testable with a representative fixture without committing product information architecture prematurely.

**Alternatives considered**:

- Add a “Biblioteca” group now: rejected by the clarified scope.
- Add patient subgroups now: rejected by the clarified scope and route-preservation priority.

## Decision 4 — Make persistence and keyboard shortcuts opt-in at the primitive boundary

**Decision**: The local `SidebarProvider` adaptation will not write cookies or local storage by default and will register no Ctrl+B/Cmd+B listener unless an explicit generic shortcut option is provided. `SidebarNav` will not enable that option in this delivery.

**Rationale**:

- The official provider source writes a `sidebar_state` cookie and registers Ctrl+B/Cmd+B by default; both conflict with the clarified scope and NFR-005.
- A generic opt-in boundary preserves future extensibility without embedding NutriDiet rules in the primitive.
- `initialCollapsed` remains an initial presentation input only.

**Alternatives considered**:

- Use the generated provider unchanged: rejected because it would silently introduce persistence and an active global shortcut.
- Remove all future shortcut seams: rejected because the user wants the migration to remain technically ready for later activation.

## Decision 5 — Use the existing design tokens rather than generated Shadcn colors

**Decision**: Map Sidebar primitive color roles to the NutriDiet semantic tokens in Tailwind and add only the missing component-level width aliases for 224px expanded and 64px collapsed. Do not introduce the generated dark-theme palette or raw HSL color variables.

**Rationale**:

- The design system defines a single light theme, semantic surface/text/border/action tokens, and fixed sidebar geometry.
- The generated Sidebar CSS variables use a separate HSL palette and would create a second visual source of truth.
- Width aliases are component decisions required by the Shadcn CSS-variable API and do not alter the navigation category contract.

**Alternatives considered**:

- Keep generated `--sidebar-*` colors: rejected because they would bypass the canonical tokens and introduce dark-mode scaffolding.
- Keep raw `14rem`/`4rem` values in the organism: rejected by the design-system token policy.

## Decision 6 — Repair existing molecule reexports during composition migration

**Decision**: Convert the four sidebar molecule files from upward reexports into real molecule implementations that depend only on permitted lower layers and generic UI primitives. `SidebarNav` will compose those molecules and preserve the existing compound exports.

**Rationale**:

- The architecture documents already mark these files as `migration-required` because molecule → organism reexports invert the dependency direction.
- This change preserves public names while making the new composition structurally compliant.
- The organism remains the owner of section state; molecule components receive presentation state or project a lower-level sidebar context without owning independent state.

**Alternatives considered**:

- Preserve upward reexports: rejected because the new migration would carry forward a known architectural violation.
- Promote all four molecules into organisms: rejected because each remains a single, bounded task and the design-system target layer is molecule.

## CLI safety finding

`npx shadcn@latest add sidebar --dry-run` reports five existing UI files that would be overwritten (`button`, `separator`, `sheet`, `tooltip`, and `input`) plus new `use-mobile`, `skeleton`, and `sidebar` files. The implementation plan therefore requires diff review and selective source adoption: only the desktop-relevant `sidebar` source is retained, and no unreviewed overwrite is allowed. `npx shadcn@latest add collapsible --dry-run` reports one new primitive and one Radix dependency.
