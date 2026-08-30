import { DataTable, type DataTableColumnDef } from '@/components/molecules/DataTable';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { PatientListRow } from '@/lib/patientListView';
import { PatientListTableRow } from './patient/PatientListTableRow';

export interface PatientListTableProps {
  rows: PatientListRow[];
  onNavigate?: (href: string) => void;
}

const columns: DataTableColumnDef<PatientListRow>[] = [
  {
    id: 'patient',
    header: 'Paciente',
    headerClassName: 'w-[26%] text-style-legal font-semibold tracking-label text-text-secondary',
    cell: () => null,
  },
  {
    id: 'objective',
    header: 'Objetivo',
    headerClassName: 'w-[16%] text-style-legal font-semibold tracking-label text-text-secondary',
    cell: () => null,
  },
  {
    id: 'body-fat',
    header: 'Evolução de gordura',
    headerClassName: 'w-[22%] text-style-legal font-semibold tracking-label text-text-secondary',
    cell: () => null,
  },
  {
    id: 'next-event',
    header: 'Próximo acompanhamento',
    headerClassName: 'w-[32%] text-style-legal font-semibold tracking-label text-text-secondary',
    cell: () => null,
  },
  {
    id: 'actions',
    header: <span className="sr-only">Abrir perfil</span>,
    headerClassName: 'w-[4%] text-right',
    cell: () => null,
  },
];

export function PatientListTable({ rows, onNavigate }: PatientListTableProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row.patient.id}
        caption="Lista contínua de pacientes ordenada pela prioridade do próximo acompanhamento."
        ariaLabel="Lista de pacientes"
        emptyMessage="Nenhum paciente encontrado."
        renderRow={(row) => <PatientListTableRow row={row} onNavigate={onNavigate} />}
        className="overflow-x-auto"
        tableClassName="table-fixed"
      />
    </TooltipProvider>
  );
}
