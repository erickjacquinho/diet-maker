---

description: "Tarefas mínimas para a Fase 6 de backup manual simples"
---

# Tasks: Backup manual simples

**Input**: Design documents from `/specs/12-09-26-backup-manual-simples/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Incluídos antes das implementações correspondentes por exigência de test-first e pelos critérios de integridade/rollback.

**Strategy**: Reutilizar schema, runtime, draft store, barra lateral e Dialog existentes. Não criar rota, tabela, organismo, schema paralelo ou registry global.

## Phase 1: Setup

**Purpose**: Preparar o contrato de corte e os fixtures mínimos.

- [x] T001 [skill: $code-reviewer-expert] Inventariar consumidores de `src/lib/infrastructure/local-db/logical-export-schema.ts`, rótulos `.diet` em `src/components/molecules/SidebarQuickActions.tsx`/`SidebarUserProfile.tsx` e fontes canônicas em `tests/architecture/backup-persistence-boundary.test.ts`.
- [x] T002 [skill: $tdd] [P] Criar fixture de Conta completa, Conta vazia, arquivados, snapshots, registros clínicos, biblioteca, dietas e draft em `tests/fixtures/backup.ts` e helper de banco/arquivo em `tests/helpers/backup.ts`.

## Phase 2: Foundational

**Purpose**: Fixar envelope, validação, port, transação e bloqueio de drafts antes das jornadas.

**CRITICAL**: Nenhuma user story começa antes desta fase estar verde.

- [x] T003 [skill: $tdd] [P] Escrever testes de envelope, tipos, versão, identidade `local-account`, chaves desconhecidas, IDs, escopos, relações e dieta vigente única em `tests/lib/backup.test.ts`.
- [x] T004 [skill: $backend-architect-ddd] Definir `BackupEnvelope`, tipos de erro e o port em `src/lib/persistence/backup-repository.ts` e `src/lib/infrastructure/local-db/logical-export-schema.ts`, mantendo um único contrato `.nutridiet`.
- [x] T005 [skill: $backend-architect-ddd] Implementar parse e validação pura no único módulo `src/lib/application/backup-application.ts`, fazendo T003 passar sem executar SQL, código ou conteúdo do arquivo.
- [x] T006 [skill: $tdd] [P] Escrever testes de leitura consistente, cobertura das 17 tabelas, arrays vazios, arquivados, snapshots, substituição e rollback em `tests/infrastructure/backup-repository.integration.test.ts`.
- [x] T007 [skill: $backend-architect-ddd] Implementar leitura e substituição transacional por Conta em `src/lib/infrastructure/local-db/backup-repository.ts`, usando `src/lib/infrastructure/local-db/schema.ts`, com deleção reversa de FKs e inserção por dependência.
- [x] T008 [skill: $tdd] [P] Escrever teste de consulta por Conta e bloqueio de draft editável em `tests/infrastructure/backup-drafts.integration.test.ts`.
- [x] T009 [skill: $backend-architect-ddd] Adicionar `listRecoverableByAccount` ao contrato e ao adapter de `src/lib/application/diets/diet-ports.ts` e `src/lib/infrastructure/diet-drafts/indexed-db-diet-draft-store.ts`; bloquear restore sem apagar drafts.
- [x] T010 [skill: $frontend-architecture-mindset] Compor `backupApplication` em `src/lib/application/browser-composition.ts` e garantir que a UI receba somente o caso de uso, nunca o banco.
- [x] T011 [skill: $code-reviewer-expert] Criar/ajustar `tests/architecture/backup-persistence-boundary.test.ts` para proibir localStorage legado, `.diet` concorrente e acesso direto da UI ao adapter.

**Checkpoint**: Contrato, validação, adapter, rollback, draft guard e composição estão prontos.

## Phase 3: User Story 1 — Exportar backup da Conta (P1 / MVP)

**Goal**: Baixar um `.nutridiet` consistente com todos os dados confirmados e nenhum draft.

**Independent Test**: Exportar uma Conta fixture completa, parsear o arquivo e comparar as 17 tabelas e relações com a base, incluindo arquivados e snapshots.

- [x] T012 [skill: $tdd] [P] Escrever testes de exportação, serialização UTF-8, extensão, arrays vazios e falha sem mutação em `tests/application/backup-application.test.ts`.
- [x] T013 [skill: $backend-architect-ddd] [US1] Implementar exportação e erro acionável em `src/lib/application/backup-application.ts`, delegando a captura ao port e excluindo drafts.
- [x] T014 [skill: $ui-styling] [US1] Conectar o callback de exportação a `src/app/navigation/SidebarNavigationAdapter.tsx`, `src/components/organisms/SidebarNav.tsx`, `src/components/molecules/SidebarQuickActions.tsx` e `src/components/molecules/SidebarUserProfile.tsx`, migrando labels `.diet` para `Exportar backup`.
- [x] T015 [skill: $tdd] [US1] Atualizar os testes de ações em `tests/components/molecules/sidebar-quick-actions.test.tsx`, `tests/components/molecules/sidebar-user-profile.test.tsx` e `tests/components/organisms/sidebar-nav.test.tsx` para o contrato `.nutridiet`.
- [x] T016 [skill: $webapp-testing] [US1] Cobrir exportação, download, ausência de drafts, ausência de requests e tempo do fluxo em `tests/browser/backup-persistence.spec.ts`.

**Checkpoint**: MVP de exportação demonstrável e independente da restauração.

## Phase 4: User Story 2 — Restaurar backup com segurança (P1)

**Goal**: Validar e substituir atomicamente a Conta local, sem mesclagem nem importação parcial.

**Independent Test**: Restaurar arquivo válido após alterar a base e verificar igualdade após reload; repetir com arquivo inválido, draft e falha transacional.

- [x] T017 [skill: $tdd] [P] Completar testes de restore para arquivo malformado/incompatível, Conta divergente, IDs duplicados, relações inválidas, dieta vigente duplicada, cancelamento e confirmação em `tests/application/backup-application.test.ts`.
- [x] T018 [skill: $backend-architect-ddd] [US2] Implementar restauração, bloqueio por drafts, confirmação de domínio e classificação de erros em `src/lib/application/backup-application.ts`.
- [x] T019 [skill: $tdd] [US2] Completar o teste de substituição, ordem de escrita e rollback em `tests/infrastructure/backup-repository.integration.test.ts` antes de liberar o adapter.
- [x] T020 [skill: $backend-architect-ddd] [US2] Integrar restore ao adapter transacional de `src/lib/infrastructure/local-db/backup-repository.ts`, preservando a base anterior em toda falha.
- [x] T021 [skill: $ui-styling] [US2] Compor input `.nutridiet`, estados e confirmação de substituição total usando os primitivos existentes em `src/app/navigation/SidebarNavigationAdapter.tsx` e `src/components/ui/dialog.tsx`, sem criar novo organismo.
- [x] T022 [skill: $webapp-testing] [US2] Cobrir restore válido, reload, arquivo inválido, draft pendente, rollback, cancelamento e offline em `tests/browser/backup-persistence.spec.ts`.

**Checkpoint**: Exportação e restauração funcionam juntas com rollback verificável.

## Phase 5: User Story 3 — Compreender os limites do backup (P2)

**Goal**: Comunicar ausência de senha/criptografia, exclusão de drafts, substituição total e responsabilidade de guarda.

**Independent Test**: Operar os fluxos por teclado e verificar os avisos e estados de erro acessíveis.

- [x] T023 [skill: $tdd] [P] Escrever testes de conteúdo, foco, teclado, estados loading/error/disabled e ausência de logs clínicos em `tests/app/backup-actions.test.tsx` e `tests/application/backup-application.test.ts`.
- [x] T024 [skill: $ui-styling] [US3] Implementar mensagens, estados acessíveis e limites do backup em `src/app/navigation/SidebarNavigationAdapter.tsx` e nas moléculas existentes, usando exclusivamente tokens/ícones/estados canônicos.
- [x] T025 [skill: general] [US3] Atualizar status e links da Fase 5/6 em `refs/dieta-db/index.md`, `refs/dieta-db/11-recuperacao-e-portabilidade-local.md`, `refs/dieta-db/13-protecao-local-e-backup-simples.md` e `refs/dieta-db/14-consolidacao-e-portao-de-execucao.md`.

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Fechar validação, rastreabilidade e evidência da fase.

- [x] T026 [skill: $speckit-implement] Executar `quickstart.md`, type-check, lint, Vitest serial, Playwright offline, links, auditorias e build; registrar evidências em `specs/12-09-26-backup-manual-simples/validation-report.md`.
- [x] T027 [skill: $speckit-converge] Executar análise final de `spec.md`, `plan.md`, `tasks.md`, checklists, contratos e quickstart; corrigir somente lacunas de cobertura antes de concluir a fase.

## Requirements Coverage

| Requirement | Tasks |
| --- | --- |
| FR-001 | T013–T015 |
| FR-002 | T004, T006, T007, T013 |
| FR-003 | T003, T004, T006 |
| FR-004 | T003, T004, T012, T013 |
| FR-005 | T003, T009, T012, T013, T016 |
| FR-006 | T006, T012, T013 |
| FR-007 | T014, T018, T021 |
| FR-008 | T003, T005, T017, T018 |
| FR-009 | T003, T005, T011, T017, T018 |
| FR-010 | T017, T018, T021 |
| FR-011 | T008, T009, T017, T018, T022 |
| FR-012 | T006, T019, T020, T022 |
| FR-013 | T018, T022 |
| FR-014 | T005, T017, T019, T022 |
| FR-015 | T018, T023, T024 |
| FR-016 | T023, T024 |
| FR-017 | T001, T011, T024, T025 |
| FR-018 | T014, T015, T021, T023, T024 |
| SC-001 | T006, T016, T019, T022 |
| SC-002 | T003, T005, T017, T019 |
| SC-003 | T006, T019, T020, T022 |
| SC-004 | T016 |
| SC-005 | T023, T024 |
| SC-006 | T016, T022, T023 |
| SC-007 | T023, T024 |

## Dependencies & Execution Order

- Setup precede Foundational; Foundational bloqueia as três histórias.
- US1 depende apenas de Foundational e é o MVP.
- US2 reutiliza o envelope/adapter de US1, mas seus testes de validação e rollback são independentes.
- US3 depende das superfícies de US1/US2 para comunicar estados reais.
- Polish depende das histórias concluídas.

## Parallel Opportunities

- T002 pode ocorrer em paralelo com T001 após a definição do inventário.
- T003, T006 e T008 são testes independentes e podem ser escritos em paralelo.
- T012 pode ser escrito em paralelo com T006/T008; T017 e T019 também podem ser preparados em paralelo.
- T023 é independente dos testes de persistência depois que os rótulos/estados forem definidos.

## Definition of Done

- Tarefas T001–T027 concluídas e todos os FR-001–FR-018/SC-001–SC-007 rastreáveis.
- Backup contém somente dados confirmados das 17 tabelas; drafts ficam fora e bloqueiam restore.
- Arquivo inválido não escreve; restauração válida substitui a Conta em uma transação; falha preserva a base anterior.
- Nenhuma semântica `.diet` concorrente, rota nova, tabela nova ou camada especulativa permanece.
- Quickstart e todos os gates gerais passam com evidência registrada.
