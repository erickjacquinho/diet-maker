# Implementation Tasks: Duas Tabelas Especializadas

## Phase 1: Tabela de Avaliações Físicas

- [ ] T001 [skill: ui-ux-pro-max] Implementar `PatientAssessmentsTable` e `AssessmentTableRow` em `src/components/organisms/patient/PatientAssessmentsTable.tsx` utilizando `DataTable` com colunas de data, peso, % gordura, massa magra, cintura, evolução e expansão inline de perímetros.
- [ ] T002 [skill: tdd] Criar testes unitários em `tests/components/organisms/patient-assessments-table.test.tsx` validando renderização de métricas, estado vazio e expansão de perímetros.

## Phase 2: Tabela de Prescrições Dietéticas

- [ ] T003 [skill: ui-ux-pro-max] Implementar `PatientDietsTable` e `DietTableRow` em `src/components/organisms/patient/PatientDietsTable.tsx` utilizando `DataTable` com colunas de data, nome do plano, status de vigência, calorias, macros e botão "Ver Cardápio".
- [ ] T004 [skill: tdd] Criar testes unitários em `tests/components/organisms/patient-diets-table.test.tsx` validando renderização de macros, status vigente e disparo do modal de cardápio.

## Phase 3: Integração no Perfil do Paciente

- [ ] T005 [skill: frontend-architecture-mindset] Integrar ambas as tabelas empilhadas em `src/app/pacientes/[id]/page.tsx`, cada uma com seu `<Surface>`, cabeçalho específico com ícone e botões de ação rápida ("Nova Avaliação" e "Nova Dieta").
- [ ] T006 [skill: code-reviewer-expert] Executar suíte de testes de integração e acessibilidade de pacientes (`npm test -- tests/app/pacientes`) validando a nova composição.
