import Link from 'next/link';
import type { KeyboardEvent, MouseEvent } from 'react';
import {
  AlertCircle,
  ChevronRight,
  ClipboardCheck,
  FilePenLine,
  Mars,
  Scale,
  Utensils,
  Venus,
} from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { PatientListGroupId, PatientListRow } from '@/lib/patientListView';

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
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <span
          className="flex w-3.5 shrink-0 flex-col items-center gap-1 cursor-help"
          role="img"
          aria-label={row.history.recordIndicatorLabel}
          data-testid="record-indicators"
          onClick={(e) => e.stopPropagation()}
        >
          <Scale
            size={12}
            strokeWidth={1.8}
            aria-hidden="true"
            data-indicator="assessment"
            className={`shrink-0 transition-opacity ${
              row.history.hasAssessment
                ? 'text-text-muted opacity-100'
                : 'opacity-0 pointer-events-none'
            }`}
          />
          <Utensils
            size={12}
            strokeWidth={1.8}
            aria-hidden="true"
            data-indicator="diet"
            className={`shrink-0 transition-opacity ${
              row.history.hasDiet
                ? 'text-text-muted opacity-100'
                : 'opacity-0 pointer-events-none'
            }`}
          />
        </span>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8} className="text-style-legal font-medium">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Scale
              size={13}
              className={row.history.hasAssessment ? 'text-text-muted' : 'text-text-muted/40'}
              aria-hidden="true"
            />
            <span className={row.history.hasAssessment ? 'text-text-primary' : 'text-text-muted'}>
              {row.history.hasAssessment ? 'Avaliação física registrada' : 'Sem avaliação física'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Utensils
              size={13}
              className={row.history.hasDiet ? 'text-text-muted' : 'text-text-muted/40'}
              aria-hidden="true"
            />
            <span className={row.history.hasDiet ? 'text-text-primary' : 'text-text-muted'}>
              {row.history.hasDiet ? 'Dieta registrada' : 'Sem dieta'}
            </span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function getObjectiveLabel(objective: string): string {
  if (objective === 'Recomposição Corporal') return 'Recomposição';
  return objective || 'Acompanhamento';
}

export function PatientListTableRow({
  row,
  onNavigate,
}: {
  row: PatientListRow;
  onNavigate?: (href: string) => void;
}) {
  const handleRowClick = (event: MouseEvent<HTMLTableRowElement>, href: string) => {
    if ((event.target as HTMLElement).closest('a')) return;
    onNavigate?.(href);
  };

  const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, href: string) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onNavigate?.(href);
  };

  const patientMeta = [
    row.patient.age ? `${row.patient.age} anos` : null,
    row.patient.heightCm ? `${row.patient.heightCm} cm` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const hasBodyFat = row.history.currentBodyFatPercent !== null;
  const bodyFatSubtitle = row.history.bodyFatDeltaLabel ?? (hasBodyFat ? 'Sem comparação' : 'Sem histórico');

  const nextEventSubtitle = row.eventTypeLabel
    ? `${row.eventTypeLabel}${row.eventDateLabel ? ` · ${row.eventDateLabel}` : ''}`
    : 'Definir no perfil';

  return (
    <TableRow
      tabIndex={0}
      role="link"
      aria-label={`Abrir perfil de ${row.patient.name}`}
      className="group min-h-table-row cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      onClick={(event) => handleRowClick(event, row.href)}
      onKeyDown={(event) => handleRowKeyDown(event, row.href)}
    >
      <TableCell className="relative px-4 py-3 align-middle">
        <Link
          href={row.href}
          tabIndex={-1}
          aria-label={`Ver perfil de ${row.patient.name}`}
          className="flex min-w-0 items-center gap-3 text-text-primary focus-visible:outline-none"
        >
          <RecordIndicators row={row} />
          <span className="flex min-w-0 flex-col gap-1">
            <span
              className="text-style-body-small font-semibold truncate whitespace-nowrap group-hover:text-primary"
              title={row.patient.name}
            >
              {row.patient.name}
            </span>
            <span
              className="flex items-center gap-1.5 text-style-legal font-medium text-text-muted min-h-[1rem] truncate whitespace-nowrap"
              title={patientMeta || undefined}
            >
              <GenderIcon gender={row.patient.gender} />
              <span className="truncate whitespace-nowrap">
                {patientMeta || '—'}
              </span>
            </span>
          </span>
        </Link>
      </TableCell>
      <TableCell className="px-4 py-3 align-middle">
        <span
          className="inline-flex max-w-full truncate whitespace-nowrap rounded-control border border-border-subtle bg-surface-subtle px-2 py-1 text-style-legal font-medium text-text-secondary"
          title={row.patient.objective}
        >
          {getObjectiveLabel(row.patient.objective)}
        </span>
      </TableCell>
      <TableCell className="px-4 py-3 align-middle">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span
            className="text-style-body-small font-semibold text-text-primary truncate whitespace-nowrap"
            title={row.history.bodyFatLabel}
          >
            {row.history.bodyFatLabel}
          </span>
          <span
            className="text-style-legal font-medium text-text-muted truncate whitespace-nowrap"
            title={bodyFatSubtitle}
          >
            {bodyFatSubtitle}
          </span>
        </div>
      </TableCell>
      <TableCell className="px-4 py-3 align-middle">
        <div className={`flex min-w-0 items-start gap-2 ${groupTone[row.group]}`}>
          <span className="mt-0.5 shrink-0">
            <EventIcon row={row} />
          </span>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span
              className="text-style-body-small font-semibold truncate whitespace-nowrap"
              title={row.eventStatusLabel}
            >
              {row.eventStatusLabel}
            </span>
            <span
              className="text-style-legal text-text-secondary truncate whitespace-nowrap"
              title={nextEventSubtitle}
            >
              {nextEventSubtitle}
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
  );
}
