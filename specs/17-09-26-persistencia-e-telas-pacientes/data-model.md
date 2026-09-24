# Modelo de dados e consultas

## Estado local de checkpoint

Tabela interna `profile_checkpoint_state` (não exportada no `.nutridiet`):

| Campo | Uso |
| --- | --- |
| `account_id` | Chave e escopo da Conta local |
| `workspace_revision` | Incrementada após cada operação confirmada |
| `checkpoint_revision` | Última revisão gravada com sucesso no arquivo |

O workspace está em `idb://` com chave estável por `account_id`. Um arquivo importado pela primeira vez inicia limpo; uma área já existente preserva sua revisão local. O sync captura a revisão antes de exportar e só avança `checkpoint_revision` até esse valor, conservando como pendente qualquer mutação posterior. O schema do envelope portátil não inclui esta tabela.

## Resumo nutricional derivado

Tabela local `diet_variation_history_summaries`, com uma linha por variação confirmada e quatro colunas `numeric`: proteína, carboidratos, gordura e energia prescritos. Os totais usam os snapshots nutricionais da dieta e a mesma regra de fallback energético já utilizada hoje. A atualização participa da transação que confirma/edita a dieta; a exclusão da variação elimina seu resumo.

Os valores são dados derivados e não entram no `.nutridiet`. Ao importar um arquivo compatível, a base os reconstrói uma vez a partir dos registros completos. O resumo apresentado continua calculado com `Decimal` e arredondado pela regra atual; metas, ciclo, dias, contagem de refeições, datas e status seguem suas tabelas atuais.

## Leituras paginadas

As páginas da lista de pacientes e dos históricos retornam `{ items, total, pageIndex, pageSize }`, com `pageSize` limitado a 25.

- **Avaliações:** aplicar `account_id` e `patient_id`, ordenação atual e `LIMIT/OFFSET`; consultar total na mesma carga. A leitura do perfil também mantém o resumo da avaliação mais recente fora da página atual. APIs completas usadas pelo editor/construtor continuam sem limite.
- **Dietas:** contar os planos confirmados e selecionar os IDs ordenados da página primeiro; buscar apenas as variações e resumos desses IDs. O detalhe do cardápio continua sendo carregado por `getSnapshot()` quando aberto.
- **Pacientes:** aplicar Conta, ativos e busca antes da página; ordenar no banco pelo agrupamento atual (atrasados, hoje, próximos, sem evento), data e nome `pt-BR`, com chave estável para empates. A consulta calcula somente chaves compactas de agenda/atividade para ordenar e retorna até 25 cadastros; contagens, avaliações recentes e atividade da página são obtidas em lote para esses IDs.

Todas as consultas de perfil permanecem escopadas por Conta e paciente. Índices existentes serão reutilizados; adicionar índice apenas se `EXPLAIN` no conjunto de dados de aceite demonstrar necessidade.
