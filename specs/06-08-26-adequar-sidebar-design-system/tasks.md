# Tasks: Adequação da Sidebar ao Design System

**Input**: Design documents from `specs/06-08-26-adequar-sidebar-design-system/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/sidebar-navigation.md](./contracts/sidebar-navigation.md), [quickstart.md](./quickstart.md)

**Tests**: Obrigatórios por FR-021, FR-022 e pela constituição local. Os testes de contrato devem ser escritos antes da implementação que protegem.

**Implementation command**: Executar somente por `/speckit-implement` após validação humana deste SDD.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Fixar os fixtures, referências canônicas e pontos de entrada necessários para a correção.

- [ ] T001 [skill: $frontend-architecture-mindset] Registrar no fixture compartilhado de `tests/components/organisms/sidebar-navigation-fixtures.ts` as seis rotas flat, uma nested patient route, um grupo futuro válido e um grupo vazio, alinhados a `data-model.md`.
- [ ] T002 [P] [skill: $design-system] Mapear em `src/design-system/tokens.css` e `tailwind.config.js` apenas os aliases já normatizados para sidebar-expanded/sidebar-collapsed, border-divider, icon-16, 36px menu item, focus ring e reduced motion; documentar qualquer ausência antes de criar token.
- [ ] T003 [P] [skill: $ui-ux-pro-max:ui-ux-pro-max] Comparar a implementação atual com `design-system/components/categories/navigation.md` e registrar no comentário da tarefa de implementação os deltas visuais que exigem inspeção manual: rail, tipografia, density, focus, clipping e motion.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Estabelecer contratos de dados, fronteira de aplicação e testes falhando antes de alterar a composição.

**⚠️ CRITICAL**: Nenhuma user story deve ser implementada antes desta fase.

- [ ] T004 [P] [skill: $tdd] Escrever testes de contrato do modelo em `tests/components/organisms/sidebar-navigation-model.test.ts` para match exato/prefixado documentado, rota desconhecida, ancestor current, IDs/hrefs inválidos e omissão de grupo vazio.
- [ ] T005 [P] [skill: $tdd] Escrever testes de fronteira em `tests/components/app/sidebar-navigation-adapter.test.tsx` que exijam pathname/items explícitos e falhem se `SidebarNav.tsx` importar ou chamar `usePathname`.
- [ ] T006 [P] [skill: $tdd] Estender `tests/components/ui/sidebar.test.tsx` com contratos failing para 224/64, border-divider do rail, icon-16, focus ring, 36px submenu e reduced-motion sem listener de Ctrl/Cmd+B/persistência.
- [ ] T007 [skill: $frontend-architecture-mindset] Consolidar os tipos e invariantes descritos em `specs/06-08-26-adequar-sidebar-design-system/data-model.md` em `src/components/organisms/sidebar-navigation-model.ts`, deixando a configuração de produção fora do organismo.

**Checkpoint**: Fixtures, modelo puro, contrato do adapter e testes failing estão prontos; o primitivo ainda não recebeu correções de produto.

---

## Phase 3: User Story 1 - Sidebar visualmente e semanticamente consistente (Priority: P1) 🎯 MVP

**Goal**: Corrigir rail, tokens, identidade de navegação, tipografia, iconografia, foco, movimento e suporte estrutural a subitens sem alterar rotas.

**Independent Test**: Renderizar expanded/collapsed em 1024px+, percorrer foco, ativar fixture de grupo futuro e simular reduced motion; medir 224/64, 36px, icon-16, border-divider e nomes acessíveis.

### Tests for User Story 1

- [ ] T008 [P] [US1] [skill: $tdd] Criar `tests/components/organisms/sidebar-nav-conformance.test.tsx` para rail border, widths 224/64, typography roles, icon-16, tokenized spacing, focus ring, collapsed brand name e reduced-motion nos subcomponentes.
- [ ] T009 [P] [US1] [skill: $tdd] Atualizar `tests/components/organisms/sidebar-nav.test.tsx` para provar que os seis destinos continuam alcançáveis, que current state não depende só de cor e que o organismo aceita pathname/items do contrato.

### Implementation for User Story 1

- [ ] T010 [P] [US1] [skill: $ui-styling] Corrigir `src/components/ui/sidebar.tsx` somente nos contratos genéricos de rail border, width aliases, icon-16, focus ring/offset, 36px submenu e reduced-motion, sem inserir labels/rotas/callbacks do NutriDiet.
- [ ] T011 [P] [US1] [skill: $ui-styling] Ajustar `src/components/molecules/SidebarBrand.tsx` para roles tipográficos canônicos, espaçamento/token geometry, icon-16 e accessible name completo no collapsed state, preservando link e toggle.
- [ ] T012 [P] [US1] [skill: $ui-styling] Ajustar `src/components/molecules/SidebarNavItem.tsx` para links reais, current/focus semantics, icon-16, altura/spacing de navigation e labels completos em tooltip/collapsed.
- [ ] T013 [US1] [skill: $vercel-composition-patterns] Refatorar `src/components/organisms/SidebarNav.tsx` para consumir `pathname`/`navigationItems` por props, preservar flat default por dados recebidos e manter composição compound sem importar contexto de rota.
- [ ] T014 [US1] [skill: $webapp-testing] Executar e estabilizar os testes focados de `tests/components/ui/sidebar.test.tsx`, `tests/components/organisms/sidebar-nav-conformance.test.tsx` e `tests/components/organisms/sidebar-nav.test.tsx`, mantendo a falha útil para qualquer valor não canônico.

**Checkpoint**: A sidebar visual e navegacional é um MVP independente, com seis rotas preservadas, nomes acessíveis, tokens/geometry corrigidos e sem acoplamento de pathname no organismo.

---

## Phase 4: User Story 2 - Conta, ações locais e salto para o conteúdo (Priority: P1)

**Goal**: Remover affordances falsas, tornar callbacks explícitos e permitir que teclado alcance o conteúdo principal.

**Independent Test**: Renderizar com callbacks ausentes e presentes, usar pointer/Enter/Space, verificar disabled reason e ativar o skip link até `main#main-content`.

