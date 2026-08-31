# Tasks: Adequação de componentes ao design system

**Status**: prontas para revisão humana; nenhuma tarefa de implementação iniciada.
**Input**: [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contrato UI](./contracts/components.md),
[contrato de validação](./contracts/validation.md) e [quickstart.md](./quickstart.md).

Todos os caminhos abaixo são relativos a C:/Programmer/diet-maker.
Artefatos de evidência pertencem a specs/30-08-26-adequacao-componentes-design-system.
Tests são obrigatórios por FR-012: primeiro reproduzir o desvio, depois adequar.
Não executar este plano antes da validação humana nem fora de speckit-implement.

## Formato e limites

Cada tarefa tem ID sequencial, uma skill principal, marcador [P] quando seguro
e [USn] nas fases de história. [P] só libera arquivos disjuntos após cumprir
dependências. Não paralelizar escrita no registry, barrels ou testes compartilhados.
As skills não podem sobrepor o contrato do projeto nem autorizar redesign.
Reconsultar a categoria antes do perfil e o contrato vivo antes do refactor.
Arquivos de regras, tokens, categorias, primitivos e auditores são protegidos.
Se a correção depender de alterar uma dessas fontes, registrar CONTRACT_DRIFT e
pedir direção; não inventar exceção. Preservar alterações concorrentes.

## Fase 1 — Preparação

**Objetivo**: obter uma baseline atual sem tocar em código ou dados pessoais.

- [ ] T001 [skill: $code-reviewer-expert] Recapturar git status, fontes/exports/consumidores e resultados de todos os gates de quickstart.md; criar specs/30-08-26-adequacao-componentes-design-system/baseline.md e evidence/baseline/ com hashes das fontes protegidas e campos protegidos de design-system/components/registry.json; verificar autoria/diff concorrente e distinguir achados do escopo de externos. [FR-001, FR-002, FR-013, FR-015, NFR-001, NFR-005]
- [ ] T002 [skill: $tdd] Preparar tests/fixtures/component-adequation.ts com dados sintéticos locais cobrindo ausência versus zero, nomes longos, histórico/snapshots e listas extensas; definir isolamento em specs/30-08-26-adequacao-componentes-design-system/evidence/fixture-contract.md; verificar que fixtures não leem nem escrevem banco/perfil pessoal e não substituem globais compartilhados. [FR-011, FR-012, NFR-003, NFR-004, NFR-005]

## Fase 2 — Fundações bloqueantes

**Objetivo**: confirmar contratos vivos e tornar os testes obrigatórios executáveis.

- [ ] T003 [skill: $proj-table-adequation-v2] Resolver todos os targets tabulares de contracts/components.md com o resolver de proj-table-adequation-v2; registrar APIs, filhos e cinco avisos conhecidos em specs/30-08-26-adequacao-componentes-design-system/evidence/table-contracts.md; verificar cada ownership e tratar drift sem editar DataTable, Checkbox, categorias ou verificador. [FR-002, FR-003, FR-010, FR-014, NFR-001]
- [ ] T004 [skill: $tdd] Criar specs/30-08-26-adequacao-componentes-design-system/vitest.catalog.config.ts para executar explicitamente tests/design-system/component-catalog.test.mjs e o contrato novo da feature, preservando plugins/setup, fixtures negativas e filtros globais; criar também tests/architecture/component-adequation.test.ts cobrindo fronteiras/caminhos-alvo e demonstrar falha antes das migrações; verificar coleta real e registrar resultado inicial, sem remover asserções ou aceitar contagens fixas obsoletas. [FR-012, FR-013, FR-014, NFR-005]

**Checkpoint**: baseline, fixtures e contratos resolvidos; nenhum código de produção alterado.

## Fase 3 — US1: Contratos de componentes confiáveis (P1)

**Objetivo**: documentar o contrato vigente e a responsabilidade real de cada família.
**Teste independente**: validar perfis, herança e cobertura de fontes/exports;
migração ainda pendente deve estar declarada, não mascarada como conformidade.

### Testes antes dos ajustes documentais

- [ ] T005 [skill: $tdd] [US1] Criar tests/design-system/component-adequation.contract.test.ts com inventário delimitado, seções obrigatórias, categoria única, exports/aliases/parts e fixtures inválidas que reproduzam os achados de catálogo; demonstrar falha inicial e detecção de fontes órfãs, herança conflitante e drift de valores sem mudar auditores. [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-012, FR-014]

### Perfis e cadastro

