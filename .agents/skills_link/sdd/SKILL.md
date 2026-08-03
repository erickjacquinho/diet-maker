---
name: sdd
description: Orchestrate the complete Spec Kit specification flow when the user explicitly invokes $sdd for a development task.
---

# SDD

Executar uma máquina de estados rígida que transforma o pedido em artefatos do Spec Kit prontos para validação humana. Encerrar antes da implementação.

## Contrato de execução

Tratar o texto que acompanha `$sdd` como `TASK_PROMPT`. Preservar todo o contexto relevante da conversa no pedido.

Se `TASK_PROMPT` não descrever uma tarefa concreta, pedir a descrição e permanecer no Estado 0.

Executar cada estado na ordem apresentada. Um estado só termina quando seu critério de conclusão estiver comprovado. Manter apenas um estado ativo. Quando um estado falhar ou depender de uma resposta, permanecer nele e retomar depois da resolução.

As regras desta skill determinam a ordem global. Dentro de cada estado, seguir integralmente a skill `speckit-*` correspondente.

## Estado 0: preparar

1. Identificar a raiz do projeto. Se nenhum projeto puder ser identificado com segurança, pedir o caminho da raiz antes de modificar arquivos.
2. Gerar `TASK_SLUG` como um resumo semântico do objetivo técnico da tarefa:
   - expressar a ação e o objeto ou domínio principal da mudança;
   - priorizar termos técnicos distintivos presentes no pedido ou no contexto;
   - remover palavras de enquadramento que não descrevem o resultado, como `criar tarefa`, `solicitação`, `para implementar` e equivalentes;
   - usar letras minúsculas, números e hífens;
   - respeitar o máximo de 40 caracteres, sem limitar a quantidade de palavras;
   - preferir palavras completas e remover detalhes secundários antes de abreviar um termo.

   Exemplo: para uma tarefa de criação de uma tarefa que implemente o design system no fluxo SDD, usar `implementacao-sdd-design-system`, não `criacao-de-tarefa-para-imp`.
3. Executar `scripts/prepare_sdd.py` a partir do diretório desta skill, passando o pedido completo, o slug semântico e a raiz do projeto:

   ```text
   python <skill-dir>/scripts/prepare_sdd.py --project-root <project-root> --task <TASK_PROMPT> --slug <TASK_SLUG>
   ```

   Passar os argumentos como valores literais; usar a forma de escape segura do shell atual para que o conteúdo de `TASK_PROMPT` e `TASK_SLUG` nunca seja executado como comando.
4. Ler o JSON emitido e guardar `project_root`, `task_dir` e `feature_dir`.
5. Confirmar que `speckit.configured` é `true`. Se a preparação informar um erro, resolver a dependência indicada e executar novamente este estado.
6. Confirmar a existência destes arquivos:

   ```text
   <project-root>/.agents/skills/speckit-specify/SKILL.md
   <project-root>/.agents/skills/speckit-clarify/SKILL.md
   <project-root>/.agents/skills/speckit-checklist/SKILL.md
   <project-root>/.agents/skills/speckit-plan/SKILL.md
   <project-root>/.agents/skills/speckit-tasks/SKILL.md
   <project-root>/.agents/skills/speckit-analyze/SKILL.md
   ```

O script cria ou retoma exatamente:

```text
<project-root>/specs/dd-mm-aa-task-slug
```

Arquivos de infraestrutura do Spec Kit permanecem em `.specify/` e `.agents/`. Todo artefato específico da tarefa deve ficar dentro de `task_dir`.

**Critério de conclusão:** o diretório da tarefa existe, a instalação Codex do Spec Kit está completa e as seis skills requeridas estão legíveis.

## Âncora do diretório

Para todos os estados seguintes, tratar `feature_dir` como um `SPECIFY_FEATURE_DIRECTORY` fornecido explicitamente pelo usuário. Preservar esse valor em cada comando de shell executado pelas skills filhas. Exemplos:

```powershell
$env:SPECIFY_FEATURE_DIRECTORY='<feature_dir>'; <command>
```

```bash
SPECIFY_FEATURE_DIRECTORY='<feature_dir>' <command>
```

Depois do estado Specify, validar também que `.specify/feature.json` aponta para o mesmo diretório. Corrigir qualquer divergência antes de avançar.

## Estado 1: Specify

1. Ler por completo `<project-root>/.agents/skills/speckit-specify/SKILL.md`.
2. Executar suas instruções usando o `TASK_PROMPT` completo e a âncora do diretório.
3. Verificar que `task_dir/spec.md` descreve o que será construído, por que será construído, atores, fluxos, requisitos funcionais, requisitos não funcionais, limites e critérios de sucesso.

**Critério de conclusão:** `spec.md` existe dentro de `task_dir`, não contém placeholders e representa todo o pedido conhecido.

