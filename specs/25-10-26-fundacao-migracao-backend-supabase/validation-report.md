# Validation Report: Fundação do backend Supabase (F0), projeto remoto `diet-maker`

Status geral: **passos 0–8 executados em 2026-10-28/29; pendências: Data API no painel, marcação `Sensitive` e duração da janela**. Foram feitas apenas **leituras** dos passos 0–2 (autorizadas pelo mantenedor, via CLI e via MCP do Supabase somente-leitura), com o projeto já `ACTIVE_HEALTHY`; a **única escrita** no remoto foi ativar a exigência de SSL do banco (passo 2, autorizada) e nenhum passo foi validado por completo; a Data API ainda precisa ser conferida no painel. Só o mantenedor preenche este relatório, com confirmação explícita a cada ação (FR-022b). Nunca registre valores secretos: apenas horários, resultados, nomes de variáveis e impressões digitais truncadas. Procedimento: [`docs/setup/backend-foundation.md`](../../docs/setup/backend-foundation.md).

Evidência local e de CI (não substitui o remoto): ver [`implementation-log.md`](./implementation-log.md).

## Passo 0 — Linha de base

Status: **leitura feita (região e estado ok); smoke pendente**. Leitura via MCP `get_project` e CLI `projects list`: projeto `diet-maker` (ref igual ao `supabase/.temp/project-ref`), região **`sa-east-1`**, status **`ACTIVE_HEALTHY`** (estava `INACTIVE` antes; foi restaurado pelo mantenedor), Postgres 17. `list_migrations`: aplicada no remoto só `20261011002435_online_account_saves`. O **smoke** do fluxo online (login em produção) **não foi executado** (é do mantenedor).

## Passo 1 — Dry-run da migration

Status: **executado pelo mantenedor (2026-10-29), ok**. Após `supabase link --project-ref <ref>` (a primeira tentativa de `--dry-run` falhou com `DbConfigIpv6Error`, rede local sem IPv6), `npx supabase db push --linked --dry-run` listou como pendente apenas `20261026220111_backend_foundation.sql`, em acordo com `list_migrations` (MCP) e sem comando destrutivo no arquivo.

## Passo 2 — Data API desligada e SSL

Status: **SSL ok (ativado e confirmado); Data API inconclusiva (pendente do painel)**.

- **SSL — corrigido**: a leitura inicial (`ssl-enforcement get`) deu `{"currentConfig":{"database":false}}` (exigência **não** ativa). Com autorização explícita do mantenedor, foi executado `npx supabase --experimental ssl-enforcement update --enable-db-ssl-enforcement --project-ref <ref>` (única escrita feita no remoto) e a releitura `ssl-enforcement get` retornou `{"currentConfig":{"database":true},"appliedSuccessfully":true}`: **exigência de SSL ativa**.
- **Data API / GraphQL**: probes `curl` sem chave em `/rest/v1/` e `/graphql/v1` → **401** (≠ 200, sem documento OpenAPI). Com a Data API ligada, esse mesmo 401 ocorreria sem apikey, então o resultado é **inconclusivo**: conferir o painel (**Enable Data API** desligado) e esperar um status diferente de 401 (por exemplo 404) quando estiver desligada.
- Advisor de segurança do remoto (MCP `get_advisors`): 1 WARN `auth_leaked_password_protection` (Auth, fora do escopo da F0; informativo, a CI só aplica o gate às migrations locais).

## Passo 3 — KEK (Production, Sensitive, backup DPAPI)

Status: **executado pelo mantenedor (2026-10-28)**. Resultado: KEK gerada fora do repositório, cadastrada como `ACCOUNT_KEK_V1` e `ACCOUNT_KEK_ACTIVE_ID` em Production (Sensitive) via CLI, com backup DPAPI em `~/`; o mantenedor relatou impressões digitais do original e do restaurado **iguais** (valores não registrados). Evidência: `vercel env ls --environment preview` e `--environment development` (projeto `nutridiet`) → "No Environment Variables found" (sem `ACCOUNT_KEK_*` fora de Production). `vercel env ls --environment production` lista `ACCOUNT_KEK_V1` e `ACCOUNT_KEK_ACTIVE_ID` só em Production; a CLI exibe o tipo como `Secret` e **não distingue `Sensitive`**: conferir a marcação no painel. `ACCOUNT_KEK_ACTIVE_ID` foi cadastrada numa segunda tentativa (2026-10-29), pois a primeira execução registrou só a `ACCOUNT_KEK_V1`.

## Passo 4 — Senha nova do runtime e `ONLINE_DATABASE_URL`

Status: **executado pelo mantenedor (2026-10-29)**. Resultado: senha gerada fora do repositório; backup DPAPI criado em `~/runtime-pass.dpapi`; `ONLINE_DATABASE_URL` regravada em Production (Sensitive) com usuário `app_runtime.<ref>` no pooler de transação (porta 6543). Evidência: saída da CLI `✓ Overrode ONLINE_DATABASE_URL` (Production, sem valores). O deploy em produção não foi trocado: continua com o ambiente anterior até o passo 7, e a senha no banco só muda no passo 6.

## Passo 5 — Migration (`db push --linked`)

Status: **executado pelo mantenedor (2026-10-29), ok**. Início da janela: não registrado. Resultado: `npx supabase db push --linked` aplicou `20261026220111_backend_foundation.sql`. Evidência: `list_migrations` (MCP) mostra `20261011002435` e `20261026220111` aplicadas; a role `app_runtime` existe com `rolcanlogin = true` e `online_runtime` não existe mais.

## Passo 6 — Senha no banco

Status: **executado pelo mantenedor (2026-10-29), ok**. Horário: não registrado. Resultado: `ALTER ROLE app_runtime PASSWORD` rodado no SQL editor com retorno "Success" (duas tentativas anteriores foram digitadas por engano no shell e falharam com `ALTER: command not found`, sem efeito). Observação de segurança: parte da senha apareceu mascarada no chat; recomenda-se rotacioná-la (repetir o passo 4 e este passo).

## Passo 7 — Republicação

Status: **executado pelo mantenedor (2026-10-29), ok**. Fim da janela e duração total (meta < 10 min): **não registrados**; o primeiro `redeploy` falhou por `--project` inválido e foi refeito com `--scope`, então a janela provavelmente passou da meta. Resultado: `npx vercel redeploy` do deploy de produção atual gerou `dpl_7bMBZkWksEb5oyuW4kL8XQSQ4vWs` (READY, production, commit `ac8b9c9`).

## Passo 8 — Smoke e conferências

Status: **executado (2026-10-29), ok**. Evidência:

- smoke (login, perfil, catálogo, autorização de saves): login e saves funcionando em produção após o redeploy, segundo o mantenedor; perfil e catálogo não registrados individualmente;
- `npx vitest run tests/server/online-db-client.test.ts` (R10): verde, 2 testes passaram (2026-10-29);
- `pg_stat_activity` com `app_runtime` > 0: 0 logo após o redeploy e **1** após o uso do app em produção;
- `vault.secrets` sem entrada da KEK: lista vazia;
- `vercel env ls` de production, preview e development: production com as 9 variáveis esperadas (incluindo as duas `ACCOUNT_KEK_*`); preview e development sem variáveis (sem `ACCOUNT_KEK_*` fora de Production).

## Restrição de rede (R12)

Não aplicável no plano Hobby (sem IPs de saída fixos). Registrado em: este relatório (nenhum IP de saída fixo no plano Hobby).

## Rollback

Executado: não. Se executado, registrar motivo, horário e resultado: — .
