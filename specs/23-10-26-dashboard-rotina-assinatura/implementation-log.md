# Implementation Log — Início semanal e assinatura informativa

## Baseline

- Feature: `specs/23-10-26-dashboard-rotina-assinatura`.
- Branch: `feat/configuracoes-perfil-save`.
- Checkpoint anterior ao preflight: `1a9d66823d900dec0e60d2642dda2a322d65b9e4` (`chore(dashboard): checkpoint before implementing weekly home`).
- O checkpoint preserva 28 arquivos já existentes, incluindo o trabalho local anterior em Settings/Saves e todos os artefatos desta feature. Nenhum push foi feito.
- O working tree estava limpo logo após o checkpoint.
- `check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks` resolveu a feature correta. Os checklists estão completos: requirements 16/16 e ux 14/14.
- A análise de entrada cobriu 20 requisitos FR/NFR/SC e oito tarefas; não encontrou lacunas ou conflitos bloqueantes. A constituição local foi lida e está alinhada ao plano.

## Escopo e evidências

Executar T001–T008 na ordem declarada. Preservar o estado anterior do usuário; implementar rotina apenas com runtime autorizado; sem cobrança, esquema, escrita ou serviço novo. Distinguir testes puros, navegador mockado e sessão local real.

### T001 — concluída

- Escrever primeiro os testes puros da projeção semanal e os testes de dashboard para autorização, estados, retry, isolamento por instância e respostas tardias.
- Regras locais, contrato de dashboard, categorias `data-display`/`overlays`, perfil atual de SettingsDialog e fundamentos/tokens do design system lidos antes das mudanças.
- `npx vitest run tests/lib/agenda-summary.test.ts tests/components/app/dashboard.test.tsx` — falha inicial esperada: 2 arquivos falharam; 5 testes de dashboard não encontraram a interface ausente; o arquivo de testes puros não carregou porque `src/lib/agenda-summary.ts` ainda não existe. Essa falha confirma o baseline ausente, não uma regressão.

### T002 — concluída

- `patientAppointmentDates` agora é compartilhada por `src/app/agenda/page.tsx` e `src/lib/agenda-summary.ts`; a nova projeção usa date-fns e as funções locais de normalização/rótulo.
- `npx vitest run tests/lib/agenda-summary.test.ts` — passou, 4 testes.
- `npm run type-check` — passou.

### T004 — concluída

- Adicionados cenários de assinatura informativa/sem controles, alternância preservando rascunho, retorno de foco e rejeição do evento durante operação busy ou overlay suspenso.
- `npx vitest run tests/components/organisms/settings-dialog.test.tsx tests/components/app/sidebar-navigation-adapter.test.tsx` — baseline esperado: 2 arquivos, 21 testes; 15 passaram e os seis novos falharam pela aba/evento ainda ausentes.
- `npm run type-check` — passou.
- `patientAppointmentDates` tinha um único consumidor antes da extração: `src/app/agenda/page.tsx`; controles e gravações da Agenda não foram alterados.

### T005 — concluída

- `SettingsTab` inclui `subscription`; o modal tem uma aba informativa sem formulário ou ações financeiras. O evento `nutridiet:open-subscription` abre essa aba, guarda o gatilho para retorno de foco e é ignorado durante operação ocupada ou outro overlay.
- A linha e o atalho do dashboard já foram entregues com T003; a composição permanece privada e sem entrada no registry. O perfil do `SettingsDialog` foi reconciliado com três abas; `SettingsTab` já constava como tipo no registry.
- Primeiro ciclo integrado: type-check e `npm run verify:design-system` passaram. Dois testes falharam por setup/mouse event incorretos nos cenários novos (o adapter não estava renderizado no teste do evento e o Tabs existente requer `mouseDown`); corrigidos apenas os testes.
- `npx vitest run tests/components/organisms/settings-dialog.test.tsx tests/components/app/sidebar-navigation-adapter.test.tsx` — passou, 2 arquivos e 21 testes.
- `npm run type-check` — passou.
- `npm run verify:design-system` — passou: 40 arquivos cobertos, 0 exports visuais sem cobertura, 0 findings bloqueantes.

### T006 — concluída

