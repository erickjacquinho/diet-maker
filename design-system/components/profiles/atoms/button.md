# Button

## Identity

| Field | Value |
| --- | --- |
| Component ID | `atom-button` |
| Nature | `product-generic` |
| Lifecycle | `implemented` |
| Current layer | `atom` |
| Target layer | `atom` |
| Sources | `src/components/atoms/Button.tsx` |
| Public exports | `ButtonProps` (type), `Button` (component), `CreateButtonProps` (type), `CreateButton` (compound-part), `SecondaryActionButtonProps` (type), `SecondaryActionButton` (compound-part) |

## Purpose

Consolidar variantes, tamanhos e loading do botão do produto.

## Category inheritance

Herda integralmente [actions](../../categories/actions.md). Traits autorizados: `async`. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Root `Button` e exports visuais registrados: `Button`, `CreateButton`, `SecondaryActionButton`. Base declarada: `ui-button`.

## Allowed variants

Somente as receitas públicas já exportadas para priority e size; loading substitui o slot de ícone sem mudar largura.

## Particular states

Especializa `loading`/`refreshing` com `aria-busy` no menor region responsável; os demais estados são herdados sem alteração.

## Composition

Base declarada: `ui-button`. Compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

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

Implementado em `atom`; perfil homologado documentalmente. Homologação não declara a estilização atual conforme.

