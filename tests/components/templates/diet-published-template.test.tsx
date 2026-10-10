import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DietPublishedTemplate } from '@/components/templates/DietPublishedTemplate';
import type { DietPdfViewModel } from '@/lib/application/diets/diet-pdf-view';
const document: DietPdfViewModel = { patientName:'Ana', prescriptionDate:'30/09/2026',prescriptionDateIso:'2026-09-30',dayMacros:{protein:'10',carbs:'20',fat:'5',energyKcal:'165'},meals:[{id:'meal',name:'Café',time:'08:00',options:[{id:'main',label:'Principal',macros:null,items:[{id:'food',name:'Banana',quantity:'80',unit:'g'}]},{id:'alternative',label:'Alternativa 1',macros:null,items:[{id:'other',name:'Mamão',quantity:'100',unit:'g'}]}]}] };
describe('DietPublishedTemplate',()=>{it('shows real prescription, checks whole food row and keeps alternatives in tabs',()=>{
render(<DietPublishedTemplate document={document}/>);
expect(screen.getByText('30/09/2026')).toBeVisible();
expect(screen.getByText('Banana')).toBeVisible();expect(screen.queryByText('Mamão')).not.toBeInTheDocument();
const row=screen.getByText('Banana').closest('tr')!;fireEvent.click(screen.getByText('Banana'));expect(within(row).getByRole('checkbox')).toHaveAttribute('aria-checked','true');
fireEvent.keyDown(row,{key:' '});expect(within(row).getByRole('checkbox')).toHaveAttribute('aria-checked','false');
const summary=screen.getByRole('table',{name:'Resumo nutricional'});expect(within(summary).getAllByRole('columnheader')).toHaveLength(2);
})});


describe('Page content options', () => {
 it('hides checklist and meal macros while retaining the day total', () => {
  render(<DietPublishedTemplate document={document} checklist={false} mealMacros={false} dayMacros />);
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  const summary=screen.getByRole('table',{name:'Resumo nutricional'});
  expect(within(summary).getAllByRole('row')).toHaveLength(2);
  expect(within(summary).getByText('Total do dia')).toBeVisible();
 });
 it('hides daily total independently and removes the summary when both macros options are off', () => {
  const {rerender}=render(<DietPublishedTemplate document={document} mealMacros dayMacros={false}/>);
  expect(screen.queryByText('Total do dia')).not.toBeInTheDocument();
  expect(screen.getByRole('table',{name:'Resumo nutricional'})).toBeVisible();
  rerender(<DietPublishedTemplate document={document} mealMacros={false} dayMacros={false}/>);
  expect(screen.queryByRole('table',{name:'Resumo nutricional'})).not.toBeInTheDocument();
  expect(screen.getByText('Banana')).toBeVisible();
 });
});
