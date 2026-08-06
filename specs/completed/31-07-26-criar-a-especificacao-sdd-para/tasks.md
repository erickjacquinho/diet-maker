# Tasks: Regras Visuais por Categoria de Componentes

**Input**: Design documents from `specs/31-07-26-criar-a-especificacao-sdd-para/`

**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Obrigatórios porque FR-031–FR-035 e SC-006–SC-007 exigem auditoria automatizada e cobertura de falhas controladas.

**Organization**: As tarefas são agrupadas por user story. A ordem dentro de cada fase preserva contratos antes de conteúdo e categorias antes de perfis.

## Phase 1: Setup

**Purpose**: Resolver o gate constitucional e preparar a estrutura documental sem alterar `src/`.

- [X] T001 [skill: $design-system] Executar como emenda constitucional separada a sincronização de `.specify/memory/constitution.md` com o guia canônico e bloquear T002–T073 até sua aprovação
- [X] T002 [skill: $design-system] Criar o índice e a árvore de categorias/perfis em `design-system/components/README.md`
- [X] T003 [skill: $design-system] Copiar e adaptar o schema planejado para `design-system/components/registry.schema.json`
- [X] T004 [skill: $design-system] Registrar a baseline somente leitura dos 39 arquivos e exports atuais em `design-system/components/registry.json`

---

## Phase 2: Foundational Contracts

**Purpose**: Fixar contratos e testes estruturais que bloqueiam todas as histórias.

**⚠️ CRITICAL**: Nenhuma categoria ou perfil pode ser homologado antes desta fase.

- [X] T005 [skill: $design-system] Criar o contrato normativo de categoria em `design-system/components/category-contract.md`
- [X] T006 [skill: $design-system] Criar o contrato normativo de perfil individual em `design-system/components/component-profile-contract.md`
- [X] T007 [skill: $design-system] Criar o contrato de findings e modos de auditoria em `design-system/components/audit-contract.md`
- [X] T008 [skill: $tdd] [P] Criar fixtures válidas e inválidas do registro em `tests/fixtures/design-system-catalog/registry/`
- [X] T009 [skill: $tdd] [P] Criar fixtures válidas e inválidas de categorias em `tests/fixtures/design-system-catalog/categories/`
- [X] T010 [skill: $tdd] [P] Criar fixtures válidas e inválidas de perfis em `tests/fixtures/design-system-catalog/profiles/`
- [X] T011 [skill: $tdd] Escrever testes contratuais iniciais para schema, ordem de findings e modos inventory/strict em `tests/design-system/component-catalog.test.mjs`
- [X] T012 [skill: $tdd] Implementar descoberta, parsing e interface `verifyComponentCatalog` em `scripts/verify-design-system-components.mjs` e adicionar `verify:design-system` em `package.json`
- [X] T013 [skill: $design-system] Atualizar `design-system/11-component-contract.md` para exigir os contratos de categoria, perfil e auditoria

**Checkpoint**: Contratos têm fixtures e testes; modo inventory consegue ler o registro sem homologar conteúdo incompleto.

---

## Phase 3: User Story 1 — Consultar uma categoria visual normativa (Priority: P1) 🎯 MVP

**Goal**: Criar as onze fontes normativas compartilhadas, completas e sem valores locais.

**Independent Test**: Um revisor seleciona uma categoria e encontra inclusão, exclusão, anatomia, geometria, tipografia, tokens, variantes, estados, interação, acessibilidade, composição e proibições sem decisão aberta.

### Category specifications

