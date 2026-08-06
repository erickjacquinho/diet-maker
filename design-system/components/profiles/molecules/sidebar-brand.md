# SidebarBrand

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-sidebar-brand` |
| Nature | `product-generic` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/SidebarBrand.tsx` |
| Public exports | `SidebarBrandProps` (type), `SidebarBrand` (component) |

## Purpose

Apresentar a identidade NutriDiet nas anatomias expanded e collapsed.

## Category inheritance

Herda integralmente [navigation](../../categories/navigation.md). Traits autorizados: `identity`, `collapsible`. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Root `SidebarBrand` e exports visuais registrados: `SidebarBrand`. Não possui primitive base único; compõe `Avatar`, `IconButton`, `Tooltip` e `Link` por seus contratos públicos.

## Allowed variants

Expanded e collapsed.

## Particular states

Nenhum estado adicional; todos os estados aplicáveis e seus N/A justificados são herdados da categoria.

## Composition

The molecule owns its props contract and can be consumed without importing `SidebarNav`; the organism passes collapse state and the toggle callback downward. It remains responsible only for product identity and the visible collapse action.

Expanded uses `subsection-title`/`caption`; collapsed keeps the full `NutriDiet Pro Local` accessible name on the home link. The collapse action uses the standard control size and icon-16 in both states.

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

Implementado em `molecule`; perfil homologado. A composição do organismo e o estado collapsed são recebidos por props, sem importar o organismo.

