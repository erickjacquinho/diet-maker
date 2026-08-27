# DataTable

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-data-table` |
| Nature | `product-generic` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/DataTable.tsx` |
| Public exports | `DataTableColumnDef` (type), `DataTableSortState` (type), `DataTablePagination` (type), `DataTableSelectionConfig` (type), `DataTableSelectionMode` (type), `DataTableMaxHeight` (type), `DataTableVirtualizationConfig` (type), `DataTableProps` (type), `DataTable` (component) |

## Purpose

Compor dados genéricos em uma tabela semântica com estados, ordenação, paginação e expansão controladas pelos consumidores.

## Category inheritance

Herda integralmente [data-display](../../categories/data-display.md). Não possui traits adicionais. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Caption acessível, cabeçalho com `scope="col"`, corpo de células tipadas, linha de estado com `colSpan` e paginação opcional. `renderRow` e `renderExpandedRow` permitem linhas complexas sem mover regras de domínio para a molécula.

## Allowed variants

Usa as variantes `standard` ou `compact` da categoria por meio dos primitivos, aceita linhas estáticas ou interativas fornecidas pelo consumidor, seleção controlada nos modos `single` ou `multi`, alturas semânticas `table-compact` ou `table-modal` e virtualização opcional para datasets locais grandes. Não oferece multi-sort ou paginação remota.

## Particular states

Expõe estados `empty`, `loading`, `error` e `read-only` sem dados falsos. Ordenação, paginação e seleção são controladas; quando a página informada sai do intervalo, a última página válida é renderizada. Linhas selecionáveis anunciam `aria-selected` e podem ser acionadas por clique, Enter ou Espaço quando `selectOnRowClick` está ativo. Com virtualização, somente as linhas próximas da viewport são montadas, preservando a ordem e a contagem acessível do conjunto completo.

## Composition

Compõe `ui-table`, `ui-button` e ícones Lucide apenas para estrutura e controles genéricos. A molécula possui a responsabilidade da semântica, estados e controles; colunas, callbacks, navegação e mutações pertencem aos organismos consumidores. Não importa tipos ou regras de alimentos, pacientes, dietas ou avaliações.

## Content rules

O consumidor fornece caption, labels de ordenação e conteúdo de célula. Valores numéricos devem declarar unidade e alinhamento pela definição da coluna; conteúdo ausente usa mensagem explícita do estado vazio ou da célula.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

- `organism-food-table-section`
- `organism-patient-list-table`
- `organism-patient-consultation-history-table`

## Acceptance criteria

- identidade, source, exports e categoria coincidem com o registro;
- a tabela mantém caption, escopos, chaves estáveis, estados anunciados e foco visível nos controles;
- a ordenação alterna ascendente, descendente e estado limpo em uma única coluna;
- a seleção única ou múltipla mantém `aria-selected`, checkboxes rotulados e acionamento por teclado quando habilitada;
- a expansão opcional permanece em linhas associadas dentro de `TableBody`;
- nenhum tipo ou import de domínio aparece na fonte compartilhada.

## Implementation status

Implementado em `molecule`; perfil homologado junto com a migração dos três consumidores.
