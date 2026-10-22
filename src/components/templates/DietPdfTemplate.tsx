import { textStyle } from '@/design-system';
import { DataTable, type DataTableColumnDef } from '@/components/molecules/DataTable';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { DietPdfItemView, DietPdfMacrosView, DietPdfMealView } from '@/lib/application/diets/diet-pdf-view';
import type { DietPdfTemplateProps } from './dietPdfTemplateTypes';

export type { DietPdfProfessional, DietPdfTemplateProps } from './dietPdfTemplateTypes';

interface DietPdfMacroRow {
  id: string;
  kind: 'meal-option' | 'day-total' | 'diet-total';
  label: string;
  macros: DietPdfMacrosView | null;
}

type MealFoodRow =
  | { id: string; kind: 'option'; label: string }
  | { id: string; kind: 'food'; item: DietPdfItemView }
  | { id: string; kind: 'empty-option' };

function MealFoodsTable({ meal }: { meal: DietPdfMealView }) {
  const rows: MealFoodRow[] = meal.options.flatMap((option) => [
    ...(meal.options.length > 1
      ? [{ id: `${option.id}-heading`, kind: 'option' as const, label: option.label }]
      : []),
    ...(option.items.length > 0
      ? option.items.map((item) => ({ id: `${option.id}-${item.id}`, kind: 'food' as const, item }))
      : [{ id: `${option.id}-empty`, kind: 'empty-option' as const }]),
  ]);
  const columns: DataTableColumnDef<MealFoodRow>[] = [
    { id: 'name', header: 'Nome', align: 'left', cell: () => null },
    { id: 'quantity', header: 'Quantidade', align: 'right', cell: () => null },
  ];

  return (
    <DataTable
      data={rows}
      columns={columns}
      getRowId={(row) => row.id}
      caption={`Alimentos e quantidades de ${meal.name}`}
      emptyMessage="Nenhuma opção cadastrada."
      readOnly
      ariaLabel={`Alimentos e quantidades de ${meal.name}`}
      className="overflow-hidden rounded-surface border border-border-subtle"
      renderRow={(row, index) => {
        const rowProps = { 'data-row-id': row.id, 'aria-rowindex': index + 2 };
        if (row.kind === 'option') {
          return (
            <TableRow {...rowProps} className="diet-pdf-option-heading h-table-row bg-surface-subtle hover:bg-surface-subtle">
              <TableCell colSpan={2} className="h-table-row border-l border-primary-border px-4 py-1">
                <span className={textStyle('table-cell-strong')}>{row.label}</span>
              </TableCell>
            </TableRow>
          );
        }
        if (row.kind === 'empty-option') {
          return (
            <TableRow {...rowProps} className="h-table-row hover:bg-surface">
              <TableCell colSpan={2} className={`${textStyle('table-cell')} h-table-row px-4 py-1 text-text-secondary`}>
                Nenhum alimento nesta opção.
              </TableCell>
            </TableRow>
          );
        }

        return (
          <TableRow {...rowProps} className="diet-pdf-food-row h-table-row hover:bg-surface">
            <TableCell className={`${textStyle('table-cell')} h-table-row px-4 py-1`}>{row.item.name}</TableCell>
            <TableCell className={`${textStyle('table-number')} h-table-row px-4 py-1 text-right text-text-secondary`}>
              {row.item.quantity} {row.item.unit === 'unit' ? 'un' : row.item.unit}
            </TableCell>
          </TableRow>
        );
      }}
    />
  );
}

