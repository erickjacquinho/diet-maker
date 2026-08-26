# Tasks: Refeições reutilizáveis no modal de seleção de alimentos

**Input**: Design documents from `/specs/26-08-26-refatorar-selecao-refeicoes-modal/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`

**Organization**: Tasks are grouped by user story so each increment can be implemented and validated independently.

**Escopo desta execução**: somente restaurar e adequar o modal de seleção de alimentos para adição na refeição. Salvamento de refeições, receitas, opções e alterações de stores/card permanecem fora desta entrega.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar os pontos de extensão sem alterar o comportamento existente.

- [ ] T001 Registrar o baseline dos testes e do type-check atuais nos artefatos da feature, preservando os failures preexistentes e os caminhos de validação em `specs/26-08-26-refatorar-selecao-refeicoes-modal/quickstart.md`.
- [ ] T002 [P] Mapear os contratos atuais de `DietItem`, `DietMeal`, `ReadyMeal`, `RecipeIngredient` e `FoodSearchModalProps` em `specs/26-08-26-refatorar-selecao-refeicoes-modal/data-model.md` antes da alteração de tipos.

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Criar os tipos, validações e transformações que todas as histórias reutilizam.

- [ ] T003 [P] [skill: $tdd] Escrever testes determinísticos para macro de referência, gramaturas válidas, composição válida e cálculo proporcional em `tests/lib/mealOptions.test.ts`.
- [ ] T004 [P] [skill: $tdd] Escrever testes de conversão entre item de dieta, ingrediente de receita e snapshot reutilizável em `tests/lib/mealTypes.test.ts`.
- [ ] T005 [skill: $frontend-architecture-mindset] Criar os tipos compartilhados `MealCompositionItem`, `MacroReference`, `MealOption` e `ReadyMealSnapshot` em `src/lib/mealTypes.ts`, mantendo adaptadores para os campos legados.
- [ ] T006 [skill: $tdd] Implementar as validações e o cálculo proporcional por proteína, carboidrato ou gordura em `src/lib/mealOptions.ts`, fazendo os testes T003 passarem sem incluir medidas caseiras.
- [ ] T007 [skill: $tdd] Implementar conversões e cópia segura de IDs em `src/lib/mealTypes.ts`, fazendo os testes T004 passarem sem compartilhar referências mutáveis com a biblioteca salva.
- [ ] T008 [skill: $backend-patterns] Atualizar `src/lib/dietStore.ts` para suportar `options` em `DietMeal` e preservar dietas existentes que ainda não tenham opções.

**Checkpoint**: Tipos, cálculos e compatibilidade legada estão disponíveis; as histórias podem ser implementadas sem duplicar regra de domínio.

## Phase 3: User Story 1 - Inserir uma refeição pronta (Priority: P1) 🎯 MVP

**Goal**: Selecionar, pré-visualizar e acrescentar uma refeição pronta completa na refeição ativa.

**Independent Test**: Com um snapshot completo salvo, abrir o modal em uma refeição, localizar a refeição pronta, revisar a prévia e confirmar. Todos os itens e opções devem ser acrescentados sem remover os itens existentes.

### Tests for User Story 1

- [ ] T009 [P] [US1] [skill: $tdd] Criar testes complementares em `tests/lib/readyMealsStore.test.ts` para cobrir persistência de itens, opções, resumo e identificação de registro legado incompleto.
- [ ] T010 [P] [US1] [skill: $tdd] Ampliar `tests/components/molecules/food-search-modal.test.tsx` para cobrir grupo separado, pesquisa, estado vazio, prévia, cancelamento e confirmação única de refeição pronta.
- [ ] T011 [P] [US1] [skill: $tdd] Ampliar `tests/hooks/useDietMealActions.test.ts` para cobrir acréscimo de snapshot, preservação de itens existentes e cópia de IDs das opções.

### Implementation for User Story 1

