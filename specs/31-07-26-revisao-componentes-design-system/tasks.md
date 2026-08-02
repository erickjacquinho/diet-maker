# Implementation Tasks: Revisão Completa dos Componentes e Aplicação do Design System

**Feature Name**: Revisão Completa dos Componentes e Aplicação do Design System  
**Plan**: [plan.md](plan.md)  
**Spec**: [spec.md](spec.md)  
**Created**: 2026-07-31

## Phase 1: Setup & Pre-Audit Baseline

Goal: Preparar matriz de auditoria componente a componente.

- [ ] T001 [skill: design-system] Mapear a lista completa de componentes em `src/components/atoms/`, `src/components/molecules/`, `src/components/organisms/` e `src/components/ui/` contra `design-system-guidelines/components/registry.json`
- [ ] T002 [skill: general] Executar a verificação estática inicial `node scripts/verify-design-system-legacy.mjs`

## Phase 2: User Story 1 - Padronização Visual de Tabelas e Listas (P1)

Goal: Refatorar todas as tabelas para a receita e estrutura canônica (`border-border-subtle`, `bg-surface-subtle`, `text-text-muted`, `hover:bg-surface-hover`).

- [ ] T003 [P] [US1] [skill: frontend-design] Auditar e padronizar tabelas de alimentos e dietas na tela de Prescrição em `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx`
- [ ] T004 [P] [US1] [skill: frontend-design] Auditar e padronizar tabelas nos catálogos de Alimentos (`src/app/alimentos/page.tsx`), Receitas (`src/app/receitas/page.tsx`), Presets (`src/app/presets/page.tsx`) e Refeições Prontas (`src/app/refeicoes-prontas/page.tsx`)
- [ ] T005 [US1] [skill: code-reviewer-expert] Validar que todas as células usam estilos tipográficos autorizados (`text-style-body` ou `text-style-body-compact`)

## Phase 3: User Story 2 - Uniformização de Tipografia e Textos (P2)

Goal: Erradicar classes de tamanho e peso arbitrárias em textos por toda a aplicação.

- [ ] T006 [P] [US2] [skill: ui-ux-pro-max] Auditar rótulos, subtítulos, cabeçalhos de cartão e notas legais em `src/components/molecules/` e `src/components/organisms/`
- [ ] T007 [P] [US2] [skill: frontend-design] Auditar cartões de métricas macronutricionais (`MacroMetricCard.tsx`) e seções de calorias automáticas (`AutoKcalSection.tsx`)
- [ ] T008 [US2] [skill: code-reviewer-expert] Garantir uso de tokens cromáticos semânticos (`text-text-primary`, `text-text-secondary`, `text-text-muted`)

## Phase 4: User Story 3 - Auditoria de Botões e Controles (P3)

Goal: Ajustar botões e controles para peso `font-semibold` e tamanhos padronizados.

- [ ] T009 [P] [US3] [skill: frontend-design] Auditar botões atômicos em `src/components/atoms/Button.tsx`, `IconButton.tsx`, `CreateButton.tsx`
- [ ] T010 [P] [US3] [skill: frontend-design] Auditar inputs, selects e textareas em `src/components/ui/` para aplicação de `rounded-control` e foco semântico
- [ ] T011 [US3] [skill: webapp-testing] Executar a suíte de testes de botões em `src/components/atoms/__tests__/Button.test.tsx` e `IconButton.test.tsx`

## Phase 5: Loop de Verificação Contínua e QA Final

Goal: Assegurar conformidade total sem regressões.

- [ ] T012 [skill: general] Executar o script de verificação estática `node scripts/verify-design-system-legacy.mjs`
- [ ] T013 [skill: general] Executar o audit atômico `node scripts/audit-atomic-design.mjs`
- [ ] T014 [skill: general] Executar a verificação de compilação `npx tsc --noEmit`
- [ ] T015 [skill: webapp-testing] Executar a suíte de testes Vitest `npx vitest run` e validar aprovação de 30/30 arquivos