function MacroSummary({ macros }: { macros: DietPdfMacrosView | null }) {
  if (!macros) return <span className={`${textStyle('table-cell')} text-text-secondary`}>—</span>;

  return (
    <div
      role="group"
      aria-label={`Proteína ${macros.protein} g; carboidrato ${macros.carbs} g; gordura ${macros.fat} g`}
      className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1"
    >
      <span className={cn(textStyle('table-number'), 'text-macro-protein')}><span aria-hidden="true">P </span>{macros.protein}g</span>
      <span className={`${textStyle('table-cell')} text-text-muted`} aria-hidden="true">·</span>
      <span className={cn(textStyle('table-number'), 'text-macro-carbohydrate')}><span aria-hidden="true">C </span>{macros.carbs}g</span>
      <span className={`${textStyle('table-cell')} text-text-muted`} aria-hidden="true">·</span>
      <span className={cn(textStyle('table-number'), 'text-macro-fat')}><span aria-hidden="true">G </span>{macros.fat}g</span>
    </div>
  );
}

function MealSection({ meal, headingLevel = 2 }: { meal: DietPdfMealView; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <section aria-label={meal.name} className="diet-pdf-meal-block flex flex-col gap-3 border-b border-border-divider pb-4 last:border-b-0">
      <header className="flex flex-wrap items-baseline gap-2">
        <Heading className={textStyle('section-title')}>{meal.name}</Heading>
        {meal.time && <time className={textStyle('metadata')}>{meal.time}</time>}
      </header>
      <MealFoodsTable meal={meal} />
    </section>
  );
}

