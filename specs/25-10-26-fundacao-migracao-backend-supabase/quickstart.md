# Quickstart: Validar a fundação (F0)

Status: proposto. Os comandos valem depois da implementação. Contratos: [database](./contracts/database.md), [server-modules](./contracts/server-modules.md), [ci-checks](./contracts/ci-checks.md), [environment](./contracts/environment.md).

## Pré-requisitos

- Docker Desktop em execução.
- Node 22 e `npm ci`.
- Supabase CLI 2.122.0 (`npx supabase --version`).
- Nenhuma credencial de produção no shell. As etapas §1–§4 usam apenas `localhost`.

## §1. Banco local do zero

```bash
npx supabase start -x realtime,storage-api,imgproxy,kong,mailpit,postgrest,postgres-meta,studio,edge-runtime,logflare,vector,supavisor
npx supabase db reset --local
```

Esperado: as três migrations são aplicadas sem erro e `auth.sessions` existe.

Como `postgres` local, defina uma senha local para o runtime:

```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -c "ALTER ROLE app_runtime PASSWORD 'local-only-<aleatório>'"
```

## §2. Advisors

```bash
npx supabase db advisors --local --type security --level warn --fail-on warn
npx supabase db advisors --local --type performance --fail-on none
```

Esperado: o primeiro termina com código 0, e o segundo apenas lista achados.

## §3. Testes

```bash
LOCAL_SUPABASE_DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres" ONLINE_DATABASE_URL="postgresql://app_runtime:<senha>@127.0.0.1:54322/postgres" npx vitest run tests/server --pool=forks
npm run test
npm run lint
```

Esperado:

- a matriz M1–M14 (com M6a) e as invariantes C1–C9 ficam verdes;
- os testes de `private.*` existentes ficam verdes com `app_runtime`;
- os testes de arquitetura e de tooling ficam verdes;
- sem as duas variáveis, a integração aparece como *skipped*, como hoje.

## §4. Build e varredura

```bash
npm run build
npm run verify:client-isolation
```

Esperado: `checked N patterns in M files` e código 0.

Prova negativa (só local; desfaça em seguida):

1. Acrescente a string `app.accounts` a um arquivo de `public/`.
2. Rode `npm run verify:client-isolation`. Esperado: `FAIL public/<arquivo> db-object x1` e código 1, sem o trecho.
3. Remova a string.

O teste `tests/tooling/verify-client-isolation.test.ts` cobre o mesmo caso com fixtures.

## §5. Remoto (`diet-maker`): somente o mantenedor

O runbook completo fica em `docs/setup/backend-foundation.md`. Cada passo exige confirmação explícita do mantenedor (FR-022b) e é registrado com horário em `validation-report.md`, sem valores secretos.

| # | Passo | Verificação |
| :--- | :--- | :--- |
| 0 | Linha de base | `npx supabase projects list` mostra a região `sa-east-1`; o smoke do fluxo online atual passa |
| 1 | Dry-run | `npx supabase db push --linked --dry-run` lista só `<timestamp>_backend_foundation.sql` |
| 2 | Data API off e SSL | Painel → Integrations → Data API → **Enable Data API** off; `npx supabase ssl-enforcement get` = enforced; `/rest/v1/` e `/graphql/v1` ≠ 200 |
| 3 | KEK | Gerar a chave com `openssl rand -base64 32`. Gravar `ACCOUNT_KEK_V1` e `ACCOUNT_KEK_ACTIVE_ID=v1` em Vercel Production, como Sensitive, e fazer o backup DPAPI. Restaurar o backup num shell isolado e comparar `printf %s "$KEK" \| base64 -d \| sha256sum \| cut -c1-16` do original e do restaurado; os valores devem ser iguais (SC-007). Registrar só o resultado da comparação |
| 4 | Senha nova | Gerar a senha e fazer o backup DPAPI. `ONLINE_DATABASE_URL` de Production passa a usar o usuário `app_runtime.<ref>` com a senha nova |
| 5 | Migration | `npx supabase db push --linked`. **A janela começa aqui** |
| 6 | Senha no banco | SQL editor: `ALTER ROLE app_runtime PASSWORD '…'` |
| 7 | Republicação | Vercel → deploy de produção atual → **Redeploy** do mesmo commit, sem código novo. **A janela termina com o deploy pronto (< 10 min)** |
| 8 | Runbook e smoke | Smoke de login, perfil, catálogo e autorização de saves com a conta de teste do mantenedor. Ele passa pelo `client.ts`, que exige CA e verifica certificado e hostname (R10). Localmente, `npx vitest run tests/server/online-db-client.test.ts` fica verde. Depois, no SQL editor, `SELECT count(*) FROM pg_stat_activity WHERE usename = 'app_runtime'` > 0, e `SELECT name FROM vault.secrets` (só nomes) não mostra entrada da KEK. `vercel env ls production`, `vercel env ls preview` e `vercel env ls development` não mostram `ACCOUNT_KEK_*` fora de Production |

**Rollback** (falha nos passos 5–8):

1. `ALTER ROLE app_runtime RENAME TO online_runtime`;
2. restaurar a senha anterior a partir do backup;
3. restaurar o `ONLINE_DATABASE_URL` anterior;
4. republicar;
5. marcar a migration como revertida com `npx supabase migration repair --status reverted <timestamp> --linked`, para que a próxima tentativa reaplique o rename (a migration é idempotente);
6. registrar a falha em `validation-report.md`.

O schema `app` pode permanecer, porque não tem dados nem consumidores.

**Restrição de rede**: não aplicável no plano Hobby, conforme R12. Registre isso na evidência.
