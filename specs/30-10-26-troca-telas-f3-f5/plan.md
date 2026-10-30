# Plano — troca das telas para a API e F5 (remoção do modo local)

Ordem recomendada (a F5 só pode remover o modo local depois que as telas usarem a API):

## 0. Lacunas do servidor que as telas exigem (feitas / pendentes)
- [x] Mover vários acompanhamentos de uma vez: `POST /api/v1/agenda/follow-up-moves` (atômico).
- [x] Arquivar paciente invalida os rascunhos abertos na mesma transação.
- [x] Catálogo de objetivos: `app.objective_options` só com objetivos personalizados (os 4 padrão vêm da API, ids `system-*`, não arquivam); `GET|POST /objectives`, `POST /objectives/:id/archive`; o import do `.nutridiet` traz os personalizados.
- [x] Resumos de pacientes: `POST /patients/summaries` (até 25 IDs) com contagens de dietas/avaliações, última e penúltima avaliação, próximo acompanhamento e última atividade, em consultas em lote (sem N+1). A ordenação da lista por atividade usa esses dados no adaptador.
- [ ] Histórico de dietas: projeção resumida (metas e totais por variação) e paginação, no lugar da lista completa.
- [ ] Perfil profissional/`account` (nome de exibição, telefone) fora do `private.saves`.

## 1. Adaptadores HTTP das portas (sem mudar as telas)
Implementar no navegador, sobre `src/lib/api-client`, as portas já usadas pela aplicação:
`AccountContext`, `PatientRepository`, `ObjectiveCatalogRepository`, `PatientProfileReader`, `ClinicalRepository`, `DietRepository`/`PatientDietReader`/`DietHistoryViewReader`, `DietDraftStore` (substitui o IndexedDB), `FoodCatalogRepository`/`RecipeRepository`/`ReadyMealRepository`/`ReadyDietRepository`, favoritos e lembretes da agenda.
- IDs gerados no cliente passam a ser UUID (`crypto.randomUUID()`), compatíveis com a criação idempotente do servidor.
- Erros HTTP (404/409/422) mapeiam para os erros de aplicação existentes (`VERSION_CONFLICT`, `NOT_FOUND`, validação).
- `LibraryRepository.deleteIfUnreferenced` deixa de existir (sem `DELETE`): a UI passa a arquivar.

### Estado dos adaptadores (`src/lib/infrastructure/http/`)
- [x] `HttpPatientRepository`, `HttpObjectiveCatalogRepository`, `HttpClinicalRepository` (avaliações enviam só o digitado; o servidor recalcula composição e autopreenchimento).
- [x] `HttpDietRepository` (+ resumos e histórico), `HttpDietDraftStore` (lembra onde cada `draftId` mora; o servidor invalida rascunhos ao arquivar), `HttpFoodCatalogRepository`, `HttpRecipeRepository`, `HttpReadyMealRepository`, `HttpReadyDietRepository` ("excluir" arquiva).
- [ ] Favoritos e lembretes da agenda: a UI lê de forma síncrona, então entram na composição como cache em memória hidratado na abertura e com escrita assíncrona (`favoritesApi`/`agendaApi`).
- [ ] `AccountContext`: conta vinda da sessão (`/api/auth/session`), sem `LocalAccountContextRepository`.
- [ ] IDs: `idFactory` das aplicações passa a `crypto.randomUUID()`.

## 2. Composição
`browser-composition.ts` passa a montar `PatientApplication`/`DietApplication`/`LibraryApplication` sobre os adaptadores HTTP; `createConfirmedOperationCoordinator` deixa de marcar workspace sujo/sincronizar save.

## 3. F5
Remover `src/lib/infrastructure/local-db`, `file-system-access`, `diet-drafts` (IndexedDB), `profile-session`/`online-save-session`/`backup-application`, `/saves`, `/home`, `SavesDashboard`, `useSaveManagement`, `/api/saves/*`, o botão "Abrir configurações de saves" (`src/app/dashboard/page.tsx`) e a aba "Save" do `SettingsDialog`; grant de 8 h, bloqueio de aba; sem import de `local-db`/`file-system-access` em runtime. Oferecer a UI de importação do `.nutridiet` (F4) antes de remover o leitor local.

## 4. Documentação
ADR-009, Decisões 09–13 e `AGENTS.md` atualizados para o modelo 100% online.

## Estado da troca (modo `online`, atrás de flag)
`NEXT_PUBLIC_PERSISTENCE=online` liga o runtime online; sem a variável, o app continua no modo local (padrão até a F5).
- [x] `online-profile-session.ts`: sessão sem arquivo/grant/bloqueio; abre a conta sozinha quando `/api/auth/session` é válida.
- [x] `createOnlinePatientRuntime` (em `browser-composition.ts`): aplicações sobre os adaptadores HTTP, IDs UUID, sem workspace local (`handle` e `backupApplication` opcionais).
- [x] `online-preferences.ts`: favoritos e lembretes mantêm o cache síncrono da UI; hidratação na abertura e envio das diferenças em `markWorkspaceDirty` (em série, reenviando só o que falhou).
- [x] `SessionAwareAppShell`: abre a conta automaticamente, mantém o deep link e mostra erro com "Tentar novamente".
- [ ] Verificação manual de cada tela contra um Supabase real (Docker/staging) — pendente.
- [ ] Virar o padrão para `online` e executar a F5 (apagar o modo local, telas e rotas de saves, testes locais).

## Validação em Postgres real (Supabase local)
- [x] `supabase db reset --local` reaplica as 12 migrations em ordem sem erro.
- [x] `supabase db advisors --local --type security --level warn --fail-on warn`: sem problemas.
- [x] Invariantes C1–C9 e matriz M1–M14 (`backend-foundation.integration`) passam com as tabelas novas (sem `DELETE`, RLS forçada e política em todas).
- [x] `tests/server/domain.integration.test.ts`: fluxo clínico completo da conta A com o papel `app_runtime` e o driver `pg`, cifragem de S1 conferida no banco, conta B cega a todos os módulos, escritas entre contas e `DELETE` recusados.
- [ ] Telas contra esse banco (navegador), importação de um `.nutridiet` real e Vercel: pendentes.
