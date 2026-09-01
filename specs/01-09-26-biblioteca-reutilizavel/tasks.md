# Tasks: Biblioteca reutilizável por Conta

**Input**: Design documents from /specs/01-09-26-biblioteca-reutilizavel/

**Prerequisites**: plan.md, spec.md, research.md, data-model.md,
contracts/library-application.md e quickstart.md

**Execution rule**: os testes devem ser escritos antes do par de
implementação de cada fase e precisam falhar por uma razão observável antes de
serem feitos passar. Nenhuma tarefa desta lista autoriza migração de
localStorage, dual-write ou implementação fora do escopo da especificação.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: preparar fixtures isoladas, caminhos de teste e a matriz de
requisitos usada por todas as histórias.

- [ ] T001 [skill: $tdd] Criar fixtures determinísticas com duas Contas, TACO, alimentos customizados, receitas, refeições prontas e snapshots em tests/fixtures/library-fixtures.ts; verificar que os IDs e datas são estáveis entre execuções e que os cenários de NFR-003 são reproduzíveis.
- [ ] T002 [skill: $tdd] [P] Criar helper de banco PGlite isolado por teste em tests/helpers/library-test-db.ts; verificar NFR-003, que cada caso inicia sem dados de outra Conta e encerra a conexão.
- [ ] T003 [skill: $webapp-testing] [P] Criar fixture de navegador com viewport desktop e estado inicial vazio em tests/browser/fixtures/library-fixture.ts; verificar NFR-001, NFR-003 e que nenhuma chave de biblioteca é semeada no localStorage.
- [ ] T004 [skill: $speckit-analyze] Registrar a matriz de requisitos, artefatos e verificações no cabeçalho de tests/architecture/library-traceability.test.ts; verificar que FR-001 a FR-017, NFR-001 a NFR-004 e SC-001 a SC-007 possuem destino no plano ou em uma tarefa.

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: estabelecer o modelo relacional, domínio, portas e contratos que
bloqueiam todas as histórias de usuário.

**Critical**: nenhuma história deve começar antes desta fase estar concluída.

- [ ] T005 [skill: $database-migrations-pro] [P] Criar testes da migration e das constraints em tests/infrastructure/library-migration.integration.test.ts; verificar tabelas, índices, status, versionamento, rollback transacional e atualização da origem de snapshot para FR-015 e SC-004.
- [ ] T006 [skill: $backend-architect-ddd] [P] Criar testes de contrato dos repositórios em tests/infrastructure/library-repositories.integration.test.ts; verificar escopo por accountId, CRUD, arquivamento, exclusão condicionada e atomicidade para FR-001, FR-005, FR-013, FR-015 e SC-001.
- [ ] T007 [skill: $tdd] [P] Criar testes das regras comuns de domínio em tests/lib/library/library-validation.test.ts; verificar FR-003, FR-004, NFR-003, números finitos e não negativos, unidade, base de medida, status e mensagens acionáveis.
- [ ] T008 [skill: $backend-patterns] [P] Criar testes das portas e erros de aplicação em tests/application/library/library-contracts.test.ts; verificar FR-013, FR-017, NFR-003 e os códigos LIBRARY_CONTEXT_MISSING, LIBRARY_NOT_FOUND, LIBRARY_SCOPE_VIOLATION e LIBRARY_VERSION_CONFLICT.
- [ ] T009 [skill: $backend-architect-ddd] Definir os tipos de FoodCatalogItem, Recipe, RecipeIngredient, ReadyMeal, ReadyMealItem, LibrarySnapshot e estados no arquivo src/lib/domain/library/library-model.ts; verificar FR-001, FR-004 e a correspondência com data-model.md.
- [ ] T010 [skill: $backend-architect-ddd] Implementar validação compartilhada de nomes, unidades, quantidades, rendimentos, nutrientes, versões e dependências em src/lib/domain/library/library-validation.ts; verificar FR-003, FR-009 e FR-015, garantindo que erros identificam o campo e não retornam fallback permissivo.
- [ ] T011 [skill: $backend-architect-ddd] Implementar cálculo decimal, normalização e energia de referência em src/lib/domain/library/library-nutrition.ts; verificar FR-008, NFR-003 e a regressão de 128 kcal/100 g com preservação de valores internos não arredondados.
- [ ] T012 [skill: $database-migrations-pro] Adicionar as tabelas relacionais da biblioteca e constraints compostas por Conta em src/lib/infrastructure/local-db/schema.ts; verificar FR-001, FR-002, FR-004, FR-015, chaves, índices, status ACTIVE/ARCHIVED e referências sem duplicar a TACO.
- [ ] T013 [skill: $database-migrations-pro] Criar e registrar a migration incremental 0002_reusable_library em src/lib/infrastructure/local-db/migrations/0002_reusable_library.ts e src/lib/infrastructure/local-db/migrations.ts; verificar FR-015, NFR-003 e execução idempotente sem reescrever migrations aplicadas.
- [ ] T014 [skill: $database-migrations-pro] Implementar mapeadores, transações e conversão de erros da infraestrutura em src/lib/infrastructure/local-db/library/library-repository-mappers.ts; verificar FR-006, FR-010, FR-015 e round-trip de decimais, snapshots e rollback de filhos incompletos.
- [ ] T015 [skill: $backend-patterns] Definir as portas de repositório, contexto e comandos da aplicação em src/lib/persistence/library-repository.ts e src/lib/application/library/library-ports.ts; verificar FR-001, FR-013, NFR-003 e que os contratos não importam PGlite, Drizzle ou localStorage.
- [ ] T016 [skill: $backend-architect-ddd] Expandir NutritionSourceType, snapshots e invariantes do domínio de dietas em src/lib/domain/diets/diet-model.ts; verificar FR-011, FR-012 e compatibilidade com SYSTEM_TACO, ACCOUNT_CUSTOM, RECIPE e READY_MEAL.
- [ ] T017 [skill: $database-migrations-pro] Atualizar schema, mapeadores e constraints de snapshots de dieta em src/lib/infrastructure/local-db/schema.ts e src/lib/infrastructure/local-db/diets/pglite-diet-repository.ts; verificar FR-010, FR-012, FR-015 e que as novas origens são persistidas sem alterar snapshots existentes.
- [ ] T018 [skill: $nextjs-fullstack-master] Compor os repositórios e casos de uso da biblioteca no runtime em src/lib/application/browser-composition.ts; verificar FR-014, NFR-004 e uma inicialização única por Conta sem dependência dos stores legados.

