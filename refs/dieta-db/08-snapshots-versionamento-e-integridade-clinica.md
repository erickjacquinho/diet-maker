# Decisão 08 — Snapshots, Versionamento e Integridade Clínica

- **Status:** Aprovado pelo usuário para especificação; implementação pendente
- **Data:** 2026-08-29
- **Escopo:** Proteção das prescrições contra alterações do catálogo

## 1. Regra central

Catálogos são dados vivos da Conta. Prescrições salvas conservam os valores
confirmados e não acompanham alterações do catálogo.

Isso não altera a edição explícita da dieta vigente aprovada na Decisão 01:
salvar uma edição atualiza essa dieta e incrementa sua versão. A V1 não cria
histórico imutável de cada edição da vigente. O snapshot histórico torna-se
somente leitura quando outra dieta assume a vigência. Preservar cada revisão
entregue exigiria decisão própria e não é acrescentado por esta adequação.

Uma dieta salva nunca deve calcular seus nutrientes por meio de um `JOIN` vivo
com o alimento, a receita ou a refeição pronta atual. O item prescrito deve
carregar o snapshot necessário para reproduzir exatamente o que foi salvo.

## 2. Dois momentos de snapshot

### 2.1 Snapshot no draft

Quando o nutricionista insere um alimento, receita ou refeição pronta no
`DietDraft`, o draft captura:

- `sourceType` e `sourceId`;
- `sourceVersion` do item customizado/receita/template ou versão identificada
  do dataset TACO usado como origem;
- nome e descrição exibíveis;
- quantidade e unidade prescritas;
- nutrientes calculados para aquela quantidade;
- composição necessária para edição e exportação futura.

Para permitir recálculo sem leitura viva, o snapshot também preserva a base
nutricional original, `measurementBasis`, estado do alimento, conversões
explícitas aplicadas, origem da energia e versão da regra de cálculo da
Decisão 06. Receitas incluem rendimento e peso preparado quando utilizados.
Alterar uma quantidade usa essa base, não os totais previamente arredondados.

Esse snapshot local permite que o draft não mude silenciosamente se o catálogo
for editado enquanto a dieta ainda está sendo montada. O nutricionista pode
recarregar deliberadamente a origem, substituindo o snapshot.

### 2.2 Snapshot clínico no salvamento

Ao acionar **Salvar**, o caso de uso valida o draft e grava, na mesma transação:

- `DietPlan` dentro da Conta e do Paciente;
- refeições, variações e ordenação;
- itens com quantidade e unidade;
- nutrientes e composição congelados;
- metadados de origem para rastreabilidade;
- versão da dieta e datas clínicas.

O plano preserva ainda o peso de referência e as metas utilizados na prescrição,
inclusive por variação do ciclo; leitura e exportação não substituem esses
valores pelo cadastro atual. Modos, dias atribuídos, alternativas de refeição e
substituições sobrevivem à gravação e ao backup. Alternativas não são somadas
como alimentos consumidos simultaneamente; o total indica a opção considerada.

O item persistido pode manter `sourceId` e `sourceVersion` como proveniência,
mas sua leitura clínica não pode exigir que a entidade de origem continue ativa
ou sequer exista. A integridade histórica vem do snapshot, não de uma
referência viva obrigatória ao catálogo.

## 3. Matriz de impacto

| Ação no catálogo | Draft existente | Nova inserção | Dieta salva/histórico |
| --- | --- | --- | --- |
| Editar alimento | mantém snapshot já inserido | usa nova versão | não altera |
| Editar receita | mantém snapshot já inserido | usa nova versão | não altera |
| Editar refeição pronta | mantém snapshot já inserido | usa nova versão | não altera |
| Arquivar alimento | continua legível | deixa de ser opção ativa | não altera |
| Arquivar receita | continua legível | deixa de ser opção ativa | não altera |
| Arquivar refeição pronta | continua legível | deixa de ser opção ativa | não altera |
| Salvar dieta | remove só a revisão confirmada; reconcilia falhas conforme 01 | cria snapshot clínico | torna a versão vigente |

## 4. Versionamento e concorrência

Toda entidade editável da Conta e todo `DietPlan` confirmado devem possuir:

- `version` inteiro ou equivalente monotônico;
- `createdAt` e `updatedAt`;
- atualização condicional pela versão esperada;
- erro explícito de conflito quando outra alteração foi salva antes.

O draft originado de uma vigente guarda `baseDietId` e `baseDietVersion` para
detectar conflito. Esses campos não atualizam a vigente durante o autosave nem
criam histórico de suas edições. Não são necessários hashes ou gerações de base.

`draftRevision` ordena o autosave; a versão da dieta controla sua atualização.
O salvamento segue a Decisão 01. Antes de restaurar um backup, resolver os
drafts pendentes e fechar os contextos de edição, conforme a Decisão 11.

Se duas tentativas salvarem uma nova dieta simultaneamente, a transação deve
garantir que exista no máximo uma dieta `Vigente` por Paciente. A dieta anterior
passa a `Histórica` somente no mesmo commit que confirma a nova.

## 5. Política de exclusão

| Entidade | Se não houver dependência | Se houver dependência ou histórico |
| --- | --- | --- |
| Alimento customizado | pode ser removido conforme política da Conta | arquivar |
| Receita | pode ser removida conforme política da Conta | arquivar |
| Refeição pronta | pode ser removida conforme política da Conta | arquivar |
| Paciente | arquivamento normal | preservar filhos e histórico |
| Dieta vigente | não descartar como rascunho | substituir por nova dieta salva |
| Dieta histórica | não editar diretamente | usar como origem de novo draft |
| DietDraft | descartar localmente com confirmação | não chama backend |

Mesmo quando uma remoção física de catálogo for permitida, ela nunca pode
remover ou recalcular um snapshot clínico já persistido.

## 6. Auditoria mínima

O backend deve conseguir responder, para cada item prescrito:

- qual era a origem (`TACO`, alimento customizado, receita ou refeição pronta);
- qual versão da origem foi usada;
- qual nome, quantidade e unidade foram prescritos;
- quais nutrientes foram congelados;
- em qual Conta, Paciente e dieta o item foi salvo.

Isso não exige uma tela de auditoria nesta etapa, mas exige que os dados não
sejam descartados em favor de uma consulta viva ao catálogo.

## 7. Guardrails

1. Nenhum autosave de dieta grava no `DietRepository`.
2. Nenhuma edição de catálogo altera dietas confirmadas.
3. Nenhuma dieta histórica é reidratada a partir do catálogo atual.
4. Nenhum item arquivado é apagado de snapshots clínicos.
5. Toda transição de vigência ocorre em transação.
6. O snapshot precisa ser suficiente para renderizar e calcular a dieta sem
   depender da disponibilidade da origem.
