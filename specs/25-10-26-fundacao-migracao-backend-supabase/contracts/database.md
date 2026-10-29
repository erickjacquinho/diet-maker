# Contract: Banco de dados da fundação

Status: proposto. Aplica-se à migration `supabase/migrations/<timestamp>_backend_foundation.sql`, criada com `npx supabase migration new backend_foundation`.

## D1. Forma da migration

- **Arquivo**: um só, aplicado pela CLI como uma transação. Uma falha desfaz tudo (FR-010).
- **Rename**: o bloco `DO` do rename trata os estados da [data-model §3](../data-model.md#3-papel-app_runtime) e falha com mensagem nominal quando os dois papéis existem ou quando nenhum existe.
- **Reaplicação**: todo DDL é reaplicável. O código usa `CREATE SCHEMA IF NOT EXISTS`, `CREATE TABLE IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION` e `DROP POLICY IF EXISTS` + `CREATE POLICY`. `GRANT` e `REVOKE` já são idempotentes.
- **Legado**: a migration não altera policies, grants ou dados de `private.*` (FR-010). Somente o rename muda o nome exibido nos grants existentes.
- **Senha**: nenhuma senha aparece na migration.

## D2. Privilégios (estado final)

| Objeto | `PUBLIC` | `anon` | `authenticated` | `app_runtime` |
| :--- | :--- | :--- | :--- | :--- |
| schema `app` | — | — | — | `USAGE` |
| schema `private` | — | — | — | `USAGE` (inalterado) |
| `app.accounts` | — | — | — | `SELECT`; `INSERT (owner_user_id)` apenas |
| `app.current_account_id()` | — | — | — | `EXECUTE` |
| objetos futuros em `app`/`private` | — | — | — | só por grant explícito |

`ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA app, private REVOKE ALL ON TABLES, SEQUENCES, FUNCTIONS FROM PUBLIC, anon, authenticated;` (FR-004, R4).

## D3. Policies

| Tabela | Policy | Comando | Papel | Predicado |
| :--- | :--- | :--- | :--- | :--- |
| `app.accounts` | `accounts_select` | `SELECT` | `app_runtime` | `USING (<P>)` |
| `app.accounts` | `accounts_insert` | `INSERT` | `app_runtime` | `WITH CHECK (<P>)` |

`<P>` = `id = app.current_account_id() OR owner_user_id = NULLIF(current_setting('app.user_id', true), '')::uuid`. O contexto de usuário fica inline, como nas policies legadas de `private`, porque só esta tabela o usa.

Regras:

- A RLS fica `ENABLE` + `FORCE`.
- Não há policy de `UPDATE` nem de `DELETE`. Com as duas faltando e sem os grants correspondentes, a operação é negada (US1-3).
- Toda tabela de domínio futura MUST ter `USING` e `WITH CHECK` com `account_id = app.current_account_id()`, e só isso (FR-008).

## D4. Invariantes de catálogo (testes de integração)

O teste `tests/server/backend-foundation.integration.test.ts` consulta o catálogo como `postgres` e falha se qualquer invariante for violada.

| Id | Invariante | Fonte |
| :--- | :--- | :--- |
| C1 | `pg_roles` de `app_runtime`: `rolcanlogin`, `NOT rolinherit`, `NOT rolbypassrls`, `NOT rolsuper`; `rolconfig` contém `statement_timeout=5s` e `idle_in_transaction_session_timeout=10s` | FR-001 |
| C2 | Não existe papel `online_runtime` | FR-001 |
| C3 | `has_table_privilege('app_runtime', t, p)` é falso para `DELETE`, `TRUNCATE` e `REFERENCES` em toda tabela de `app` | FR-002 |
| C4 | `aclexplode` sobre `pg_namespace.nspacl`, `pg_class.relacl` (tabelas, views, sequências) e `pg_proc.proacl` de `app` e `private` não mostra privilégio para `PUBLIC`, `anon` ou `authenticated`. Um `proacl` nulo conta como o padrão global, que concede a `PUBLIC` | FR-003, FR-004 |
| C5 | Toda tabela de `app` tem `relrowsecurity` e `relforcerowsecurity` | FR-008 |
| C6 | Nenhuma função de `app` ou `private` tem `prosecdef`; `app.current_account_id()` tem `proconfig` com `search_path=""` | FR-007 |
| C7 | A FK de `app.accounts.owner_user_id` tem `confdeltype = 'r'` (`RESTRICT`) | FR-006 |
| C8 | `nspowner` de `app` é `postgres` | FR-003 |
| C9 | Toda policy de `pg_policies` em `app` tem `roles = {app_runtime}`, e toda tabela de `app` tem ao menos uma policy | FR-008 |

## D5. Matriz de comportamento (como `app_runtime`)

| # | Contexto | Operação | Resultado esperado | Cenário |
| :--- | :--- | :--- | :--- | :--- |
| M1 | nenhum | `SELECT * FROM app.accounts` | 0 linhas | US1-1 |
| M2 | `app.user_id = U_A` | `SELECT` | só a conta de A | US1-1a |
| M3 | `app.user_id = U_A` | `INSERT (owner_user_id) VALUES (U_A) ON CONFLICT DO NOTHING` ×2 | 1 linha total; o segundo `SELECT` devolve o mesmo `id` | US1-1a |
| M4 | `app.user_id = U_A` | `INSERT (owner_user_id) VALUES (U_B)` | erro de RLS | US1-1a |
| M5 | `app.account_id = A` | `SELECT` | só A | US1-2 |
| M6 | `app.account_id = A` | `INSERT (owner_user_id) VALUES (U_C)` | erro de RLS | US1-3 |
| M6a | qualquer | `INSERT (id, owner_user_id) …` | `permission denied` (coluna `id` sem grant) | FR-009 |
| M7 | `app.account_id = A` | `UPDATE`/`DELETE` | `permission denied` | US1-3 |
| M8 | `app.account_id = 'x'` | `SELECT` | erro de cast; nenhuma linha | US1-6 |
| M9 | `app.account_id = ''` | `SELECT` | 0 linhas | Edge |
| M10 | `app.account_id = A`, `app.user_id = U_B` | `SELECT` | A e a conta de B, apenas em `accounts`, porque a policy aceita qualquer dos dois. Tabelas de domínio não existem na F0, e o teste registra o comportamento para a F3 | Edge |
| M11 | `postgres` | `DELETE FROM auth.users WHERE id = U_A` | erro de FK; a conta permanece | US1-7 |
| M12 | `anon`/`authenticated` (`SET ROLE`) | `SELECT` em `app.accounts` e `private.saves` | `permission denied for schema` | US1-4 |
| M13 | `postgres` | reaplicar o SQL da migration | sem erro e sem duplicatas | FR-010 |
| M14 | `postgres`, numa transação desfeita ao final: (a) `CREATE ROLE online_runtime` ao lado de `app_runtime`; (b) `app_runtime` renomeado para um nome temporário | aplicar o bloco de rename | exceção nominal nos dois casos; estado inalterado | FR-001 |

O M10 documenta um limite conhecido. Ele não vaza dado de domínio, porque as policies de domínio usam só `account_id`, e o servidor nunca define os dois contextos na mesma transação ([server-modules.md §S1](./server-modules.md)). Os limites de tempo são verificados pela configuração do papel (C1).

## D6. Advisors

| Execução | Comando | Bloqueia |
| :--- | :--- | :--- |
| Segurança | `supabase db advisors --local --type security --level warn --fail-on warn` | Sim |
| Desempenho | `supabase db advisors --local --type performance --fail-on none` | Não |
