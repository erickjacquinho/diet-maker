# Spinner

## Identity

| Field | Value |
| --- | --- |
| Component ID | `ui-spinner` |
| Nature | `ui-generic` |
| Lifecycle | `implemented` |
| Current layer | `ui` |
| Target layer | `ui` |
| Sources | `src/components/ui/spinner.tsx` |
| Public exports | `Spinner` (component) |

## Purpose

Expor o primitivo genérico de indicador indeterminado inline.

## Category inheritance

Herda integralmente [loading](../../categories/loading.md). Traits autorizados: nenhum. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Root `Spinner` e exports visuais registrados: `Spinner`. Sem primitive base; compõe somente dependências permitidas pela layer.

## Allowed variants

## Family contract

`Spinner` is the visual loading root. It owns the indicator animation and accessible status label; it has no context-dependent child.

Inline 16 (`size-4`) no slot de ícone; host declara a receita e o papel semântico.

## Particular states

Especializa `loading` com label acessível e `aria-busy` no menor region responsável (o host); os demais estados são herdados sem alteração. Reduced motion remove a rotação.

## Composition

Sem primitive base; compõe somente dependências permitidas pela layer. Compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

## Content rules

Label descreve a operação; indicador não inventa conteúdo nem progresso.

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
