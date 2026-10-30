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
