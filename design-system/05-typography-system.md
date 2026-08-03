# 05 — Sistema tipográfico

## 1. Regra absoluta

Todo texto visível deve usar um dos styles deste catálogo.

É proibido decidir localmente:

- família;
- tamanho;
- peso;
- line-height;
- letter-spacing;
- transformação;
- cor;
- comportamento de quebra.

Se nenhum style atender, a implementação deve parar e propor alteração ao Design System. Não se cria exceção com `className`.

## 2. Família

O sistema usa uma única família:

```text
Plus Jakarta Sans
```

Fallback:

```css
"Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", sans-serif
```

Motivos:

- já está integrada ao projeto;
- cobre interface, títulos e números;
- reduz carregamento e decisões;
- mantém personalidade sem sacrificar leitura.

Não usar Inter, fonte monoespaçada ou outra família no produto. Códigos e identificadores continuam em Plus Jakarta Sans com números tabulares.

## 3. Primitivos permitidos

### 3.1 Pesos

| Token | Valor | Uso |
| --- | --- | --- |
| `font-regular` | `400` | Corpo e conteúdo |
| `font-medium` | `500` | Links, metadata e validação |
| `font-semibold` | `600` | Labels, controles e ênfase |
| `font-bold` | `700` | Títulos e métricas |

Pesos `800` e `900` são proibidos. Hierarquia deve vir de papel, tamanho e contraste, não de `font-black`.

### 3.2 Tamanhos e line-height

| Escala | Tamanho | Line-height base |
| --- | --- | --- |
| `type-10` | `10px` | `14px` |
| `type-11` | `11px` | `16px` |
| `type-12` | `12px` | `18px` |
| `type-13` | `13px` | `20px` |
| `type-14` | `14px` | `22px` |
| `type-16` | `16px` | `24px` |
| `type-18` | `18px` | `26px` |
| `type-20` | `20px` | `28px` |
| `type-24` | `24px` | `32px` |
| `type-28` | `28px` | `36px` |

`10px` é reservado para marcações auxiliares não essenciais em visualizações densas. Não pode ser usado em corpo, controles, labels ou mensagens.

### 3.3 Tracking

| Token | Valor | Uso |
| --- | --- | --- |
| `tracking-tight` | `-0.01em` | Títulos e métricas grandes |
| `tracking-normal` | `0` | Todo texto comum |
| `tracking-label` | `0.04em` | Cabeçalho curto em caixa alta |
| `tracking-overline` | `0.06em` | Overline curto |

Outros valores são proibidos.

## 4. Catálogo fechado

### 4.1 Títulos

| Style | Especificação | Cor | Usar | Não usar |
| --- | --- | --- | --- | --- |
| `page-title` | 28/36, 700, tight | `text-primary` | Único título principal da rota | Card, modal, seção |
| `page-subtitle` | 14/22, 400 | `text-secondary` | Explicação imediatamente abaixo do page title | Corpo longo, helper |
| `section-title` | 20/28, 700, tight | `text-primary` | Seção principal da página | Título da página ou card |
| `subsection-title` | 16/24, 700 | `text-primary` | Subseção dentro de uma seção | Label ou título de card simples |
| `card-title` | 14/20, 600 | `text-primary` | Título de card padrão | Page title, label, métrica |
| `dialog-title` | 18/26, 700, tight | `text-primary` | Título principal de dialog ou sheet | Título de card |
| `empty-title` | 16/24, 600 | `text-primary` | Título de estado vazio ou resultado ausente | Mensagem de erro inline |

### 4.2 Corpo

