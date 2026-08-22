# Implementation Tasks: Timeline de Atendimentos com Filtros Rápidos

## Phase 1: Data Model & Selectors

- [ ] T001 [skill: backend-patterns] Implementar tipos `TimelineItem`, `TimelineDateGroup` e a função `buildPatientTimelineEvents` em `src/lib/patientProfileConsultations.ts`.
- [ ] T002 [skill: tdd] Criar testes unitários em `tests/lib/patient-profile-consultations.test.ts` validando múltiplos eventos no mesmo dia, ordenação cronológica e isolamento de dados.

## Phase 2: Timeline Event Cards & Progressive Disclosure

- [ ] T003 [skill: ui-ux-pro-max] Refatorar `src/components/organisms/patient/ConsultationHistoryRow.tsx` implementando `TimelineDietCard` (com macros em badges, status, botões Ver Cardápio e Editar) e `TimelineAssessmentCard` (com métricas, tendência e expansão inline de dobras).
- [ ] T004 [skill: ui-ux-pro-max] Assegurar acessibilidade (WCAG 2.2 AA), foco visível, `aria-expanded` dinâmico e suporte completo a teclado nos cards.

## Phase 3: Timeline Container & Tabs Filter

- [ ] T005 [skill: ui-ux-pro-max] Refatorar `src/components/organisms/PatientConsultationHistoryTable.tsx` para renderizar a timeline com controle de abas (`Todas`, `Avaliações`, `Dietas`), contadores nos badges e agrupadores por data.
- [ ] T006 [skill: ui-ux-pro-max] Implementar estados vazios contextuais para cada filtro e para o estado inicial sem atendimentos.

## Phase 4: Integration & Verification

- [ ] T007 [skill: frontend-architecture-mindset] Integrar a nova timeline na página `src/app/pacientes/[id]/page.tsx`, sincronizando a contagem de atendimentos e ações de criação do cabeçalho.
- [ ] T008 [skill: code-reviewer-expert] Executar a suíte de testes automatizados (`npm test -- tests/app/pacientes`) e validar conformidade final.
