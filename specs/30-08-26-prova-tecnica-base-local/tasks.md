---

description: "Task list for the local database technical proof"

---

# Tasks: Prova técnica e base local

**Input**: Design documents from `specs/30-08-26-prova-tecnica-base-local/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md)

**Scope**: PoC isolada em `poc/local-db-proof/`; não integrar `src/`, não migrar `localStorage` e não criar telas clínicas nesta etapa.

**Organization**: Tasks are grouped by user story. Tests are required because the PoC is the acceptance gate for persistence, atomicity, isolation and portability.

## Phase 1: Setup (Workspace da PoC)

**Purpose**: Criar o workspace descartável e os comandos mínimos sem adicionar dependências ao aplicativo principal.

- [x] T001 [skill: general] Criar o workspace isolado e seu manifesto de dependências em `poc/local-db-proof/package.json`, incluindo scripts separados para desenvolvimento, type-check, testes e navegador.
- [x] T002 [skill: $frontend-architecture-mindset] [P] Configurar TypeScript, bundler e página técnica mínima em `poc/local-db-proof/tsconfig.json`, `poc/local-db-proof/vite.config.ts` e `poc/local-db-proof/index.html`, sem importar o harness para `src/app` ou `src/components`.
- [x] T003 [skill: $webapp-testing] Configurar os runners determinísticos da PoC em `poc/local-db-proof/vitest.config.ts` e `poc/local-db-proof/playwright.config.ts`, distinguindo testes de runtime dos cenários reais de navegador.

---

## Phase 2: Foundational (Infraestrutura bloqueadora)

**Purpose**: Definir a fronteira do adaptador, a fixture, os erros e o banco mínimo antes de qualquer história de usuário.

**⚠️ CRITICAL**: Nenhuma história pode começar antes desta fase e da confirmação de que a PoC não altera a aplicação principal.

- [x] T004 [skill: $backend-architect-ddd] [P] Definir os tipos de erro, resultado e porta interna do adaptador em `poc/local-db-proof/src/contracts.ts`, cobrindo inicialização, persistência, migration, importação e lock sem expor registros físicos ao domínio.
- [x] T005 [skill: $tdd] [P] Criar a fixture sintética determinística e suas asserções em `poc/local-db-proof/src/fixture.ts` e `poc/local-db-proof/tests/support/fixture-assertions.ts`, incluindo múltiplas Contas/Pacientes, estados ACTIVE/SNAPSHOT, refeições, itens nutricionais, paciente arquivado e draft contextual.
- [x] T006 [skill: $database-migrations-pro] [P] Definir o schema relacional mínimo e a configuração de migrations em `poc/local-db-proof/src/db/schema.ts` e `poc/local-db-proof/drizzle.config.ts`, refletindo as entidades e invariantes de `data-model.md`.
- [x] T007 [skill: $database-migrations-pro] Gerar a migration inicial e o executor versionado em `poc/local-db-proof/drizzle/0000_initial.sql` e `poc/local-db-proof/src/db/migrations.ts`, usando fluxo explícito generate/migrate e sem `drizzle-kit push` como caminho canônico.
- [x] T008 [skill: $backend-architect-ddd] Implementar a abertura, fechamento e configuração de durabilidade do banco em `poc/local-db-proof/src/db/client.ts`, usando armazenamento persistente e falha explícita quando a persistência real não puder ser comprovada.
- [x] T009 [skill: $backend-patterns] [P] Implementar o coletor de evidências e resultados nominais em `poc/local-db-proof/src/report.ts`, com versão, modo, cenário, pass/fail, limitação e tempos de abertura, consulta e gravação.

**Checkpoint**: workspace executável, fixture carregável, schema/migration inicial revisável, erros tipados e relatório prontos; nenhum módulo do produto foi integrado.

---

## Phase 3: User Story 1 — Confirmar a base local de persistência (Priority: P1) 🎯 MVP

**Goal**: Comprovar gravação persistente, fechamento/reabertura e erro explícito de armazenamento usando a fixture sintética.

**Independent Test**: Executar os testes e o harness da PoC, fechar/reabrir a base e comparar 100% dos registros, relações e valores definidos na fixture.

### Tests for User Story 1

- [x] T010 [skill: $tdd] [P] [US1] Escrever primeiro os testes de persistência, reabertura e falha de armazenamento em `poc/local-db-proof/tests/db.integration.test.ts`, deixando-os falhar antes da implementação do fluxo.

### Implementation for User Story 1

- [x] T011 [skill: $backend-architect-ddd] [US1] Implementar operações mínimas de leitura, gravação e fechamento para a fixture em `poc/local-db-proof/src/db/repositories.ts`, mantendo o domínio independente do motor.
- [x] T012 [skill: $frontend-architecture-mindset] [US1] Implementar o cenário de inicialização, seed, medição e reabertura em `poc/local-db-proof/src/harness.ts`, usando o coletor de `poc/local-db-proof/src/report.ts`.
- [x] T013 [skill: general] [US1] Executar a validação independente da história e registrar evidências de persistência/reabertura no bloco US1 de `specs/30-08-26-prova-tecnica-base-local/poc-report.md`.

**Checkpoint**: A base persistente sobrevive à reabertura e falhas de armazenamento são explícitas; a história entrega o MVP técnico sem dependência das demais.

---

## Phase 4: User Story 2 — Garantir integridade e isolamento dos dados (Priority: P1)

**Goal**: Comprovar atomicidade, escopo Conta/Paciente, draft separado e exclusividade de uma aba.

**Independent Test**: Provocar falha intermediária, tentativa de relação inválida, gravação/remoção de draft e abertura de segunda aba; comparar a base antes/depois e confirmar ausência de dados parciais ou mutações cruzadas.

### Tests for User Story 2

- [x] T014 [skill: $tdd] [P] [US2] Escrever primeiro os testes de transação, rollback, escopo e unicidade em `poc/local-db-proof/tests/transaction.integration.test.ts`, cobrindo cabeçalho/filhos e no máximo uma dieta ACTIVE por paciente.
- [x] T015 [skill: $tdd] [P] [US2] Escrever primeiro os testes de isolamento do draft em `poc/local-db-proof/tests/drafts.integration.test.ts`, comparando o estado confirmado antes e depois de autosave, update, discard e falha.
- [x] T016 [skill: $webapp-testing] [P] [US2] Escrever primeiro o cenário real de duas abas em `poc/local-db-proof/tests/browser/single-tab.spec.ts`, exigindo bloqueio antes de abrir, consultar ou editar a base.

### Implementation for User Story 2

- [x] T017 [skill: $backend-architect-ddd] [US2] Implementar gravação composta atômica, validação de escopo, foreign keys e unicidade de vigência em `poc/local-db-proof/src/db/repositories.ts`, preservando rollback completo.
- [x] T018 [skill: $backend-architect-ddd] [US2] Implementar o armazenamento separado de drafts em `poc/local-db-proof/src/drafts/draft-store.ts`, com ordenação do último estado, contexto Conta/Paciente e exclusão do transporte confirmado.
- [x] T019 [skill: $webapp-testing] [US2] Implementar o lock exclusivo e fail-closed de instância em `poc/local-db-proof/src/locking/single-tab-lock.ts`, usando Web Locks quando disponível e sem fallback por `localStorage`.
- [x] T020 [skill: $frontend-architecture-mindset] [US2] Encadear aquisição do lock antes da abertura do banco em `poc/local-db-proof/src/db/client.ts` e `poc/local-db-proof/src/harness.ts`, com mensagem técnica explícita para a segunda aba.
- [x] T021 [skill: general] [US2] Executar a validação independente da história e registrar rollback, isolamento, lock e limitações no bloco US2 de `specs/30-08-26-prova-tecnica-base-local/poc-report.md`.

**Checkpoint**: Falha de transação não deixa registros parciais, draft não toca a base confirmada e apenas uma aba opera a instância.

---

## Phase 5: User Story 3 — Validar evolução e portabilidade da base (Priority: P2)

**Goal**: Demonstrar migration versionada e round-trip lógico em JSON sem perder IDs, relações ou snapshots nutricionais.

**Independent Test**: Aplicar a migration sobre fixture preenchida, exportar/importar em base compatível e rejeitar amostras inválidas sem mutar a base atual.

### Tests for User Story 3

- [x] T022 [skill: $tdd] [P] [US3] Escrever primeiro os testes de migration em `poc/local-db-proof/tests/migration.integration.test.ts`, incluindo preservação da fixture, reexecução e versão incompatível.
- [x] T023 [skill: $tdd] [P] [US3] Escrever primeiro os testes de exportação/importação lógica em `poc/local-db-proof/tests/portability.integration.test.ts`, incluindo JSON inválido, relações inconsistentes e exclusão de drafts.

### Implementation for User Story 3

- [x] T024 [skill: $database-migrations-pro] [US3] Implementar a aplicação explícita da evolução aditiva e a validação de schema em `poc/local-db-proof/src/db/migrations.ts` e `poc/local-db-proof/drizzle/0001_add_fixture_metadata.sql`, preservando a fixture existente.
- [x] T025 [skill: $backend-patterns] [US3] Implementar o envelope, serialização e desserialização da amostra em `poc/local-db-proof/src/portability/sample-transfer.ts`, preservando IDs, relações e valores nutricionais.
- [x] T026 [skill: $backend-patterns] [US3] Implementar rejeição antes da mutação para `formatVersion`, `schemaVersion`, JSON e relações inválidas em `poc/local-db-proof/src/portability/sample-transfer.ts`.
- [x] T027 [skill: general] [US3] Executar a validação independente da história e registrar migration, round-trip e rejeições no bloco US3 de `specs/30-08-26-prova-tecnica-base-local/poc-report.md`.

**Checkpoint**: A base evolui com migration revisável e a portabilidade lógica não altera identidade, relações ou snapshots.

---

## Phase 6: User Story 4 — Confirmar operação local sem rede (Priority: P2)

**Goal**: Comprovar que a amostra continua operável sem rede depois que seus recursos foram carregados.

**Independent Test**: Carregar a PoC, desativar a rede no navegador e repetir inicialização, consulta, gravação, reabertura e portabilidade; distinguir recurso não preparado de falha do banco.

### Tests for User Story 4

- [x] T028 [skill: $webapp-testing] [P] [US4] Escrever primeiro o cenário de rede desligada em `poc/local-db-proof/tests/browser/offline.spec.ts`, incluindo sucesso após preparação e erro explícito quando o recurso ainda não foi carregado.

### Implementation for User Story 4

- [x] T029 [skill: $frontend-architecture-mindset] [US4] Implementar o cenário de preparação de recursos e execução local em `poc/local-db-proof/src/offline-scenario.ts`, sem chamadas remotas silenciosas ou fallback para `localStorage`.
- [x] T030 [skill: $webapp-testing] [US4] Integrar o cenário offline ao harness técnico em `poc/local-db-proof/src/harness.ts` e `poc/local-db-proof/index.html`, mantendo a saída mínima, sem tela clínica e compatível com teclado.
- [x] T031 [skill: general] [US4] Executar a validação independente da história e registrar rede, recursos preparados, tempos e limitações no bloco US4 de `specs/30-08-26-prova-tecnica-base-local/poc-report.md`.

**Checkpoint**: Operações preparadas funcionam sem rede e o relatório não confunde offline básico com PWA ou cache avançado.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Consolidar a decisão técnica, validar fronteiras e deixar evidência pronta para revisão humana.

- [x] T032 [skill: general] [P] Consolidar o relatório final com matriz de verificações, versões, tempos, limitações e decisão `approved`, `rejected` ou `needs re-evaluation` em `specs/30-08-26-prova-tecnica-base-local/poc-report.md`.
- [x] T033 [skill: general] [P] Executar os comandos de `specs/30-08-26-prova-tecnica-base-local/quickstart.md` e registrar qualquer divergência ou ajuste no próprio `poc-report.md`.
- [x] T034 [skill: $code-reviewer-expert] Auditar a fronteira da PoC em `poc/local-db-proof/` e `package.json`, confirmando que não foram adicionados imports do motor a `src/`, que `localStorage` não é fallback e que não há migrador de dados legados.
- [x] T035 [skill: general] Executar type-check, lint e a bateria completa da PoC definidos em `poc/local-db-proof/package.json`, registrando comandos e resultados finais em `specs/30-08-26-prova-tecnica-base-local/poc-report.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências; T001 deve anteceder comandos de T003.
- **Foundational (Phase 2)**: depende de Setup e bloqueia todas as histórias.
- **User Story 1 (Phase 3)**: depende de Foundation e é o MVP técnico.
- **User Story 2 (Phase 4)**: depende de US1 para reutilizar a abertura, fixture e repositório base.
- **User Story 3 (Phase 5)**: depende de US2 para transportar uma base com escopo, drafts e invariantes exercitados.
- **User Story 4 (Phase 6)**: depende de US1 e do harness; recomenda-se executá-la após US3 para validar a amostra final.
- **Polish (Phase 7)**: depende das quatro histórias e consolida o portão técnico.