- [ ] T006 [skill: $design-system] [P] [US1] Adequar design-system/components/profiles/atoms/icon-button.md e profiles/molecules/macro-proportion-bar.md ao contrato vigente; remover literais redundantes/contraditórios, corrigir herança única e completar seções; verificar TOK002/PRF002 desses perfis sem alterar nenhum token nem presumir defeito de runtime por texto. [FR-005, FR-006, NFR-001, SC-002]
- [ ] T007 [skill: $design-system] [P] [US1] Criar/completar design-system/components/profiles/molecules/macro-summary.md, profiles/organisms/carb-cycling-variation-panel.md e profiles/organisms/diet-mode-switcher.md; explicitar alias MacroNutrientSummary, estado atual/alvo, seleção/ações separadas, unidades e N/A justificados; verificar contrato de doze seções e referências canônicas. [FR-002, FR-003, FR-005, FR-009, FR-011]
- [ ] T008 [skill: $design-system] [P] [US1] Criar/completar design-system/components/profiles/molecules/food-search-category-selector.md, ready-meal-search-results-list.md e recipe-search-results-list.md no mesmo diretório; definir categoria única selection ou data-display e composição canônica, sem copiar matriz de estados/tokens; verificar ownership, contratos e regras de conteúdo. [FR-003, FR-005, FR-007, FR-009, FR-010]
- [ ] T009 [skill: $design-system] [P] [US1] Completar design-system/components/profiles/organisms/import-previous-diet-modal.md, read-only-diet-modal.md, food-search-modal.md e substitute-food-modal.md; documentar fonte atual/alvo, compatibilidade, async/error e consulta sem escrita; verificar seções/herança overlays, distinguindo implementação de fachada e legado. [FR-003, FR-005, FR-008, FR-009, FR-011]
- [ ] T010 [skill: $design-system] [P] [US1] Criar/completar design-system/components/profiles/organisms/patient-assessments-table.md, patient-diets-table.md, consultation-history-row.md e patient-list-table-row.md; enumerar parts/exportações do mesmo arquivo e relação aos pais PatientConsultationHistoryTable/PatientListTable; verificar data-display, semântica tabular e ausência de duplicação de famílias. [FR-002, FR-003, FR-005, FR-010]
- [ ] T011 [skill: $design-system] [US1] Reconciliar incrementalmente design-system/components/registry.json com T006–T010 e fontes reais de T001, preservando IDs existentes, categorias/traits definidos e mudanças alheias; cadastrar alias/compound-parts e consumers, manter migration-required quando pertinente e derivar baseline da descoberta atual; verificar auditor e contrato T005, sem registrar caminhos futuros como presentes. [FR-001, FR-002, FR-003, FR-004, FR-014, FR-015, SC-001]
- [ ] T012 [skill: $code-reviewer-expert] [US1] Registrar a revisão documental em specs/30-08-26-adequacao-componentes-design-system/evidence/us1-contracts.md, executando contrato T005, suíte explícita e auditor do catálogo; verificar zero lacuna documental no escopo e separar eventuais desvios de código ainda destinados à US2; não promover conformidade de implementação ou aprovação humana. [FR-005, FR-006, FR-013, NFR-006, SC-001, SC-002]

**Checkpoint US1 / MVP**: catálogo e perfis confiáveis, com migrações declaradas.
MVP documental não encerra esta feature nem significa que a UI já está conforme.

## Fase 4 — US2: Jornadas existentes com apresentação canônica (P1)

**Objetivo**: adequar componentes e fechar imports sem alterar comportamento/dados.
**Teste independente**: cada família passa seus cenários com fixtures isoladas,
incluindo callbacks, estados, semântica, conteúdo e caminhos consumidores.

### Regressões antes de código

