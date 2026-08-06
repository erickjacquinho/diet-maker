---

description: "Tarefas de implementacao do header contextual para fluxos hierarquicos"
---

# Tasks: Header contextual para fluxos hierarquicos

**Input**: Design documents from `/specs/05-08-26-padronizar-header-contextual/`

**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/page-context-header.md` e `quickstart.md`

**Execution rule**: as tarefas abaixo devem ser executadas somente por `/speckit-implement`, apos aprovacao humana deste SDD.

**Traceability rule**: toda tarefa possui uma skill principal explicita, um caminho de arquivo ou resultado observavel e referencia a historia de usuario quando aplicavel.

## Phase 1: Setup (shared infrastructure)

**Purpose**: instalar o primitivo compartilhado e confirmar o ponto de extensao sem introduzir dominio em `src/components/ui`.

- [X] T001 [skill: $shadcn] Instalar o primitivo Shadcn `breadcrumb` com o package runner configurado pelo projeto e confirmar a criacao de `src/components/ui/breadcrumb.tsx` com imports genericos, sem regras de paciente, dieta ou consulta.
- [X] T002 [skill: $design-system] Conferir `design-system/components/categories/navigation.md`, `design-system/components/registry.json` e `.agents/rules/shadcn-preservation.md` para registrar, antes da implementacao, os limites do primitivo UI e da futura molecula de produto.

---

## Phase 2: Foundational (blocking prerequisites)

**Purpose**: preparar os contratos e os pontos de validacao que bloqueiam as historias de usuario.

**Checkpoint**: o primitivo instalado, o contrato de props e as regras canonicas devem estar conferidos antes de qualquer consumidor ser migrado.

- [X] T003 [skill: $frontend-architecture-mindset] Revisar `specs/05-08-26-padronizar-header-contextual/contracts/page-context-header.md` e `specs/05-08-26-padronizar-header-contextual/data-model.md` contra a arvore App Router, confirmando que paginas fornecem dados de rota e a molecula permanece sem estado de navegacao incidental.
- [X] T004 [skill: $tdd] Confirmar o harness Vitest/Testing Library em `package.json`, `vitest.config.ts` e `tests/setup.ts` (ou o arquivo de setup vigente), deixando definidos os comandos deterministas para os testes da feature sem alterar ambiente global ou dados externos.

---

## Phase 3: User Story 1 - Navegar em contexto dentro do fluxo clinico (Priority: P1) MVP

**Goal**: entregar o mesmo contrato de retorno, titulo e breadcrumb no perfil do paciente, na dieta e na consulta, mantendo o contexto dinamico do paciente.

**Independent Test**: abrir os tres consumidores e verificar os labels, os `href` de retorno, a pagina atual nao navegavel e a preservacao do contexto entre perfil, dieta e consulta.

### Tests for User Story 1

> Os testes devem ser escritos e executados antes da implementacao correspondente; devem falhar por ausencia da nova molecula ou dos consumidores padronizados.

- [X] T005 [skill: $tdd] [P] [US1] Criar testes de contrato em `tests/components/molecules/page-context-header.test.tsx` cobrindo `h1`, link de retorno com `href` e nome acessivel, itens anteriores navegaveis, item atual nao navegavel, label dinamico do paciente e ausencia de espaco obrigatorio quando `actions` nao e fornecido.
- [X] T006 [skill: $tdd] [P] [US1] Criar testes de navegacao em `tests/app/pacientes/page-context-navigation.test.tsx` cobrindo `/pacientes/[id]`, `/pacientes/[id]/dieta/[dietaId]` e `/pacientes/[id]/consulta/[date]`, incluindo paciente ausente com retorno para `/pacientes`, consulta sem dieta, identificador `nova` sem exposicao no breadcrumb e a exclusao do modal de alimento do mapa de rotas.

### Implementation for User Story 1

- [X] T007 [skill: $ui-styling] [US1] Criar a molecula `PageContextHeader` em `src/components/molecules/PageContextHeader.tsx`, compondo o primitivo `Breadcrumb`, o link de retorno explicito, o titulo `h1` e o slot opcional `actions` conforme o contrato em `specs/05-08-26-padronizar-header-contextual/contracts/page-context-header.md`.
- [X] T008 [skill: $frontend-architecture-mindset] [US1] Exportar `PageContextHeader`, `PageContextHeaderProps` e `PageContextBreadcrumbItem` por `src/components/molecules/index.ts`, sem importar templates, organisms ou paginas na direcao ascendente da hierarquia Atomic Design.
- [X] T009 [skill: $frontend-architecture-mindset] [US1] Substituir o header local de perfil em `src/app/pacientes/[id]/page.tsx` por `PageContextHeader`, usando `Pacientes > <nome do paciente>`, retorno explicito para `/pacientes` e preservando o estado de paciente nao encontrado.
- [X] T010 [skill: $nextjs-fullstack-master] [US1] Integrar `PageContextHeader` ao fluxo de dieta em `src/components/templates/DietBuilderTemplate.tsx` e `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx`, usando `Pacientes > <nome do paciente> > Dieta`, retorno para `/pacientes/<id>` e label `Dieta` quando `dietaId` for `nova`.
- [X] T011 [skill: $nextjs-fullstack-master] [US1] Integrar `PageContextHeader` ao registro de consulta em `src/app/pacientes/[id]/consulta/[date]/page.tsx`, usando `Pacientes > <nome do paciente> > Consulta`, retorno para `/pacientes/<id>` e preservando o funcionamento quando nao houver dieta vinculada.
- [X] T012 [skill: $webapp-testing] [US1] Executar os testes direcionados de `tests/components/molecules/page-context-header.test.tsx` e `tests/app/pacientes/page-context-navigation.test.tsx`, depois `npm run type-check`, corrigindo apenas falhas relacionadas a esta feature nos arquivos listados no plano.

**Checkpoint**: a User Story 1 deve estar funcional e verificavel isoladamente antes de iniciar a documentacao de adocao futura.

---

## Phase 4: User Story 2 - Usar o mesmo padrao em uma nova pagina sequencial (Priority: P2)

**Goal**: documentar o mapa atual de rotas e o criterio objetivo para decidir quando uma nova pagina recebe o header contextual.

**Independent Test**: uma pessoa desenvolvedora deve conseguir classificar uma rota com pai explicito, definir retorno/titulo/breadcrumb e identificar modal ou destino global como fora do padrao em ate cinco minutos.

### Implementation for User Story 2

- [X] T013 [skill: $design-system] [US2] Atualizar `design-system/components/categories/navigation.md` com o mapa das transicoes sequenciais existentes, os consumidores iniciais e a regra de inclusao/exclusao para paginas futuras, distinguindo rota hierarquica de modal e navegacao global.
- [X] T014 [skill: $design-system] [US2] Criar `design-system/components/profiles/molecules/page-context-header.md` documentando a finalidade, anatomia, contrato de dados, criterio de uso, criterio de nao uso, exemplo dinamico `Pacientes > Joao > Dieta`, regra de retorno explicito e relacao com o primitivo Shadcn `Breadcrumb`.
- [X] T015 [skill: $design-system] [US2] Atualizar `design-system/components/registry.json` para registrar `PageContextHeader` como molecula da categoria `navigation`, com source file, export publico, primitive base, consumidores e status documental coerentes, sem inventar trait nao suportado pelo catalogo.
- [X] T016 [skill: $design-system] [US2] Revisar `specs/05-08-26-padronizar-header-contextual/quickstart.md` para que os cenarios manuais e comandos de validacao reflitam o mapa documentado, incluindo perfil, dieta, consulta, modal de alimento fora do escopo e futuras rotas proprias.
- [X] T017 [skill: $webapp-testing] [US2] Executar `npm run verify:design-system`, `npm run verify:design-system-legacy` e `npm run audit:atomic-design`, registrando findings nominais e corrigindo somente inconsistencias introduzidas pelo novo registro/documentacao.

**Checkpoint**: o mapa atual e a regra para paginas futuras devem estar consultaveis sem depender do historico desta conversa.

---

## Phase 5: User Story 3 - Preservar acoes de pagina existentes (Priority: P3)

**Goal**: manter as acoes de topo de dieta e consulta em uma regiao opcional do header, sem acoplar a molecula a um wrapper visual especifico.

**Independent Test**: abrir dieta e consulta, operar por teclado as acoes existentes e confirmar que o link de retorno, breadcrumb e acoes permanecem separados e acessiveis.

### Tests for User Story 3

- [X] T018 [skill: $tdd] [P] [US3] Estender `tests/components/molecules/page-context-header.test.tsx` com a regiao `actions`, verificando renderizacao de acoes fornecidas, navegacao por teclado, foco visivel e ausencia de regiao vazia quando o slot nao e usado.
- [X] T019 [skill: $tdd] [P] [US3] Estender `tests/app/pacientes/page-context-navigation.test.tsx` para garantir que as acoes de impressao/abertura de dieta da consulta e as acoes existentes do construtor de dieta continuam presentes e ativaveis.

### Implementation for User Story 3

- [X] T020 [skill: $ui-styling] [US3] Ajustar `src/components/molecules/PageContextHeader.tsx` para manter o slot `actions` opcional, a ordem DOM retorno/breadcrumb/titulo/acoes definida no contrato e a composicao sem imposicao de `Card` ou outra superficie de pagina.
- [X] T021 [skill: $nextjs-fullstack-master] [US3] Migrar as acoes existentes do topo de `src/components/templates/DietBuilderTemplate.tsx` e `src/app/pacientes/[id]/consulta/[date]/page.tsx` para o slot `actions`, preservando callbacks, estados disabled/loading e nomes acessiveis.
- [ ] T022 [skill: $webapp-testing] [US3] Validar visualmente e por teclado os consumidores em 1024px, 1280px e 1440px, conferindo foco, overflow de nome longo, hierarquia de heading e ausencia de espaco vazio sem `actions`; registrar o resultado nos comentarios do PR ou relatorio de implementacao.

**Checkpoint**: nenhuma acao existente de dieta ou consulta deve ser removida ou ficar inacessivel.

---

## Phase 6: Polish & cross-cutting validation

**Purpose**: executar a verificacao completa, assegurar rastreabilidade documental e confirmar que a feature nao encobriu alteracoes pre-existentes do worktree.

- [ ] T023 [skill: $webapp-testing] Executar a suite completa com `npm test` e a validacao definida em `specs/05-08-26-padronizar-header-contextual/quickstart.md`, separando falhas pre-existentes de regressao desta feature.
- [ ] T024 [skill: $design-system] Conferir que `src/components/ui/breadcrumb.tsx` continua generico, que `src/components/molecules/PageContextHeader.tsx` permanece na camada molecule e que o perfil, a categoria e o registry do design system nao divergem.
- [ ] T025 [skill: $frontend-architecture-mindset] Revisar a lista de arquivos alterados contra `specs/05-08-26-padronizar-header-contextual/plan.md`, preservando modificacoes pre-existentes do worktree e sem executar reset, checkout ou limpeza destrutiva.
- [ ] T026 [skill: $speckit-implement] Registrar as evidencias finais e atualizar o status de `specs/05-08-26-padronizar-header-contextual/spec.md` e `specs/05-08-26-padronizar-header-contextual/plan.md` somente apos todas as tarefas, testes e auditorias concluirem, sem declarar conformidade sem validacao.

---

## Dependencies & execution order

### Phase dependencies

- **Setup (Phase 1)**: T001 e T002 podem iniciar imediatamente; T001 deve concluir antes da criacao da molecula.
- **Foundational (Phase 2)**: T003 e T004 dependem da leitura dos contratos e do harness existente; bloqueiam as historias de usuario.
- **User Story 1 (Phase 3)**: T005 e T006 devem preceder T007-T011; T009-T011 podem ser executadas em paralelo depois que T007/T008 estiverem concluidas, pois usam consumidores diferentes.
- **User Story 2 (Phase 4)**: depende de T001-T002 e pode ser executada em paralelo com a migracao visual de US1 quando os caminhos de documentacao nao conflitarem; T017 depende de T013-T015.
- **User Story 3 (Phase 5)**: depende de T007-T011; T018/T019 devem preceder T020/T021.
- **Polish (Phase 6)**: T023-T026 dependem das historias desejadas e das respectivas verificacoes.

### User story dependencies

- **US1 (P1)**: depende de Setup e Foundational; e o MVP e entrega o header funcionando nos tres consumidores.
- **US2 (P2)**: depende do contrato de US1 para documentar o uso real, mas e testavel de forma independente pela consulta aos artefatos do design system.
- **US3 (P3)**: depende da API da molecula e dos consumidores de US1, pois valida a preservacao das acoes que serao passadas ao slot.

### Parallel opportunities

- T005 e T006 podem ser escritos em paralelo.
- T009, T010 e T011 podem ser implementados em paralelo depois de T007 e T008.
- T013, T014 e T015 podem ser documentados em paralelo se o registry e os perfis nao forem editados simultaneamente pelo mesmo executor.
- T018 e T019 podem ser escritos em paralelo.
- T023 e T024 podem ser executados em paralelo apos a integracao; T025 deve observar o estado final.

## Traceability matrix

| Requirement / outcome | Covered by |
|---|---|
| FR-001, FR-003, FR-004, FR-005 | T005, T007, T008, T018, T020 |
| FR-002, FR-010 | T005, T006, T009-T011, T018, T022 |
| FR-006, FR-007 | T006, T009-T011, T013, T019 |
| FR-008, FR-009 | T006, T013, T014, T016 |
| FR-011, FR-012 | T001, T002, T007, T014, T024 |
| SC-001 | T006, T009-T011, T012, T023 |
| SC-002 | T006, T009-T011, T022 |
| SC-003 | T013, T014, T016 |
| SC-004 | T005, T018, T022 |
| SC-005 | T019, T021, T022 |

## Implementation strategy

### MVP first (User Story 1 only)

1. Concluir Setup e Foundational.
2. Escrever e fazer falhar os testes de US1.
3. Instalar/compor o primitivo e migrar perfil, dieta e consulta.
4. Executar o checkpoint de US1 e validar os tres fluxos.

### Incremental delivery

1. Entregar US1 como baseline funcional.
2. Entregar US2 com o mapa e a regra de adocao futura.
3. Entregar US3 com a preservacao das acoes de topo.
4. Executar a validacao cross-cutting e homologar somente com evidencia.

### Notes

- `[P]` indica tarefas que podem ser executadas em paralelo sem compartilhar arquivo em alteracao.
- `[US1]`, `[US2]` e `[US3]` mantem rastreabilidade com as historias da especificacao.
- Cada tarefa possui exatamente uma atribuicao `[skill: ...]`; as skills sao nomes disponiveis nesta sessao ou no catalogo `.agents/skills` do projeto.
- Esta lista e um plano de implementacao futura; a criacao deste arquivo nao implementa a feature.

---

## Phase 7: Convergence

**Purpose**: fechar as evidencias que permaneceram parciais apos a implementacao e a validacao automatizada direcionada.

- [ ] T027 [skill: $webapp-testing] Reestabelecer um runtime local reproduzivel que responda as rotas reais e executar a validacao visual e por teclado dos tres consumidores em 1024px, 1280px e 1440px, registrando foco, overflow de nome longo, hierarquia de heading e ausencia de espaco vazio sem `actions`, conforme `US3/AC1`, `FR-010` e `SC-004` (partial).
- [ ] T028 [skill: $webapp-testing] Executar `npm test` completo e todos os checks definidos em `specs/05-08-26-padronizar-header-contextual/quickstart.md`, classificando falhas pre-existentes versus regressao desta feature e registrando evidencia para `SC-001` e `SC-005` (partial).
