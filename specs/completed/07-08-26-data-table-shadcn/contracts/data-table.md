# DataTable UI Contract

**Feature**: [spec.md](../spec.md)

## Contract

`DataTable<TData>` is a domain-agnostic molecule that composes the canonical `Table`, `TableCaption`, `TableHeader`, `TableHead`, `TableBody`, `TableRow` and `TableCell` primitives. It must not import application domain types or own navigation, storage or business mutations.

## Required behavior

1. Render an accessible caption and table label.
2. Render column headers with `scope="col"`; sortable headers are keyboard-operable buttons with an accessible name and sort state.
3. Render typed cells using stable row IDs.
4. Render a single full-width empty row when `data` is empty and no error/loading state takes precedence.
5. Render loading and error states with an accessible announcement and no misleading data values.
6. Preserve `hover`, `pressed`, `focus-visible`, `selected` where applicable, and read-only behavior using canonical tokens.
7. Support controlled single-column sorting and client-side pagination without an external table library.
8. Allow a consumer-provided row renderer for complex rows and an expanded-row renderer for associated details.
9. Keep inner links and buttons independent from row-level actions.

## Non-goals

- Domain-specific columns or labels.
- Server-side data fetching.
- Selection, virtualization, column hiding, drag-and-drop or multi-sort not required by current consumers.
- Changes to the canonical `src/components/ui/table.tsx` primitive.

## Accessibility contract

- Use semantic table markup, caption, column scopes and explicit units.
- Use `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background` for focusable controls.
- Do not use color as the only signal for sort, status, presence or error.
- Respect the desktop scope and WCAG 2.2 AA requirements from the canonical Design System.
