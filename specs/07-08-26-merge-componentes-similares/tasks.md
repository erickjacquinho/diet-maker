---

description: "Task list for the selective component merge"
---

# Tasks: Merge Seletivo de Componentes Similares

**Input**: Design documents from `/specs/07-08-26-merge-componentes-similares/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Incluídos porque a especificação exige testes determinísticos, regressão comportamental, acessibilidade e auditorias de catálogo.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each increment.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the decision and evidence structure before changing source files.

- [ ] T001 [skill: general] [P] Consolidar o inventário dos candidatos, arquivos afetados, exclusões e decisões iniciais em `specs/07-08-26-merge-componentes-similares/data-model.md`.
- [ ] T002 [skill: design-system] [P] Mapear cada candidato para registry, categoria, perfil, lifecycle e consumidores em `specs/07-08-26-merge-componentes-similares/contracts/catalog-migration-contract.md`.
- [ ] T003 [skill: tdd] [P] Criar fixtures mínimos de props, estados e dados para os cenários compartilhados em `tests/components/molecules/merge-component-fixtures.ts`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the contract and validation guardrails required by every user story.

- [ ] T004 [skill: vercel-composition-patterns] [P] Codificar a regra de fronteira entre shells públicos e unidades internas em `tests/components/molecules/composition.test.ts`.
- [ ] T005 [skill: frontend-architecture-mindset] [P] Adicionar uma asserção de que nenhuma composição nova atravessa camadas Atomic Design em `tests/components/architecture/layer-boundaries.test.ts`.
- [ ] T006 [skill: design-system] [P] Adicionar uma guarda genérica para schema, fonte, export e relação de consumidor no contrato do catálogo em `tests/design-system/component-catalog.test.mjs`.
- [ ] T007 [skill: general] Definir a ordem de reversão e a evidência por candidato em `specs/07-08-26-merge-componentes-similares/quickstart.md`.

**Checkpoint**: os contratos de composição, camada, catálogo e reversão estão verificáveis antes de alterar os componentes.

---

## Phase 3: User Story 1 - Consolidar comportamentos comuns sem ampliar o escopo (Priority: P1) 🎯 MVP

**Goal**: Remover a duplicação aprovada e compartilhar somente responsabilidades comuns, preservando os shells e exports de domínio.

**Independent Test**: Executar os testes de composição e confirmar, candidato por candidato, que a unidade comum tem dois consumidores reais ou uma justificativa explícita, sem violar a matriz de camadas.

### Tests for User Story 1

- [ ] T008 [skill: tdd] [P] [US1] Escrever o teste que comprova a entrada canônica de `Input`, a ausência de consumidores do alias e a regra de remoção em `tests/components/ui/input-canonical.test.tsx`.
- [ ] T009 [skill: tdd] [P] [US1] Escrever os cenários de macros, cálculo energético, validação e read-only em `src/components/molecules/__tests__/AutoKcalSection.test.tsx`.
- [ ] T010 [skill: tdd] [P] [US1] Escrever os cenários comuns e específicos de quantidade, macros, remoção e ordenação em `tests/components/molecules/meal-recipe-shared.test.tsx`.
- [ ] T011 [skill: tdd] [P] [US1] Escrever os cenários de campos de identidade, rascunho, objetivo e descarte em `tests/components/molecules/patient-fields-composition.test.tsx`.
- [ ] T012 [skill: tdd] [P] [US1] Escrever os cenários de busca TACO, carregamento, vazio, erro, seleção e fechamento em `tests/components/molecules/taco-search-composition.test.tsx`.
- [ ] T013 [skill: tdd] [P] [US1] Escrever o teste de decisão entre `atoms/Badge` e `ui/badge`, incluindo variantes, estados e consumidores registrados, em `tests/components/atoms/badge-canonical.test.tsx`.

### Implementation for User Story 1

- [ ] T014 [skill: general] [US1] Migrar referências válidas para `@/components/ui/input` e remover o alias deprecated de `src/components/atoms/Input.tsx` somente após a busca de referências passar.
- [ ] T015 [skill: vercel-composition-patterns] [US1] Compor os controles de macros e o cálculo energético entre `src/components/molecules/AdjustDietGoalsModal.tsx` e `src/components/molecules/AutoKcalSection.tsx`, mantendo o shell do modal responsável por salvar/cancelar.
- [ ] T016 [skill: vercel-composition-patterns] [US1] Extrair a unidade interna comum de badges de macros e quantidade para `src/components/molecules/MealItemRow.tsx` e `src/components/molecules/RecipeIngredientRow.tsx`, preservando ordenação, remoção e tipos de domínio.
- [ ] T017 [skill: vercel-composition-patterns] [US1] Compor os campos de identidade compartilhados em `src/components/molecules/CreatePatientModal.tsx` e `src/components/molecules/EditPatientModal.tsx`, preservando criação, edição, objetivos, rascunho e descarte.
- [ ] T018 [skill: vercel-composition-patterns] [US1] Compartilhar a unidade de resultados e estados TACO entre `src/components/molecules/food-search/FoodSearchResultsList.tsx`, `src/components/molecules/FoodSearchModal.tsx` e `src/components/molecules/CreateRecipeModal.tsx`, mantendo a seleção específica de cada fluxo.
- [ ] T019 [skill: design-system] [US1] Aplicar a decisão documentada para Badge em `src/components/atoms/Badge.tsx` e `src/components/ui/badge.tsx` sem mover regra de domínio para o primitivo `ui`.

**Checkpoint**: todos os candidatos aprovados para composição ou remoção passam seus testes específicos e podem ser revertidos individualmente.

---

## Phase 4: User Story 2 - Preservar os fluxos de nutrição e cadastro (Priority: P1)

**Goal**: Demonstrar que os fluxos de metas, refeições, receitas, pacientes e busca mantêm valores, mensagens, estados, foco e ações após a composição.

**Independent Test**: Executar a suíte de regressão dos cinco fluxos e os cenários manuais em `quickstart.md`, sem alteração observável no comportamento aceito.

### Tests for User Story 2

- [ ] T020 [skill: tdd] [P] [US2] Cobrir o fluxo completo de metas, incluindo valor inválido, cálculo e cancelamento, em `tests/components/molecules/adjust-diet-goals-modal.test.tsx`.
- [ ] T021 [skill: tdd] [P] [US2] Cobrir quantidade, macros, remoção e ordenação em refeição e receita em `tests/components/molecules/meal-recipe-row-regression.test.tsx`.
- [ ] T022 [skill: tdd] [P] [US2] Cobrir criação, edição, objetivo, alteração não salva e descarte em `tests/components/molecules/patient-modals-regression.test.tsx`.
- [ ] T023 [skill: tdd] [P] [US2] Cobrir busca TACO em alimento e receita, incluindo vazio, erro, seleção e fechamento, em `tests/components/molecules/taco-search-regression.test.tsx`.
- [ ] T024 [skill: ui-styling] [P] [US2] Cobrir foco visível, teclado, nome/role/value e retorno de foco dos modais alterados em `tests/components/overlays-accessibility.test.tsx`.
- [ ] T025 [skill: ui-styling] [P] [US2] Cobrir estados de superfície, read-only, disabled, error e empty das unidades compartilhadas em `tests/components/surface-accessibility.test.tsx`.

### Implementation for User Story 2

- [ ] T026 [skill: general] [US2] Ajustar os fluxos consumidores em `src/components/molecules/AdjustDietGoalsModal.tsx`, `src/components/molecules/MealItemRow.tsx`, `src/components/molecules/RecipeIngredientRow.tsx`, `src/components/molecules/CreatePatientModal.tsx`, `src/components/molecules/EditPatientModal.tsx`, `src/components/molecules/FoodSearchModal.tsx` e `src/components/molecules/CreateRecipeModal.tsx` para preservar seus contratos públicos após a composição.
- [ ] T027 [skill: frontend-architecture-mindset] [US2] Registrar no `tests/components/molecules/composition.test.ts` que cada shell mantém callbacks, estado local e ações de domínio sem dependência circular.

**Checkpoint**: os cinco fluxos críticos concluem os cenários de aceitação e as verificações de acessibilidade sem regressão observável.

---

## Phase 5: User Story 3 - Manter rastreabilidade e conformidade do sistema visual (Priority: P2)

**Goal**: Sincronizar código, registry, perfis, lifecycle e evidências de validação.

**Independent Test**: Executar os validadores estritos e revisar os registros afetados, confirmando zero findings bloqueantes e cobertura de todos os exports alterados.

### Tests for User Story 3

- [ ] T028 [skill: design-system] [P] [US3] Adicionar casos de fonte canônica, alias deprecated, wrapper compartilhado e consumidores no catálogo em `tests/design-system/component-catalog.test.mjs`.
- [ ] T029 [skill: design-system] [P] [US3] Adicionar a verificação de links e lifecycle dos perfis afetados em `tests/design-system/legacy-audit.contract.test.ts`.

### Implementation for User Story 3

- [ ] T030 [skill: design-system] [P] [US3] Atualizar IDs, sources, exports, consumers, layers e lifecycle no registro em `design-system/components/registry.json`.
- [ ] T031 [skill: design-system] [P] [US3] Atualizar ou criar os perfis afetados em `design-system/components/profiles/atoms/input.md`, `design-system/components/profiles/atoms/badge.md`, `design-system/components/profiles/ui/input.md`, `design-system/components/profiles/ui/badge.md`, `design-system/components/profiles/molecules/adjust-diet-goals-modal.md`, `design-system/components/profiles/molecules/auto-kcal-section.md`, `design-system/components/profiles/molecules/create-patient-modal.md`, `design-system/components/profiles/molecules/edit-patient-modal.md`, `design-system/components/profiles/molecules/meal-item-row.md`, `design-system/components/profiles/recipe-ingredient-row.md`, `design-system/components/profiles/taco-search-input.md` e `design-system/components/profiles/organisms/food-search-modal.md`.
- [ ] T032 [skill: design-system] [US3] Registrar a decisão de manutenção ou remoção de wrapper e os consumidores canônicos em `design-system/components/category-decisions.md`.
- [ ] T033 [skill: design-system] [US3] Atualizar a evidência de migração, status documental e critério de homologação em `specs/07-08-26-merge-componentes-similares/contracts/catalog-migration-contract.md`.

**Checkpoint**: código e catálogo estão sincronizados, com lifecycle explícito e sem findings bloqueantes.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, evidence and human-review readiness.

- [ ] T034 [skill: code-reviewer-expert] [P] Fazer revisão de diff focada em props booleanas, vazamento de domínio, imports de camada e contratos públicos em `src/components/molecules/AdjustDietGoalsModal.tsx`, `src/components/molecules/AutoKcalSection.tsx`, `src/components/molecules/MealItemRow.tsx`, `src/components/molecules/RecipeIngredientRow.tsx`, `src/components/molecules/CreatePatientModal.tsx`, `src/components/molecules/EditPatientModal.tsx`, `src/components/molecules/FoodSearchModal.tsx`, `src/components/molecules/CreateRecipeModal.tsx`, `src/components/atoms/Input.tsx` e `src/components/atoms/Badge.tsx`.
- [ ] T035 [skill: tdd] [P] Executar a suíte completa e registrar resultados dos testes em `specs/07-08-26-merge-componentes-similares/quickstart.md`.
- [ ] T036 [skill: design-system] [P] Executar `npm run audit:atomic-design`, `npm run verify:design-system` e `npm run verify:links`, registrando findings nominais em `specs/07-08-26-merge-componentes-similares/quickstart.md`.
- [ ] T037 [skill: general] [P] Revisar e marcar os itens aplicáveis de qualidade de requisitos em `specs/07-08-26-merge-componentes-similares/checklists/merge-quality.md`.
- [ ] T038 [skill: general] Confirmar todos os sete critérios de sucesso e a reversão independente por candidato em `specs/07-08-26-merge-componentes-similares/spec.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências; prepara inventário e evidência.
- **Foundational (Phase 2)**: depende de T001–T003 e bloqueia as stories.
- **User Story 1 (Phase 3)**: depende de T004–T007; entrega o MVP de composição e migração.
- **User Story 2 (Phase 4)**: depende de T008–T019, pois valida os fluxos após as mudanças de composição.
- **User Story 3 (Phase 5)**: pode começar a preparar casos em paralelo com US2, mas a sincronização final depende de T014–T019 e T026.
- **Polish (Phase 6)**: depende de todas as stories desejadas e das atualizações de catálogo.

