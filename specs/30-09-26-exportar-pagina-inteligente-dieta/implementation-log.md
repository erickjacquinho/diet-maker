# Implementation log

## 2026-09-30 — Estados 0/0.5/1

Feature: `specs/30-09-26-exportar-pagina-inteligente-dieta` pela âncora `.specify/feature.json`.
Estado inicial: branch `codex/diet-pdf-export`, HEAD `86c3181dfa6971d7eb11744f4a40ae859ed48b53`; `.specify/feature.json` modificado e protótipo/SDD não rastreados, sem source funcional modificado.

### Checkpoint obrigatório

Revisados git diff, diff --cached, lista dos 23 arquivos não rastreados e varredura sem imprimir conteúdo sensível. Nenhum candidato a segredo detectado. Checkpoint autorizado pela invocação explícita da skill:

`59b3bcf` — `chore(diet): checkpoint before implementing published diet page`

O commit preserva todo o estado anterior, incluindo referência visual e SDD. Nenhuma alteração de implementação precedeu o commit. Sem push.

### Preflight Spec Kit

Skills locais implement/converge disponíveis e lidas; aplicação do fluxo speckit-implement conforme roteamento do projeto. `check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks` retornou diretório correto e todos os auxiliares.

Revisão spec/plan/tasks/constituição: 12 tarefas sequenciais com verificações observáveis, 35 requisitos cobertos (21 FR, 6 NFR, 8 SC), exatamente uma skill por tarefa, 3 checklists completos. Não há ajuste mecânico necessário ou mudança de intenção autorizada nesta passagem. Comandos futuros: Vitest focado, type-check, auditorias atomic/z-index/DS/table, Playwright e build conforme quickstart.

### B001 — dependência operacional ausente

Classificação: configuração/credenciais/ambiente externo. Afeta T004 (`src/lib/infrastructure/published-diets/server.ts`, migração remota) e T012 (Vercel Preview). Pré-requisitos ausentes verificados sem imprimir valores:

- DATABASE_URL ausente em Process/User/Machine.
- NEXT_PUBLIC_DIET_PUBLICATION_ORIGIN ausente em Process/User/Machine.
- Nenhum arquivo .env encontrado na raiz.
- `.vercel/project.json` inexistente.
- Nenhuma capacidade Vercel/Neon disponível na lista de ferramentas desta sessão.

Causa: não há ambiente remoto de teste configurado para a publicação autenticada e sua homologação no Preview. Não foi feita tentativa de conexão inventando credenciais nem provisionamento/deploy em outra conta. Não é uma falha de teste a reproduzir três vezes: a skill determina parada imediata para ausência de credenciais/serviço.

Risco de contornar: produzir prova fictícia da publicação online, escolher outro backend sem autorização ou confundir validação mock/local com o fluxo exigido ao paciente.

Regra aplicada: sdd-implement Estado 3, “Parar e registrar bloqueio quando a solução exigir [...] credenciais, serviço externo indisponível, [...] deploy ou alteração de produção.”

Retomada: configurar banco Neon/Postgres de TESTE com DATABASE_URL local não versionada, origin do serviço de publicação e projeto Vercel Preview conforme `contracts/publication.md`; nenhum valor secreto em chat, source ou commits. Retomar `$sdd-implement` nesta feature, revalidando contexto/checkpoint obrigatório da nova execução, e iniciar T001. Produção não faz parte desta retomada automática.

Resultado: **Bloqueado**, 0/12 tarefas executadas; nenhum source funcional alterado. Não houve execução do loop final de converge, porque implementação e ambiente ainda não começaram; nenhuma passada limpa alegada.


## 2026-09-30 — Correção do bloqueio excessivo e entrada local

O usuário apontou que o botão continuava no placeholder. A dependência remota não impede a entrada/modal/prévia local; a primeira parada foi ampla demais. Implementada entrada callback em DietBuilderTemplate, modal intermediário na rota real do editor e `/pacientes/[id]/dieta/[dietaId]/pagina`, com flushDraft obrigatório e carregamento real equivalente ao PDF. Template experimental usa DataTable, Tabs e MacroSummary existentes, checks locais em memória e resumo de duas colunas/data formatada. Modal deixa explícito que a página ainda não foi publicada.

Validação: TypeScript passou; Vitest diet-builder-template 8/8, diet-published-template 1/1; verify:table sem erros; verify:design-system sem erros com aviso experimental PRF002. Correção de codificação UTF-8 após erro de compilação SWC, sem alterar valores de domínio. Nenhuma tentativa de deploy ou publicação remota.

Satisfaz a lacuna de entrada local apontada pelo usuário. Não marca T009/T010 ou SDD completo: servidor público, credencial/save, persistência dos checks, homologação e Preview seguem pendentes. Loop de converge final ainda não executado; nenhuma alegação de conclusão da implementação integral.


## 2026-09-30 — Preservar opções do modal

As escolhas de checklist/macros agora são serializadas como parâmetros booleanos na URL local do editor ao mudar cada toggle. Ao reabrir a tela após voltar da prévia ou recarregar, o modal restaura essas opções; a navegação para a prévia recebe os mesmos valores. Não grava preferências no save clínico nem publica as opções.

Verificação após ajuste: Playwright confirmou opções com estados Sim/Não mistos preservadas ao abrir a rota de prévia, voltar ao editor e recarregar; `npx tsc --noEmit --incremental false` passou. As preferências persistem na URL local por navegador/rota, sem gravar no arquivo `.nutridiet`.
