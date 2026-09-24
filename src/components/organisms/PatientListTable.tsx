import { useEffect, useState } from 'react';
import { DataTable, type DataTableColumnDef } from '@/components/molecules/DataTable';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { PatientListRow } from '@/lib/patientListView';
import { PatientListTableRow } from './patient/PatientListTableRow';

const PAGE_SIZE = 30;

export interface PatientListTableProps {
  rows: PatientListRow[];
  onNavigate?: (href: string) => void;
}

const columns: DataTableColumnDef<PatientListRow>[] = [
  {
    id: 'patient',
    header: 'Paciente',
    headerClassName: 'w-1/4 text-style-legal font-semibold tracking-label text-text-secondary',
    cell: () => null,
  },
  {
    id: 'objective',
    header: 'Objetivo',
    headerClassName: 'w-1/6 text-style-legal font-semibold tracking-label text-text-secondary',
    cell: () => null,
  },
  {
    id: 'body-fat',
    header: 'Evolução de gordura',
    headerClassName: 'w-1/5 text-style-legal font-semibold tracking-label text-text-secondary',
    cell: () => null,
  },
  {
    id: 'next-event',
    header: 'Próximo acompanhamento',
    headerClassName: 'w-1/3 text-style-legal font-semibold tracking-label text-text-secondary',
    cell: () => null,
  },
  {
    id: 'actions',
    header: <span className="sr-only">Abrir perfil</span>,
    headerClassName: 'w-12 text-right',
    cell: () => null,
  },
];

export function PatientListTable({ rows, onNavigate }: PatientListTableProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const pagination = rows.length > PAGE_SIZE
    ? { pageIndex, pageSize: PAGE_SIZE, onPageChange: setPageIndex }
    : undefined;

  useEffect(() => {
    setPageIndex(0);
  }, [rows]);

  return (
    <TooltipProvider delayDuration={150}>
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row.patient.id}
        caption="Lista de pacientes ordenada pela prioridade do próximo acompanhamento."
        ariaLabel="Lista de pacientes"
        emptyMessage="Nenhum paciente encontrado."
        renderRow={(row) => <PatientListTableRow row={row} onNavigate={onNavigate} />}
        pagination={pagination}
        className="overflow-x-auto"
        tableClassName="table-fixed"
      />
    </TooltipProvider>
  );
}
