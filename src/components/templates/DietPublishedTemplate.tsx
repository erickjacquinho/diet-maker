 'use client';
import React, { useState } from 'react';
import { DataTable, type DataTableColumnDef } from '@/components/molecules/DataTable';
import { MacroSummary } from '@/components/molecules/MacroSummary';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { textStyle } from '@/design-system';
import type { DietPdfViewModel } from '@/lib/application/diets/diet-pdf-view';
type Food = { id: string; name: string; quantity: string };
const foodColumns: DataTableColumnDef<Food>[] = [
  { id: 'name', header: 'Alimento', cell: row => <span className={textStyle('table-cell')}>{row.name}</span> },
  { id: 'quantity', header: 'Quantidade', align: 'right', cell: row => <span className={textStyle('table-number')}>{row.quantity}</span> },
];

export interface DietPublishedTemplateProps { document: DietPdfViewModel; checklist?: boolean; mealMacros?: boolean; dayMacros?: boolean; }
export function DietPublishedTemplate({ document, checklist = true, mealMacros = true, dayMacros = true }: DietPublishedTemplateProps) {
 const [checked, setChecked] = useState<Record<string, Set<string>>>({});
 const summary = (mealMacros ? document.meals : []).map(meal => ({ id: meal.id, name: meal.name, macros: meal.options[0]?.macros ?? null }));
 if (dayMacros) summary.push({ id: 'total', name: 'Total do dia', macros: document.dayMacros });
 const macroColumns: DataTableColumnDef<typeof summary[number]>[] = [
  { id: 'name', header: 'Refeição', cell: row => <span className={textStyle('table-cell')}>{row.name}</span> },
  { id: 'macros', header: 'Macros', align: 'right', cell: row => row.macros ? <MacroSummary protein={row.macros.protein} carbs={row.macros.carbs} fats={row.macros.fat} kcal={row.macros.energyKcal} /> : '—' },
 ];
 return <article className="flex flex-col gap-6">
 <header className="flex flex-col gap-2"><h1 className={textStyle('page-title')}>Seu plano alimentar</h1><p className={textStyle('body-strong')}>{document.patientName}</p><p className={textStyle('caption')}>Prescrição de <time dateTime={document.prescriptionDateIso}>{document.prescriptionDate}</time></p></header>
 {document.meals.map(meal => <section key={meal.id} aria-label={meal.name}><Tabs defaultValue={meal.options[0]?.id} className="flex flex-col gap-3"><header className="flex flex-wrap items-center gap-4"><h2 className={textStyle('section-title')}>{meal.name}</h2><time className={textStyle('metadata')}>{meal.time}</time>{meal.options.length > 1 && <TabsList aria-label={'Opções de '+meal.name}>{meal.options.map(option => <TabsTrigger key={option.id} value={option.id}>{option.label}</TabsTrigger>)}</TabsList>}</header>
 {meal.options.map(option => {
 const key=meal.id+':'+option.id;
 const table=<DataTable data={option.items.map(item => ({ id:item.id,name:item.name,quantity:item.quantity+' '+(item.unit==='unit'?'un':item.unit) }))} columns={foodColumns} getRowId={row=>row.id} caption={'Alimentos de '+meal.name+' · '+option.label} emptyMessage="Nenhum alimento nesta opção." readOnly={!checklist} selection={checklist ? {mode:'multi',selectOnRowClick:true,selectedRowIds:checked[key]??new Set(),onSelectionChange:ids=>setChecked(previous=>({...previous,[key]:ids})),selectRowAriaLabel:row=>'Marcar '+row.name} : undefined} className="overflow-hidden rounded-surface border border-border-subtle"/>;
 return meal.options.length>1?<TabsContent key={option.id} value={option.id}>{table}</TabsContent>:<React.Fragment key={option.id}>{table}</React.Fragment>;
 })}</Tabs></section>)}
 {(mealMacros || dayMacros) && <section className="flex flex-col gap-3"><h2 className={textStyle('section-title')}>Resumo nutricional</h2><p className={textStyle('caption')}>Os valores consideram somente as opções principais.</p><DataTable data={summary} columns={macroColumns} getRowId={row=>row.id} caption="Resumo nutricional" emptyMessage="Nenhum valor informado." readOnly className="overflow-hidden rounded-surface border border-border-subtle"/></section>}
 </article>;
}
