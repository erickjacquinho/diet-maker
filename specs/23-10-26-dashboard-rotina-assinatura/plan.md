# Implementation Plan: Início semanal e assinatura informativa

**Date**: 2026-10-23 | **Spec**: [spec.md](spec.md) | **Status**: minimizado; implementação não iniciada.
**Checkout preservado**: `feat/configuracoes-perfil-save`. Diretório: `specs/23-10-26-dashboard-rotina-assinatura`.

## Escopo e invariantes

A [spec](spec.md) permanece integralmente inalterada: 11 FR, 4 NFR, 5 critérios de sucesso e três jornadas. Rotina real da Agenda, assinatura informativa em Configurações e atalho discreto no Início; placeholders somente para capacidades ausentes.

Preservar autorização e isolamento por instância de runtime, datas independentes/legadas, cinco estados de rotina, recálculo de hoje, leitura única, foco, rascunhos, busy/suspended, altura fixa, Saves e logout na sidebar. Sem cobrança, armazenamento, serviços ou dependências novos.

## Technical Context

TypeScript/React/Next.js, date-fns, componentes/tokens e Radix/Shadcn já instalados; testes com Vitest/Testing Library e Playwright. Desktop a partir de 1024px e WCAG 2.2 AA. Nenhuma migração, chamada financeira, polling ou leitura adicional de histórico.

## Desenho mínimo

1. **Uma página com limite de montagem**: src/app/dashboard/page.tsx observa getBrowserProfileSession via useSyncExternalStore e só monta sua função privada DashboardAgenda se getBrowserPatientRuntimeIfActive fornecer runtime autorizado. A função fica no próprio arquivo, sem componente público ou arquivo adicional. Recriar a subárvore ao mudar a instância de runtime, inclusive ao reabrir o mesmo save; desmontar ao bloquear/fechar. accountId/saveId isolados não bastam. Assinatura e CTA de saves ficam fora da subárvore.
2. **Uma leitura, duas apresentações**: DashboardAgenda consome usePatientsPage uma vez; patients/isLoading/error/retry alimentam semana e ações. Loading/error não mostram coleção anterior. Lista semântica de sete datas Dom–Sáb, contagens por tipo, hoje identificado e ações de hoje até sábado, por data/nome pt-BR/tipo. Links vão à Agenda; sem grade interativa ou edição clínica.
3. **Uma regra compartilhada**: extrair somente patientAppointmentDates da Agenda para src/lib/agenda-summary.ts e importá-la de volta sem mudar contrato/controles. Nesse helper, projetar semana/ações com normalizeDateKey, getTodayDateKey, formatEventType e date-fns existentes. Respeitar datas por tipo, fallback legado e ignorar inválidas. Não alterar usePatientsPage ou sessão.
4. **Hoje sem leitura extra**: recalcular ao montar/retornar à rota e em focus/visibilitychange quando visível; remover listeners ao desmontar. Não refazer a leitura de pacientes apenas porque mudou o dia.
5. **Mesmo modal**: ampliar SettingsTab com subscription. SidebarNavigationAdapter usa esse tipo e atende nutridiet:open-subscription com foco/guardas/cleanup existentes. Preservar nutridiet:open-saves, seu CTA e profile como entrada padrão da sidebar. Sem event bus genérico.
6. **Texto simples**: conteúdo de assinatura e mensagens seguem o [contrato](contracts/dashboard-settings.md); sem formulário, salvar, status/preços fictícios ou operações simuladas. Atualizar o perfil do SettingsDialog; conferir registry sem cadastrar composição privada da rota.

## Project Structure

Artefatos documentais permanecem nesta pasta: spec, plan, tasks, research, data-model, quickstart, contrato, analysis e dois checklists.

| Arquivo previsto | Alteração |
| --- | --- |
| src/app/dashboard/page.tsx | Página e função privada de rotina: sessão, leitura, calendário, ações, estados e atalhos. |
| src/lib/agenda-summary.ts | Novo helper puro; interpretação compartilhada e projeção semanal. |
| src/app/agenda/page.tsx | Importar a função extraída, sem refatorar a Agenda. |
| src/components/organisms/SettingsDialog.tsx | Tipo e aba informativa. |
| src/app/navigation/SidebarNavigationAdapter.tsx | Abrir a nova aba no modal existente. |
| design-system/components/profiles/organisms/settings-dialog.md | Reconciliar contrato da terceira aba. |
| tests/lib/agenda-summary.test.ts | Novo teste puro; dados pequenos no próprio teste. |
| tests/components/app/dashboard.test.tsx | Novo teste de rotina/estados/sessão; dados pequenos no próprio teste. |
| tests/components/organisms/settings-dialog.test.tsx | Ampliar cenários de aba/rascunho/rodapé. |
| tests/components/app/sidebar-navigation-adapter.test.tsx | Ampliar evento/foco/guardas. |
| tests/browser/settings-saves.spec.ts | Ampliar o smoke existente para dashboard e três abas, reaproveitando setup. |

Somente três arquivos de implementação/teste novos: helper e dois testes. Nenhum novo arquivo de componente, fixture compartilhada ou spec de navegador.

## Constitution Check

| Princípio | Aplicação no plano |
| --- | --- |
| I — Atomic Design | App compõe dependências permitidas; lib não importa rota; primitives preservados. |
| II — Design system | Categorias antes de perfis; tokens existentes; atualização restrita ao perfil SettingsDialog. |
| III — Desktop/acessibilidade | 1024px+, teclado, foco, estado acessível, zoom e geometria fixa mantidos. |
| IV — Contratos e falhas antes da lógica | Contrato pronto; testes puros/de estados antes de T002–T003 e testes do modal antes de T005. |
| V — SDD | Somente documentação agora; executar por /speckit-implement após validação humana. |

Sem exceções propostas; conformidade documental não declara conformidade do código.

## Execução, riscos e validação

Oito tarefas em [tasks.md](tasks.md): testes da rotina/isolamento → helper → página completa → testes do modal → assinatura/integração/catálogo → ampliar smoke existente → checks → sessão real. US3 é implementada junto da rotina, não como etapa de correção posterior. Baseline é parte da primeira tarefa.

O hook lê ao montar: autorização deve anteceder sua montagem. Não reaproveitar estado entre instâncias nem exibir dados velhos durante loading/error. Duas datas por tipo não podem ser reduzidas à primeira. As alterações locais em SettingsDialog, adapter e Saves devem ser preservadas; não restaurar arquivos.

Executar os checks e todos os cenários de [quickstart.md](quickstart.md), uma vez após o diff final; repetir apenas após nova alteração/falha. Distinguir fixtures, navegador mockado e sessão real; bloqueio real permanece pendente. Sem atualizar Spec Kit, criar branch, commit/push, reiniciar processos ou ampliar o PRD para consultas/faturamento.

## Resultado da minimização

14 → 8 tarefas; seis → três arquivos novos previstos. Removidos arquivo de componente privado, fixture compartilhada, spec de navegador separado e fase de correção duplicada. [Spec](spec.md), [modelo de dados](data-model.md), mensagens e comportamento público do [contrato](contracts/dashboard-settings.md) preservados; nenhum requisito adiado.
