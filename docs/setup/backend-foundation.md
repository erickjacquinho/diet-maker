# Fundação do backend Supabase (F0): runbook do projeto remoto

Status: **proposto**. Código e testes locais da F0 existem em `feat/backend-foundation-f0`; nada abaixo foi executado no projeto `diet-maker`. A validação só vale quando [`validation-report.md`](../../specs/25-10-26-fundacao-migracao-backend-supabase/validation-report.md) estiver completo.

Contratos e decisões: [database](../../specs/25-10-26-fundacao-migracao-backend-supabase/contracts/database.md), [environment](../../specs/25-10-26-fundacao-migracao-backend-supabase/contracts/environment.md), [quickstart](../../specs/25-10-26-fundacao-migracao-backend-supabase/quickstart.md) e [Decisão 15](../../refs/dieta-db/15-esquema-transferencia-backend-supabase.md). Contexto de conta e Auth: [online-auth.md](./online-auth.md).

## Regras de execução

- **Só o mantenedor executa**, e cada ação remota é confirmada no momento (FR-022b). O agente pode preparar comandos e conferir resultados.
- Nunca digite, cole em chat ou registre senhas, KEKs, tokens ou connection strings. O relatório guarda só horários, resultados e impressões digitais truncadas.
- Faça os passos 0–8 na ordem. A janela de indisponibilidade vai do passo 5 ao fim do passo 7 e precisa ficar **abaixo de 10 minutos** (FR-022a).
- Pré-requisito: validação local completa, CI verde no PR de `feat/backend-foundation-f0` e auditoria de segurança sem achado aberto.

## KEK das contas

A KEK vive só nas variáveis do ambiente Production da Vercel. Na F0 nenhum fluxo a consome (o uso começa na F2).

1. **Geração** (shell isolado, fora do repositório):

   ```bash
   KEK="$(openssl rand -base64 32)"
   ```

2. **Cadastro** na Vercel como **Sensitive**, somente em **Production**: `ACCOUNT_KEK_ACTIVE_ID=v1` e `ACCOUNT_KEK_V1=<valor>`. Preview e Development não recebem `ACCOUNT_KEK_*`.
3. **Backup DPAPI** ao lado dos backups descritos em [online-auth.md](./online-auth.md), fora do repositório.
4. **Restauração** num shell isolado, a partir do backup DPAPI, para uma variável `KEK_RESTORED`.
5. **Conferência** da impressão digital do original e do restaurado (R8):

   ```bash
   printf %s "$KEK" | base64 -d | sha256sum | cut -c1-16
   printf %s "$KEK_RESTORED" | base64 -d | sha256sum | cut -c1-16
   ```

   Os dois valores precisam ser iguais (SC-007). Registre só a igualdade e as impressões truncadas.
6. **Proibido**: gravar a KEK no banco, no Vault do Supabase, no repositório, no Preview ou no Development; reutilizar a `SERVER_MASTER_KEY`.

## Aplicação remota (passos 0–8)

Cada passo vira uma seção em `validation-report.md`, com horário e resultado.

| # | Passo | Verificação |
| :--- | :--- | :--- |
| 0 | Linha de base | `npx supabase projects list` mostra `sa-east-1`; o smoke atual do fluxo online passa |
| 1 | Dry-run | `npx supabase db push --linked --dry-run` lista só `<timestamp>_backend_foundation.sql`, sem comando destrutivo |
| 2 | Data API off e SSL | Painel → Integrations → Data API → **Enable Data API** desligado; `npx supabase ssl-enforcement get` mostra a exigência ativa; `/rest/v1/` e `/graphql/v1` respondem com status diferente de 200 |
| 3 | KEK | Seção acima: gerar, cadastrar como Sensitive em Production, backup DPAPI, restaurar e comparar |
| 4 | Senha nova do runtime | Gerar a senha, fazer o backup DPAPI e atualizar `ONLINE_DATABASE_URL` de Production com o usuário `app_runtime.<ref>` (pooler) |
| 5 | Migration | `npx supabase db push --linked`. **A janela começa aqui.** |
| 6 | Senha no banco | SQL editor: `ALTER ROLE app_runtime PASSWORD '…'` (valor do passo 4) |
| 7 | Republicação | Vercel → deploy de produção atual → **Redeploy** do mesmo commit, sem código novo. **A janela termina com o deploy pronto (< 10 min).** |
| 8 | Smoke e conferências | Ver abaixo |

Os passos 3 e 4 acontecem **antes** da migration, para encurtar a janela. Se o login do runtime falhar por mais de 2 minutos após o passo 7 (o Supavisor pode manter a autenticação do nome antigo, R2), execute o rollback.

### Verificações do passo 2

```bash
npx supabase ssl-enforcement get
curl -s -o /dev/null -w "%{http_code}\n" "https://<ref>.supabase.co/rest/v1/"
curl -s -o /dev/null -w "%{http_code}\n" "https://<ref>.supabase.co/graphql/v1"
```

Os dois `curl` precisam responder com status diferente de 200. Não envie nenhuma chave nesses probes.

### Passo 8: smoke e evidência da conexão do runtime (R10)

1. Smoke com a conta de teste do mantenedor: login, perfil profissional, catálogo e autorização de saves. O tráfego passa pelo `client.ts`, que exige a CA e usa `rejectUnauthorized: true` com verificação de hostname.
2. Localmente, `npx vitest run tests/server/online-db-client.test.ts` fica verde, provando essa exigência no código publicado.
3. No SQL editor:

   ```sql
   SELECT count(*) FROM pg_stat_activity WHERE usename = 'app_runtime';
   ```

   O resultado precisa ser maior que 0. Como só a aplicação usa esse papel, isso também prova que ela não roda com credencial administrativa (FR-005).
4. No SQL editor, `SELECT name FROM vault.secrets;` (só nomes, nunca o valor decifrado) não pode listar entrada da KEK (FR-015, US5-3).
5. Variáveis da Vercel, só nomes, ambientes e marcação Sensitive:

   ```bash
   vercel env ls production
   vercel env ls preview
   vercel env ls development
   ```

   Sem `ACCOUNT_KEK_*` fora de Production e sem `NEXT_PUBLIC_` sensível (FR-019, FR-022).

### Restrição de rede (R12)

**Não aplicável** no plano Hobby da Vercel: não há IPs de saída fixos, e a Decisão 15 condiciona a restrição por IP a eles. Continuam valendo TLS obrigatório, senha forte e rotacionada, papel restrito e Data API desligada. Registre essa decisão em `validation-report.md`.

## Rollback (falha nos passos 5–8)

1. `ALTER ROLE app_runtime RENAME TO online_runtime;`
2. Restaurar a senha anterior a partir do backup DPAPI.
3. Restaurar o `ONLINE_DATABASE_URL` anterior na Vercel.
4. Republicar o deploy de produção.
5. Marcar a migration como revertida, para que a próxima tentativa reaplique o rename (a migration é idempotente):

   ```bash
   npx supabase migration repair --status reverted <timestamp> --linked
   ```

6. Registrar a falha em `validation-report.md`.

O schema `app` pode permanecer: não tem dados nem consumidores.

## Modelo de registro

Para cada passo, em `validation-report.md`:

```text
Passo N — <nome>
Início/fim (UTC-3): <hh:mm> / <hh:mm>
Comando ou ação: <sem valores secretos>
Resultado: <ok | falhou | rollback>
Evidência: <região, lista do dry-run, status HTTP, impressões digitais truncadas, nomes de variáveis>
```
