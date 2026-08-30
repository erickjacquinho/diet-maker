# DataTable & Selection Technical Contract

## Import Paths

```typescript
import {
  DataTable,
  type DataTableColumnDef,
  type DataTableMaxHeight,
  type DataTableProps,
  type DataTableSelectionConfig,
  type DataTableSelectionMode,
  type DataTableSortState,
} from '@/components/molecules/DataTable';
import { Checkbox } from '@/components/atoms/Checkbox';
```

## Core Types

```typescript
export type DataTableSelectionMode = 'single' | 'multi';

export type DataTableMaxHeight = 'table-compact' | 'table-modal';

export interface DataTableSelectionConfig<TData> {
  mode: DataTableSelectionMode;
  selectedRowIds: Set<string> | string[];
  onSelectionChange: (selectedIds: Set<string>, selectedRows: TData[]) => void;
  isSelectable?: (row: TData, index: number) => boolean;
  selectOnRowClick?: boolean;
  selectAllAriaLabel?: string;
  selectRowAriaLabel?: (row: TData, index: number) => string;
}

export interface DataTableColumnDef<TData> {
  id: string;
  header: ReactNode;
  cell: (row: TData, index: number) => ReactNode;
  sortValue?: (row: TData) => string | number | null | undefined;
  sortable?: boolean;
  sortLabel?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<TData> {
  data: TData[];
  columns: DataTableColumnDef<TData>[];
  getRowId: (row: TData, index: number) => string;
  caption: ReactNode;
  emptyMessage: ReactNode;
  loading?: boolean;
  errorMessage?: ReactNode;
  readOnly?: boolean;
  sort?: {
    state: DataTableSortState | null;
    onChange: (state: DataTableSortState | null) => void;
  };
  pagination?: {
    pageIndex: number;
    pageSize: number;
    onPageChange: (pageIndex: number) => void;
  };
  selection?: DataTableSelectionConfig<TData>;
  stickyHeader?: boolean;
  maxHeight?: DataTableMaxHeight;
  renderRow?: (row: TData, index: number) => ReactNode;
  renderExpandedRow?: (row: TData, index: number) => ReactNode;
  expandedRowId?: string | null;
  className?: string;
  tableClassName?: string;
  ariaLabel?: string;
}
```

## Selection Mechanics

### Multi-Select (`mode: 'multi'`)
- First column (`w-10 px-3 text-center`) automatically injected.
- Master header Checkbox handles `checked: true`, `false`, or `'indeterminate'` (`mixed`).
- Row Checkboxes toggle individual row membership in `selectedRowIds`.

### Single-Select (`mode: 'single'`)
- First column (`w-10 px-3 text-center`) automatically injected with neutral header (no master checkbox).
- Clicking any row or checkbox selects that item exclusively and deselects any previously selected row.

### Row Click Selection (`selectOnRowClick: true`)
- Clicking anywhere on a table row toggles selection for that row.
- Action buttons or nested interactive elements must call `e.stopPropagation()` to prevent unwanted row toggling.
