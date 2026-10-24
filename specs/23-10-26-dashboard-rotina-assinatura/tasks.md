# Tasks: Início semanal e assinatura informativa

**Input**: [spec](spec.md), [plan](plan.md), [modelo](data-model.md), [contrato](contracts/dashboard-settings.md) e [validação](quickstart.md).
**Estado**: 0/8 executadas. Somente planejamento; executar por /speckit-implement após validação humana.
**Âncora**: SPECIFY_FEATURE_DIRECTORY=specs/23-10-26-dashboard-rotina-assinatura.
**Regras de execução**: testes/casos de falha antes da lógica; fixtures pequenas junto dos testes, sem dados pessoais; preservar dirty work e processos. Nenhuma dependência/infraestrutura nova.

## US1 + US3 — Rotina completa, incluindo estados e isolamento

**Resultado independente**: semana e ações coincidem com a Agenda, sem leitura não autorizada nem dados do contexto anterior. US3 compartilha a mesma implementação da rotina.

- [ ] T001 [skill: $ponytail:ponytail] [US1] Registrar baseline/alcance e trabalho local em specs/23-10-26-dashboard-rotina-assinatura/implementation-log.md; ler regras/contrato/categorias e escrever primeiro tests/lib/agenda-summary.test.ts e tests/components/app/dashboard.test.tsx. Cobrir Dom–Sáb, hoje/fim, passados, tipos/datas distintas e simultâneas, legado, inválidas, ordem, vazios e viradas de mês/ano; sem save, loading, erro/retry, leitura única, runtime novo do mesmo save/conta, troca de conta, bloqueio/fechamento, resposta tardia e mudança de dia ao foco. Verificação: falhas observáveis para capacidades ausentes; fixtures inline ou helpers existentes, sem mutação externa. [FR-002, FR-003, FR-004, FR-005, FR-006, NFR-001, NFR-002, NFR-003, NFR-004, SC-001, SC-003]
- [ ] T002 [skill: $ponytail:ponytail] [US1] Extrair patientAppointmentDates de src/app/agenda/page.tsx para src/lib/agenda-summary.ts sem alterar seu contrato; reimportar na Agenda e projetar semana/ações no mesmo helper com utilitários existentes. Verificação: testes puros T001 passam, tipos em datas distintas e fallback legado preservados; sem refatorar controles da Agenda. [FR-002, FR-003, FR-004, NFR-002, SC-001]
- [ ] T003 [skill: $frontend-architecture-mindset] [US3] Implementar a rotina inteira em src/app/dashboard/page.tsx, com função privada DashboardAgenda no mesmo arquivo: montagem só com runtime autorizado, isolamento por instância, leitura única do hook, sete dias/lista, loading/erro/retry/vazios, CTA de saves e recálculo de hoje no foco/visibilidade sem polling. Verificação: todos os testes de dashboard T001 passam, inclusive resposta antiga e reabertura do mesmo save; sem dados clínicos extras, gravações ou consultas por dia. [FR-001, FR-002, FR-003, FR-005, FR-006, FR-009, FR-011, NFR-001, NFR-002, NFR-003, SC-001, SC-003, SC-004]

## US2 — Assinatura informativa no modal existente

**Resultado independente**: mesma aba acessível por Configurações e pelo Início, inclusive sem save, sem controles financeiros simulados.

- [ ] T004 [skill: $ponytail:ponytail] [US2] Acrescentar primeiro cenários em tests/components/organisms/settings-dialog.test.tsx e tests/components/app/sidebar-navigation-adapter.test.tsx para subscription, evento específico, foco, rascunho preservado, busy/suspended e ausência de formulário/rodapé de salvamento nesta aba. Verificação: casos demonstram o contrato ausente antes de T005, mantendo os de profile/save. [FR-007, FR-008, FR-009, FR-010, SC-002, SC-004]
- [ ] T005 [skill: $ponytail:ponytail] [US2] Ampliar SettingsTab e a aba em src/components/organisms/SettingsDialog.tsx; consumir o tipo e atender nutridiet:open-subscription em src/app/navigation/SidebarNavigationAdapter.tsx; adicionar linha secundária/atalho em src/app/dashboard/page.tsx. Preservar defaultTab, foco, drafts, altura, guardas, Saves e logout. Reconciliar design-system/components/profiles/organisms/settings-dialog.md e conferir design-system/components/registry.json. Verificação: T004 passa e o conteúdo segue o contrato sem campos, salvar, dados falsos ou cadastro global da composição privada. [FR-001, FR-007, FR-008, FR-009, FR-010, FR-011, NFR-001, SC-002, SC-004]

## Validação integrada

- [ ] T006 [skill: $webapp-testing] Ampliar tests/browser/settings-saves.spec.ts com dashboard, assinatura e três abas, aproveitando o setup existente: 1024/1280/1600px, zoom 200%, teclado, foco, altura fixa, drafts, saves/logout, placeholders, sem overflow e rotina com dados controlados. Verificação: cenários executáveis de quickstart.md definidos, mocks identificados; sem spec/harness separado de navegador. [FR-001, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, NFR-001, NFR-004, SC-002, SC-003, SC-004, SC-005]
- [ ] T007 [skill: $ponytail:ponytail] Executar uma vez os checks e o smoke controlado de specs/23-10-26-dashboard-rotina-assinatura/quickstart.md após o diff final: type-check, testes focados e regressões, lint tocado, catálogo/atomic design, Playwright e diff-check. Registrar comandos, screenshots e resultados em implementation-log.md. Verificação: requisitos cobertos; falhas preexistentes isoladas com evidência, sem refatorações alheias; repetir somente se houver nova mudança/falha. [FR-004, FR-010, FR-011, NFR-001, NFR-002, NFR-003, NFR-004, SC-001, SC-002, SC-003, SC-004, SC-005]
- [ ] T008 [skill: $webapp-testing] Executar os cenários de sessão real de specs/23-10-26-dashboard-rotina-assinatura/quickstart.md com conta/save de teste autorizados e dados preexistentes, registrando em implementation-log.md paridade com Agenda, isolamento e navegação/ausência de gravação. Verificação: diferenciar fixtures, browser mockado e integração real; se acesso estiver indisponível, registrar bloqueio e manter esta tarefa pendente. [FR-002, FR-003, FR-005, FR-006, FR-011, NFR-004, SC-001, SC-002, SC-003, SC-004, SC-005]

## Dependências e entrega

T001 → T002 → T003; T004 → T005; integrar tudo antes de T006 → T007 → T008. T004 pode ser preparado após T001, mas T003/T005 compartilham page.tsx e não devem editá-la simultaneamente. Não há necessidade de agentes paralelos.

US1 e US3: T001–T003; US2: T004–T005; validação comum: T006–T008. Total oito tarefas, todas com verificação e skill. A entrega completa inclui todas; não encerrar num MVP parcial. Sem commit/push, publicação, reinício, novos serviços ou cobrança real como efeito colateral.
