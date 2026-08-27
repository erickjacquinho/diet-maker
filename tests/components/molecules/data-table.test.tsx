import { fireEvent, render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DataTable, type DataTableColumnDef, type DataTableSortState } from '@/components/molecules/DataTable';
import { TableCell, TableRow } from '@/components/ui/table';

interface Row {
  id: string;
  name: string;
  value: number;
}

const rows: Row[] = [
  { id: 'row-1', name: 'Alfa', value: 10 },
  { id: 'row-2', name: 'Beta', value: 20 },
];

const columns: DataTableColumnDef<Row>[] = [
  {
    id: 'name',
    header: 'Nome',
    sortLabel: 'nome',
    sortable: true,
    sortValue: (row) => row.name,
    cell: (row) => row.name,
  },
  {
    id: 'value',
    header: 'Valor',
    sortLabel: 'valor',
    sortable: true,
    sortValue: (row) => row.value,
    cell: (row) => row.value,
    align: 'right',
  },
];

function renderTable(
  props: Partial<React.ComponentProps<typeof DataTable<Row>>> = {},
) {
  return render(
    <DataTable
      data={rows}
      columns={columns}
      getRowId={(row) => row.id}
      caption="Dados de teste"
      emptyMessage="Nenhum registro encontrado."
      {...props}
    />,
  );
}

