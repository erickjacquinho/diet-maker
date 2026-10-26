# Contract: Variáveis de ambiente

Status: proposto. Nenhuma variável usa o prefixo `NEXT_PUBLIC_` (FR-019).

| Variável | Muda na F0 | Secreta | Local | CI (passo de banco) | Vercel Production | Vercel Preview/Development |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `ONLINE_DATABASE_URL` | Usuário `app_runtime`, senha rotacionada | Sim | `postgresql://app_runtime:<local>@127.0.0.1:54322/postgres` | Gerada no job | Sensitive; usuário `app_runtime.<ref>` no pooler | Inalterado |
| `LOCAL_SUPABASE_DB_URL` (já usada pelos testes) | Não | Não (banco descartável) | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` | Mesmo valor | — | — |
| `ONLINE_DATABASE_SSL_CA_B64`, `SERVER_MASTER_KEY`, `SERVER_MASTER_KEY_ID` | Não | — | Inalteradas | — | Inalteradas | Inalterado |
| `ACCOUNT_KEK_ACTIVE_ID` | Nova | Não | Opcional | — | `v1`, Sensitive | **Proibida** |
| `ACCOUNT_KEK_V1` | Nova | Sim | Opcional, só valor de teste | — | Sensitive | **Proibida** |

Regras:

- `.env.example` cita `app_runtime` (FR-010a) e lista `ACCOUNT_KEK_ACTIVE_ID=` e `ACCOUNT_KEK_V1=` vazios, com o comentário "server-only; generate with `openssl rand -base64 32`; never reuse SERVER_MASTER_KEY".
- O runbook confere nomes, ambientes e a marcação Sensitive com `vercel env ls production|preview|development`, sem ler valores (FR-022).
- Os backups DPAPI da senha do runtime e da KEK ficam fora do repositório, ao lado dos já descritos em `docs/setup/online-auth.md`.
