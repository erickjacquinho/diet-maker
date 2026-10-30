# Plano — troca das telas para a API e F5 (remoção do modo local)

Ordem recomendada (a F5 só pode remover o modo local depois que as telas usarem a API):

## 0. Lacunas do servidor que as telas exigem (feitas / pendentes)
- [x] Mover vários acompanhamentos de uma vez: `POST /api/v1/agenda/follow-up-moves` (atômico).
- [x] Arquivar paciente invalida os rascunhos abertos na mesma transação.
- [ ] Catálogo de objetivos (`objectiveOptions`): tabela `app.objective_options` (+ sementes de sistema), endpoints listar/adicionar/arquivar; importar do `.nutridiet` (hoje contado em `skipped`).
- [ ] Perfil e lista de pacientes: `GET /patients/:id/profile` e `POST /patients/summaries` com contagens de dietas/avaliações, última e penúltima avaliação, próximo acompanhamento e última atividade (evita N+1 e devolve a ordenação por atividade).
- [ ] Histórico de dietas: projeção resumida (metas e totais por variação) e paginação, no lugar da lista completa.
- [ ] Perfil profissional/`account` (nome de exibição, telefone) fora do `private.saves`.

## 1. Adaptadores HTTP das portas (sem mudar as telas)
Implementar no navegador, sobre `src/lib/api-client`, as portas já usadas pela aplicação:
`AccountContext`, `PatientRepository`, `ObjectiveCatalogRepository`, `PatientProfileReader`, `ClinicalRepository`, `DietRepository`/`PatientDietReader`/`DietHistoryViewReader`, `DietDraftStore` (substitui o IndexedDB), `FoodCatalogRepository`/`RecipeRepository`/`ReadyMealRepository`/`ReadyDietRepository`, favoritos e lembretes da agenda.
- IDs gerados no cliente passam a ser UUID (`crypto.randomUUID()`), compatíveis com a criação idempotente do servidor.
- Erros HTTP (404/409/422) mapeiam para os erros de aplicação existentes (`VERSION_CONFLICT`, `NOT_FOUND`, validação).
- `LibraryRepository.deleteIfUnreferenced` deixa de existir (sem `DELETE`): a UI passa a arquivar.

## 2. Composição
`browser-composition.ts` passa a montar `PatientApplication`/`DietApplication`/`LibraryApplication` sobre os adaptadores HTTP; `createConfirmedOperationCoordinator` deixa de marcar workspace sujo/sincronizar save.

## 3. F5
Remover `src/lib/infrastructure/local-db`, `file-system-access`, `diet-drafts` (IndexedDB), `profile-session`/`online-save-session`/`backup-application`, `/saves`, `/home`, `SavesDashboard`, `useSaveManagement`, `/api/saves/*`, o botão "Abrir configurações de saves" (`src/app/dashboard/page.tsx`) e a aba "Save" do `SettingsDialog`; grant de 8 h, bloqueio de aba; sem import de `local-db`/`file-system-access` em runtime. Oferecer a UI de importação do `.nutridiet` (F4) antes de remover o leitor local.

## 4. Documentação
ADR-009, Decisões 09–13 e `AGENTS.md` atualizados para o modelo 100% online.
