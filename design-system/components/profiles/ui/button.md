# Button

## Identity

| Field | Value |
| --- | --- |
| Component ID | `ui-button` |
| Nature | `ui-generic` |
| Lifecycle | `implemented` |
| Current layer | `ui` |
| Target layer | `ui` |
| Sources | `src/components/ui/button.tsx` |
| Public exports | `ButtonProps` (type), `Button` (component), `buttonVariants` (recipe) |

## Purpose

Expor o primitivo genérico de comando com variantes e estado assíncrono.

## Category inheritance

Herda integralmente [actions](../../categories/actions.md). Traits autorizados: `async`. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Root `Button` e exports visuais registrados: `Button`, `buttonVariants`. Sem primitive base; compõe somente dependências permitidas pela layer.

## Allowed variants

Subconjunto: primary, secondary, quiet e destructive; compact/standard; `asChild` somente quando preserva semântica.

## Particular states

Especializa `loading`/`refreshing` com `aria-busy` no menor region responsável; os demais estados são herdados sem alteração.

## Composition

Sem primitive base; compõe somente dependências permitidas pela layer. Compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

## Content rules

Label específico deve ser verbo curto; icon-only fornece accessible name equivalente.

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