| Style | Especificação | Cor | Usar | Não usar |
| --- | --- | --- | --- | --- |
| `body-large` | 16/24, 400 | `text-primary` | Introdução ou conteúdo de leitura destacado | Título ou métrica |
| `body` | 14/22, 400 | `text-primary` | Corpo padrão e conteúdo explicativo | Label, tabela densa |
| `body-strong` | 14/22, 600 | `text-primary` | Ênfase curta dentro de corpo | Parágrafo inteiro por padrão |
| `body-secondary` | 14/22, 400 | `text-secondary` | Descrição secundária legível | Metadata ou disabled |
| `body-small` | 13/20, 400 | `text-primary` | Conteúdo compacto em cards e listas | Helper ou caption |
| `body-small-strong` | 13/20, 600 | `text-primary` | Nome de item em lista compacta | Título de seção |
| `body-quote` | 13/20, 400, italic | `text-secondary` | Instrução citada ou observação editorial | Labels, métricas, UI geral |
| `caption` | 12/18, 400 | `text-secondary` | Legenda associada a conteúdo | Helper de campo |
| `caption-strong` | 12/18, 600 | `text-secondary` | Legenda que precisa de ênfase | Título de card |
| `helper` | 12/18, 400 | `text-muted` | Orientação abaixo de controle | Erro ou conteúdo essencial |
| `legal` | 11/16, 400 | `text-muted` | Informação legal, autoria ou nota não operacional | Instrução necessária |

### 4.3 Formulários e controles

| Style | Especificação | Cor | Usar | Não usar |
| --- | --- | --- | --- | --- |
| `field-label` | 13/18, 600 | `text-primary` | Label de input, select ou textarea | Placeholder, título |
| `field-value` | 14/20, 400 | `text-primary` | Conteúdo digitado ou selecionado | Label ou helper |
| `field-placeholder` | 14/20, 400 | `text-muted` | Placeholder dentro de campo vazio | Valor real |
| `validation-error` | 12/18, 500 | `error` | Erro associado a campo | Alerta global |
| `validation-success` | 12/18, 500 | `success` | Confirmação excepcional associada a campo | Sucesso global |
| `button-label` | 13/18, 600 | Pela variante | Botão padrão de 36px | Link inline ou badge |
| `button-label-compact` | 12/16, 600 | Pela variante | Botão compacto de 32px | Botão padrão |
| `nav-item` | 13/18, 600 | Pelo estado | Navegação principal e secundária | Botão de ação |
| `tab-label` | 13/18, 600 | Pelo estado | Tabs e segmented controls | Filtro independente |
| `link-inline` | 14/22, 500 | `primary` | Ação textual dentro de conteúdo | CTA principal |
| `badge-label` | 11/16, 600 | Pela variante | Badge, tag e status curto | Parágrafo ou botão |

### 4.4 Dados e métricas

Todos os styles numéricos usam:

```css
font-variant-numeric: tabular-nums lining-nums;
```

| Style | Especificação | Cor | Usar | Não usar |
| --- | --- | --- | --- | --- |
| `metric-hero` | 28/34, 700, tight | `text-primary` | Métrica dominante de uma região | Todas as métricas do grid |
| `metric-large` | 20/28, 700, tight | `text-primary` | Valor principal de card de métrica | Célula de tabela |
| `metric-standard` | 14/20, 700 | Pelo significado | Valor nutricional padrão | Texto explicativo |
| `metric-compact` | 12/16, 600 | Pelo significado | Valor em lista, badge de dados ou célula compacta | Métrica principal |
| `metric-unit` | 12/16, 400 | `text-muted` | Unidade junto de valor | Valor numérico |
| `table-header` | 11/16, 600, label, uppercase | `text-secondary` | Cabeçalho de coluna | Título de seção |
| `table-cell` | 13/20, 400 | `text-primary` | Célula textual | Número que exige alinhamento |
| `table-cell-strong` | 13/20, 600 | `text-primary` | Identificador principal da linha | Todas as células |
| `table-number` | 13/20, 600, tabular | `text-primary` | Quantidade, percentual e valor tabular | Texto comum |
| `metadata` | 11/16, 500 | `text-muted` | Data, horário, contagem e detalhe auxiliar | Instrução essencial |
| `data-id` | 12/18, 500, tabular | `text-muted` | UID e identificador técnico exibido | Métrica |
| `overline` | 11/16, 700, overline, uppercase | `text-secondary` | Categoria curta acima de título ou bloco | Frase longa |
| `chart-label` | 11/16, 500 | `text-secondary` | Eixo, legenda e rótulo de gráfico | Corpo ou tabela |
| `chart-micro` | 10/14, 600 | `text-muted` | Marcação auxiliar não essencial em gráfico | Informação necessária à decisão |

