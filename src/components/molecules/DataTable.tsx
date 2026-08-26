'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/atoms/Checkbox';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { DataTablePagination } from './data-table/DataTablePagination';
import { DataTableStateRow } from './data-table/DataTableStateRow';
import type { DataTableColumnDef, DataTableProps, DataTableSelectionConfig, DataTableSortState } from './data-table/types';
import { alignClass, nextSortState, nodeToLabel, normalizeSelectionSet, sortRows } from './data-table/utils';

export {
  type DataTableColumnDef,
  type DataTablePagination,
  type DataTableProps,
  type DataTableSelectionConfig,
  type DataTableSelectionMode,
  type DataTableSortState,
} from './data-table/types';

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
      className={cn(
        'font-bold text-style-chart-micro uppercase tracking-wider h-auto py-1 px-1 -mx-1',
        active ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
      )}
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
  selection,
  allSelected,
  someSelected,
  onToggleAll,
}: {
  columns: DataTableColumnDef<TData>[];
  sort?: DataTableProps<TData>['sort'];
  selection?: DataTableSelectionConfig<TData>;
  allSelected?: boolean;
  someSelected?: boolean;
  onToggleAll?: () => void;
}) {
  return (
    <TableRow className="bg-surface-subtle hover:bg-surface-subtle border-b border-border-divider">
      {selection && (
        <TableHead className="w-10 px-3 text-center h-9 bg-surface-subtle" scope="col">
          {selection.mode === 'multi' && (
            <Checkbox
              checked={allSelected ? true : someSelected ? 'indeterminate' : false}
              onCheckedChange={onToggleAll}
              aria-label={selection.selectAllAriaLabel || 'Selecionar todas as linhas'}
            />
          )}
        </TableHead>
      )}
      {columns.map((column) => {
        const sortable = Boolean(sort && column.sortable && column.sortValue);
        const active = sort?.state?.columnId === column.id;
        const ariaSort = sortable ? (active ? sort?.state?.direction === 'asc' ? 'ascending' : 'descending' : 'none') : undefined;
        return (
          <TableHead
            key={column.id}
            scope="col"
            aria-sort={ariaSort}
            className={cn(
              'h-9 bg-surface-subtle px-4 font-bold text-style-chart-micro uppercase tracking-wider text-text-secondary',
              alignClass(column.align),
              column.headerClassName
            )}
          >
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
  selection,
  stickyHeader = false,
  maxHeight,
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

  const selectedSet = React.useMemo(
    () => normalizeSelectionSet(selection?.selectedRowIds),
    [selection?.selectedRowIds]
  );

  const selectableVisibleRows = React.useMemo(() => {
    if (!selection) return [];
    return visibleData.filter(({ row, index }) => !selection.isSelectable || selection.isSelectable(row, index));
  }, [selection, visibleData]);

  const allSelected = selectableVisibleRows.length > 0 && selectableVisibleRows.every(({ row, index }) => selectedSet.has(getRowId(row, index)));
  const someSelected = selectableVisibleRows.some(({ row, index }) => selectedSet.has(getRowId(row, index)));

  const handleToggleAll = React.useCallback(() => {
    if (!selection) return;
    const nextSet = new Set(selectedSet);
    if (allSelected) {
      selectableVisibleRows.forEach(({ row, index }) => {
        nextSet.delete(getRowId(row, index));
      });
    } else {
      selectableVisibleRows.forEach(({ row, index }) => {
        nextSet.add(getRowId(row, index));
      });
    }
    const selectedRows = data.filter((row, idx) => nextSet.has(getRowId(row, idx)));
    selection.onSelectionChange(nextSet, selectedRows);
  }, [selection, selectedSet, allSelected, selectableVisibleRows, getRowId, data]);

  const handleToggleRow = React.useCallback((row: TData, index: number, e?: React.SyntheticEvent) => {
    if (!selection) return;
    const isSelectable = !selection.isSelectable || selection.isSelectable(row, index);
    if (!isSelectable) return;

    const rowId = getRowId(row, index);
    let nextSet: Set<string>;

    if (selection.mode === 'single') {
      if (selectedSet.has(rowId)) {
        nextSet = new Set();
      } else {
        nextSet = new Set([rowId]);
      }
    } else {
      nextSet = new Set(selectedSet);
      if (nextSet.has(rowId)) {
        nextSet.delete(rowId);
      } else {
        nextSet.add(rowId);
      }
    }

    const selectedRows = data.filter((r, idx) => nextSet.has(getRowId(r, idx)));
    selection.onSelectionChange(nextSet, selectedRows);
  }, [selection, selectedSet, getRowId, data]);

  const totalColumnCount = columns.length + (selection ? 1 : 0);

  const tableElement = (
    <Table className={tableClassName} aria-label={ariaLabel ?? captionLabel} aria-busy={loading || undefined} aria-readonly={readOnly || undefined}>
      <TableCaption className="sr-only">{caption}</TableCaption>
      <TableHeader className={cn(stickyHeader && 'sticky top-0 z-raised bg-surface-subtle')}>
        <TableHeaderRow
          columns={columns}
          sort={sort}
          selection={selection}
          allSelected={allSelected}
          someSelected={someSelected}
          onToggleAll={handleToggleAll}
        />
      </TableHeader>
      <TableBody>
        {errorMessage ? (
          <DataTableStateRow columns={totalColumnCount} role="alert">{errorMessage}</DataTableStateRow>
        ) : loading ? (
          <DataTableStateRow columns={totalColumnCount} role="status">Carregando dados.</DataTableStateRow>
        ) : visibleData.length === 0 ? (
          <DataTableStateRow columns={totalColumnCount} role="status">{emptyMessage}</DataTableStateRow>
        ) : (
          visibleData.map(({ row, index }) => {
            const rowId = getRowId(row, index);
            const isSelected = selectedSet.has(rowId);
            const isSelectable = !selection?.isSelectable || selection.isSelectable(row, index);

            if (renderRow) {
              return (
                <React.Fragment key={rowId}>
                  {renderRow(row, index)}
                  {renderExpandedRow && expandedRowId === rowId ? renderExpandedRow(row, index) : null}
                </React.Fragment>
              );
            }

            return (
              <React.Fragment key={rowId}>
                <TableRow
                  data-row-id={rowId}
                  data-state={isSelected ? 'selected' : undefined}
                  onClick={selection?.selectOnRowClick && isSelectable ? (e) => handleToggleRow(row, index, e) : undefined}
                  className={cn(
                    'border-b border-border-divider transition-colors duration-fast hover:bg-surface-hover',
                    isSelected && 'bg-primary-soft/30 hover:bg-primary-soft/40',
                    selection?.selectOnRowClick && isSelectable && 'cursor-pointer select-none'
                  )}
                >
                  {selection && (
                    <TableCell
                      className="w-10 px-3 py-2 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Checkbox
                        checked={isSelected}
                        disabled={!isSelectable}
                        onCheckedChange={() => handleToggleRow(row, index)}
                        aria-label={
                          selection.selectRowAriaLabel
                            ? selection.selectRowAriaLabel(row, index)
                            : `Selecionar linha ${index + 1}`
                        }
                      />
                    </TableCell>
                  )}

                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      className={cn(
                        'p-4 align-middle text-text-primary text-style-legal',
                        column.align === 'right' && 'tabular-nums',
                        alignClass(column.align),
                        column.className
                      )}
                    >
                      {column.cell(row, index)}
                    </TableCell>
                  ))}
                </TableRow>
                {renderExpandedRow && expandedRowId === rowId ? renderExpandedRow(row, index) : null}
              </React.Fragment>
            );
          })
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {stickyHeader || maxHeight ? (
        <div
          className={cn(
            'relative w-full overflow-y-auto overflow-x-hidden',
            stickyHeader && 'border border-border-divider rounded-control'
          )}
          style={maxHeight ? { maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight } : undefined}
        >
          {tableElement}
        </div>
      ) : (
        tableElement
      )}
      {pagination ? <DataTablePagination pagination={pagination} pageIndex={pageIndex} pageCount={pageCount} /> : null}
    </div>
  );
}

