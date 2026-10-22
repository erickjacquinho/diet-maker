# Validação progressiva

Data: 2026-10-20. Esta página preserva as provas da entrega inicial de US1 e registra a execução completa aprovada de US2/US3. O resumo mais recente vem primeiro; o fluxo autenticado de navegador ainda está pendente de T011.

## Atualização T011 — 2026-10-20

- Evidência autenticada anterior em navegador: `online-auth.spec.ts` passou o ciclo de cadastro, confirmação por e-mail, login, recuperação/troca de senha, rejeição de replay de OTP e logout com conta sintética. Três testes de `profile-session-gate.spec.ts` passaram para conta anônima, conta completa sem arquivo e cadastro incompleto; esses três interceptam `/api/auth/session` e provam somente o comportamento do gate. Em `backup-persistence.spec.ts`, passaram exportação offline sem drafts, restauração válida após reload com cancelamento/arquivo inválido e ausência de leitura do IndexedDB legado. Também passou o cenário de arquivo inválido manter o dashboard disponível em `profile-save-load.spec.ts`.
- Uma execução autenticada maior cobriu 14 testes: 7 passaram e 7 falharam. As três provas de backup acima, os três gates e o cenário de arquivo inválido passaram. Os demais testes revelaram helpers que retornavam enquanto os diálogos de criação/proteção ainda estavam submetendo; os snapshots mostravam os controles ocupados e nenhum save criado. Os helpers agora esperam o diálogo fechar ou a proteção terminar e o save aparecer. O teste do menu da conta agora usa teclado porque o portal de Dev Tools interceptou o clique físico. Essas correções de teste ainda não foram reexecutadas.
- Reexecução focada de `profile-save-load.spec.ts` parou antes do fluxo de save: `/api/auth/signup` respondeu 503. O `SUPABASE_URL` configurado aponta para `127.0.0.1:54321`, sem listener; o Docker Engine também não estava acessível. Nenhum serviço Supabase/Auth, banco ou dado foi iniciado, reiniciado ou alterado.
- Não foi produzido screenshot de navegador: o teste que captura as larguras 1024/1280/1600 falhou antes desse trecho. Portanto, não há prova visual arquivada nem execução completa autenticada/persistida nesta validação.
- T011 permanece pendente. Para fechá-la, é necessário restabelecer o serviço local de Auth já configurado e repetir o fluxo autenticado com os helpers corrigidos; até lá, os testes com mocks não substituem essa prova.

## Estado após T010

- US1–US3 implementadas. T001–T010 concluídas; T011 é a única tarefa pendente e exige prova autenticada/visual. Não houve publicação nem alteração de formato de saves ou backend.
- T005 comprovou regressão antes do código: 47 testes, 14 falhas esperadas para destinos/gates antigos e rota dashboard ausente.
- Regressões consolidadas de dashboard, backup, shell, auth, redirects, scheduler e sidebar: 15 arquivos Vitest, 101 testes aprovados.
- `npm.cmd run type-check` — exit 0. ESLint direcionado às mudanças de navegador/componentes — exit 0.
- `npx.cmd playwright test --config=playwright.config.ts --list` — 23 testes descobertos em 10 arquivos; discovery não equivale a executar os fluxos.
- `node.exe scripts/verify-design-system-components.mjs --strict` — 40 arquivos-fonte cobertos, 0 exports visuais sem perfil e 0 bloqueios; o registry JSON foi parseado com Node.
- `npm.cmd run build` — exit 0; compilação otimizada, tipos, 18 páginas estáticas e `/dashboard` no mapa de rotas.

Comando da regressão consolidada:

```powershell
node.exe node_modules/vitest/vitest.mjs run tests/components/app/dashboard.test.tsx tests/components/app/backup-actions.test.tsx tests/components/saves/saves-dashboard.test.tsx tests/app/session-aware-app-shell.test.tsx tests/app/legacy-route-redirects.test.tsx tests/app/agenda-reminder-scheduler.test.tsx tests/components/auth/registration-login.test.tsx tests/server/auth-session.test.ts tests/server/auth-signup.test.ts tests/components/app/sidebar-navigation-adapter.test.tsx tests/components/organisms/sidebar-nav.test.tsx tests/components/organisms/sidebar-navigation-model.test.ts tests/components/organisms/sidebar-nav-conformance.test.tsx tests/components/organisms/sidebar-nav-shortcut.test.tsx tests/components/molecules/sidebar-user-profile.test.tsx --pool=threads --maxWorkers=1
```