- O smoke Playwright cobre no mesmo `settings-saves.spec.ts` as três larguras, três abas com altura constante, teclado/foco, draft, retorno do atalho, Saves/logout, ausência de controles financeiros e o estado sem save.
- O cenário com dados controlados importa em uma conta local sintética um fixture sanitizado com um paciente sem dados clínicos pessoais e uma atualização de dieta para hoje. O catálogo e a autorização online do save são interceptados no navegador; a sessão/autenticação local e o runtime clínico ficam reais. O fluxo visual não cria ou altera paciente real.
- A primeira execução revelou duas condições do ambiente/harness: `APP_ORIGIN` local aponta para `localhost:3000` enquanto Playwright usa `127.0.0.1:3100` (resolvido por override apenas no processo de teste); e o `POST /api/saves` local retorna `503 INTERNAL_ERROR`. Por isso, o cenário controlado simula apenas registro/autorização remota do save; o endpoint `GET /api/saves` permaneceu real. T008 continua necessária para a prova com sessão e save preexistentes autorizados.
- Next dev e Next start compartilhavam o diretório `.next`; para não interferir na instância ativa em `3000`, as execuções Playwright usaram temporariamente `.next-sdd-test`. `next.config.ts`, `next-env.d.ts` e `tsconfig.json` foram restaurados e o diretório de build temporário removido após o smoke.
- Execução final: `APP_ORIGIN=http://127.0.0.1:3100`, `NEXT_DIST_DIR=.next-sdd-test`, `npx playwright test tests/browser/settings-saves.spec.ts --config=playwright.config.ts` — 3 testes passaram em 1,6 min.
- Capturas do modal/responsividade: `test-results/settings-saves-manages-sav-b5f25-on-without-stacking-dialogs/1024-settings-saves.png`, `1280-settings-saves.png`, `1600-settings-saves.png` e `512px-200-percent-settings.png`. O viewport 512 CSS px representa 200% do viewport desktop de 1024 px.

### T003 — concluída

- O Início monta a função privada `DashboardAgenda` apenas quando o runtime do snapshot coincide com `getBrowserPatientRuntimeIfActive`; cada objeto runtime recebe uma chave efêmera para desmontar resultados anteriores, inclusive na reabertura do mesmo save.
- Uma chamada de `usePatientsPage` alimenta calendário e ações. Loading/erro substituem a lista; foco/visibilidade atualizam a data sem repetir a leitura. A data inicial é preenchida no efeito do cliente para manter SSR/hidratação estáveis.
- `npx vitest run tests/components/app/dashboard.test.tsx tests/lib/agenda-summary.test.ts` — passou, 2 arquivos e 9 testes.
- `npm run type-check` — passou.

### T007 — concluída

- `npm run type-check` — passou.
- `npx vitest run tests/lib/agenda-summary.test.ts tests/components/app/dashboard.test.tsx tests/components/organisms/settings-dialog.test.tsx tests/components/app/sidebar-navigation-adapter.test.tsx tests/app/session-aware-app-shell.test.tsx tests/components/app/save-management.test.tsx tests/components/app/backup-actions.test.tsx tests/components/molecules/next-event-modal.test.tsx tests/app/agenda-reminder-scheduler.test.tsx` — passou, 9 arquivos e 64 testes.
- `npm run verify:design-system` — passou: 40 arquivos cobertos, 0 exports sem cobertura, 11 categorias homologadas, 0 findings bloqueantes.
- `npm run audit:atomic-design` — passou: 170 arquivos, 100%, 0 violações.
- `npx eslint src/app/dashboard src/app/agenda/page.tsx src/lib/agenda-summary.ts src/components/organisms/SettingsDialog.tsx src/app/navigation/SidebarNavigationAdapter.tsx tests/components/app/dashboard.test.tsx tests/components/app/sidebar-navigation-adapter.test.tsx tests/components/organisms/settings-dialog.test.tsx tests/lib/agenda-summary.test.ts tests/browser/settings-saves.spec.ts` — passou sem findings.
- Playwright controlado T006: `APP_ORIGIN=http://127.0.0.1:3100`, `NEXT_DIST_DIR=.next-sdd-test`, `npx playwright test tests/browser/settings-saves.spec.ts --config=playwright.config.ts` — passou, 3 testes em 1,6 min. Não houve mudança de código após essa execução; somente documentação de status/evidência foi atualizada.
- `git diff --check` — passou; Git emitiu apenas avisos de conversão LF→CRLF para três arquivos modificados.
- Screenshots conferidos: `test-results/settings-saves-manages-sav-b5f25-on-without-stacking-dialogs/1024-settings-saves.png`, `1280-settings-saves.png`, `1600-settings-saves.png` e `512px-200-percent-settings.png`. O último usa viewport de 512 CSS px como equivalente de layout a zoom 200% sobre 1024 px; não foi alterado o zoom físico do navegador.

