# 06 — Geometria e layout desktop

## 1. Plataforma

O NutriDiet é web desktop.

Faixa suportada:

| Faixa | Largura |
| --- | --- |
| Desktop compacto | `1024px–1279px` |
| Desktop padrão | `1280px–1599px` |
| Desktop amplo | `1600px` ou mais |

Abaixo de `1024px` não existe garantia de layout. Não criar versão mobile ou tablet.

## 2. Escala de espaçamento

Base: `4px`.

| Token | Valor |
| --- | --- |
| `space-0` | `0` |
| `space-1` | `4px` |
| `space-2` | `8px` |
| `space-3` | `12px` |
| `space-4` | `16px` |
| `space-5` | `20px` |
| `space-6` | `24px` |
| `space-8` | `32px` |
| `space-10` | `40px` |
| `space-12` | `48px` |
| `space-16` | `64px` |

Valores fora da escala são proibidos em gap, padding e margin.

## 3. Espaçamento semântico

| Token | Valor | Uso |
| --- | --- | --- |
| `space-inline-tight` | `4px` | Ícone de status e label curta |
| `space-inline` | `8px` | Ícone e texto |
| `space-control-group` | `8px` | Controles diretamente relacionados |
| `space-related` | `12px` | Conteúdo do mesmo grupo |
| `space-component` | `16px` | Regiões internas |
| `space-section` | `24px` | Seções |
| `space-page-section` | `32px` | Blocos principais |
| `space-major` | `48px` | Áreas independentes |

Componentes não controlam margem externa. O pai controla distância por `gap`.

## 4. Padding

| Contexto | Padding |
| --- | --- |
| Badge/tag | `4px 8px` |
| Menu/popover compacto | `8px` |
| Card compacto | `12px` |
| Card padrão | `16px` |
| Card de destaque registrado | `20px` |
| Dialog/painel principal | `24px` |
| Página desktop | `24px 32px` |

Card comum não escolhe entre `12`, `16` e `20`. O tipo do componente determina:

- compacto: linha utilitária, resumo pequeno ou ferramenta densa;
- padrão: conteúdo comum;
- destaque: somente card explicitamente registrado como protagonista.

## 5. Formulários

| Relação | Valor |
| --- | --- |
| Label → controle | `8px` |
| Controle → helper/erro | `4px` |
| Campo → campo relacionado | `16px` |
| Grupo → grupo | `24px` |
| Conteúdo → ações | `24px` |
| Botão → botão | `8px` |

Formulários usam grid de `12px` ou `16px` apenas dentro de grupos explicitamente compactos; o padrão entre campos é `16px`.

## 6. Dimensões de controles

O catálogo possui somente `compact` e `standard`.

| Componente | Compact | Standard |
| --- | --- | --- |
| Button | `32px` | `36px` |
| Input/select | `32px` | `36px` |
| Icon button | `32×32px` | `36×36px` |
| Menu item | `32px` | `36px` |
| Tab | `32px` | `36px` |

Outras dimensões:

| Componente | Dimensão |
| --- | --- |
| Textarea | mínimo `80px` |
| Checkbox | `16×16px` |
| Radio | `16×16px` |
| Switch | `32×18px` |
| Badge | mínimo `24px` de altura |
| Progress track | `6px` de altura |
| Table header | mínimo `40px` |
| Table row | mínimo `44px` |
| Avatar compact | `32×32px` |
| Avatar standard | `36×36px` |
| Avatar large | `44×44px` |

Botão de maior destaque continua com `36px`. Não criar tamanho `large` para dar importância.

## 7. Padding de controles

| Componente | Padding horizontal |
| --- | --- |
| Button compact | `12px` |
| Button standard | `16px` |
| Input/select | `12px` |
| Tab | `12px` |
| Menu item | `12px` |

Icon button não possui padding configurável; ícone é centralizado na caixa.

## 8. Raios

| Token | Valor | Uso |
| --- | --- | --- |
| `radius-none` | `0` | Linhas e estruturas retas |
| `radius-compact` | `4px` | Badge, tag, checkbox e elemento pequeno |
| `radius-control` | `6px` | Button, input, select, textarea e icon button |
| `radius-surface` | `8px` | Card, dialog, popover, menu e toast |
| `radius-round` | `9999px` | Exceção geometricamente circular |

