# Table Styling & Design System Tokens

## Typography Tokens

- **Table Headers (`TableHead` / `headerClassName`)**:
  - Class: `text-style-chart-micro font-bold uppercase tracking-wider text-text-secondary`
  - Canonical height: `h-9`
  - Canonical surface: `bg-surface-subtle`
  - Bottom border: `border-b border-border-divider`

- **Standard Text Cells (`TableCell` / `className`)**:
  - Class: `text-style-legal text-text-primary`
  - Default padding: `p-4 align-middle`
  - Compact / Modal padding: `py-2.5 px-3`

- **Numeric & Metric Cells**:
  - Class: `text-right tabular-nums text-style-legal font-bold` (or `font-medium`)

- **Macro Highlight Tokens**:
  - Protein: `text-macro-protein`
  - Carbohydrate: `text-macro-carbohydrate`
  - Fats: `text-macro-fat`
  - Calories: `text-text-primary font-bold` with `<span className="text-style-chart-micro text-text-muted font-normal">kcal</span>`

## Dimensions & Layout Standards

- **Selection Column**:
  - Header: `w-10 px-3 text-center h-9 bg-surface-subtle`
  - Cell: `w-10 px-3 py-2 text-center`
  - Checkbox atom: canonical size `size-4 rounded-compact`

- **Container & Bounded Scroll (`stickyHeader`)**:
  - Container: `relative w-full overflow-y-auto overflow-x-hidden border border-border-divider rounded-control`
  - Header element: `sticky top-0 z-raised bg-surface-subtle`
  - Z-Index rule: always use semantic layer `z-raised` (raw numbers like `z-10` or `z-20` violate the design system).

- **Selected Row Highlight**:
  - Attribute: `data-state="selected"`
  - Class: `data-[state=selected]:bg-primary-soft/30 hover:data-[state=selected]:bg-primary-soft/40`
