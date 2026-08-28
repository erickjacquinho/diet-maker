# Interface Contract: DataTable Selection & Checkbox Component

**Feature**: specs/26-08-26-padronizar-data-table-selecao-checkbox
**Date**: 2026-08-26

## 1. Átomo Checkbox (@/components/atoms/Checkbox.tsx)

### Props Contract:
`	ypescript
import * as React from 'react';

export type CheckboxCheckedState = boolean | 'indeterminate';

export interface CheckboxProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: CheckboxCheckedState;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  'aria-label'?: string;
  className?: string;
}
`

### HTML Output Specification:
`html
<button
  type=button
  role=checkbox
  aria-checked=true|false|mixed
  aria-label=...
  class=size-4 rounded-compact border flex items-center justify-center transition-colors duration-fast mx-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus bg-primary border-primary text-on-primary
>
  <!-- if checked === true: <Check size={12} strokeWidth={3} /> -->
  <!-- if checked === 'indeterminate': <span class=w-2 h-0.5 bg-primary rounded-round /> -->
</button>
`

---

## 2. DataTable Selection Contract (@/components/molecules/DataTable.tsx)

### Rendering Rules:
1. **Selection Column (First Column)**:
   - Width: w-10 (40px)
   - Padding: px-3 py-2 text-center
   - Header Cell:
     - mode: 'multi': Renderiza <Checkbox checked={allSelected ? true : someSelected ? 'indeterminate' : false} onCheckedChange={...} />
     - mode: 'single': Renderiza <TableHead className=w-10 px-3 text-center aria-label=Seleção /> (vazio, sem checkbox mestre)
   - Body Cell:
     - Renderiza <Checkbox checked={isSelected} disabled={!isSelectable} onCheckedChange={...} />
2. **Selected Row State**:
   - data-state=selected
   - ClassName: data-[state=selected]:bg-primary-soft/30 hover:data-[state=selected]:bg-primary-soft/40
3. **Typography & Styling Standard**:
   - Headers: 	ext-style-chart-micro font-bold uppercase tracking-wider text-text-secondary bg-surface-subtle h-9
   - Numeric alignment: lign: 'right' renders 	ext-right tabular-nums text-style-legal font-bold
   - Sticky Header: When stickyHeader is enabled, TableHeader applies sticky top-0 z-10 bg-surface-subtle border-b border-border-divider and the container applies overflow-y-auto max-h-[...].