- [ ] T013 [skill: $tdd] [P] [US2] Criar tests/components/component-adequation/actions-macros.test.tsx para IconButton/Delete/Edit, MacroProportionBar e MacroSummary/alias; cobrir props/ref, nomes, teclado, estados aplicáveis, macro order, unidades/precisão, ausência versus zero e invariantes de cálculo; demonstrar desvio antes da correção preservando testes existentes. [FR-007, FR-009, FR-011, FR-012, NFR-003]
- [ ] T014 [skill: $tdd] [P] [US2] Criar tests/components/component-adequation/selection-cycling.test.tsx para FoodSearchCategorySelector, CarbCyclingVariationPanel e DietModeSwitcher; testar cardinalidade, não deseleção vazia, cancelamento, callbacks, ações separadas e teclado/reordenação existente; registrar falha relevante sem alterar stores ou cálculos. [FR-007, FR-008, FR-009, FR-012]
- [ ] T015 [skill: $tdd] [P] [US2] Criar tests/components/component-adequation/search-substitution.test.tsx para ReadyMealSearchResultsList, RecipeSearchResultsList, FoodSearchModal e SubstituteFoodModal; testar DataTable/estados internos, busca/seleção por teclado, quantidade, resultados, foco/retorno/erro e textos longos; verificar listas extensas preservando paginação/virtualização existente e reproduzir os desvios. [FR-007, FR-008, FR-009, FR-010, FR-012, NFR-004]
- [ ] T016 [skill: $tdd] [P] [US2] Criar tests/components/component-adequation/patient-tables.test.tsx para tabelas, ConsultationHistoryRow/ExpandedRow e PatientListTableRow; testar headers/roles, vazio, expansão, navegação sem dupla ativação, seleção/ordenação existentes, chaves e macros; reproduzir falhas sem remover cobertura dos testes em tests/components/organisms. [FR-002, FR-008, FR-009, FR-010, FR-011, FR-012]
- [ ] T017 [skill: $tdd] [P] [US2] Criar tests/components/component-adequation/diet-overlays.test.tsx para importação e consulta; testar seleção/busca/expansão, promise rejeitada sem fechar modal, leitura de snapshot sem recálculo/escrita, foco/Escape/retorno e acesso ao conteúdo; caracterizar os contratos distintos do legado antes de retirar qualquer fonte. [FR-008, FR-009, FR-011, FR-012, NFR-003]

### Adequação e migração

- [ ] T018 [skill: $design-system] [US2] Adequar src/components/atoms/IconButton.tsx e src/components/molecules/MacroProportionBar.tsx, MacroSummary.tsx às receitas existentes, mudando somente desvios comprovados; preservar API/aliases e cálculo, evitar valores visuais locais; verificar T013 e regressões existentes com semântica, foco e ausência/zero corretos. [FR-006, FR-007, FR-009, FR-011, NFR-001]
- [ ] T019 [skill: $frontend-architecture-mindset] [US2] Migrar src/components/molecules/CarbCyclingVariationPanel.tsx e DietModeSwitcher.tsx para src/components/organisms/diet/, adequando seleção/ações/teclado sem mudar domínio; atualizar src/components/organisms/diet/DietContextSection.tsx, demais imports/barrels e testes afetados; verificar T014, ausência de reexport ascendente e mesmas escolhas/callbacks. [FR-002, FR-003, FR-007, FR-008, FR-009]
- [ ] T020 [skill: $design-system] [US2] Adequar src/components/molecules/food-search/FoodSearchCategorySelector.tsx usando o primitivo de seleção vigente, removendo mistura incoerente de roles e uso semântico indevido de cores; manter seleção controlada única e labels; verificar T014 e testes existentes sem alterar src/components/ui ou tokens. [FR-007, FR-008, FR-009, NFR-001]
- [ ] T021 [skill: $proj-table-adequation-v2] [US2] Adequar src/components/molecules/food-search/ReadyMealSearchResultsList.tsx e RecipeSearchResultsList.tsx à DataTable resolvida em T003; manter empty/loading/error aplicáveis dentro do contrato, seleção/chaves/headers/porções e valores; verificar T015, testes existentes e auditor estrito dos targets. [FR-007, FR-008, FR-009, FR-010, FR-011, NFR-004]
- [ ] T022 [skill: $frontend-architecture-mindset] [US2] Migrar src/components/molecules/FoodSearchModal.tsx e SubstituteFoodModal.tsx para src/components/organisms/foods/, adequando receita overlays, foco/scroll e composição dos resultados; atualizar consumidores, barrels e import do tipo MealFoodToSubstitute sem mudar lógica de hooks; verificar T015, testes existentes e ausência de imports obsoletos/ascendentes. [FR-002, FR-003, FR-007, FR-008, FR-009, NFR-003]
- [ ] T023 [skill: $proj-table-adequation-v2] [US2] Mover a implementação de src/components/molecules/ImportPreviousDietModal.tsx para src/components/organisms/diets/ImportPreviousDietModal.tsx, substituindo a fachada invertida; adequar overlay/tabela, preservar API atual/erro assíncrono e migrar imports/testes/barrels antes de retirar o caminho antigo; verificar T017, resolver tabular e mesma origem/dados após importar. [FR-003, FR-007, FR-008, FR-009, FR-010, FR-011]
- [ ] T024 [skill: $design-system] [US2] Adequar src/components/organisms/diets/ReadOnlyDietModal.tsx em borda estática, tipografia, body rolável e conteúdo canônico; preservar snapshots DietPlan; comprovar zero consumidor do legado src/components/molecules/ReadOnlyDietModal.tsx antes de removê-lo e migrar testes estruturais/barrels; se surgir uso concorrente, coordenar remoção, sem converter HistoricalDiet; verificar T017 e zero escrita/recálculo. [FR-003, FR-007, FR-008, FR-009, FR-011, FR-015, NFR-003]
- [ ] T025 [skill: $proj-table-adequation-v2] [US2] Adequar src/components/organisms/patient/PatientAssessmentsTable.tsx e PatientDietsTable.tsx e suas parts às receitas DataTable/data-display/nutrition-context; preservar contratos correntes, callbacks, unidades, expansão e estados internos; verificar T016, testes existentes e auditor estrito de cada target. [FR-007, FR-008, FR-009, FR-010, FR-011]
- [ ] T026 [skill: $proj-table-adequation-v2] [US2] Adequar src/components/organisms/patient/ConsultationHistoryRow.tsx e PatientListTableRow.tsx, integrando filhos a PatientConsultationHistoryTable e src/components/organisms/PatientListTable.tsx; preservar semântica row, link focável e detalhes associados, sem dupla ativação nem valor arbitrário; verificar T016, resolver dos pais e ownership dos avisos delimitados. [FR-002, FR-007, FR-008, FR-009, FR-010]
- [ ] T027 [skill: $frontend-architecture-mindset] [US2] Fechar compatibilidade em src/components/molecules/index.ts, src/components/organisms/index.ts e demais barrels inventariados, rotas/hooks/templates e testes estruturais tests/components/molecules/composition.test.ts, tests/components/overlays-accessibility.test.tsx, tests/tooling/table-conformance.test.ts; executar tests/architecture/component-adequation.test.ts, criado em T004, para fronteiras/caminhos finais; verificar zero referência legada, type-check e regressões T013–T017 sem apagar asserções. [FR-003, FR-008, FR-012, FR-014, NFR-004]

