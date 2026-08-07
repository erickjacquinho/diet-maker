import type { ReactNode } from 'react';

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

export interface DataTableSortState {
  columnId: string;
  direction: 'asc' | 'desc';
}

export interface DataTablePagination {
  pageIndex: number;
  pageSize: number;
  onPageChange: (pageIndex: number) => void;
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
  pagination?: DataTablePagination;
  renderRow?: (row: TData, index: number) => ReactNode;
  renderExpandedRow?: (row: TData, index: number) => ReactNode;
  expandedRowId?: string | null;
  className?: string;
  tableClassName?: string;
  ariaLabel?: string;
}

export interface IndexedRow<TData> {
  row: TData;
  index: number;
}
