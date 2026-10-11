# Tasks: Contas Supabase e saves locais protegidos

**Input**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts](./contracts/backend-api.md) e [quickstart.md](./quickstart.md).

**Estado**: implementação autorizada por `$sdd-implement` em 2026-10-10. Publicação na Vercel autorizada em 2026-10-11. T024 e T029 estão verificadas; T026 permanece aberta para a validação de Edge e do picker nativo. Checkboxes representam somente entregas com evidência registrada.

Cada tarefa contém arquivos, cenário/prova e uma skill principal comprovada. Reunir teste e código da mesma entrega não muda a ordem: escrever cenários, comprovar falha significativa, implementar e verificar sucesso, conforme constituição IV. Componentes novos incluem perfil/registry/exports ao serem criados; a auditoria final apenas confirma conformidade. Paths de arquivos novos são propostas.

## Phase 1 — Setup

Registrar escopo e preparar ambiente. Nenhuma implementação antes da validação humana.

- [x] T001 [skill: general] Registrar baseline/aprovação, mudanças preexistentes e processos em `specs/10-10-26-integrar-supabase-contas-saves/implementation-log.md`; verificação: escopo documental aprovado antes de executar, checkout preservado e nenhum commit/push/deploy ou SQL sem alvo autorizado. [FR-021, SC-009]
- [x] T002 [skill: $nextjs-fullstack-master] Preparar dependências server-only compatíveis/fixadas em `package.json`/lock, `.env.example` e `supabase/{config.toml,templates/}`; verificação: Supabase local descartável/caixa de e-mail preparados, sem segredo real no Git ou NEXT_PUBLIC_SUPABASE. [FR-008, FR-013, FR-017, FR-021, NFR-002]

## Phase 2 — Foundation

Banco, crypto, requests e identidade bloqueiam as histórias. Cada tarefa de módulo escreve/comprova falhas de teste antes do código.

- [x] T003 [skill: $database-migrations-pro] Escrever primeiro `tests/server/online-db.integration.test.ts`, gerar migration CLI em `supabase/migrations/` e configurar Data API desabilitada: grants/RLS, TEXT para Conta clínica, UNIQUE, buckets e view privada com apenas id/user_id de auth.sessions; verificação: matriz local nega acesso público/ator ausente/owner forjado, dono único sob concorrência e runtime NOBYPASSRLS não owner, perfil/saves só INSERT/SELECT. [FR-008, FR-009, FR-014, FR-015, FR-017, NFR-003, SC-003, SC-005]
- [x] T004 [skill: $supabase-postgres-best-practices] Implementar conexão/schema/queries em `src/lib/server/online-db/{client,schema,repository}.ts`, Drizzle+node-postgres em Supavisor transacional, TLS, pool 1 e owner por transação; verificação: T003 passa com conexão reutilizada sem vazamento, bootstrap INSERT-only e nenhum conteúdo clínico remoto. [FR-008, FR-017, NFR-002, NFR-003]
- [x] T005 [skill: $backend-patterns] Escrever primeiro `tests/server/save-keys.test.ts` e implementar `src/lib/server/save-keys.ts` com node:crypto: DEK aleatória/wrapping AES-GCM, AAD/nonce novo, HKDF/HMAC e perfil cifrado; verificação: adulteração/tuple incorreto/falta de KEK recusados, dump não revela perfil/DEK, retry conserva a chave e catálogo/log não expõem segredo. [FR-012, FR-014, FR-016, NFR-002, SC-006]
- [x] T006 [skill: $nextjs-fullstack-master] Escrever primeiro `tests/server/request-security.test.ts` e implementar `src/lib/server/request-security.ts`/`src/app/api/auth/csrf/route.ts`: Origin/CSRF, schema/limite de corpo, rate limit atômico durável/limpeza limitada, no-store e erros redigidos; verificação: HTTP direto inválido recusado, requests distribuídos respeitam limite e buckets/logs não guardam e-mail/IP legíveis, senha ou token. [FR-004, FR-007, FR-017, FR-022, NFR-002, NFR-003, NFR-006]
- [x] T007 [skill: $supabase] Escrever primeiro `tests/server/auth-session.test.ts` e implementar `src/lib/server/auth/{supabase,session}.ts` por request, cookies HttpOnly/refresh servidor/getUser e auth.sessions; verificação: anônimo/e-mail pendente/JWT revogado/owner enviado não autorizam, sem getSession como autoridade ou tokens Auth em JSON/bundle. [FR-005, FR-015, FR-017, NFR-002, NFR-003, SC-005, SC-013]