**Checkpoint US2**: cenários de cada família passam; migrações e consumidores fechados.
A comprovação visual/global continua obrigatória na US3.

## Fase 5 — US3: Evidência de adequação e preservação das regras (P2)

**Objetivo**: comprovar código, catálogo, invariantes e UI após as migrações.
**Teste independente**: outro revisor reproduz comandos e liga cada requisito
a uma fonte/teste/evidência, sem utilizar dados pessoais.

- [ ] T028 [skill: $design-system] [US3] Reconciliar o estado final de design-system/components/registry.json e somente os perfis afetados em design-system/components/profiles após T019/T022–T027; atualizar layers/sources/roles/exports/consumers e baseline pela mesma descoberta vigente; verificar contrato T005 e resolução dos cinco avisos sem supressão, mantendo status compatível com a evidência disponível. [FR-003, FR-004, FR-005, FR-014, SC-001, SC-002, SC-004]
- [ ] T029 [skill: $webapp-testing] [US3] Criar tests/browser/component-adequation.spec.ts com fixtures de T002 e harness isolado, cobrindo cada família e matriz de quickstart.md; criar specs/30-08-26-adequacao-componentes-design-system/playwright.config.ts com servidor próprio em porta livre, reuseExistingServer: false, baseURL correspondente e testDir/testMatch limitados à feature, documentando comando em quickstart.md e impedindo reuso de servidor/perfil pessoal sem alterar a config global; verificar coleta dos cenários, contextos descartáveis e falha segura se isolamento não puder ser garantido. [FR-009, FR-011, FR-012, FR-013, NFR-002, NFR-003, NFR-005]
- [ ] T030 [skill: $webapp-testing] [US3] Executar e revisar os cenários T029 em 1024px/1440px, zoom 200% e reduced motion pertinentes, incluindo nomes longos, vazio e estados aplicáveis; registrar screenshots, teclado/foco/scroll e comparação de dados/callbacks em specs/30-08-26-adequacao-componentes-design-system/evidence/browser/; verificar cobertura de todas as famílias sem aprovar snapshots automaticamente. [FR-007, FR-009, FR-010, FR-011, FR-013, NFR-002, NFR-003, SC-003, SC-006]
- [ ] T031 [skill: $webapp-testing] [US3] Executar integralmente specs/30-08-26-adequacao-componentes-design-system/quickstart.md, incluindo suíte default e catálogo explícito, type-check, lint, build, links, Atomic, z-index, legado, design-system e tabelas; salvar saídas atuais em evidence/final-gates/ e verificar zero erro/aviso delimitado, separando falhas externas e sem alegar aprovação global se algum gate falhar. [FR-012, FR-013, FR-014, NFR-004, NFR-005, SC-003, SC-004]
- [ ] T032 [skill: $code-reviewer-expert] [US3] Comparar hashes/diffs e campos protegidos da baseline com o fechamento; criar specs/30-08-26-adequacao-componentes-design-system/validation-report.md com FR/NFR/SC → tarefa/fonte/teste/evidência, estado real de cada achado e mudanças concorrentes; verificar zero alteração atribuível à feature em normas/primitivos/auditores/domínio e zero I/O pessoal, explicitando limitações e ausência de aprovação humana. [FR-013, FR-015, NFR-001, NFR-003, NFR-005, NFR-006, SC-005]

