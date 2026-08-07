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
});