- [X] T014 [skill: $design-system] [P] [US1] Especificar ações e icon actions em `design-system/components/categories/actions.md`
- [X] T015 [skill: $design-system] [P] [US1] Especificar campos textuais, numéricos e search em `design-system/components/categories/fields.md`
- [X] T016 [skill: $design-system] [P] [US1] Especificar seleção, tabs e opções selecionáveis em `design-system/components/categories/selection.md`
- [X] T017 [skill: $design-system] [P] [US1] Especificar navegação persistente e contextual em `design-system/components/categories/navigation.md`
- [X] T018 [skill: $design-system] [P] [US1] Especificar superfícies, containers e divisores em `design-system/components/categories/surfaces.md`
- [X] T019 [skill: $design-system] [P] [US1] Especificar tabelas, rows, métricas e valores em `design-system/components/categories/data-display.md`
- [X] T020 [skill: $design-system] [P] [US1] Especificar badges, mensagens, alerts e feedback em `design-system/components/categories/feedback.md`
- [X] T021 [skill: $design-system] [P] [US1] Especificar dialog, sheet, popover, menu e tooltip em `design-system/components/categories/overlays.md`
- [X] T022 [skill: $design-system] [P] [US1] Especificar progress, spinner e skeleton em `design-system/components/categories/loading.md`
- [X] T023 [skill: $design-system] [P] [US1] Especificar macros, calorias, alimentos e refeições em `design-system/components/categories/nutrition-domain.md`
- [X] T024 [skill: $design-system] [P] [US1] Especificar shells, templates e sections estruturais em `design-system/components/categories/structure.md`
- [X] T025 [skill: $design-system] [US1] Registrar IDs, lifecycle, traits, relações e consumidores em `design-system/components/registry.json` e as onze decisões iniciais em `design-system/components/category-decisions.md`
- [X] T026 [skill: $tdd] [US1] Adicionar testes de completude, estados e referências a fundamentos para categorias em `tests/design-system/component-catalog.test.mjs`

**Checkpoint**: Onze categorias podem ser revisadas independentemente dos perfis e o modo de categoria não encontra contrato incompleto.

---

## Phase 4: User Story 2 — Classificar componentes atuais e futuros em dois eixos (Priority: P1)

**Goal**: Separar camada Atomic e categoria visual em todo o inventário real.

**Independent Test**: Toda fonte e export atual possui camada atual, camada-alvo, categoria principal, traits, lifecycle e perfil planejado; uma proposta sem fonte permanece distinta.

- [X] T027 [skill: $design-system] [P] [US2] Atualizar a decisão de reutilizar/compor/variar/criar com o eixo de categoria em `design-system/09-component-decision-model.md`
- [X] T028 [skill: $design-system] [P] [US2] Atualizar limites Atomic e dependências sem regras visuais por camada em `design-system/10-architecture-boundaries.md`
- [X] T029 [skill: $design-system] [US2] Classificar as 14 famílias `ui` e seus compound exports em `design-system/components/registry.json`
- [X] T030 [skill: $design-system] [US2] Classificar os 6 atoms e receitas/reexports públicos em `design-system/components/registry.json`
- [X] T031 [skill: $design-system] [US2] Classificar as 14 fontes atuais de molecules, incluindo as três camadas-alvo organism, em `design-system/components/registry.json`
- [X] T032 [skill: $design-system] [US2] Classificar os 3 organisms e 2 templates atuais em `design-system/components/registry.json`
- [X] T033 [skill: $design-system] [US2] Registrar Textarea, FormField, Spinner e Skeleton como propostas sem fonte em `design-system/components/registry.json`
- [X] T034 [skill: $tdd] [US2] Adicionar testes de cobertura das 39 fontes, exports, categoria principal única, layers e propostas em `tests/design-system/component-catalog.test.mjs`

**Checkpoint**: A contagem de fontes atuais é 39, as quatro propostas não entram na baseline e nenhum componente possui categoria principal ambígua.

---

## Phase 5: User Story 3 — Consultar uma ficha individual sem duplicação (Priority: P2)

**Goal**: Criar perfis enxutos para todas as famílias atuais e propostas.

**Independent Test**: Cada perfil descreve apenas particularidades e toda regra compartilhada é rastreável à categoria, traits ou fundamentos.

