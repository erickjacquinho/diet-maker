# Tasks: reordenar refeições e corrigir criação no ciclo

## Setup

- [x] T001 Criar especificação, checklist, pesquisa, modelo e plano em `specs/20260916-042528-reorder-meals/`
- [x] T002 Adicionar teste regressivo para criação após trocar de dieta simples para ciclo em `tests/app/pacientes/diet-nova-carb-cycling-sync.test.tsx`

## User Story 1 — Reordenar a variação ativa (P1)

### Tests first

- [x] T003 [US1] Criar testes de visibilidade do botão, abertura do modal, drag and drop, teclado, confirmação e descarte em `tests/components/organisms/diet-meals-section.test.tsx`
- [x] T004 [US1] Criar teste de reordenação por IDs e proteção da variação ativa em `tests/hooks/useDietMealActions.test.ts`

### Implementation

- [x] T005 [US1] Adicionar o contrato `onReorderMeals` ao template e encaminhá-lo até `DietMealsSection` em `src/components/templates/dietBuilderTemplateTypes.ts` e `src/components/templates/DietBuilderTemplate.tsx`
- [x] T006 [US1] Implementar `handleReorderMeals` com validação de IDs em `src/hooks/useDietMealActions.ts`
- [x] T007 [US1] Encaminhar o callback da página para o template em `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx`
- [x] T008 [US1] Implementar o modal local com cards arrastáveis, teclado, confirmação de descarte e aplicação somente no confirmar em `src/components/organisms/diet/DietMealsSection.tsx`

## User Story 2 — Resumo e tooltip (P2)

- [x] T009 [US2] Exibir nome, macros, calorias, badge de itens e tooltip acessível com os alimentos em `src/components/organisms/diet/DietMealsSection.tsx`
- [x] T010 [US2] Completar testes de tooltip, refeição vazia e anúncio/foco em `tests/components/organisms/diet-meals-section.test.tsx`

## User Story 3 — Criar refeição no ciclo (P1)

- [x] T011 [US3] Corrigir seleção da variação ativa na transição para ciclo em `src/hooks/useDietBuilderPage.ts`
- [x] T012 [US3] Proteger o scroll pós-criação quando `scrollIntoView` não existir em `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx`
- [x] T013 [US3] Validar a criação repetida e abertura da busca de alimentos no teste de sincronização existente

## Polish and verification

- [x] T014 Executar testes focados, type-check e corrigir regressões sem alterar primitives do design system
- [x] T015 Atualizar os checkboxes desta lista conforme a implementação concluída

## Visual reorder animation extension

- [x] T016 [US1] Cobrir a inserção visual durante `dragover`, incluindo placeholder e ordem visual dos cards em `tests/components/organisms/diet-meals-section.test.tsx`
- [x] T017 [US1] Implementar abertura de caminho com placeholder medido e animação FLIP dos cards vizinhos em `src/components/organisms/diet/DietMealsSection.tsx`
- [x] T018 Validar a animação com testes focados, type-check e lint sem adicionar dependência de drag and drop

## Drag reliability follow-up

- [x] T019 [US1] Criar regressão para arraste por ponteiro, preview acompanhando o cursor, abertura de caminho e drop em `tests/components/organisms/diet-meals-section.test.tsx`
- [x] T020 [US1] Substituir o `dragstart` nativo por Pointer Events com preview fixo e listeners globais, preservando a animação FLIP em `src/components/organisms/diet/DietMealsSection.tsx`
- [x] T021 Validar o fluxo corrigido com testes focados, type-check, lint e verificação visual no navegador

## Generic sortable component extraction

- [x] T022 [US1] Criar testes genéricos de ponteiro, placeholder, preview, teclado e metadados em `tests/components/molecules/sortable-list.test.tsx`
- [x] T023 [US1] Extrair Pointer Events, FLIP, preview, placeholder, teclado e anúncios para `src/components/molecules/SortableList.tsx` e adaptar `DietMealsSection`
- [x] T024 Registrar e documentar `SortableList` no catálogo do design system e validar tipos, lint e testes focados

## Reuse in meal item ordering

- [x] T025 [US1] Criar regressão de ponteiro, placeholder, preview e teclado para a ordenação dos alimentos em `src/components/organisms/__tests__/MealCardContainer.test.tsx`
- [x] T026 [US1] Substituir o drag-and-drop nativo de `MealItemRow`/`MealCardContainer` por `SortableList`, preservando tabela, ações e variação ativa
- [x] T027 Validar a remoção da implementação antiga e atualizar o catálogo/perfis/documentação do componente

## Live nutrition feedback while editing grams

- [x] T028 Criar regressões para callback imediato, foco contínuo e recálculo proporcional de macros em `tests/components/molecules/meal-item-row.test.tsx` e `tests/hooks/useDietMealActions.test.ts`
- [x] T029 Encaminhar valores numéricos válidos do input de gramas no `onChange`, mantendo o valor vazio local até normalização em `src/components/molecules/MealItemRow.tsx`
- [x] T030 Validar o fluxo com testes focados, type-check, lint e verificação do design system