## Phase 3 — US1: Landing, cadastro e login (P1)

Teste independente: HTTP/formulários/caixa local sem arquivo clínico; destino /saves pelo contrato. A jornada completa é validada uma vez em T026.

- [x] T008 [skill: $supabase] [US1] Escrever primeiro `tests/server/auth-signup.test.ts` e implementar `src/lib/server/auth/registration.ts`, `src/app/api/auth/{signup,login,logout,session,confirm-email,complete-profile}/route.ts` e `src/app/auth/confirm/route.ts`; verificação: servidor recusa confirmações/valores inválidos, aceita faixas meses/anos e zero/fração, duplicados não alteram perfil, conclusão após perfil falho exige sessão/e-mail verificados sem saves antecipados, confirmação só POST e logout revoga. [FR-002, FR-003, FR-004, FR-005, FR-007, FR-008, FR-013, FR-017, FR-022, SC-002, SC-013]
- [x] T009 [skill: $ui-styling] [US1] Escrever primeiro `tests/components/auth/registration-login.test.tsx` e criar `src/app/{page.tsx,login/page.tsx,criar-conta/page.tsx}`/`src/components/organisms/{LoginForm,RegistrationForm}.tsx`; registrar perfis/exports no catálogo ao criar. Verificação: Landing page, login/e-mail/senha/Entrar/recuperação discreta abaixo, todos os dados profissionais/faixas meses/anos, modos de confirmar/concluir cadastro, teclado/autocomplete/erros associados/loading, sem hidratar clínica pública. [FR-001, FR-002, FR-003, FR-004, FR-022, NFR-001, SC-001, SC-013]

## Phase 4 — US2: Recuperação (P1)

Teste independente: OTP e registro sintético de save, sem clínica; recovery não concede catálogo. T026 integra o fluxo real.

- [x] T010 [skill: $supabase] [US2] Escrever primeiro `tests/server/auth-recovery.test.ts` e implementar `src/lib/server/auth/recovery.ts`, `src/app/auth/recovery/route.ts` e `src/app/api/auth/{recovery,reset-password}/route.ts`; verificação: resposta genérica, cookie propósito/URL limpa, scanner GET não consome, OTP só POST/expirado/replay/concorrente recusado, sessão recovery só memória/sem catálogo, signOut global após reset e DEK invariável, falha após consumo pede novo link. [FR-006, FR-007, FR-012, FR-014, FR-017, NFR-002, SC-006, SC-007]
- [x] T011 [skill: $ui-styling] [US2] Escrever primeiro `tests/components/auth/recovery.test.tsx` e criar `src/app/{recuperar-senha,redefinir-senha}/page.tsx`/`src/components/organisms/{RecoveryPasswordForm,ResetPasswordForm}.tsx`, registrando perfis/exports; verificação: e-mail/retorno, nova senha/confirmação, envio genérico, erro/expiração/sucesso/teclado/foco e destino /login. [FR-006, FR-022, NFR-001, SC-001, SC-007]

## Phase 5 — US4: Vínculo e proteção do save (P1)

Antecede US3 por dependência de codec/grant. Teste independente: dois owners e ports de arquivo/workspace, com falhas e relógio controlados.

