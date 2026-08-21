# Separator

## Identity

| Field | Value |
| --- | --- |
| Component ID | `ui-separator` |
| Nature | `ui-generic` |
| Lifecycle | `implemented` |
| Current layer | `ui` |
| Target layer | `ui` |
| Sources | `src/components/ui/separator.tsx` |
| Public exports | `Separator` (component) |

## Purpose

Separar grupos visual ou semanticamente com uma linha discreta.

## Category inheritance

Herda integralmente [surfaces](../../categories/surfaces.md). Traits autorizados: nenhum. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Root `Separator` e exports visuais registrados: `Separator`. Sem primitive base; compõe somente dependências permitidas pela layer.

## Allowed variants

## Family contract

`Separator` is a visual root for a structural divider and owns its orientation and decorative semantics; it has no child parts.

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

