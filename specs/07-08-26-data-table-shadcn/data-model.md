# Data Model & Component Contracts: Shadcn DataTable

**Feature**: [spec.md](spec.md)  
**Date**: 2026-08-07

## 1. Shared DataTable model

### `DataTableColumnDef<TData>`

```ts
export interface DataTableColumnDef<TData> {
  id: string;
  header: React.ReactNode;
  cell: (row: TData, index: number) => React.ReactNode;
  sortValue?: (row: TData) => string | number | null | undefined;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
  headerClassName?: string;
}
```

Rules:

- `id` is stable and unique within a table.
- `cell` owns only presentation of the supplied record; it cannot mutate table state directly except through callbacks captured by the consumer.
- `sortValue` is optional; a column without it is not sortable.
- Numeric values use right alignment and explicit units when the value would otherwise be ambiguous.

### `DataTableSortState`

```ts
export interface DataTableSortState {
  columnId: string;
  direction: 'asc' | 'desc';
}
```

Only one active sort column is required by current consumers. The cycle is ascending, descending, then the consumer's default order when cleared.

### `DataTablePagination`

```ts
export interface DataTablePagination {
  pageIndex: number;
  pageSize: number;
  onPageChange: (pageIndex: number) => void;
}
```

The component exposes whether previous/next pages exist and renders compact controls only when pagination is provided. Consumers must clamp or reset the page when the filtered data set changes.

### `DataTableProps<TData>`

```ts
export interface DataTableProps<TData> {
  data: TData[];
  columns: DataTableColumnDef<TData>[];
  getRowId: (row: TData, index: number) => string;
  caption: React.ReactNode;
  emptyMessage: React.ReactNode;
  loading?: boolean;
  errorMessage?: React.ReactNode;
  sort?: {
    state: DataTableSortState | null;
    onChange: (state: DataTableSortState | null) => void;
  };
  pagination?: DataTablePagination;
  renderRow?: (row: TData, index: number) => React.ReactNode;
  renderExpandedRow?: (row: TData, index: number) => React.ReactNode;
  expandedRowId?: string | null;
  className?: string;
  tableClassName?: string;
  ariaLabel?: string;
}
```

The implementation may add internal callback props for row state, but it must not expose domain-specific names or types. `renderRow` is an explicit escape hatch for complex organisms; the returned rows remain inside `TableBody` and must use stable keys. `renderExpandedRow` is optional and must be announced through the consumer's expansion control.

## 2. Consumer contracts

### Food table

- Data: `FoodItem[]` after page-level filters.
- Sortable columns: food name, kcal, protein, carbohydrate and fat.
- Page size: 15.
- Row actions: favorite and edit custom food.
- Empty message: no food matches the active filters.

### Patient list table

- Data: `PatientListRow[]` already filtered and ordered by the page model.
- Row identity: patient ID.
- Row behavior: link role, Enter/Space activation, first-cell profile link and history indicators.
- Empty behavior is owned by the page-level empty states; the DataTable contract remains capable of an inline empty row.

### Consultation history table

- Data: `ConsolidatedConsultationUpdate[]`, one item per date.
- Row identity: consultation date.
- Expanded state: one controlled date at a time.
- Row actions: open consultation, view diet, edit assessment.
- Expanded content must remain in a table subrow with a cell spanning the visible columns.

## 3. Design System registration model

The shared component is registered as:

- ID: `molecule-data-table`
- Category: `data-display`
- Layer: `molecule`
- Lifecycle: `proposed` until implementation and verifier checks pass
- Source: `src/components/molecules/DataTable.tsx`
- Consumers: `organism-food-table-section`, `organism-patient-list-table`, `organism-patient-consultation-history-table`

The food consumer also receives the profile `design-system/components/profiles/organisms/food-table-section.md`, because it is a real organism-level consumer that was not previously registered in the catalog.

The existing `ui-table` profile and source remain unchanged.
