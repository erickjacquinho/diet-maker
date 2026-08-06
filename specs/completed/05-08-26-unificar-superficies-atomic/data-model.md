# Data Model: Surface Contract

Esta feature não altera dados persistidos, entidades nutricionais, rotas ou APIs externas. O modelo abaixo é um contrato de apresentação e composição.

## Surface

| Campo | Tipo conceitual | Regra |
|---|---|---|
| `children` | conteúdo React | Obrigatório como composição; a base não define copy de domínio. |
| `variant` | `default`, `subtle` | Reutiliza as variantes canônicas de `surfaces`; não combina booleans independentes. |
| `density` | `compact`, `standard`, `highlight` | Controla padding/ritmo conforme os tokens aprovados pela categoria. |
| `elevation policy` | `shadow-none` | Card/superfície em fluxo não recebe sombra; overlays e elementos flutuantes permanecem em primitivas próprias. |
| `className` | extensão de layout | Pode complementar layout necessário, mas não deve substituir o contrato visual. |
| atributos HTML | passthrough | Preservam semântica, acessibilidade e data attributes do consumidor. |

## Base variants and consumer modes

| Variante | Uso | Não deve conter |
|---|---|---|
| `default` | superfície principal sobre canvas | regras de macro ou domínio |
| `subtle` | agrupamento secundário ou fundo bege | conteúdo obrigatório |
| `tinted` | modo de consumidor que usa `Surface` com tratamento semântico aprovado pela categoria | mapa fixo de proteínas/carboidratos/gorduras no atom |
| `inline` | composição sem caixa própria, quando o host fornece a superfície | borda/raio/padding/elevação duplicados; não é variante de `Surface` |

## Mapping of current MetricBox surface modes

| Modo público atual | Composição planejada | Regra |
|---|---|---|
| `boxed` | `Surface variant="subtle"` | Mantém o fundo secundário e delega geometria/padding à base. |
| `raised` | `Surface variant="default"` | O nome público é preservado; não introduz sombra, pois a categoria proíbe elevação em cards no fluxo. |
| `tinted` | `Surface variant="subtle"` + tratamento semântico do consumidor | O tom permanece fora do atom e deve consumir tokens canônicos sem recriar geometria. |
| `inline` | Sem `Surface` | É layout interno/host surface; a decisão deve permanecer registrada como modo sem caixa. |

## Consumers

| Componente | Camada | Responsabilidade própria | Uso da Surface |
|---|---|---|---|
| `MetricBox` | molecule | label, value, caption, icon, tone e layout | caixa de métrica |
| `MacroMetricCard` | molecule | valores atual/alvo, badge, progresso e g/kg | card nutricional |
| `RecipeCard` | molecule | receita, macros por porção e ações | card de domínio |
| `MealItemRow` | molecule | alimento, quantidade e ações de linha | row/surface de item |
| `MetricBoxGroup` | organism | grid, divisores e cardinalidade | shell do grupo e itens inline |
| `MacroTrackerHeader` | organism | contexto do paciente e conjunto de métricas | shell de seção |
| `MealCardContainer` | organism | edição de refeição, itens e ações | card de refeição |
| `DietBuilderTemplate` | template | composição da tela | regiões de superfície do template |

## Exception record

Uma exceção deve declarar:

1. o arquivo e elemento que não usa `Surface`;
2. por que a anatomia ou semântica não cabe na base;
3. quais tokens continuam herdados do design system;
4. quem revisa a exceção e quando ela deve ser reavaliada;
5. qual teste impede que a exceção vire uma segunda base.

## Implementation inventory

| Consumer | Current visual surface | Planned classification |
|---|---|---|
| `MetricBox` | Local `boxed`, `raised`, `tinted` and `inline` class maps | Compose `Surface` for boxed/raised/tinted; keep inline as the documented no-box mode. |
| `MacroMetricCard` | Shadcn `Card` with product surface overrides | Compose `Surface variant="subtle"`; keep macro colors, badge, progress and values in the molecule. |
| `RecipeCard` | Shadcn `Card` root plus an inner macro summary block | Compose `Surface` for the card root; classify the inner summary as a data-display treatment and do not create a nested card. |
| `MealItemRow` | Local subtle surface around the row | Compose `Surface variant="subtle" density="compact"`; controls remain controls. |
| `MetricBoxGroup` | Grid shell with border/background and inline metric cells | Compose `Surface` for the shell; preserve the grid and classify the no-padding shell override as a documented layout exception. |
| `MacroTrackerHeader` | Shadcn `Card` root with a padded content region | Compose `Surface` for the section shell; patient context and metrics remain organism content. |
| `MealCardContainer` | Shadcn `Card` root with a non-canonical floating shadow | Compose `Surface` and remove the in-flow floating shadow; preserve meal editing, items and actions. |
| `DietBuilderTemplate` | Direct context `Card` plus an empty-state surface | Compose `Surface` for the context card; keep the empty-state treatment as an explicit dashed empty-state exception. |
| Direct `src/app/` consumers | Inputs, dialogs, menus, badges, table regions and other controls also use surface tokens | Out of the named migration unless T001 identifies a true reusable card surface owned by the feature; do not migrate controls or overlays. |