- [X] T035 [skill: $design-system] [P] [US3] Criar perfis ui de Button, Input, Select e Tabs em `design-system/components/profiles/ui/button.md`, `input.md`, `select.md` e `tabs.md`
- [X] T036 [skill: $design-system] [P] [US3] Criar perfis ui de Dialog, DropdownMenu, Popover, Sheet e Tooltip em `design-system/components/profiles/ui/dialog.md`, `dropdown-menu.md`, `popover.md`, `sheet.md` e `tooltip.md`
- [X] T037 [skill: $design-system] [P] [US3] Criar perfis ui de Badge, Card, ScrollArea, Separator e Table em `design-system/components/profiles/ui/badge.md`, `card.md`, `scroll-area.md`, `separator.md` e `table.md`
- [X] T038 [skill: $design-system] [P] [US3] Criar perfis dos 6 atoms em `design-system/components/profiles/atoms/avatar.md`, `badge.md`, `button.md`, `icon-button.md`, `input.md` e `progress-bar.md`
- [X] T039 [skill: $design-system] [P] [US3] Criar perfis das molecules de navegação/contexto em `design-system/components/profiles/molecules/sidebar-brand.md`, `sidebar-nav-item.md`, `sidebar-quick-actions.md`, `sidebar-user-profile.md` e `patient-badge-header.md`
- [X] T040 [skill: $design-system] [P] [US3] Criar perfis das molecules nutricionais em `design-system/components/profiles/molecules/auto-kcal-section.md`, `macro-metric-card.md`, `meal-item-row.md`, `recipe-card.md`, `recipe-ingredient-row.md` e `taco-search-input.md`
- [X] T041 [skill: $design-system] [P] [US3] Criar perfis dos 6 organisms-alvo em `design-system/components/profiles/organisms/sidebar-nav.md`, `macro-tracker-header.md`, `meal-card-container.md`, `diet-mode-switcher.md`, `food-search-modal.md` e `read-only-diet-modal.md`
- [X] T042 [skill: $design-system] [P] [US3] Criar perfis dos templates atuais em `design-system/components/profiles/templates/app-layout-shell.md` e `diet-builder-template.md`
- [X] T043 [skill: $design-system] [P] [US3] Criar perfis proposed em `design-system/components/profiles/ui/textarea.md`, `design-system/components/profiles/atoms/spinner.md`, `design-system/components/profiles/atoms/skeleton.md` e `design-system/components/profiles/molecules/form-field.md`
- [X] T044 [skill: $design-system] [US3] Vincular os 43 perfis, consumers, bases e status documental em `design-system/components/registry.json`
- [X] T045 [skill: $tdd] [US3] Adicionar testes contra duplicação normativa, categoria divergente e exceção ausente em `tests/design-system/component-catalog.test.mjs`

**Checkpoint**: 39 famílias atuais e 4 propostas possuem perfil; nenhum perfil redefine escala ou matriz compartilhada.

---

## Phase 6: User Story 4 — Auditar completude e consistência (Priority: P2)

**Goal**: Implementar todos os findings obrigatórios e tornar a auditoria um gate determinístico.

**Independent Test**: Cada fixture inválida produz exatamente o finding esperado; o catálogo canônico produz zero erro.

### Tests

- [X] T046 [skill: $tdd] [US4] Adicionar testes para `SRC001`–`EXP002` em `tests/design-system/component-catalog.test.mjs`
- [X] T047 [skill: $tdd] [US4] Adicionar testes para `REG001`–`TRT002` em `tests/design-system/component-catalog.test.mjs`
- [X] T048 [skill: $tdd] [US4] Adicionar testes para `PRF001`–`TOK002` em `tests/design-system/component-catalog.test.mjs`
- [X] T049 [skill: $tdd] [US4] Adicionar testes para `GOV001`–`PROP001` em `tests/design-system/component-catalog.test.mjs`

### Audit implementation

