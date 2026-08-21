# Rule: Sistema Tipográfico

> **Escopo:** Família de fontes, hierarquia de texto, pesos e tamanhos no projeto.

## 1. Fonte Canônica

O NutriDiet utiliza exclusivamente a família tipográfica **Plus Jakarta Sans**.

- ❌ **PROIBIDO:** Importar ou aplicar outras fontes (Inter, Roboto, Arial, Times, etc.).
- ❌ **PROIBIDO:** Usar fontes serifadas ou decorativas.
- Fonte monoespaçada para código/JSON: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`.

## 2. Pesos Permitidos

Apenas quatro pesos da fonte Plus Jakarta Sans são homologados no projeto:

- `font-normal` (400) : Texto de corpo, parágrafos, descrições.
- `font-medium` (500) : Labels de formulário, botões secundários, itens de menu.
- `font-semibold` (600) : Subtítulos, cabeçalhos de tabela, botões primários.
- `font-bold` (700) : Títulos principais (H1, H2) e destaques numéricos de métricas.

❌ **PROIBIDO:** Pesos 100, 200, 300, 800 ou 900.

## 3. Escala e Estilos de Texto

Todos os textos devem utilizar as abstrações do sistema tipográfico ou utilitários equivalentes:

| Estilo | Tamanho / Line-Height | Peso | Uso Principal |
| :--- | :--- | :--- | :--- |
| `heading-xl` | 32px / 40px | Bold (700) | Título de página / H1 |
| `heading-lg` | 24px / 32px | Bold (700) | Título de seção / H2 |
| `heading-md` | 20px / 28px | Semibold (600) | Título de card / modal / H3 |
| `heading-sm` | 16px / 24px | Semibold (600) | Subtítulo de bloco / H4 |
| `body-lg` | 16px / 24px | Regular (400) | Texto em destaque, lead |
| `body-md` | 14px / 20px | Regular (400) | Texto padrão de interface e formulário |
| `body-sm` | 12px / 16px | Regular (400) | Legendas, suporte, auxílio |
| `caption` | 11px / 14px | Medium (500) | Badges, tags pequenas, timestamps |

## 4. Vedações Tipográficas

- ❌ **PROIBIDO:** Tamanhos de fonte arbitrários como `text-[13px]`, `text-[17px]`, `text-[22px]`.
- ❌ **PROIBIDO:** Modificar `letter-spacing` (tracking) ad-hoc em componentes.
- ❌ **PROIBIDO:** Usar `text-transform: uppercase` indiscriminadamente em frases longas (permitido apenas em acrônimos ou tags de tamanho `caption`).
