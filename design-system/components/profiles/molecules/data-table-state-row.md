# DataTableStateRow

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-data-table-state-row` |
| Nature | `product-generic` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/data-table/DataTableStateRow.tsx` |
| Public exports | `DataTableStateRow` (component) |

## Purpose

Apresentar loading, erro ou estado vazio dentro do corpo semantico de uma tabela.

## Category inheritance

Herda [data-display](../../categories/data-display.md) e o contrato do [DataTable](data-table.md). Nao possui traits adicionais.

## Specific anatomy

Renderiza uma `TableRow` com uma `TableCell` que ocupa todas as colunas e anuncia a mensagem por `role` opcional.

## Visual contract

Mantem altura de linha, alinhamento central e tokens de texto secundario definidos pela categoria de data display.

## Allowed variants

Aceita somente `alert` ou `status` para o anuncio semantico; nao expõe variantes de cor ou layout.

## Particular states

Erro usa `alert`; loading e vazio usam `status`, conforme o estado fornecido pelo DataTable.

## Composition

Compoe `ui-table` como parte interna da molecula `molecule-data-table`.

## Content rules

A mensagem deve ser explicita e ocupar todas as colunas para permanecer associada ao cabecalho.

## Exceptions

Nenhuma excecao aprovada.

## Consumers

- `molecule-data-table`

## Acceptance criteria

- a celula usa `colSpan` igual ao numero de colunas;
- o anuncio semantico permanece associado ao estado visivel;
- nenhuma regra de dominio ou mutacao aparece no componente.

## Implementation status

Implementado como subcomponente interno do DataTable.
