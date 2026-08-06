# Popover

## Identity

| Field | Value |
| --- | --- |
| Component ID | `ui-popover` |
| Nature | `ui-generic` |
| Lifecycle | `implemented` |
| Current layer | `ui` |
| Target layer | `ui` |
| Sources | `src/components/ui/popover.tsx` |
| Public exports | `Popover` (component), `PopoverTrigger` (compound-part), `PopoverContent` (compound-part) |

## Purpose

Expor conteúdo contextual não modal ancorado a um trigger.

## Category inheritance

Herda integralmente [overlays](../../categories/overlays.md). Traits autorizados: nenhum. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Root `Popover` e exports visuais registrados: `Popover`, `PopoverTrigger`, `PopoverContent`. Sem primitive base; compõe somente dependências permitidas pela layer.

## Visual contract

- `PopoverContent` usa `surface`, `border-subtle`, `rounded-control`, `shadow-floating` e `z-popover` por padrão.
- `layer="modal"` resolve explicitamente para `z-modal` quando o conteúdo é aberto dentro de um `Dialog` ou `Sheet`; o contexto não é inferido pela árvore de DOM do portal.
- O consumidor não aplica z-index arbitrário para compensar o portal; foco, teclado, dismiss e retorno de foco continuam sob responsabilidade do Radix.

## Allowed variants

## Family contract

`Popover` provides anchored open state. `PopoverTrigger` owns invocation and `PopoverContent` owns the temporary surface; both remain context-bound parts.

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

