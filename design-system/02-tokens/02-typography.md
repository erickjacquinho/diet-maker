# 02-tokens / 02-typography — Sistema Tipográfico e Hierarquia

> Especificação canônica de tipografia do NutriDiet. Todos os papéis abaixo devem ser consumidos por tokens ou classes Tailwind documentadas.

## 1. Famílias tipográficas

| Família | Classe | Uso |
| :--- | :--- | :--- |
| `Plus Jakarta Sans` | `font-display` | Marca, títulos H1–H3 e títulos de cards |
| `Inter` | `font-body` / `font-sans` | Corpo, formulários, botões, labels e tabelas |
| `Fira Code` | `font-mono` | Kcal, macros, g/kg, porções, percentuais, códigos TACO e horários |

`Fira Code` é obrigatória para métricas tabulares. Fontes mono do sistema podem aparecer somente como fallback depois de `"Fira Code"`.

## 2. Papéis tipográficos oficiais

| Papel | Família | Tamanho / line-height | Peso | Classe de cor | Aplicação |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Display Hero | Display | `2rem / 2.375rem` (32/38px) | 700 | `text-warm-main` | Título principal da página |
| H1 Section | Display | `1.5rem / 1.875rem` (24/30px) | 600 | `text-warm-main` | Cabeçalho de seção |
| H2 Card | Display | `1.125rem / 1.5rem` (18/24px) | 600 | `text-warm-main` | Título de card ou modal |
| H3 Subheading | Display | `0.9375rem / 1.25rem` (15/20px) | 500 | `text-warm-main` | Sub-bloco |
| Body Lead | Body | `1rem / 1.5rem` (16/24px) | 400 | `text-warm-secondary` | Descrição destacada |
| Body Regular | Body | `0.875rem / 1.3125rem` (14/21px) | 400 | `text-warm-main` | Texto e linha de tabela |
| Body Small / Label | Body | `0.8125rem / 1.125rem` (13/18px) | 500 | `text-warm-secondary` | Label, helper e botão compacto |
| Caption / Meta | Body | `0.75rem / 1rem` (12/16px) | 400 | `text-warm-muted` | Timestamp e metadado |
| Mono Hero Metric | Mono | `1.75rem / 2.125rem` (28/34px) | 700 | `text-warm-main` | Kcal principal |
| Mono Table Metric | Mono | `0.875rem / 1.125rem` (14/18px) | 600 | `text-warm-main` | Valor de macro em tabela |
| Mono Micro Metric | Mono | `0.6875rem / 0.875rem` (11/14px) | 500 | `text-warm-muted` | Delta, percentual ou porção |

## 3. Regras de legibilidade e acessibilidade

1. Corpo contínuo usa no mínimo 14px; 12px e 11px são exclusivos de metadados curtos.
2. Labels visíveis não podem ser substituídas por placeholder.
3. Números tabulares usam `font-variant-numeric: tabular-nums`.
4. Truncamento deve preservar o valor completo em nome acessível ou tooltip acionável por teclado.
5. Contraste mínimo: 4.5:1 para texto normal, 3:1 para texto grande e 3:1 para objetos gráficos.
6. Zoom de 200% não pode causar perda de conteúdo ou rolagem horizontal da página.
