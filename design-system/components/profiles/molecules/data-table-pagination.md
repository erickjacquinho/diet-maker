# DataTablePagination

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-data-table-pagination` |
| Nature | `product-generic` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/data-table/DataTablePagination.tsx` |
| Public exports | `DataTablePagination` (component) |

## Purpose

Renderizar os controles de navegacao de paginas de uma tabela generica.

## Category inheritance

Herda [data-display](../../categories/data-display.md) e o contrato do [DataTable](data-table.md). Nao possui traits adicionais.

## Specific anatomy

Exibe o indicador de pagina atual e quatro botoes para primeira, anterior, proxima e ultima pagina.

## Visual contract

Usa os tokens e receitas dos botoes existentes, com icones Lucide e estados disabled nas bordas da pagina.

## Allowed variants

Nao expoe variantes visuais livres. O consumidor controla apenas o estado de pagina e o tamanho de pagina.

## Particular states

Os botoes de navegacao anterior ficam disabled na primeira pagina; os botoes seguintes ficam disabled na ultima pagina.

## Composition

Compoe `ui-button` e icones Lucide como parte interna da molecula `molecule-data-table`.

## Content rules

O indicador anuncia uma pagina numerada e o total de paginas. Os nomes dos botoes descrevem a acao completa.

## Exceptions

Nenhuma excecao aprovada.

## Consumers

- `molecule-data-table`

## Acceptance criteria

- botoes possuem nomes acessiveis e estados disabled corretos;
- nenhuma regra de dominio ou tabela especifica aparece no componente;
- a pagina exibida e o callback permanecem controlados pelo DataTable.

## Implementation status

Implementado como subcomponente interno do DataTable.
