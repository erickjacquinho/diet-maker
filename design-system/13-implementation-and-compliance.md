# 13 — Implementação e conformidade

## 1. Objetivo

Este documento transforma as regras em critérios verificáveis. Ele não declara que o código atual já está conforme.

## 2. Estrutura-alvo

```text
src/design-system/
├── tokens.css
├── text-styles.ts
├── recipes.ts
├── types.ts
└── index.ts
```

### `tokens.css`

- referências;
- aliases semânticos;
- aliases Shadcn;
- um único tema claro.

### `text-styles.ts`

- união fechada de styles;
- mapeamento completo de classes;
- tons permitidos por papel.

### `recipes.ts`

- Button;
- IconButton;
- Input/Textarea;
- Badge;
- Card;
- Table;
- estados recorrentes.

### `types.ts`

- tipos de tone;
- size;
- state;
- macro kind;
- contratos compartilhados.

## 3. CSS global

`globals.css` deve conter somente:

- imports Tailwind;
- import dos tokens;
- base de body;
- normalização necessária;
- reduced motion;
- comportamento global realmente universal.

Não usar reset global para apagar sombras ou gradientes de toda dependência. Cada receita controla o que é permitido, preservando overlays que possuem elevação autorizada.

## 4. Tailwind

Tailwind é mecanismo de composição, não fonte de verdade.

Mapear:

```text
colors → CSS variables semânticas
spacing → escala aprovada
radius → compact/control/surface
font → Plus Jakarta Sans
z-index → escala oficial
duration/easing → tokens oficiais
```

Remover ou deixar inacessíveis:

- paleta `warm` antiga;
- cores macro antigas;
- radius 10/12/16;
- tamanhos de controle large;
- aliases duplicados;
- dark mode;
- fontes Inter e mono para UI.

## 5. Aliases Shadcn

Os aliases devem apontar para o sistema:

```text
background          → canvas
foreground          → text-primary
card                → surface
card-foreground     → text-primary
popover             → surface
primary             → primary
primary-foreground  → on-primary
secondary           → surface-subtle
muted               → surface-hover
muted-foreground    → text-muted
destructive         → error
border              → border-subtle
input               → border-control-essential
ring                → primary-focus
radius              → radius-control
```

Primitivos podem derivar `radius-surface` quando forem overlays.

## 6. Tipografia no código

Forma esperada:

```tsx
<h1 className={textStyle("page-title")}>Pacientes</h1>
```

Forma proibida:

```tsx
<h1 className="text-2xl font-black tracking-tight text-warm-charcoal">
```

`className` pode controlar layout do elemento, mas não sobrescrever tipografia ou cor.

## 7. Política de classes

### Permitido

- flex/grid;
- posicionamento necessário;
- spans derivados dos padrões de layout;
- overflow documentado;
- tokens e recipes;
- propriedades dinâmicas inevitáveis.

### Proibido

- `text-[...]`;
- `bg-[#...]`, `text-[#...]`, `border-[#...]`;
- `rounded-xl`, `rounded-2xl`, `rounded-full` fora das exceções;
- `p-[...]`, `gap-[...]`, `w-[...]` para valores estáticos;
- `font-black`, `font-extrabold`;
- `shadow-*` fora das receitas floating/overlay;
- `transition-all`;
- `z-[...]`;
- `sm:` e `md:` para criar experiência mobile/tablet;
- valor visual passado livremente por prop;
- hex em TSX.

## 8. Exceções dinâmicas

Podem usar style calculado:

- percentual de progress bar;
- coordenadas e dimensões de gráfico;
- altura calculada de virtualização;
- posição produzida por Radix;
- largura medida de container.

Toda exceção:

- deve representar dado ou medição;
- não pode ser substituída por token estático;
- precisa de comentário ou abstração quando não for óbvia;
- não autoriza cor, raio ou tipografia dinâmica.

## 9. Acesso às camadas

- páginas podem usar templates, organisms e componentes necessários;
- páginas não estilizam primitivos para inventar variante;
- `ui` não conhece domínio;
- atoms não conhecem domínio;
- dependência sempre aponta para baixo;
- subcomponente público vive em sua camada real;
- direct import de `ui` em página só é aceito quando ainda não existe contrato superior e a composição é local.

## 10. Catálogo local

A rota de Design System deve demonstrar:

- todas as cores;
- todos os text styles;
- spacing, radius e borders;
- ícones em cada tamanho;
- movimento e reduced motion;
- todos os states;
- todos os atoms;
- molecules e organisms reutilizáveis;
- loading, empty e error;
- contraste e nomes de tokens.

