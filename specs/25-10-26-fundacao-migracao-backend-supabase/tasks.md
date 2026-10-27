---

description: "Tarefas da fundação da migração para o backend Supabase (F0)"
---

# Tasks: Fundação da migração para o backend Supabase (F0)

**Input**: Documentos de design em `specs/25-10-26-fundacao-migracao-backend-supabase/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: São obrigatórios. A constituição (Princípio IV) e a spec (FR-004, FR-012, FR-017–FR-020a) exigem testes. Toda tarefa de implementação tem antes uma tarefa de teste, que precisa falhar (RED) antes da implementação (GREEN).

**Execução**: Apenas por `/speckit-implement`, depois da validação humana. As tarefas marcadas **[mantenedor]** são executadas pelo mantenedor, com confirmação explícita a cada ação remota (FR-022b). O agente pode preparar comandos e conferir resultados, mas não digita senhas, chaves nem credenciais e não faz login em produção.

**Comando de integração** (quickstart §3), abreviado como `INTEGRAÇÃO` abaixo:

```bash
LOCAL_SUPABASE_DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres" ONLINE_DATABASE_URL="postgresql://app_runtime:<senha local>@127.0.0.1:54322/postgres" npx vitest run tests/server --pool=forks
```

## Format: `[ID] [skill] [P?] [Story] Description`

- **[skill]**: skill principal da tarefa (`general` quando nenhuma skill especializada cobre o trabalho);
- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente);
- **[Story]**: história da spec (US1–US6).

---

## Phase 1: Setup

**Purpose**: Isolar a execução e comprovar o ambiente local.

- [X] T001 [skill: general] Criar o worktree `../diet-maker-f0` com a branch `feat/backend-foundation-f0` a partir de `main`:

  ```bash
  git worktree add ../diet-maker-f0 -b feat/backend-foundation-f0 main
  ```

  Copiar para ele `specs/25-10-26-fundacao-migracao-backend-supabase/` e apontar `.specify/feature.json` para esse diretório (R11).

  Verificação: `git -C ../diet-maker-f0 status --short` mostra só o diretório do SDD e `.specify/feature.json`, e a branch atual `feat/configuracoes-perfil-save` fica intacta.
- [X] T002 [skill: $supabase] Spike do Supabase local (R5), com o Docker ativo:
  1. Rodar `npx supabase start -x realtime,storage-api,imgproxy,kong,mailpit,postgrest,postgres-meta,studio,edge-runtime,logflare,vector,supavisor` e `npx supabase db reset --local`.
  2. Confirmar que `auth.sessions` existe e medir o tempo de subida.
  3. Rodar `npx supabase db advisors --local --type security --level warn` sobre as migrations atuais, para ter a linha de base.

  Registrar em `specs/25-10-26-fundacao-migracao-backend-supabase/implementation-log.md` o comando final, o tempo e os achados de baseline, com a decisão de cada um segundo a regra de R5.

  Verificação: o log tem as três medições. Se houver achado legado que exija alterar grants ou policies, parar e pedir decisão ao mantenedor.
- [X] T003 [skill: general] Acrescentar ao `package.json` o script `verify:client-isolation` (`node scripts/verify-client-isolation.mjs`), conforme contracts/ci-checks.md §K2. Verificação: `npm run` lista o script.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Renomear o papel. Todas as histórias de banco dependem desta fase.

**⚠️ CRITICAL**: As fases US1, US3, US4 e US6 só começam depois desta.

- [X] T004 [skill: $tdd] RED: trocar `online_runtime` por `app_runtime` em seis testes (FR-010a, R9):
  - `tests/server/online-db.integration.test.ts`;
  - `online-db.repository.test.ts`;
  - `request-security.test.ts`;
  - `save-catalog.test.ts`;
  - `save-registry.test.ts`;
  - `online-db-client.test.ts`.

  Isso inclui a checagem de usuário da guarda `describeLocal` existente, que continua igual no resto.

  Verificação: com o banco de T002, `INTEGRAÇÃO` falha porque o papel `app_runtime` não existe.
- [X] T005 [skill: $database-migrations-pro] GREEN: criar a migration com `npx supabase migration new backend_foundation`. Escrever em `supabase/migrations/<timestamp>_backend_foundation.sql`:
  - o bloco `DO` do rename, com os quatro estados de data-model.md §3;
  - `ALTER ROLE app_runtime SET statement_timeout = '5s'`;
  - `ALTER ROLE app_runtime SET idle_in_transaction_session_timeout = '10s'`.

  Referências: FR-001, FR-005, contracts/database.md §D1.

  Verificação: depois de `npx supabase db reset --local` e da senha local (quickstart §1), `INTEGRAÇÃO` fica verde para os testes existentes de `private`.
- [X] T006 [skill: general] [P] Atualizar `online_runtime` → `app_runtime` em `.env.example`, `docs/setup/online-auth.md` e `refs/dieta-db/15-esquema-transferencia-backend-supabase.md`, sem tocar migrations aplicadas nem outros SDDs (FR-010a). Verificação: o comando abaixo só encontra o bloco de rename da nova migration e as menções históricas explícitas no texto.

  ```bash
  git grep -n online_runtime -- . ':!supabase/migrations/20261011002435_online_account_saves.sql' ':!supabase/migrations/20261022120000_professional_profile_and_save_label_updates.sql' ':!specs/'
  ```

**Checkpoint**: O papel está renomeado localmente e a suíte existente segue verde.

---

## Phase 3: User Story 1 - Banco nega acesso por padrão e isola contas (Priority: P1) 🎯 MVP

**Goal**: O schema `app` com `app.accounts` nega tudo sem contexto e isola as contas.

**Independent Test**: `INTEGRAÇÃO` contra o Supabase local, filtrado para `backend-foundation`.

- [X] T007 [skill: $supabase] [US1] RED: criar `tests/server/backend-foundation.integration.test.ts` com a guarda `describeLocal` dos testes existentes (R9, NFR-001).
  - O teste cria dois usuários em `auth.users` pela conexão `postgres` local.
  - Ele cobre as invariantes C1–C9 e a matriz M1–M14, com M6a, de contracts/database.md §D4–§D5.
  - Para M13, reaplica o SQL da migration como `postgres`.
  - Para M14, roda os dois casos numa transação desfeita.

  Verificação: o teste falha porque o schema `app` não existe.
- [X] T008 [skill: $database-migrations-pro] [US1] Na migration de T005, acrescentar (FR-003, FR-004, R4):
  - o schema `app`, com dono `postgres`;
  - `REVOKE ALL` de `PUBLIC`, `anon` e `authenticated` em `app` e `private`;
  - `GRANT USAGE ON SCHEMA app TO app_runtime`;
  - o `ALTER DEFAULT PRIVILEGES` de §D2.

  Verificação: C4 e C8 de T007 ficam verdes.
- [X] T009 [skill: $database-migrations-pro] [US1] Na mesma migration, criar `app.accounts` conforme data-model.md §1, com FK `ON DELETE RESTRICT` e `ENABLE` + `FORCE ROW LEVEL SECURITY` (FR-006). Verificação: C5, C7 e M11 ficam verdes.
- [X] T010 [skill: $database-migrations-pro] [US1] Na mesma migration, criar `app.current_account_id()` (`LANGUAGE sql STABLE SECURITY INVOKER SET search_path = ''`) com `REVOKE EXECUTE … FROM PUBLIC` e `GRANT EXECUTE … TO app_runtime` (FR-007). Verificação: C6, M8 e M9 ficam verdes.
- [X] T011 [skill: $database-migrations-pro] [US1] Na mesma migration, criar as policies `accounts_select` e `accounts_insert` de §D3, com o predicado `<P>` e `DROP POLICY IF EXISTS` + `CREATE POLICY`. Acrescentar os grants `SELECT` e `INSERT (owner_user_id)` (FR-002, FR-008, FR-009a).

  Verificação: todo `tests/server/backend-foundation.integration.test.ts` fica verde, incluindo M13 e M14, e `npx supabase db reset --local` roda duas vezes seguidas sem erro (FR-010).

**Checkpoint**: O isolamento está comprovado no banco local (SC-001, SC-004).

---

## Phase 4: User Story 2 - Bundle do navegador não conhece o banco (Priority: P1)

**Goal**: A CI falha diante de qualquer referência ao banco no código do cliente.

**Independent Test**: `npx vitest run tests/tooling/verify-client-isolation.test.ts tests/architecture/server-boundaries.test.ts`, depois `npm run build && npm run verify:client-isolation`.

- [X] T012 [skill: $tdd] [P] [US2] RED: criar `tests/tooling/verify-client-isolation.test.ts`. O teste roda o script com `--root` sobre fixtures num diretório temporário, inicializado com `git init` + `git add` para que os `.env*` contem como versionados. Casos (contracts/ci-checks.md §K2, US2-2, US2-4):
  - **prefixo público**:
    - `NEXT_PUBLIC_SUPABASE_SECRET_KEY` em `.env.example`, `next.config.ts`, num workflow e num arquivo de `src/` gera código 1;
    - `NEXT_PUBLIC_STRIPE_TOKEN` é detectado pela regra de fragmento;
    - `NEXT_PUBLIC_APP_NAME` não gera achado;
  - **bundle**:
    - cada id de padrão é detectado em `.next/static/…`, `.next/server/app/…{html,rsc}` e `public/…`;
    - o `db-object` é derivado das migrations de fixture;
    - o `project-ref` é detectado com `supabase/.temp/project-ref` e aparece como `skipped` sem esse arquivo;
  - **saída**:
    - código 0 numa fixture limpa;
    - código 2 sem `.next/`;
    - arquivo e id de padrão citados;
    - o trecho encontrado nunca aparece na saída.

  Verificação: o teste falha por script inexistente.
- [X] T013 [skill: $tdd] [US2] GREEN: implementar `scripts/verify-client-isolation.mjs` conforme §K2 (FR-017, FR-019, NFR-003). Se o build real tiver um falso positivo, acrescentar ao script uma exceção nominal (id do padrão, arquivo e motivo) e o caso correspondente em T012, e registrar no `implementation-log.md`.

  Verificação: T012 fica verde, e `npm run build && npm run verify:client-isolation` na raiz sai com código 0 (US2-1, US2-5, SC-002).
- [X] T014 [skill: $nextjs-fullstack-master] [P] [US2] RED → GREEN da regra de lint de §K3 (FR-018, US2-3, US2-5). Os cenários são estes três comandos:

  ```bash
  echo "import { createServerClient } from '@supabase/ssr';" | npx eslint --stdin --stdin-filename src/components/x.tsx
  echo "import { Pool } from 'pg';" | npx eslint --stdin --stdin-filename src/hooks/y.ts
  echo "import { createServerClient } from '@supabase/ssr';" | npx eslint --stdin --stdin-filename src/app/api/z/route.ts
  ```

  1. **RED**: rodar os três antes de mudar `eslint.config.mjs`. Nenhum cita `no-restricted-imports`.
  2. **GREEN**: acrescentar o bloco `no-restricted-imports` de §K3 a `eslint.config.mjs`.

  Verificação:
  - os dois primeiros comandos citam `no-restricted-imports`;
  - o terceiro não cita essa regra;
  - `npm run lint` sai sem erro novo.
- [X] T015 [skill: $nextjs-fullstack-master] [P] [US2] Criar `tests/architecture/server-boundaries.test.ts` com as partes 1, 2 e 4 de §K4 (FR-012, FR-018, US4-4):
  - o grafo do cliente sobre `src/`;
  - a allowlist do pool (`client.ts`, `accounts.ts`, `repository.ts`);
  - os fixtures em memória para uma cadeia transitiva `componente → lib → lib/server` e para um import de pool fora da allowlist, com a cadeia ou o arquivo na mensagem.

  Se o teste real acusar uma violação existente, corrigir o import no próprio arquivo de cliente e registrar a correção no `implementation-log.md`.

  Verificação: o teste fica verde.

---

## Phase 5: User Story 3 - Advisors de segurança a cada migration (Priority: P2)

**Goal**: A CI aplica as migrations do zero e bloqueia diante de alerta de segurança.

**Independent Test**: A prova negativa local de T016 e o job `ci` verde no PR.

- [X] T016 [skill: $supabase] [US3] RED: prova negativa local do gate de advisors, antes de ligá-lo na CI (US3-2, US3-3):
  1. criar uma migration temporária com `CREATE TABLE public.advisor_probe (id int)`, sem RLS;
  2. rodar `npx supabase db reset --local` e o advisor de segurança com `--fail-on warn`; o esperado é código ≠ 0;
  3. remover a migration e repetir; o esperado é código 0;
  4. rodar o advisor de desempenho e confirmar que ele não bloqueia.

  Registrar as saídas resumidas, sem segredos, no `implementation-log.md`.

  Verificação: o log tem os quatro resultados, e a migration temporária não aparece no `git status`.
- [X] T017 [skill: $supabase] [US3] GREEN: no job `ci` de `.github/workflows/ci-cd.yml`, acrescentar os passos 6–12 de §K1 (FR-017, FR-020, FR-020a, FR-021, US3-1):
  - `npm run verify:client-isolation` depois do build;
  - setup da CLI 2.122.0;
  - `supabase start -x …` com o comando final de T002;
  - senha local mascarada;
  - os dois advisors, com os mesmos comandos comprovados em T016;
  - `npx vitest run tests/server --pool=forks`, com as duas variáveis locais definidas só nesse passo.

  O job `cd` continua com `needs: ci`. Nenhum `secrets.*` aparece nos passos novos.

  Verificação: `git grep -n "secrets\." .github/workflows/ci-cd.yml` não mostra ocorrência nos passos novos. `npx --no-install js-yaml .github/workflows/ci-cd.yml` faz o parse sem erro; como o `js-yaml` é dependência transitiva, a confirmação definitiva é o PR em T025.

---

## Phase 6: User Story 4 - Um único caminho de transação por conta no servidor (Priority: P2)

**Goal**: O servidor acessa os dados da conta só por `withAccountTransaction` e resolve a conta só por `resolveOrCreateAccount`.

**Independent Test**: `npx vitest run tests/server/accounts.test.ts tests/architecture/server-boundaries.test.ts` e `INTEGRAÇÃO`.

- [X] T018 [skill: $tdd] [US4] RED, em três arquivos (S1, FR-009, FR-011, FR-013, US4-1–US4-3):
  - **`tests/server/accounts.test.ts`**, com `getOnlineDatabase` simulado como em `tests/server/single-save-policy.test.ts`:
    - um UUID inválido lança erro antes de obter o banco, nas duas funções;
    - o primeiro comando é o `set_config` da chave correta, com `true`;
    - `withAccountTransaction` nunca define `app.user_id`, e `resolveOrCreateAccount` nunca define `app.account_id`;
    - o erro de `run` é propagado sem alteração.
  - **`describe('accounts module')`** em `tests/server/backend-foundation.integration.test.ts`:
    - na mesma conexão (pool `max: 1`), uma transação com a conta A seguida de uma sem contexto vê 0 linhas;
    - uma transação com erro desfaz tudo e deixa `current_setting('app.account_id', true)` vazio;
    - `resolveOrCreateAccount(U_A)` duas vezes devolve o mesmo `id`;
    - usuários diferentes recebem contas diferentes;
    - um usuário inexistente gera erro de FK.
  - **`tests/architecture/server-boundaries.test.ts`**: a parte 3 de §K4, que exige `import 'server-only'` como primeira instrução de `accounts.ts`.

  Verificação: os três falham por módulo inexistente.
- [X] T019 [skill: $backend-patterns] [US4] GREEN: implementar `src/lib/server/online-db/accounts.ts` conforme S1.
  - Exportar o `uuidPattern` existente de `repository.ts`, que não tem outra mudança, e reutilizá-lo.
  - A transação de resolução fica interna ao módulo.

  Verificação: T018 fica verde, e `npm run type-check` também.

---

## Phase 7: User Story 5 - Chave mestra versionada fora do banco (Priority: P3)

**Goal**: O carregador da KEK falha fechado, e o procedimento de backup é verificável.

**Independent Test**: `npx vitest run tests/server/account-kek.test.ts tests/architecture/server-boundaries.test.ts`.

- [X] T020 [skill: $tdd] [US5] RED (FR-014, US5-1, US5-2, NFR-003):
  - Criar `tests/server/account-kek.test.ts` com todas as linhas da tabela de S3, usando material gerado no próprio teste. Ele cobre:
    - mensagens sem o valor;
    - `JSON.stringify` e `util.inspect` do resultado sem o material;
    - `keys.get(activeId).export()` igual aos 32 bytes decodificados;
    - a recusa de material igual ao da `SERVER_MASTER_KEY`;
    - o carregamento de várias versões;
    - nenhuma leitura do ambiente no import.
  - Acrescentar `account-kek.ts` à lista `server-only` de `tests/architecture/server-boundaries.test.ts`.

  Verificação: os dois falham por módulo inexistente.
- [X] T021 [skill: $backend-patterns] [US5] GREEN: implementar `src/lib/server/crypto/account-kek.ts` conforme S3 e R8. Verificação: T020 fica verde.
- [X] T022 [skill: general] [US5] Acrescentar a `.env.example` as linhas vazias `ACCOUNT_KEK_ACTIVE_ID=` e `ACCOUNT_KEK_V1=`, com o comentário de contracts/environment.md. Verificação:
  - `npm run build && npm run verify:client-isolation` sai com código 0;
  - `git grep -n "ACCOUNT_KEK" .env.example` mostra as duas linhas vazias.

---

## Phase 8: User Story 6 (parte 1) - Runbook do projeto remoto (Priority: P3)

**Goal**: O runbook está pronto para aplicar a fundação no `diet-maker`.

**Independent Test**: `npm run verify:links`.

- [X] T023 [skill: $supabase] [US6] Escrever `docs/setup/backend-foundation.md` (FR-015, FR-016, FR-022, FR-022a, NFR-004):
  - **Seção KEK**:
    - geração com `openssl rand -base64 32`;
    - cadastro como Sensitive somente em Production;
    - backup DPAPI ao lado dos backups de `online-auth.md`;
    - restauração num shell isolado;
    - conferência por `printf %s "$KEK" | base64 -d | sha256sum | cut -c1-16`, comparando original e restaurado (R8);
    - proibição de gravar a KEK no banco, no Vault, no repositório, no Preview ou no Development.
  - **Seção remota**, com os passos 0–8 de quickstart §5:
    - os comandos de verificação de FR-022;
    - a evidência de conexão do runtime de R10;
    - o rollback com `migration repair`;
    - a restrição de rede não aplicável (R12);
    - o modelo de registro.

  Linkar o runbook a partir de `docs/setup/online-auth.md`. Criar `specs/25-10-26-fundacao-migracao-backend-supabase/validation-report.md` com uma seção vazia por passo e o status "proposto".

  Verificação: `npm run verify:links` fica verde.

---

## Phase 9: Validação integrada

**Purpose**: Comprovar a fundação inteira localmente e na CI antes de tocar o projeto remoto (FR-022a: "depois da validação local completa").

- [X] T024 [skill: general] Regressão completa (FR-023, SC-005). Rodar:
  - `npm run test`;
  - `INTEGRAÇÃO`;
  - `npm run lint`;
  - `npm run type-check`;
  - `npm run build`;
  - `npm run verify:client-isolation`;
  - `npm run test:browser -- tests/browser/online-auth.spec.ts tests/browser/settings-saves.spec.ts`.

  Verificação: tudo verde, com a saída resumida no `implementation-log.md`.
- [ ] T025 [skill: general] Abrir o PR de `feat/backend-foundation-f0` para `main` e confirmar o job `ci` verde, incluindo os passos novos. Comparar a duração com a última execução de `main` (NFR-002, SC-006). Se a diferença passar de 5 min, mover os passos de banco para um job paralelo (R5) e medir de novo.

  Verificação: o `implementation-log.md` registra as duas durações, com diferença ≤ 5 min.
- [X] T026 [skill: $security-audit] Auditar a segurança do diff. Conferir que:
  - não há segredo versionado;
  - todo módulo novo tem `server-only`;
  - nenhum log imprime valor;
  - nenhuma função tem `SECURITY DEFINER`;
  - a KEK não aparece no repositório nem nas migrations (US5-3).

  Registrar os achados e as correções no `implementation-log.md`.

  Verificação: nenhum achado fica aberto.

---

## Phase 10: User Story 6 (parte 2) - Aplicação no projeto `diet-maker` (Priority: P3)

**Goal**: A fundação aplicada no `diet-maker`, com a evidência de cada controle e o fluxo online intacto.

**Independent Test**: [quickstart.md](./quickstart.md) §5 executado, com `validation-report.md` completo.

**⚠️ Somente o mantenedor**: cada tarefa abaixo é uma ação remota, confirmada no momento da execução (FR-022b). A ordem é estrita.

- [ ] T027 [skill: $supabase] [US6] **[mantenedor]** Passos 0–2 (US6-1, US6-2, US6-3, US6-5, R1):
  - **Linha de base**: `npx supabase projects list` mostra `sa-east-1`, e o smoke atual fica verde.
  - **Dry-run**: `npx supabase db push --linked --dry-run` lista só a migration da fundação, sem comando destrutivo.
  - **Data API e SSL**:
    - **Enable Data API** desligado no painel;
    - `npx supabase ssl-enforcement get` mostra a exigência ativa;
    - os probes `/rest/v1/` e `/graphql/v1` respondem com status ≠ 200.

  Registrar tudo em `validation-report.md`.

  Verificação: o relatório tem a região, a lista do dry-run e os três resultados de exposição.
- [ ] T028 [skill: $supabase] [US6] **[mantenedor]** Passos 3–4 (FR-001, FR-015, FR-016, SC-007, US5-4):
  - Provisionar `ACCOUNT_KEK_ACTIVE_ID` e `ACCOUNT_KEK_V1` como Sensitive, só em Production.
  - Fazer o backup DPAPI, restaurá-lo num shell isolado e comparar as impressões digitais do original e do restaurado.
  - Gerar a senha nova do runtime, fazer o backup DPAPI e atualizar `ONLINE_DATABASE_URL` de Production com o usuário `app_runtime.<ref>`.

  Registrar as impressões digitais, o resultado da comparação e a hora de cada ação, nunca os valores.

  Verificação: as duas impressões digitais são iguais no relatório, e `vercel env ls production` mostra as variáveis da KEK.
- [ ] T029 [skill: $supabase] [US6] **[mantenedor]** Passos 5–8 (FR-005, FR-015, FR-022, FR-022a, US5-3, US6-4):
  1. `npx supabase db push --linked`;
  2. `ALTER ROLE app_runtime PASSWORD` pelo SQL editor;
  3. Redeploy do deploy de produção atual;
  4. registrar o início e o fim da janela, que precisa ficar abaixo de 10 min;
  5. smoke de login, perfil profissional, catálogo e autorização de saves com a conta de teste do mantenedor;
  6. conexão do runtime (R10): `npx vitest run tests/server/online-db-client.test.ts` verde, provando que o cliente exige a CA e `rejectUnauthorized: true`, e, no SQL editor, `SELECT count(*) FROM pg_stat_activity WHERE usename = 'app_runtime'` > 0;
  7. `vercel env ls production`, `vercel env ls preview` e `vercel env ls development` com os nomes, ambientes e marcação Sensitive esperados, sem `ACCOUNT_KEK_*` fora de Production e sem `NEXT_PUBLIC_` sensível;
  8. no SQL editor, `SELECT name FROM vault.secrets` (só nomes, nunca o valor decifrado) não mostra entrada da KEK (US5-3, FR-015).

  Se o login do runtime falhar por mais de 2 min ou o smoke falhar, executar o rollback de quickstart §5.

  Verificação: todas as linhas de `validation-report.md` têm resultado, ou o rollback foi executado e registrado.

---

## Phase 11: Polish & Cross-Cutting Concerns

- [X] T030 [skill: general] Atualizar o status da F0 em `refs/dieta-db/15-esquema-transferencia-backend-supabase.md` e em `refs/dieta-db/index.md`, distinguindo o implementado (merge) do validado (`validation-report.md`) (NFR-004). Verificação: o texto cita a evidência e não declara validação sem relatório.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (T001–T003)**: T001 vem primeiro; T002 e T003 vêm depois dele.
- **Foundational (T004–T006)**: depende de T002 (banco local) e bloqueia US1, US3, US4 e US6.
- **US1 (T007–T011)**: depende da fase Foundational. T008–T011 editam a mesma migration, em sequência.
- **US2 (T012–T015)**: depende só de T003 e pode correr em paralelo à Foundational e à US1.
- **US3 (T016–T017)**: T016 depende de US1 (migration final). T017 depende de T016 e de T013.
- **US4 (T018–T019)**: depende de US1 (tabela e policies) e de T015.
- **US5 (T020–T022)**: T020 depende de T018, porque edita a mesma lista `server-only` de `server-boundaries.test.ts`. T022 depende de T013.
- **US6 parte 1 (T023)**: depende de US1 e de US5.
- **Validação integrada (T024–T026)**: depende de US1–US5 e de T023.
- **US6 parte 2 (T027–T029)**: depende de T024–T026 (local e CI verdes, auditoria sem achado aberto). A ordem é estrita, e só o mantenedor executa. Não depende do merge, porque a republicação usa o deploy de produção atual (FR-022a).
- **Polish (T030)**: depende do merge e de `validation-report.md`.

### Parallel Opportunities

- US2 inteira pode correr em paralelo com a Foundational e a US1. Dentro dela, T012, T014 e T015 são [P] entre si.
- Depois de T018, a US4 (T019) e a US5 (T020–T022) podem correr em paralelo, porque editam arquivos diferentes.

### Parallel Example: User Story 2

```text
T012 tests/tooling/verify-client-isolation.test.ts
T014 eslint.config.mjs
T015 tests/architecture/server-boundaries.test.ts
```

## Implementation Strategy

### MVP First

1. Setup e Foundational (T001–T006).
2. US1 (T007–T011): isolamento no banco.
3. US2 (T012–T015): o bundle não conhece o banco.
4. **Parar e validar**: quickstart §1–§4.

### Incremental Delivery

5. US3 → US4 → US5 → US6 parte 1 (código, testes e runbook).
6. Validação integrada: regressão (T024) → PR com CI verde (T025) → auditoria (T026).
7. US6 parte 2 (T027–T029): só com o mantenedor, em janela marcada.
8. T030: status documental depois do merge e da evidência.

## Traceability

| Requisito | Tarefas |
| :--- | :--- |
| FR-001 | T004, T005, T007, T028, T029 |
| FR-002 | T007, T011 |
| FR-003 | T007, T008 |
| FR-004 | T007, T008 |
| FR-005 | T005, T017, T029 |
| FR-006 | T007, T009 |
| FR-007 | T007, T010, T026 |
| FR-008 | T007, T009, T011 |
| FR-009, FR-009a | T007, T011, T018, T019 |
| FR-010 | T007, T011 |
| FR-010a | T004, T006 |
| FR-011 | T018, T019 |
| FR-012 | T015 |
| FR-013 | T018, T019, T020, T021 |
| FR-014 | T020, T021 |
| FR-015 | T023, T028 |
| FR-016 | T023, T028 |
| FR-017 | T012, T013, T017 |
| FR-018 | T014, T015 |
| FR-019 | T012, T013, T022 |
| FR-020 | T002, T016, T017 |
| FR-020a | T007, T017 |
| FR-021 | T017 |
| FR-022 | T023, T027, T029 |
| FR-022a | T023, T027–T029 |
| FR-022b | T027–T029 |
| FR-023 | T004, T005, T024 |
| NFR-001 | T007 |
| NFR-002 | T002, T025 |
| NFR-003 | T012, T013, T020 |
| NFR-004 | T023, T030 |
| SC-001 | T007, T011 |
| SC-002 | T012, T013 |
| SC-003 | T002, T016, T017 |
| SC-004 | T007 |
| SC-005 | T024 |
| SC-006 | T025 |
| SC-007 | T028 |