Proibidos:

- `10px`, `12px`, `16px`;
- `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`;
- pills em filtros, badges e tabs;
- aumentar raio a cada nível aninhado.

`radius-round` somente em avatar, radio, spinner, status circular e marcador de gráfico. Exceção precisa estar no contrato.

## 9. Bordas

Toda borda existente possui `1px`.

| Token | Valor | Uso |
| --- | --- | --- |
| `border-divider` | `#E3DED5` | Separador interno |
| `border-subtle` | `#D6D0C5` | Card e superfície |
| `border-hover` | `#B8B1A5` | Hover neutro |
| `border-control-essential` | `#7A7369` | Fronteira que precisa ser reconhecida |
| `primary-border` | `#C8D2FF` | Contexto primário suave |
| `error-border` | `#E6B8B2` | Campo em erro com mensagem |

Regras:

- não usar borda sem função;
- não mudar espessura por estado;
- foco usa ring/outline;
- seleção combina fundo ou indicador;
- não contornar todos os níveis aninhados;
- não usar carvão ou azul forte como borda estrutural.

## 10. App shell

| Região | Regra |
| --- | --- |
| Sidebar expandida | `224px` fixa |
| Sidebar recolhida | `64px` fixa |
| Conteúdo principal | Fluido, `min-width: 0` |
| Altura | Viewport completo |
| Scroll | Conteúdo principal; sidebar permanece fixa |

A sidebar não vira drawer. O estado recolhido é uma preferência desktop, não um layout mobile.

## 11. Containers

| Token | Valor | Uso |
| --- | --- | --- |
| `container-page` | máximo `1440px` | Página geral |
| `container-workflow` | máximo `1200px` | Builder e fluxo operacional |
| `container-form` | máximo `960px` | Formulário concentrado |
| `container-reading` | máximo `720px` | Texto e configuração simples |

Containers são centralizados quando não ocupam toda a área útil. Tabelas e builders podem usar toda a largura disponível até `container-page`.

## 12. Grid

Grid mestre:

```text
12 colunas
gap padrão: 16px
gap entre regiões: 24px
```

Padrões:

| Padrão | Desktop compacto | Desktop padrão/amplo |
| --- | --- | --- |
| Métricas | `2×2` | `4×1` |
| Cards de lista | 2 colunas | 3 ou 4 colunas conforme largura |
| Formulário | 1 coluna principal | 2 colunas quando campos forem relacionados |
| Detail + aside | Conteúdo seguido de aside | `8 + 4` colunas |
| Meal builder | 1 coluna | 2 colunas |
| Dashboard | 8 colunas lógicas | 12 colunas |

Não reorganizar apenas para preencher espaço. Relação semântica determina proximidade e span.

## 13. Padrões de página

### 13.1 Lista

```text
Page header
24px
Toolbar/filtros
16px
Tabela ou grid
```

### 13.2 Detalhe

```text
Page header
24px
Resumo principal
24px
Conteúdo + aside opcional
```

### 13.3 Formulário

```text
Page header
24px
Seções com gap de 24px
Ações no final ou em header persistente
```

### 13.4 Builder

```text
Action header
16px
Contexto/modo
24px
Métricas
24px
Área de montagem
```

## 14. Overflow e adaptação

- evitar overflow horizontal da página;
- tabelas podem possuir scroll horizontal próprio;
- labels de ação devem ser encurtadas antes de truncar;
- grids podem reduzir colunas dentro da faixa desktop;
- tipografia e spacing não mudam por breakpoint;
- sidebar pode recolher em desktop compacto;
- zoom do navegador não pode ocultar ações essenciais;
- regiões sticky precisam reservar espaço e não cobrir conteúdo.

## 15. Proibições

- valores arbitrários;
- margem externa controlada pelo filho;
- `space-x-*` e `space-y-*` quando `gap` resolve;
- espaçamento negativo;
- layout baseado em breakpoint mobile;
- cards usados apenas como separadores;
- container diferente por página sem papel registrado;
- altura fixa para conteúdo textual;
- centralização indiscriminada.