**Checkpoint**: o banco, o domínio e as portas estão prontos; as três histórias
podem ser implementadas e testadas como incrementos independentes.

## Phase 3: User Story 1 - Manter alimento customizado (Priority: P1) MVP

**Goal**: permitir o ciclo de vida completo de alimentos customizados
pertencentes à Conta, com versões, snapshots, arquivamento e isolamento.

**Independent Test**: criar, consultar, editar, duplicar, arquivar e excluir um
alimento em uma Conta; validar nutrientes, versão, dependência, escopo e
preservação dos usos anteriores.

### Tests for User Story 1

- [ ] T019 [skill: $tdd] [P] [US1] Criar testes de domínio do alimento customizado em tests/lib/library/custom-food.test.ts; verificar criação, edição versionada, duplicação, status, nutrientes e valores inválidos contra FR-003 e FR-004.
- [ ] T020 [skill: $database-migrations-pro] [P] [US1] Criar testes de integração do repositório de alimentos em tests/infrastructure/custom-food-repository.integration.test.ts; verificar CRUD, filtros ACTIVE/ARCHIVED, dependências e isolamento cross-account contra FR-001, FR-005, FR-013 e FR-016.
- [ ] T021 [skill: $tdd] [P] [US1] Criar testes de aplicação do alimento em tests/application/library/custom-food-use-cases.test.ts; verificar conflito de versão, exclusão bloqueada, mensagens acionáveis e transação sem parcialidade.
- [ ] T022 [skill: $ui-styling] [P] [US1] Criar testes das superfícies de alimentos em tests/components/foods/custom-food-library.test.tsx e tests/app/alimentos/alimentos-page.test.tsx; verificar loading, empty, success, error, conflict, blocked, teclado e foco conforme FR-017.

### Implementation for User Story 1

