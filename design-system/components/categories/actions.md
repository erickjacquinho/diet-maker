# Category: Actions

Category ID: `actions`  
Lifecycle: `stable`  
Decision reference: `CAT-2026-07-31-actions`  
Allowed traits: `icon-only`, `destructive`, `async`, `collapsible`  
Current consumers: `ui-button`, `atom-button`, `atom-icon-button`, `molecule-sidebar-quick-actions`

Normative foundations: [color](../../04-color-system.md), [typography](../../05-typography-system.md), [geometry](../../06-geometry-and-desktop-layout.md), [motion and layers](../../07-icons-motion-and-layers.md), [states and accessibility](../../08-states-and-accessibility.md).

## Purpose

Disparar uma operação única e imediatamente compreensível, com prioridade, consequência e estado operacional visíveis.

## Includes

Botões com texto, botões de ícone e gatilhos que executam comandos. A entrada exige verbo ou nome acessível que descreva a consequência.

## Excludes

Mudança de rota pertence a `navigation`; escolha persistente pertence a `selection`; abertura de campo não é ação autônoma; superfícies clicáveis pertencem a `surfaces` com o trait `interactive-surface`.

## Relationship map

Compõe `loading` quando `async`, usa `feedback` após o resultado e pode abrir `overlays`. `destructive` altera semântica, nunca geometria. `icon-only` remove apenas o label visual.

## Base anatomy

Obrigatórios: root interativo, label visível ou nome acessível e área de foco. Opcionais: ícone inicial/final e indicador de loading. Proibidos: dois ícones sem label, subtítulo, badge e ações aninhadas.

## Geometry

Alturas permitidas: `control-compact` (32) e `control-standard` (36). Padding horizontal: `button-compact` ou `button-standard`; gap interno `space-inline`. Icon action é quadrada na altura escolhida. Radius `radius-control`; borda de 1px. Conteúdo centralizado, uma linha, sem overflow visível.

## Typography

Use somente `button-label-compact` na altura compacta e `button-label` na standard. Labels não usam caixa alta. Nome acessível de icon action não cria texto visual.

## Tokens by part

| Part | Property | Token |
| --- | --- | --- |
| primary root | background/text | `primary` / `on-primary` |
| secondary root | background/text/border | `surface` / `text-primary` / `border-control-essential` |
| quiet root | background/text | `transparent` / `text-secondary` |
| destructive root | background/text | `error` / `on-error` |
| destructive-outline root | background/text/border | `surface` / `error` / `error` |
| focus | ring/offset | `primary-focus` / `focus-ring-offset` |
| icon | color/size | `currentColor` / `icon-16` |
| disabled | foreground/background | `disabled` / `disabled-soft` |

## Allowed variants

`primary` para a ação principal única da região; `secondary` para alternativas; `quiet` para baixa ênfase; `destructive` para perda de dados com alta ênfase; `destructive-outline` para perda de dados com ênfase contida; `icon` apenas com nome acessível. Tamanhos `compact` e `standard`. Uma região não possui mais de uma ação `primary` concorrente.

## State matrix

| State | Background | Text | Border | Icon | Cursor | Motion | Semantic announcement |
| --- | --- | --- | --- | --- | --- | --- | --- |
| default | token da variante | token da variante | 1px da variante | `currentColor` | pointer | none | nome da ação |
| hover | `primary-hover`; secundário `button-secondary-background-hover`; quiet `surface-hover` | preservado | `border-hover`; secundário `button-secondary-border-hover` | preservado | pointer | color 120ms | none |
| pressed | `primary-pressed` ou `surface-subtle` | preservado | preservado | preservado | pointer | color 120ms | none |
| focus-visible | preservado | preservado | 1px preservada + ring | preservado | pointer | none | nome da ação |
| selected | N/A — ação não guarda escolha | N/A | N/A | N/A | N/A | N/A | N/A |
| disabled | `disabled-soft` | `disabled` | `border-subtle` | `disabled` | not-allowed | none | indisponível via semântica nativa |
| loading | variante preservada | oculto visualmente sem alterar largura | preservado | spinner | wait | spinner linear | `aria-busy=true` e label operacional |
| error | N/A — erro é resultado em `feedback` | N/A | N/A | N/A | N/A | N/A | N/A |
| empty | N/A — ação exige nome | N/A | N/A | N/A | N/A | N/A | N/A |
| read-only | N/A — comando é habilitado ou disabled | N/A | N/A | N/A | N/A | N/A | N/A |

## Interaction and keyboard

Ativa por click, Enter e Space. Loading e disabled bloqueiam repetição. Foco permanece no gatilho após operação inline; ao abrir overlay, segue a gestão da categoria `overlays` e retorna ao gatilho ao fechar.

## Accessibility

Use elemento `button`, `type` explícito e nome acessível. Icon action sem label visível requer `aria-label`; tooltip não substitui o nome. Target mínimo 32; ring de 2px com offset 2; contraste WCAG 2.2 AA; spinner respeita reduced motion.

## Composition

Ícone e spinner são filhos permitidos. Grupos usam `space-control-group`; ação principal vem por último na leitura horizontal. Não aninhar link, button ou superfície interativa.

## Content and overflow

Label é verbo curto, uma linha e sem reticências em ações críticas. Se não couber, aumente a largura do container; não reduza tipografia. Loading mantém a largura do label original.

## Forbidden decisions

Mais de uma ação primary por região; altura fora de 32/36; radius pill; borda acima de 1px; ícone decorativo sem Lucide; `transition-all`, scale, shadow ou cor local; usar vermelho para ação não destrutiva.

## Current examples

`ui-button` fornece o primitivo; `atom-button` fixa receitas do produto; `atom-icon-button` aplica `icon-only`; `molecule-sidebar-quick-actions` compõe ações de navegação rápida.

## Category acceptance

Uma implementação passa quando variante, tamanho, label, estado, foco e resultado são determinados por esta categoria e traits, sem valor visual local, mantendo uma única ação primária por região.

## Change history

- `CAT-2026-07-31-actions`: categoria estabilizada com duas alturas, quatro hierarquias e traits fechados.