describe('DataTable contract', () => {
  it('renders semantic caption, scoped headers, typed cells and read-only state', () => {
    renderTable({ readOnly: true });

    const table = screen.getByRole('table', { name: 'Dados de teste' });
    expect(table).toHaveAttribute('aria-readonly', 'true');
    expect(within(table).getByRole('columnheader', { name: 'Nome' })).toHaveAttribute('scope', 'col');
    expect(within(table).getByRole('columnheader', { name: 'Valor' })).toHaveAttribute('scope', 'col');
    expect(within(table).getByRole('cell', { name: 'Alfa' })).toBeInTheDocument();
    expect(within(table).getByRole('cell', { name: '20' })).toBeInTheDocument();
    expect(within(table).getByText('Dados de teste')).toBeInTheDocument();
  });

  it('renders accessible empty, loading and error states without fake data', () => {
    const { rerender } = render(
      <DataTable
        data={[]}
        columns={columns}
        getRowId={(row) => row.id}
        caption="Dados"
        emptyMessage="Nenhum registro encontrado."
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Nenhum registro encontrado.');
    expect(screen.queryByRole('cell', { name: 'Alfa' })).not.toBeInTheDocument();

    rerender(
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        caption="Dados"
        emptyMessage="Nenhum registro encontrado."
        loading
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Carregando dados.');
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');

    rerender(
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        caption="Dados"
        emptyMessage="Nenhum registro encontrado."
        errorMessage="Não foi possível carregar os dados."
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar os dados.');
    expect(screen.queryByRole('cell', { name: 'Alfa' })).not.toBeInTheDocument();
  });

  it('keeps the shared molecule free of domain imports', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/components/molecules/DataTable.tsx'), 'utf8');
    expect(source).not.toMatch(/FoodItem|Patient|Diet|Assessment|tacoStore|patientsStore/);
  });

  it('toggles controlled sorting through ascending, descending and cleared states', () => {
    function SortingHarness() {
      const [sort, setSort] = useState<DataTableSortState | null>(null);
      return (
        <DataTable
          data={rows}
          columns={columns}
          getRowId={(row) => row.id}
          caption="Dados"
          emptyMessage="Nenhum registro encontrado."
          sort={{ state: sort, onChange: setSort }}
        />
      );
    }

    render(<SortingHarness />);
    const sortButton = screen.getByRole('button', { name: 'Ordenar por valor' });
    const table = screen.getByRole('table', { name: 'Dados' });
    const getNames = () => within(table).getAllByRole('row').slice(1).map((row) => within(row).getAllByRole('cell')[0].textContent);

    expect(getNames()).toEqual(['Alfa', 'Beta']);
    fireEvent.click(sortButton);
    expect(getNames()).toEqual(['Alfa', 'Beta']);
    expect(within(table).getByRole('columnheader', { name: /Valor/ })).toHaveAttribute('aria-sort', 'ascending');
    fireEvent.click(sortButton);
    expect(getNames()).toEqual(['Beta', 'Alfa']);
    expect(within(table).getByRole('columnheader', { name: /Valor/ })).toHaveAttribute('aria-sort', 'descending');
    fireEvent.click(sortButton);
    expect(within(table).getByRole('columnheader', { name: /Valor/ })).toHaveAttribute('aria-sort', 'none');
  });

  it('paginates synchronously and disables controls at the boundaries', () => {
    const paginationRows = Array.from({ length: 3 }, (_, index) => ({
      id: `row-${index + 1}`,
      name: `Item ${index + 1}`,
      value: index + 1,
    }));

    function PaginationHarness() {
      const [pageIndex, setPageIndex] = useState(0);
      return (
        <DataTable
          data={paginationRows}
          columns={columns}
          getRowId={(row) => row.id}
          caption="Dados"
          emptyMessage="Nenhum registro encontrado."
          pagination={{ pageIndex, pageSize: 2, onPageChange: setPageIndex }}
        />
      );
    }

    render(<PaginationHarness />);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.queryByText('Item 3')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Próxima página' }));
    expect(screen.getByText('Item 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeDisabled();
  });

  it('renders complex rows and associated expanded content with stable row ids', () => {
    const renderRow = (row: Row): ReactNode => (
      <TableRow data-testid={`row-${row.id}`}>
        <TableCell>{row.name}</TableCell>
        <TableCell>{row.value}</TableCell>
      </TableRow>
    );
    const renderExpandedRow = (row: Row): ReactNode => (
      <TableRow data-testid={`expanded-${row.id}`}>
        <TableCell colSpan={2}>Detalhes de {row.name}</TableCell>
      </TableRow>
    );

    renderTable({ renderRow, renderExpandedRow, expandedRowId: 'row-2' });

    expect(screen.getByTestId('row-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('row-row-2')).toBeInTheDocument();
    expect(screen.getByTestId('expanded-row-2')).toBeInTheDocument();
    expect(screen.queryByTestId('expanded-row-1')).not.toBeInTheDocument();
  });

  it('supports multi-selection mode with row checkboxes and header master toggle', () => {
    function MultiSelectionHarness() {
      const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(['row-1']));
      return (
        <DataTable
          data={rows}
          columns={columns}
          getRowId={(row) => row.id}
          caption="Dados com seleção múltipla"
          emptyMessage="Nenhum registro encontrado."
          selection={{
            mode: 'multi',
            selectedRowIds: selectedIds,
            onSelectionChange: (nextSet) => setSelectedIds(nextSet),
            selectAllAriaLabel: 'Selecionar todos',
            selectRowAriaLabel: (row) => `Selecionar ${row.name}`,
          }}
        />
      );
    }

    render(<MultiSelectionHarness />);
    const masterCheckbox = screen.getByRole('checkbox', { name: 'Selecionar todos' });
    const row1Checkbox = screen.getByRole('checkbox', { name: 'Selecionar Alfa' });
    const row2Checkbox = screen.getByRole('checkbox', { name: 'Selecionar Beta' });

    // Initial state: 1 selected out of 2 => indeterminate/mixed
    expect(masterCheckbox).toHaveAttribute('aria-checked', 'mixed');
    expect(row1Checkbox).toHaveAttribute('aria-checked', 'true');
    expect(row2Checkbox).toHaveAttribute('aria-checked', 'false');

    // Clicking master checkbox selects all
    fireEvent.click(masterCheckbox);
    expect(masterCheckbox).toHaveAttribute('aria-checked', 'true');
    expect(row1Checkbox).toHaveAttribute('aria-checked', 'true');
    expect(row2Checkbox).toHaveAttribute('aria-checked', 'true');

    // Clicking master checkbox when all are selected unselects all
    fireEvent.click(masterCheckbox);
    expect(masterCheckbox).toHaveAttribute('aria-checked', 'false');
    expect(row1Checkbox).toHaveAttribute('aria-checked', 'false');
    expect(row2Checkbox).toHaveAttribute('aria-checked', 'false');

    // Clicking row2 checkbox selects row2
    fireEvent.click(row2Checkbox);
    expect(masterCheckbox).toHaveAttribute('aria-checked', 'mixed');
    expect(row2Checkbox).toHaveAttribute('aria-checked', 'true');
  });

  it('supports single-selection mode without master checkbox in header', () => {
    function SingleSelectionHarness() {
      const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(['row-1']));
      return (
        <DataTable
          data={rows}
          columns={columns}
          getRowId={(row) => row.id}
          caption="Dados com seleção única"
          emptyMessage="Nenhum registro encontrado."
          selection={{
            mode: 'single',
            selectedRowIds: selectedIds,
            onSelectionChange: (nextSet) => setSelectedIds(nextSet),
            selectRowAriaLabel: (row) => `Selecionar ${row.name}`,
          }}
        />
      );
    }

    render(<SingleSelectionHarness />);
    expect(screen.queryByRole('checkbox', { name: /selecionar todos/i })).not.toBeInTheDocument();

    const row1Checkbox = screen.getByRole('checkbox', { name: 'Selecionar Alfa' });
    const row2Checkbox = screen.getByRole('checkbox', { name: 'Selecionar Beta' });

    expect(row1Checkbox).toHaveAttribute('aria-checked', 'true');
    expect(row2Checkbox).toHaveAttribute('aria-checked', 'false');

    // Selecting row2 unselects row1
    fireEvent.click(row2Checkbox);
    expect(row1Checkbox).toHaveAttribute('aria-checked', 'false');
    expect(row2Checkbox).toHaveAttribute('aria-checked', 'true');
  });

  it('supports selectOnRowClick to toggle selection by clicking anywhere on the row', () => {
    function RowClickHarness() {
      const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
      return (
        <DataTable
          data={rows}
          columns={columns}
          getRowId={(row) => row.id}
          caption="Dados com clique na linha"
          emptyMessage="Nenhum registro encontrado."
          selection={{
            mode: 'multi',
            selectedRowIds: selectedIds,
            onSelectionChange: (nextSet) => setSelectedIds(nextSet),
            selectOnRowClick: true,
            selectRowAriaLabel: (row) => `Selecionar ${row.name}`,
          }}
        />
      );
    }

    render(<RowClickHarness />);
    const row1 = screen.getByText('Alfa').closest('tr')!;
    expect(row1).not.toHaveAttribute('data-state', 'selected');

    fireEvent.click(row1);
    expect(row1).toHaveAttribute('data-state', 'selected');
    expect(screen.getByRole('checkbox', { name: 'Selecionar Alfa' })).toHaveAttribute('aria-checked', 'true');
  });

  it('supports keyboard selection on the focused row without double toggling child controls', () => {
    function RowClickHarness() {
      const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
      return (
        <DataTable
          data={rows}
          columns={columns}
          getRowId={(row) => row.id}
          caption="Dados com seleção por teclado"
          emptyMessage="Nenhum registro encontrado."
          selection={{
            mode: 'single',
            selectedRowIds: selectedIds,
            onSelectionChange: (nextSet) => setSelectedIds(nextSet),
            selectOnRowClick: true,
            selectRowAriaLabel: (row) => `Selecionar ${row.name}`,
          }}
        />
      );
    }

    render(<RowClickHarness />);
    const row1 = screen.getByText('Alfa').closest('tr')!;

    expect(row1).toHaveAttribute('tabindex', '0');
    expect(row1).toHaveAttribute('aria-selected', 'false');
    fireEvent.keyDown(row1, { key: 'Enter' });
    expect(row1).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(row1, { key: ' ' });
    expect(row1).toHaveAttribute('aria-selected', 'false');
  });

  it('keeps the header outside the scrollable body and preserves max height', () => {
    const { container } = renderTable({
      stickyHeader: true,
      maxHeight: 'table-compact',
    });

    const tableBody = container.querySelector('tbody');
    expect(tableBody).toBeInTheDocument();
    expect(container.querySelector('.overflow-auto')).not.toBeInTheDocument();
    expect(tableBody).toHaveClass('block', 'overflow-y-auto');
    expect(tableBody).toHaveClass('max-h-table-compact-body');

    const tableContainer = container.querySelector('.rounded-t-control');
    expect(tableContainer).toBeInTheDocument();
    expect(tableContainer).toHaveClass('overflow-hidden');
    expect(tableContainer).not.toHaveClass('max-h-table-compact');
    expect(tableContainer).toHaveClass('border');

    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
    expect(table?.parentElement).toHaveClass('overflow-visible');
    expect(container.querySelector('thead')).toHaveClass('block', 'bg-surface-subtle');
    expect(container.querySelector('thead')).not.toHaveClass('sticky', 'top-0');
    expect(container.querySelector('thead tr')).toHaveClass('table', 'table-fixed', 'w-full');
    expect(container.querySelector('tbody tr')).toHaveClass('table', 'table-fixed', 'w-full');
  });
});

