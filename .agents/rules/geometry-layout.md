# Rule: Geometria, Espaçamento e Layout Desktop

> **Escopo:** Layouts de página, grides, espaçamentos, dimensões de componentes e limites de plataforma.

## 1. Escopo de Plataforma (Web Desktop Exclusivo)

O NutriDiet é projetado **exclusivamente para navegadores Web Desktop a partir de 1024px**.

- ❌ **FORA DE ESCOPO:** Telas mobile, telas tablet, aplicativos nativos.
- ❌ **PROIBIDO:** Usar estratégia mobile-first ou encher o código com breakpoints desnecessários para telas pequenas (`sm:`, `xs:`).
- ✅ **RESPONSIVIDADE DESKTOP:** Garantir adaptação limpa na faixa de **1024px a 1920px+**. Flexibilidade interna e overflow em tabelas densas são permitidos.

## 2. Escala de Espaçamento Base 4px

Todo espaçamento (padding, margin, gap) DEVE seguir a grade múltipla de 4px:

- `space-1` : 4px
- `space-2` : 8px
- `space-3` : 12px
- `space-4` : 16px (padrão de padding interno)
- `space-6` : 24px (separação entre seções pequenas)
- `space-8` : 32px (separação de grandes blocos de página)
- `space-12`: 48px

❌ **PROIBIDO:** Espaçamentos ímpares ou arbitrários (`p-[7px]`, `gap-[13px]`, `m-[18px]`).

## 3. Escala de Raios de Borda (Radius)

O arredondamento de bordas é contido e sutil:

- `radius-xs` (2px) : Tags minúsculas e indicadores de progresso.
- `radius-sm` (4px) : **Padrão de Controles** (botões, inputs, selects, checkboxes, badges).
- `radius-md` (6px) : Dropdowns, popovers, tooltips.
- `radius-lg` (8px) : **Padrão de Superfícies** (cards, modais, painéis estruturais).
- `radius-full` (9999px) : Exclusivo para avatares circulares e pills fechados.

❌ **PROIBIDO:** Raios grandes decorativos como `rounded-xl` (12px), `rounded-2xl` (16px), `rounded-3xl` ou valores arbitrários (`rounded-[10px]`).

## 4. Bordas e Estrutura Visual

- **Espessura Padrão:** Todas as bordas visíveis possuem exatamente **1px** (`border-1` / `border`).
- **Comportamento Estático:** A espessura da borda NÃO deve mudar ao passar o mouse ou focar (use anel de foco `ring-2` para indicar foco, nunca altere `border-width` para evitar layout shift).
- Bordas devem ter baixo contraste (`border-border`), servindo para delimitação sem pesar o layout.

## 5. Checklist de Layout e Geometria

- [ ] Nenhum breakpoint `sm:` utilizado para design mobile.
- [ ] Todos os valores de padding, margin e gap pertencem à escala de 4px.
- [ ] Raios de borda em controles usam `rounded-sm` (4px) e em cards usam `rounded-lg` (8px).
- [ ] Espessura de borda fixa em 1px.
