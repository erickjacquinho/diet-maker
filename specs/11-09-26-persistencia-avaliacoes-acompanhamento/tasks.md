# Tasks: Persistência de avaliações e acompanhamento

**Input**: artefatos em `/specs/11-09-26-persistencia-avaliacoes-acompanhamento/`  
**Execution**: `/speckit-implement` após validação humana  
**Ordering**: escrever o teste observável antes da implementação correspondente;
usar `[P]` apenas quando os arquivos forem independentes.

## Phase 1 — Fundação clínica

**Goal**: adicionar as duas entidades novas ao banco e à fachada existente sem
criar uma segunda arquitetura de aplicação.

- [X] T001 [P] Criar/estender fixture e helper de banco em
  `tests/fixtures/clinical.ts` e `tests/helpers/clinical-test-db.ts`, com duas
  Contas, pacientes ativos/arquivados, avaliações na mesma data, dietas
  confirmadas e acompanhamentos futuro/hoje/atrasado; comprovar IDs, datas e
  relógio determinísticos (FR-023, NFR-007).
- [X] T002 [P] Escrever testes puros de avaliação e acompanhamento em
  `tests/lib/clinical.test.ts`, cobrindo validação, datas civis, normalização
  bilateral, preenchimento assistido, cálculo US Navy, tipos, cardinalidade e
  versões; observar falhas antes do código (FR-003–FR-006, FR-009–FR-011).
- [X] T003 Implementar tipos, validação e invariantes em
  `src/lib/domain/clinical.ts`, reutilizando helpers puros compatíveis de
  `src/lib/bodyFat.ts`, `src/lib/date-only.ts` e
  `src/lib/consultationStorageUtils.ts`; fazer T002 passar sem browser ou banco
  (FR-003, FR-004, FR-009, FR-010, NFR-001).
- [X] T004 [P] Escrever testes de migration em
  `tests/infrastructure/clinical-migration.integration.test.ts`, verificando
  upgrade v3→v4, journal, reabertura, idempotência, FKs, checks e preservação
  das tabelas das Etapas 1–4 (FR-001, FR-009, FR-014, FR-015, FR-017, NFR-001,
  NFR-006).
- [X] T005 Implementar `body_assessments` e `next_follow_ups` no schema e uma
  migration incremental em `src/lib/infrastructure/local-db/schema.ts` e
  `src/lib/infrastructure/local-db/migrations.ts`; fazer T004 passar sem criar
  exportação ou restauração (FR-001, FR-009, FR-014, FR-015, NFR-006).
- [X] T006 [P] Escrever integração do repositório em
  `tests/infrastructure/clinical-repository.integration.test.ts`, cobrindo
  create/get/list/update de avaliação, get/set/replace/clear de acompanhamento,
  reabertura, mesma data, isolamento, conflito e rollback; nenhuma projeção
  deve ser gravada (FR-001, FR-005–FR-006, FR-009–FR-017, NFR-001–NFR-002,
  SC-002).
- [X] T007 Implementar a porta única `ClinicalRepository` em
  `src/lib/persistence/clinical-repository.ts` e seu adaptador PGlite em
  `src/lib/infrastructure/local-db/clinical-repository.ts`; executar T006 e
  preservar operações transacionais e filtros por Conta + paciente (FR-014,
  FR-015, FR-017, FR-020).
- [X] T008 [P] Escrever testes da fachada e dos read models clínicos em
  `tests/application/patients/clinical-application.test.ts`, cobrindo Conta
  ausente, paciente inexistente/arquivado, input sem autoridade sobre
  resultados, erros tipados e preservação do formulário/estado confirmado
  (FR-015–FR-017, FR-020–FR-021, NFR-002).
- [X] T009 Estender o `PatientApplication`, o `PatientProfileReader` e a
  composição do navegador em `src/lib/application/composition-root.ts`,
  `src/lib/application/patients/patient-profile-reader.ts` e
  `src/lib/application/browser-composition.ts`; fazer T008 passar sem criar
  `ClinicalApplication` ou `ClinicalProjectionReader` (FR-007–FR-008,
  FR-012–FR-016, FR-020).

**Checkpoint**: migration, domínio, repositório e fachada existente estão
disponíveis; nenhum fluxo de UI lê o novo banco diretamente.

## Phase 2 — Avaliações físicas

