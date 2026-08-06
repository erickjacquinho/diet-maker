# Table

## Identity

| Field | Value |
| --- | --- |
| Component ID | `ui-table` |
| Nature | `ui-generic` |
| Lifecycle | `implemented` |
| Current layer | `ui` |
| Target layer | `ui` |
| Sources | `src/components/ui/table.tsx` |
| Public exports | `Table` (component), `TableHeader` (compound-part), `TableBody` (compound-part), `TableFooter` (compound-part), `TableHead` (compound-part), `TableRow` (compound-part), `TableCell` (compound-part), `TableCaption` (compound-part) |

## Purpose

Expor a família compound para tabelas semânticas.

## Category inheritance

Herda integralmente [data-display](../../categories/data-display.md). Traits autorizados: nenhum. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Parts públicas: `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableHead`, `TableRow`, `TableCell` e `TableCaption`; headers e cells mantêm semântica HTML.

## Allowed variants

## Family contract

`Table` owns the semantic table root and overflow wrapper. Header, body, footer, head, row, cell and caption are structural or visual slots that remain one compound family.

Somente o subconjunto necessário da categoria; o componente não introduz variante visual autônoma.

## Particular states

Nenhum estado adicional; todos os estados aplicáveis e seus N/A justificados são herdados da categoria.

## Composition

Sem primitive base; compõe somente dependências permitidas pela layer. Compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

## Content rules

Valores usam locale pt-BR, unidade explícita e alinhamento definido pela categoria.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de rotas e componentes consumidores é o campo `consumers` de `design-system/components/registry.json`; mudanças devem atualizar registro e perfil no mesmo change set.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- categoria e traits são herdados sem redefinição local;
- anatomia e variantes acima são suficientes para reproduzir a família;
- estados particulares são observáveis e não contradizem a categoria;
- nenhuma decisão visual fica a cargo do consumidor.

## Implementation status

Implementado em `ui`; perfil homologado documentalmente. Homologação não declara a estilização atual conforme.