## Estado 2: Clarify

1. Ler por completo `<project-root>/.agents/skills/speckit-clarify/SKILL.md`.
2. Auditar `spec.md` para encontrar toda ambiguidade, independentemente do tamanho, cobrindo:
   - objetivo, escopo e exclusões;
   - atores, permissões e jornadas;
   - entradas, saídas, dados e estados;
   - interfaces, integrações e dependências;
   - erros, casos-limite e recuperação;
   - segurança, privacidade e conformidade;
   - desempenho, acessibilidade e operação;
   - compatibilidade, migração e implantação;
   - critérios de aceite, testes e suposições.
3. Executar as instruções de `speckit-clarify` e fazer uma pergunta por mensagem. Aguardar a resposta antes da pergunta seguinte.
4. Incorporar cada resposta em `spec.md` antes de continuar a auditoria.
5. Repetir a auditoria e a skill até que cada item seja explícito no pedido, respondido pelo usuário ou marcado conscientemente como fora de escopo.

**Critério de conclusão:** não resta pergunta aberta, escolha implícita, termo indefinido ou suposição não confirmada em `spec.md`.

## Estado 3: Checklist

1. Ler por completo `<project-root>/.agents/skills/speckit-checklist/SKILL.md`.
2. Executar suas instruções sobre o `spec.md` já clarificado.
3. Criar os checklists exclusivamente sob `task_dir/checklists/`.
4. Avaliar cada requisito quanto a completude, clareza, consistência, mensurabilidade e cobertura de cenários.

**Critério de conclusão:** os checklists existem e não há item de requisito ignorado ou falha sem resolução explícita.

## Estado 4: Plan

1. Ler por completo `<project-root>/.agents/skills/speckit-plan/SKILL.md`.
2. Executar suas instruções com `spec.md`, as respostas de clarificação e os checklists consolidados.
3. Manter `plan.md` e todos os artefatos auxiliares de planejamento dentro de `task_dir`.

**Critério de conclusão:** `task_dir/plan.md` existe, não contém placeholders e cobre arquitetura, tecnologia, interfaces, dados, riscos, testes e validação aplicáveis a todos os requisitos.

## Estado 5: Tasks

1. Ler por completo `<project-root>/.agents/skills/speckit-tasks/SKILL.md`.
2. Executar suas instruções usando apenas os artefatos consolidados dos estados anteriores.
3. Confirmar que `task_dir/tasks.md` contém tarefas ordenadas, executáveis, verificáveis e rastreáveis ao plano e aos requisitos.

**Critério de conclusão:** cada requisito implementável possui uma ou mais tarefas e cada tarefa declara arquivos ou resultados esperados e uma verificação observável.

## Estado 6: atribuir skills

1. Inventariar as skills realmente disponíveis na sessão e sob as raízes de skills do projeto. Usar apenas nomes comprovados por `SKILL.md` ou pelo catálogo da sessão.
2. Escolher para cada tarefa uma skill principal cuja descrição corresponda melhor ao trabalho.
3. Acrescentar a atribuição na própria linha da tarefa, imediatamente após seu identificador:

   ```text
   - [ ] T001 [skill: $nome-da-skill] descrição da tarefa
   ```

4. Usar `[skill: general]` somente quando nenhuma skill especializada existente cobrir a tarefa. Não inventar nomes de skills.
5. Repassar todas as linhas de tarefa, incluindo setup, testes, documentação, migração e validação.

**Critério de conclusão:** toda tarefa em `tasks.md` contém exatamente uma atribuição `[skill: ...]`, e cada nome especializado corresponde a uma skill existente.

## Estado 7: Analyze

1. Ler por completo `<project-root>/.agents/skills/speckit-analyze/SKILL.md`.
2. Executar suas instruções sobre `spec.md`, checklists, `plan.md` e `tasks.md`.
3. Corrigir conflitos, duplicações, ambiguidades, requisitos sem cobertura, decisões sem tarefa, tarefas sem verificação e atribuições de skill inválidas.
4. Quando uma correção alterar um artefato anterior, repetir na ordem original todos os estados posteriores afetados.
5. Executar `speckit-analyze` novamente após as correções.

**Critério de conclusão:** a análise final não aponta conflito crítico, ambiguidade aberta, requisito sem cobertura, tarefa sem rastreabilidade ou tarefa sem skill atribuída.

## Estado 8: validação humana

Entregar um resumo curto contendo:

- caminho absoluto de `task_dir`;
- links para `spec.md`, `plan.md` e `tasks.md`;
- quantidade de checklists e tarefas;
- resultado final de `speckit-analyze`;
- pedido explícito de validação humana.

Terminar a mensagem com `☕`.

**Critério de conclusão:** o usuário recebeu os artefatos prontos para revisão. Encerrar o fluxo sem executar implementação.
