# Tasks: Dashboard, navegação e Configurações

Fontes: [spec](spec.md), [plan](plan.md), [contrato](contracts/navigation.md).
T001–T004 (US1) já foram concluídas. A invocação explícita de `$sdd-implement` para esta feature em 2026-10-20 valida o SDD e autoriza T005–T011. Nenhuma tarefa autoriza migração online, SQL, publicação ou descarte de dados.

## Fase 1 — US1: modal vazio (P1, autorizado)

Objetivo: Configurações abre no contexto atual sem conteúdo funcional.
Critério independente: nas duas apresentações da sidebar, abrir, fechar e devolver foco sem mudar rota/dados/rede.

- [x] T001 [skill: general] [US1] Adicionar regressão em `tests/components/app/sidebar-navigation-adapter.test.tsx` para Configurações expanded/collapsed, conteúdo vazio, Escape/Fechar, retorno de foco e respeito ao callback do consumidor; verificar falha antes da implementação. [FR-001–003, NFR-002/003, SC-003]
- [x] T002 [skill: $shadcn] [US1] Compor Dialog vazio em `src/app/navigation/SidebarNavigationAdapter.tsx`, usando `onOpenAccount` existente e fechamento acessível; permitir origem opcional do foco no callback de `src/components/molecules/SidebarUserProfile.tsx` e `src/components/organisms/SidebarNav.tsx`, preservando callbacks sem argumentos, sem editar primitivos ou criar wrapper público; verificar T001. [FR-001–003, NFR-001/002/003]
- [x] T003 [skill: general] [US1] Registrar integração padrão do menu e origem opcional do foco em `design-system/components/profiles/molecules/sidebar-user-profile.md`, `design-system/components/profiles/organisms/sidebar-nav.md`, `design-system/components/profiles/ui/dialog.md` e consumidor em `design-system/components/registry.json`, sem modificar contrato visual ou alegar prova manual; validar JSON e catálogo. [NFR-001/004]
- [x] T004 [skill: general] [US1] Executar testes focados, tipos e lint de `src/app/navigation/SidebarNavigationAdapter.tsx` e registrar resultados/limites em `specs/20-10-26-remanejar-dashboard-configuracoes/validation-report.md`; manter as demais histórias abertas. [FR-013, NFR-004, SC-003]

## Fase 2 — US2: entrada e saves no dashboard (P1, aguarda validação)

Objetivo: conta válida entra no dashboard e opera saves locais sem página intermediária.
Critério independente: login/link antigo/sem arquivo/arquivo ativo chegam ao dashboard, que mantém todos os comandos e não libera clínica sem autorização.

- [x] T005 [skill: general] [US2] Preparar regressões em `tests/components/app/dashboard.test.tsx` e adaptar as suítes existentes `tests/components/app/backup-actions.test.tsx`, `tests/components/saves/saves-dashboard.test.tsx`, `tests/app/session-aware-app-shell.test.tsx`, `tests/server/auth-session.test.ts` e `tests/components/auth/registration-login.test.tsx`. Cobrir entrada completa/incompleta/anônima, erro de conta/catálogo versus vazio, links antigos/parâmetros, runtime ativo/ausente/locked, paginação, create/import/open/locate/adopt, propriedade e preservação do legado; backup sem arquivo, download, validação, confirmação, erro/cancelamento e rascunhos/checkpoints pendentes. Conferir também testes dos destinos de login/conclusão de cadastro existentes; comprovar falha relevante antes da mudança, sem duplicar suites de serviço/persistência. [FR-004/005/006/007/008/011/013, SC-001/002/005]
- [x] T006 [skill: $nextjs-fullstack-master] [US2] Mover o controlador de `src/app/saves/page.tsx` e o fluxo de backup de `src/app/navigation/SidebarNavigationAdapter.tsx` diretamente para `src/app/dashboard/page.tsx`. Reutilizar `src/components/organisms/SavesDashboard.tsx`, primitivos e BackupApplication, sem novo wrapper/serviço. Preservar parse, cancelamento, paginação, associação owner/save, handlers, cifra, validações, confirmações e recuperação de pendências; sem arquivo autorizado, impedir backup e explicar indisponibilidade. Retirar saída automática para Pacientes, ajustar título para Início/Arquivos locais e verificar os cenários de arquivo/backup de T005, incluindo falha/cancelamento sem perda de dados. [FR-005/006/010/011/013, NFR-001, SC-002/005]
- [x] T007 [skill: $nextjs-fullstack-master] [US2] Integrar entrada e gates em `src/app/SessionAwareAppShell.tsx`, `src/app/api/auth/{login,session,complete-profile}/route.ts`, `src/components/organisms/{LoginForm,RegistrationForm}.tsx` e `src/app/{home,saves}/page.tsx`: dashboard com shell sem runtime, módulos clínicos/locked protegidos, destinos completos e links antigos para dashboard sem loops/parâmetros perdidos. Conferir `src/app/AgendaReminderScheduler.tsx` sem operações clínicas quando não há conta local; verificar regressões de shell/auth de T005 sem alterar APIs/formato dos saves ou autorização. [FR-004/005/007/008/012/013, SC-001/005]