### User Story Dependencies

- **US1 (P1)**: depende apenas da fundação; é o MVP.
- **US2 (P1)**: depende da implementação de US1 para validar regressões, mas seus testes podem ser escritos em paralelo.
- **US3 (P2)**: depende das decisões efetivamente aplicadas em US1 e dos contratos públicos verificados em US2.

### Parallel Opportunities

- T001–T003 podem ser preparados em paralelo.
- T004–T006 são verificações independentes de arquitetura e catálogo.
- T008–T013 são testes de candidatos independentes e podem ser escritos em paralelo.
- T010–T013 da US2 são regressões separadas por fluxo; T024–T025 são verificações transversais de acessibilidade.
- T028–T029 e T030–T031 da US3 podem ser trabalhados em paralelo quando a matriz de decisões estiver estável.

## Parallel Example: User Story 1

```text
T008 Input canonical test
T009 Macro composition tests
T010 Meal/recipe shared-unit tests
T011 Patient-fields composition tests
T012 TACO composition tests
T013 Badge decision test
```

Esses testes não devem alterar os mesmos arquivos de produção e podem ser preparados simultaneamente; as respectivas implementações T014–T019 devem respeitar suas dependências individuais.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Concluir Setup e Foundational.
2. Escrever e executar os testes de US1 antes das mudanças correspondentes.
3. Aplicar um candidato por vez, iniciando por Input e macros.
4. Validar e poder reverter cada candidato antes do próximo.
5. Parar no checkpoint de US1 para revisão humana antes de avançar.

### Incremental Delivery

1. US1 reduz duplicação e estabelece as fronteiras de composição.
2. US2 comprova preservação dos fluxos e acessibilidade.
3. US3 sincroniza registry, perfis e lifecycle.
4. Polish consolida evidência, validadores e checklist.

### Notes

- `[P]` indica tarefas paralelizáveis; todas as tarefas possuem uma skill única imediatamente após o ID.
- Nenhuma tarefa implementa um modal universal ou altera regras de negócio nos primitivos `ui`.
- A execução deste arquivo deve ocorrer posteriormente por `/speckit-implement`, após validação humana do SDD.
