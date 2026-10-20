# Implementation Plan: Dashboard, navegação e Configurações

**Branch atual**: `main` (sem commits/publicação) | **Date**: 2026-10-20 | **Spec**: [spec.md](spec.md)
**Input**: `specs/20-10-26-remanejar-dashboard-configuracoes/spec.md`

## Summary

Reorganizar rotas e apresentação mantendo os saves locais. `/dashboard` recebe o controlador de `/saves`, sem sair automaticamente para Pacientes quando há arquivo ativo. O shell pode renderizar com conta válida sem arquivo; operações clínicas continuam protegidas. Configurações é um Dialog vazio na composição do adapter existente, sem nova família pública.

**Autorizado agora**: somente US1 (modal e validação). US2/US3 aguardam validação humana e execução por `/speckit-implement`. A autorização explícita do modal não autoriza executar as demais histórias ou migrar persistência.

## Technical Context

**Language/Version**: TypeScript 5.7, React 19 e Next.js 15 conforme dependências/lock existentes.
**Primary Dependencies**: Radix Dialog/DropdownMenu e componentes locais instalados; nenhuma dependência nova.
**Storage**: `.nutridiet` protegido, PGlite/IndexedDB e referências atuais; nenhum schema novo.
**Testing**: Vitest/Testing Library e cenários Playwright existentes; evidência autenticada separada.
**Target Platform**: Web desktop >=1024px.
**Project Type**: Next.js App Router existente.
**Performance Goals**: Zero requisições adicionais para abrir Configurações; nenhum polling ou painel novo.
**Constraints**: Preservar segurança, checkpoints, rascunhos, APIs e trabalho sujo anterior.
**Scale/Scope**: Uma rota de entrada, uma rota de compatibilidade e três histórias; nenhuma entidade persistente nova.

## Constitution Check

| Gate | Antes do design | Após design |
| --- | --- | --- |
| Atomic Design | PASS | Integração em app; dependências descendentes |
| Design system canônico | PASS | Navigation/overlays antes dos perfis; primitivos preservados |
| Desktop e acessibilidade | PASS | Nome, foco, teclado e dismissal no contrato |
| Contratos antes do código; testes em tests/ | PASS | Cenários negativos e regressões especificados |
| Execução guiada e evidência | PASS | Só US1 autorizada; restante proposto |

Nenhuma violação exige exceção.

## Project Structure

### Documentation (this feature)

`specs/20-10-26-remanejar-dashboard-configuracoes/`: spec.md, plan.md, research.md, data-model.md, contracts/navigation.md, quickstart.md, tasks.md, checklists/requirements.md, checklists/navigation.md, analysis.md e validation-report.md.

### Source Code (repository root)

- Agora: `src/app/navigation/SidebarNavigationAdapter.tsx`, `tests/components/app/sidebar-navigation-adapter.test.tsx` e documentação do perfil `design-system/components/profiles/molecules/sidebar-user-profile.md`.
- Depois: `src/app/dashboard/page.tsx`, `src/app/saves/page.tsx`, `src/app/home/page.tsx`, `src/app/SessionAwareAppShell.tsx`, `src/app/navigation/sidebar-navigation-config.ts`.
- Destinos de auth: `src/app/api/auth/{login,session,complete-profile}/route.ts` e `src/components/organisms/{LoginForm,RegistrationForm}.tsx`.
- Apresentação: `src/components/organisms/SavesDashboard.tsx` e `src/components/molecules/SidebarUserProfile.tsx`.
- Regressões: novo `tests/components/app/dashboard.test.tsx`; adaptar testes existentes de shell/auth/sidebar/saves e `tests/components/app/backup-actions.test.tsx`, mais cenários existentes `tests/browser/online-saves.spec.ts` e `tests/browser/backup-persistence.spec.ts`.

**Structure Decision**: Mover o controlador de rota e o fluxo de backup diretamente para a composição de `dashboard/page.tsx`, sem importar uma página dentro de outra. Reusar SavesDashboard, BackupApplication e primitivos; adaptar a cobertura de backup existente. Sem componente extra de backup, serviço, contexto ou wrapper público para o modal vazio.

## Fase A — US1 autorizada agora

1. Teste de integração para menu -> Dialog vazio, expanded/collapsed, fechamento e retorno do foco; callback `onOpenAccount` explícito do consumidor continua válido.
2. Estado local no adapter, callback padrão e Dialog/Content/Header/Title. Omitir descrição quando ausente, usar close do primitivo e nenhuma ação de arquivo. O callback `onOpenAccount` recebe opcionalmente o botão de origem na molécula/organismo para retorno de foco, preservando consumidores sem argumentos. Não alterar `ui/dialog.tsx`.
3. Rodar teste novo/conectados, tipos e lint direcionado. Documentar integração sem alegar homologação visual não observada.

## Fase B — US2 após validação humana

1. Mover controlador de `src/app/saves/page.tsx` e fluxo de backup do adapter diretamente para `src/app/dashboard/page.tsx`, preservando parse, paginação, cancelamento, associação owner/save, handlers, estados, erros, confirmação e BackupApplication. Retirar o efeito que redireciona arquivo ativo para Pacientes; apresentar Início/Arquivos locais. Backup fica indisponível com explicação sem runtime/arquivo autorizado.
2. Separar gate de conta e gate de arquivo em SessionAwareAppShell. Dashboard usa AppLayoutShell/SidebarNavigationAdapter sem runtime; scheduler não inicia operação clínica sem conta local. Módulos mantêm gate de arquivo. Estado locked preserva o fluxo de proteção antes de nova navegação clínica.
3. Atualizar destinos retornados por auth e seus consumidores; `/home` e `/saves` viram redirects para dashboard, preservando parâmetros existentes. Não criar helper só para uma string.
4. Provar ausência de loop com conta anônima/incompleta, erro de conta, nenhum arquivo, runtime ativo e locked; conservar cobertura anterior.

## Fase C — US3 após US2

1. Adicionar Início `/dashboard`; manter os seis hrefs existentes e encurtar rótulos. Sem novos agrupamentos ou reescrita da sidebar.
2. Menu do perfil de produção passa a Configurações/Sair: remover Visão geral duplicado e injeção de backup da sidebar, após transferência para o dashboard em US2. Preservar contratos genéricos ainda usados; atualizar consumidores, mocks, testes e perfis/catálogo afetados.
3. Manter checkpoint pendente/pausa e recuperação nos módulos; não escondê-los no modal vazio.

## Dados, interfaces e riscos

Ver [data-model.md](data-model.md) e [contracts/navigation.md](contracts/navigation.md). Sem SQL remoto, migrations ou mudanças de chave/grant. `/api/saves` e `/api/saves/[id]/authorize` continuam existindo mesmo sem a antiga página.

- Dashboard renderizável não concede acesso clínico. Conta e proprietário continuam validados pelo servidor.
- Não selecionar/excluir saves existentes para impor um arquivo único.
- Extração de backup conserva confirmações, validação e preservação de dados em falha/cancelamento.
- Menu fecha antes do modal; fechar retorna foco ao botão do perfil. Registrar teste e prova visual separadamente.
- Preservar `agents.md`, `refs/dieta-db/index.md` e proposta online já alterados antes desta tarefa.

Validação: testes focados -> tipos/lint -> design system afetado -> build após mudança de rotas -> navegador autenticado com arquivos de teste. Registrar limites em validation-report.md. Não publicar ou reiniciar processos em uso.