- [ ] T012 [US1] [skill: $backend-patterns] Evoluir `src/lib/readyMealsStore.ts` para persistir `items` e `options`, derivar os totais e manter leitura segura dos registros legados.
- [X] T013 [US1] [skill: $ui-styling] Refatorar `src/components/molecules/FoodSearchModal.tsx` para manter a tabela de alimentos, favoritos, busca/ordenação, seleção múltipla e footer de adição em gramas.
- [ ] T014 [US1] [skill: $frontend-architecture-mindset] Adicionar ao `src/hooks/useDietMealActions.ts` a aplicação de snapshot completo na refeição ativa, incluindo opções e cópia de identificadores sem sobrescrever itens.
- [ ] T015 [US1] [skill: $nextjs-fullstack-master] Integrar o novo callback e os estados da biblioteca em `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx`, preservando a substituição individual existente.
- [ ] T016 [US1] [skill: $ui-styling] Ajustar os estados vazios, incompletos, erro de dados e foco visível do modal conforme os contratos canônicos em `src/components/molecules/FoodSearchModal.tsx`.

**Checkpoint**: US1 entrega o MVP de reutilização de refeições prontas e continua permitindo adicionar alimentos individualmente.

## Phase 4: User Story 2 - Salvar a refeição atual para reutilização (Priority: P2)

**Goal**: Salvar o card atual como refeição pronta ou receita com o mínimo de fricção.

**Independent Test**: Em um card preenchido, escolher o tipo, informar o nome e salvar. O item deve aparecer na biblioteca correspondente e ficar disponível no modal.

### Tests for User Story 2

- [ ] T017 [P] [US2] [skill: $tdd] Adicionar testes de validação de nome, composição vazia e criação de snapshot em `tests/components/molecules/save-meal-modal.test.tsx`.
- [ ] T018 [P] [US2] [skill: $tdd] Criar testes complementares em `tests/lib/recipesStore.test.ts` para cobrir aplicação de ingredientes em gramas e edição antes da aplicação.
- [ ] T019 [P] [US2] [skill: $tdd] Ampliar `tests/components/organisms/meal-card-container.test.tsx` para cobrir as ações de salvar como refeição pronta e como receita.

### Implementation for User Story 2

- [ ] T020 [US2] [skill: $ui-styling] Criar `src/components/molecules/SaveMealModal.tsx` com escolha de tipo, nome obrigatório, confirmação explícita e cancelamento sem persistência parcial.
- [ ] T021 [US2] [skill: $backend-patterns] Adaptar `src/lib/recipesStore.ts` para receber a composição do card, preservar ingredientes em gramas e expor a conversão para aplicação na dieta.
- [ ] T022 [US2] [skill: $ui-styling] Atualizar `src/components/molecules/CreateReadyMealModal.tsx` ou extrair seus campos reutilizáveis para aceitar a composição real do card, eliminando o salvamento baseado apenas em resumo e texto livre.
- [ ] T023 [US2] [skill: $frontend-architecture-mindset] Adicionar ações e callbacks de salvamento em `src/components/organisms/MealCardContainer.tsx` e conectá-los à página em `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx`.
- [ ] T024 [US2] [skill: $nextjs-fullstack-master] Integrar a receita salva e a refeição pronta salva à fonte comum de itens reutilizáveis do `FoodSearchModal`, com prévia/editabilidade dos ingredientes da receita antes da aplicação e sem duplicar a pesquisa de alimentos.

**Checkpoint**: US1 e US2 permitem aplicar modelos existentes e transformar uma refeição montada em modelo reutilizável.

## Phase 5: User Story 3 - Configurar opções de refeição por equivalência (Priority: P3)

**Goal**: Criar opções completas com referência de macro, sugestão proporcional em gramas e edição livre.

**Independent Test**: Criar uma opção, escolher um macro, gerar a sugestão, alterar um alimento e confirmar. A opção deve mostrar os totais recalculados e ser carregada junto da refeição pronta.

### Tests for User Story 3

- [ ] T025 [P] [US3] [skill: $tdd] Adicionar testes de interação para criar, recalcular, editar, cancelar e validar opção em `tests/components/molecules/meal-option-editor.test.tsx`.
- [ ] T026 [P] [US3] [skill: $tdd] Ampliar `tests/hooks/useDietMealActions.test.ts` para cobrir adicionar, editar e persistir opções completas no `DietMeal`.
- [ ] T027 [P] [US3] [skill: $tdd] Criar cenário complementar em `tests/lib/readyMealsStore-options.test.ts` para garantir que opções e macro de referência sobrevivam ao ciclo salvar/ler/aplicar.

### Implementation for User Story 3

