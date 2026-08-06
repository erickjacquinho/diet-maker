# SidebarUserProfile

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-sidebar-user-profile` |
| Nature | `product-generic` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/SidebarUserProfile.tsx` |
| Public exports | `SidebarUserProfileProps` (type), `SidebarUserProfile` (component) |

## Purpose

Apresentar identidade do usuário e acesso ao menu de conta.

## Category inheritance

Herda integralmente [navigation](../../categories/navigation.md). Traits autorizados: `identity`, `collapsible`. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Root `SidebarUserProfile` e exports visuais registrados: `SidebarUserProfile`. Não possui primitive base único; compõe `Avatar` e `Tooltip` por seus contratos públicos.

## Allowed variants

Expanded e collapsed.

## Particular states

Nenhum estado adicional; todos os estados aplicáveis e seus N/A justificados são herdados da categoria.

## Composition

The molecule owns identity fallback rendering and receives doctor metadata and collapse state by props. It does not depend on the `SidebarNav` organism; the organism supplies only product data and presentation state.

`onOpenAccount` is optional. When present, expanded and collapsed identity render a keyboard-operable Button/IconButton with the account name; when absent, the profile is informational and has no button role, action cursor or action hover.

Sem primitive base único; compõe somente dependências permitidas pela layer. Compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

## Content rules

Labels nomeiam destinos; estado current é programático; collapsed conserva nome completo.

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

Implementado em `molecule`; perfil homologado. Expanded exibe nome e função; collapsed preserva identidade e tooltip.