- [ ] T023 [skill: $database-migrations-pro] [US1] Implementar o repositório de alimentos customizados em src/lib/infrastructure/local-db/library/custom-food-repository.ts; verificar com os testes de integração criação, listagem, versionamento, arquivamento e deleteIfUnreferenced.
- [ ] T024 [skill: $backend-patterns] [US1] Implementar os casos de uso de alimentos em src/lib/application/library/custom-food-use-cases.ts; verificar com os testes de aplicação escopo accountId, validação, duplicação, conflito e política de dependência.
- [ ] T025 [skill: $backend-patterns] [US1] Expor a fachada da biblioteca de alimentos em src/lib/application/library/library-application.ts; verificar que todos os comandos usam o contexto ativo e retornam estados de erro tipados.
- [ ] T026 [skill: $nextjs-fullstack-master] [US1] Adaptar a página de alimentos em src/app/alimentos/page.tsx para consumir a fachada canônica; verificar FR-002, que TACO continua somente leitura e que alimentos customizados não usam chaves legadas.
- [ ] T027 [skill: $ui-styling] [US1] Adaptar o formulário e o modal em src/components/molecules/CustomFoodModal.tsx; verificar validação acessível, foco, mensagens por campo e atualização de versão após salvar.
- [ ] T028 [skill: $proj-table-adequation-v2] [US1] Adaptar busca e seleção de alimentos em src/hooks/useFoodSearchPage.ts e src/components/organisms/foods/FoodSearchModal.tsx; verificar combinação TACO/customizada, filtro de arquivados e tempo de resposta da fixture.
- [ ] T029 [skill: $code-reviewer-expert] [US1] Remover do runtime os caminhos de persistência customizada em src/lib/tacoStore.ts; verificar FR-014 e SC-007 com rg e teste de arquitetura, garantindo que nutridiet_custom_foods não é lido, escrito ou usado como fallback.

**Checkpoint**: US1 funciona isoladamente e fornece alimentos customizados
versionados para receitas, refeições prontas e drafts.

## Phase 4: User Story 2 - Criar receita versionada (Priority: P1)

**Goal**: permitir receitas da Conta com ingredientes TACO/customizados,
snapshot de origem, cálculo decimal por rendimento e duplicação segura.

**Independent Test**: criar uma receita válida, consultar totais e porção,
editar uma origem, duplicar e arquivar; confirmar que a versão usada antes
continua íntegra e que entradas inválidas não persistem parcialmente.

### Tests for User Story 2

- [ ] T030 [skill: $tdd] [P] [US2] Criar testes de domínio e nutrição de receitas em tests/lib/library/recipe.test.ts; verificar FR-006, FR-007 e FR-008: ingredientes ordenados, rendimento positivo, totais, porção, energia de referência e snapshot por ingrediente.
- [ ] T031 [skill: $database-migrations-pro] [P] [US2] Criar testes de integração de receitas em tests/infrastructure/recipe-repository.integration.test.ts; verificar agregado com filhos atômicos, versões, arquivamento, duplicação independente e dependências.
- [ ] T032 [skill: $backend-patterns] [P] [US2] Criar testes de aplicação de receitas em tests/application/library/recipe-use-cases.test.ts; verificar fontes permitidas, origem arquivada/inválida, cross-account, conflito e erro sem persistência parcial.
- [ ] T033 [skill: $ui-styling] [P] [US2] Criar testes de tela e componentes de receita em tests/components/recipes/recipe-library.test.tsx e tests/app/receitas/recipes-page.test.tsx; verificar estados, porções, mensagens, teclado e seleção TACO/customizada.

### Implementation for User Story 2

- [ ] T034 [skill: $database-migrations-pro] [US2] Implementar o repositório relacional de receitas e ingredientes em src/lib/infrastructure/local-db/library/recipe-repository.ts; verificar transação de agregado, ordenação, snapshots e filtros por Conta.
- [ ] T035 [skill: $backend-architect-ddd] [US2] Implementar validação, snapshot e casos de uso de receita em src/lib/application/library/recipe-use-cases.ts; verificar cálculo decimal, versionamento explícito e cópia sem IDs compartilhados.
- [ ] T036 [skill: $backend-patterns] [US2] Integrar receita e alimento à fachada da biblioteca em src/lib/application/library/library-application.ts; verificar composição das portas e preservação da origem TACO versus ACCOUNT_CUSTOM.
- [ ] T037 [skill: $nextjs-fullstack-master] [US2] Adaptar a página de receitas em src/app/receitas/page.tsx; verificar listagem ativa, consulta de arquivadas mediante ação explícita e operação sem recipesStore.
- [ ] T038 [skill: $ui-styling] [US2] Adaptar o modal de criação/edição em src/components/molecules/CreateRecipeModal.tsx; verificar rendimento, ingredientes, cálculo por porção e estados de erro/conflict.
- [ ] T039 [skill: $proj-table-adequation-v2] [US2] Adaptar o seletor de ingredientes em src/components/molecules/RecipeIngredientRow.tsx e src/components/organisms/foods/FoodSearchModal.tsx; verificar que receita não aceita receita/refeição pronta e que a busca permanece abaixo de 100 ms.
- [ ] T040 [skill: $code-reviewer-expert] [US2] Remover do runtime os caminhos de persistência de receitas em src/lib/recipesStore.ts; verificar com rg e teste de arquitetura que nutridiet_recipes não é lido, escrito ou usado como fallback.