## Fase 6 — Revisão e fechamento

- [ ] T033 [skill: $code-reviewer-expert] Revisar o diff delimitado contra contracts/components.md e contracts/validation.md e registrar resultado em specs/30-08-26-adequacao-componentes-design-system/evidence/review.md; verificar comportamento preservado, cobertura de cada achado e nenhuma ampliação indevida; qualquer correção volta à tarefa correspondente e repete os gates afetados, sem confundir revisão do agente com os dois revisores humanos previstos. [FR-008, FR-013, FR-014, NFR-006, SC-001, SC-002, SC-003, SC-004, SC-005, SC-006]
- [ ] T034 [skill: $code-reviewer-expert] Reconciliar specs/30-08-26-adequacao-componentes-design-system/tasks.md e validation-report.md com evidências reais; marcar somente tarefas concluídas, listar bloqueios externos e revisões humanas pendentes e entregar o resultado sem commit/deploy; verificar que nenhuma afirmação de conformidade excede os testes/revisões realizados. [FR-013, FR-015, NFR-006]

## Dependências e ordem de execução

Preparação T001 → T002 → fundações T003 → T004 → US1 → US2 → US3 → revisão.
As histórias têm testes independentes, mas a implementação desta adequação é
sequencial por compartilhar contratos, catálogo e consumidores:

- US1: T005 antes de T006–T010; estes convergem em T011 → T012.
- US2: T013–T017 primeiro; T018 depende de T013; T019/T020 de T014;
  T021 de T015; T022 de T020/T021; T023/T024 de T017;
  T025/T026 de T016 e T018. T027 fecha todas as migrações e testes.
- US3: T028 após US2; T029 após T028; T030 → T031 → T032.
- Fechamento: T033 → T034. Se houver correção, repetir o ramo afetado,
  auditorias finais e comparação protegida antes de concluir.
- Cada move atualiza os consumidores no próprio passo; T027 é uma segunda
  verificação, não permissão para manter imports quebrados entre passos.
- Campos/perfis alterados novamente por T028 não são duplicação: US1 documenta
  a baseline e migração requerida; US3 registra as fontes realmente migradas.

## Paralelismo seguro

- US1: T006–T010 podem ocorrer em paralelo depois de T005, por perfis disjuntos;
  só T011 escreve no registry, após todos terminarem.
- US2: T013–T017 podem ocorrer em paralelo após US1, usando a fixture já pronta
  e arquivos de teste distintos. Refactors T018–T027 permanecem serializados
  por imports/barrels/consumidores compartilhados.
- US3: sem escrita paralela planejada; coleta visual e gates precisam do mesmo
  estado estabilizado. Revisores podem consultar evidências em modo leitura.

## Estratégia de entrega e verificação

Primeiro baseline/testes, depois MVP documental US1, adequação funcional US2
e comprovação US3. Não parar no MVP como se o pedido inteiro estivesse cumprido.
Não adicionar features, dependências ou ajustes de design system.
Os testes novos devem falhar por uma diferença relevante e passar pela correção,
não por relaxamento de expectativa. Testes verdes apenas caracterizadores são
preservados e complementados pelo caso que reproduz o desvio.

A entrega desta criação do SDD contém somente artefatos para revisão. As tarefas
acima são futuras e ficam desmarcadas até aprovação humana e execução real.