Comando do build: `npm.cmd run build`. O resultado automatizado e o build não comprovam persistência autenticada em navegador; isso permanece como T011.

## Registro anterior: resultado de US1

- Configurações abre como Dialog vazio pelo menu do perfil, nas apresentações expandida e recolhida.
- Mantém título acessível e close do primitivo; não possui campos, abas, descrição fictícia, comandos de arquivo ou nova rota.
- Escape/Fechar devolvem foco ao botão do perfil. O callback existente aceita opcionalmente esse botão como origem; consumidores sem parâmetros continuam compatíveis.
- Primitivos não foram alterados; nenhum pacote novo, formato de save, SQL, mudança de backend ou publicação.
- Rotas, destinos de login, dashboard e ações de saves/backup continuam anteriores. Após o minimize, T005–T011 permanecem abertas para validação humana.

## Provas automatizadas de US1

| Verificação | Resultado |
| --- | --- |
| Vitest: sidebar-navigation-adapter, sidebar-user-profile e sidebar-nav | 3 arquivos, 18 testes aprovados |
| TypeScript `tsc --noEmit` | Exit 0 |
| ESLint dos três arquivos de código e teste alterados | Exit 0 |
| `node scripts/verify-design-system-components.mjs --strict` | 40 fontes cobertas; 0 exports descobertos; 0 findings bloqueantes |
| `git diff --check` | Exit 0 |
| Integridade documental da entrega parcial, antes do minimize | 22 requisitos, 16 tarefas sequenciais, skills válidas, âncora válida, 2 checklists/28 itens |

Comando dos testes aprovados:

```powershell
node.exe node_modules/vitest/vitest.mjs run tests/components/app/sidebar-navigation-adapter.test.tsx tests/components/molecules/sidebar-user-profile.test.tsx tests/components/organisms/sidebar-nav.test.tsx --pool=threads --maxWorkers=1
```

A tentativa inicial com forks falhou ao iniciar worker, sem executar testes; não foi considerada prova de comportamento. Em threads, os testes detectaram primeiro a ausência do modal e depois a perda de foco ao fechar; a versão corrigida passou os 18 testes. O teste isola a composição de persistência, usa Dialog/Dropdown reais e comprova ausência de requisições ao abrir/fechar o modal. Isso não comprova autorização clínica ou persistência remota.

## Limites registrados na entrega inicial de US1

- Não executados build completo, suíte completa, inspeção visual no navegador ou fluxo autenticado real.
- Não há prova nova de abertura de arquivo ou persistência: essas rotinas não foram alteradas nesta entrega.
- A interface de Configurações só fica disponível onde a barra lateral atual já aparece; a disponibilidade do shell no dashboard sem arquivo será implementada em US2.
- O remanejamento completo não está entregue. A análise de cobertura é documental, sem declaração de homologação visual ou segurança de toda a aplicação.

## Estado documental após a entrega inicial de US1

US1 implementada e validada nas camadas acima. US2/US3 propostas. Análise final: 22/22 requisitos cobertos, sem conflito crítico ou questão de produto aberta. Modificações anteriores em agents.md, refs/dieta-db/index.md e proposta online preservadas.

## Minimize documental — 2026-10-20

Plano reduzido de 16 para 11 tarefas, preservando T001–T004 concluídas e todos os 22 requisitos. O backup passa a integrar diretamente a página do dashboard com os componentes/serviço existentes, sem componente intermediário ou suíte duplicada; os testes existentes serão adaptados. Tarefas coesas de rotas/gates e de sidebar/perfil foram reunidas, mantendo verificações antes/depois e prova autenticada final.

A especificação, os checklists e os arquivos previamente alterados de aplicação/testes foram preservados por comparação de hashes (14 arquivos da base conferidos). Verificação documental aprovada: 11 IDs sequenciais, quatro tarefas concluídas intactas, sete propostas, cobertura exata de 22/22 requisitos entre tarefas e análise, nove links relativos válidos, 129 referências de tarefas válidas, skills disponíveis e nenhuma referência ao componente/suíte removidos. `git diff --check` aprovado. Testes do app, build e navegador não foram repetidos nesta etapa; os resultados automatizados acima pertencem à entrega parcial do modal.
