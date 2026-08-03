# 12 — Especificações de componentes

## 1. Status deste catálogo

Este documento define o **contrato-alvo**. A presença de uma especificação não significa que o código atual já esteja conforme.

Estados:

- `implemented`: arquivo existe;
- `migration-required`: existe, mas contrato ou camada precisa mudar;
- `proposed`: necessário por uso real, ainda sem implementação;
- `stable`: somente após conformidade e testes.

## 2. Primitivos Shadcn/Radix

| Primitivo | Estado | Uso |
| --- | --- | --- |
| Badge | implemented | Base genérica de badge |
| Button | implemented | Base de ação |
| Card | implemented | Estrutura de superfície |
| Dialog | implemented | Modal acessível |
| DropdownMenu | implemented | Menu contextual |
| Input | implemented | Campo de uma linha |
| Popover | implemented | Conteúdo contextual |
| ScrollArea | implemented | Região com scroll |
| Select | implemented | Seleção fechada |
| Separator | implemented | Separação semântica |
| Sheet | implemented | Overlay lateral |
| Table | implemented | Estrutura tabular |
| Tabs | implemented | Navegação entre painéis |
| Tooltip | implemented | Explicação auxiliar |
| Textarea | proposed | Substituir textareas nativas repetidas |

Regras:

- permanecem genéricos;
- usam tokens de sistema;
- não conhecem domínio;
- comportamento Radix não deve ser reimplementado;
- páginas preferem atoms ou composições registradas quando houver contrato correspondente.

## 3. Atoms

### 3.1 Button

Propósito: executar ação.

Variantes:

| Variante | Uso |
| --- | --- |
| `primary` | Única ação principal da região |
| `secondary` | Ação alternativa |
| `ghost` | Ação de baixa prioridade |
| `danger` | Ação destrutiva |
| `link` | Ação textual sem container |

Tamanhos:

- `compact`: 32px, `button-label-compact`;
- `standard`: 36px, `button-label`.

Regras:

- raio 6px;
- sem tamanho large;
- sem variante emerald, terracotta ou cor de macro;
- ícone 14px compact ou 16px standard;
- loading preserva largura;
- no máximo um primary por região;
- CreateButton e SecondaryActionButton tornam-se variantes/receitas, não APIs paralelas.

### 3.2 IconButton

Propósito: ação reconhecível por ícone.

Variantes: `secondary`, `ghost`, `danger`.

Regras:

- 32px ou 36px quadrado;
- raio 6px;
- ícone 14px ou 16px;
- `aria-label` obrigatório e sem fallback genérico;
- tooltip recomendado para ação não universal;
- EditIconButton e DeleteIconButton podem permanecer receitas explícitas.

### 3.3 Input

Propósito: entrada textual ou numérica de uma linha.

Regras:

- altura 36px padrão, 32px compact;
- raio 6px;
- borda 1px `border-control-essential`;
- `field-value` e `field-placeholder`;
- label externo obrigatório;
- unidade fica fora do valor;
- estados conforme matriz de campos.

### 3.4 Textarea

Estado: proposed.

Propósito: texto multilinha.

Regras:

- mínimo 80px;
- padding 12px;
- resize vertical;
- mesmas regras de Input;
- deve substituir ocorrências nativas nas páginas.

### 3.5 Badge

Propósito: estado, categoria ou atributo curto.

Variantes:

```text
neutral
primary
info
success
warning
error
protein
carbohydrate
fat
```

Regras:

- altura mínima 24px;
- raio 4px, nunca pill;
- `badge-label`;
- uma linha;
- não usar como botão;
- cor sempre corresponde ao significado.

### 3.6 Avatar

Propósito: representar pessoa.

Tamanhos: 32px, 36px, 44px.

Regras:

- circular por exceção geométrica;
- imagem possui alt apropriado;
- iniciais usam `body-small-strong`;
- fallback determinístico;
- não usar cor de macro;
- variante padrão neutra; primary apenas quando houver seleção.

### 3.7 ProgressBar

Propósito: progresso conhecido de 0 a 100.

Tons:

```text
primary
protein
carbohydrate
fat
success
warning
error
neutral
```

Regras:

- track de 6px;
- raio 4px, não full;
- valor limitado a 0–100 visualmente;
- valores acima da meta são comunicados em texto;
- label acessível;
- cor não é único indicador.

### 3.8 Spinner

Estado: proposed.

Propósito: indicar operação indeterminada.

Regras:

- 14px em controle, 16px em região;
- label visível ou acessível;
- rotação linear;
- não substituir skeleton de conteúdo amplo.

### 3.9 Skeleton

Estado: proposed.

Propósito: preservar estrutura durante carregamento de conteúdo.

Regras:

- geometria aproxima conteúdo;
- usa neutros;
- sem texto falso;
- sem pulse em reduced motion.

## 4. Molecules genéricas

### 4.1 FormField

Estado: proposed.

Composição:

```text
label
control
helper
validation
```

Propósito: garantir associação, spacing e estados de formulário.

API mínima:

- `label`;
- `htmlFor`;
- `required`;
- `helper`;
- `error`;
- `children`.

### 4.2 SidebarNavItem

Estado: migration-required.

Propósito: item individual de navegação.

Regras:

- implementação deve viver na camada molecule;
- SidebarNav importa o item, nunca o contrário;
- ativo usa `primary-soft` ou primary conforme contraste;
- suporta sidebar recolhida com tooltip;
- ícone 16px e `nav-item`.

### 4.3 SidebarBrand

Estado: migration-required.

Propósito: identidade e controle de recolhimento.

Regras:

- não importa SidebarNav;
- título e subtítulo usam styles previstos;
- estado recolhido mantém nome acessível.

### 4.4 SidebarUserProfile

Estado: migration-required.

Propósito: identidade do profissional no shell.

Regras:

- não importa SidebarNav;
- usa Avatar;
- não contém regra nutricional.

### 4.5 SidebarQuickActions

Estado: migration-required.

Propósito: ações globais realmente disponíveis.

Regras:

- não importa SidebarNav;
- ações inexistentes não aparecem disabled por decoração;
- callbacks e labels explícitos.

## 5. Molecules de domínio

### 5.1 TacoSearchInput

Propósito: buscar alimento TACO.

Base: Input + Search icon.

Estados:

- vazio;
- preenchido;
- focus;
- disabled;
- searching;
- sem resultados comunicado pelo consumidor.

Não inclui resultados nem lógica de seleção.

### 5.2 MacroMetricCard

Propósito: exibir valor, meta e progresso de uma métrica nutricional.

API semântica alvo:

```text
kind: calories | protein | carbohydrate | fat
value
target
percentage
ratio?
status?
```

Regras:

- kind decide a cor;
- consumidor não passa macroColor;
- somente uma métrica hero por região;
- números tabulares;
- progresso e texto não dependem apenas de cor;
- card padrão com raio 8px e padding 16px.

### 5.3 MealItemRow

Propósito: representar e editar alimento dentro de refeição.

Regras:

- nome é `table-cell-strong` ou `body-small-strong`;
- macros usam tons fixos;
- quantidade usa Input compact;
- remoção usa IconButton danger;
- reordenação possui alternativa de teclado;
- ações essenciais não aparecem somente em hover.

### 5.4 RecipeIngredientRow

Propósito: editar quantidade de ingrediente em receita.

Regras:

- mesma anatomia base de MealItemRow quando responsabilidades coincidirem;
- avaliar composição compartilhada antes de manter duplicação;
- input compact e unidade externa;
- remoção acessível.

### 5.5 PatientBadgeHeader

Propósito: contexto resumido de paciente.

Composição:

- Avatar;
- nome;
- peso;
- objetivo;
- ação de ajuste.

Regras:

- nome usa `subsection-title`;
- peso é dado, não badge de status quando não houver necessidade;
- uma ação principal no máximo;
- não contém busca de dados.

### 5.6 AutoKcalSection

Propósito: editar macros e apresentar calorias calculadas.

Regras:

- labels e valores usam catálogo tipográfico;
- proteína, carboidrato e gordura usam cores oficiais;
- calorias usam neutral/primary;
- read-only não parece disabled;
- fórmula pode aparecer como helper;
- grid permanece 3 colunas na faixa desktop suportada.

### 5.7 RecipeCard

Propósito: resumir receita e expor ações.

Regras:

- card padrão, sem sombra;
- categoria usa Badge;
- título usa `card-title`;
- instrução usa `body-quote` somente se for trecho real;
- macros usam grid compacto;
- primary apenas quando prescrever for a tarefa da região;
- card não é clicável se contém botões internos.

## 6. Organisms

### 6.1 SidebarNav

Propósito: navegação persistente do app.

Regras:

