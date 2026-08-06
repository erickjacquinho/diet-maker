# Input

## Identity

| Field | Value |
| --- | --- |
| Component ID | `ui-input` |
| Nature | `ui-generic` |
| Lifecycle | `implemented` |
| Current layer | `ui` |
| Target layer | `ui` |
| Sources | `src/components/ui/input.tsx` |
| Public exports | `InputProps` (type), `Input` (component) |

## Purpose

Expor o controle HTML genérico para entrada de uma linha.

## Category inheritance

Herda integralmente [fields](../../categories/fields.md). Traits autorizados: nenhum. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Root `Input` e exports visuais registrados: `Input`. Sem primitive base; compõe somente dependências permitidas pela layer.

## Allowed variants

## Family contract

`Input` is the visual root and owns the generic field recipe, native value semantics and focus/error affordances. It has no context-dependent child.

Tipos HTML text, number, search e password; compact apenas em tabela/toolbar.

## Particular states

Nenhum estado adicional; todos os estados aplicáveis e seus N/A justificados são herdados da categoria.

## Composition

Sem primitive base; compõe somente dependências permitidas pela layer. Compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

## Content rules

Label e tipo são explícitos; placeholder não substitui label; unidade fica fora do valor editável.

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