### Tests for User Story 2

- [ ] T015 [P] [US2] [skill: $tdd] Adicionar cenários em `tests/components/molecules/sidebar-user-profile.test.tsx` para `onOpenAccount` presente/ausente, semantics de controle, ausência de cursor/hover no modo informativo e callback único.
- [ ] T016 [P] [US2] [skill: $tdd] Adicionar cenários em `tests/components/molecules/sidebar-quick-actions.test.tsx` para cada combinação de onSave/onOpen, disabled nativo, descrição acessível da indisponibilidade e callback correspondente.
- [ ] T017 [P] [US2] [skill: $tdd] Atualizar `tests/components/templates/app-layout-shell.test.tsx` para slot de sidebar, skip link, `main#main-content`, focusability e scroll independente.

### Implementation for User Story 2

- [ ] T018 [P] [US2] [skill: $ui-styling] Atualizar `src/components/molecules/SidebarUserProfile.tsx` com `onOpenAccount?: () => void`; renderizar entrada semântica e keyboard-operable somente quando o callback existir, sem aparência interativa no fallback.
- [ ] T019 [P] [US2] [skill: $ui-styling] Atualizar `src/components/molecules/SidebarQuickActions.tsx` para manter Salvar/Abrir visíveis, usar disabled quando o handler faltar, anunciar os motivos definidos no contrato e preservar tooltips/labels collapsed.
- [ ] T020 [US2] [skill: $frontend-architecture-mindset] Alterar `src/components/templates/AppLayoutShell.tsx` para receber `sidebar: React.ReactNode`, adicionar skip link em pt-BR e `main id="main-content" tabIndex={-1}`, preservando o scroll desktop.
- [ ] T021 [US2] [skill: $webapp-testing] Estabilizar os testes de `tests/components/molecules/sidebar-user-profile.test.tsx`, `tests/components/molecules/sidebar-quick-actions.test.tsx` e `tests/components/templates/app-layout-shell.test.tsx` em ambos os estados da sidebar.