**Checkpoint**: US1 e US2 podem ser validadas separadamente; receitas
versionadas ficam disponíveis como dependência válida para US3.

## Phase 5: User Story 3 - Reutilizar refeição pronta em uma dieta (Priority: P1)

**Goal**: criar templates de refeição com alimentos/porções de receitas e
copiá-los profundamente para o DietDraft sem confirmar a dieta.

**Independent Test**: criar uma refeição pronta, inseri-la no draft, editar ou
arquivar suas origens e confirmar que o draft e a dieta salva mantêm IDs,
versões e snapshots independentes, sem composição recursiva.

### Tests for User Story 3

- [ ] T041 [skill: $tdd] [P] [US3] Criar testes de domínio de refeições prontas em tests/lib/library/ready-meal.test.ts; verificar FR-009, itens FOOD/RECIPE, porções, ordenação, versionamento e rejeição de READY_MEAL recursivo.
- [ ] T042 [skill: $database-migrations-pro] [P] [US3] Criar testes de integração de refeições prontas em tests/infrastructure/ready-meal-repository.integration.test.ts; verificar FR-010, agregado atômico, snapshots, dependências, arquivamento, duplicação e escopo.
- [ ] T043 [skill: $tdd] [P] [US3] Criar testes da inserção no draft em tests/application/diets/library-draft-insertion.test.ts; verificar FR-011, FR-012, SC-002 e SC-003: novos IDs, cópia profunda, origem/versionamento, ausência de confirmação e preservação após edição da biblioteca.
- [ ] T044 [skill: $ui-styling] [P] [US3] Criar testes de tela e seletor em tests/components/ready-meals/ready-meal-library.test.tsx e tests/app/refeicoes-prontas/ready-meals-page.test.tsx; verificar estados, acessibilidade, bloqueios e seleção no editor.
- [ ] T045 [skill: $webapp-testing] [P] [US3] Criar a jornada Chromium em tests/browser/library.spec.ts; verificar FR-011, FR-012, FR-014, SC-002, SC-003 e SC-007 durante criação, busca, inserção no draft, reload, isolamento, arquivamento, snapshot confirmado e ausência das chaves legadas.

### Implementation for User Story 3

- [ ] T046 [skill: $database-migrations-pro] [US3] Implementar o repositório relacional de refeições prontas e itens em src/lib/infrastructure/local-db/library/ready-meal-repository.ts; verificar composição FOOD/RECIPE, snapshots e transação atômica.
- [ ] T047 [skill: $backend-architect-ddd] [US3] Implementar validação de composição e casos de uso de refeição pronta em src/lib/application/library/ready-meal-use-cases.ts; verificar rejeição de ciclo, dependência inválida, conflito e cópia independente.
- [ ] T048 [skill: $nextjs-fullstack-master] [US3] Implementar inserção profunda de receitas e refeições no DietDraft em src/lib/application/diets/library-draft-insertion.ts; verificar novos IDs, snapshots e que nenhum comando de seleção salva dieta confirmada.
- [ ] T049 [skill: $nextjs-fullstack-master] [US3] Integrar a inserção ao caso de uso e store de draft em src/lib/application/diets/diet-application.ts e src/lib/infrastructure/diet-drafts/index.ts; verificar reload, edição no draft e confirmação somente no comando explícito.
- [ ] T050 [skill: $ui-styling] [US3] Adaptar a página e modal de refeições prontas em src/app/refeicoes-prontas/page.tsx e src/components/molecules/CreateReadyMealModal.tsx; verificar criação, edição, arquivamento e estados acionáveis.
- [ ] T051 [skill: $proj-table-adequation-v2] [US3] Adaptar busca e seleção de templates no editor em src/components/molecules/food-search/ReadyMealSearchResultsList.tsx e src/components/molecules/food-search/FoodSearchCategorySelector.tsx; verificar itens ativos, cópia para o draft e ausência de composição recursiva.
- [ ] T052 [skill: $code-reviewer-expert] [US3] Remover do runtime os caminhos de persistência de refeições prontas em src/lib/readyMealsStore.ts; verificar com rg e teste de arquitetura que nutridiet_ready_meals não é lido, escrito ou usado como fallback.

