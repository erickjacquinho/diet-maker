---
name: proj-table-adequation
description: Standardize any table in the project to the canonical DataTable molecule and Checkbox atom. Use when adapting, refactoring, or standardizing custom tables, list views, or selection grids to match design system tokens, sticky headers, and selection modes.
---

# Table Adequation & Standardization

This skill governs the adaptation of any table, tabular list, or selection grid across the codebase to the canonical `DataTable` molecule (`src/components/molecules/DataTable.tsx`) and `Checkbox` atom (`src/components/atoms/Checkbox.tsx`).

Refer to disclosed references as needed:
- [reference/contract.md](reference/contract.md) — complete props, column definitions, and selection configuration.
- [reference/typography-and-tokens.md](reference/typography-and-tokens.md) — design tokens for headers, cells, numbers, macros, and layers.

## Step 1: Inspect Target Table & Inventory Current Implementation

1. Read the target component file and its associated tests.
2. Inventory:
   - **Data source**: row type `TData` and unique row ID accessor (`getRowId`).
   - **Columns**: headers, data accessors, custom formatters, sort requirements.
   - **Interactive features**: selection (`single` or `multi`), row click actions, expandable rows, pagination, sorting.
   - **Deviations to eliminate**: raw `<table>` or `<div>`-based pseudo-tables, duplicate table tags for scrollable headers, inline `<button role="checkbox">` elements, ad-hoc font classes (`text-[11px]`, `font-semibold` instead of design tokens), and raw numeric z-index (`z-10`).

**Completion Criterion**: A concrete mapping of all existing columns, interaction states, and deviations is established.

## Step 2: Formulate Typed Column Definitions

1. Define columns as `DataTableColumnDef<TData>[]` using `useMemo` where appropriate.
2. Apply canonical typography and alignment:
   - **Headers**: `text-style-chart-micro font-bold uppercase tracking-wider text-text-secondary h-9 bg-surface-subtle`.
   - **Text cells**: `text-style-legal text-text-primary`.
   - **Numeric / Metric cells**: `text-right tabular-nums text-style-legal font-bold` (or `font-medium`).
   - **Sorting**: assign `sortable: true`, `sortValue: (row) => ...`, and `sortLabel`.
3. Wrap any action buttons or interactive cells inside a stop-propagation handler (`e.stopPropagation()`) so row-level selection is not triggered unintentionally.

**Completion Criterion**: `DataTableColumnDef<TData>[]` is fully typed with zero unsemantic utility classes.

## Step 3: Replace Markup with `DataTable`

1. Remove manual table tags (`<Table>`, `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableHead>`, `<TableCell>`) from the component body.
2. Render the `DataTable` molecule:
   ```tsx
   <DataTable
     data={data}
     columns={columns}
     getRowId={(item) => item.id}
     caption="Descriptive accessible caption"
     emptyMessage="Mensagem descritiva quando não há registros."
     loading={loading}
     errorMessage={errorMessage}
     selection={selectionConfig} // Omit if table has no selection
     stickyHeader={isScrollable}  // Use for modal or fixed-height views
     maxHeight="table-modal"     // semantic fixed-height variant
     sort={sortConfig}
     pagination={paginationConfig}
     className="flex-1 min-h-0"
   />
   ```
   Use `table-compact` for compact data regions or `table-modal` for scrollable modal tables. Do not pass raw pixel values; the canonical heights are component tokens.
3. Configure `selection` according to domain intent:
   - Use `mode: 'multi'` for multi-item selection with automatic master header checkbox.
   - Use `mode: 'single'` for mutual-exclusion item selection with neutral header.
   - Set `selectOnRowClick: true` when clicking a row should toggle selection.

**Completion Criterion**: Component renders exclusively through `<DataTable ... />` with zero custom table boilerplate.

## Step 4: Verify Non-Regression & Compliance

1. Run unit tests for the modified component:
   ```bash
   npm test -- <path-to-test-file>
   ```
2. Verify TypeScript types:
   ```bash
   npm run type-check
   ```
3. Run Design System and Atomic Design audits:
   ```bash
   npm run audit:atomic-design
   npm run audit:z-index
   ```

**Completion Criterion**: 100% of component tests pass, `type-check` reports 0 errors, and no new Atomic Design or z-index violations are introduced.
