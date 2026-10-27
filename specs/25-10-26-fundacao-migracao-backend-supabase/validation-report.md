# Validation Report: Fundação do backend Supabase (F0), projeto remoto `diet-maker`

Status geral: **proposto**. Foram feitas apenas **leituras** dos passos 0–2 (autorizadas pelo mantenedor, via CLI e via MCP do Supabase somente-leitura), com o projeto já `ACTIVE_HEALTHY`; **nenhuma escrita** no remoto e nenhum passo validado. Leituras expuseram dois pontos que o mantenedor precisa tratar (passo 2). Só o mantenedor preenche este relatório, com confirmação explícita a cada ação (FR-022b). Nunca registre valores secretos: apenas horários, resultados, nomes de variáveis e impressões digitais truncadas. Procedimento: [`docs/setup/backend-foundation.md`](../../docs/setup/backend-foundation.md).

Evidência local e de CI (não substitui o remoto): ver [`implementation-log.md`](./implementation-log.md).

## Passo 0 — Linha de base

Status: **leitura feita (região e estado ok); smoke pendente**. Leitura via MCP `get_project` e CLI `projects list`: projeto `diet-maker` (ref igual ao `supabase/.temp/project-ref`), região **`sa-east-1`**, status **`ACTIVE_HEALTHY`** (estava `INACTIVE` antes; foi restaurado pelo mantenedor), Postgres 17. `list_migrations`: aplicada no remoto só `20261011002435_online_account_saves`. O **smoke** do fluxo online (login em produção) **não foi executado** (é do mantenedor).

## Passo 1 — Dry-run da migration

Status: **equivalente por leitura; dry-run da CLI não obtido**. `npx supabase db push --linked --dry-run` falhou com `DbConfigIpv6Error` (rede local sem IPv6; exige `supabase link` pelo pooler IPv4, ação do mantenedor). Pela comparação de `list_migrations` (MCP) com `supabase/migrations/`, a única migration pendente seria `20261026220111_backend_foundation.sql`, sem comando destrutivo no arquivo. Isso **não substitui** o dry-run: refazê-lo após o link.

## Passo 2 — Data API desligada e SSL

Status: **leitura feita; dois pontos NÃO conformes/inconclusivos**.

- **SSL**: `npx supabase --experimental ssl-enforcement get --project-ref <ref>` → `{"currentConfig":{"database":false}}`: a exigência de SSL **não está ativa**. O runbook exige `enforced`; ativar é uma escrita (mantenedor).
- **Data API / GraphQL**: probes `curl` sem chave em `/rest/v1/` e `/graphql/v1` → **401** (≠ 200, sem documento OpenAPI). Com a Data API ligada, esse mesmo 401 ocorreria sem apikey, então o resultado é **inconclusivo**: conferir o painel (**Enable Data API** desligado) e esperar um status diferente de 401 (por exemplo 404) quando estiver desligada.
- Advisor de segurança do remoto (MCP `get_advisors`): 1 WARN `auth_leaked_password_protection` (Auth, fora do escopo da F0; informativo, a CI só aplica o gate às migrations locais).

## Passo 3 — KEK (Production, Sensitive, backup DPAPI)

Status: proposto. Início/fim: — . Resultado: — . Evidência (impressão digital do original e do restaurado, igualdade, `vercel env ls production`): — .

## Passo 4 — Senha nova do runtime e `ONLINE_DATABASE_URL`

Status: proposto. Início/fim: — . Resultado: — . Evidência (backup DPAPI feito; usuário `app_runtime.<ref>` configurado; sem valores): — .

## Passo 5 — Migration (`db push --linked`)

Status: proposto. Início da janela: — . Resultado: — . Evidência: — .

## Passo 6 — Senha no banco

Status: proposto. Horário: — . Resultado: — .

## Passo 7 — Republicação

Status: proposto. Fim da janela: — . Duração total da janela (meta < 10 min): — . Resultado: — .

## Passo 8 — Smoke e conferências

Status: proposto. Evidência:

- smoke (login, perfil, catálogo, autorização de saves): — ;
- `npx vitest run tests/server/online-db-client.test.ts` (R10): — ;
- `pg_stat_activity` com `app_runtime` > 0: — ;
- `vault.secrets` sem entrada da KEK: — ;
- `vercel env ls` de production, preview e development: — .

## Restrição de rede (R12)

Não aplicável no plano Hobby (sem IPs de saída fixos). Registrado em: — .

## Rollback

Executado: não. Se executado, registrar motivo, horário e resultado: — .
