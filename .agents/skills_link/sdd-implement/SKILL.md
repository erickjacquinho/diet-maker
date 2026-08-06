---
name: sdd-implement
description: Execute and converge an approved Spec Kit implementation until validation passes or a safe blocker is documented.
---

# SDD Implement

Executar um plano Spec Kit já aprovado, tarefa por tarefa, incorporando o ciclo de convergência dentro da implementação. Trabalhar até concluir todos os critérios verificáveis ou documentar um bloqueio que exige decisão humana.

## Contrato

- Esta skill só começa após a invocação explícita de `$sdd-implement`.
- Consumir `spec.md`, `plan.md`, `tasks.md` e os checklists da tarefa existente; preservar a intenção desses artefatos.
- Tratar a raiz do projeto como `<project-root>` e o diretório da feature como `<feature-dir>`.
- Priorizar as instruções locais do projeto e das skills Spec Kit quando estiverem presentes.
- Fazer mudanças apenas dentro do escopo aprovado, salvo correções técnicas necessárias para manter os contratos existentes.
- Registrar evidências antes de declarar uma tarefa ou a implementação como concluída.

## Estado 0: localizar e preparar

1. Identificar `<project-root>` de forma segura.
2. Localizar `<feature-dir>` nesta ordem:
   - o diretório apontado por `<project-root>/.specify/feature.json`;
   - um diretório de feature explicitamente informado na invocação;
   - uma única pasta em `<project-root>/specs/` que contenha `tasks.md` não concluído.
3. Se houver mais de uma possibilidade ou nenhum artefato válido, pedir o caminho da feature antes de alterar arquivos.
4. Ler por completo os arquivos existentes:
   - `<feature-dir>/spec.md`;
   - `<feature-dir>/plan.md`;
   - `<feature-dir>/tasks.md`;
   - todos os checklists relevantes em `<feature-dir>/checklists/`;
   - `<project-root>/.agents/skills/speckit-implement/SKILL.md`, quando existir;
   - `<project-root>/.agents/skills/speckit-converge/SKILL.md`, quando existir.
5. Ler as instruções de operação do projeto, incluindo `AGENTS.md`, `CONTRIBUTING.md`, `package.json`, `pyproject.toml`, Makefiles e equivalentes aplicáveis.
6. Registrar o estado inicial do repositório com `git status` e identificar os comandos de teste, lint, typecheck, build e migração previstos no plano ou no projeto.

**Critério de conclusão:** `spec.md`, `plan.md` e `tasks.md` estão legíveis; a feature foi identificada sem ambiguidade; os comandos de validação aplicáveis foram descobertos; o estado inicial do repositório foi capturado.

## Estado 0.5: checkpoint Git

Criar um commit de checkpoint antes de iniciar o preflight ou modificar qualquer arquivo de implementação.