- [X] T050 [skill: $tdd] [US4] Implementar cobertura de fontes e exports `SRC001`–`EXP002` em `scripts/verify-design-system-components.mjs`
- [X] T051 [skill: $tdd] [US4] Implementar schema, categorias e traits `REG001`–`TRT002` em `scripts/verify-design-system-components.mjs`
- [X] T052 [skill: $tdd] [US4] Implementar perfis, estados, tokens e duplicação `PRF001`–`TOK002` em `scripts/verify-design-system-components.mjs`
- [X] T053 [skill: $tdd] [US4] Implementar governança, placeholders, links, sync e propostas `GOV001`–`PROP001` em `scripts/verify-design-system-components.mjs`
- [X] T054 [skill: $tdd] [US4] Implementar saída ordenada humana/estruturada e exit codes 0/1/2 em `scripts/verify-design-system-components.mjs`
- [X] T055 [skill: $tdd] [US4] Ativar modo estrito no script `verify:design-system` em `package.json`
- [X] T056 [skill: $tdd] [US4] Executar a matriz de fixtures e registrar o resultado em `specs/31-07-26-criar-a-especificacao-sdd-para/checklists/audit-results.md`

**Checkpoint**: Todos os códigos obrigatórios têm teste de falha e restauração; auditoria canônica passa em modo estrito.

---

## Phase 7: User Story 5 — Evoluir categorias com governança (Priority: P3)

**Goal**: Impedir proliferação e tornar mudanças de categoria rastreáveis.

**Independent Test**: Uma proposta futura é resolvida por categoria existente ou bloqueada até decisão formal; depreciação impede novos consumidores.

- [X] T057 [skill: $design-system] [P] [US5] Acrescentar template e regras para decisões futuras ao registro existente em `design-system/components/category-decisions.md`
- [X] T058 [skill: $design-system] [P] [US5] Atualizar lifecycle de categorias, traits e exceções em `design-system/14-lifecycle-and-governance.md`
- [X] T059 [skill: $design-system] [P] [US5] Atualizar critérios de criação e evolução de componente/categoria em `design-system/09-component-decision-model.md`
- [X] T060 [skill: $tdd] [US5] Adicionar fixtures de componente futuro herdável, categoria ausente, categoria depreciada e exceção expirada em `tests/fixtures/design-system-catalog/governance/`
- [X] T061 [skill: $tdd] [US5] Adicionar testes dos fluxos de proposta, depreciação e revisão em `tests/design-system/component-catalog.test.mjs`

**Checkpoint**: Toda entrada futura possui caminho de decisão verificável e categorias depreciadas rejeitam novos consumidores.

---

## Final Phase: Consolidation and Cross-Cutting Validation

**Purpose**: Remover duplicação, sincronizar fontes de verdade e homologar o escopo documental.

- [X] T062 [skill: $design-system] Converter `design-system/12-component-specifications.md` em índice das categorias e perfis sem contratos duplicados
- [X] T063 [skill: $design-system] Sincronizar a visão humana do inventário em `design-system/15-component-registry.md`
- [X] T064 [skill: $design-system] Atualizar conformidade e comandos de gate em `design-system/13-implementation-and-compliance.md`
- [X] T065 [skill: $design-system] Atualizar ordem de leitura e fonte canônica em `design-system/README.md`
- [X] T066 [skill: $design-system] Atualizar roteamento de categorias e perfis em `agents.md`
- [X] T067 [skill: $design-system] Verificar versão, links e ausência de regras históricas concorrentes em `.specify/memory/constitution.md`
- [X] T068 [skill: $tdd] Executar `npm run verify:design-system` em até 5 segundos e exigir 39 fontes, 11 categorias, 4 propostas e zero finding bloqueante
- [X] T069 [skill: $tdd] Executar `npm test -- tests/design-system/component-catalog.test.mjs` e exigir todas as fixtures verdes
- [X] T070 [skill: $tdd] Executar `npm run verify:links` e exigir zero links locais quebrados
- [X] T071 [skill: general] Executar `git diff --check` e exigir zero erro de whitespace
- [X] T072 [skill: general] Executar `git diff --name-only -- src` e exigir nenhuma alteração em `src/`
- [X] T073 [skill: $design-system] Realizar revisão independente de um componente por categoria e registrar concordância em `specs/31-07-26-criar-a-especificacao-sdd-para/checklists/reproducibility.md`

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (Phase 1)**: T001 é uma emenda constitucional separada e bloqueia todas as tarefas seguintes; T002–T004 dependem de sua aprovação.
- **Foundational (Phase 2)**: depende de Setup e bloqueia todas as histórias.
- **US1 (Phase 3)**: depende dos contratos; é o MVP normativo.
- **US2 (Phase 4)**: depende dos IDs e limites de categorias de US1.
- **US3 (Phase 5)**: depende de US1 e US2.
- **US4 (Phase 6)**: fixtures podem começar após Foundational; integração estrita depende de US1–US3.
- **US5 (Phase 7)**: depende de US1; testes finais usam US2–US4.
- **Final**: depende de todas as histórias.

