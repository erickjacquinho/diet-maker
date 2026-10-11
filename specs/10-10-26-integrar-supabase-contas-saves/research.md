# Pesquisa consolidada

Consultada em 2026-10-10, documental, sem teste de implementação/mutação remota. Dois agentes somente leitura usados conforme Phase 0 de speckit-plan.

## R1 — Identidade servidor

**Decisão:** Next.js existente como BFF; Supabase Auth somente no servidor, cookies HttpOnly e refresh backend. getUser + session_id existente; sem ledger web_sessions.

**Razão:** JWT pode continuar válido após logout; endpoints sensíveis conferem auth.sessions. Advertência do tutorial HttpOnly refere-se ao SDK que espera refresh no browser, que não será usado. UI local chama API própria sem tokens Auth. [Sessões](https://supabase.com/docs/guides/auth/sessions), [getUser](https://supabase.com/docs/reference/javascript/auth-getuser), [SDK](https://supabase.com/docs/guides/auth/choosing-a-server-package), [SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client).

**Alternativas:** SDK browser contraria backend obrigatório; middleware/getSession isolados não protegem outros handlers; ledger duplica provedor.

## R2 — Banco privado

**Decisão:** Data API desligada, schema privado via `pg`+Drizzle; runtime NOBYPASSRLS não dono, grants mínimos e ator transacional.

**Razão:** SDK `.schema('private')` exige exposição à API. Supavisor transacional atende serverless. Refinamento de 2026-10-10: a documentação atual da Supabase alerta que o pool transacional não suporta query pipelining e que Postgres.js, usado no primeiro setup, pipeline por padrão sem opção funcional para desligá-lo mantendo `sql.begin()`. O driver `pg` deixa o pipeline desligado por padrão; Drizzle suporta ambos os drivers. Jev sugeriu `pg` com confiança baixa (0,28); decisão final usa a evidência direta dos drivers e da Supabase, com pool máximo 1, TLS e sem prepared statements nomeados. O owner continua em `set_config(..., true)` dentro da transação Drizzle. [conexões Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres), [Postgres.js Supabase](https://supabase.com/docs/guides/database/postgres-js), [pipelining node-postgres](https://node-postgres.com/features/pipelining), [Drizzle PostgreSQL](https://orm.drizzle.team/docs/get-started-postgresql), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [set_config](https://www.postgresql.org/docs/current/functions-admin.html).

**Alternativas:** schema público com política dependente do browser, service_role normal ignorando RLS ou PGlite enviado ao servidor não cumprem os limites.

## R3 — Signup duplicado e recovery

**Decisão:** bootstrap INSERT-only, acesso só após sessão/e-mail verificados. Token de recovery selado curto; OTP consumido somente no POST final, sessão em memória do handler, novo login após reset.

**Razão:** duplicado confirmado pode retornar objeto ofuscado; duplicado não confirmado pode retornar usuário real sem provar posse. GET de e-mail pode ser visitado por scanner; não consumir nele. Falha após consumo requer novo link. [signUp](https://supabase.com/docs/reference/javascript/auth-signup), [fonte oficial](https://github.com/supabase/auth/blob/master/internal/api/signup.go), [senhas](https://supabase.com/docs/guides/auth/passwords), [templates/scanners](https://supabase.com/docs/guides/auth/auth-email-templates).

**Alternativas:** promover recovery a login abre catálogo antes de reset; editar perfil por retry permite alteração por terceiro; ledger extra é dispensável.

Reparo de falha de bootstrap: se o e-mail já foi confirmado, novo signup pode retornar objeto ofuscado. A sessão verificada do login, ainda sem acesso a saves, permite concluir os dados profissionais na mesma página de cadastro; INSERT-only do owner obtido pelo backend. Não depender do UUID retornado por signup duplicado para recuperar perfil faltante.

## R4 — Crypto local e vínculo

**Decisão:** DEK permanente cifrada sob segredo servidor; prova HMAC não clínica; material só em memória; Web Crypto AES-GCM no codec único de principal e backup.

**Razão:** usuário escolheu ausência de trânsito clínico e checkpoint offline; chave precisa ser utilizável localmente. GCM autentica AAD/ciphertext com IV novo; CryptoKey não extraível não oculta execução de quem controla browser. Prova deixa backend validar vínculo antes de liberar DEK, sem confiar em relato de decifração. [AES-GCM](https://www.w3.org/TR/webcrypto/#aes-gcm), [limites de segurança](https://www.w3.org/TR/webcrypto/#security-considerations), [NIST](https://csrc.nist.gov/pubs/sp/800/38/d/final), [bcrypt](https://supabase.com/docs/guides/auth/password-security).

**Alternativas:** E2EE estrita não escolhida; cifra backend trafega clínica; segredo em IndexedDB permite nova abertura offline.

## R5 — Caminhos existentes e legado

**Decisão:** envelope externo v2, payload atual v1/schema11; migrar em memória; claim atômico de identidade livre, cópia nova e original intacto.

**Razão local:** profile-session.writeSnapshot e backup-application.export/validate/restore têm caminhos distintos. Sidebar baixa Blob diretamente. browser-composition abre por account.id e mantém base existente: autorização precede hidratação, sem perder recuperação. Shell aceita runtime paused; precisa locked. PatientApplicationBootstrap retorna null.

**Alternativas:** cifrar só file port deixa menu em claro; reescrever legado viola recuperação; ID legado não prova dono; workspace existente não autoriza.

**Evidência:** `src/lib/application/{profile-session,backup-application,browser-composition}.ts`, `src/app/navigation/SidebarNavigationAdapter.tsx`, `src/app/SessionAwareAppShell.tsx`, `refs/dieta-db/11-recuperacao-e-portabilidade-local.md`, `docs/adr/ADR-009-nutridiet-principal.md`.

Conta clínica tem `id:string` e profile-session usa `nanoid(16)`, portanto local_account_id remoto é TEXT; apenas saveId/ownerId/keyId novos são UUID. Não mudar IDs clínicos para encaixar o catálogo.

## R6 — Localização e conservação

**Decisão:** handles por owner/save, checar permissão/cabeçalho, comparar identidade de destino, abortar stream em falha; Sincronizado só significa localização. Flush antes de desmontar editor por logout/prazo.

**Razão:** referências não dão permissão eterna nem atravessam origens; close em finally após write falho pode publicar parcial; desmontar timer de autosave pode perder edição visível. [File System Access](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access), [WICG](https://wicg.github.io/file-system-access/), [writable](https://fs.spec.whatwg.org/#api-filesystemfilehandle-createwritable).

**Alternativas:** path textual não dá acesso; nome não prova identidade; apagar dados no logout não é conservação; prazo não revoga conhecimento de chave.

## R7 — Ambiente/e-mail/segredos

**Decisão:** SMTP próprio/templates TokenHash, callbacks fixos e backup de segredo servidor; projeto dedicado foi selecionado antes do provisionamento. A premissa original de não publicar na Vercel foi substituída pelo pedido do usuário de 2026-10-11; ver escopo atualizado em `spec.md`.

**Razão:** SMTP padrão só atende equipe e tem limites; novo Free/default SMTP restringe templates. Auth usa e-mail em registros/claims. Vercel usa tipo Secret para segredos. [SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [Free](https://supabase.com/changelog/46599-changes-to-email-template-customisation-on-free-tier), [claims](https://supabase.com/docs/guides/auth/jwt-fields), [Vercel Secret](https://vercel.com/changelog/environment-variables-now-use-config-and-secret-types).

**Alternativas:** presumir projeto de outro produto, publicar para gerar link agora ou esconder chave sem grants/guard não atende o pedido.

## Fechamento

As decisões funcionais e de destino estão fechadas: projeto Supabase dedicado `diet-maker` na organização `Jacquinho`, projeto Vercel `nutridiet` no plano Hobby/região `gru1`, publicação autorizada, sem domínio próprio, e Gmail como remetente inicial. Em 2026-10-11, a Vercel atribuiu `nutridiet-eight.vercel.app`; migration, SMTP, templates Auth e callbacks foram aplicados no Supabase dedicado. A senha de app está no arquivo local ignorado `.env.smtp.local`. Ainda faltam confirmar recebimento do e-mail sintético, concluir os segredos/conexão runtime e fazer as provas HTTPS do quickstart. Não guardar credenciais nestes documentos.

## Revisão minimize — 2026-10-10

**Simplificação:** um registro remoto imutável atende criação e adoção legada. Retirar endpoint/coluna de relato de gravação e campo source sem efeito sobre autorização. Disponibilidade e checkpoint já pertencem ao file port/session local; não replicar esse estado no servidor. Guardar somente IDs/prova pública de tentativa para retries na associação local planejada, sem outro store ou DEK persistida.

**Equivalência:** dono/DEK/prova continuam atômicos; erro de arquivo conserva vínculo e trabalho; dashboard verifica a localização; active só depois de write/close e validação. Nenhum consumidor atual de `/api/saves` ou do relato remoto foi encontrado em src/tests: eram interfaces propostas sem implementação. Testes/código do mesmo módulo foram reunidos em tarefas de entrega, sem excluir cenários; validação integrada única evita pedir reexecuções redundantes.
