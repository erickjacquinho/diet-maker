'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { DataTablePagination } from './data-table/DataTablePagination';
import { DataTableStateRow } from './data-table/DataTableStateRow';
import type { DataTableColumnDef, DataTableProps, DataTableSortState } from './data-table/types';
import { alignClass, nextSortState, nodeToLabel, sortRows } from './data-table/utils';

export { type DataTableColumnDef, type DataTablePagination, type DataTableProps, type DataTableSortState } from './data-table/types';

function SortableHeader<TData>({
  column,
  sort,
}: {
  column: DataTableColumnDef<TData>;
  sort?: DataTableProps<TData>['sort'];
}) {
  const sortable = Boolean(sort && column.sortable && column.sortValue);
  if (!sortable) return column.header;

  const active = sort?.state?.columnId === column.id;
  const direction = active ? sort?.state?.direction : undefined;
  const label = column.sortLabel ?? nodeToLabel(column.header, column.id);
  return (
    <Button
      type="button"
      variant="quiet"
      size="compact"
      onClick={() => sort?.onChange(nextSortState(sort.state, column))}
      aria-label={`Ordenar por ${label}`}
      aria-pressed={active}
    >
      {column.header}
      <span className="sr-only">
        {direction === 'asc' ? ', ordenação ascendente' : direction === 'desc' ? ', ordenação descendente' : ', sem ordenação'}
      </span>
    </Button>
  );
}

function TableHeaderRow<TData>({
  columns,
  sort,
}: {
  columns: DataTableColumnDef<TData>[];
  sort?: DataTableProps<TData>['sort'];
}) {
  return (
    <TableRow className="bg-surface-subtle hover:bg-surface-subtle">
      {columns.map((column) => {
        const sortable = Boolean(sort && column.sortable && column.sortValue);
        const active = sort?.state?.columnId === column.id;
        const ariaSort = sortable ? (active ? sort?.state?.direction === 'asc' ? 'ascending' : 'descending' : 'none') : undefined;
        return (
          <TableHead key={column.id} scope="col" aria-sort={ariaSort} className={cn(alignClass(column.align), column.headerClassName)}>
            <SortableHeader column={column} sort={sort} />
          </TableHead>
        );
      })}
    </TableRow>
  );
}

export function DataTable<TData>({
  data,
  columns,
  getRowId,
  caption,
  emptyMessage,
  loading = false,
  errorMessage,
  readOnly = false,
  sort,
  pagination,
  renderRow,
  renderExpandedRow,
  expandedRowId = null,
  className,
  tableClassName,
  ariaLabel,
}: DataTableProps<TData>) {
  const indexedData = React.useMemo(() => data.map((row, index) => ({ row, index })), [data]);
  const sortedData = React.useMemo(() => sortRows(indexedData, columns, sort?.state), [indexedData, columns, sort?.state]);
  const pageSize = pagination ? Math.max(1, pagination.pageSize) : sortedData.length;
  const pageCount = pagination ? Math.max(1, Math.ceil(sortedData.length / pageSize)) : 1;
  const pageIndex = pagination ? Math.min(Math.max(0, pagination.pageIndex), pageCount - 1) : 0;
  const visibleData = pagination ? sortedData.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize) : sortedData;
  const captionLabel = nodeToLabel(caption, 'Tabela de dados');

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <Table className={tableClassName} aria-label={ariaLabel ?? captionLabel} aria-busy={loading || undefined} aria-readonly={readOnly || undefined}>
        <TableCaption className="sr-only">{caption}</TableCaption>
        <TableHeader><TableHeaderRow columns={columns} sort={sort} /></TableHeader>
        <TableBody>
          {errorMessage ? (
            <DataTableStateRow columns={columns.length} role="alert">{errorMessage}</DataTableStateRow>
          ) : loading ? (
            <DataTableStateRow columns={columns.length} role="status">Carregando dados.</DataTableStateRow>
          ) : visibleData.length === 0 ? (
            <DataTableStateRow columns={columns.length} role="status">{emptyMessage}</DataTableStateRow>
          ) : (
            visibleData.map(({ row, index }) => {
              const rowId = getRowId(row, index);
              return (
                <React.Fragment key={rowId}>
                  {renderRow ? renderRow(row, index) : (
                    <TableRow data-row-id={rowId}>
                      {columns.map((column) => <TableCell key={column.id} className={cn(alignClass(column.align), column.className)}>{column.cell(row, index)}</TableCell>)}
                    </TableRow>
                  )}
                  {renderExpandedRow && expandedRowId === rowId ? renderExpandedRow(row, index) : null}
                </React.Fragment>
              );
            })
          )}
        </TableBody>
      </Table>
      {pagination ? <DataTablePagination pagination={pagination} pageIndex={pageIndex} pageCount={pageCount} /> : null}
    </div>
  );
}
