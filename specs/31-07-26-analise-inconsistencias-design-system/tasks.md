# Implementation Tasks: Análise de Inconsistências do Design System em Todas as Telas

**Feature Name**: Análise de Inconsistências do Design System em Todas as Telas  
**Plan**: [plan.md](plan.md)  
**Spec**: [spec.md](spec.md)  
**Created**: 2026-07-31

## Phase 1: Setup & Pre-Audit Baseline

Goal: Garantir ambiente de auditoria pronto e linha de base limpa.

- [X] T001 [skill: design-system] Inspecionar a estrutura do Design System em `design-system-guidelines/` e confirmar integridade de `components/registry.json`
- [X] T002 [skill: general] Executar o script de auditoria estática inicial `node scripts/verify-design-system-legacy.mjs` para checar contagem de achados em 69 arquivos

## Phase 2: User Story 1 - Auditoria de Telas Principais do Sistema (P1)

Goal: Garantir que todas as telas primárias (`src/app/`) estejam 100% livres de cores legadas, fontes hardcoded ou arredondamentos inválidos.

- [X] T003 [P] [US1] [skill: frontend-design] Audit visual da tela de Pacientes em `src/app/pacientes/page.tsx` e `src/app/pacientes/[id]/page.tsx`
- [X] T004 [P] [US1] [skill: frontend-design] Audit visual da tela de Prescrição/Consulta em `src/app/pacientes/[id]/consulta/[date]/page.tsx` e `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx`
- [X] T005 [P] [US1] [skill: frontend-design] Audit visual do catálogo de Alimentos, Presets, Receitas e Refeições Prontas em `src/app/alimentos/page.tsx`, `src/app/presets/page.tsx`, `src/app/receitas/page.tsx` e `src/app/refeicoes-prontas/page.tsx`
- [X] T006 [US1] [skill: code-reviewer-expert] Validar que todos os botões de ação nessas telas consomem a recipe `recipes.button` ou componentes atômicos padronizados de `@/components/atoms/Button.tsx`

## Phase 3: User Story 2 - Auditoria de Modais, Overlays e Diálogos (P2)

Goal: Garantir alinhamento de estilo e estrutura de todos os modais de interação.

- [X] T007 [P] [US2] [skill: frontend-design] Auditar modais de busca de alimentos em `src/components/molecules/FoodSearchModal.tsx` e visualização de dieta em `src/components/molecules/ReadOnlyDietModal.tsx`
- [X] T008 [P] [US2] [skill: frontend-design] Auditar modais de ação em `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx` (Escala, Cópia, Metas, WhatsApp) e em `src/app/presets/page.tsx`
- [X] T009 [US2] [skill: ui-ux-pro-max] Confirmar uso de tokens `bg-surface`, `border-border-subtle`, `rounded-surface` e estados de foco semânticos em todas as caixas de diálogo

## Phase 4: User Story 3 - Auditoria da Documentação Viva (P3)

Goal: Manter a página documental do Design System perfeitamente espelhada em relação a `registry.json`.

- [X] T010 [US3] [skill: design-system] Inspecionar a implementação da página em `src/app/design-system/page.tsx` para exibição exata de tokens, receitas e lifecycle de componentes
- [X] T011 [US3] [skill: webapp-testing] Executar os testes automatizados de rota em `tests/routes/design-system-page.test.tsx` para assegurar fidelidade documental

## Phase 5: Polish & Quality Assurance

Goal: Verificação automatizada e validação de conformidade final.

- [X] T012 [skill: general] Executar a verificação estática de legado `node scripts/verify-design-system-legacy.mjs` e audit atômico `node scripts/audit-atomic-design.mjs`
- [X] T013 [skill: general] Executar a checagem de compilação TypeScript `npx tsc --noEmit`
- [X] T014 [skill: webapp-testing] Executar a suíte de testes Vitest `npx vitest run` e validar aprovação de 30/30 arquivos