## Fase 3 — US3: sidebar simples e backup no dashboard (P2)

Objetivo: módulos acessíveis, perfil com Configurações/Sair e comandos de arquivo no dashboard.
Critério independente: sete destinos nas duas apresentações, backup protegido acessível e recuperação global mantida.

- [x] T008 [skill: $shadcn] [US3] Ajustar `src/app/navigation/sidebar-navigation-config.ts` e fixtures em `tests/components/organisms/sidebar-navigation-fixtures.ts` para os sete destinos na ordem do contrato, sem remover módulos/alterar geometria. Simplificar perfil em `src/app/navigation/SidebarNavigationAdapter.tsx` e `src/components/molecules/SidebarUserProfile.tsx` para Configurações/Sair, retirando Visão geral e injeção de backup sem quebrar callbacks ainda consumidos; manter feedback e recuperação de checkpoint em `src/components/organisms/SidebarNav.tsx`. Antes de alterar, atualizar testes existentes de adapter/perfil/sidebar para sete links, seleção, expanded/collapsed, modal/foco e recuperação global; conferir falha relevante e depois aprovação, com backup apenas no dashboard. [FR-001/003/009/010/012, NFR-001/002, SC-003/004/005]
- [x] T009 [skill: general] [US3] Atualizar contratos/perfis afetados em `design-system/components/profiles/organisms/sidebar-nav.md`, `design-system/components/profiles/molecules/sidebar-user-profile.md` e consumidores em `design-system/components/registry.json`, além de `docs/adr/ADR-007-screen-architecture-and-navigation.md`; distinguir implementado de conforme e validar catálogo. [FR-009/010, NFR-001/004]

## Fase 4 — validação do remanejamento completo

- [x] T010 [skill: general] Atualizar cenários de `tests/browser/online-saves.spec.ts` e `tests/browser/backup-persistence.spec.ts` para o dashboard; executar regressões afetadas de T005/T008, tipos, lint, catálogo e build conforme `specs/20-10-26-remanejar-dashboard-configuracoes/quickstart.md`. Registrar comandos/resultados em `specs/20-10-26-remanejar-dashboard-configuracoes/validation-report.md`, mantendo trabalho anterior e sem publicar. [FR-001–013, NFR-001–004, SC-001–005]
- [ ] T011 [skill: $webapp-testing] Validar com conta/arquivos de teste o fluxo completo de `specs/20-10-26-remanejar-dashboard-configuracoes/quickstart.md` e dos cenários de navegador de T010; registrar prova visual/autenticada/persistência e limites em `specs/20-10-26-remanejar-dashboard-configuracoes/validation-report.md`, sem alegar sucesso por mocks. [FR-006/008/011/012/013, NFR-002/004, SC-001–005]

## Dependências e estratégia

US1 está concluída: T001 -> T002 -> T003 -> T004. Nesta execução aprovada: T005 -> T006 -> T007 -> T008 -> T009 -> T010 -> T011. Testes de integração acompanham as mudanças que protegem; a prova autenticada final continua independente. Sem paralelismo em arquivos compartilhados.

Total: 11 tarefas, dez concluídas (T001–T010) e uma pendente (T011). US2 e US3 estão implementadas; falta a prova autenticada e visual da execução em navegador. Todas as linhas incluem uma skill existente, caminhos e verificação observável. Os marcadores de skill precedem os demais labels conforme a orquestração SDD. A redução agrupa mudanças coesas e reaproveita cobertura; não remove requisitos ou verificações.
