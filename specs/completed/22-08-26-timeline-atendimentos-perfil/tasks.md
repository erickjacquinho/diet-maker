# Implementation Tasks: Timeline de Atendimentos com Filtros Rápidos / Tabela Consolidada

## Phase 1: Data Model & Selectors

- [x] T001 [skill: backend-patterns] Implementar tipos `TimelineItem`, `TimelineDateGroup`, `ConsolidatedConsultation` e funções `buildPatientTimelineEvents` e `buildConsolidatedConsultations` em `src/lib/patientProfileConsultations.ts`.
- [x] T002 [skill: tdd] Criar testes unitários em `tests/lib/patient-profile-consultations.test.ts` validando múltiplos eventos no mesmo dia, ordenação cronológica e isolamento de dados.

## Phase 2: Timeline Event Cards & Progressive Disclosure

- [x] T003 [skill: ui-ux-pro-max] Implementar `ConsultationHistoryRow` (com macros em badges, status, botão Ver Consulta e Chevron) e `ConsultationHistoryExpandedRow` (com cards de dietas, avaliações, métricas e perímetro corporal).
- [x] T004 [skill: ui-ux-pro-max] Assegurar acessibilidade (WCAG 2.2 AA), foco visível, `aria-expanded` dinâmico e suporte completo a teclado nos cards.

## Phase 3: Consultation Table Container & Integration

- [x] T005 [skill: ui-ux-pro-max] Refatorar `src/components/organisms/PatientConsultationHistoryTable.tsx` para renderizar a tabela consolidada com `DataTable` e expansão de linhas via Chevron.
- [x] T006 [skill: ui-ux-pro-max] Implementar estados vazios contextuais e tratamento para múltiplos registros no mesmo dia.

## Phase 4: Integration & Verification

- [x] T007 [skill: frontend-architecture-mindset] Integrar a tabela na página `src/app/pacientes/[id]/page.tsx`, sincronizando a contagem de consultas, cabeçalho e modal `ReadOnlyDietModal`.
- [x] T008 [skill: code-reviewer-expert] Executar a suíte de testes automatizados e validar conformidade final.

