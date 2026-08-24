# Tasks: Auditoria e Adequação do Componente MacroSummary

**Feature Directory**: `specs/24-08-26-auditoria-adequacao-macro-summary`
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Phase 1: Setup & Foundational Preparation

- [X] T001 [skill: design-system] Verificar interface de contrato e tipos em `src/components/molecules/MacroSummary.tsx` e `specs/24-08-26-auditoria-adequacao-macro-summary/contracts/macro-summary-component.ts`

## Phase 2: User Story 1 - Exibição Contínua Sem Quebra de Linha (Priority: P1)

**Goal**: Garantir que o componente `MacroSummary` nunca quebre linha internamente em contêineres compactos, cards ou tabelas.
**Independent Test**: Renderizar com múltiplos macros e verificar a presença de `flex-nowrap whitespace-nowrap` no contêiner.

- [X] T002 [skill: design-system] [US1] Ajustar o layout do contêiner raiz em `src/components/molecules/MacroSummary.tsx` adicionando `flex-nowrap whitespace-nowrap` e removendo `flex-wrap` ou espaçamentos responsivos legados.
- [X] T003 [skill: tdd] [P] [US1] Adicionar teste unitário de não quebra de linha em `tests/components/molecules/MacroSummary.test.tsx` validando as classes `flex-nowrap` e `whitespace-nowrap`.

## Phase 3: User Story 2 - Controle Explícito da Exibição de Calorias (Priority: P1)

**Goal**: Suportar a propriedade booleana `showKcal?: boolean` para controle explícito de exibição/ocultação de calorias.
**Independent Test**: Renderizar o componente com `showKcal={false}` e `showKcal={true}` com e sem `kcal`, verificando renderização condicional.

- [X] T004 [skill: nextjs-fullstack-master] [US2] Implementar a prop `showKcal?: boolean` e lógica de visibilidade condicional em `src/components/molecules/MacroSummary.tsx`.
- [X] T005 [skill: tdd] [P] [US2] Adicionar testes unitários em `tests/components/molecules/MacroSummary.test.tsx` validando `showKcal={false}` ocultando calorias mesmo com `kcal` fornecido.

## Phase 4: User Story 3 - Auditoria e Adequação Global dos Consumidores (Priority: P2)

**Goal**: Auditar e parametrizar todos os consumidores do `MacroSummary` na aplicação para usar `showKcal` adequadamente e garantir layout sem quebras.
**Independent Test**: Executar auditoria em todos os arquivos de componentes consumidores e testes de regressão.

- [X] T006 [skill: code-reviewer-expert] [US3] Auditar e adequar o card de variações de ciclo em `src/components/molecules/CarbCyclingVariationPanel.tsx` garantindo renderização de macros + kcal sem quebras.
- [X] T007 [skill: code-reviewer-expert] [P] [US3] Auditar e adequar a exibição da média semanal em `src/components/molecules/CycleMatrixModal.tsx`.
- [X] T008 [skill: code-reviewer-expert] [P] [US3] Auditar e adequar a tabela de prescrições dietéticas em `src/components/organisms/patient/PatientDietsTable.tsx` utilizando `showKcal={false}`.
- [X] T009 [skill: code-reviewer-expert] [P] [US3] Auditar e adequar a linha de consulta em `src/components/organisms/patient/ConsultationHistoryRow.tsx`.
- [X] T010 [skill: code-reviewer-expert] [P] [US3] Auditar e adequar o card de consulta em `src/app/pacientes/[id]/consulta/[date]/components/ConsultationDietCard.tsx`.
- [X] T011 [skill: code-reviewer-expert] [P] [US3] Auditar e adequar o modal de visualização em `src/components/molecules/ReadOnlyDietModal.tsx`.
- [X] T012 [skill: code-reviewer-expert] [P] [US3] Auditar e adequar a lista de busca de alimentos em `src/components/molecules/food-search/FoodSearchResultsList.tsx`.

## Phase 5: Polish & Validação Final

- [X] T013 [skill: tdd] Executar suite completa de testes com Vitest (`npx vitest run tests/components/molecules/MacroSummary.test.tsx tests/components/molecules/CarbCyclingVariationPanel.test.tsx tests/components/organisms/patient-diets-table.test.tsx`).
- [X] T014 [skill: general] Executar type check (`npm run type-check`) e auditoria de Atomic Design (`npm run audit:atomic-design`).

## Dependencies & Completion Order

```text
T001 (Setup)
  └── T002 (US1: No-wrap) ──► T003 (US1: Tests)
        └── T004 (US2: showKcal) ──► T005 (US2: Tests)
              └── T006..T012 (US3: Auditoria Consumidores)
                    └── T013..T014 (Validação Final)
```
