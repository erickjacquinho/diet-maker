# 03 — Arquitetura de tokens

## 1. Regra central

Todo valor visual reutilizável deve entrar no sistema por uma das três camadas:

```text
Referência → Sistema → Componente
```

Código de tela e componente não escolhe valores brutos. Ele consome um token semântico ou uma receita documentada.

## 2. Camadas

### 2.1 Tokens de referência

São valores brutos, sem contexto de uso:

```text
ref.color.blue.700
ref.space.4
ref.radius.6
ref.duration.150
```

Regras:

- não são usados diretamente em páginas;
- existem para permitir consistência e troca de valor;
- nomes descrevem escala, não intenção;
- um valor pode alimentar vários tokens de sistema.

### 2.2 Tokens de sistema

Expressam finalidade:

```text
sys.color.action.primary
sys.color.text.secondary
sys.space.component
sys.radius.control
sys.motion.feedback
```

São a API visual padrão para componentes.

### 2.3 Tokens de componente

Expressam uma decisão exclusiva de um componente:

```text
cmp.button.primary.background
cmp.input.border.default
cmp.card.padding.default
```

Só devem existir quando:

- o mesmo mapeamento aparece em vários estados ou variantes;
- a decisão precisa evoluir sem alterar outros componentes;
- o token de sistema, isoladamente, não descreve o contrato.

Não criar token de componente que apenas repita um token de sistema sem acrescentar estabilidade.

## 3. Categorias oficiais

| Categoria | Fonte normativa |
| --- | --- |
| Cor | [04 — Sistema de cores](./04-color-system.md) |
| Tipografia | [05 — Sistema tipográfico](./05-typography-system.md) |
| Espaçamento e tamanho | [06 — Geometria e layout desktop](./06-geometry-and-desktop-layout.md) |
| Raio e borda | [06 — Geometria e layout desktop](./06-geometry-and-desktop-layout.md) |
| Ícones | [07 — Ícones, movimento e camadas](./07-icons-motion-and-layers.md) |
| Movimento | [07 — Ícones, movimento e camadas](./07-icons-motion-and-layers.md) |
| Elevação e z-index | [07 — Ícones, movimento e camadas](./07-icons-motion-and-layers.md) |
| Estados e acessibilidade | [08 — Estados e acessibilidade](./08-states-and-accessibility.md) |

Nenhuma categoria adicional deve ser criada sem necessidade recorrente.

## 4. Convenção de nomes

Formato documental:

```text
{camada}.{categoria}.{papel}.{variação}.{estado}
```

Formato CSS:

```text
--{camada}-{categoria}-{papel}-{variação}-{estado}
```

Exemplos:

```text
sys.color.text.primary
--sys-color-text-primary

cmp.button.primary.background.hover
--cmp-button-primary-background-hover
```

Regras:

- inglês técnico nos identificadores;
- nomes de produto apenas em tokens de domínio;
- não usar nomes visuais como `pretty-blue` ou `light-gray`;
- não codificar valor no token semântico;
- omitir segmentos que não acrescentem significado;
- estados usam vocabulário fechado: `default`, `hover`, `pressed`, `focus`, `selected`, `disabled`, `loading`, `read-only`, `error`.

## 5. Fonte única e formatos

A implementação deve possuir uma fonte canônica versionada. Para o projeto atual:

```text
src/design-system/
├── tokens.css
├── text-styles.ts
├── recipes.ts
└── index.ts
```

Responsabilidades:

- `tokens.css`: valores de referência e aliases semânticos;
- `text-styles.ts`: catálogo fechado de texto;
- `recipes.ts`: combinações autorizadas para componentes;
- `index.ts`: exports públicos.

O Tailwind deve apenas apontar para essa fonte. Não deve manter uma segunda paleta independente.

## 6. Política de tema

O produto possui um único tema:

- claro;
- levemente quente;
- web desktop.

Não fazem parte do escopo:

- dark mode;
- temas por cliente;
- tema mobile;
- paletas sazonais.

Tokens devem continuar semânticos, mas não é necessário construir infraestrutura de temas não planejados.

## 7. Política de valores

Permitido:

- consumir token semântico;
- consumir receita registrada;
- usar valor dinâmico inevitável, como largura percentual de progresso ou coordenada de gráfico;
- usar dimensão calculada a partir de dados ou container.

Proibido:

- hex, rgb, hsl ou nome de cor em componente;
- `text-[Npx]`, `p-[Npx]`, `rounded-[Npx]` e equivalentes;
- pesos, line-heights e tracking locais;
- duração de animação local;
- `z-index` arbitrário;
- sombra local;
- breakpoint criado por componente;
- combinar primitivos livremente para inventar um novo style.

Valores dinâmicos inevitáveis devem ser documentados e não podem substituir tokens estáticos.

## 8. Aliases e referências

Um token semântico deve apontar para referência:

```css
:root {
  --ref-color-blue-700: #2746b3;
  --sys-color-action-primary: var(--ref-color-blue-700);
  --cmp-button-primary-background: var(--sys-color-action-primary);
}
```

Não duplicar o mesmo hex em várias camadas.

## 9. Alterações

| Mudança | Impacto |
| --- | --- |
| Ajustar valor de referência sem mudar significado | Patch |
| Adicionar token semântico compatível | Minor |
| Renomear ou remover token consumido | Major |
| Mudar a finalidade declarada | Major |

Um token depreciado deve manter alias para o substituto durante a migração, quando isso não ocultar mudança semântica.

## 10. Critério de aceite

Um token novo só é aceito quando:

- possui consumidor real;
- não duplica papel existente;
- está na camada correta;
- tem nome semântico;
- possui valor e fallback definidos;
- respeita contraste e acessibilidade aplicáveis;
- foi mapeado na documentação;
- não introduz tema ou breakpoint fora do escopo.
