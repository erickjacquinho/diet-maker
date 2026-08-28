# Tasks: Padronização do Componente DataTable com Seleção e Checkbox Canônico

**Input**: Design documents from specs/26-08-26-padronizar-data-table-selecao-checkbox/
**Prerequisites**: plan.md, spec.md, esearch.md, data-model.md, contracts/data-table-selection-contract.md
**Tests**: Testes unitários incluídos para validar o átomo Checkbox e os novos recursos do DataTable.
**Organization**: Tarefas agrupadas por fases e histórias de usuário (US1, US2, US3) para execução e validação independentes.

## Phase 1: Setup & Foundational (Shared Infrastructure)

**Purpose**: Criação do átomo Checkbox e infraestrutura de tipos para a seleção

- [X] T001 [skill: shadcn] [P] Criar o componente átomo Checkbox em src/components/atoms/Checkbox.tsx e exportar em src/components/atoms/index.ts
- [X] T002 [skill: tdd] [P] Criar testes unitários para o átomo Checkbox em tests/components/atoms/Checkbox.test.tsx
- [X] T003 [skill: frontend-architecture-mindset] Estender tipos de seleção DataTableSelectionConfig e DataTableProps em src/components/molecules/data-table/types.ts e utilitários de seleção em src/components/molecules/data-table/utils.ts

---

## Phase 2: User Story 1 - Seleção Consistente (Multi e Single) no DataTable (Priority: P1) 🎯 MVP

**Goal**: Permitir seleção única ou múltipla de forma declarativa e acessível no DataTable com a 1ª coluna padronizada

**Independent Test**: Renderizar DataTable com selection={{ mode: 'multi' }} e selection={{ mode: 'single' }} e verificar marcação, desmarcação, estado indeterminado e eventos.

- [X] T004 [skill: shadcn] [US1] Implementar a renderização da coluna de seleção (cabeçalho com Checkbox mestre para multi e células de linha com Checkbox) em src/components/molecules/DataTable.tsx
- [X] T005 [skill: shadcn] [US1] Adicionar suporte à propriedade selectOnRowClick e estilização de linha selecionada data-[state=selected] em src/components/molecules/DataTable.tsx
- [X] T006 [skill: tdd] [P] [US1] Adicionar testes unitários para os modos multi-select, single-select, select-all e indeterminate em tests/components/molecules/data-table.test.tsx

---

## Phase 3: User Story 2 - Padronização Visual, Tipográfica e Migração das Tabelas de Alimentos (Priority: P2)

**Goal**: Garantir rigor tipográfico, alinhamentos e migrar FoodSearchResultsList e modais para o DataTable

**Independent Test**: Abrir FoodSearchModal e SubstituteFoodModal, verificar visual idêntico com ordenação, busca, seleção e persistência.

- [X] T007 [skill: anti-ai-slop-design] [US2] Padronizar tipografia de cabeçalhos (text-style-chart-micro) e alinhamento de números tabulares (text-right tabular-nums) em src/components/molecules/DataTable.tsx e src/components/molecules/data-table/utils.ts
- [X] T008 [skill: frontend-architecture-mindset] [US2] Refatorar FoodSearchResultsList em src/components/molecules/food-search/FoodSearchResultsList.tsx para compor as colunas de alimentos e delegar a tabela ao DataTable com seleção
- [X] T009 [skill: frontend-architecture-mindset] [P] [US2] Ajustar FoodSearchModal em src/components/molecules/FoodSearchModal.tsx e SubstituteFoodModal em src/components/molecules/SubstituteFoodModal.tsx para integração limpa com a seleção
- [X] T010 [skill: tdd] [P] [US2] Executar e validar testes de componentes de busca e substituição em tests/components/molecules/food-search-modal.test.tsx e tests/components/molecules/substitute-food-modal.test.tsx

---

## Phase 4: User Story 3 - Cabeçalho Fixo e Rolagem Delimitada (Priority: P3)

**Goal**: Suportar cabeçalho fixo e rolagem interna no DataTable para modais e visualizações compactas

**Independent Test**: Configurar stickyHeader e maxHeight no DataTable e verificar que o cabeçalho se mantém fixo sem desalinhamento das colunas.

- [X] T011 [skill: shadcn] [US3] Implementar propriedades stickyHeader e maxHeight com contêiner integrado no DataTable em src/components/molecules/DataTable.tsx
- [X] T012 [skill: tdd] [P] [US3] Adicionar testes unitários para a rolagem com cabeçalho fixo em tests/components/molecules/data-table.test.tsx

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Verificação de qualidade, governança do Design System e não-regressão geral

- [X] T013 [skill: code-reviewer-expert] [P] Executar auditorias automatizadas do Design System e verificar conformidade de Atomic Design
- [X] T014 [skill: tdd] [P] Executar a suíte de testes completa do projeto (npm test) para confirmar zero regressões em todas as tabelas


---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup & Foundational (Phase 1)**: Sem dependências prévias — inicia imediatamente (T001, T002, T003).
- **User Story 1 (Phase 2)**: Depende da conclusão da Fase 1 (T004, T005, T006).
- **User Story 2 (Phase 3)**: Depende da conclusão da Fase 2 (T007, T008, T009, T010).
- **User Story 3 (Phase 4)**: Depende da conclusão da Fase 2 (T011, T012).
- **Polish (Phase 5)**: Executado após todas as histórias para garantia de qualidade (T013, T014).

### Parallel Opportunities

- T001 e T002 podem ser desenvolvidos em paralelo.
- T006 pode rodar em paralelo com a finalização dos ajustes de T005.
- T009 e T010 podem ser executados em paralelo com T008.
- T013 e T014 podem ser executados em paralelo na fase final.

---

## Implementation Strategy

### MVP First (Fases 1 e 2)
1. Criar o átomo Checkbox com testes completos.
2. Adicionar suporte a selection (multi e single) no DataTable.
3. Validar o MVP com testes unitários no DataTable.

### Entrega Incremental
1. Integrar tipografia padronizada e migrar FoodSearchResultsList.
2. Habilitar stickyHeader para modais.
3. Executar auditoria de não-regressão em todo o projeto.
