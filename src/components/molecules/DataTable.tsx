'use client';

import * as React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/atoms/Checkbox';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { DataTablePagination } from './data-table/DataTablePagination';
import { DataTableStateRow } from './data-table/DataTableStateRow';
import type {
  DataTableColumnDef,
  DataTableMaxHeight,
  DataTableProps,
  DataTableSelectionConfig,
  DataTableSortState,
} from './data-table/types';
import { alignClass, nextSortState, nodeToLabel, normalizeSelectionSet, sortRows } from './data-table/utils';

export {
  type DataTableColumnDef,
  type DataTableMaxHeight,
  type DataTablePagination,
  type DataTableProps,
  type DataTableSelectionConfig,
  type DataTableSelectionMode,
  type DataTableSortState,
  type DataTableVirtualizationConfig,
} from './data-table/types';

const maxHeightClasses: Record<DataTableMaxHeight, string> = {
  'table-compact': 'max-h-table-compact',
  'table-modal': 'max-h-table-modal',
};

const scrollBodyMaxHeightClasses: Record<DataTableMaxHeight, string> = {
  'table-compact': 'max-h-table-compact-body',
  'table-modal': 'max-h-table-modal-body',
};

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
  const sortHint = active
    ? direction === 'desc'
      ? 'maior para menor'
      : 'menor para maior'
    : 'clique para ordenar';
  return (
    <Button
      type="button"
      variant="quiet"
      size="compact"
      onClick={() => sort?.onChange(nextSortState(sort.state, column))}
      aria-label={`Ordenar por ${label}`}
      aria-pressed={active}
      title={`Ordenar por ${label} (${sortHint})`}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 font-bold text-style-chart-micro uppercase tracking-wider h-auto py-1 px-1 -mx-1 hover:bg-transparent',
        active ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
      )}
    >
      {column.header}
      {direction === 'asc' ? (
        <ArrowUp size={12} strokeWidth={2.5} aria-hidden="true" className="shrink-0 text-primary" />
      ) : direction === 'desc' ? (
        <ArrowDown size={12} strokeWidth={2.5} aria-hidden="true" className="shrink-0 text-primary" />
      ) : (
        <ArrowUpDown size={12} strokeWidth={2} aria-hidden="true" className="shrink-0 opacity-subdued" />
      )}
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
  className,
}: {
  columns: DataTableColumnDef<TData>[];
  sort?: DataTableProps<TData>['sort'];
  selection?: DataTableSelectionConfig<TData>;
  allSelected?: boolean;
  someSelected?: boolean;
  onToggleAll?: () => void;
  className?: string;
}) {
  return (
    <TableRow className={cn('bg-surface-subtle hover:bg-surface-subtle border-b border-border-divider', className)}>
      {selection && (
        <TableHead className="w-10 px-3 text-center h-9 bg-surface-subtle" scope="col">
          <Checkbox
            checked={allSelected ? true : someSelected ? 'indeterminate' : false}
            onCheckedChange={onToggleAll}
            aria-label={
              selection.selectAllAriaLabel ||
              (selection.mode === 'single' ? 'Alternar seleção' : 'Selecionar todas as linhas')
            }
          />
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

const estimatedVirtualRowHeight = 44;

function MeasuredTableRow({
  rowId,
  onHeightChange,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & {
  rowId: string;
  onHeightChange: (rowId: string, height: number) => void;
}) {
  const rowRef = React.useRef<HTMLTableRowElement>(null);

  React.useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const measure = () => {
      const height = Math.ceil(row.getBoundingClientRect().height);
      if (height > 0) onHeightChange(rowId, height);
    };

    measure();
    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(measure);
    observer.observe(row);
    return () => observer.disconnect();
  }, [rowId, onHeightChange]);

  return (
    <TableRow ref={rowRef} {...props}>
      {children}
    </TableRow>
  );
}

function VirtualSpacerRow({ height, columnCount }: { height: number; columnCount: number }) {
  if (height <= 0) return null;

  return (
    <TableRow aria-hidden="true" className="table table-fixed w-full border-0 hover:bg-transparent">
      <TableCell colSpan={columnCount} height={height} className="border-0 p-0">
        <span aria-hidden="true" className="block" />
      </TableCell>
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
  virtualization,
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
    if (selection.mode === 'single') {
      if (someSelected || allSelected) {
        nextSet.clear();
      } else if (selectableVisibleRows.length > 0) {
        nextSet.add(getRowId(selectableVisibleRows[0].row, selectableVisibleRows[0].index));
      }
    } else {
      if (allSelected) {
        selectableVisibleRows.forEach(({ row, index }) => {
          nextSet.delete(getRowId(row, index));
        });
      } else {
        selectableVisibleRows.forEach(({ row, index }) => {
          nextSet.add(getRowId(row, index));
        });
      }
    }
    const selectedRows = data.filter((row, idx) => nextSet.has(getRowId(row, idx)));
    selection.onSelectionChange(nextSet, selectedRows);
  }, [selection, selectedSet, allSelected, someSelected, selectableVisibleRows, getRowId, data]);

  const handleToggleRow = React.useCallback((row: TData, index: number) => {

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
  const scrollsBody = Boolean(stickyHeader && maxHeight);
  const hasScrollContainer = Boolean(maxHeight) && !scrollsBody;
  const virtualized = Boolean(virtualization && scrollsBody && !renderRow);
  const overscan = Math.max(0, virtualization?.overscan ?? 8);
  const bodyRef = React.useRef<HTMLTableSectionElement>(null);
  const animationFrameRef = React.useRef<number | null>(null);
  const [scrollTop, setScrollTop] = React.useState(0);
  const [viewportHeight, setViewportHeight] = React.useState(0);
  const [rowHeights, setRowHeights] = React.useState<Record<string, number>>({});

  const handleRowHeightChange = React.useCallback((rowId: string, height: number) => {
    setRowHeights((current) => current[rowId] === height ? current : { ...current, [rowId]: height });
  }, []);

  const handleBodyScroll = React.useCallback((event: React.UIEvent<HTMLTableSectionElement>) => {
    const nextScrollTop = event.currentTarget.scrollTop;
    if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') {
      setScrollTop(nextScrollTop);
      return;
    }

    if (animationFrameRef.current !== null) window.cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = window.requestAnimationFrame(() => {
      animationFrameRef.current = null;
      setScrollTop(nextScrollTop);
    });
  }, []);

  React.useEffect(() => () => {
    if (
      animationFrameRef.current !== null
      && typeof window !== 'undefined'
      && typeof window.cancelAnimationFrame === 'function'
    ) {
      window.cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  React.useEffect(() => {
    if (!scrollsBody) return;
    const body = bodyRef.current;
    if (!body) return;

    const updateViewportHeight = () => setViewportHeight(body.clientHeight);
    updateViewportHeight();
    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(updateViewportHeight);
    observer.observe(body);
    return () => observer.disconnect();
  }, [scrollsBody]);

  const virtualMetrics = React.useMemo(() => {
    if (!virtualized) return null;

    const offsets = new Array<number>(visibleData.length + 1);
    offsets[0] = 0;
    for (let index = 0; index < visibleData.length; index++) {
      const rowId = getRowId(visibleData[index].row, visibleData[index].index);
      offsets[index + 1] = offsets[index] + (rowHeights[rowId] ?? estimatedVirtualRowHeight);
    }

    const viewport = viewportHeight || estimatedVirtualRowHeight * 10;
    const firstOffsetIndex = offsets.findIndex((offset, index) => index > 0 && offset > scrollTop);
    const firstVisibleIndex = firstOffsetIndex === -1
      ? Math.max(0, visibleData.length - 1)
      : firstOffsetIndex - 1;
    let visibleEnd = firstVisibleIndex;
    const viewportEnd = scrollTop + viewport;
    while (visibleEnd < visibleData.length && offsets[visibleEnd] < viewportEnd) visibleEnd += 1;

    const start = Math.max(0, firstVisibleIndex - overscan);
    const end = Math.min(visibleData.length, visibleEnd + overscan);
    return {
      start,
      end,
      top: offsets[start],
      bottom: offsets[visibleData.length] - offsets[end],
    };
  }, [getRowId, overscan, rowHeights, scrollTop, virtualized, viewportHeight, visibleData]);

  const rowsToRender = virtualMetrics
    ? visibleData.slice(virtualMetrics.start, virtualMetrics.end)
    : visibleData;

  const tableElement = (
    <Table
      className={cn(tableClassName, scrollsBody && 'block w-full')}
      containerClassName={hasScrollContainer || scrollsBody ? 'overflow-visible' : undefined}
      aria-label={ariaLabel ?? captionLabel}
      aria-rowcount={data.length + 1}
      aria-busy={loading || undefined}
      aria-readonly={readOnly || undefined}
    >
      <TableCaption className="sr-only">{caption}</TableCaption>
      <TableHeader className={cn(scrollsBody && 'block bg-surface-subtle')}>
        <TableHeaderRow
          columns={columns}
          sort={sort}
          selection={selection}
          allSelected={allSelected}
          someSelected={someSelected}
          onToggleAll={handleToggleAll}
          className={scrollsBody ? 'table table-fixed w-full' : undefined}
        />
      </TableHeader>
      <TableBody
        ref={scrollsBody ? bodyRef : undefined}
        onScroll={virtualized ? handleBodyScroll : undefined}
        className={cn(
          scrollsBody && 'block overflow-y-auto overscroll-contain',
          scrollsBody && maxHeight ? scrollBodyMaxHeightClasses[maxHeight] : undefined
        )}
      >
        {errorMessage ? (
          <DataTableStateRow columns={totalColumnCount} role="alert">{errorMessage}</DataTableStateRow>
        ) : loading ? (
          <DataTableStateRow columns={totalColumnCount} role="status">Carregando dados.</DataTableStateRow>
        ) : visibleData.length === 0 ? (
          <DataTableStateRow columns={totalColumnCount} role="status">{emptyMessage}</DataTableStateRow>
        ) : (
          <>
            {virtualMetrics ? <VirtualSpacerRow height={virtualMetrics.top} columnCount={totalColumnCount} /> : null}
            {rowsToRender.map(({ row, index }) => {
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

            const rowProps = {
              'data-row-id': rowId,
              'data-state': isSelected ? 'selected' : undefined,
              'aria-rowindex': index + 2,
              'aria-selected': selection ? isSelected : undefined,
              tabIndex: selection?.selectOnRowClick && isSelectable ? 0 : undefined,
              onClick: selection?.selectOnRowClick && isSelectable ? () => handleToggleRow(row, index) : undefined,
              onKeyDown:
                selection?.selectOnRowClick && isSelectable
                  ? (event: React.KeyboardEvent<HTMLTableRowElement>) => {
                      if (event.target !== event.currentTarget) return;
                      if (event.key !== ' ' && event.key !== 'Enter') return;
                      event.preventDefault();
                      handleToggleRow(row, index);
                    }
                  : undefined,
              className: cn(
                'border-b border-border-divider transition-colors duration-fast hover:bg-surface-hover',
                isSelected && 'bg-primary-soft/30 hover:bg-primary-soft/40',
                selection?.selectOnRowClick && isSelectable && 'cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus focus-visible:ring-inset',
                scrollsBody && 'table table-fixed w-full'
              ),
            };

            const rowCells = (
              <>
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
              </>
            );

            return (
              <React.Fragment key={rowId}>
                {virtualized ? (
                  <MeasuredTableRow rowId={rowId} onHeightChange={handleRowHeightChange} {...rowProps}>
                    {rowCells}
                  </MeasuredTableRow>
                ) : (
                  <TableRow {...rowProps}>
                    {rowCells}
                  </TableRow>
                )}
                {renderExpandedRow && expandedRowId === rowId ? renderExpandedRow(row, index) : null}
              </React.Fragment>
            );
          })}
          {virtualMetrics ? <VirtualSpacerRow height={virtualMetrics.bottom} columnCount={totalColumnCount} /> : null}
          </>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {stickyHeader || maxHeight ? (
        <div
          className={cn(
            'relative w-full',
            scrollsBody ? 'overflow-hidden' : 'overflow-auto',
            stickyHeader && 'border border-border-divider rounded-t-control',
            maxHeight && !scrollsBody && maxHeightClasses[maxHeight]
          )}
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

