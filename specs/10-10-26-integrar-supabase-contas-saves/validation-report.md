# Relatório de validação — contas Supabase e saves

**Data:** 2026-10-11 (America/Sao_Paulo)
**Estado:** T024/T029 concluídas. Deployment Production `READY` em `https://nutridiet-eight.vercel.app`; smoke HTTPS sintético passou. T026 segue aberta para Edge e picker nativo do Windows.
**Evidência detalhada:** [implementation-log.md](./implementation-log.md)

## Resultado por requisito

| ID | Resultado | Evidência / limite |
| --- | --- | --- |
| FR-001 | Aprovado | Landing e cinco rotas de conta/saves responderam `200` em Production; teste de viewport e teclado local permanece registrado. |
| FR-002 | Local aprovado | Formulário, teclado e login sintético em browser. |
| FR-003 | Local aprovado | Cadastro sintético, faixas e campos cobertos por testes de formulário/servidor. |
| FR-004 | Local aprovado | Validação server-side e requests inválidos cobertos por testes de Auth/HTTP. |
| FR-005 | Local aprovado | Signup, confirmação, login, logout e gates testados com Supabase local/Mailpit. |
| FR-006 | Local aprovado | Recovery, reset, replay e novo login passaram localmente. |
| FR-007 | Local aprovado | Respostas genéricas verificadas nos handlers de Auth. |
| FR-008 | Aprovado | Signup HTTPS criou o perfil profissional cifrado; login e sessão Production confirmaram o acesso ao runtime e ao perfil remoto. Migration, grants/RLS e conexão TLS verificada também passaram. |
| FR-009 | Parcial | Production registrou, listou e autorizou um save sintético; a matriz cross-owner continua provada localmente, sem repetição com dois usuários em Production. |
| FR-010 | Local aprovado | T030 reconhece o cabeçalho e diferencia os estados locais sem conceder grant. |
| FR-011 | Local aprovado | Relocalização da cópia protegida conservou ciphertext/identidade e exigiu autorização para abrir. |
| FR-012 | Local aprovado | Codec AES-GCM, saves/backup cifrados e ausência de tráfego clínico nos cenários verificados; não é E2EE estrita. |
| FR-013 | Local aprovado | Senhas delegadas ao Supabase Auth; fluxo sintético local validado. |
| FR-014 | Local aprovado | Retry/relogin/relocalização/reset conservaram a identidade do save e chave lógica nos testes. |
| FR-015 | Local aprovado | Tentativa cross-owner foi recusada; fluxo browser retornou 404 genérico. |
| FR-016 | Local aprovado | Testes de codec/storage e revisão de segurança não encontraram DEK persistida. |
| FR-017 | Parcial | Auth e catálogo/saves foram exercitados em Production; isolamento cross-owner e rate-limit continuam sustentados pelas provas locais. |
| FR-018 | Local aprovado | Deadline de oito horas usa relógio controlado; offline testado sem esperar oito horas reais. |
| FR-019 | Local aprovado | Regressões clínicas, drafts e checkpoints passaram nos testes direcionados registrados no log. |
| FR-020 | Local aprovado | Adoção legada preservou bytes do original e validou a cópia protegida. |
| FR-021 | Aprovado | Sete variáveis Production configuradas, deployment `READY`, HTTPS smoke passou e bundle/logs não apresentaram os segredos locais examinados. |
| FR-022 | Local aprovado | Estados e erros acessíveis testados; `SavesDashboard` homologado no catálogo DS. |
| NFR-001 | Parcial | Viewports 1024/1280/1600, zoom 200%, teclado e amostra de contraste em quatro rotas públicas passaram. Não é certificação WCAG integral; auditorias globais mantêm findings preexistentes. |
| NFR-002 | Parcial | TLS do pooler e cookie CSRF `Secure`/`HttpOnly`/`SameSite=Strict` verificados; callbacks/rotas HTTPS passaram. Atributos de todos os cookies Auth não foram auditados nesta rodada. |
| NFR-003 | Parcial | Revisão independente e testes de autorização/RLS locais sem finding explorável; Production negou sessão/saves anônimos e autorizou o owner sintético, sem repetir a matriz cross-owner. |
| NFR-004 | Local aprovado | Cancelamento, falha de escrita/importação e conservação de drafts cobertos por testes. |
| NFR-005 | Local aprovado | Migração determinística de fixture anterior e original intacto verificados. |
| NFR-006 | Parcial | Rate limits avaliados localmente; logs do deployment passaram por busca de padrões de credencial. Não foi feito teste de carga/abuso em produção. |
| NFR-007 | Escopo respeitado | Não há upload/sincronização clínica, OAuth, cobrança, PWA ou Edge Function nesta entrega. |
| SC-001 | Parcial | Páginas públicas responderam em Production; keyboard e viewports foram validados localmente no Chrome. Edge/picker seguem na T026. |
| SC-002 | Local aprovado | Campos inválidos e endpoints diretos recusam a criação. |
| SC-003 | Parcial | Catálogo Production do owner sintético persistiu através do recovery; a matriz de duas contas/dois saves segue comprovada localmente, não em Production. |
| SC-004 | Local aprovado | Arquivo reconhecido, permissão, perda, substituição/incompatibilidade e relocalização foram exercitados em testes locais. |
| SC-005 | Local aprovado | Casos de sessão, owner, prova e adulteração negados nos testes/revisão registrados. |
| SC-006 | Parcial | Chave estável após relogin/relocalização/reset passou localmente; em Production, perfil e registro do save persistiram através da recuperação de senha. |
| SC-007 | Local aprovado | Recovery/reset/replay e respostas públicas genéricas passaram localmente. |
| SC-008 | Local aprovado | Falha/cancelamento/rollback e importação compatível foram testados; original legado permaneceu intacto. |
| SC-009 | Parcial | Signup, confirmação, login, recovery/reset, callbacks e saves passaram por HTTPS com contas sintéticas. O usuário já confirmou entrega SMTP num teste anterior; nesta rodada não foi lida a caixa nem consumido o link enviado pelo SMTP. |
| SC-010 | Local aprovado | Offline e prazo testados com estado/relógio controlados; não aguardou oito horas reais. |
| SC-011 | Local aprovado | Testes de browser e revisão não observaram conteúdo clínico sendo enviado ao backend nos cenários avaliados. |
| SC-012 | Local aprovado | Fixture legada, SHA/original inalterado, claim único e cópia cifrada testados. |
| SC-013 | Local aprovado | Faixas/valores profissionais válidos e inválidos cobertos por componentes/handlers. |