- [ ] T028 [US3] [skill: $ui-styling] Criar `src/components/molecules/MealOptionEditor.tsx` com seleção de macro, seleção de alimentos, sugestão proporcional, gramaturas editáveis, totais e mensagens de validação.
- [ ] T029 [US3] [skill: $frontend-architecture-mindset] Adicionar no `src/components/organisms/MealCardContainer.tsx` a entrada para criar/editar opções, sem alterar a ação de substituição individual.
- [ ] T030 [US3] [skill: $frontend-architecture-mindset] Integrar estado de opções e callbacks em `src/hooks/useDietMealActions.ts` e `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx`, mantendo cancelamentos locais.
- [ ] T031 [US3] [skill: $backend-patterns] Garantir em `src/lib/dietStore.ts` e `src/lib/readyMealsStore.ts` o recálculo dos totais, o macro de referência persistido e a rejeição de opções inválidas.

**Checkpoint**: Todas as histórias estão disponíveis; a refeição pronta carrega opções completas e a substituição individual continua sendo um atalho separado.

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Fechar qualidade, acessibilidade, compatibilidade e validação sem ampliar o escopo.

- [ ] T032 [P] [skill: $ui-styling] Auditar os componentes alterados contra as categorias, tokens, foco, teclado e estados do design system em `design-system/` e nos arquivos de `src/components/`.
- [ ] T033 [P] [skill: $webapp-testing] Validar os cenários manuais e automatizados de `specs/26-08-26-refatorar-selecao-refeicoes-modal/quickstart.md`, registrando resultados sem incluir autosave, exportação, medidas caseiras ou escala visual.
- [ ] T034 [skill: $tdd] Executar `npm run test`, `npm run type-check` e os audits relevantes do projeto; corrigir apenas regressões introduzidas pelo fluxo desta feature e registrar bloqueios preexistentes.
- [ ] T035 [P] [skill: $webapp-testing] Medir o tempo de alternância e filtragem da biblioteca com até 500 itens e registrar o resultado contra SC-007 em `specs/26-08-26-refatorar-selecao-refeicoes-modal/quickstart.md`.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências; registra o estado do repositório.
- **Foundational (Phase 2)**: depende de Setup e bloqueia as histórias.
- **US1 (Phase 3)**: depende da Foundation e é o MVP.
- **US2 (Phase 4)**: depende da Foundation; pode ser iniciada em paralelo com US1, mas compartilha stores e integração final.
- **US3 (Phase 5)**: depende da Foundation e dos contratos de `DietMeal`; sua persistência final integra com US1/US2.
- **Polish (Phase 6)**: depende das histórias que forem incluídas na entrega.

### User Story Dependencies

- **US1 (P1)**: depende apenas da Foundation; independente para demonstração do MVP.
- **US2 (P2)**: depende apenas da Foundation para salvar; a disponibilidade no modal reutiliza a integração de US1.
- **US3 (P3)**: depende dos tipos e cálculos da Foundation; integração completa com biblioteca usa US1 e US2.

### Parallel Opportunities

- T003 e T004 podem ser escritos em paralelo antes dos tipos.
- T009, T010 e T011 podem ser escritos em paralelo após a Foundation.
- T017, T018 e T019 podem ser escritos em paralelo.
- T025, T026 e T027 podem ser escritos em paralelo.
- T032 e T033 podem ser executados em paralelo após as histórias.

## Implementation Strategy

### MVP First

1. Concluir Setup e Foundation.
2. Entregar US1: selecionar, pré-visualizar e aplicar refeição pronta completa.
3. Parar e validar o MVP pelo checkpoint e pelo quickstart.

### Incremental Delivery

1. Adicionar US2 para salvar o card como refeição pronta ou receita.
2. Adicionar US3 para opções completas e equivalência proporcional.
3. Executar Polish e validação final.

### Skill Assignment

- `$tdd`: testes determinísticos e contratos de domínio.
- `$frontend-architecture-mindset`: estado, composição e limites entre página, hook e componentes.
- `$backend-patterns`: stores, compatibilidade local e transformações persistidas.
- `$ui-styling`: superfícies, estados, tokens e acessibilidade visual.
- `$nextjs-fullstack-master`: integração no App Router e limites client/server.
- `$webapp-testing`: validação manual/automatizada da aplicação local.

## Notes

- `[P]` indica tarefas paralelizáveis em arquivos diferentes e sem dependências incompletas.
- Toda tarefa tem checkbox, ID sequencial, labels de história quando aplicável e caminho de arquivo.
- A implementação deve ser executada somente por `/speckit-implement` após validação humana deste SDD.
