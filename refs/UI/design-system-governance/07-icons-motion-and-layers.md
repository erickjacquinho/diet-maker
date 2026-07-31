# 07 — Ícones, movimento e camadas

## 1. Iconografia

Biblioteca única:

```text
lucide-react
```

Não misturar bibliotecas, emojis, caracteres Unicode ou SVGs de estilos diferentes.

### 1.1 Tamanhos

| Token | Valor | Uso |
| --- | --- | --- |
| `icon-micro` | `12px` | Metadata, badge e gráfico |
| `icon-compact` | `14px` | Controle compacto |
| `icon-standard` | `16px` | Controle padrão, navegação e lista |
| `icon-section` | `20px` | Cabeçalho de seção e destaque moderado |
| `icon-feature` | `24px` | Empty state e ilustração funcional simples |

Ícones maiores que `24px` não fazem parte do sistema. Ilustração é outro tipo de ativo e exige especificação própria.

### 1.2 Traço

```text
stroke-width: 1.75
fill: none
line-cap: round
line-join: round
```

Não alterar stroke por componente ou estado. Ícone preenchido só é permitido quando o próprio pictograma depende de preenchimento, como marcador de gráfico.

### 1.3 Uso

- botão com texto usa ícone à esquerda por padrão;
- ícone à direita somente indica continuidade, expansão ou direção;
- icon button exige `aria-label`;
- ícone decorativo usa `aria-hidden="true"`;
- não repetir no texto exatamente a informação já comunicada por ícone de status;
- cor do ícone segue o texto ou estado do componente;
- macros podem usar a cor do macro correspondente;
- não usar ícone em todos os títulos;
- não usar ícone para decorar card vazio.

### 1.4 Containers

Ícone não recebe círculo ou quadrado de fundo automaticamente.

Container de ícone é permitido em:

- status semântico;
- empty state;
- avatar alternativo;
- ação explicitamente identificada como icon button.

O container usa `radius-control`, salvo exceção circular registrada.

## 2. Movimento

Movimento comunica mudança de estado. Não é decoração.

### 2.1 Durações

| Token | Valor | Uso |
| --- | --- | --- |
| `motion-none` | `0ms` | Mudança que deve ser instantânea |
| `motion-fast` | `120ms` | Hover, pressed e cor |
| `motion-standard` | `160ms` | Entrada ou ajuste de componente |
| `motion-slow` | `240ms` | Dialog, sheet e expansão |

Animações acima de `240ms` são proibidas em fluxos operacionais.

### 2.2 Easing

| Token | Valor | Uso |
| --- | --- | --- |
| `ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Movimento e entrada |
| `ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` | Saída |
| `ease-linear` | `linear` | Spinner e progresso contínuo |

Não usar spring, bounce ou overshoot.

### 2.3 Propriedades permitidas

- opacity;
- transform em entrada/saída de overlay;
- color;
- background-color;
- border-color;
- progressão de width baseada em dado;
- expansão de conteúdo quando necessária.

Proibido:

- `transition-all`;
- scale em hover de botão ou card;
- mover conteúdo para indicar hover;
- animação automática sem função;
- parallax;
- loop decorativo;
- animar layout da página sem necessidade.

### 2.4 Receitas

| Interação | Receita |
| --- | --- |
| Hover de controle | Cor/borda, `120ms`, `ease-standard` |
| Pressed | Mudança de cor instantânea ou `120ms`; sem scale |
| Dialog entrada | Opacity + translateY máximo `4px`, `160ms` |
| Dialog saída | Opacity, `120ms`, `ease-exit` |
| Popover/tooltip | Opacity, `120ms` |
| Collapse | Altura + opacity, máximo `240ms` |
| Progress | Width, `240ms`, `ease-standard` |
| Spinner | Rotação linear contínua |

## 3. Movimento reduzido

Com `prefers-reduced-motion: reduce`:

- duração efetiva `0ms`;
- remover transformações;
- manter mudança final de estado;
- spinner pode continuar apenas se necessário para comunicar loading, sem aceleração;
- não remover feedback.

## 4. Elevação

Superfícies de página e cards não usam sombra.

| Token | Valor | Uso |
| --- | --- | --- |
| `shadow-none` | `none` | Página, card, tabela, controle |
| `shadow-floating` | `0 4px 12px rgba(28, 33, 31, 0.10)` | Popover, menu e toast |
| `shadow-overlay` | `0 8px 24px rgba(28, 33, 31, 0.12)` | Dialog e sheet |

Regras:

- sombra nunca substitui borda;
- apenas elementos em portal ou acima do fluxo usam elevação;
- não combinar múltiplas sombras;
- não usar sombra colorida;
- hover não cria sombra.

## 5. Backdrop

| Token | Valor |
| --- | --- |
| `backdrop-overlay` | `rgba(28, 33, 31, 0.32)` |

Backdrop:

- só existe em dialog e sheet modal;
- não usa blur;
- bloqueia interação com o conteúdo inferior;
- desaparece junto com o overlay.

## 6. Z-index

| Token | Valor | Uso |
| --- | --- | --- |
| `z-base` | `0` | Conteúdo comum |
| `z-raised` | `10` | Elemento local sobreposto |
| `z-sticky` | `20` | Header ou ação sticky |
| `z-navigation` | `30` | Sidebar e navegação persistente |
| `z-dropdown` | `40` | Dropdown e select |
| `z-popover` | `50` | Popover |
| `z-overlay` | `60` | Backdrop |
| `z-modal` | `70` | Dialog e sheet |
| `z-toast` | `80` | Toast |
| `z-tooltip` | `90` | Tooltip |

Valores locais e `z-[N]` são proibidos.

## 7. Opacidade

| Token | Valor | Uso |
| --- | --- | --- |
| `opacity-disabled` | `0.48` | Controle indisponível |
| `opacity-subdued` | `0.72` | Elemento auxiliar não textual |
| `opacity-full` | `1` | Estado padrão |

Não aplicar opacidade ao container quando isso reduzir contraste de texto essencial. Preferir tokens específicos de cor para disabled.