**Checkpoint**: todas as histórias P1 funcionam em conjunto e cada template
selecionado fica independente de futuras alterações na biblioteca.

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: fechar o cutover, governança, desempenho, acessibilidade e
documentação de validação da etapa.

- [ ] T053 [skill: $code-reviewer-expert] [P] Completar o teste de fronteira legado em tests/architecture/library-legacy-boundary.test.ts; verificar zero import, leitura, escrita ou fallback das três chaves legadas nas superfícies canônicas.
- [ ] T054 [skill: $ui-styling] [P] Executar e ajustar os testes de acessibilidade em tests/components/library-accessibility.test.tsx; verificar NFR-001 e SC-006: teclado, foco visível, nomes acessíveis, contraste e estados loading/empty/error/success/conflict/blocked.
- [ ] T055 [skill: $tdd] [P] Adicionar benchmark determinístico de busca em tests/performance/library-search.perf.test.ts; verificar NFR-002 e SC-005, com resultados TACO e biblioteca abaixo de 100 ms na fixture representativa.
- [ ] T056 [skill: $code-reviewer-expert] Executar os gates completos definidos em specs/01-09-26-biblioteca-reutilizavel/quickstart.md; verificar NFR-003, SC-004 e a execução de npm test, type-check, lint, verify:links, audit:atomic-design, verify:table, verify:design-system, build e browser serial.
- [ ] T057 [skill: $design-system] Revisar o catálogo e as regras de componentes afetados em design-system/components/registry.json e design-system/components/audit-contract.md; verificar NFR-001, SC-006 e que nenhum componente novo contorna atomic design, tokens ou primitivos shadcn.
- [ ] T058 [skill: $speckit-analyze] Atualizar o índice e o portão da persistência em refs/dieta-db/index.md e refs/dieta-db/14-consolidacao-e-portao-de-execucao.md; verificar que a etapa 4 só é marcada pronta com todos os gates verdes.
- [ ] T059 [skill: $code-reviewer-expert] Registrar evidências, escopo não coberto e hashes de validação em specs/01-09-26-biblioteca-reutilizavel/validation-report.md; verificar SC-002, SC-004, SC-007 e que não há alegação de migração, backup, sincronização ou implementação de etapa 5.
- [ ] T060 [skill: $code-reviewer-expert] Fazer revisão final de código e arquitetura em specs/01-09-26-biblioteca-reutilizavel/plan.md; verificar FR-001 a FR-017, NFR-001 a NFR-004, SC-001 a SC-007, ausência de duplicação e decisão explícita para qualquer desvio.

## Dependencies & Execution Order

### Phase dependencies

- Setup (Phase 1) não depende de outra fase.
- Foundational (Phase 2) depende de Setup e bloqueia todas as histórias.
- US1, US2 e US3 dependem de Foundational; US2 usa alimentos de US1 e US3
  usa alimentos e receitas, portanto a execução recomendada é US1 → US2 → US3.
- Polish depende das três histórias e dos seus testes independentes.

### User story dependencies

- **US1**: inicia após T018 e é o MVP recomendado.
- **US2**: inicia após T018; para execução integrada depende de T023–T029,
  embora seus testes de contrato possam ser escritos em paralelo.
- **US3**: inicia após T018; para execução integrada depende de T034–T040 e da
  extensão do draft em T048–T049.

### Parallel opportunities

- T002–T004 podem ser executadas em paralelo após T001.
- T005–T008 podem ser escritos em paralelo antes das implementações T009–T018.
- T019–T022, T030–T033 e T041–T045 podem ser escritos em paralelo dentro de
  cada história; T045 deve ser executado depois que a aplicação estiver
  navegável.
- T053–T055 podem ser preparados em paralelo após o cutover das histórias.

## Implementation Strategy

### MVP first

1. Completar Setup e Foundational.
2. Implementar US1, executar seu teste independente e validar o corte do
   alimento customizado.
3. Parar no checkpoint para revisão humana antes de ampliar para receitas.

### Incremental delivery

1. Adicionar US2 e validar snapshots/cálculo de receitas sem regressão de US1.
2. Adicionar US3 e validar cópia profunda no draft sem confirmação implícita.
3. Executar Polish, registrar evidências e atualizar o portão da etapa.

### Notes

- Cada tarefa possui um caminho de arquivo ou artefato e uma verificação
  observável.
- As linhas permanecerão desmarcadas até a implementação real.
- A atribuição de uma skill principal por tarefa será adicionada no Estado 6
  do fluxo SDD.