- [x] T012 [skill: $nextjs-fullstack-master] [US4] Escrever primeiro `tests/server/save-registry.test.ts`, implementar POST `src/app/api/saves/route.ts` e `src/app/api/saves/[id]/authorize/route.ts` com queries em `src/lib/server/online-db/repository.ts`; verificação: novo/legado usam registro único atômico/idempotente, duas contas/claim concorrente/prova inválida/payload conflitante/falha de wrapping recusados, generic404/409, dono único/DEK estável e material só authorize válido; nenhuma operação remota de relato de gravação. [FR-008, FR-012, FR-014, FR-015, FR-016, FR-017, FR-020, FR-022, SC-005, SC-006, SC-012]
- [x] T013 [skill: $ponytail:ponytail] [US4] Escrever primeiro `tests/infrastructure/protected-save.test.ts` e implementar `src/lib/domain/protected-save.ts`/`src/lib/infrastructure/crypto/protected-save.ts` reutilizando validador/migradores; verificação: round-trip schema11 conserva todas as coleções/IDs/receitas/lembretes, IV novo, tag/AAD/IV/cabeçalho/Conta clínica adulterados e versão desconhecida falham antes de importar; arquivo sem DEK/clínica clara. [FR-012, FR-015, FR-016, FR-019, NFR-004, NFR-005, SC-005, SC-008, SC-011]
- [x] T014 [skill: $ponytail:ponytail] [US4] Escrever primeiro `tests/infrastructure/browser-save-file.test.ts` e adaptar `src/lib/infrastructure/file-system-access/browser-save-file.ts`/ports existentes: handles por owner/save e IDs não secretos de retry na mesma associação, comparação de identidade, permission check, abort em erro e close antes de confirmação; verificação: cancelamento/destino igual/write/close falhos preservam cópia/workspace/revisões e não anunciam sucesso, sem DEK no storage, pedido de permissão por gesto. [FR-010, FR-011, FR-019, FR-020, NFR-004, SC-004, SC-008, SC-012]
- [x] T015 [skill: $ponytail:ponytail] [US4] Escrever primeiro `tests/application/online-save-session.test.ts` e implementar `src/lib/application/online-save-session.ts` com API própria, CryptoKey não extraível em memória, tuple/grant/deadline e flag de revogação pendente sem segredo; verificação: 8h/suspensão/reload offline/requests capturados/logout cobertos, falha/refresh/localização não renova grant, novas aberturas offline recusadas, nenhum material utilizável em storage/props/logs. [FR-005, FR-012, FR-015, FR-016, FR-018, NFR-003, SC-010, SC-011]
- [x] T016 [skill: $ponytail:ponytail] [US4] Ampliar primeiro `tests/lib/application/profile-session.test.ts`, `tests/fixtures/backup.ts` e `tests/infrastructure/backup-repository.integration.test.ts`, integrar codec/grant/criação/adoção em `src/lib/application/{profile-session,browser-composition}.ts`; verificação: autorização antes de base, ID clínico string preservado, cópia inicial lida/validada antes de active, fixture schema10 migrada em memória/original SHA-256 intacto, retry mesma DEK e workspace/revisões/drafts mais novos conservados no tuple correto. [FR-011, FR-012, FR-014, FR-015, FR-018, FR-019, FR-020, NFR-004, NFR-005, SC-006, SC-008, SC-012]
- [x] T017 [skill: $ponytail:ponytail] [US4] Atualizar primeiro `tests/application/backup-application.test.ts`/`tests/components/app/backup-actions.test.tsx`, integrar mesmo codec/grant em `src/lib/application/backup-application.ts`/`src/app/navigation/SidebarNavigationAdapter.tsx`; verificação: principal/menu cifrados, export mantém identidade/chave, restore direto exige autorização, cancelamentos/transações/drafts conservados. [FR-012, FR-015, FR-016, FR-018, FR-019, NFR-004, SC-008, SC-011]

## Phase 6 — US3: Dashboard e continuidade (P1)

Teste independente: catálogo/handles/relógio e recuperação de draft. Jornada integrada usa US1/US2/US4 em T026.

