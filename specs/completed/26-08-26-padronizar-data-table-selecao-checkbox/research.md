# Research: Padronização do Componente DataTable com Seleção e Checkbox Canônico

**Feature**: specs/26-08-26-padronizar-data-table-selecao-checkbox
**Date**: 2026-08-26

## Decision 1: Criação do Átomo Canônico Checkbox em @/components/atoms/Checkbox.tsx

- **Decision**: Criar um componente oficial Checkbox no nível de átomo em @/components/atoms/Checkbox.tsx com re-export em @/components/atoms/index.ts e suporte em @/components/ui/checkbox.tsx (ou implementação unificada com Radix UI / input nativo estilizado).
- **Rationale**:
  - Atualmente, FoodSearchResultsList implementa <button role=checkbox> inline com classes soltas (size-4 rounded-compact border...).
  - Outros componentes que necessitarem de checkbox sofrem com duplicação ou inconsistência de classes.
  - O átomo Checkbox encapsula:
    - Dimensão fixa size-4 (16px) e geometria ounded-compact (4px).
    - Estados: checked (com ícone Check em traço grosso), unchecked (fundo neutro g-surface e borda order-border-subtle hover:border-border-hover), e indeterminate (traço horizontal w-2 h-0.5 bg-primary rounded-round).
    - Estado desabilitado (opacity-50 cursor-not-allowed).
    - Anel de foco com contraste WCAG 2.2 AA (ocus-visible:ring-2 focus-visible:ring-primary-focus).
- **Alternatives Considered**:
  - *Manter checkboxes ad-hoc em cada tabela*: Rejeitado por violar o princípio de Atomic Design e o requisito explícito do usuário de comportamento idêntico.
  - *Instalar @radix-ui/react-checkbox*: Desnecessário, pois o projeto já possui primitivas acessíveis controladas e Tailwind sem dependências externas adicionais.

---

## Decision 2: API Declarativa de Seleção no DataTable

- **Decision**: Adicionar uma prop selection?: DataTableSelectionConfig<TData> na interface DataTableProps<TData>.
  `	s
  export interface DataTableSelectionConfig<TData> {
    mode: 'single' | 'multi';
    selectedRowIds: Set<string> | string[];
    onSelectionChange: (selectedIds: Set<string>, selectedRows: TData[]) => void;
    isSelectable?: (row: TData, index: number) => boolean;
    selectOnRowClick?: boolean;
    selectAllAriaLabel?: string;
    selectRowAriaLabel?: (row: TData, index: number) => string;
  }
  `
- **Rationale**:
  - Torna a seleção opcional e declarativa. Tabelas que não passam selection mantêm exatamente 100% do comportamento atual.
  - No modo multi:
    - Adiciona automaticamente a primeira coluna de seleção (w-10 px-3 text-center).
    - Renderiza no TableHeader o checkbox mestre que detecta isAllSelected (todos selecionados) ou isSomeSelected && !isAllSelected (estado indeterminado).
    - Aciona onSelectionChange com todos os IDs visíveis selecionados/desmarcados.
  - No modo single:
    - Adiciona a primeira coluna de seleção (w-10 px-3 text-center).
    - O cabeçalho fica limpo sem checkbox mestre.
    - Clicar em um item desmarca os demais e seleciona exclusivamente o clicado (ou desseleciona se clicado no mesmo e desmarcação for permitida).
  - Com selectOnRowClick: true, o clique na linha inteira alterna a seleção, preservando cliques em botões de ação internos (e.stopPropagation()).
- **Alternatives Considered**:
  - *Obrigar o desenvolvedor a declarar a coluna de checkbox manualmente em columns: [...]*: Rejeitado porque quebra a padronização e força código repetitivo de gerenciamento de selecionar todos e indeterminate em todas as telas.

---

## Decision 3: Suporte a Cabeçalho Fixo (stickyHeader / maxHeight) no DataTable

- **Decision**: Integrar suporte nativo a rolagem com cabeçalho fixo no DataTable através das props stickyHeader?: boolean e maxHeight?: string | number.
- **Rationale**:
  - Modais de busca (FoodSearchModal, SubstituteFoodModal) necessitam de altura fixa com cabeçalho visível durante a rolagem.
  - Atualmente, FoodSearchResultsList usava uma divisão manual de duas tags <Table> separadas (TableHeader em uma div, TableBody em outra com overflow-y-auto).
  - Com CSS sticky moderno (sticky top-0 z-10 bg-surface-subtle border-b) ou contêiner rolável integrado com 	able-fixed, mantemos uma única estrutura de tabela sem quebra de acessibilidade semântica (uma única tag <table> com 	head e 	body).
- **Alternatives Considered**:
  - *Duas tags <Table> separadas*: Rejeitado por violar a semântica HTML e acessibilidade de leitores de tela (leitor não associa o thead de uma tabela ao tbody da outra).

---

## Decision 4: Migração Gradual e Não-Regressiva de FoodSearchResultsList e SubstituteFoodModal

- **Decision**:
  - Refatorar FoodSearchResultsList.tsx para atuar como um wrapper semântico/especializado que monta as colunas (Nome, P, C, G, Kcal, Favorito) e repassa para o DataTable com selection.
  - FoodSearchModal usa selection={{ mode: 'multi' }}.
  - SubstituteFoodModal usa selection={{ mode: 'single' }}.
  - As demais tabelas do app (PatientListTable, PatientConsultationHistoryTable, FoodTableSection, PatientAssessmentsTable, PatientDietsTable) continuam funcionando sem alterações de contrato, aproveitando automaticamente a tipografia padronizada.
- **Rationale**:
  - Preserva compatibilidade com testes unitários existentes e simplifica drasticamente a manutenção do código.
