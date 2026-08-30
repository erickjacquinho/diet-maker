---

description: "Task list for the local Account and patient persistence stage"

---

# Tasks: Conta e pacientes

**Input**: Design documents from `specs/30-08-26-dieta-db-segunda-etapa/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/patient-application.md](./contracts/patient-application.md), [quickstart.md](./quickstart.md)

**Scope**: Integrar Conta local e pacientes ao adaptador aprovado na etapa 1; não implementar persistência de dietas, avaliações, acompanhamentos, drafts ou backup.

**Tests**: Obrigatórios pela especificação, pela constituição e pelo contrato test-first. Os testes devem ser escritos antes da implementação correspondente e permanecer determinísticos sob `tests/`.

**Organization**: Tasks are grouped by user story to enable independent implementation and validation of each journey.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar os módulos, fixtures e composição sem alterar ainda o comportamento clínico.

- [x] T001 [skill: $backend-architect-ddd] [P] Criar os diretórios e pontos de exportação de `src/lib/domain/index.ts`, `src/lib/application/patients/index.ts`, `src/lib/persistence/index.ts` e `src/lib/infrastructure/local-db/index.ts`, mantendo imports unidirecionais e sem React no domínio.
- [x] T002 [skill: $tdd] [P] Criar a fixture sintética e o reset controlado em `tests/fixtures/patients/account-patient-fixtures.ts` e `tests/fixtures/patients/reset-local-db.ts`, incluindo duas Contas, pacientes ativos/arquivados, objetivos e registros relacionados somente para preservação.
- [x] T003 [skill: $tdd] [P] Criar o contexto de teste reutilizável em `tests/lib/patients/test-context.ts`, conectando a fixture ao adaptador aprovado na etapa 1 e expondo limpeza/reabertura sem ler chaves legadas.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fixar o domínio, as portas, o schema mínimo, os erros, a transação e o contexto de Conta antes das jornadas.

**⚠️ CRITICAL**: Nenhuma tarefa de User Story pode começar antes deste checkpoint e da confirmação do portão aprovado da etapa 1.

### Tests for Foundation

- [x] T004 [skill: $tdd] [P] Escrever primeiro as invariantes de Account, ObjectiveOption e Patient em `tests/lib/patients/domain-invariants.test.ts`, cobrindo normalização, valores numéricos, identidade imutável, versão e estado arquivado.
- [x] T005 [skill: $tdd] [P] Escrever primeiro os contratos de escopo, atomicidade e erro em `tests/lib/patients/patient-application.contract.test.ts`, cobrindo paciente inexistente, Conta incorreta, versão obsoleta e falha sem mutação parcial.
- [x] T006 [skill: $frontend-architecture-mindset] [P] Escrever primeiro o teste de fronteira arquitetural em `tests/architecture/patient-persistence-boundary.test.ts`, assegurando que rotas/componentes não importem storage físico e que o modelo não contenha arrays canônicos de histórico.

### Implementation for Foundation

- [x] T007 [skill: $backend-architect-ddd] [P] Definir os tipos de domínio, normalizadores e validadores em `src/lib/domain/account.ts`, `src/lib/domain/objective-option.ts` e `src/lib/domain/patient.ts`, refletindo `data-model.md` sem tipos do adaptador ou React.
- [x] T008 [skill: $backend-architect-ddd] [P] Definir erros tipados e portas em `src/lib/application/patients/patient-errors.ts`, `src/lib/persistence/account-context.ts`, `src/lib/persistence/patient-repository.ts`, `src/lib/persistence/objective-catalog-repository.ts`, `src/lib/persistence/patient-profile-reader.ts` e `src/lib/persistence/transaction-runner.ts`, conforme `contracts/patient-application.md`.
- [x] T009 [skill: $database-migrations-pro] Implementar o schema/migration mínimo e o executor transacional de Account, ObjectiveOption e Patient em `src/lib/infrastructure/local-db/schema.ts`, `src/lib/infrastructure/local-db/migrations.ts` e `src/lib/infrastructure/local-db/transaction-runner.ts`, usando somente o adaptador aprovado pela etapa 1 e restrições de escopo/versionamento.
- [x] T010 [skill: $backend-architect-ddd] Implementar os adaptadores de Account, pacientes e objetivos em `src/lib/infrastructure/local-db/account-context.ts`, `src/lib/infrastructure/local-db/patient-repository.ts` e `src/lib/infrastructure/local-db/objective-catalog-repository.ts`, incluindo relações, filtros ativos e falha fechada em Conta inválida.
- [x] T011 [skill: $backend-architect-ddd] Implementar a composição da Conta ativa, o leitor de perfil e o composition root em `src/lib/application/account/get-active-account.ts`, `src/lib/application/patients/patient-profile-reader.ts` e `src/lib/application/composition-root.ts`, deixando explícita a fronteira para leitores futuros de dieta/avaliação/acompanhamento; o caso de uso `getPatientProfile` será implementado na US2.

**Checkpoint**: domínio, portas, fixture, schema, transação, contexto de Conta e testes de fronteira estão revisáveis; nenhuma rota ainda grava em `localStorage` ou acessa o adaptador diretamente.

---

## Phase 3: User Story 1 - Manter a Conta local ativa (Priority: P1)

**Goal**: Disponibilizar uma Conta local estável e impedir acesso de pacientes fora do contexto proprietário.

**Independent Test**: Abrir uma base limpa, obter o contexto, reabrir a aplicação e confirmar que o mesmo `accountId` permanece associado ao paciente; tentar a mesma leitura com outra Conta e observar rejeição sem exposição.

### Tests for User Story 1

- [x] T012 [skill: $tdd] [P] [US1] Escrever primeiro os cenários de inicialização, reabertura e isolamento de Conta em `tests/lib/patients/account-context.integration.test.ts`, cobrindo identidade estável, Conta ausente e tentativa cross-account.
- [x] T013 [skill: $webapp-testing] [P] [US1] Escrever primeiro o cenário local sem rede após preparação dos recursos em `tests/app/pacientes/account-offline.test.tsx`, distinguindo recurso não preparado de falha do banco local.

### Implementation for User Story 1

- [x] T014 [skill: $backend-architect-ddd] [US1] Implementar `AccountContext` ativo, carregamento idempotente do perfil local e erro bloqueante em `src/lib/application/account/account-context.ts`, usando o repositório e a transação definidos na Foundation.
- [x] T015 [skill: $nextjs-fullstack-master] [US1] Integrar o contexto ativo ao bootstrap da aplicação em `src/lib/application/composition-root.ts` e `src/app/layout.tsx`, bloqueando operações de pacientes quando a Conta não puder ser validada.
- [x] T016 [skill: $webapp-testing] [US1] Executar a validação independente de reabertura, isolamento e offline em `tests/lib/patients/account-context.integration.test.ts`, `tests/app/pacientes/account-offline.test.tsx` e `specs/30-08-26-dieta-db-segunda-etapa/validation-report.md`, registrando resultados observáveis no relatório da etapa.

**Checkpoint**: o contexto de Conta é estável, validado e reutilizável; nenhuma operação aceita `accountId` arbitrário da interface.

---

## Phase 4: User Story 2 - Cadastrar e encontrar pacientes ativos (Priority: P1)

**Goal**: Criar pacientes válidos, listá-los no estado ativo, filtrar por nome/objetivo e abrir o perfil sem acessar o storage legado.

**Independent Test**: Criar pacientes na fixture limpa, reabrir `/pacientes`, pesquisar, limpar a busca e abrir `/pacientes/[id]`; validar estados loading, primeiro empty, filtered empty, erro e não encontrado.

### Tests for User Story 2

- [x] T017 [skill: $tdd] [P] [US2] Escrever primeiro os cenários de criação, normalização, listagem, busca, consulta de perfil e erros em `tests/lib/patients/create-list.integration.test.ts`, incluindo nome inválido, valores inválidos e Conta incorreta.
- [x] T018 [skill: $webapp-testing] [P] [US2] Atualizar os testes de jornada e estados da rota em `tests/app/pacientes/page.test.tsx` e criar `tests/app/pacientes/patient-profile-read.test.tsx`, cobrindo listagem ativa, loading, empty, filtered empty, retry, não encontrado e navegação por teclado.

### Implementation for User Story 2

- [x] T019 [skill: $backend-architect-ddd] [P] [US2] Implementar os casos de uso `createPatient`, `listActivePatients` e `getPatientProfile` em `src/lib/application/patients/create-patient.ts`, `src/lib/application/patients/list-active-patients.ts` e `src/lib/application/patients/get-patient-profile.ts`, com validação, IDs, escopo e resultados tipados.
- [x] T020 [skill: $frontend-architecture-mindset] [US2] Adaptar as projeções puras de listagem em `src/lib/patientListView.ts` e `src/lib/patientListHistoryUtils.ts` para receber `PatientListRow`/leitores relacionados sem usar `Patient.dietHistory`, `Patient.bodyAssessments` ou `lastConsultation` como fontes canônicas.
- [x] T021 [skill: $nextjs-fullstack-master] [US2] Criar o orquestrador de estado da lista em `src/hooks/usePatientsPage.ts` e migrar `src/app/pacientes/page.tsx` para carregar casos de uso, apresentar feedback, retry, contagem, busca e criação sem acesso direto a storage.
- [x] T022 [skill: $ui-styling] [US2] Adequar `src/components/molecules/CreatePatientModal.tsx` e `src/components/organisms/PatientListTable.tsx` para payload tipado, validação associada ao campo, loading/erro, foco inicial/retorno e navegação acessível, preservando os primitivos `src/components/ui/*`.
- [x] T023 [skill: $nextjs-fullstack-master] [US2] Integrar o perfil de leitura em `src/app/pacientes/[id]/page.tsx`, `src/app/pacientes/[id]/PatientProfileModals.tsx` e `src/hooks/usePatientProfilePage.ts`, mantendo estado não encontrado sem controles de mutação e preservando leitores clínicos futuros por portas separadas.

**Checkpoint**: cadastro, lista, busca e perfil funcionam independentemente sobre a Conta ativa e não leem/gravam chaves legadas.

---

## Phase 5: User Story 3 - Editar o cadastro sem alterar o histórico (Priority: P1)

**Goal**: Editar dados atuais em formulário temporário, confirmar com versionamento e preservar registros clínicos relacionados.

**Independent Test**: Abrir edição, cancelar, descartar e salvar; repetir com versão obsoleta e com fixture contendo filhos, confirmando que somente o cadastro atual muda.

### Tests for User Story 3

- [x] T024 [skill: $tdd] [P] [US3] Escrever primeiro os cenários de atualização, cancelamento, descarte, incremento de versão, conflito e preservação de filhos em `tests/lib/patients/update-patient.integration.test.ts`.
- [x] T025 [skill: $tdd] [P] [US3] Atualizar o teste de componente em `tests/components/molecules/edit-patient-modal.test.tsx` para dirty state, `Esc`/backdrop, `aria-describedby`, loading, erro recuperável e retorno de foco.

### Implementation for User Story 3

- [x] T026 [skill: $backend-architect-ddd] [US3] Implementar `updatePatient` com versão esperada, validação e transação em `src/lib/application/patients/update-patient.ts` e `src/lib/infrastructure/local-db/patient-repository.ts`, rejeitando arquivado, inexistente e cross-account sem sobrescrita.
- [x] T027 [skill: $nextjs-fullstack-master] [US3] Refatorar `src/hooks/usePatientProfilePage.ts` para chamar o caso de uso de atualização, atualizar projeções após sucesso e traduzir conflito/persistência em feedback sem perder o formulário.
- [x] T028 [skill: $ui-styling] [US3] Adequar `src/components/molecules/EditPatientModal.tsx` para manter rascunho isolado, enviar versão, validar campos, desabilitar duplo envio e tratar cancelamento/fechamento conforme o contrato de overlay.
- [x] T029 [skill: $frontend-architecture-mindset] [US3] Confirmar que `src/lib/patientProfileSelectors.ts` e as projeções de perfil não recalculam ou reescrevem dietas/avaliações por alteração de cadastro, usando fixtures separadas de registros relacionados.

**Checkpoint**: edição explícita atualiza somente Patient, conflitos são recuperáveis e nenhum histórico relacionado é regravado.

---

## Phase 6: User Story 4 - Usar objetivos da Conta sem duplicidade (Priority: P2)

**Goal**: Adicionar e reutilizar objetivos personalizados da Conta com normalização e idempotência, sem atualizar paciente antes do salvamento do cadastro.

**Independent Test**: Adicionar um objetivo, repetir com espaços/caixa equivalentes, aplicá-lo ao formulário, cancelar e retirar a opção; comparar catálogo e pacientes antes/depois.

### Tests for User Story 4

- [x] T030 [skill: $tdd] [P] [US4] Escrever primeiro os cenários de catálogo, normalização, idempotência, cancelamento, falha e preservação do valor já salvo em `tests/lib/patients/objective-catalog.integration.test.ts`.
- [x] T031 [skill: $ui-styling] [P] [US4] Criar o teste de componente do modal em `tests/components/molecules/add-objective-modal.test.tsx`, cobrindo foco, label, campo vazio, cancelamento, envio, loading e erro sem fechar prematuramente.

### Implementation for User Story 4

- [x] T032 [skill: $backend-architect-ddd] [US4] Implementar `addObjectiveOption` e a remoção/arquivamento seguro do catálogo em `src/lib/application/patients/add-objective-option.ts` e `src/lib/infrastructure/local-db/objective-catalog-repository.ts`, com chave normalizada por Conta e transação.
- [x] T033 [skill: $ui-styling] [US4] Integrar catálogo e seleção ao perfil em `src/hooks/usePatientProfilePage.ts`, `src/components/molecules/AddObjectiveModal.tsx` e `src/components/molecules/EditPatientModal.tsx`, aplicando a opção somente ao rascunho até `updatePatient` confirmar.
- [x] T034 [skill: $nextjs-fullstack-master] [US4] Atualizar a projeção de objetivos e estados de erro em `src/app/pacientes/[id]/PatientProfileModals.tsx` e `src/app/pacientes/[id]/page.tsx`, mantendo o modal de edição aberto quando a criação de opção falhar.

**Checkpoint**: objetivo personalizado é reutilizável e idempotente dentro da Conta, sem duplicar ou mutar pacientes por engano.

---

## Phase 7: User Story 5 - Arquivar e preservar o paciente (Priority: P1)

**Goal**: Trocar exclusão física por arquivamento lógico, bloquear novos registros clínicos e preservar histórico, com contrato de restauração sem tela administrativa.

**Independent Test**: Arquivar paciente com filhos, observar lista ativa e bloqueio de mutações, verificar preservação e executar `restorePatient` pelo harness/porta.

### Tests for User Story 5

- [x] T035 [skill: $tdd] [P] [US5] Escrever primeiro os cenários de arquivamento, confirmação prolongada, cancelamento, preservação de filhos, bloqueio clínico, conflito, falha e restauração em `tests/lib/patients/archive-restore.integration.test.ts`.
- [x] T036 [skill: $webapp-testing] [P] [US5] Criar os testes de interação do perfil em `tests/app/pacientes/archive-patient.test.tsx` e atualizar `tests/app/pacientes/patient-profile-accessibility.test.tsx`, cobrindo copy, foco, teclado, navegação pós-sucesso e ausência de controles em não encontrado.

### Implementation for User Story 5

- [x] T037 [skill: $backend-architect-ddd] [US5] Implementar `archivePatient` e `restorePatient` com versionamento, escopo, preservação de relações e guarda contra mutação clínica em `src/lib/application/patients/archive-patient.ts`, `src/lib/application/patients/restore-patient.ts` e `src/lib/infrastructure/local-db/patient-repository.ts`.
- [x] T038 [skill: $nextjs-fullstack-master] [US5] Refatorar `src/hooks/usePatientProfilePage.ts`, `src/app/pacientes/[id]/page.tsx` e `src/app/pacientes/[id]/PatientProfileModals.tsx` para usar arquivamento, invalidar a fronteira de drafts futuros sem implementá-los e navegar somente após sucesso durável.
- [x] T039 [skill: $ui-styling] [US5] Alterar `src/components/molecules/DeletePatientModal.tsx` para copy e callback de arquivamento, confirmação prolongada, label acessível e feedback que informe preservação do histórico; manter o primitive Shadcn/Radix limpo.
- [x] T040 [skill: $frontend-architecture-mindset] [US5] Ajustar `src/components/organisms/PatientListTable.tsx`, `src/lib/patientListView.ts` e `src/lib/patientProfileSelectors.ts` para excluir arquivados das projeções ativas e evitar ações de edição/novo registro fora do estado permitido.

**Checkpoint**: o paciente é arquivado, não apagado; filhos permanecem; novas mutações clínicas são bloqueadas; restauração é exercitável por contrato.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Remover o legado do fluxo, alinhar documentação visual, executar gates e registrar evidência para revisão humana.

- [x] T041 [skill: $backend-architect-ddd] [P] Retirar os caminhos de persistência de pacientes e objetivos do legado em `src/lib/patientsStore.ts` e `src/hooks/usePatientProfilePage.ts`, mantendo `src/lib/storage.ts` somente para módulos fora desta etapa até sua migração própria e garantindo zero dual-write/fallback no fluxo de pacientes.
- [x] T042 [skill: $design-system] [P] Atualizar o perfil de componente alterado em `design-system/components/profiles/molecules/delete-patient-modal.md`, refletindo arquivamento, preservação, `HoldToDeleteButton`/confirmação prolongada e estados acessíveis; manter `design-system/components/registry.json` consistente com exports e consumidores.
- [x] T043 [skill: $security-audit] [P] Adicionar a auditoria de ausência de chaves legadas e de imports proibidos em `tests/architecture/patient-persistence-boundary.test.ts` e `tests/lib/patients/legacy-cutover.test.ts`, cobrindo `nutridiet_patients`, `diet_maker_custom_objectives` e acessos correlatos.
- [x] T044 [skill: $design-system] [P] Consolidar critérios de acessibilidade, desktop, tokens, overlays, fields, data-display e loading em `tests/design-system/patient-flow-contract.test.ts`, sem alterar `src/components/ui/*`.
- [x] T045 [skill: $webapp-testing] Executar `npm run type-check`, `npm run lint`, `npm test`, `npm run verify:links`, `npm run audit:atomic-design`, `npm run verify:design-system` e os cenários do `quickstart.md`, medindo lista/perfil/filtragem na fixture de centenas de pacientes contra o limite de 1 segundo e registrando comandos, resultados, tempos e limitações em `specs/30-08-26-dieta-db-segunda-etapa/validation-report.md`.
- [x] T046 [skill: $speckit-analyze] Executar uma revisão final de rastreabilidade em `specs/30-08-26-dieta-db-segunda-etapa/validation-report.md`, mapeando FR/NFR → testes → arquivos, distinguindo proposto, implementado, conforme e itens explicitamente deixados para SDDs posteriores.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências; T001–T003 podem ocorrer em paralelo.
- **Foundational (Phase 2)**: depende de Setup e da aprovação do portão da etapa 1; bloqueia todas as histórias.
- **US1 (Phase 3)**: depende da Foundation; valida o contexto de Conta antes de qualquer mutação de paciente.
- **US2 (Phase 4)**: depende da Foundation e do AccountContext de US1; entrega o primeiro fluxo clínico utilizável.
- **US3 (Phase 5)**: depende de US2 para editar um paciente criado e preservar suas relações.
- **US4 (Phase 6)**: depende da Foundation e da composição de formulário de US2/US3; pode ser validada isoladamente com catálogo limpo.
- **US5 (Phase 7)**: depende de US2 para listar/perfilar e da fixture de relações; usa os contratos de restauração sem criar tela administrativa.
- **Polish (Phase 8)**: depende de todas as histórias desejadas e consolida o gate documental/técnico.

### User Story Dependencies

- **US1 (P1)**: depende apenas da Foundation; é o gate de propriedade da Conta.
- **US2 (P1)**: depende de US1 para o contexto, mas é independentemente demonstrável com fixture limpa.
- **US3 (P1)**: depende de US2 para ter Patient persistido e perfil editável.
- **US4 (P2)**: depende da Foundation; integra com os formulários de US2/US3, mas o catálogo tem teste independente.
- **US5 (P1)**: depende de US2 para o perfil/lista e da fixture com filhos; restauração é contrato/harness nesta etapa.

### Parallel Opportunities

- T001–T003 são independentes após a confirmação da pasta e do adaptador.
- T004–T006 são testes de fundação em arquivos distintos e podem ser escritos em paralelo.
- T007–T008 podem ocorrer em paralelo; T009–T011 dependem dos tipos/portas e do resultado da etapa 1.
- T012–T013 são testes independentes da US1.
- T017–T018 são testes independentes da US2; T019 e T020 podem ser preparados em arquivos distintos antes da integração de T021–T023.
- T024–T025 são testes independentes da US3.
- T030–T031 são testes independentes da US4.
- T035–T036 são testes independentes da US5.
- T041–T044 são tarefas de polimento em arquivos distintos; T045–T046 dependem de todas as alterações.

## Implementation Strategy

### MVP First

1. Completar Setup e Foundation.
2. Entregar US1 para validar a Conta e o isolamento.
3. Entregar US2 para criar/listar/abrir pacientes, formando o MVP clínico da etapa.
4. Parar e validar US1 + US2 independentemente antes de avançar para edição, catálogo e arquivamento.

### Incremental Delivery

1. Foundation pronta → AccountContext validado.
2. US1 + US2 → cadastro e lista de pacientes persistidos, demonstráveis sem legado.
3. US3 → edição segura com conflito e preservação de histórico.
4. US4 → catálogo de objetivos reutilizável e idempotente.
5. US5 → arquivamento/restauração contratual sem apagar histórico.
6. Polish → auditorias, quickstart, evidências e gate final; nenhum SDD posterior é iniciado sem validação humana.

## Notes

- Cada task tem ID sequencial, checkbox, labels exigidos quando aplicáveis, arquivo/resultado esperado e verificação observável.
- A execução deve passar por `/speckit-implement`; este documento não autoriza implementação nesta etapa do fluxo SDD.
- Tarefas não criam persistência de dietas, avaliações, acompanhamentos, drafts ou backup; esses limites pertencem aos SDDs 3–6 de `refs/dieta-db/`.
