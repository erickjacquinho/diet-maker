# Data Model: Padronização do Componente DataTable com Seleção e Checkbox Canônico

**Feature**: specs/26-08-26-padronizar-data-table-selecao-checkbox
**Date**: 2026-08-26

## 1. Átomo Checkbox

### CheckboxProps
Representa o contrato de propriedades do átomo @/components/atoms/Checkbox.tsx.

`	ypescript
export type CheckboxCheckedState = boolean | 'indeterminate';

export interface CheckboxProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: CheckboxCheckedState;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  'aria-label'?: string;
  className?: string;
}
`

#### Estados:
- checked === true: Renderiza fundo primário g-primary border-primary text-on-primary com ícone Check size={12} strokeWidth={3}.
- checked === false: Renderiza fundo neutro g-surface border-border-subtle hover:border-border-hover.
- checked === 'indeterminate': Renderiza g-primary-soft border-primary text-primary com traço horizontal <span className=w-2 h-0.5 bg-primary rounded-round />.

---

## 2. Configuração de Seleção do DataTable

### DataTableSelectionConfig<TData>
Representa a configuração passada ao DataTableProps<TData>.

`	ypescript
export type DataTableSelectionMode = 'single' | 'multi';

export interface DataTableSelectionConfig<TData> {
  /** Modo de seleção: múltipla com selecionar todos ou única exclusiva */
  mode: DataTableSelectionMode;

  /** Conjunto ou array com os IDs das linhas selecionadas */
  selectedRowIds: Set<string> | string[];

  /** Callback disparado quando a seleção é alterada */
  onSelectionChange: (selectedIds: Set<string>, selectedRows: TData[]) => void;

  /** Predicado opcional para desabilitar a seleção de linhas específicas */
  isSelectable?: (row: TData, index: number) => boolean;

  /** Se o clique no corpo da linha deve alternar a seleção (padrão: false) */
  selectOnRowClick?: boolean;

  /** Texto acessível para o botão/checkbox mestre do cabeçalho */
  selectAllAriaLabel?: string;

  /** Função geradora do texto acessível por linha */
  selectRowAriaLabel?: (row: TData, index: number) => string;
}
`

---

## 3. Extensões da Interface DataTableProps<TData>

`	ypescript
export interface DataTableProps<TData> {
  data: TData[];
  columns: DataTableColumnDef<TData>[];
  getRowId: (row: TData, index: number) => string;
  caption: ReactNode;
  emptyMessage: ReactNode;
  loading?: boolean;
  errorMessage?: ReactNode;
  readOnly?: boolean;
  sort?: {
    state: DataTableSortState | null;
    onChange: (state: DataTableSortState | null) => void;
  };
  pagination?: DataTablePagination;
  selection?: DataTableSelectionConfig<TData>;
  stickyHeader?: boolean;
  maxHeight?: string | number;
  renderRow?: (row: TData, index: number) => ReactNode;
  renderExpandedRow?: (row: TData, index: number) => ReactNode;
  expandedRowId?: string | null;
  className?: string;
  tableClassName?: string;
  ariaLabel?: string;
}
`

---

## 4. Relações e Ciclo de Estado da Seleção

`mermaid
stateDiagram-v2
    [*] --> Unselected: Lista carregada
    
    state MultiMode {
        Unselected --> PartialSelected: Clica em 1 item
        PartialSelected --> AllSelected: Clica em Selecionar Todos no Header
        AllSelected --> Unselected: Clica no Header desmarcando todos
        PartialSelected --> Unselected: Desmarca os itens restantes
        AllSelected --> PartialSelected: Desmarca 1 item da lista
    }

    state SingleMode {
        Unselected --> SelectedItemA: Clica no Item A
        SelectedItemA --> SelectedItemB: Clica no Item B (desmarca A)
        SelectedItemA --> Unselected: Clica novamente no Item A
    }
`
