import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { PatientListRow } from '@/lib/patientListView';
import { PatientListTableRow } from './patient/PatientListTableRow';

export interface PatientListTableProps {
  rows: PatientListRow[];
  onNavigate?: (href: string) => void;
}

export function PatientListTable({ rows, onNavigate }: PatientListTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table className="table-fixed">
        <TableCaption className="sr-only">
          Lista contínua de pacientes ordenada pela prioridade do próximo acompanhamento.
        </TableCaption>
        <TableHeader>
          <TableRow className="bg-surface-subtle hover:bg-surface-subtle">
            <TableHead scope="col" className="w-[27%] text-style-legal font-semibold tracking-label text-text-secondary">
              Paciente
            </TableHead>
            <TableHead scope="col" className="w-[19%] text-style-legal font-semibold tracking-label text-text-secondary">
              Objetivo
            </TableHead>
            <TableHead scope="col" className="w-[20%] text-style-legal font-semibold tracking-label text-text-secondary">
              Evolução de gordura
            </TableHead>
            <TableHead scope="col" className="w-[29%] text-style-legal font-semibold tracking-label text-text-secondary">
              Próximo acompanhamento
            </TableHead>
            <TableHead scope="col" className="w-[5%] text-right">
              <span className="sr-only">Abrir perfil</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row) => (
            <PatientListTableRow key={row.patient.id} row={row} onNavigate={onNavigate} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