**Goal**: criar, reencontrar e editar avaliações sem duplicação ou sobrescrita.

- [X] T010 [P] Escrever/ajustar testes de `useAssessmentWorkspacePage` e da
  rota em `tests/hooks/useAssessmentWorkspacePage.test.ts` e
  `tests/app/pacientes/assessment-persistence.test.tsx`, cobrindo criação,
  reload, loading, empty, validação, Ctrl+S, duplo envio, erro recuperável e
  navegação somente após sucesso (FR-001–FR-008, FR-021–FR-023, SC-001).
- [X] T011 Refatorar `src/hooks/useAssessmentWorkspacePage.ts` e a rota
  `src/app/pacientes/[id]/avaliacao/[assessmentId]/page.tsx` para usar a
  `PatientApplication`; preservar campos, cálculo, comparação, preenchimento
  assistido, dirty state e descarte; executar T010 (FR-002–FR-008, FR-022).
- [X] T012 [P] Escrever testes de edição do modal e do perfil em
  `tests/components/molecules/edit-assessment-modal.test.tsx` e
  `tests/app/pacientes/patient-clinical-profile.test.tsx`, cobrindo edição
  isolada, cancelamento, conflito, paciente arquivado, foco e modal aberto em
  erro (FR-005–FR-006, FR-016, FR-021–FR-022, NFR-005).
- [X] T013 Atualizar `src/hooks/usePatientProfilePage.ts`,
  `src/components/molecules/EditAssessmentModal.tsx` e os adapters de
  apresentação necessários para salvar a avaliação selecionada com `version`,
  recarregar a projeção após sucesso e manter o draft em falha; executar T012
  (FR-002, FR-005–FR-008, FR-016, FR-021–FR-022).

**Checkpoint**: avaliação válida persiste e reabre; edição altera somente a
linha escolhida; conflito, cancelamento e arquivamento não alteram dados.

## Phase 3 — Acompanhamento e projeções

**Goal**: persistir o próximo acompanhamento e alimentar todas as leituras
atuais pelas mesmas fontes confirmadas.

- [X] T014 [P] Escrever testes do acompanhamento em
  `tests/components/molecules/next-event-modal.test.tsx` e
  `tests/app/pacientes/patient-follow-up.test.tsx`, cobrindo criar, substituir,
  remover, confirmação de descarte, saving, falha, conflito, foco e estados
  sem data/futuro/hoje/atrasado após reload (FR-009–FR-012, FR-021–FR-023,
  NFR-005, SC-003).
- [X] T015 Adaptar `src/components/molecules/NextEventModal.tsx` e
  `src/hooks/usePatientProfilePage.ts` para os comandos canônicos, mantendo o
  último valor confirmado em erro e convertendo enums sem perder `version`;
  executar T014 (FR-009–FR-012, FR-016, FR-021–FR-022).
- [X] T016 [P] Escrever testes de perfil, lista, atividade e consulta em
  `tests/infrastructure/clinical-projections.integration.test.ts`,
  `tests/app/pacientes/consultation-projection.test.tsx` e nos testes existentes
  de lista; cobrir latest/previous, deltas, contagens, ordem determinística,
  empate de data, batch sem N+1, dietas confirmadas, ausência de drafts,
  paciente arquivado e consulta sem `ConsultationRecord` (FR-007–FR-008,
  FR-012–FR-018, FR-024, SC-005).
- [X] T017 Implementar as projeções no `PatientProfileReader` e na aplicação,
  usando leitura batch para a lista e o leitor de dietas existente; adaptar
  `src/hooks/usePatientProfilePage.ts`, `src/hooks/usePatientsPage.ts`,
  `src/lib/patientProfileSelectors.ts`, `src/lib/patientListView.ts` e
  `src/app/pacientes/[id]/consulta/[date]/page.tsx`; executar T016 sem gravar
  atividade ou consulta (FR-007, FR-012–FR-014, FR-018, FR-020, FR-024,
  NFR-003).

**Checkpoint**: perfil, lista, histórico e consulta exibem os mesmos registros
confirmados; o acompanhamento tem no máximo uma linha por paciente.

## Phase 4 — Cutover e validação

**Goal**: fechar a fronteira do legado e demonstrar integridade local completa.