**Checkpoint**: Perfil, Salvar/Abrir e skip link comunicam corretamente seus estados, são operáveis por teclado e não geram no-ops ou erros.

---

## Phase 5: User Story 3 - Adapter de aplicação e evolução de submenus (Priority: P2)

**Goal**: Isolar o contexto de rota na aplicação, preservar a topologia flat e fechar o contrato de grupos futuros/documentação de consumers.

**Independent Test**: Renderizar o adapter da aplicação com as seis rotas e um fixture de grupo, verificar active/ancestor/expanded/collapsed semantics e inspecionar que o organismo não conhece `usePathname`.

### Tests for User Story 3

- [ ] T022 [P] [US3] [skill: $tdd] Completar `tests/components/app/sidebar-navigation-adapter.test.tsx` para pathname injection, seis destinos flat, ausência de configuração de rota dentro do organism e integração do adapter com o shell.
- [ ] T023 [P] [US3] [skill: $tdd] Criar `tests/components/organisms/sidebar-nav-submenus.test.tsx` para `aria-expanded`, Enter/Space, child `aria-current`, ancestor discoverability, grupo vazio, 36px e surface acessível no collapsed state.

### Implementation for User Story 3

- [ ] T024 [US3] [skill: $frontend-architecture-mindset] Criar `src/app/navigation/sidebar-navigation-config.ts` com a configuração flat dos seis destinos e `src/app/navigation/SidebarNavigationAdapter.tsx` como owner de pathname/items, sem alterar URLs/ordem.
- [ ] T025 [US3] [skill: $frontend-architecture-mindset] Atualizar `src/app/layout.tsx` para passar `<SidebarNavigationAdapter />` ao slot `sidebar` de `AppLayoutShell`, mantendo callbacks ausentes conforme decisão e sem import genérico do primitive em páginas.
- [ ] T026 [US3] [skill: $vercel-composition-patterns] Completar `src/components/organisms/SidebarNav.tsx` e `src/components/organisms/sidebar-navigation-model.ts` para groups futuros, active ancestor, disclosure/accessibility e collapsed surface sem reorganizar o modelo flat de produção.
- [ ] T027 [US3] [skill: $webapp-testing] Executar e estabilizar `tests/components/app/sidebar-navigation-adapter.test.tsx` e `tests/components/organisms/sidebar-nav-submenus.test.tsx`, incluindo pathname desconhecido, nested patient route e grupo sem filhos.

**Checkpoint**: O adapter é o único owner do contexto de rota, a produção continua flat e o contrato de submenu futuro é testável e acessível.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Sincronizar o catálogo, validar toda a feature e registrar evidência sem declarar conformidade visual sem revisão humana.