## Tipos de prova

- **Unitária/integração local:** Vitest, Postgres/Supabase local, Auth/Mailpit e testes de aplicação; o teste focado de TLS do cliente Postgres passou (2/2). Suites e contagens estão no implementation-log.
- **Browser:** Chromium/Chrome com OPFS e IndexedDB reais, handles do filesystem exercitados e fluxos clínicos/offline/backup/autenticação. A seleção do arquivo foi automatizada; diálogo nativo do Windows não foi validado. Edge não está instalado neste ambiente; T026 permanece aberta.
- **Build:** `npm run build` passou numa cópia isolada após a mudança TLS (Next.js 15.5.22, 17 rotas estáticas/dinâmicas geradas), preservando `.next` do servidor de desenvolvimento. `npm run type-check` passou no checkout. Isto não prova disponibilidade remota.
- **Auditorias globais:** z-index sem findings; DS/Atomic/tabela ainda mostram itens antigos fora da feature. O perfil do `SavesDashboard` deixou de ser finding depois da homologação. Ver números e paths no log/evidence.
- **Supabase remoto:** projeto `diet-maker` (`mxmamolgulbljcocaonl`), São Paulo, ativo. Migration `20261011002435_online_account_saves.sql` aplicada; role runtime limitada e RLS/`FORCE RLS` auditados. SMTP Gmail, templates, `Site URL` e redirects aplicados; Auth health retornou HTTP 200. O usuário confirmou antes o recebimento/clique em e-mail sintético. Nesta rodada, os callbacks hospedados consumiram OTPs de teste gerados pela API administrativa Supabase; nenhum e-mail foi lido. Quatro avisos `auth_rls_initplan` do advisor são de desempenho. A senha da role e `SERVER_MASTER_KEY` permanecem em backup DPAPI fora do repositório; o pooler TLS verificado e as rotas Production de perfil/saves passaram.
- **Vercel:** projeto `nutridiet`, hostname `nutridiet-eight.vercel.app`, deployment Production `READY`. As sete variáveis necessárias estão presentes no ambiente Production; seus valores não foram consultados nesta verificação. Rotas HTTPS, signup, confirmação, login, recovery/reset e saves passaram. Busca em seis páginas/37 scripts públicos não encontrou os segredos locais examinados; busca nos logs do deployment não encontrou padrões de credencial.

## Pendências e limites

1. T026 continua aberta: Edge não está instalado e a caixa de seleção nativa do Windows não foi validada. Chrome/Playwright e a seleção automatizada foram exercitados; isso não substitui a prova dos dois ambientes pendentes.
2. SC-003/cross-owner, todos os atributos dos cookies Auth, teste de carga/abuso e clique no e-mail efetivamente enviado após a publicação não foram repetidos nesta rodada; as provas locais/anteriores continuam descritas acima.

## Smoke de produção — 2026-10-11

- Deployment único identificado como `READY`; o alias Production foi usado nos requests.
- `/`, `/login`, `/criar-conta`, `/recuperar-senha`, `/redefinir-senha` e `/saves` responderam `200`; `/api/auth/csrf` respondeu `200`; `/api/auth/session` e `/api/saves` sem sessão responderam `401`.
- Signup via `/api/auth/signup` respondeu `202`; o login validou o perfil remoto. O callback `/auth/confirm` mais `/api/auth/confirm-email` concluiu com `200`. Login passou com `200` e a sessão ficou pronta.
- Save sintético foi registrado (`201`), listado e autorizado (`200`); sua chave não foi impressa. Recovery respondeu `202`, o callback `/auth/recovery` e reset terminaram em `200`, e novo login manteve o perfil e o save acessíveis.
- Cookie CSRF foi observado com `Secure`, `HttpOnly`, `SameSite=Strict`. Bundle público e logs do deployment passaram pelas buscas de segredos/padrões de credencial.
- Contas, perfil e save sintéticos foram removidos; a consulta de verificação encontrou zero usuário com os identificadores de teste. Sem commit ou push.