- [x] T018 [skill: $nextjs-fullstack-master] [US3] Escrever primeiro `tests/server/save-catalog.test.ts` e completar GET em `src/app/api/saves/route.ts`/checagem de localização em `src/lib/application/online-save-session.ts`; verificação: dois donos/>50 saves, contagem/ordem/paginação até todos, somente seus registros, sem path/clínica/progresso remoto, localização não concede grant. [FR-009, FR-010, FR-011, FR-017, FR-022, SC-003, SC-004]
- [x] T019 [skill: $proj-table-adequation-v2] [US3] Escrever primeiro `tests/components/saves/saves-dashboard.test.tsx` e criar `src/app/saves/page.tsx`/`src/components/organisms/SavesDashboard.tsx`, registrando perfil/exports; DataTable canônica totalRows/50, Badge textual e Criar/Importar/Abrir/Localizar. Verificação: empty/error/checking e motivos de desincronização, arquivo movido/permissão/referência perdida/mesmo nome, relink sem falsa sincronização/chave nova, teclado/estados DS. [FR-009, FR-010, FR-011, FR-022, NFR-001, SC-003, SC-004]
- [x] T020 [skill: $nextjs-fullstack-master] [US3] Atualizar primeiro `tests/browser/profile-session-gate.spec.ts` e integrar gates público/conta/save/locked em `src/app/{layout.tsx,SessionAwareAppShell.tsx,home/page.tsx}`; verificação: deep link/auto restore não hidrata clínica antes de autorização, público sem dados, paused conserva significado e /home encaminha entrada adequada. [FR-005, FR-015, FR-018, FR-019, NFR-003, SC-005, SC-010]
- [x] T021 [skill: $ponytail:ponytail] [US3] Ampliar primeiro `tests/hooks/useDietBuilderPage.test.ts`, `tests/infrastructure/backup-drafts.integration.test.ts`/`tests/application/online-save-session.test.ts` e integrar flush/guards em `src/hooks/useDietBuilderPage.ts`, `src/lib/application/browser-composition.ts`/`src/app/SessionAwareAppShell.tsx`; verificação: prazo/logout durante autosave/flush falho/checkpoint bloqueiam apresentação/operações imediatamente, conservam edição/drafts para mesmo tuple antes de desmontar, nenhum dado a outra conta e só escrita previamente aceita conclui. [FR-018, FR-019, NFR-004, SC-008, SC-010]
- [x] T022 [skill: $ponytail:ponytail] [US3] Atualizar consumidores/testes/exports do onboarding/perfil/logout em `src/app/navigation/{SidebarNavigationAdapter.tsx,sidebar-navigation-config.ts}` e `src/components/organisms/profile-onboarding.tsx`; verificação: criação/carregamento por dashboard/grant, sem bypass do gate antigo, URLs clínicas/nome clínico mantidos. [FR-005, FR-009, FR-011, FR-019, NFR-001]

## Phase 7 — US5: Preparar serviços e publicar (P2)

Setup remoto precede o deploy: projeto/organização/custo já foram autorizados, e SMTP/segredos precisam estar válidos antes de aplicar configuração de Auth e publicar.

- [x] T023 [skill: $supabase] [US5] Consolidar setup em `docs/setup/online-auth.md`/`.env.example`: variáveis servidor, KEK/backup restrito, SMTP/callbacks e Vercel; verificação: ambiente reproduzível, perda de KEK/troca de origem/limites de cache e Auth explícitos, nenhuma credencial ou URL pública inventada. [FR-012, FR-016, FR-021, NFR-002, SC-009]
- [x] T024 [skill: $supabase] [US5] Validar e aplicar a migration local no projeto Supabase dedicado autorizado; configurar grants mínimos, Auth/callbacks e SMTP Gmail com remetente validado; registrar evidências sem segredos em `implementation-log.md`. Verificação: runtime limitado, advisors aprovados ou findings explicados, e-mail sintético recebido e catálogo remoto preparado. Depende do arquivo `.env.smtp.local` preenchido; não usar projeto de outro produto. [FR-008, FR-013, FR-017, FR-021, NFR-002, NFR-003, SC-009]
- [x] T025 [skill: general] [US5] Atualizar `refs/dieta-db/{11-recuperacao-e-portabilidade-local,12-autenticacao-online-e-soberania-local,13-protecao-local-e-backup-simples}.md`, índice e ADR em `docs/adr/`; verificação: envelope/login/cifra/8h/legado/cache/e-mail coerentes, sem mudar schema clínico ou declarar publicação. [FR-012, FR-018, FR-019, FR-020, FR-021, NFR-005, NFR-007, SC-009, SC-012]

## Phase 8 — Validação transversal

Reunir as provas em uma passagem integrada. Não transformar revisão em nova execução das mesmas matrizes já aprovadas sem mudança ou finding.

