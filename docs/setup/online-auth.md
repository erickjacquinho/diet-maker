# Ambiente de conta online e Supabase

Este guia descreve o ambiente local e a configuração do serviço online.
O registro de implantação de 2026-10-11 está preservado em “Estado deste
setup”; ele é evidência histórica, não confirmação da disponibilidade ou da
paridade remota atual. Esta revisão documental de 2026-10-25 não executou
publicação, smoke remoto ou alterações de produção.

A fundação do backend (papel `app_runtime`, schema `app`, KEK das contas e runbook
remoto) está descrita em [backend-foundation.md](./backend-foundation.md).

## Limites de dados

Supabase Auth guarda identidade, credenciais, confirmação de e-mail e sessões.
O schema privado guarda o perfil profissional cifrado, o catálogo mínimo de
saves e as chaves protegidas. Pacientes, dietas, receitas, lembretes, banco de
trabalho, rascunhos, handles e arquivos `.nutridiet` continuam locais. A API
usa cookies HttpOnly e valida a sessão no servidor; o navegador não recebe
chave administrativa, conexão Postgres ou chave de wrapping.

## Variáveis do servidor

Copie `.env.example` para `.env.local`. `APP_ORIGIN` precisa ser a origem HTTP
exata (sem caminho ou barra final) usada pelo navegador; o backend a compara
com `Origin` para CSRF e monta os callbacks de Auth a partir dela.

| Variável | Uso |
| --- | --- |
| `APP_ORIGIN` | Origem exata, por exemplo `http://localhost:3000` local; em produção exige origem HTTPS estável e aprovada. |
| `SUPABASE_URL` | URL do Auth/Data API do projeto. |
| `SUPABASE_PUBLISHABLE_KEY` | Chave pública usada pelo cliente server-side; permanece em variável de servidor e não habilita consultas no browser. |
| `ONLINE_DATABASE_URL` | Conexão Postgres exclusivamente da role restrita `app_runtime` (antes da F0, `online_runtime`), após aplicar a migration. Nunca usar `postgres`, `service_role` ou URL admin no runtime. |
| `ONLINE_DATABASE_SSL_CA_B64` | Certificado PEM da CA oficial do Supabase codificado em Base64 de uma linha; obrigatório para conexões remotas e usado com verificação de certificado habilitada. Conexões Supabase locais em `127.0.0.1:54322` não precisam dele. |
| `SERVER_MASTER_KEY` | 32 bytes em Base64 canônico, usada para cifrar perfil profissional e envolver DEKs. Gere fora do repositório e armazene em secret manager. |
| `SERVER_MASTER_KEY_ID` | ID versionado, sem segredo, que acompanha ciphertexts e envelopes protegidos. |

Nenhuma dessas variáveis deve receber prefixo `NEXT_PUBLIC_`. Mantenha credenciais
e valores reais fora do Git, screenshots, logs e saída de testes. `LOCAL_SUPABASE_DB_URL`
é somente uma variável transitória de teste para acesso administrativo ao banco
local; ela não integra o runtime nem `.env.example`.

Para ambiente local, inicie Supabase com Docker e leia `supabase status -o env`
no terminal local; copie os valores correspondentes para `.env.local` sem
publicá-los. A URL Postgres local de administrador serve apenas para reset e
testes. `ONLINE_DATABASE_URL` deve apontar à role de runtime restrita criada na
migration. Em produção, `ONLINE_DATABASE_SSL_CA_B64` fornece a CA para TLS com
`rejectUnauthorized` habilitado; não desative a verificação do certificado.
O Mailpit local fica no painel de e-mail indicado pelo `supabase
status` (padrão `http://127.0.0.1:54324`) e captura e-mails de desenvolvimento
sem entregá-los a destinatários reais.

## Auth, e-mail e callbacks

Exija confirmação de e-mail e não aceite login anônimo. O formulário de signup
usa `/auth/confirm`; recuperação usa `/auth/recovery` e conclui a troca em
`/api/auth/reset-password`. O Origin configurado precisa coincidir com o
domínio efetivo da aplicação. Cadastre somente `APP_ORIGIN` e os callbacks
necessários na configuração de URL do Auth. Para produção, não autorize
wildcards, previews Vercel ou domínios que ainda não foram aprovados.

Em desenvolvimento, use Mailpit e contas com domínio `.test`; não encaminhe
e-mails locais para caixas reais. Em projeto remoto, signup e recovery dependem
de SMTP customizado para destinatários comuns. O SMTP padrão da Supabase só
entrega para endereços previamente autorizados da equipe e tem limite variável,
sem SLA; não serve como configuração de produção. O remetente inicial escolhido
é Gmail. O arquivo local ignorado `.env.smtp.local` recebe o endereço Gmail e
uma senha de app do Google; essa senha não é a senha da conta Google nem uma
credencial da Vercel. Não coloque esses dados em `.env.local`, no Git ou no chat.
A senha de app é necessária para configurar e testar o envio remoto. A
configuração Gmail de produção foi aplicada em 2026-10-11; o usuário confirmou
que recebeu e clicou no e-mail sintético. O primeiro clique ocorreu antes da
publicação do callback que consome o OTP; depois do deploy, um novo link ainda
válido precisa completar essa verificação. Use somente endereços de teste
controlados durante validação.