export function DietPdfTemplate({ document, professional = null }: DietPdfTemplateProps) {
  const isCycle = 'diets' in document;
  const macroRows: DietPdfMacroRow[] = isCycle
    ? document.diets.map((diet) => ({
      id: diet.id,
      kind: 'diet-total',
      label: `Dieta ${diet.number}`,
      macros: diet.macros,
    }))
    : document.meals.flatMap((meal) => meal.options.map((option) => ({
      id: `${meal.id}-${option.id}`,
      kind: 'meal-option',
      label: meal.options.length > 1 ? `${meal.name} · ${option.label}` : meal.name,
      macros: option.macros,
    })));
  if (!isCycle && document.meals.length > 0) {
    macroRows.push({ id: 'day-total', kind: 'day-total', label: 'Total do dia', macros: document.dayMacros });
  }

  const macroColumns: DataTableColumnDef<DietPdfMacroRow>[] = [
    {
      id: 'meal-option',
      header: isCycle ? 'Dieta' : 'Refeição / opção',
      align: 'left',
      cell: (row) => <span className={textStyle(row.kind === 'meal-option' ? 'table-cell' : 'table-cell-strong')}>{row.label}</span>,
    },
    { id: 'macros', header: 'Macronutrientes', align: 'right', cell: (row) => <MacroSummary macros={row.macros} /> },
    {
      id: 'energy',
      header: 'Calorias',
      align: 'right',
      cell: (row) => row.macros
        ? <span className={cn(textStyle('table-number'), 'text-macro-kcal')}>{row.macros.energyKcal} kcal</span>
        : <span className={`${textStyle('table-cell')} text-text-secondary`}>—</span>,
    },
  ];

  return (
    <article
      data-diet-pdf-document
      aria-label="Prescrição alimentar"
      className="mx-auto flex max-w-container-reading flex-col gap-6 border border-border-subtle bg-surface p-6 text-text-primary"
    >
      <header className="flex flex-col gap-3 border-b border-border-divider pb-4">
        <h1 className={textStyle('page-title')}>Prescrição alimentar</h1>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className={textStyle('metadata')}>Paciente</span>
            <p className={textStyle('body-strong')}>{document.patientName}</p>
          </div>
          <div className="flex flex-col gap-1">
            <span className={textStyle('metadata')}>Data da prescrição</span>
            <time className={textStyle('body-strong')} dateTime={document.prescriptionDateIso}>
              {document.prescriptionDate}
            </time>
          </div>
        </div>
        {professional && (
          <div className="flex flex-col gap-1" data-diet-pdf-professional>
            <span className={textStyle('metadata')}>Responsável</span>
            <p className={textStyle('body-strong')}>
              {[professional.name, professional.title, professional.crn].filter(Boolean).join(' · ')}
            </p>
            {professional.contact && <p className={textStyle('body-secondary')}>{professional.contact}</p>}
          </div>
        )}
      </header>

      {isCycle ? (
        document.diets.length === 0 ? (
          <section aria-labelledby="diet-pdf-empty-diets" className="flex flex-col gap-3">
            <h2 id="diet-pdf-empty-diets" className={textStyle('section-title')}>Dietas do ciclo</h2>
            <p className={textStyle('body-secondary')}>Nenhuma dieta configurada.</p>
          </section>
        ) : document.diets.map((diet) => {
          const details = [diet.name, diet.assignedDays.join(', ')].filter(Boolean).join(' · ');
          return (
            <section key={diet.id} aria-label={`Dieta ${diet.number}`} className="diet-pdf-cycle-diet flex flex-col gap-3 border-b border-border-divider pb-4 last:border-b-0">
              <header className="flex flex-wrap items-baseline gap-2">
                <h2 className={textStyle('section-title')}>Dieta {diet.number}</h2>
                {details && <p className={textStyle('metadata')}>{details}</p>}
              </header>
              {diet.meals.length === 0
                ? <p className={textStyle('body-secondary')}>Nenhuma refeição cadastrada.</p>
                : diet.meals.map((meal) => <MealSection key={meal.id} meal={meal} headingLevel={3} />)}
            </section>
          );
        })
      ) : document.meals.length === 0 ? (
        <section aria-labelledby="diet-pdf-empty-meals" className="flex flex-col gap-3">
          <h2 id="diet-pdf-empty-meals" className={textStyle('section-title')}>Refeições</h2>
          <p className={textStyle('body-secondary')}>Nenhuma refeição cadastrada.</p>
        </section>
      ) : document.meals.map((meal) => <MealSection key={meal.id} meal={meal} />)}

      <section aria-labelledby="diet-pdf-macros-title" className="diet-pdf-summary flex flex-col gap-3 border-t border-border-divider pt-5">
        <h2 id="diet-pdf-macros-title" className={textStyle('section-title')}>{isCycle ? 'Macros' : 'Macros das refeições'}</h2>
        <p className={textStyle('caption')}>
          {isCycle
            ? 'Resumo de macronutrientes e calorias de cada dieta do ciclo.'
            : 'Cada linha mostra uma opção. O total do dia considera apenas as opções principais.'}
        </p>
        <DataTable
          data={macroRows}
          columns={macroColumns}
          getRowId={(row) => row.id}
          caption={isCycle ? 'Macros por dieta do ciclo' : 'Macros por refeição e total do dia'}
          emptyMessage={isCycle ? 'Macros indisponíveis sem itens prescritos.' : 'Macros indisponíveis sem refeições prescritas.'}
          readOnly
          ariaLabel={isCycle ? 'Macros por dieta do ciclo' : 'Macros por refeição e total do dia'}
          renderRow={(row, index) => (
            <TableRow
              key={row.id}
              data-row-id={row.id}
              aria-rowindex={index + 2}
              className={cn(
                'diet-pdf-macro-row h-table-row border-b border-border-divider hover:bg-surface',
                row.kind === 'day-total' && 'diet-pdf-day-total-row border-t border-border-divider bg-surface-subtle font-semibold hover:bg-surface-subtle',
                row.kind === 'diet-total' && 'diet-pdf-cycle-total-row border-t border-border-divider bg-surface-subtle font-semibold hover:bg-surface-subtle',
              )}
            >
              {macroColumns.map((column) => (
                <TableCell key={column.id} className={cn('h-table-row px-4 py-1 align-middle', column.align === 'right' && 'text-right tabular-nums')}>
                  {column.cell(row, index)}
                </TableCell>
              ))}
            </TableRow>
          )}
          className="overflow-hidden rounded-surface border border-border-subtle"
        />
      </section>
    </article>
  );
}
