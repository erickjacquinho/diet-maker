# Quickstart: Validate Sidebar Shadcn Migration

## Prerequisites

- Node.js and the repository package dependencies installed.
- Working directory: `C:\Programmer\diet-maker`.
- Feature source remains under `src/components/`; no route or data migration is required.

## Static and type validation

Run:

```powershell
npm run type-check
npm run lint
npm run audit:atomic-design
npm run verify:design-system
npm run verify:design-system-legacy
```

Expected outcomes:

- TypeScript and lint complete without new findings.
- Atomic dependency audit reports no upward molecule/organism dependency.
- Component catalog reports the new UI primitive sources and updated `SidebarNav` metadata.
- Legacy audit reports zero non-exempt findings.

## Focused behavior tests

Run:

```powershell
npm test -- tests/components/organisms/sidebar-nav.test.tsx tests/components/templates/app-layout-shell.test.tsx
```

The focused suite must cover:

1. all six current first-level `href` values and existing route matching;
2. `aria-current` for exact, nested, patient-prefix, and unmatched routes;
3. expanded/collapsed presentation, 224/64 width variables, visible focus, and tooltip names;
4. pointer, Enter, and Space activation of the visible toggle;
5. preserved NutriDiet brand, profile, Save/Open labels, callbacks, and no-op-safe absent callbacks;
6. a representative future group fixture with disclosure semantics, active ancestor, child links, and collapsed discoverability;
7. Ctrl+B/Cmd+B non-activation and absence of new persistence;
8. `AppLayoutShell` main scroll-region ownership and no direct page import of `src/components/ui/sidebar`.

## Manual desktop acceptance

At a viewport of at least 1024px:

1. Open the app on each current route and confirm the route list remains flat and ordered as documented.
2. Toggle the sidebar with the visible control and confirm the main region remains visible and scrollable.
3. In collapsed mode, inspect every icon’s accessible name and tooltip.
4. Confirm brand, profile, Save, and Open retain labels and relative placement.
5. Confirm pressing Ctrl+B/Cmd+B does not toggle the sidebar in this delivery.

## Traceability

- Navigation model and invariants: [data-model.md](./data-model.md)
- Product and primitive API: [contracts/sidebar-navigation.md](./contracts/sidebar-navigation.md)
- Functional requirements and acceptance scenarios: [spec.md](./spec.md)