- [ ] T028 [P] [skill: $design-system] Atualizar `design-system/components/categories/navigation.md` e `design-system/components/profiles/ui/sidebar.md` com border do rail, reduced motion, focus, 36px submenu e boundary genérico efetivamente implementados.
- [ ] T029 [P] [skill: $design-system] Atualizar `design-system/components/profiles/organisms/sidebar-nav.md` e `design-system/components/profiles/molecules/sidebar-{brand,nav-item,user-profile,quick-actions}.md` com props, callbacks, states, sources e consumers reais.
- [ ] T030 [P] [skill: $design-system] Atualizar `design-system/components/profiles/templates/app-layout-shell.md`, `design-system/components/registry.json` e `design-system/15-component-registry.md` para registrar adapter/app consumer, slot sidebar, exports e lifecycle status.
- [ ] T031 [P] [skill: $code-reviewer-expert] Executar `npm run type-check`, `npm run lint`, `npm run audit:atomic-design` e `npm run verify:design-system-legacy`; resolver todos os findings atribuíveis aos arquivos da feature.
- [ ] T032 [skill: $code-reviewer-expert] Executar `npm run verify:design-system` e a suíte focada/completa de Vitest descrita em `specs/06-08-26-adequar-sidebar-design-system/quickstart.md`; registrar resultados e nenhum bloqueio restante.
- [ ] T033 [skill: $webapp-testing] Executar os cinco cenários manuais do `specs/06-08-26-adequar-sidebar-design-system/quickstart.md` em 1024px+, com teclado e reduced motion, registrando evidências em `specs/06-08-26-adequar-sidebar-design-system/implementation-log.md`.
- [ ] T034 [skill: $ui-ux-pro-max:ui-ux-pro-max] Fazer revisão visual final contra `design-system/components/categories/navigation.md`, `design-system/07-icons-motion-and-layers.md` e `design-system/08-states-and-accessibility.md`; registrar qualquer decisão residual no implementation log antes de considerar a feature pronta.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001–T003 podem começar imediatamente; T002 e T003 são paralelizáveis.
- **Foundational (Phase 2)**: T004–T007 dependem da leitura das referências; T004–T006 podem ser escritos em paralelo, T007 consolida o modelo antes da implementação.
- **User Story 1 (Phase 3)**: T008–T009 precedem T010–T013; T014 é o checkpoint da story.
- **User Story 2 (Phase 4)**: T015–T017 precedem T018–T020; T021 é o checkpoint da story. Pode iniciar após os contratos da Phase 2, mas a integração visual aproveita US1.
- **User Story 3 (Phase 5)**: T022–T023 precedem T024–T026; T027 é o checkpoint. Depende do contrato de props estabilizado em US1 e do slot de shell de US2.
- **Polish (Phase 6)**: T028–T030 dependem da composição final; T031–T034 dependem das correções de código e docs e não substituem a validação humana.

### User Story Dependencies

- **US1 (P1)**: Depende da Phase 2; é o MVP visual/navegacional.
- **US2 (P1)**: Depende dos contratos da Phase 2; pode ser desenvolvida em paralelo com US1 em arquivos diferentes, mas sua integração final usa o shell estável.
- **US3 (P2)**: Depende do contrato `SidebarNavProps` de US1 e do slot `AppLayoutShell` de US2; não altera o valor independente entregue por US1/US2.

### Parallel Opportunities

- T002/T003; T004/T005/T006; T008/T009; T015/T016/T017; T022/T023; T028/T029/T030; T031 pode rodar em paralelo com revisão documental depois que os sources estabilizarem.
- T011/T012 e T018/T019 são paralelizáveis porque afetam moléculas diferentes.
- T024 e T025 devem ser sequenciais, pois o layout consome o adapter.
- T013 e T026 afetam o mesmo organismo e devem ser executadas sequencialmente mesmo que pertençam a stories distintas.

## Traceability Summary

| User story | Requirements covered | Primary files |
|---|---|---|
| US1 | FR-001–FR-009, FR-017–FR-019, NFR-001–NFR-005, SC-001–SC-004, SC-008 | `src/components/ui/sidebar.tsx`, sidebar molecules, `SidebarNav.tsx`, focused conformance/model tests |
| US2 | FR-010–FR-014, FR-021–FR-022, SC-003, SC-005–SC-006, SC-008 | `SidebarUserProfile.tsx`, `SidebarQuickActions.tsx`, `AppLayoutShell.tsx`, molecule/shell tests |
| US3 | FR-015–FR-020, FR-021–FR-022, SC-001, SC-007–SC-009 | app adapter/config, navigation model, submenu/adapter tests, profiles/registry |

## Implementation Strategy

### MVP First

1. Completar Setup + Foundational.
2. Executar US1 até T014.
3. Parar e validar geometria, identidade, routes, focus, motion e no coupling.
4. Adicionar US2 para ações/skip link; só então integrar US3 e catálogo.

### Incremental Delivery

1. US1 corrige o visual e a navegação sem alterar URLs.
2. US2 torna ações e shell honestos/acessíveis.
3. US3 move o contexto de rota para o app e fecha submenus futuros.
4. Polish fecha catálogo, gates e evidência manual.

### Task Format Validation

Todos os itens possuem checkbox, ID sequencial, marcador `[P]` somente quando aplicável, `[USx]` nas phases de user story, caminho de arquivo e tag de skill disponível no catálogo.