1. Confirmar que `<project-root>` está dentro de um repositório Git e capturar branch, `HEAD`, alterações staged, alterações unstaged e arquivos não rastreados.
2. Revisar o conjunto que será preservado no checkpoint com `git diff`, `git diff --cached` e a lista de arquivos não rastreados.
3. Identificar arquivos que possam conter segredos, como `.env` com valores reais, chaves privadas, credenciais, dumps ou tokens. Remover esses arquivos do conjunto somente quando estiverem claramente fora do escopo do checkpoint; diante de dúvida, bloquear antes do stage.
4. Adicionar ao checkpoint todo o estado existente antes da invocação, usando a política normal de ignore do repositório.
5. Derivar uma mensagem Conventional Commit do contexto real, usando o objetivo principal de `spec.md`, o título da feature, a tarefa ativa e o diff capturado:
   - escolher o tipo mais fiel entre `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `build`, `ci` e `chore`;
   - escolher um escopo curto baseado no domínio afetado;
   - escrever um assunto imperativo, específico, sem ponto final e com até 72 caracteres;
   - descrever o estado que está sendo commitado, sem afirmar que a implementação terminou;
   - usar `chore(<scope>): checkpoint before <imperative subject>` para um checkpoint limpo ou para alterações preliminares que ainda não constituem a mudança principal;
   - usar o tipo semântico da própria alteração quando o diff já contiver uma mudança identificável, como `feat(auth): add passwordless login endpoint`;
   - incluir `!` somente quando houver uma quebra de compatibilidade comprovada.

   Exemplos:

   ```text
   chore(auth): checkpoint before adding passwordless login
   fix(billing): checkpoint before correcting invoice totals
   refactor(api): checkpoint before extracting request validation
   ```

6. Criar o commit com a mensagem derivada:

   ```text
   <type>(<scope>): <contextual subject>
   ```

   Usar `--allow-empty` quando o repositório estiver limpo, para que toda execução tenha um ponto de retorno identificável.
7. Capturar o hash e a mensagem do commit para o relatório final e para a recuperação manual.
8. Se não for possível derivar uma mensagem fiel sem inventar intenção, preservar a saída completa, executar nenhuma implementação e retornar ao usuário pedindo contexto.
9. Se o commit falhar, preservar a saída completa, executar nenhuma implementação e retornar ao usuário com o erro e o comando de retomada.

**Critério de conclusão:** existe um commit de checkpoint identificável, contendo o estado anterior à execução; nenhuma alteração de implementação foi feita antes dele.

## Estado 1: preflight

1. Verificar que `tasks.md` contém tarefas executáveis, dependências e verificações observáveis.
2. Verificar que cada tarefa possui exatamente uma atribuição `[skill: ...]`, quando essa convenção for usada.
3. Executar a análise Spec Kit disponível, preferindo `<project-root>/.agents/skills/speckit-analyze/SKILL.md` e mantendo `<feature-dir>` como `SPECIFY_FEATURE_DIRECTORY`.
4. Corrigir apenas inconsistências mecânicas que não alterem a intenção, como referências quebradas, tarefas sem verificação ou atribuições inválidas.
5. Se a correção alterar requisitos, arquitetura ou escopo, registrar o bloqueio e solicitar decisão humana.

**Critério de conclusão:** a análise de entrada não aponta conflito crítico, requisito sem cobertura, tarefa sem rastreabilidade ou tarefa sem verificação; ou um bloqueio foi documentado com evidências.

## Estado 2: ciclo de tarefa

Selecionar a próxima tarefa não concluída cujas dependências estejam satisfeitas. Para cada tarefa:

1. Ler a tarefa, o requisito coberto, a decisão arquitetural relacionada e os arquivos esperados.
2. Se houver uma skill local atribuída, ler seu `SKILL.md` por completo e aplicar suas instruções à tarefa.
3. Inspecionar o código existente antes de editar.
4. Implementar a menor mudança que satisfaça a tarefa e preserve os contratos existentes.
5. Executar primeiro a verificação específica declarada pela tarefa.
6. Executar typecheck, lint ou testes relacionados quando forem aplicáveis.
7. Passar ao Estado 3 quando qualquer verificação falhar.
8. Passar ao Estado 4 quando todas as verificações da tarefa passarem.

**Critério de conclusão:** a mudança da tarefa existe, a verificação específica passa e as verificações relacionadas não apresentam regressão.

## Estado 3: convergência de falha

Tratar cada falha como uma hipótese testável, não como motivo para mascarar o resultado.

1. Capturar comando, saída, arquivo, teste, mensagem principal e estado atual.
2. Reproduzir a falha com o menor comando confiável.
3. Classificar a causa como implementação, contrato, teste, configuração, dependência, ambiente, dado, integração ou requisito.
4. Corrigir a causa raiz mais provável quando a correção for local, reversível e dentro do escopo.
5. Reexecutar imediatamente a verificação que falhou.
6. Reexecutar as verificações relacionadas após a correção.
7. Registrar cada ciclo em `<feature-dir>/implementation-log.md`, incluindo hipótese, mudança, comando e resultado.
8. Repetir enquanto houver progresso observável.

Aplicar estes limites:

- considerar a falha bloqueada após três ciclos com a mesma assinatura sem progresso;
- considerar a estratégia esgotada após duas correções diferentes sem progresso;
- tratar comportamento intermitente como falha de confiabilidade e investigá-lo antes de avançar;
- reclassificar a falha quando a evidência mudar, sem apagar tentativas anteriores.

Parar e registrar bloqueio quando a solução exigir decisão de produto, alteração de escopo, credenciais, serviço externo indisponível, operação destrutiva, deploy ou alteração de produção.

**Critério de conclusão:** a verificação da tarefa passa após uma correção comprovada; ou o bloqueio contém causa, evidências, tentativas, risco e ponto exato de retomada.

## Estado 4: regressão e avanço

1. Executar a suíte de regressão do módulo ou fluxo afetado.
2. Comparar o diff com a tarefa e seus critérios de aceite.
3. Atualizar a linha da tarefa em `tasks.md` somente após a validação passar.
4. Acrescentar ao `implementation-log.md` os comandos e resultados que comprovam a conclusão.
5. Verificar se a tarefa desbloqueou outras tarefas.
6. Retornar ao Estado 2 enquanto existirem tarefas pendentes.

Após cada grupo lógico de tarefas, repetir a análise Spec Kit quando qualquer artefato de especificação, plano ou tarefas tiver sido alterado.

**Critério de conclusão:** a tarefa está marcada como concluída, possui evidência reproduzível e não introduziu regressão no escopo afetado.

## Estado 5: convergência final

Executar uma auditoria final abrangente:

1. Confirmar que todas as tarefas implementáveis estão concluídas.
2. Executar os testes completos aplicáveis, typecheck, lint e build.
3. Avaliar todos os checklists e critérios de aceite.
4. Verificar rastreabilidade requisito → tarefa → arquivos alterados → teste ou verificação.
5. Revisar o diff completo, incluindo dependências, migrações, permissões, tratamento de erros e documentação afetada.
6. Executar uma revisão de segurança quando a mudança envolver autenticação, autorização, entrada externa, dados sensíveis, pagamentos ou exposição de rede.
7. Reexecutar `speckit-analyze` se algum artefato Spec Kit tiver mudado.
8. Escrever em `implementation-log.md` o resultado final, comandos executados e limitações conhecidas.

**Critério de conclusão:** todos os critérios aplicáveis passam, nenhuma tarefa implementável permanece pendente, a análise final não aponta conflito crítico e o log contém evidências suficientes para reproduzir a validação.

## Estados de saída

### Concluído

Informar o diretório da feature, resumo das mudanças, quantidade de tarefas concluídas, comandos de validação e limitações não bloqueantes.

### Bloqueado

Informar o diretório da feature, tarefa e arquivo afetados, causa raiz ou hipótese atual, evidências, tentativas, risco, decisão necessária e comando ou estado para retomada. Não declarar sucesso parcial como conclusão.

## Princípios de execução

- Preferir evidência executável a inferência.
- Manter o loop apertado: falha específica → diagnóstico → correção → mesmo teste → regressão.
- Usar os comandos reais do projeto; registrar comandos inexistentes como limitação em vez de inventá-los.
- Preservar alterações anteriores do usuário e separar claramente mudanças próprias.
- Manter uma única fonte de verdade para escopo e critérios: os artefatos Spec Kit.
