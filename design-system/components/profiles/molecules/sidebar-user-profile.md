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

`onOpenAccount` and `onSignOut` are optional callbacks for account actions. When either is supplied, expanded and collapsed identity render a keyboard-operable Button/IconButton with a dropdown containing only `Configurações` and `Sair`. Without either callback, the profile is informational and has no button role, action cursor or action hover. Backup commands belong to the dashboard and are not part of this molecule's props or menu.

Na integração de produção, `SidebarNavigationAdapter` abre o `SettingsDialog` (perfil profissional e save) sem mudar a rota e fornece `doctorName` e `doctorRole` a partir do perfil profissional da conta. As iniciais do avatar derivam de `doctorName` (primeira e última palavra), com `DR` como fallback. Um `onOpenAccount` explícito do consumidor permanece respeitado. O conteúdo e o estado desse modal pertencem à integração da aplicação, sem alterar o contrato visual desta molécula.

`onOpenAccount` recebe opcionalmente o botão do perfil como origem para restaurar foco após um modal. Consumidores sem parâmetros continuam compatíveis; a referência não altera os controles nem o fechamento do menu.

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

Implementado em `molecule`. O perfil descreve o contrato visual homologado; expanded exibe nome e função, collapsed preserva identidade e tooltip. A conformidade visual desta versão aguarda aceitação manual desktop.