## 5. Tons permitidos

Cor não é uma propriedade livre. Somente estes tons existem:

```text
default
secondary
muted
primary
info
success
warning
error
protein
carbohydrate
fat
inverse
```

Aplicação:

- títulos: apenas `default`;
- corpo: definido pelo próprio style;
- validação: apenas `error` ou `success`;
- botões, nav e tabs: tom definido pela variante/estado do componente;
- métricas: `default`, macro correspondente ou `primary` para meta geral;
- badge: tom definido pelo status;
- `inverse`: somente sobre fundo escuro aprovado.

O consumidor não escolhe `tone` quando o componente já conhece o significado.

## 6. Transformação e pontuação

- sentence case é o padrão;
- caixa alta somente em `table-header` e `overline`;
- `badge-label` usa sentence case;
- não usar caixa alta em títulos, botões ou navegação;
- não usar letter-spacing largo fora dos styles previstos;
- evitar ponto final em labels, botões e títulos;
- mensagens e corpo usam pontuação normal.

## 7. Quebra, truncamento e alinhamento

| Style ou contexto | Regra |
| --- | --- |
| `page-title` | Quebra permitida, máximo recomendado de 2 linhas |
| Títulos de seção | Quebra permitida, sem truncar informação essencial |
| `card-title` | Até 2 linhas; depois ellipsis somente quando o card abrir o conteúdo completo |
| Corpo | Quebra natural |
| Botão, tab e nav | Uma linha; label deve ser encurtada antes de truncar |
| Badge | Uma linha; não usar para frases |
| Métrica | Uma linha; unidade pode ficar separada visualmente |
| Tabela | Uma linha por padrão; expansão deve ser especificada por coluna |
| Metadata | Uma linha; pode truncar se houver acesso ao valor completo |

Texto de interface é alinhado à esquerda. Centralização é permitida apenas em:

- métricas isoladas;
- empty state;
- dialog de confirmação curto;
- célula numérica quando a tabela exigir.

Texto justificado é proibido.

## 8. Semântica HTML

O style visual não determina sozinho o elemento:

- um único `<h1>` identifica o conteúdo principal;
- seções seguem ordem de heading sem saltos arbitrários;
- labels usam `<label>`;
- botões usam `<button>`;
- links que navegam usam `<a>`;
- texto comum usa `<p>`, `<span>`, `<dt>` ou `<dd>` conforme semântica;
- style de título não pode ser usado para simular heading semântico.

## 9. Implementação

API alvo:

```ts
type TextStyle =
  | "page-title"
  | "page-subtitle"
  | "section-title"
  | "subsection-title"
  | "card-title"
  | "dialog-title"
  | "empty-title"
  // restante do catálogo
```

Uso conceitual:

```tsx
<h1 className={textStyle("page-title")}>Pacientes</h1>
<p className={textStyle("page-subtitle")}>Acompanhamento clínico</p>
```

Não é obrigatório criar um componente universal `Text`. Preservar elementos HTML semânticos e aplicar a receita centralizada é preferível.

## 10. Proibições

- `text-xs`, `text-sm`, `text-lg` diretamente em páginas;
- `text-[Npx]`;
- `font-black`, `font-extrabold` ou valor arbitrário;
- `leading-*` e `tracking-*` fora do catálogo;
- cor textual local;
- style tipográfico alterado por breakpoint;
- style tipográfico recebido por `className`;
- criar versão “quase igual” para encaixar um caso.

## 11. Processo para texto não classificado

1. identificar o papel do conteúdo;
2. procurar style existente pelo uso, não pela aparência;
3. ajustar o conteúdo se ele estiver no componente errado;
4. se ainda não houver papel válido, propor style;
5. revisar duplicação, contraste e consumidores;
6. adicionar ao catálogo antes de implementar.
