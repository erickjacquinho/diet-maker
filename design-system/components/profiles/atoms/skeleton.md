# Skeleton

## Identity

| Field | Value |
| --- | --- |
| Component ID | `atom-skeleton` |
| Nature | `product-generic` |
| Lifecycle | `proposed` |
| Current layer | `null` |
| Target layer | `atom` |
| Sources | nenhuma fonte — proposta |
| Public exports | `SkeletonProps` (type), `Skeleton` (component) |

## Purpose

Propor placeholders estruturais sem layout shift.

## Category inheritance

Herda integralmente [loading](../../categories/loading.md). Traits autorizados: `async`. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Root `Skeleton` e exports visuais registrados: `Skeleton`. Sem primitive base; compõe somente dependências permitidas pela layer.

## Allowed variants

Text line, avatar e block, sempre espelhando uma parte real.

## Particular states

Especializa `loading`/`refreshing` com `aria-busy` no menor region responsável; os demais estados são herdados sem alteração.

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

Proposta documentada (`specified`), sem fonte atual e fora da baseline. Implementação futura exige SDD próprio e atualização do registro.

