# Data Model: Fundação da migração para o backend Supabase (F0)

Status: proposto. Privilégios, policies e invariantes ficam em [contracts/database.md](./contracts/database.md).

## 1. `app.accounts`

Raiz do isolamento, com uma linha por profissional.

| Campo | Tipo | Regra |
| :--- | :--- | :--- |
| `id` | `uuid` PK | `DEFAULT gen_random_uuid()`. O runtime não tem grant nessa coluna, então o `id` é sempre gerado pelo banco. |
| `owner_user_id` | `uuid NOT NULL UNIQUE` | `REFERENCES auth.users(id) ON DELETE RESTRICT` (FR-006). Vem só da sessão validada. |
| `created_at` | `timestamptz NOT NULL` | `DEFAULT now()` |

- A RLS fica `ENABLE` + `FORCE`.
- Uma segunda criação para o mesmo usuário é absorvida por `ON CONFLICT DO NOTHING`.
- O encerramento da conta fica fora da F0, e por isso a FK é `RESTRICT`.
- O acesso é feito por SQL em `accounts.ts`; a F0 não cria tabela Drizzle.

## 2. Contextos de transação

| Chave | Definida por | Lida por | Ausente ou `''` | Não UUID |
| :--- | :--- | :--- | :--- | :--- |
| `app.account_id` | `withAccountTransaction` | `app.current_account_id()`, nas policies de `accounts` e de domínio futuro | `NULL` → 0 linhas | erro de cast (falha fechada) |
| `app.user_id` | a transação interna de `resolveOrCreateAccount` | expressão inline, só na policy de `accounts` | idem | idem |
| `app.owner_id` (legado) | `withOwnerTransaction` | policies de `private.*` | inalterado | inalterado |

Todas as chaves são gravadas com `set_config(…, true)`, então somem no `COMMIT` ou no `ROLLBACK` e não passam para a próxima transação na conexão do Supavisor.

`app.current_account_id()` (FR-007) é `LANGUAGE sql STABLE SECURITY INVOKER SET search_path = ''` e retorna `NULLIF(current_setting('app.account_id', true), '')::uuid`. `EXECUTE` é revogado de `PUBLIC` e concedido só a `app_runtime`.

## 3. Papel `app_runtime`

Ele vem de `ALTER ROLE online_runtime RENAME TO app_runtime`, mantém o mesmo OID e conserva os grants de `private`. Os atributos são `LOGIN NOINHERIT NOBYPASSRLS` e não superusuário, com `statement_timeout = 5s` e `idle_in_transaction_session_timeout = 10s`. A senha é rotacionada pelo mantenedor depois do rename remoto; localmente, quem a define é o setup do teste.

Transições do bloco de rename (FR-001):

| Estado inicial | Ação |
| :--- | :--- |
| Só `online_runtime` | `RENAME` + limites |
| Só `app_runtime` | Só reaplica os limites |
| Ambos, ou nenhum | `RAISE EXCEPTION`; a migration é desfeita |

## 4. Chaveiro da KEK das contas

| Variável | Secreta | Formato |
| :--- | :--- | :--- |
| `ACCOUNT_KEK_ACTIVE_ID` | Não | `^v[1-9][0-9]{0,3}$`, apontando para uma versão presente |
| `ACCOUNT_KEK_V<N>` | Sim | Base64 canônico de 32 bytes, diferente da `SERVER_MASTER_KEY` |

`loadAccountKeyring()` devolve `{ activeId, keys: Map<id, KeyObject> }`, conforme [server-modules.md §S3](./contracts/server-modules.md). Na F0 não há consumidor; o uso começa na F2.

O relatório de varredura do bundle está definido em [ci-checks.md §K2](./contracts/ci-checks.md).