- 224px expandida, 64px recolhida;
- não vira drawer;
- permanece fixa;
- item ativo único;
- navegação separada de ações globais e perfil;
- contexto de collapse pode permanecer local;
- subcomponentes são imports descendentes.

### 6.2 MacroTrackerHeader

Propósito: contexto do paciente e resumo das metas.

Regras:

- compõe PatientBadgeHeader e MacroMetricCard;
- 2×2 em desktop compacto, 4×1 em desktop padrão;
- um único card externo somente se necessário;
- evita card dentro de card com todas as bordas visíveis.

### 6.3 MealCardContainer

Propósito: gerenciar uma refeição e seus alimentos.

Estados:

- vazia;
- com itens;
- edição de nome/horário;
- loading de ação;
- erro local.

Regras:

- card padrão;
- header, lista e ações claramente separados;
- adicionar alimento é primary somente dentro da refeição vazia;
- duplicar, escalar e excluir possuem hierarquia própria;
- valores recalculados usam números tabulares.

### 6.4 DietModeSwitcher

Estado: migration-required para organism.

Propósito: escolher modelo da dieta e variação ativa.

Regras:

- segmented control usa Tabs/Toggle semantics;
- sem pills;
- seleção usa primary-soft + indicador;
- modo simples oculta controles não aplicáveis;
- não usar sombras ou borda de 2px.

### 6.5 FoodSearchModal

Estado: migration-required para organism.

Propósito: buscar, configurar quantidade e adicionar alimento.

Regras:

- usa Dialog;
- busca e resultados possuem estados loading, empty e no-results;
- item selecionado é comunicado semanticamente;
- quantidade possui label e unidade;
- ação adicionar é primary;
- foco inicial na busca e retorno ao acionador.

### 6.6 ReadOnlyDietModal

Estado: migration-required para organism.

Propósito: consultar dieta histórica sem edição.

Regras:

- usa Dialog;
- read-only é textual, não disabled;
- macros seguem cores oficiais;
- conteúdo pode rolar dentro do modal;
- imprimir é secondary;
- fechar é ação neutra;
- sem sombra além de `shadow-overlay`.

## 7. Templates

### 7.1 AppLayoutShell

Propósito: sidebar + área principal.

Regras:

- implementa dimensões de app shell;
- main controla scroll;
- sem dados de domínio;
- sem breakpoints mobile.

### 7.2 DietBuilderTemplate

Propósito: estrutura do fluxo de dieta.

Regiões:

1. action header;
2. contexto e modo;
3. métricas;
4. meal builder;
5. ações globais.

Regras:

- recebe dados e callbacks;
- não busca store/API;
- usa `container-workflow`;
- refeições em uma coluna no desktop compacto e duas no padrão;
- não cria menu mobile.

## 8. Padrões transversais

### 8.1 Card

| Tipo | Fundo | Borda | Padding | Hover |
| --- | --- | --- | --- | --- |
| Standard | surface | subtle 1px | 16px | Nenhum |
| Compact | surface/subtle | subtle 1px | 12px | Nenhum |
| Interactive | surface | subtle 1px | 16px | Fundo/borda |
| Selected | primary-soft | primary-border 1px | conforme tipo | Mantém |

Todos usam raio 8px e sem sombra.

### 8.2 Table

- header 40px;
- row 44px;
- divider 1px;
- sem zebra por padrão;
- hover somente se linha for interativa;
- valores numéricos alinhados à direita;
- primeira coluna textual à esquerda;
- ações à direita;
- loading, empty e error obrigatórios;
- scroll horizontal local quando necessário.

### 8.3 Toolbar

- controles compact quando densidade exigir;
- gap 8px entre relacionados e 16px entre grupos;
- busca cresce; filtros mantêm largura útil;
- ação principal à direita;
- não transformar filtros em pills.

### 8.4 Empty state

- ícone opcional 24px;
- `empty-title`;
- corpo curto;
- uma ação recomendada;
- sem ilustração grande ou card decorativo.

### 8.5 Toast

- raio 8px;
- borda 1px;
- shadow-floating;
- ícone 16px;
- título + descrição;
- no máximo 3;
- regras de persistência em estados e acessibilidade.

## 9. Componentes que não devem existir

- wrapper que apenas renomeia primitivo;
- card específico para uma única cor;
- botão por verbo quando variante resolve;
- componente `Text` que força elemento HTML incorreto;
- componente responsivo mobile;
- badge pill;
- componente que recebe hex, font size ou radius;
- molecule que importa organism;
- componente público sem consumidor.
