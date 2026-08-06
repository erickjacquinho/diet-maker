import Link from 'next/link';
import type { KeyboardEvent, MouseEvent } from 'react';
import {
  AlertCircle,
  ChevronRight,
  ClipboardCheck,
  FilePenLine,
  Mars,
  Venus,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { PatientListGroupId, PatientListRow } from '@/lib/patientListView';

export interface PatientListTableProps {
  rows: PatientListRow[];
  onNavigate?: (href: string) => void;
}

const groupTone: Record<PatientListGroupId, string> = {
  'no-event': 'text-warning',
  overdue: 'text-error',
  today: 'text-primary',
  upcoming: 'text-text-primary',
};

function EventIcon({ row }: { row: PatientListRow }) {
  if (row.patient.nextEvent?.type === 'assessment-update') {
    return <ClipboardCheck size={15} aria-hidden="true" />;
  }
  if (row.patient.nextEvent?.type === 'diet-update') {
    return <FilePenLine size={15} aria-hidden="true" />;
  }
  return <AlertCircle size={15} aria-hidden="true" />;
}

function GenderIcon({ gender }: { gender: string }) {
  const normalizedGender = gender.trim().toLocaleLowerCase('pt-BR');
  const isFeminine = normalizedGender === 'feminino' || normalizedGender === 'female';
  const isMasculine = normalizedGender === 'masculino' || normalizedGender === 'male';
  if (!isFeminine && !isMasculine) return null;

  const Icon = isFeminine ? Venus : Mars;
  const genderValue = isFeminine ? 'venus' : 'mars';

  return (
    <Icon
      size={14}
      strokeWidth={1.8}
      aria-hidden="true"
      data-testid="patient-gender-icon"
      data-gender={genderValue}
      className="shrink-0 text-text-muted"
    />
  );
}

function RecordIndicators({ row }: { row: PatientListRow }) {
  return (
    <span
      className="flex w-2 shrink-0 flex-col items-center gap-1"
      role="img"
      aria-label={row.history.recordIndicatorLabel}
      data-testid="record-indicators"
    >
      <span
        className={`h-1.5 w-1.5 rounded-round ${row.history.hasAssessment ? 'bg-text-muted' : 'bg-transparent'}`}
        aria-hidden="true"
        data-indicator="assessment"
      />
      <span
        className={`h-1.5 w-1.5 rounded-round ${row.history.hasDiet ? 'bg-info' : 'bg-transparent'}`}
        aria-hidden="true"
        data-indicator="diet"
      />
    </span>
  );
}

function getObjectiveLabel(objective: string): string {
  if (objective === 'Recomposição Corporal') return 'Recomposição';
  return objective || 'Acompanhamento';
}

export function PatientListTable({ rows, onNavigate }: PatientListTableProps) {
  const handleRowClick = (event: MouseEvent<HTMLTableRowElement>, href: string) => {
    if ((event.target as HTMLElement).closest('a')) return;
    onNavigate?.(href);
  };

  const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, href: string) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onNavigate?.(href);
  };

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
            <TableRow
              key={row.patient.id}
              tabIndex={0}
              role="link"
              aria-label={`Abrir perfil de ${row.patient.name}`}
              className="group min-h-table-row cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              onClick={(event) => handleRowClick(event, row.href)}
              onKeyDown={(event) => handleRowKeyDown(event, row.href)}
            >
              <TableCell className="relative px-4 py-3">
                <Link
                  href={row.href}
                  tabIndex={-1}
                  aria-label={`Ver perfil de ${row.patient.name}`}
                  className="flex min-w-0 items-center gap-3 text-text-primary focus-visible:outline-none"
                >
                  <RecordIndicators row={row} />
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="text-style-body-small font-semibold truncate group-hover:text-primary">
                      {row.patient.name}
                    </span>
                    <span className="flex items-center gap-1.5 text-style-legal font-medium text-text-muted">
                      <GenderIcon gender={row.patient.gender} />
                      <span>{row.patient.age} anos</span>
                    </span>
                  </span>
                </Link>
              </TableCell>
              <TableCell className="px-4 py-3 align-middle">
                <span
                  className="inline-flex max-w-full truncate rounded-control border border-border-subtle bg-surface-subtle px-2 py-1 text-style-legal font-medium text-text-secondary"
                  title={row.patient.objective}
                >
                  {getObjectiveLabel(row.patient.objective)}
                </span>
              </TableCell>
              <TableCell className="px-4 py-3 align-middle">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-style-body-small font-semibold text-text-primary">
                    {row.history.bodyFatLabel}
                  </span>
                  <span className="text-style-legal font-medium text-text-muted">
                    {row.history.bodyFatDeltaLabel ?? 'Sem comparação anterior'}
                  </span>
                </div>
              </TableCell>
              <TableCell className="px-4 py-3 align-middle">
                <div className={`flex items-start gap-2 ${groupTone[row.group]}`}>
                  <span className="mt-0.5 shrink-0">
                    <EventIcon row={row} />
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-style-body-small font-semibold">{row.eventStatusLabel}</span>
                    <span className="text-style-legal text-text-secondary">
                      {row.eventTypeLabel ?? 'Defina o tipo e a data no perfil'}
                      {row.eventDateLabel ? ` · ${row.eventDateLabel}` : ''}
                    </span>
                  </span>
                </div>
              </TableCell>
              <TableCell className="px-4 py-3 text-right align-middle">
                <ChevronRight
                  size={18}
                  aria-hidden="true"
                  data-testid="patient-row-chevron"
                  className="ml-auto text-text-muted transition-colors duration-fast ease-standard group-hover:text-primary"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
