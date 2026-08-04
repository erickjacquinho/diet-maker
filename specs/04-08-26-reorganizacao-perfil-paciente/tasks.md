# Tasks: Reorganização estrutural do perfil do paciente

**Input**: Design documents from `/specs/04-08-26-reorganizacao-perfil-paciente/`

**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md` e `quickstart.md` aprovados por revisão humana.

**Implementation route**: executar posteriormente por `/speckit-implement`; este documento não autoriza implementação nesta etapa de SDD.

## Phase 1: Setup

**Purpose**: alinhar a implementação futura às regras do produto e aos contratos visuais existentes.

- [ ] T001 [skill: $design-system] Ler `design-system/README.md`, `design-system/03-token-architecture.md`, `design-system/09-component-decision-model.md`, `.agents/rules/atomic-design.md` e `.agents/rules/shadcn-preservation.md`; registrar em `specs/04-08-26-reorganizacao-perfil-paciente/plan.md` os perfis e tokens reutilizados para o resumo do paciente.
- [ ] T002 [skill: $frontend-architecture-mindset] Mapear em `src/app/pacientes/[id]/page.tsx` e `src/lib/patientsStore.ts` as fontes de dados atuais, estados de carregamento/vazio e pontos de composição, documentando qualquer divergência encontrada em `specs/04-08-26-reorganizacao-perfil-paciente/research.md`.

## Phase 2: Foundational

**Purpose**: criar a regra determinística de origem dos dados antes de alterar a composição visual.

- [ ] T003 [skill: $tdd] Criar fixtures isoladas em `tests/fixtures/patient-profile.ts` para paciente com metas manuais, paciente com dieta ativa, paciente sem dieta ativa e paciente com múltiplas avaliações; garantir que os dados não mutem `localStorage` global.
- [ ] T004 [skill: $tdd] Escrever testes que falhem inicialmente em `tests/lib/patient-profile-selectors.test.ts` para as regras de `Patient.target*`, `HistoricalDiet.status`, avaliação corporal mais recente e estado vazio de `nextEvent`, rastreando FR-003–FR-008.
- [ ] T005 [skill: $frontend-architecture-mindset] Definir a projeção não persistida `ActivePlanSummary` em `src/lib/patientProfileSelectors.ts`, sem criar nova entidade de armazenamento, e documentar a regra para múltiplas dietas ativas em `specs/04-08-26-reorganizacao-perfil-paciente/data-model.md`.

## Phase 3: User Story 1 — Estado clínico atual (Priority: P1)

**Goal**: priorizar identidade, dados pessoais, indicadores atuais e acompanhamento no perfil.

**Independent Test**: um perfil com dados pessoais, avaliação e consulta permite localizar o contexto atual sem abrir o histórico e diferencia medição ausente de meta manual.

### Tests for User Story 1

- [ ] T006 [skill: $tdd] Adicionar em `tests/app/pacientes/patient-profile-current-context.test.tsx` cenários de aceitação para a ordem de prioridade, indicadores sem avaliação, última consulta e próximo acompanhamento, cobrindo FR-001–FR-002, FR-008–FR-009 e SC-001.

### Implementation for User Story 1

- [ ] T007 [skill: $ui-ux-pro-max:ui-ux-pro-max] Ajustar a composição de `src/app/pacientes/[id]/page.tsx` para que identidade/dados pessoais e indicadores atuais tenham a maior hierarquia, mantendo o acompanhamento como bloco acionável de menor ênfase e sem adicionar componentes de produto.
- [ ] T008 [skill: $design-system] Aplicar em `src/app/pacientes/[id]/page.tsx` somente tokens, componentes e dimensões catalogadas para títulos, dividers, ícones, foco, estado vazio e ações; validar que o quadro contínuo de indicadores não ganhe uma segunda moldura desnecessária.

**Checkpoint**: a jornada P1 deve permitir reconhecer o estado atual do paciente sem depender do histórico ou das metas manuais.

## Phase 4: User Story 2 — Plano alimentar vigente (Priority: P1)

**Goal**: mostrar contexto suficiente da dieta vigente sem duplicar o detalhe da prescrição.

**Independent Test**: com dieta ativa, o nutricionista reconhece plano, data/status e resumo compacto; sem dieta ativa, vê estado vazio honesto e ação para criar.

### Tests for User Story 2

- [ ] T009 [skill: $tdd] Completar em `tests/lib/patient-profile-selectors.test.ts` a cobertura da seleção de dieta vigente, exclusão de metas manuais como fallback, ausência de macros no estado vazio e preservação das versões históricas, cobrindo FR-003–FR-006 e SC-002–SC-004.
- [ ] T010 [skill: $tdd] Adicionar em `tests/app/pacientes/patient-profile-current-plan.test.tsx` cenários de aceitação para resumo com dieta ativa, resumo sem dieta e acesso aos detalhes em uma ação, cobrindo FR-004–FR-006 e SC-003–SC-005.

### Implementation for User Story 2

- [ ] T011 [skill: $frontend-architecture-mindset] Integrar a projeção de `src/lib/patientProfileSelectors.ts` à leitura existente de `src/app/pacientes/[id]/page.tsx`, mantendo `Patient.target*` fora da decisão de vigência e evitando uma nova leitura ou persistência.
- [ ] T012 [skill: $ui-ux-pro-max:ui-ux-pro-max] Refatorar em `src/app/pacientes/[id]/page.tsx` o quadro destacado de metas manuais para um resumo compacto do plano vigente, com origem temporal/status explícitos, totais em baixa hierarquia e ação de detalhes; não duplicar refeições ou a grade completa de macros.
- [ ] T013 [skill: $ui-ux-pro-max:ui-ux-pro-max] Definir em `src/app/pacientes/[id]/page.tsx` o estado vazio sem dieta ativa, preservando a ação existente de criação e sem mostrar kcal/proteína/carboidrato/gordura inventados.

**Checkpoint**: a jornada P1 deve distinguir plano vigente de meta manual e permanecer útil nos dois estados de disponibilidade.

## Phase 5: User Story 3 — Histórico contextual (Priority: P2)

**Goal**: preservar a análise longitudinal sem competir com o resumo atual.

**Independent Test**: o nutricionista distingue histórico vazio, histórico preenchido e registro antigo sem confundir seus valores com indicadores atuais.

### Tests for User Story 3

- [ ] T014 [skill: $tdd] Criar em `tests/app/pacientes/patient-profile-history.test.tsx` cenários para histórico vazio, histórico com dieta/avaliação por data e expansão de detalhes, cobrindo FR-007 e SC-005.

### Implementation for User Story 3

- [ ] T015 [skill: $frontend-architecture-mindset] Ajustar `src/app/pacientes/[id]/page.tsx` para consumir o resumo sem remover a consolidação histórica por data, mantendo registros antigos como históricos e preservando a ação de criar dieta.
- [ ] T016 [skill: $design-system] Harmonizar em `src/app/pacientes/[id]/page.tsx` a hierarquia do histórico com o novo resumo, usando o padrão de estado vazio, badge/status, separadores e expansão já existente no produto.

**Checkpoint**: o perfil deve preservar o valor longitudinal do histórico sem misturá-lo com o estado atual.

## Phase 6: Polish and cross-cutting validation

**Purpose**: validar acessibilidade, consistência visual e regressões do fluxo completo.

- [ ] T017 [skill: $tdd] Adicionar em `tests/app/pacientes/patient-profile-accessibility.test.tsx` asserções de nome/role/value, ordem de teclado, foco visível, rótulos temporais e estados vazios para as ações do plano, histórico e acompanhamento, cobrindo FR-010–FR-012 e SC-006–SC-007.
- [ ] T018 [skill: $webapp-testing] Validar em `tests/app/pacientes/patient-profile-visual.spec.ts` os cenários A, B e C de `quickstart.md` em viewport desktop de 1024px ou maior, registrando evidências de hierarquia, ausência de quadro de metas e ausência de macros inventados.
- [ ] T019 [skill: $design-system] Executar `npm run type-check`, `npm run lint`, `npm test -- --run`, `npm run audit:atomic-design` e `npm run verify:design-system -- --strict`; registrar os resultados e qualquer exceção em `specs/04-08-26-reorganizacao-perfil-paciente/quickstart.md`.
- [ ] T020 [skill: general] Atualizar `specs/04-08-26-reorganizacao-perfil-paciente/data-model.md`, `quickstart.md` e o registro aplicável do design system somente se a implementação aprovada alterar a regra de origem ou o contrato visual; marcar no SDD o estado real como implementado/conforme apenas com evidência.

## Dependencies and Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências; deve alinhar as fontes de verdade e os tokens.
- **Foundational (Phase 2)**: depende de Setup e bloqueia as histórias; define e testa a projeção do plano.
- **User Story 1 (Phase 3)**: depende de Foundation e entrega a primeira fatia demonstrável do perfil atual.
- **User Story 2 (Phase 4)**: depende de Foundation; pode começar em paralelo com US1 se a regra de seleção estiver estabilizada, mas a composição final deve respeitar a hierarquia de US1.
- **User Story 3 (Phase 5)**: depende da decisão de resumo de US2 para evitar duplicação visual e semântica.
- **Polish (Phase 6)**: depende das três jornadas e concentra validação transversal.

### User Story Dependencies

- **US1 (P1)**: depende de T003–T005; não depende do resumo de dieta para ser útil.
- **US2 (P1)**: depende de T003–T005; integra-se à hierarquia de US1 em T012.
- **US3 (P2)**: depende de T012 para manter a separação entre resumo e detalhe, mas não altera a regra de seleção.

### Parallel Opportunities

- T003 e a leitura de tokens de T001 podem ocorrer em paralelo.
- T006 e T009 podem ser escritos em paralelo depois de T005, pois cobrem contratos diferentes.
- T014 e T017 podem ser escritos em paralelo depois de estabilizar a composição das histórias.

## Implementation Strategy

### MVP First

1. Executar Setup + Foundation.
2. Entregar US1 com a hierarquia clínica atual.
3. Entregar US2 com resumo ativo/estado vazio.
4. Parar para validar a jornada P1 com o nutricionista antes de polir o histórico.

### Incremental Delivery

1. US1 torna o perfil legível como contexto atual.
2. US2 adiciona o plano vigente sem ressuscitar o painel de metas manuais.
3. US3 preserva histórico e detalhes.
4. Polish confirma acessibilidade, tokens, testes e evidências visuais.

## Traceability

| Requisito/critério | Tarefas principais |
|---|---|
| FR-001–FR-002, FR-008–FR-009, SC-001 | T006–T008 |
| FR-003–FR-006, SC-002–SC-005 | T004–T005, T009–T013 |
| FR-007 | T014–T016 |
| FR-010–FR-012, SC-006–SC-007 | T001, T008, T016–T020 |
