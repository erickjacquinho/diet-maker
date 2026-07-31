---

description: "Tarefas para migração integral do runtime legado para o Design System canônico"
---

# Tasks: Migração integral para o Design System canônico

**Input**: Design documents from `specs/31-07-26-criar-um-sdd-completo-para/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Execution**: executar todas as tarefas pelo `/speckit-implement`. Cada tarefa possui exatamente uma atribuição `[skill: $nome]`. A etiqueta `[P]` só aparece quando os arquivos são independentes e não há dependência pendente.

**Global rule**: nenhuma tarefa de implementação pode avançar se o gate da fase anterior estiver vermelho. Todo gate precisa registrar o comando, o escopo auditado, a saída e o estado no registro de checkpoint antes de marcar a tarefa como concluída.

## Phase 1: Setup (inventário e infraestrutura compartilhada)

**Purpose**: congelar o estado inicial e preparar evidências reprodutíveis sem alterar o runtime.

- [X] T001 Ler `AGENTS.md`, `design-system/README.md`, `.agents/rules/atomic-design.md` e `.agents/rules/shadcn-preservation.md`, registrar as regras aplicáveis em `specs/31-07-26-criar-um-sdd-completo-para/research.md` [FR-021] [FR-026] [skill: $speckit-implement]
- [X] T002 [P] Criar o diretório de artefatos de execução `.artifacts/design-system/` e sua política de rastreabilidade em `specs/31-07-26-criar-um-sdd-completo-para/quickstart.md` [FR-002] [FR-023] [skill: $speckit-implement]
- [X] T003 [P] Criar `scripts/capture-design-system-baseline.mjs` para enumerar componentes, rotas, imports, aliases, classes e contagens do baseline [FR-001] [skill: $code-reviewer-expert]
- [X] T004 [P] Criar `tests/fixtures/design-system-legacy/` com um arquivo mínimo por código LEG001–LEG010, sem conectá-los ao runtime [FR-021] [skill: $tdd]
- [X] T005 Executar o baseline duas vezes e salvar a evidência em `.artifacts/design-system/design-system-baseline.json`; confirmar que `npm run type-check`, `npm run lint`, `npm test`, `npm run verify:links` e `npm run audit:atomic-design` permanecem verdes [SC-006] [skill: $speckit-implement]
- [X] T006 Registrar `MigrationBaseline` inicial e estado `legacy-inventoried` em `specs/31-07-26-criar-um-sdd-completo-para/data-model.md`, sem declarar nenhum componente ou rota conforme [FR-001] [skill: $design-system]
- [X] T007 Criar o primeiro checkpoint local com mensagem rastreável e registrar o identificador no `specs/31-07-26-criar-um-sdd-completo-para/data-model.md` [FR-023] [skill: $git-commit]
- [X] T008 Executar o gate de Stage 0 conforme `specs/31-07-26-criar-um-sdd-completo-para/contracts/migration-gate.contract.md`; bloquear a fase se o baseline não for determinístico ou qualquer comando falhar [SC-011] [skill: $speckit-implement]

---

## Phase 2: Foundational (contrato de runtime bloqueante)

**Purpose**: estabelecer a fundação canônica que todas as user stories consumirão.

**CRITICAL**: nenhuma migração de componente ou rota pode começar antes desta fase estar verde.

- [ ] T009 [P] Escrever testes que falhem inicialmente para tokens, text styles e recipes em `tests/design-system/tokens.test.ts`, `tests/design-system/text-styles.test.ts` e `tests/design-system/recipes.test.ts` [FR-002] [FR-003] [skill: $tdd]
- [ ] T010 [P] Escrever testes de rejeição dos códigos LEG001–LEG010 para o auditor em `tests/design-system/legacy-audit.contract.test.ts` usando as fixtures de `tests/fixtures/design-system-legacy/` [FR-021] [skill: $tdd]
- [ ] T011 [P] Criar os tipos fechados de tokens, text styles, recipes, findings e checkpoints em `src/design-system/types.ts` [FR-002] [FR-022] [skill: $design-system]
- [ ] T012 Criar as variáveis primitive, semantic e component em `src/design-system/tokens.css`, alinhadas exclusivamente a `design-system/03-token-architecture.md`, `design-system/04-color-system.md`, `design-system/05-typography-system.md`, `design-system/06-geometry-and-desktop-layout.md`, `design-system/07-icons-motion-and-layers.md` e `design-system/08-states-and-accessibility.md` [FR-002] [SC-003] [skill: $design-system]
- [ ] T013 Definir `TokenId`, nomes por camada e o mapa público `tokenNames` em `src/design-system/types.ts`/`src/design-system/index.ts`, apontando para as variáveis CSS sem duplicar valores [FR-002] [skill: $design-system]
- [ ] T014 Criar a escala fechada de tipografia em `src/design-system/text-styles.ts`, incluindo uso permitido, cor, peso, tamanho e line-height de cada estilo [FR-003] [SC-004] [skill: $design-system]
- [ ] T015 Criar recipes CVA de componentes em `src/design-system/recipes.ts`, com variantes, estados, densidades e perfis permitidos [FR-004] [skill: $design-system]
- [ ] T016 Criar a API única de runtime em `src/design-system/index.ts` e remover qualquer export visual duplicado dentro de `src/design-system/` [FR-002] [FR-004] [skill: $frontend-architecture-mindset]
- [ ] T017 Fazer os testes T009 passarem em `tests/design-system/` e executar o gate de Stage 1, validando que valores arbitrários, IDs inexistentes e variantes não cadastradas são rejeitados sem escape local e que type-check/lint/testes estão verdes [FR-002] [FR-003] [FR-004] [FR-018] [skill: $tdd]
- [ ] T018 [P] Atualizar `src/app/globals.css` para importar somente `src/design-system/tokens.css` e regras globais canônicas, removendo fonte antiga, reset visual proibido, sombra global e dark mode ativo [FR-005] [FR-006] [skill: $ui-styling]
- [ ] T019 [P] Atualizar `tailwind.config.js` com aliases de tokens semânticos, spacing, radius e text styles canônicos, removendo palette/radius/font aliases legados [FR-006] [skill: $ui-styling]
- [ ] T020 [P] Atualizar `components.json` e utilitários de composição sem inserir domínio em `src/components/ui/` [FR-006] [FR-010] [skill: $shadcn]
- [ ] T021 [P] Adicionar teste de configuração em `tests/design-system/configuration.test.ts` para globals, Tailwind, Shadcn e ausência de aliases legados [FR-005] [FR-006] [skill: $tdd]
- [ ] T022 Executar o gate de Stage 2 com `tests/design-system/configuration.test.ts`, `npm run type-check`, `npm run lint`, `npm test`, `npm run verify:links` e auditoria LEG001–LEG010 limitada a `src/app/globals.css`, `tailwind.config.js` e `components.json` [FR-006] [FR-018] [FR-020] [SC-001] [skill: $speckit-implement]
- [ ] T023 Registrar `TokenContract` e `TextStyleContract` conformes e avançar o checkpoint para `foundation-migrated` somente após T022 verde em `specs/31-07-26-criar-um-sdd-completo-para/data-model.md` [FR-022] [FR-023] [skill: $design-system]

---

## Phase 3: User Story 1 — Adotar a fundação canônica em runtime (Priority: P1) 🎯 MVP

**Goal**: garantir que runtime, globals, Tailwind e recipes tenham uma única base visual canônica.

**Independent Test**: contratos de runtime passam, aliases legados não existem e o gate de fundação registra zero findings no escopo.

- [ ] T024 [US1] Atualizar imports dos consumidores da fundação para `src/design-system/index.ts`, começando por `src/app/layout.tsx` e utilitários compartilhados [FR-002] [skill: $frontend-architecture-mindset]
- [ ] T025 [US1] Substituir os últimos usos diretos do runtime antigo em `src/design-system/` e registrar cada remoção em `design-system/components/registry.json` [FR-005] [FR-022] [skill: $design-system]
- [ ] T026 [US1] Executar `tests/design-system/legacy-audit.contract.test.ts` com fixtures e depois com o código real; confirmar zero findings no escopo de fundação [FR-021] [skill: $tdd]
- [ ] T027 [US1] Executar `npm run type-check`, `npm run lint`, `npm test` e `npm run verify:links`; anexar saídas em `.artifacts/design-system/stage-1-foundation.json` [SC-006] [skill: $speckit-implement]
- [ ] T028 [US1] Revisar visualmente a fundação no viewport desktop ≥1024px e validar contraste/foco das stories de teste em `tests/design-system/visual-baseline.md` [FR-019] [skill: $webapp-testing]
- [ ] T029 [US1] Marcar US1 e Stage 1 como `conforme` apenas se o contrato `specs/31-07-26-criar-um-sdd-completo-para/contracts/migration-gate.contract.md` estiver totalmente verde; caso contrário registrar `blocked` [SC-011] [skill: $speckit-implement]

---

## Phase 4: User Story 2 — Migrar primitives Shadcn e atoms (Priority: P1)

**Goal**: migrar 14 primitives e 6 atoms sem perder semântica, API, acessibilidade ou isolamento de domínio.

**Independent Test**: todos os arquivos ui/atoms passam auditoria, testes de estados e `audit:atomic-design` sem imports ascendentes.

### Tests first

- [ ] T030 [P] [US2] Criar testes de contrato de API e estados para os 14 primitives em `tests/components/ui/` antes de editar os componentes [FR-007] [FR-008] [skill: $tdd]
- [ ] T031 [P] [US2] Criar testes de estados para os 6 atoms em `tests/components/atoms/` antes de editar os componentes [FR-007] [FR-008] [skill: $tdd]
- [ ] T032 [P] [US2] Criar testes de isolamento Shadcn em `tests/components/ui/shadcn-isolation.test.ts` para bloquear imports de atoms, molecules, domínio e página [FR-010] [skill: $shadcn]

### Implementation

- [ ] T033 [P] [US2] Migrar os primitives de `src/components/ui/` para `src/design-system/recipes.ts`, preservando semântica e API pública [FR-007] [FR-009] [skill: $shadcn]
- [ ] T034 [P] [US2] Migrar os atoms de `src/components/atoms/` para tokens, text styles e recipes canônicos, sem classes visuais livres [FR-007] [FR-009] [skill: $ui-styling]
- [ ] T035 [US2] Implementar estados default, hover, pressed, focus-visible, disabled, loading, error, empty e read-only aplicáveis em `src/components/ui/` e `src/components/atoms/` [FR-008] [skill: $design-system]
- [ ] T036 [US2] Atualizar testes de acessibilidade e teclado para ui/atoms em `tests/components/ui/accessibility.test.tsx` e `tests/components/atoms/accessibility.test.tsx` [FR-008] [FR-019] [skill: $webapp-testing]
- [ ] T037 [US2] Executar auditoria LEG001–LEG010 limitada a `src/components/ui/` e `src/components/atoms/`, `npm run audit:atomic-design`, type-check, lint e testes [FR-020] [SC-001] [skill: $speckit-implement]
- [ ] T038 [US2] Fazer revisão visual desktop e axe dos ui/atoms e salvar evidência em `.artifacts/design-system/stage-2-ui-atoms.json` [FR-019] [SC-006] [skill: $webapp-testing]
- [ ] T039 [US2] Atualizar `design-system/components/registry.json` com 20 registros conformes e avançar checkpoint somente se T030–T038 estiverem verdes [FR-022] [FR-023] [skill: $design-system]

---

## Phase 5: User Story 3 — Migrar molecules, organisms e templates (Priority: P1)

**Goal**: migrar componentes compostos sem importação ascendente, sem visual legado e sem alteração de função.

**Independent Test**: as famílias compostas renderizam estados reais, passam auditorias e preservam comportamento documentado.

### Tests first

- [ ] T040 [P] [US3] Criar testes de composição para as 14 molecules em `tests/components/molecules/` antes da migração [FR-011] [FR-012] [skill: $tdd]
- [ ] T041 [P] [US3] Criar testes de integração para 3 organisms e 2 templates em `tests/components/organisms/` e `tests/components/templates/` [FR-011] [FR-012] [skill: $tdd]
- [ ] T042 [P] [US3] Criar cenários de Dialog, Sheet, Popover, Select, Sidebar e modais nutricionais em `tests/components/overlays-accessibility.test.tsx` [FR-012] [FR-019] [skill: $webapp-testing]

### Implementation

- [ ] T043 [P] [US3] Migrar os 14 arquivos de `src/components/molecules/` por categoria e perfil, removendo classes legadas e valores visuais locais [FR-011] [skill: $ui-styling]
- [ ] T044 [P] [US3] Migrar os 3 arquivos de `src/components/organisms/` para compor apenas primitives, atoms e molecules permitidos [FR-011] [FR-013] [skill: $frontend-architecture-mindset]
- [ ] T045 [P] [US3] Migrar os 2 arquivos de `src/components/templates/` preservando shell, navegação e slots funcionais [FR-011] [FR-013] [skill: $nextjs-fullstack-master]
- [ ] T046 [US3] Aplicar recipes de categoria/perfil em `src/components/molecules/`, `src/components/organisms/` e `src/components/templates/`, com estados de loading/error/empty/read-only e tokens de macro sem inventar cor local [FR-011] [FR-012] [skill: $design-system]
- [ ] T047 [US3] Validar focus trap, dismissal, keyboard navigation, nome/role/value e foco visível nos overlays em `tests/components/overlays-accessibility.test.tsx` [FR-012] [FR-019] [skill: $webapp-testing]
- [ ] T048 [US3] Executar auditoria LEG001–LEG010 no escopo molecules/organisms/templates, `audit:atomic-design`, type-check, lint e testes [FR-020] [SC-001] [skill: $speckit-implement]
- [ ] T049 [US3] Fazer revisão visual desktop de compostos e registrar evidência em `.artifacts/design-system/stage-3-composites.json` [FR-019] [SC-006] [skill: $webapp-testing]
- [ ] T050 [US3] Sincronizar `design-system/components/registry.json` com camada, perfil, dependências e lifecycle dos 19 componentes compostos; avançar somente com gate verde [FR-013] [FR-022] [skill: $design-system]

---

## Phase 6: User Story 4 — Migrar layouts e todas as rotas (Priority: P1)

**Goal**: substituir o Design System legado em todas as telas, preservando URLs, fluxos, dados e comportamento.

**Independent Test**: cada rota abre no desktop, mantém seus estados e possui zero legado no código e no DOM renderizado.

### Tests first

- [ ] T051 [P] [US4] Criar matriz de estados por rota em `tests/routes/route-acceptance-matrix.ts` para default, loading, vazio, erro e read-only aplicáveis [FR-015] [FR-016] [skill: $tdd]
- [ ] T052 [P] [US4] Criar testes de navegação, links e contratos de URL em `tests/routes/navigation.test.tsx` [FR-016] [FR-018] [skill: $tdd]
- [ ] T053 [P] [US4] Criar smoke tests das 10 rotas em `tests/routes/route-smoke.test.tsx` com captura de erros de runtime [FR-015] [FR-018] [skill: $webapp-testing]

### Implementation

- [ ] T054 [US4] Migrar `src/app/layout.tsx` e layouts aplicáveis para tokens, recipes e providers canônicos sem mudar metadata ou domínio [FR-014] [FR-017] [skill: $nextjs-fullstack-master]
- [ ] T055 [P] [US4] Migrar `src/app/page.tsx`, `src/app/alimentos/page.tsx`, `src/app/pacientes/page.tsx`, `src/app/presets/page.tsx`, `src/app/receitas/page.tsx` e `src/app/refeicoes-prontas/page.tsx` [FR-014] [FR-015] [skill: $ui-styling]
- [ ] T056 [P] [US4] Migrar `src/app/pacientes/[id]/page.tsx`, `src/app/pacientes/[id]/consulta/[date]/page.tsx` e `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx` [FR-014] [FR-015] [skill: $ui-styling]
- [ ] T057 [US4] Substituir classes `warm-*`, text sizes arbitrários, radius/sombra/peso/breakpoint/transition legados em todo `src/app/` por APIs canônicas [FR-014] [FR-020] [skill: $design-system]
- [ ] T058 [US4] Validar busca, filtros, formulários, navegação, persistência, dados nutricionais e URLs sem alterar regras de negócio em `tests/routes/behavior-preservation.test.tsx` [FR-017] [skill: $tdd]
- [ ] T059 [US4] Executar auditoria de legado por rota e global, `npm run verify:links`, type-check, lint, testes e `npm run build` [FR-020] [SC-001] [SC-006] [skill: $speckit-implement]
- [ ] T060 [US4] Executar revisão visual desktop, axe, teclado/foco e estados críticos das 10 rotas; registrar um `RouteAcceptanceRecord` por rota em `.artifacts/design-system/routes/` [FR-015] [FR-019] [FR-024] [skill: $webapp-testing]
- [ ] T061 [US4] Atualizar `design-system/components/registry.json` e o catálogo de telas com as evidências das 10 rotas, sem marcar proposta como implementada [FR-022] [FR-024] [skill: $design-system]
- [ ] T062 [US4] Avançar checkpoint para `route-migrated` somente quando cada `RouteAcceptanceRecord` estiver completo e todos os gates passarem [FR-023] [SC-011] [skill: $speckit-implement]

---

## Phase 7: User Story 5 — Remover e bloquear o legado (Priority: P1)

**Goal**: eliminar fontes executáveis antigas e impedir sua reintrodução futura.

**Independent Test**: auditor global encontra zero findings e falha de forma determinística quando qualquer fixture legada é inserida.

- [ ] T063 [P] [US5] Consolidar padrões e exceções autorizadas em `scripts/design-system-legacy-rules.mjs`, com códigos LEG001–LEG010 e mensagens acionáveis [FR-021] [skill: $code-reviewer-expert]
- [ ] T064 [US5] Implementar `scripts/verify-design-system-legacy.mjs` com flags `--json` e `--paths`, JSON estável e exit codes 0/1/2 conforme contrato [FR-021] [skill: $code-reviewer-expert]
- [ ] T065 [P] [US5] Adicionar teste de integração do auditor em `tests/design-system/legacy-audit.test.ts` cobrindo cada fixture e o repositório real [FR-021] [skill: $tdd]
- [ ] T066 [US5] Remover arquivos, exports, aliases e helpers antigos sem consumidor em `src/design-system/`, `src/app/`, `src/components/` e `tailwind.config.js` [FR-020] [FR-025] [skill: $design-system]
- [ ] T067 [US5] Atualizar scripts `package.json` com `verify:design-system-legacy` e integrar o auditor aos gates sem remover verificações existentes [FR-021] [FR-026] [skill: $speckit-implement]
- [ ] T068 [US5] Executar o auditor contra `tests/fixtures/design-system-legacy/` e confirmar que cada LEG001–LEG010 falha antes de restaurá-las, sem alterar código histórico [FR-021] [SC-007] [skill: $tdd]
- [ ] T069 [US5] Executar `node scripts/verify-design-system-legacy.mjs --json` no repositório inteiro e confirmar zero findings em código, config, testes de produção e DOM de smoke [FR-020] [SC-001] [skill: $speckit-implement]
- [ ] T070 [US5] Executar type-check, lint, test, build, links, `audit:atomic-design` e `verify:design-system --strict`; salvar `.artifacts/design-system/stage-8-removal.json` [SC-006] [skill: $speckit-implement]
- [ ] T071 [US5] Registrar todos os itens antigos como `removed`/`deprecated` com evidência em `design-system/components/registry.json` e `specs/31-07-26-criar-um-sdd-completo-para/data-model.md` [FR-022] [FR-025] [skill: $design-system]
- [ ] T072 [US5] Avançar checkpoint para `homologated-candidate` somente com zero findings e teste negativo reproduzível [FR-023] [SC-011] [skill: $speckit-implement]

---

## Phase 8: User Story 6 — Homologação e evidência reproduzível (Priority: P2)

**Goal**: comprovar de forma independente que a migração está completa, acessível, visualmente conforme e recuperável.

**Independent Test**: o quickstart executado em ambiente limpo produz os mesmos resultados e evidencia SC-001–SC-012.

- [ ] T073 [P] [US6] Criar o formato final de evidência em `.artifacts/design-system/manifest.schema.json` para baseline, componentes, rotas, findings e checkpoints [FR-022] [FR-023] [skill: $design-system]
- [ ] T074 [P] [US6] Criar `tests/routes/design-system-page.test.tsx` para garantir que `/design-system` exibe implementado/proposto/migration-required sem confusão [FR-024] [skill: $tdd]
- [ ] T075 [US6] Reescrever `src/app/design-system/page.tsx` para consumir exclusivamente `src/design-system/index.ts` e exibir tokens, text styles, recipes, estados e categorias [FR-024] [skill: $design-system]
- [ ] T076 [US6] Executar o gate de Stage 7 e depois o quickstart completo de `specs/31-07-26-criar-um-sdd-completo-para/quickstart.md` em ambiente limpo; salvar o manifest em `.artifacts/design-system/final-manifest.json` [FR-024] [SC-006] [SC-011] [skill: $speckit-implement]
- [ ] T077 [US6] Fazer smoke test manual das 10 rotas, revisão visual desktop, axe, teclado/foco, contraste e overlays; anexar registros em `.artifacts/design-system/final-visual-a11y.json` [FR-019] [SC-005] [skill: $webapp-testing]
- [ ] T078 [US6] Confirmar que nenhum arquivo em `refs/`, `refs/UI/`, `refs/UI/design-system-prd/` ou `demo_dashboard.html` foi alterado e registrar hash/escopo em `.artifacts/design-system/historical-integrity.json` [FR-026] [SC-010] [skill: $code-reviewer-expert]
- [ ] T079 [US6] Validar SC-001–SC-012 contra `spec.md`, `plan.md`, `data-model.md`, contratos e manifest final; listar qualquer critério não comprovado em `specs/31-07-26-criar-um-sdd-completo-para/quickstart.md` [SC-001] [SC-012] [skill: $speckit-analyze]
- [ ] T080 [US6] Criar checkpoint final, registrar estado `homologated` e impedir conclusão se qualquer evidência estiver ausente em `specs/31-07-26-criar-um-sdd-completo-para/data-model.md` [FR-023] [SC-011] [skill: $git-commit]

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: fechar documentação, prevenir regressões e repetir o gate completo antes da entrega.

- [ ] T081 [P] Atualizar `design-system/README.md` apenas se for necessário documentar o contrato de runtime implementado, sem duplicar regras normativas [FR-026] [skill: $design-system]
- [ ] T082 [P] Atualizar `AGENTS.md` somente se o roteamento de fontes de verdade ou comandos de validação tiver mudado, registrando a razão [FR-026] [skill: $speckit-implement]
- [ ] T083 [P] Revisar todos os exports públicos e remover dead code detectado em `src/design-system/`, `src/components/` e `src/app/`, sem adicionar decisão visual local [FR-025] [skill: $code-reviewer-expert]
- [ ] T084 [P] Executar `npm run verify:design-system-legacy -- --json`, `npm run verify:design-system`, `npm run audit:atomic-design` e `npm run verify:links` no estado final [SC-001] [skill: $speckit-implement]
- [ ] T085 Executar `npm run type-check`, `npm run lint`, `npm test` e `npm run build` no estado final e salvar saídas em `.artifacts/design-system/final-quality.json` [SC-006] [skill: $speckit-implement]
- [ ] T086 Executar o quickstart novamente sem mudanças e comparar o manifest com `.artifacts/design-system/final-manifest.json`; divergência não explicada bloqueia a entrega [SC-011] [skill: $speckit-analyze]
- [ ] T087 Revisar o diff final e salvar a conclusão em `.artifacts/design-system/final-diff-review.md`, confirmando que nenhuma regra de negócio, URL, contrato de dados, referência histórica ou escopo mobile/tablet/dark foi introduzido [FR-017] [FR-026] [skill: $code-reviewer-expert]
- [ ] T088 Confirmar que todos os 39 componentes atuais, 4 propostas e 10 rotas têm estado documental correto em `design-system/components/registry.json` e nos artefatos finais [SC-002] [SC-003] [skill: $design-system]
- [ ] T089 Registrar o relatório final de gates e o ponto de rollback em `specs/31-07-26-criar-um-sdd-completo-para/quickstart.md` sem declarar conformidade sem evidência [FR-023] [FR-025] [skill: $speckit-analyze]
- [ ] T090 Executar o gate de qualidade preliminar em `specs/31-07-26-criar-um-sdd-completo-para/contracts/migration-gate.contract.md` após T081–T089; se houver falha, manter a fase `blocked` até as verificações finais [SC-011] [skill: $speckit-implement]

- [ ] T091 Verificar em `tests/routes/design-system-page.test.tsx` e `.artifacts/design-system/final-manifest.json` que `/design-system` demonstra 100% do vocabulário canônico necessário e nenhuma referência anterior [SC-008] [skill: $tdd]
- [ ] T092 Verificar em `design-system/components/registry.json` e `.artifacts/design-system/final-manifest.json` que nenhum arquivo executável fora do registry expõe export visual público sem perfil/categoria [SC-009] [skill: $code-reviewer-expert]
- [ ] T093 Encerrar o fluxo em `specs/31-07-26-criar-um-sdd-completo-para/quickstart.md` solicitando validação humana do SDD e da implementação somente com todos os gates verdes; qualquer falha mantém o checkpoint bloqueado [SC-011] [skill: $speckit-implement]

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: nenhuma dependência; deve gerar baseline antes de qualquer edição de runtime.
- **Foundational (Phase 2)**: depende de Setup e bloqueia todas as user stories.
- **US1 (Phase 3)**: depende da fundação; é o MVP técnico e deve ficar verde antes das camadas superiores.
- **US2 (Phase 4)**: depende de US1; pode paralelizar ui e atoms somente em arquivos diferentes.
- **US3 (Phase 5)**: depende de US2; molecules, organisms e templates seguem a hierarquia obrigatória.
- **US4 (Phase 6)**: depende de US3; nenhuma rota pode mascarar legado não resolvido em seus componentes.
- **US5 (Phase 7)**: depende de US4 para auditoria global; a regra de auditoria pode ser criada antes, mas a remoção final só ocorre depois de todas as rotas.
- **US6 (Phase 8)**: depende de US5; a homologação é a prova final, não substitui os gates anteriores.
- **Polish (Phase 9)**: depende de todas as fases e deve repetir o gate global.

### Parallel Opportunities

- T003/T004 e T011/T012/T013/T014/T015 podem ocorrer em paralelo quando não alterarem o mesmo arquivo.
- T030–T032 são testes independentes; T033/T034 podem ocorrer em paralelo por camada.
- T040–T042 são testes independentes; T043–T045 podem ocorrer em paralelo por diretório.
- T055/T056 podem ocorrer em paralelo por conjunto de rotas.
- T063/T065 e T073/T074 são independentes dentro de suas fases.

### Mandatory Gate Order

Em cada fase: (1) testes/contratos falham para a mudança proposta, (2) implementação, (3) auditoria de legado no escopo, (4) Atomic/Shadcn e registry, (5) type-check/lint/test/links/build quando aplicável, (6) visual/a11y/DOM quando renderizado, (7) registro do checkpoint. Falha em qualquer item mantém a fase bloqueada.

## MVP Scope

O MVP técnico é Phase 1 + Phase 2 + US1 (T001–T029): fundação canônica ativa, validada e sem legado em seus arquivos. Ele não autoriza declarar o projeto migrado; a conformidade completa somente ocorre após US2–US6 e Polish.

## Implementation Strategy

1. Executar Setup e Foundation sem tocar telas.
2. Migrar bottom-up e parar em cada gate verde.
3. Após cada camada, atualizar registry e evidência antes de seguir.
4. Só remover fontes antigas depois que todas as rotas estiverem migradas.
5. Rodar auditoria negativa e homologação em ambiente limpo.
6. Nunca marcar conformidade por inspeção visual isolada; exigir o conjunto completo de evidências.

## Notes

- Cada tarefa contém caminhos concretos e uma única skill atribuída.
- Testes de contrato/fixture devem ser escritos e observar falha antes da implementação correspondente.
- Componentes propostos continuam `proposed`; não devem ser criados apenas para satisfazer a contagem.
- Referências históricas são somente leitura nesta migração.
