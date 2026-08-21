# Data Model & Component Contracts: Padronização de Tabelas Shadcn Data Table

**Feature**: [spec.md](spec.md) | **Date**: 2026-08-07

## 1. Generic DataTable Component Contracts (`src/components/ui/data-table.tsx`)

### `DataTableColumnDef<T>`

```typescript
export interface DataTableColumnDef<T> {
  id: string;
  header: React.ReactNode | ((info: { data: T[] }) => React.ReactNode);
  accessorKey?: keyof T;
  cell?: (row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
}
```

### `DataTableProps<T>`

```typescript
export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumnDef<T>[];
  keyExtractor: (item: T, index: number) => string;
  onRowClick?: (item: T, event: React.MouseEvent) => void;
  emptyMessage?: React.ReactNode;
  className?: string;
  tableClassName?: string;
  renderSubRow?: (item: T) => React.ReactNode;
  isRowExpanded?: (item: T) => boolean;
  getRowClassName?: (item: T, index: number) => string;
  ariaLabel?: string;
  ariaCaption?: string;
}
```

## 2. Refactored Component Contracts

### `FoodTableSection`
- **Props**: `foods: FoodItem[]`, `onSelectFood: (food: FoodItem) => void`, `sortBy`, `sortDirection`, `onSortChange`, `emptyMessage`.
- **Columns**: Alimento (nome/marca), Categoria, Calorias (kcal), Proteína (g), Carboidratos (g), Gorduras (g), Ações.

### `PatientListTable`
- **Props**: `rows: PatientListRow[]`, `onNavigate: (href: string) => void`.
- **Columns**: Nome do Paciente, Idade / Sexo, Última Consulta, Objetivo / Status, Ações.

### `PatientConsultationHistoryTable`
- **Props**: `consultations: ConsolidatedConsultationUpdate[]`, `onViewDetails: (id: string) => void`.
- **Columns**: Data / Consulta, Tipo de Registro, Dados Dietéticos, Valores Corporais, Ação / Detalhes.