- [ ] T026 [skill: $webapp-testing] Consolidar jornada completa em `tests/browser/{online-auth,online-saves,profile-save-load,backup-persistence}.spec.ts`/helpers e executar testes clínicos/backup afetados; registrar no implementation-log. Verificação: landing/signup/confirmação/login/reset/replay/perfil falho, dois donos/dois saves, três logins/relink/reset mesma DEK, permissões/legado/concorrência/offline8h/flush, principal/menu protegidos e nenhuma clínica na rede; receitas/lembretes/drafts/revisões sem regressão e File System Access real em Chrome/Edge. [FR-001, FR-005, FR-006, FR-007, FR-009, FR-010, FR-011, FR-012, FR-014, FR-015, FR-018, FR-019, FR-020, FR-022, NFR-004, NFR-005, SC-001, SC-002, SC-003, SC-004, SC-005, SC-006, SC-007, SC-008, SC-010, SC-011, SC-012, SC-013]
- [x] T027 [skill: $security-audit] Revisar diff/artefatos e provas de `tests/server/`, `tests/infrastructure/protected-save.test.ts`/`tests/browser/online-saves.spec.ts`; verificação: HTTP direto/RLS/CSRF/OTP/cross-owner negados, cliente/arquivo/storage sem SDK/credenciais/DEK persistida, perfil/chave cifrados e logs redigidos. Registrar findings no implementation-log e corrigir com testes focados; repetir matriz aprovada somente por mudança/falha/risco ainda aberto. [FR-012, FR-013, FR-014, FR-015, FR-016, FR-017, NFR-002, NFR-003, NFR-006, SC-005, SC-006, SC-007, SC-011]
- [x] T028 [skill: $design-system] Conferir perfis/categorias/exports criados junto dos componentes em `design-system/components/{registry.json,profiles/organisms/}`/`src/design-system/index.ts`, executar auditorias Atomic/DS/tabela/estados e browser 1024/1280/1600/zoom200%; verificação: teclado/foco/label/erro/status/contraste, house components, sem redesenho clínico ou tokens arbitrários. [FR-022, NFR-001, SC-001, SC-013]
- [x] T029 [skill: $webapp-testing] Concluir type-check/build, configurar variáveis server-side e publicar o app no projeto Vercel `nutridiet` após T024; testar em HTTPS a landing, signup/confirmação, login, recovery, callbacks e saves sintéticos; salvar `validation-report.md` com provas local/browser/remoto/deploy distintas. Não incluir secrets no bundle/log nem alegar E2EE estrita ou cifra de todo dispositivo; sem commit/push. [FR-001, FR-021, NFR-007, SC-009]

## Dependências e execução

```text
T001 → T002 → Foundation(T003–T007)
Foundation → US1(T008–T009) → US2(T010–T011)
Foundation + US1 → US4(T012–T017)
US1 + US4 → US3(T018–T022)
US2 + US3 + US4 → US5(T023–T025) → Validação(T026–T029)
```

T003 precede T004; dados/crypto/requests/guard prontos antes de US1. T016 depende T012–T015; T017 depende T016. T018/T019 usam registro/grant estabelecidos; T021 complementa o gate de T020. T024 só aplica no alvo após validação da migration local e resolução de alvo/custo; todos os testes usam dados sintéticos. Corrigir falha antes de declarar tarefa concluída.

Oportunidades sem nova camada de coordenação: testes/UI de US1 em arquivos distintos após contrato backend; handlers/testes de US2 e codec de US4 após a fundação; arquivo/crypto de US4 em arquivos distintos; catálogo servidor e organismo de US3 depois dos contratos; docs de US5 enquanto se resolve o ambiente. Não paralelizar edits de repository/shell/registry/.env compartilhados ou tarefa com dependência incompleta. Isso não é autorização para criar agentes.

## Estratégia e invariantes

US1 é o primeiro incremento demonstrável localmente. Não liberar clínica até vínculo/codec/gates e conservação completos. APIs privadas sempre autorizadas no backend, DEK permanente, chave utilizável só em memória, saves/prontuários/drafts locais, legado migrado em memória com original intacto, offline até8h somente no save já aberto, faixas1–6/6–12meses e DS/Atomic/WCAG preservados. A publicação do app web está autorizada após T024; sem upload clínico, OAuth/MFA/cobrança/PWA ou features de NFR-007.

A redução reúne todos os resultados das tarefas anteriores em entregas de módulo e validação única; não adia testes/erros, não transfere trabalho para etapas manuais e não transforma contratos necessários em opcional. A correspondência anterior/atual está na análise documental.

## Phase 9: Convergence

- [x] T030 [skill: $ponytail:ponytail] Ler e reconhecer o cabeçalho do arquivo associado antes de anunciar Sincronizado na dashboard; exibir Desincronizado com motivo para permissão, ausência, perda ou arquivo incompatível, sem conceder grant pela localização. Atualizar `src/lib/infrastructure/file-system-access/browser-save-file.ts`, `src/app/saves/page.tsx`, `SavesDashboard` e testes/perfil. Verificação: arquivo removido/substituído/mesmo nome/prova divergente não aparece Sincronizado; arquivo esperado legível aparece Sincronizado; autorizar continua obrigatório para abrir. Fonte: FR-010, FR-011, US3/AC3–4, plan: localização e dashboard (contradicts).
