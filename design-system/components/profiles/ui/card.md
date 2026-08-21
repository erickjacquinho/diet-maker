# Card

## Identity

| Field | Value |
| --- | --- |
| Component ID | `ui-card` |
| Nature | `ui-generic` |
| Lifecycle | `implemented` |
| Current layer | `ui` |
| Target layer | `ui` |
| Sources | `src/components/ui/card.tsx` |
| Public exports | `Card` (component), `CardHeader` (compound-part), `CardFooter` (compound-part), `CardTitle` (compound-part), `CardDescription` (compound-part), `CardContent` (compound-part) |

## Purpose

Expor a família compound de superfície para agrupamento local.

## Category inheritance

Herda integralmente [surfaces](../../categories/surfaces.md). Traits autorizados: nenhum. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Parts públicas: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` e `CardFooter`; root/content formam o mínimo.

## Allowed variants

## Family contract

`Card` owns the generic surface root. `CardHeader`, `CardFooter` and `CardContent` are structural slots; `CardTitle` and `CardDescription` are visual slots. All children remain composition-dependent parts of the same family.

Somente o subconjunto necessário da categoria; o componente não introduz variante visual autônoma.

## Particular states

Nenhum estado adicional; todos os estados aplicáveis e seus N/A justificados são herdados da categoria.

## Composition

Sem primitive base; compõe somente dependências permitidas pela layer. Compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

## Content rules

Título nomeia o agrupamento; conteúdo crítico não é truncado pelo wrapper.

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

