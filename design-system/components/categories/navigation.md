# Category: Navigation

Category ID: `navigation`  
Lifecycle: `stable`  
Decision reference: `CAT-2026-07-31-navigation`  
Allowed traits: `collapsible`, `identity`, `icon-only`  
Current consumers: `ui-breadcrumb`, `ui-sidebar`, `ui-collapsible`, `molecule-page-context-header`, `molecule-sidebar-brand`, `molecule-sidebar-nav-item`, `molecule-sidebar-user-profile`, `organism-sidebar-nav`

Normative foundations: [color](../../04-color-system.md), [typography](../../05-typography-system.md), [geometry](../../06-geometry-and-desktop-layout.md), [motion and layers](../../07-icons-motion-and-layers.md), [states and accessibility](../../08-states-and-accessibility.md).

## Purpose

Orientar o usuário entre destinos e contextos persistentes, deixando localização atual e próximo destino explícitos.

## Includes

O breadcrumb contextual e o header contextual de fluxos sequenciais pertencem a esta categoria.

Sidebar, itens de rota, marca que retorna ao início, breadcrumbs futuros e perfil que abre navegação de conta.

## Excludes

Comandos sem mudança de destino pertencem a `actions`; alternância de modo a `selection`; menus flutuantes usam `overlays`; shell e regiões pertencem a `structure`.

## Relationship map

Compõe `structure` no shell, usa `overlays` para menus contextuais e `identity` para marca/pessoa. `collapsible` define anatomias expanded/collapsed; não introduz breakpoint mobile.

## Base anatomy

Obrigatórios: landmark, lista de destinos, item com label e indicação da rota atual. Opcionais: marca, ícone, group label, badge e perfil. Proibidos: ação destrutiva inline, controles aninhados e destino sem nome.

## Geometry

Sidebar expanded usa `sidebar-expanded` (224), collapsed `sidebar-collapsed` (64). Item tem altura 36, padding inline `control-inline`, gap `space-inline`, radius `radius-control`, sem borda por padrão. Grupos usam `space-related`; divisões usam `space-component` e `border-divider` de 1px. Overflow vertical é interno à lista.

## Typography

Item usa `nav-item`; grupo `overline`; marca `subsection-title`; identidade principal `body-small-strong`; metadado `caption`. Labels collapsed ficam apenas acessíveis/tooltip.

## Tokens by part

| Part | Property | Token |
| --- | --- | --- |
| rail | background/border | `surface` / `border-divider` |
| item | background/text | `transparent` / `text-secondary` |
| item hover | background/text | `surface-hover` / `text-primary` |
| current item | background/text | `primary-soft` / `primary` |
| icon | color | `currentColor` |
| group label | text | `text-muted` |
| focus | ring/offset | `primary-focus` / `focus-ring-offset` |

## Allowed variants

`persistent` para sidebar, `contextual` para breadcrumb futuro; item `default` ou `current`; sidebar `expanded` ou `collapsed`. Collapsed exige icon-16 e tooltip; não é uma variante para esconder a navegação em viewport menor.

## State matrix

| State | Background | Text | Border | Icon | Cursor | Motion | Semantic announcement |
| --- | --- | --- | --- | --- | --- | --- | --- |
| default | `transparent` | `text-secondary` | none | `text-muted` | pointer | none | destino |
| hover | `surface-hover` | `text-primary` | none | `text-primary` | pointer | color 120ms | none |
| pressed | `surface-subtle` | `text-primary` | none | preservado | pointer | color 120ms | none |
| focus-visible | preservado | preservado | ring externo | preservado | pointer | none | destino |
| selected | `primary-soft` | `primary` | none | `primary` | default/pointer | none | `aria-current=page` |
| disabled | `disabled-soft` | `disabled` | none | `disabled` | not-allowed | none | indisponível |
| loading | item atual preservado | `text-secondary` | none | spinner | wait | spinner linear | carregando destino |
| error | N/A — falha de rota aparece em conteúdo/feedback | N/A | N/A | N/A | N/A | N/A | N/A |
| empty | grupos vazios não são renderizados | N/A | N/A | N/A | N/A | N/A | N/A |
| read-only | N/A — destino é navegável ou omitido | N/A | N/A | N/A | N/A | N/A | N/A |

## Interaction and keyboard

Links ativam por Enter e preservam semântica de abrir em nova aba. Tab percorre destinos; collapsed mantém a mesma ordem. Toggle de collapse é `actions`, operável por Enter/Space, e mantém foco após mudança.

## Accessibility

Use `nav` com nome, links reais e `aria-current=page`. Ícone é decorativo quando há label. Collapsed conserva accessible name e tooltip. Ordem visual igual à DOM; foco 2px/offset 2; target mínimo 32 e contraste AA.

## Composition

Sidebar organiza brand, grupos, quick actions e user profile sem transferir regras visuais entre categorias. Badge não recebe foco. Navigation não define conteúdo principal nem margens de página.

## Content and overflow

Expanded trunca labels em uma linha com tooltip quando o nome completo é necessário. Collapsed oculta visualmente o texto. Lista rola; marca e perfil permanecem fixos. Labels devem nomear destinos, não ações.

## Forbidden decisions

Usar button para rota; current apenas por cor; largura fora de 224/64; bottom navigation; comportamento mobile; pill radius; sombra no rail; borda acima de 1px; ícones de bibliotecas distintas.

## Sequential route map

| Transition | Contextual destination | Explicit return |
| --- | --- | --- |
| `/pacientes` -> `/pacientes/[id]` | `Pacientes > <nome>` | `/pacientes` |
| `/pacientes/[id]` -> `/pacientes/[id]/dieta/[dietaId]` | `Pacientes > <nome> > Dieta` | `/pacientes/[id]` |
| `/pacientes/[id]` -> `/pacientes/[id]/consulta/[date]` | `Pacientes > <nome> > Consulta` | `/pacientes/[id]` |
| consulta -> dieta | `Pacientes > <nome> > Dieta` | `/pacientes/[id]` |
| dieta -> perfil | `Pacientes > <nome>` | `/pacientes` |

`PageContextHeader` compõe o retorno explícito, o breadcrumb, o `h1` e ações opcionais. `Breadcrumb` continua sendo o primitivo genérico de semântica e composição; ele não conhece pacientes, dietas ou rotas.

## Adoption rule for future pages

Uma nova página recebe o header contextual quando representa um nível sequencial de uma rota pai identificável, possui destino de retorno determinístico e consegue nomear a hierarquia sem expor identificadores técnicos. Modais, como a busca de alimentos dentro da dieta, permanecem fora do padrão porque não criam uma nova página ou transição de rota. Destinos globais independentes acessados pela sidebar também não ganham um botão de voltar contextual apenas por possuírem título ou breadcrumb.

## Current examples

`organism-sidebar-nav` agrega `ui-sidebar`, `ui-collapsible`, `sidebar-brand`, `sidebar-nav-item` e `sidebar-user-profile`; quick actions continuam na categoria `actions`. A topologia de produção permanece flat; grupos são contrato futuro fornecido por dados.

## Category acceptance

Passa quando landmark, rota atual, destino, estados expanded/collapsed, foco e overflow são reproduzíveis e todo item conserva nome e semântica de link.

## Change history

- `CAT-2026-07-31-navigation`: sidebar desktop estabilizada com larguras 224/64.
