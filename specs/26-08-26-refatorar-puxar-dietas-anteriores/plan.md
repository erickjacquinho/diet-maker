# Implementation Plan: Refatoração do botão Puxar Metas Anteriores com Modal de Seleção de Dietas

**Branch**: `26-08-26-refatorar-puxar-dietas-anteriores` | **Date**: 2026-08-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/26-08-26-refatorar-puxar-dietas-anteriores/spec.md`

## Summary

Refatorar a funcionalidade do botão "Puxar Metas Anteriores" na tela de criação de nova dieta (`/dieta/nova`), substituindo a importação automática cega por um modal interativo (`ImportPreviousDietModal`). O modal apresenta uma tabela para seleção de dietas anteriores do paciente e disponibiliza dois botões de ação dedicados: "Puxar apenas os macros" (importa alvos nutricionais) e "Puxar todas as refeições" (duplica de forma isolada a composição completa de refeições e alimentos para o novo plano, sem alterar o histórico original). Quando o paciente não possuir histórico de dietas, o botão na barra de ações permanece desabilitado.

## Technical Context

**Language/Version**: TypeScript 5.7, React 19, Next.js 15 App Router

**Primary Dependencies**: Radix UI primitives (`@radix-ui/react-dialog`), Tailwind CSS, Lucide React (`History`, `Utensils`, `Calendar`, `Percent`, `Check`), Sonner (toasts), `localStorage` stores (`dietStore.ts`, `patientsStore.ts`).

**Storage**: `localStorage` por meio dos stores existentes de dietas (`getPatientDietsFromStorage`) e pacientes (`getPatientById`).

**Testing**: Vitest, Testing Library React, jsdom, `tsc --noEmit`.

**Target Platform**: Web desktop a partir de 1024px, operação por teclado e conformidade com WCAG 2.2 AA.

**Project Type**: Aplicação web desktop local-first (React/Next.js).

**Performance Goals**: Abertura instantânea do modal (<50ms), seleção de linha e renderização em menos de 16ms, duplicação e recálculo de macros imediatos sem travamento de UI.

**Constraints**: Desktop only (>=1024px); sem alteração no registro de origem; isolamento estrito de IDs para itens clonados; preservação do Design System canônico e hierarquia Atomic Design.

**Scale/Scope**: Escopo restrito ao modal `ImportPreviousDietModal`, template `DietBuilderTemplate`, hook `useDietBuilderPage`/`useDietBuilderModals` e rotas de dieta sob `/pacientes/[id]/dieta/[dietaId]`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Atomic Design Architecture**: PASS — O modal é implementado como Molecule (`src/components/molecules/ImportPreviousDietModal.tsx`); a tabela e botões consomem primitivos de `src/components/ui/` e átomos de `src/components/atoms/`; lógica de clone e extração fica em `src/lib/` ou hooks; a página orquestra o fluxo.
- **II. Canonical Design System**: PASS — Utiliza tokens canônicos de tipografia (`textStyle`), cores de superfície e borda (`surface`, `border-divider`, `primary-soft`), estados de hover e focus ring definidos em `design-system/README.md`.
- **III. Desktop Scope and Accessibility**: PASS — Interface desktop (>=1024px); acessível via teclado com foco gerenciado, navegação por setas/Tab, tecla Escape e aria-labels acessíveis.
- **IV. Test-First Quality and Isolation**: PASS — Criação de testes unitários para a função de duplicação/clonagem e testes de componente para o modal e seus estados vazios/desabilitados.
- **V. Spec-Driven Execution**: PASS — Especificação completa e auditada em `spec.md`, checklists estruturados em `checklists/`, plano e tarefas prontas para implementação via `/speckit-implement`.

## Project Structure

### Documentation (this feature)

```text
specs/26-08-26-refatorar-puxar-dietas-anteriores/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/
│   ├── requirements.md
│   └── ux.md
└── tasks.md                         # criado por /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── app/pacientes/[id]/dieta/[dietaId]/page.tsx      # Conexão de props e renderização do ImportPreviousDietModal
├── components/
│   ├── molecules/
│   │   ├── ImportPreviousDietModal.tsx              # Componente modal com tabela de seleção e 2 botões de ação
│   │   └── index.ts                                 # Export do novo componente
│   └── templates/
│       ├── DietBuilderTemplate.tsx                  # Botão com estado disabled e tooltip quando sem dietas
│       └── dietBuilderTemplateTypes.ts              # Tipagem atualizada com hasPreviousDiets e handler
├── hooks/
│   ├── useDietBuilderModals.ts                      # Controle de estado aberto/fechado do modal e seleção
│   └── useDietBuilderPage.ts                        # Lógica de extração de dietas, pull macros e duplicate meals
└── lib/
    ├── dietDuplication.ts                           # Função utilitária pura para clonagem com fresh IDs
    └── dietStore.ts                                 # Helpers existentes

tests/
├── components/molecules/ImportPreviousDietModal.test.tsx  # Testes do modal, tabela, seleções e botões
└── lib/dietDuplication.test.ts                            # Testes unitários para clonagem profunda e isolamento
```

## Phase 0: Research Summary

Conforme registrado em [research.md](./research.md), o fluxo atual puxa cegamente a primeira dieta encontrada sem permitir escolha. A refatoração propõe um modal com tabela de seleção única e dois botões de ação explícitos ("Puxar apenas os macros" e "Puxar todas as refeições"), mantendo o botão inativo quando não houver histórico de dietas para o paciente.

## Phase 1: Design Summary

- [data-model.md](./data-model.md) formaliza o tipo `PreviousDietSummary`, os contratos de props do modal e a função pura `cloneMealsWithFreshIds`.
- [quickstart.md](./quickstart.md) detalha o roteiro de testes automatizados e o fluxo de validação manual para pacientes com e sem dietas anteriores.

## Implementation Approach

1. **Utilitário de Duplicação e Modelagem (`src/lib/dietDuplication.ts`)**:
   - Implementar função utilitária pura para preparar o resumo de dietas anteriores (`buildPreviousDietSummaries`) e para clonagem com novos identificadores (`cloneDietForNewDraft`).
   - Criar testes unitários em `tests/lib/dietDuplication.test.ts`.

2. **Componente de Modal (`src/components/molecules/ImportPreviousDietModal.tsx`)**:
   - Construir a tabela de seleção com colunas: Data, Nome, Modo, Calorias, Macronutrientes e Qtd. Refeições.
   - Implementar estado de seleção exclusiva de linha.
   - Adicionar os botões "Puxar apenas os macros" e "Puxar todas as refeições" desabilitados quando nenhuma linha estiver selecionada.
   - Criar testes de componente em `tests/components/molecules/ImportPreviousDietModal.test.tsx`.

3. **Atualização do Template (`DietBuilderTemplate.tsx`)**:
   - Atualizar o botão na barra de ações para suportar a prop `disabled` quando `!hasPreviousDiets`.
   - Adicionar tooltip explicativo quando desabilitado.

4. **Integração de Hooks e Página (`useDietBuilderPage.ts`, `useDietBuilderModals.ts`, `page.tsx`)**:
   - Gerenciar o estado de abertura do modal e a lista de dietas anteriores formatadas.
   - Implementar os callbacks `handlePullMacrosOnly` e `handlePullAllMeals`.
   - Conectar o modal e os manipuladores na página `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx`.

5. **Validação e Garantia de Qualidade**:
   - Executar suíte de testes (`npm run test`).
   - Executar checagem de tipos (`npx tsc --noEmit`).
