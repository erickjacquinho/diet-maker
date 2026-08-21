# Tasks: Avaliação física com cálculo US Navy

**Input**: `spec.md`, `plan.md`, `research.md`, `data-model.md` e `quickstart.md`

## Phase 1: Setup and contracts

- [X] T001 [skill: general] Confirmar o contexto da feature e os contratos de `BodyAssessment` em `specs/05-08-26-calculo-avaliacao-us-navy/data-model.md`.

## Phase 2: Foundational domain calculation

- [X] T002 [P] [skill: tdd] Criar testes falhando para homens, mulheres, conversão de unidades, composição derivada e entradas inválidas em `tests/lib/bodyFat.test.ts`.
- [X] T003 [skill: general] Implementar `calculateBodyComposition`, `BodyFatSex`, `NavyBodyFatInput` e `BodyCompositionResult` em `src/lib/bodyFat.ts`, centralizando constantes, conversão cm/polegadas, validações, equações e arredondamento.
- [X] T004 [skill: tdd] Executar `npm test -- --run tests/lib/bodyFat.test.ts` e confirmar que os testes do domínio passam.

## Phase 3: User Story 1 — Registrar composição corporal automaticamente

- [X] T005 [skill: tdd] [P] [US1] Criar testes falhando para o contrato do modal, incluindo ordem dos campos, resultados readonly, recálculo, erro inline e submit bloqueado em `tests/components/molecules/edit-assessment-modal.test.tsx`.
- [X] T006 [skill: general] [US1] Estender `BodyAssessment` com as circunferências e `fatMassKg`, preservando os campos existentes e a leitura de JSON legado em `src/lib/patientsStore.ts`.
- [X] T007 [skill: general] [US1] Implementar `EditAssessmentModal` em `src/components/molecules/EditAssessmentModal.tsx`, com rascunho completo, normalização de gênero, chamada ao cálculo, validação, labels na ordem solicitada, resultados somente leitura e composição acessível do Dialog.
- [X] T008 [skill: general] [US1] Exportar `EditAssessmentModal` pelo barrel de `src/components/molecules/index.ts`.
- [X] T009 [skill: general] [US1] Substituir o formulário inline de avaliação no perfil por `EditAssessmentModal`, mantendo criação, edição, persistência e atualização do histórico em `src/app/pacientes/[id]/page.tsx`.
- [X] T010 [skill: general] [US1] Executar os testes do modal e corrigir regressões de tipos, acessibilidade e persistência até a suíte direcionada passar.

## Phase 4: User Story 2 — Editar e consultar histórico

- [X] T011 [skill: general] [US2] Substituir o formulário inline de edição da consulta por `EditAssessmentModal`, conectando o resultado salvo ao estado da consulta em `src/app/pacientes/[id]/consulta/[date]/page.tsx`.
- [X] T012 [skill: tdd] [US2] Adicionar cobertura para avaliação legada sem novas circunferências e para atualização de avaliação existente em `tests/lib/patientsStore-assessment.test.ts`.
- [X] T013 [skill: general] [US2] Validar que as visualizações de histórico e indicadores continuam usando `bodyFatPercent`, `weightKg`, `muscleMassKg` e `waistCm` sem apagar registros legados.

## Phase 5: Polish and validation

- [X] T014 [skill: code-reviewer-expert] Revisar o diff para garantir que a equação não está duplicada, que os primitivos Shadcn não receberam domínio e que os novos nomes/labels seguem o design system.
- [X] T015 [skill: general] Executar `npm test -- --run`, `npm run lint` e `npm run build`; corrigir falhas e atualizar este arquivo com todas as tarefas concluídas. Suíte completa: 51 arquivos e 208 testes aprovados; type-check, lint, build, auditoria Atomic Design e verificação estrita do catálogo também passaram. O build ainda emite o aviso conhecido de opções antigas do ESLint, mas termina com exit code 0.

## Dependencies

- T003 depende de T002; T004 depende de T003.
- T007 depende de T003 e T006; T009 depende de T007/T008.
- T011 depende de T007/T008; T012/T013 dependem de T006/T009/T011.
- T014/T015 dependem de todas as tarefas anteriores.

## Independent test criteria

- US1: o modal calcula e exibe composição válida e bloqueia dados inválidos.
- US2: uma avaliação existente é recalculada ao editar e uma avaliação legada continua carregando.

## Phase 6: Convergence

- [X] T016 [skill: design-system] Registrar `EditAssessmentModal` no catálogo canônico e criar seu perfil de molecule, incluindo fonte, export público, categoria, consumidores e contrato visual, conforme Constituição II (contradicts).