### T008 — pendente por bloqueio de integração real

- Login sintético existente localizado pelo Mailpit e usado com a credencial do helper `tests/browser/helpers/online-account.ts`: `POST /api/auth/login` retornou `200`; `GET /api/saves` retornou `200` e `totalRows: 0`. Uma consulta local em transação somente leitura confirmou `private.saves` vazio.
- Na mesma sessão real, o Início exibiu corretamente o estado sem save; Assinatura abriu pelo atalho, sem formulário/dados financeiros, devolveu o foco ao acionador e não houve chamadas de escrita à API após o login.
- Tentei importar a fixture de rotina sanitizada pelo fluxo normal de saves, sem mocks. `POST /api/saves` retornou `503 INTERNAL_ERROR`, sem criar registro.
- Diagnóstico somente leitura: `ONLINE_DATABASE_URL` aponta para a base local em `127.0.0.1:54322`, a role efetiva é `online_runtime`, com SELECT nas tabelas pertinentes, mas sem INSERT em `private.saves`. A migration versionada `supabase/migrations/20261011002435_online_account_saves.sql` concede esse INSERT; a base local está fora do estado definido no repositório.
- Não apliquei migration, grant, SQL, alteração de serviço ou configuração. T008 permanece pendente até a permissão local prevista pela migration ser restaurada e existir um save autorizado para a sessão; então comparar rotina com Agenda e conferir ausência de gravações do dashboard. Nenhum dado clínico real foi usado.

### Convergência

- `check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks` resolveu esta feature. Extensões não definem hooks `before_converge` ou `after_converge`.
- Inventário verificado: 11 FR, 4 NFR, 5 SC, 11 cenários de aceite, decisões técnicas do plano e princípios I–V da constituição. Zero lacunas de implementação não rastreadas; T008 continua como única validação real pendente e já tem tarefa própria, sem duplicação.

### Complemento do diagnóstico — 2026-10-25

A execução de `25-10-26-corrigir-inconsistencias-fluxos` revalidou a hipótese anterior: todas as13colunas de INSERT do save já tinham concessão. A falha42501 ocorria no lock de `private.professional_profiles`, antes da inserção, por ausência da migration local20261022120000. Essa migration existente foi aplicada somente localmente;5arquivos/22testes de servidor passaram. O relato original acima é preservado, mas a atribuição de INSERT ausente fica corrigida por esta evidência. T008 continua pendente de sessão/arquivo real e comparação completa com Agenda.

## Aceite T008 concluído localmente —2026-10-25

O operador criou um novo save externo pela interface após o importador rejeitar a fonte de preparação inválida. A rejeição foi reproduzida: duas linhas nextFollowUps para o mesmo paciente. Corrigida somente a fixture para uma linha BOTH com datas independentes; validador e teste de backup13casos passaram. Nenhuma flexibilização no produto.

Na sessão nativa existente, sem mocks/pickers substituídos, o arquivo do operador nutridiet-profile.nutridiet foi reaberto/decifrado e confirmado vazio antes da preparação. Foi adicionado pela interface um paciente sintético, Paciente externo SDD1, com dieta25-10/avaliação26-10; envelopev2/cifra e conteúdo confirmados pelo handle externo, distinto de OPFS. Janela de observação começou após os checkpoints.

Aceite passou: sete dias Início/Agenda [1,1,0,0,0,0,0], pendências corretas, navegação e foco de Assinatura, reload/reabertura, quatro autorizações reais, hash externo imutável durante leitura, zero mutações API (authorize separado), bloqueio/limpeza por deadline com relógio browser controlado, logout/fechamento e troca real para outro owner sem itens anteriores, retorno à conta inicial. Não se alega expiração de oito horas em tempo real; somente o estímulo do relógio foi controlado, sem interceptar Auth/saves.

Hash final69e9bef5939d83a83aab96c6c87c4dff23f47d73b14f8a0c9d657d9f0cc3398c; evidência sanitizada versionada em ../25-10-26-corrigir-inconsistencias-fluxos/external-file-evidence.json. Cadastro real201 foi observado nos testes de rotina/online-saves; criação manual deste arquivo precedeu o observador. Sem deploy ou validação remota. T008 marcada somente após EXTERNAL_ACCEPTANCE_PASSED.
