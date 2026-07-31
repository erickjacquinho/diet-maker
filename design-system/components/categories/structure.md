# Category: Structure

Category ID: `structure`  
Lifecycle: `stable`  
Decision reference: `CAT-2026-07-31-structure`  
Allowed traits: `collapsible`, `nutrition-context`  
Current consumers: `template-app-layout-shell`, `template-diet-builder-template`

Normative foundations: [color](../../04-color-system.md), [typography](../../05-typography-system.md), [geometry](../../06-geometry-and-desktop-layout.md), [motion and layers](../../07-icons-motion-and-layers.md), [states and accessibility](../../08-states-and-accessibility.md).

## Purpose

Definir shell, containers, grids, regiões e ritmo vertical das páginas desktop sem impor estilo interno aos componentes filhos.

## Includes

App shell, templates, main/header/aside, page container, workflow/form/reading containers, sections e grids de página.

## Excludes

Card local pertence a `surfaces`; sidebar a `navigation`; overlays a `overlays`; spacing interno do componente é definido por sua categoria.

## Relationship map

Posiciona todas as categorias. AppLayoutShell reserva navigation e main. DietBuilderTemplate usa contexto nutricional para regiões, mas não herda cores de macro. `collapsible` altera apenas a coluna de sidebar entre 224 e 64.

## Base anatomy

Shell: navigation + main. Page: header opcional + content. Section: heading opcional + body. Template: slots nomeados e ordem DOM. Proibidos: wrapper sem responsabilidade, margem externa controlada pelo child, região visual sem landmark quando necessária.

## Geometry

Escopo desktop >=1024. Faixas: compact 1024–1279, standard 1280–1599, wide >=1600. Containers: page 1440, workflow 1200, form 960, reading 720. Grid de 12 colunas, gap 16, region gap 24. Section gap 32; major gap 48. Sidebar 224/64. Padding de página usa tokens sem valores locais.

## Typography

Page heading `page-title`; subtitle `page-subtitle`; section `section-title`; subsection `subsection-title`; overline `overline`; body introdutório `body-large`. Template apenas atribui papel; não redefine style.

## Tokens by part

| Part | Property | Token |
| --- | --- | --- |
| app canvas | background/text | `canvas` / `text-primary` |
| main region | background | `canvas` |
| page container | max-width | `container-page` |
| workflow/form/reading | max-width | `container-workflow` / `container-form` / `container-reading` |
| grid | columns/gap | `grid-columns` / `grid-gap` |
| region | gap | `space-section` |
| page sections | gap | `space-page-section` |
| major regions | gap | `space-major` |
| divider | border | `border-divider` |

## Allowed variants

Container `page`, `workflow`, `form`, `reading`; layout `single-column`, `main-aside`, `dashboard-grid`; shell `expanded-nav`/`collapsed-nav`; density is fixed by compact/standard/wide desktop bands and never a mobile transformation.

## State matrix

| State | Background | Text | Border | Icon | Cursor | Motion | Semantic announcement |
| --- | --- | --- | --- | --- | --- | --- | --- |
| default | `canvas` | `text-primary` | divider quando necessário | N/A | default | none | landmarks/headings |
| hover | N/A — estrutura não é interativa | N/A | N/A | N/A | N/A | N/A | N/A |
| pressed | N/A — estrutura não é interativa | N/A | N/A | N/A | N/A | N/A | N/A |
| focus-visible | N/A no container; skip link/children controlam foco | N/A | N/A | N/A | N/A | N/A | N/A |
| selected | N/A — estrutura não representa seleção | N/A | N/A | N/A | N/A | N/A | N/A |
| disabled | N/A — regiões não são disabled | N/A | N/A | N/A | N/A | N/A | N/A |
| loading | layout e dimensões preservados | por skeleton/host | preservado | spinner opcional | wait no host | loading recipe | main/region busy |
| error | layout preservado | feedback interno | preservado | feedback | default | none | erro na região |
| empty | layout preservado | empty interno | preservado | empty | default | none | título/mensagem empty |
| read-only | mesma estrutura | preservado | preservado | preservado | default | none | none |

## Interaction and keyboard

Estrutura não captura pointer/teclado. Inclui skip link para main quando há navegação persistente. Ordem de Tab segue DOM e leitura. Collapse é action pertencente à navigation/actions e preserva foco.

## Accessibility

Use um `main`, landmarks nomeados quando múltiplos, hierarquia de headings sem saltos e ordem DOM independente do grid visual. Zoom 200% pode gerar reflow horizontal controlado dentro do desktop suportado, sem sobreposição ou perda de conteúdo.

## Composition

Template possui slots e gaps; filhos possuem padding interno. Section agrupa heading/body; grid define colunas/span; `main-aside` mantém main antes de aside na DOM. Não aplicar seletores descendentes para estilizar categorias filhas.

## Content and overflow

Página rola verticalmente; regiões internas só rolam quando contrato próprio exigir. Container centraliza e respeita largura máxima. Headings quebram; não truncar título de página. Wide não aumenta tamanho de texto, apenas espaço/distribuição.

## Forbidden decisions

Breakpoint mobile/tablet; esconder função por largura; grid arbitrário; margem externa no child; container acima dos tokens; sidebar diferente de 224/64; surface/shadow para todo wrapper; `position:absolute` para layout principal; styling descendente de componentes.

## Current examples

`template-app-layout-shell` define shell/sidebar/main; `template-diet-builder-template` define regiões do workflow nutricional.

## Category acceptance

Passa quando container, grid, spans, gaps, landmarks, ordem DOM, overflow e faixas desktop podem ser implementados sem valores locais ou decisões sobre estilo interno dos filhos.

## Change history

- `CAT-2026-07-31-structure`: categoria estabilizada para desktop-only com containers e grid fechados.
