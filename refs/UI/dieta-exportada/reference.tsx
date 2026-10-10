import React, { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Link2 } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { MacroSummary } from '@/components/molecules/MacroSummary';
import { formatDateOnly } from '@/lib/date-only';
import { ActionDropdown } from '@/components/molecules/ActionDropdown';
import { DataTable, type DataTableColumnDef } from '@/components/molecules/DataTable';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { textStyle } from '@/design-system';
import { meals } from './sample-data';
import '@/app/globals.css';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';

// Uso único e experimental: composição local de capacidades existentes (DS 09, seção 6).
// Nenhum componente base, variante, API pública ou regra visual foi criado.
type Food = { id: string; name: string; quantity: string };
const foodColumns: DataTableColumnDef<Food>[] = [
  { id: 'name', header: 'Alimento', cell: row => <span className={textStyle('table-cell')}>{row.name}</span> },
  { id: 'quantity', header: 'Quantidade', align: 'right', cell: row => <span className={textStyle('table-number')}>{row.quantity}</span> },
];
const optionLabel = (index: number) => index === 0 ? 'Principal' : `Alternativa ${index}`;
const summary = meals.map((meal, index) => ({ id: String(index), name: meal.name, values: meal.macros }));
summary.push({ id: 'total', name: 'Total do dia', values: [108, 162, 46, 1494] });
const macroColumns: DataTableColumnDef<typeof summary[number]>[] = [
  { id: 'name', header: 'Refeição', cell: row => <span className={textStyle(row.id === 'total' ? 'table-cell-strong' : 'table-cell')}>{row.name}</span> },
  { id: 'macros', header: 'Macros', align: 'right', cell: row => <MacroSummary
    protein={row.values[0].toLocaleString('pt-BR')} carbs={row.values[1].toLocaleString('pt-BR')}
    fats={row.values[2].toLocaleString('pt-BR')} kcal={row.values[3].toLocaleString('pt-BR')} /> },
];

function ReferencePage() {
  const [open, setOpen] = useState(false);
  const [checkedFoods, setCheckedFoods] = useState<Record<string, Set<string>>>({});
  const trigger = useRef<HTMLButtonElement>(null);
  const exported = new URLSearchParams(location.search).get('view') === 'exported';
  return (
    <main className="mx-auto flex max-w-container-workflow flex-col gap-8 px-8 py-6">
      <header className="flex items-center justify-between gap-4">
        <p className={textStyle('subsection-title')}>NutriDiet</p>
        <p className={textStyle('metadata')}>{exported ? 'Plano alimentar · acompanhamento' : 'Protótipo · dados fictícios'}</p>
        {!exported && <ActionDropdown
          trigger={<Button ref={trigger} variant="secondary">Exportar dieta</Button>}
          items={[{ id: 'external', label: 'Exportar como página externa', icon: <Link2 size={16} aria-hidden="true" />, onSelect: () => setOpen(true) }]}
        />}
      </header>
      <Separator />
      <header className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-2">
          <p className={textStyle('metadata')}>Plano alimentar · Dieta simples</p>
          <h1 className={textStyle('page-title')}>Seu plano alimentar</h1>
          <p className={textStyle('body-strong')}>Marina Oliveira</p>
          <p className={textStyle('caption')}>Prescrição de <time dateTime="2026-09-30">{formatDateOnly('2026-09-30')}</time></p>
        </div>
        <div className="flex flex-col gap-2">
          <p className={textStyle('body')}>Camila Santos · Nutricionista</p>
          <p className={textStyle('caption')}>CRN fictício · referência de layout</p>
        </div>
      </header>
      <Separator />
      <div className="flex flex-col gap-2">
        <p className={textStyle('body')}>Escolha uma opção por refeição.</p>
        <p className={textStyle('body-secondary')}>Quando houver alternativas, use as abas ao lado do título para consultar os alimentos.</p>
      </div>
      {meals.map((meal, mealIndex) => (
        <section key={meal.name} aria-labelledby={`meal-${mealIndex}`}>
          <Tabs defaultValue="0" className="flex flex-col gap-3">
            <header className="flex flex-wrap items-center gap-4">
              <h2 id={`meal-${mealIndex}`} className={textStyle('section-title')}>{meal.name}</h2>
              <time className={textStyle('metadata')}>{meal.time}</time>
              {meal.options.length > 1 && <TabsList aria-label={`Opções de ${meal.name}`}>
                {meal.options.map((_, index) => <TabsTrigger key={index} value={String(index)}>{optionLabel(index)}</TabsTrigger>)}
              </TabsList>}
            </header>
            {meal.options.map((items, index) => {
              const table = <DataTable
                data={items.map(([name, quantity], id) => ({ id: String(id), name, quantity }))}
                columns={foodColumns} getRowId={row => row.id}
                caption={`Alimentos e quantidades · ${meal.name} · ${optionLabel(index)}`}
                emptyMessage="Nenhum alimento nesta opção."
                selection={{
                  mode: 'multi', selectOnRowClick: true,
                  selectedRowIds: checkedFoods[mealIndex + ':' + index] ?? new Set<string>(),
                  onSelectionChange: selected => setCheckedFoods(previous => ({ ...previous, [mealIndex + ':' + index]: selected })),
                  selectRowAriaLabel: row => 'Marcar ' + row.name,
                  selectAllAriaLabel: 'Marcar todos os alimentos de ' + meal.name + ' · ' + optionLabel(index),
                }}
                className="overflow-hidden rounded-surface border border-border-subtle"
              />;
              return meal.options.length > 1
                ? <TabsContent key={index} value={String(index)}>{table}</TabsContent>
                : <React.Fragment key={index}>{table}</React.Fragment>;
            })}
          </Tabs>
        </section>
      ))}
      <section className="flex flex-col gap-3" aria-labelledby="summary-title">
        <h2 id="summary-title" className={textStyle('section-title')}>Resumo nutricional</h2>
        <p className={textStyle('caption')}>Valores ilustrativos das opções principais. Consultar uma alternativa não altera o total prescrito.</p>
        <DataTable data={summary} columns={macroColumns} getRowId={row => row.id}
          caption="Resumo nutricional das opções principais" emptyMessage="Nenhum valor informado." readOnly
          className="overflow-hidden rounded-surface border border-border-subtle" />
      </section>
      <Separator />
      <footer className="flex items-center justify-between gap-4">
        <p className={textStyle('caption')}>Plano alimentar de Marina Oliveira</p>
        <p className={textStyle('metadata')}>NutriDiet · acompanhamento nutricional</p>
      </footer>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onCloseAutoFocus={event => { event.preventDefault(); trigger.current?.focus(); }}>
          <DialogHeader>
            <DialogTitle>Exportar página inteligente</DialogTitle>
            <DialogDescription>Confira a apresentação antes de abrir a página externa da dieta.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <p className={textStyle('body-strong')}>Marina Oliveira · Dieta simples</p>
            <p className={textStyle('body-secondary')}>4 refeições · alimentos e quantidades em tabela · alternativas em abas</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className={textStyle('body-strong')}>Configurações de exportação</p>
            <p className={textStyle('body-secondary')}>As configurações serão definidas na próxima etapa. Esta referência apresenta o layout padrão.</p>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={() => {
              const url = new URL(location.href); url.searchParams.set('view', 'exported');
              window.open(url.href, '_blank', 'noopener'); setOpen(false);
            }}>Abrir página inteligente</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
createRoot(document.getElementById('root')!).render(<ReferencePage />);