### User Story Dependencies

- **US1 (P1)**: depende apenas da Foundation; não depende de outras histórias.
- **US2 (P1)**: depende de US1 para a camada de abertura/repositório, mas permanece independentemente validável após essa base.
- **US3 (P2)**: depende de US2 para preservar e transportar os invariantes exercitados.
- **US4 (P2)**: depende de US1 e do harness; pode ser executada em paralelo com US3 se o ambiente de navegador estiver disponível.

### Parallel Opportunities

- T002 e T005/T006/T009 podem ser preparados em arquivos distintos após T001, respeitando a configuração necessária.
- T014, T015 e T016 são testes independentes da US2 e podem ser escritos em paralelo antes das implementações.
- T022 e T023 são testes independentes da US3 e podem ser escritos em paralelo.
- T028 pode ser escrito em paralelo à preparação de portabilidade, desde que T012 exista.
- T032 e T033 são atividades documentais distintas após todas as histórias; T034 pode ocorrer em paralelo com T032.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Setup e Foundation.
2. Escrever e fazer falhar os testes de US1.
3. Implementar persistência, reabertura e relatório de US1.
4. Parar e validar o MVP técnico antes de avançar para integridade ou portabilidade.

### Incremental Delivery

1. Foundation pronta → US1 comprova a base persistente.
2. US2 adiciona rollback, escopo, drafts e aba única sem integrar o produto.
3. US3 adiciona migration e portabilidade lógica.
4. US4 comprova operação local após preparação.
5. Polish produz o relatório e o gate de decisão; nenhum SDD seguinte é iniciado sem aprovação humana do resultado.

### Notes

- Cada tarefa tem caminho de arquivo ou resultado documental explícito e uma verificação observável.
- O runner de navegador deve usar dados sintéticos; não executar a PoC com dados clínicos reais.
- A implementação posterior deve ser executada exclusivamente por `/speckit-implement`, conforme a constituição do projeto.
