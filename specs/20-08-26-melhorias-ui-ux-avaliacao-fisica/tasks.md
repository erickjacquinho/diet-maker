# Implementation Tasks: Melhorias de UI/UX na Tela de Avaliação Física

**Feature Branch**: `20-08-26-melhorias-ui-ux-avaliacao-fisica` | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Tasks

- [ ] T001 [skill: tdd] Criar utilitário e testes unitários de classificação clínica (`src/lib/clinicalClassifications.ts` e `tests/lib/clinicalClassifications.test.ts`) para faixas de BF%, IMC (OMS) e risco cardiovascular por RCQ (Bray & Gray).
- [ ] T002 [skill: ui-ux-pro-max] Atualizar `AssessmentMeasurementField.tsx` para implementar auto-seleção de texto no foco (`onFocus={(e) => e.target.select()}`) e suporte visual para exibição de valor anterior inline (`previousValue`) com badge de variação/delta.
- [ ] T003 [skill: frontend-design] Atualizar `AssessmentContinuousFields.tsx` para repassar medições da avaliação anterior a cada campo e destacar a seção da fórmula US Navy com tag de obrigatoriedade clínica.
- [ ] T004 [skill: ui-ux-pro-max] Aprimorar `AssessmentSummaryPanel.tsx` com badges semânticos de classificação clínica (BF%, IMC, RCQ), barra visual empilhada de distribuição corporal (Massa Magra vs Massa Gorda) e botão de ação rápida "Copiar Resumo".
- [ ] T005 [skill: frontend-architecture-mindset] Atualizar o hook `useAssessmentWorkspacePage.ts` para implementar captura do atalho de teclado global `Ctrl+S` / `Cmd+S`, rastreamento de estado de modificação (*dirty state*) e gerador de texto formatado para área de transferência.
- [ ] T006 [skill: frontend-architecture-mindset] Integrar alerta de proteção contra saída acidental (*dirty form guard*) e navegação segura em `src/app/pacientes/[id]/avaliacao/[assessmentId]/page.tsx`.
- [ ] T007 [skill: code-reviewer-expert] Atualizar e expandir a suíte de testes de workspace em `tests/app/pacientes/assessment-workspace.test.tsx` cobrindo atalhos, auto-select, deltas inline, badges clínicos e cópia para área de transferência.
- [ ] T008 [skill: ui-ux-pro-max] Executar auditorias de conformidade arquitetural (`npm run audit:atomic-design`, `npm run verify:design-system`, `npm run type-check` e `npm test`) assegurando 100% de conformidade.
