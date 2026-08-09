# Data Model: Adequação da Sidebar ao Design System

Este documento descreve os contratos de dados necessários para implementar a correção. Não introduz persistência nem altera o domínio nutricional.

## SidebarNavigationItem

Representa uma entrada fornecida pelo adaptador da aplicação ao organismo.

| Campo | Tipo conceitual | Obrigatório | Regras |
|---|---|---:|---|
| `kind` | `route` ou `group` | sim | Discrimina destino direto de grupo futuro. |
| `id` | string estável | group | Único entre itens irmãos; usado para estado e testes. |
| `label` | string não vazia | sim | Nome humano do destino/grupo; nunca apenas identificador técnico. |
| `icon` | componente de ícone | route/group opcional | Decorativo quando existe label visível; deve respeitar icon-16. |
| `href` | pathname absoluto | route | Mantém a URL de produção; grupos não possuem destino implícito. |
| `children` | lista de route items | group | Deve conter ao menos um filho para o grupo ser renderizado. |
| `match` | regra de rota | route opcional | Default exact; regras prefixadas só quando documentadas para rotas filhas. |
| `defaultOpen` | boolean | group opcional | Estado inicial do fixture/grupo, sem persistência. |

### Invariantes

- `label` não pode ser vazio e deve continuar disponível no collapsed state via accessible name/tooltip.
- `href` deve começar com `/` e não pode duplicar outro destino no mesmo modelo.
- Um grupo vazio é filtrado antes da renderização.
- Um child current torna seu ancestor discoverable/active, mas não muda a topologia flat do modelo de produção.
- A configuração de produção contém exatamente os seis destinos existentes, em sua ordem atual.

## SidebarRouteState

Estado derivado de `pathname` e `SidebarNavigationItem`.

| Estado | Regra | Semântica |
|---|---|---|
| `default` | Não corresponde ao pathname | Link navegável sem `aria-current`. |
| `current` | Match exato ou prefixo documentado | Link com `aria-current="page"`, estado visual não baseado somente em cor. |
| `ancestor-current` | Grupo possui child current | Disclosure/grupo informa contexto atual e mantém child discoverable. |
| `unknown-path` | Nenhuma correspondência | Nenhum item é falsamente marcado; shell continua operável. |

## SidebarPresentation

| Campo | Valores | Regra |
|---|---|---|
| `state` | `expanded`, `collapsed` | Controlado pelo provider em memória. |
| `width` | `224px`, `64px` | Mapeado aos aliases canônicos. |
| `reducedMotion` | boolean derivado | Duração efetiva 0ms e sem transformações quando true. |
| `initialCollapsed` | boolean de entrada | Define apenas o estado inicial; não persiste. |

## SidebarActionState

Representa o estado de um elemento de identidade/ação da footer.

| Campo | Perfil | Regra |
|---|---|---|
| `action` | `account`, `save`, `open` | Identifica o contrato semântico. |
| `callbackPresent` | boolean | Determina se há ativação possível. |
| `interactive` | boolean derivado | `account` só é true com `onOpenAccount`; save/open só com handler. |
| `disabled` | boolean derivado | Save/open são true quando handler ausente; account sem handler é identidade não interativa, não botão disabled. |
| `disabledReason` | string opcional | Obrigatório para save/open disabled; deve ser anunciado por descrição acessível. |
| `accessibleLabel` | string | Preserva label completo também no collapsed state. |

## DesignSystemCatalogRecord

Registro documental, sem persistência de runtime.

| Campo | Regra |
|---|---|
| `componentId` | Deve corresponder ao `registry.json`. |
| `layer`/`category` | Deve refletir a hierarquia Atomic Design e a categoria visual. |
| `sources`/`exports` | Devem corresponder aos arquivos e exports públicos reais. |
| `primitiveBase` | Deve identificar `ui-sidebar` quando aplicável. |
| `consumers` | Deve listar organism, molecules, template/app adapter conforme a dependência real. |
| `lifecycle/status` | Deve distinguir implementado/documentado de homologação visual pendente. |

## Relationships

```text
ApplicationNavigationAdapter
  ├── pathname ───────────────┐
  └── navigationItems ────────┤
                               ▼
                         SidebarNav organism
                           ├── SidebarNavigationItem[]
                           ├── SidebarPresentation
                           └── SidebarActionState
                               ├── SidebarBrand
                               ├── SidebarNavItem
                               ├── SidebarUserProfile
                               └── SidebarQuickActions

DesignSystemCatalogRecord documents all nodes and their allowed dependencies.
```