### User story dependency graph

```text
Setup → Foundational → US1 → US2 → US3 ─┐
                       ├────────→ US5 ───┼→ Final
                       └→ US4 fixtures ──┘
US1 + US2 + US3 → US4 strict audit
```

### Parallel opportunities

- T008–T010 criam famílias de fixtures independentes.
- T014–T024 escrevem categorias distintas a partir do mesmo contrato.
- T027–T028 auditam documentos arquiteturais distintos; T029–T032 são sequenciais porque atualizam o mesmo registro.
- T035–T043 escrevem grupos de perfis em arquivos distintos.
- T046–T049 são sequenciais porque atualizam o mesmo arquivo de testes.
- T057–T059 tratam artefatos de governança independentes.

---

## Parallel Example: User Story 1

```text
Work item A: actions.md + fields.md + selection.md
Work item B: navigation.md + surfaces.md + data-display.md
Work item C: feedback.md + overlays.md + loading.md
Work item D: nutrition-domain.md + structure.md
Integration: registry category entries + category contract tests
```

## Parallel Example: User Story 3

```text
Work item A: ui control and overlay profiles
Work item B: ui surface/data profiles + atoms
Work item C: molecule profiles
Work item D: organism/template/proposed profiles
Integration: registry links + duplication tests
```

---

## Implementation Strategy

### MVP first

1. Completar Setup e Foundational.
2. Entregar US1 com as onze categorias completas.
3. Validar uma categoria de cada classe contra o contrato.
4. Somente então classificar inventário e criar perfis.

### Incremental delivery

1. **Category catalog**: regras reutilizáveis já orientam decisões futuras.
2. **Dual-axis registry**: estado real e alvo tornam-se rastreáveis.
3. **Individual profiles**: particularidades atuais ficam explícitas sem duplicação.
4. **Strict audit**: regressões documentais passam a ser bloqueadas.
5. **Governance**: evolução futura deixa de depender de decisões locais.

### Completion rule

O SDD somente pode ser marcado implementado quando T068–T073 passarem. Isso não declara o código visual conforme; declara apenas o catálogo normativo homologado e pronto para SDDs posteriores de telas e migração.

## Phase 8: Convergence

**Purpose**: Fechar gaps encontrados ao comparar a implementação atual com todos os requisitos, decisões do plano e critérios de aceite, preservando o contrato append-only do converge.

- [X] T074 [skill: $tdd] Completar a validação estrutural do registry para lifecycle, campos obrigatórios, enums, paths, exports, relações e duplicidades conforme FR-032 e SC-006 (partial)
- [X] T075 [skill: $tdd] Criar índice canônico de tokens e validar referências de categorias/perfis, links aos fundamentos e redefinições locais conforme FR-002, FR-033 e FR-034 (partial)
- [X] T076 [skill: $design-system] Completar cada decisão inicial em `design-system/components/category-decisions.md` com problema recorrente, consumidores, alternativas, impacto, compatibilidade e decisão conforme FR-028 (partial)
- [X] T077 [skill: $tdd] Bloquear propostas e novos consumidores que referenciem categorias deprecated e exigir substituto estruturado conforme FR-030 e US5/AC3 (partial)
- [X] T078 [skill: $tdd] Adicionar fixtures e testes de regressão para schema incompleto, token arbitrário, fundamento ausente, decisão incompleta e proposta em categoria deprecated conforme SC-006 e SC-010 (missing)