Ela não pode apresentar componente planejado como implementado.

## 11. Testes

### Unitários

- recipes retornam somente tokens permitidos;
- tipos rejeitam variant/tone inválido;
- cálculo de macro e progresso;
- callbacks e disabled/loading.

### Interação

- teclado;
- foco;
- dialog;
- select;
- tabs;
- formulário e erro;
- ações destrutivas.

### Acessibilidade

- nome acessível;
- relacionamentos ARIA;
- foco inicial e retorno;
- ausência de violações automatizáveis;
- contraste validado na definição de token.

### Visual

Snapshots visuais são recomendados para:

- atoms;
- estados;
- dialogs;
- tabelas;
- templates principais.

## 12. Verificações automatizadas

O pipeline final deve falhar quando encontrar:

```text
text-[...]
font-black
font-extrabold
rounded-xl
rounded-2xl
rounded-3xl
transition-all
hex em TSX
z-[...]
shadow não autorizada
```

Também deve verificar:

- links documentais;
- tipos;
- lint;
- testes;
- dependências Atomic;
- componentes do registro sem arquivo;
- arquivo implementado sem entrada no registro.

## 13. Auditoria inicial do código

Snapshot em 31 de julho de 2026:

| Evidência | Ocorrências |
| --- | ---: |
| Tamanho textual arbitrário | 172 |
| Radius large/xl/full | 227 |
| Utilitário de sombra | 52 |
| Breakpoint `sm:` ou `md:` | 129 |
| Peso extrabold/black | 159 |
| Hex em TSX | 5 |
| `transition-all` | 27 |
| Linhas de import direto de `ui` em páginas | 52 |
| Textareas nativas | 4 |

Esses números são baseline de migração, não quantidade de defeitos independentes. Uma ocorrência pode ser legítima até a receita correspondente ser implementada, mas nenhuma deve permanecer sem classificação ao final.

## 14. Divergências conhecidas

- primary atual ainda é carvão/esmeralda, não azul `#2746B3`;
- proteína usa azul em partes do código;
- gordura usa emerald em partes do código;
- raios de 12px e 16px são frequentes;
- `rounded-full` aparece fora das exceções;
- pesos 800/900 são frequentes;
- textos usam valores de 9px, 10px e 11px livremente;
- páginas contêm regras visuais locais;
- componentes usam `transition-all` e scale em hover/pressed;
- modais usam sombras não tokenizadas;
- CSS global remove sombras indiscriminadamente;
- fontes Inter/mono estão configuradas apesar da família única;
- breakpoints mobile-first existem em componentes e páginas;
- sidebar reexporta subcomponentes com dependência invertida;
- FoodSearchModal, ReadOnlyDietModal e DietModeSwitcher estão abaixo da camada-alvo.

## 15. Ordem de migração

1. Implementar tokens e aliases Shadcn.
2. Implementar text styles e recipes.
3. Corrigir primitives e atoms.
4. Adicionar Textarea, FormField, Spinner e Skeleton conforme consumidores.
5. Corrigir molecules e dependências.
6. Reclassificar organisms.
7. Corrigir templates.
8. Migrar páginas uma por vez.
9. Atualizar catálogo local.
10. Ativar verificações proibitivas.
11. Executar auditoria final.

Não ativar regra proibitiva antes de existir caminho de migração para os consumidores.

## 16. Definition of Done

Uma migração de tela está concluída quando:

- não contém valor visual arbitrário;
- todo texto usa style;
- cores usam tokens semânticos;
- spacing, radius e bordas seguem receitas;
- estados aplicáveis existem;
- teclado e foco funcionam;
- não contém layout mobile/tablet;
- componentes estão na camada correta;
- testes relevantes passam;
- registro e documentação refletem o código.

## 17. Gate documental atual

O catálogo de componentes possui uma interface pública e determinística:

```text
npm run verify:design-system
npm test -- tests/design-system/component-catalog.test.mjs
```

O primeiro comando executa o modo estrito e exige 39 fontes atuais cobertas, zero export visual descoberto, 11 categorias homologadas, quatro propostas `specified` e zero finding bloqueante. O segundo executa as fixtures válidas e inválidas, incluindo exit codes 0/1/2, lifecycle e exceções expiradas.

O gate valida documentação e rastreabilidade. Ele não declara que `src` já recebeu a migração visual; essa distinção permanece explícita no registry e na Definition of Done de cada tela.
