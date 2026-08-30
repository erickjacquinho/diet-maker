# Category: Nutrition Domain

Category ID: `nutrition-domain`  
Lifecycle: `stable`  
Decision reference: `CAT-2026-07-31-nutrition-domain`  
Allowed traits: `nutrition-macro`, `nutrition-context`, `async`, `read-only`, `interactive-surface`  
Current consumers: `molecule-auto-kcal-section`, `molecule-macro-metric-card`, `molecule-meal-item-row`, `molecule-recipe-card`, `molecule-recipe-ingredient-row`, `organism-macro-tracker-header`, `organism-meal-card-container`

Normative foundations: [color](../../04-color-system.md), [typography](../../05-typography-system.md), [geometry](../../06-geometry-and-desktop-layout.md), [motion and layers](../../07-icons-motion-and-layers.md), [states and accessibility](../../08-states-and-accessibility.md).

## Purpose

Representar calorias, macronutrientes, alimentos, receitas e refeições com semântica nutricional constante e comparação segura.

## Includes

Métricas de kcal/macros, distribuição de macros, rows de alimento/ingrediente, cards de receita/refeição e cálculo automático de energia. A entrada exige conceito nutricional central, não apenas um número com unidade.

## Excludes

Dados genéricos pertencem a `data-display`; input isolado a `fields`; busca modal a `overlays`; seleção de modo a `selection`; container sem significado nutricional a `surfaces`.

## Relationship map

Herda fundamentos de cor, tipografia e geometria; compõe `data-display`, `fields`, `actions`, `surfaces`, `loading` e `feedback`. Traits acrescentam capacidades. A cor de macro é reservada a proteína, carboidrato e gordura; calorias usam hierarquia neutra/primary.

## Base anatomy

Métrica: label, value, unit e referência/meta opcional. Food/ingredient row: identidade, quantidade/unidade, kcal/macros e actions opcionais. Meal/recipe: title, summary, items e actions. Proibidos: macro sem nome, unidade implícita ambígua, total sem origem e cor de macro aplicada ao container inteiro.

## Geometry

Métrica compacta usa padding `surface-compact`, standard `surface-standard`, destaque `surface-highlight`; radius `radius-surface`, borda 1px. Rows têm mínimo 44, gap `space-related`; grupos de macros usam grid com gap 16; progress track 6. Valores alinham à direita/baseline e cards não têm shadow.

## Typography

Total principal `metric-hero` ou `metric-large`; macro `metric-standard`; row `metric-compact`; unidade `metric-unit`; label `chart-label`; micro label `chart-micro`; título de meal/recipe `card-title`; alimento `body-strong`; metadado `metadata`; número tabular obrigatório.

## Tokens by part

| Part | Property | Token |
| --- | --- | --- |
| calories | text/accent | `text-primary` / `primary` |
| protein | text/background/border | `macro-protein` / `macro-protein-soft` / `macro-protein-border` |
| carbohydrate | text/background/border | `macro-carbohydrate` / `macro-carbohydrate-soft` / `macro-carbohydrate-border` |
| fat | text/background/border | `macro-fat` / `macro-fat-soft` / `macro-fat-border` |
| container | background/border | `surface` / `border-subtle` |
| secondary metadata | text | `text-secondary` |
| divider | border | `border-divider` |
| focus | ring/offset | `primary-focus` / `focus-ring-offset` |

## Allowed variants

Métrica `compact`, `standard`, `large`, `hero`; nutrient `calories`, `protein`, `carbohydrate`, `fat`; row `food`, `ingredient`, `meal-summary`; container `meal`, `recipe`, `auto-kcal`. Interactive surface só quando o root abre um único detalhe e não contém ações concorrentes.

## State matrix