Referências oficiais para a configuração aplicada: [SMTP customizado](https://supabase.com/docs/guides/auth/auth-smtp)
e [URLs de redirecionamento](https://supabase.com/docs/guides/auth/redirect-urls).

## Migration e conexão

Valide migrations com Docker e Postgres local antes de qualquer destino remoto.
Confira o projeto linkado e revise `supabase db push --dry-run` antes de aplicar;
`supabase db reset --linked` apaga schema e dados remotos e não deve ser usado
como rotina. A migration `20261011002435_online_account_saves.sql` já foi
aplicada ao projeto dedicado `diet-maker`; o papel `online_runtime` (renomeado para `app_runtime` pela F0) tem login sem
superuser/BYPASSRLS e grants limitados às operações previstas.

A Vercel usa o pooler de transações Supavisor confirmado no painel: host
`aws-1-sa-east-1.pooler.supabase.com`, porta `6543`, database `postgres` e nome
de usuário qualificado para o projeto. A senha exclusiva da role fica em backup
DPAPI fora do repositório. Uma consulta real com `online_runtime` (nome anterior à F0) confirmou o
acesso usando a CA oficial e verificação TLS habilitada. Não desative a
validação de hostname/certificado nem use `postgres` ou `service_role` no
runtime. Veja [modos de conexão Postgres](https://supabase.com/docs/guides/database/connecting-to-postgres),
[SSL do Supabase](https://supabase.com/docs/guides/platform/ssl-enforcement) e o
[fluxo de migrations da CLI](https://supabase.com/docs/guides/local-development/cli-workflows).
Veja [modos de conexão Postgres](https://supabase.com/docs/guides/database/connecting-to-postgres)
e o [fluxo de migrations da CLI](https://supabase.com/docs/guides/local-development/cli-workflows).

## KEK, backup e rotação

Faça backup cifrado e com controle de acesso da `SERVER_MASTER_KEY` fora do
repositório e teste restauração em ambiente isolado. O código atual usa uma KEK
ativa por processo; perder a chave pode inutilizar perfis cifrados e DEKs
protegidas. Trocar valor/ID sem re-envolver todos os valores persistidos também
quebra a leitura. Não rotacione até existir procedimento para ler IDs históricos,
re-envolver cada ciphertext, validar a contagem e manter rollback seguro. A
KEK nunca é a senha do usuário nem a chave local AES-GCM que cifra arquivos.

## Vercel

O projeto Vercel `nutridiet` está criado e linkado à CLI, com hostname
`nutridiet-eight.vercel.app`; não há domínio próprio. Use a origem HTTPS exata
em `APP_ORIGIN`, já cadastrada nos callbacks do Supabase Auth. Não autorize
wildcards nem previews. Configure as sete variáveis deste guia somente no
ambiente Production, como segredos server-side sem prefixos públicos.
`vercel.json` fixa a região `gru1`, próxima ao banco em São Paulo e dentro do
limite de uma região do plano Hobby.

## Estado deste setup — registro histórico de 2026-10-11

O projeto Supabase dedicado `diet-maker` foi criado no usuário atualmente
autenticado e está linkado ao diretório. Migration, grants, RLS/`FORCE RLS`,
SMTP Gmail, templates e callbacks foram aplicados; o recebimento do e-mail
sintético foi confirmado pelo usuário. A senha de `online_runtime` (nome anterior à F0) e
`SERVER_MASTER_KEY` foram geradas e guardadas em backup DPAPI fora do
repositório; o login real no pooler com certificado verificado passou. Quatro
avisos `auth_rls_initplan` do advisor são de desempenho e estão explicados no
relatório de validação.

O deployment Production está `READY` em `https://nutridiet-eight.vercel.app`.
As sete variáveis server-side necessárias estão configuradas. O smoke HTTPS
validou signup, callbacks, login, recovery/reset, perfil e ciclo de registro,
listagem e autorização de save; bundle e logs passaram pela busca de segredos.
As contas e o save sintéticos foram removidos após o teste. A caixa de entrada
não foi lida: os callbacks positivos usaram OTPs gerados administrativamente,
e a entrega SMTP Gmail já havia sido confirmada pelo usuário em teste anterior.
`.env.smtp.local` é apenas a entrada local do SMTP do Supabase; não copie essa
senha para Vercel. Não use a senha normal do Gmail nem credenciais da Vercel
como senha SMTP.
