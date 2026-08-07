import type { ReactNode } from 'react';
import type { DataTableColumnDef, DataTableSortState, IndexedRow } from './types';

export function alignClass(align: DataTableColumnDef<unknown>['align']): string {
  if (align === 'center') return 'text-center';
  if (align === 'right') return 'text-right';
  return 'text-left';
}

function compareSortValues(
  first: string | number | null | undefined,
  second: string | number | null | undefined,
): number {
  const firstMissing = first === null || first === undefined || first === '';
  const secondMissing = second === null || second === undefined || second === '';
  if (firstMissing && secondMissing) return 0;
  if (firstMissing) return 1;
  if (secondMissing) return -1;
  if (typeof first === 'number' && typeof second === 'number') return first - second;
  return String(first).localeCompare(String(second), 'pt-BR', { numeric: true, sensitivity: 'base' });
}

export function sortRows<TData>(
  rows: IndexedRow<TData>[],
  columns: DataTableColumnDef<TData>[],
  sortState: DataTableSortState | null | undefined,
): IndexedRow<TData>[] {
  if (!sortState) return rows;
  const column = columns.find(({ id }) => id === sortState.columnId);
  if (!column?.sortValue || column.sortable === false) return rows;

  return [...rows].sort((first, second) => {
    const result = compareSortValues(column.sortValue?.(first.row), column.sortValue?.(second.row));
    if (result === 0) return first.index - second.index;
    return sortState.direction === 'desc' ? -result : result;
  });
}

export function nodeToLabel(node: ReactNode, fallback: string): string {
  return typeof node === 'string' || typeof node === 'number' ? String(node) : fallback;
}

export function nextSortState<TData>(
  current: DataTableSortState | null,
  column: DataTableColumnDef<TData>,
): DataTableSortState | null {
  if (!column.sortable || !column.sortValue) return current;
  if (!current || current.columnId !== column.id) return { columnId: column.id, direction: 'asc' };
  if (current.direction === 'asc') return { columnId: column.id, direction: 'desc' };
  return null;
}