| State | Background | Text | Border | Icon | Cursor | Motion | Semantic announcement |
| --- | --- | --- | --- | --- | --- | --- | --- |
| default | `surface` | semantic text/macro | `border-subtle` | semantic/`text-muted` | default | none | conceito, valor e unidade |
| hover | N/A estático; interativo `surface-hover` | preservado | `border-hover` | preservado | pointer | color 120ms | none |
| pressed | N/A estático; interativo `surface-subtle` | preservado | preservado | preservado | pointer | color 120ms | none |
| focus-visible | N/A estático; interativo ring | preservado | 1px + ring | preservado | pointer | none | nome da abertura |
| selected | `primary-soft` apenas quando seleção delegada | `text-primary` | `primary-border` | `primary` | default | none | selected via controle associado |
| disabled | ações internas usam disabled; dado permanece legível | `text-secondary` | `border-subtle` | `disabled` em ação | not-allowed na ação | none | ação indisponível |
| loading | estrutura/skeleton preservada | `text-muted` | preservado | spinner opcional | wait | loading recipe | região nutricional busy |
| error | `error-soft` na região afetada | `text-primary` | `error-border` | `error` | default | none | erro e recuperação |
| empty | `surface-subtle` | `text-secondary` | `border-subtle` | `text-muted` | default | none | ausência + próximo passo |
| read-only | `surface`/`surface-subtle` | valores `text-primary` | `border-subtle` | `text-muted` | default | none | valores e unidades |

## Interaction and keyboard

Valores estáticos não recebem foco. Root interativo segue link/button e não contém ações internas; caso contrário, cada action é independente. Edição usa fields/actions separados. Reordenação futura exige controle explícito e teclado, nunca drag-only.

## Accessibility

Macro sempre possui nome textual e unidade; cor é redundante. Valores e metas são anunciados na ordem conceito → valor → unidade → referência. Abreviações têm expansão acessível quando ambíguas. Foco 2px/offset 2, target 32+, contraste AA e zoom 200%.

## Composition

MacroMetric compõe label/value/unit/progress; food row compõe identificação, dados e actions; MealCard contém rows e resumo. Category ownership permanece nutrition-domain mesmo ao usar atoms genéricos. Child não define margem externa.

## Content and overflow

Usar `kcal`, `g` e `%` conforme contexto; números com locale pt-BR, precisão definida pelo cálculo de domínio e dígitos tabulares. Nome de alimento quebra até duas linhas; tabela pode truncar com acesso ao nome completo. Totais ausentes exibem estado empty, não zero falso.

### Ordem Canônica Normativa (Macros + Calorias)
Toda e qualquer criação, agrupamento ou apresentação de macronutrientes + energia (cards de métricas, headers de rastreamento, tabelas de alimentos/ingredientes, modais de metas e resumos) **DEVE OBRIGATORIAMENTE** seguir a sequência canônica fixa:
1. **Proteína (`P` / protein)** — gramas (`g`)
2. **Carboidrato (`C` / carbohydrate)** — gramas (`g`)
3. **Gordura (`G` / fat)** — gramas (`g`)
4. **Calorias (`kcal` / calories)** — quilocalorias (`kcal`)

## Forbidden decisions

Inventar cor para calorias/micronutriente; trocar cores oficiais de macros; alterar ou inverter a ordem canônica (proteína → carboidrato → gordura → calorias); usar macro color para severity; omitir unidade; colorir card inteiro; arredondamento pill; shadow; border acima de 1px; cálculo ou precisão decididos no componente visual; input disabled para consulta.

## Current examples

`molecule-macro-metric-card`, `organism-macro-tracker-header` e `molecule-auto-kcal-section` cobrem métricas; rows/cards de meal/recipe cobrem alimentos e agrupamentos.

## Category acceptance

Passa quando conceito, unidade, precisão de apresentação, hierarquia, macro token, total/meta, estados async/read-only e composição são reproduzíveis sem decisão visual ou de domínio local.

## Change history

- `CAT-2026-07-31-nutrition-domain`: categoria estabilizada com semântica oficial de macros e calorias neutras.
