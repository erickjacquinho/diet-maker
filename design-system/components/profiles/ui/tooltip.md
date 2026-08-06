# Tooltip

## Identity

| Field | Value |
| --- | --- |
| Component ID | `ui-tooltip` |
| Nature | `ui-generic` |
| Lifecycle | `implemented` |
| Current layer | `ui` |
| Target layer | `ui` |
| Sources | `src/components/ui/tooltip.tsx` |
| Public exports | `Tooltip` (component), `TooltipTrigger` (compound-part), `TooltipContent` (compound-part), `TooltipProvider` (compound-part) |

## Purpose

Expor descrição breve não interativa associada a um trigger.

## Category inheritance

Herda integralmente [overlays](../../categories/overlays.md). Traits autorizados: nenhum. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Parts públicas: provider, root, trigger e content; content não aceita controles.

## Visual contract

- `TooltipContent` usa `z-tooltip` como camada transitória superior e não recebe override modal.
- Tooltip complementa nome/descrição acessível e não é usado como workaround para conflitos de portal.

## Allowed variants

## Family contract

`TooltipProvider` establishes shared timing context, `Tooltip` owns local state, and `TooltipTrigger`/`TooltipContent` are the associated context-bound parts. Tooltip never replaces an accessible name.

Somente o subconjunto necessário da categoria; o componente não introduz variante visual autônoma.

## Particular states

Nenhum estado adicional; todos os estados aplicáveis e seus N/A justificados são herdados da categoria.

## Composition

Sem primitive base; compõe somente dependências permitidas pela layer. Compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

## Content rules

Title único e copy objetiva; body contém a informação completa e footer somente ações.

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