- [X] T018 [P] Estender `tests/architecture/patient-persistence-boundary.test.ts`
  para exigir zero leitura/escrita de `legacyClinicalStore`, operações clínicas
  de `patientsStore`, `nutridiet_assessments_*` e `getConsultationRecord` pelos
  fluxos canônicos (FR-019–FR-020, SC-009).
- [X] T019 Remover os consumidores clínicos legados de
  `src/hooks/useAssessmentWorkspacePage.ts`, `src/hooks/usePatientProfilePage.ts`,
  `src/hooks/usePatientsPage.ts`, `src/app/pacientes/[id]/consulta/[date]/page.tsx`
  e isolar/remover somente os exports de persistência em
  `src/lib/patientsStore.ts`, `src/lib/legacyClinicalStore.ts` e
  `src/lib/consultationStorageUtils.ts`; preservar helpers puros e fazer T018
  passar (FR-019–FR-020, NFR-006).
- [X] T020 [P] Executar/ajustar testes de estados e acessibilidade existentes
  para loading, empty, saving, success, validation, conflict, archived,
  transaction-error, retry, teclado, foco e saída com alterações; não alterar
  tokens ou componentes base do design system (FR-002, FR-008, FR-021–FR-023,
  NFR-005, SC-006).
- [X] T021 [P] Criar `tests/performance/clinical-profile.perf.test.ts` com
  centenas de pacientes e milhares de avaliações, medindo resumo batch, perfil
  e confirmações; comprovar o alvo de 95% em até 1 segundo (NFR-003, SC-007).
- [X] T022 [P] Criar `tests/browser/clinical-persistence.spec.ts` em uma única
  aba para criar/editar avaliação, conflito, acompanhamento, consulta,
  arquivamento, isolamento, reload e rede desativada após preparação; confirmar
  ausência das chaves legadas (NFR-004–NFR-005, SC-001, SC-004, SC-006,
  SC-008–SC-009).
- [X] T023 Executar a validação da feature conforme `quickstart.md`, registrar
  comandos, ambiente, resultados e limitações em
  `specs/11-09-26-persistencia-avaliacoes-acompanhamento/validation-report.md`
  e só marcar a etapa como validada quando não houver regressão introduzida
  (FR-023, NFR-006–NFR-007).

## Traceability

- `FR-001`–`FR-008` → T002–T003, T006–T013.
- `FR-009`–`FR-012` → T002–T003, T006–T007, T014–T015.
- `FR-013`–`FR-018` → T006–T009, T016–T017.
- `FR-019`–`FR-020` → T018–T019.
- `FR-021`–`FR-024` → T008, T010–T017, T020, T023.
- `NFR-001`–`NFR-002` → T004, T006–T009, T016.
- `NFR-003`–`NFR-005` → T016–T017, T020–T022.
- `NFR-006`–`NFR-007` → T001, T004–T005, T018–T023.
- `SC-001`–`SC-009` → T010–T023, conforme os cenários indicados acima.

## Dependencies and execution order

```text
Foundation (T001–T009)
        ↓
Assessments (T010–T013) ──┐
                          ├── Projections (T016–T017)
Follow-up (T014–T015) ────┘              ↓
                              Cutover/validation (T018–T023)
```

Dentro de cada grupo, testes precedem a implementação. T001/T002/T004/T006/T008,
T010/T012/T014/T016 e T018/T020/T021/T022 podem ser preparados em paralelo
quando não editarem o mesmo arquivo. T023 é sempre o último passo.

## Notes

- Não implementar `ConsultationRecord`, agenda, backup, login, sincronização,
  outbox, exportação ou migração dos dados legados.
- Projeções derivadas não recebem tabelas, updates ou transações próprias.
- Não criar `ClinicalApplication`, `ClinicalProjectionReader`, inventário manual
  ou log intermediário para compensar a remoção dessas camadas.
- Preservar rotas, campos, fórmulas e componentes existentes; mudanças visuais
  ficam limitadas aos estados de persistência e acessibilidade exigidos.

## Phase 5: Convergence

- [X] T024 Estender `tests/browser/clinical-persistence.spec.ts` para cobrir,
  na mesma aba e após a preparação local, edição de avaliação, conflito de
  versão, criação/substituição/remoção de acompanhamento, consulta por data,
  arquivamento e isolamento entre pacientes, mantendo as asserções de reload,
  offline e ausência das chaves legadas conforme T022 / SC-001, SC-003–SC-004,
  SC-006, SC-008–SC-009 (partial).
