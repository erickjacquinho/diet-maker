# Badge

## Identity

| Field | Value |
| --- | --- |
| Component ID | `ui-badge` |
| Nature | `ui-generic` |
| Lifecycle | `implemented` |
| Current layer | `ui` |
| Target layer | `ui` |
| Sources | `src/components/ui/badge.tsx` |
| Public exports | `BadgeProps` (type), `Badge` (component), `badgeVariants` (recipe) |

## Purpose

Expor o primitivo genérico de label de status compacto.

## Category inheritance

Herda integralmente [feedback](../../categories/feedback.md). Traits autorizados: nenhum. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Root `Badge` e exports visuais registrados: `Badge`, `badgeVariants`. Sem primitive base; compõe somente dependências permitidas pela layer.

## Allowed variants

## Family contract

`Badge` is the visual root. It owns its semantic status recipe; there are no context-dependent children.

Neutral/info/success/warning/error e macro apenas quando o consumidor declara a semântica.

## Particular states

Nenhum estado adicional; todos os estados aplicáveis e seus N/A justificados são herdados da categoria.

## Composition

Sem primitive base; compõe somente dependências permitidas pela layer. Compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

## Content rules

Label nomeia status/severidade; cor e ícone são redundantes ao texto.

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

