# Contract: Módulos de servidor da fundação

Status: proposto. Todo módulo abaixo começa com `import 'server-only';` (FR-013).

## S1. `src/lib/server/online-db/accounts.ts`

```ts
export type AccountTransaction = Parameters<
  Parameters<ReturnType<typeof getOnlineDatabase>['transaction']>[0]
>[0]; // handle de transação Drizzle, sem acesso ao pool
export function withAccountTransaction<T>(
  accountId: string,
  run: (tx: AccountTransaction) => Promise<T>,
): Promise<T>;
export function resolveOrCreateAccount(userId: string): Promise<{ id: string; ownerUserId: string }>;
```

### `withAccountTransaction` (FR-011)

1. Valida `accountId` com o padrão UUID de `repository.ts`. Se inválido, lança `TypeError('A valid account id is required.')` antes de obter conexão (US4-1).
2. Abre `getOnlineDatabase().transaction(...)` e executa primeiro `SELECT set_config('app.account_id', $1, true)`.
3. Entrega ao `run` apenas o `tx`. Se `run` lançar um erro, a transação é desfeita, o erro sai sem alteração e o contexto some com o `ROLLBACK` (US4-3).

### `resolveOrCreateAccount` (FR-009, FR-009a)

- Executa a transação de resolução: valida `userId` da mesma forma, define **só** `app.user_id` (`set_config(…, true)`) e roda `INSERT INTO app.accounts (owner_user_id) VALUES ($1) ON CONFLICT (owner_user_id) DO NOTHING` e `SELECT id, owner_user_id … WHERE owner_user_id = $1`, ambos por `tx.execute(sql…)`, sem tabela Drizzle nova.
- A transação de resolução é interna ao módulo e não é exportada. Assim, nenhum outro código consegue abrir uma transação com `app.user_id`.
- É idempotente: repetir a chamada devolve o mesmo `id`. Se o usuário não existir em `auth.users`, o erro de FK é propagado.
- O `userId` vem do usuário da sessão validada; a ligação com a rota é feita na F1.

## S2. Regra de acesso ao pool (FR-012)

Só estes arquivos de `src/` podem importar `getOnlineDatabase` (`./client`, `@/lib/server/online-db/client`), `pg` ou `drizzle-orm/node-postgres`:

- `client.ts`, o dono do pool;
- `accounts.ts` (S1);
- `repository.ts`, que mantém o `withOwnerTransaction` legado e as funções legadas `findAuthSessionOwner` e `consumeAuthRateLimit` até a F5.

## S3. `src/lib/server/crypto/account-kek.ts`

```ts
export function loadAccountKeyring(env?: NodeJS.ProcessEnv): {
  activeId: string;
  keys: ReadonlyMap<string, KeyObject>; // crypto.createSecretKey
};
```

| Entrada | Resultado |
| :--- | :--- |
| `ACCOUNT_KEK_ACTIVE_ID` ausente ou fora de `^v[1-9][0-9]{0,3}$` | `Error('ACCOUNT_KEK_ACTIVE_ID must name a key version such as v1.')` |
| `ACCOUNT_KEK_<ACTIVE>` ausente | `Error('ACCOUNT_KEK_V1 is required.')`, nomeando a variável |
| Valor que não é Base64 canônico ou não tem 32 bytes | `Error('ACCOUNT_KEK_V1 must be 32 bytes encoded as canonical base64.')` |
| Material igual ao de `SERVER_MASTER_KEY` (`timingSafeEqual`) | `Error('ACCOUNT_KEK_V1 must differ from SERVER_MASTER_KEY.')` |
| Válido | `{ activeId, keys }` com todas as `ACCOUNT_KEK_V<N>` válidas |

- Nenhuma mensagem contém o valor (NFR-003).
- O material fica só em `KeyObject`, que não aparece em `JSON.stringify` nem em `util.inspect`. Por isso não há serialização customizada.
- A função só lê o ambiente quando é chamada, e na F0 nenhum fluxo a chama.
- A impressão digital do backup (FR-016) não faz parte do módulo. O runbook a calcula com `base64 -d | sha256sum`, sem código do projeto.
