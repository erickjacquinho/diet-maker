# Research & Composition Patterns Decision Document

**Feature**: Refatoração, Componentização e Limpeza de Código (>200 Linhas)

## 1. Padrões de Composição Selecionados (`vercel-composition-patterns`)

### Decisão 1: Aplicação de Compound Components em Organismos e Modais Monolíticos
- **Escolha**: Decompor componentes com alta complexidade estrutural em Compound Components expostos como sub-módulos (ex: `EditAssessmentModal.Body`, `FoodTable.Row`).
- **Justificativa**: Evita prop drilling, remove dezenas de props booleanas e permite flexibilidade de leiaute sem inchar o componente pai.
- **Alternativa Considerada**: Manter props booleanas configuráveis (`showFooter`, `isCompact`, etc.) — Rejeitada por causar acoplamento e inchaço do arquivo.

### Decisão 2: Divisão de Custom Hooks de Página em Sub-Hooks Especializados
- **Escolha**: Dividir `useDietBuilderPage.ts` (471 linhas) em 3 sub-hooks isolados com responsabilidade única:
  - `useDietCalculations`: Cálculos nutricionais e totais da dieta.
  - `useMealActions`: Adição, remoção e edição de refeições e alimentos.
  - `useDietPresets`: Carregamento e manipulação de modelos prontos.
- **Justificativa**: Melhora drasticamente a legibilidade e permite reusar a lógica de cálculo em páginas de leitura/relatórios.
- **Alternativa Considerada**: Manter tudo dentro do mesmo hook e agrupar apenas por comentários — Rejeitada pois não resolve a contagem de linhas do arquivo nem melhora a testabilidade.

### Decisão 3: Modularização do Design System Showcase
- **Escolha**: Mover as seções do `DesignSystemShowcase.tsx` (567 linhas) para uma pasta de suporte `src/app/design-system/components/sections/`.
- **Justificativa**: Cada seção de componente (botões, formulários, tipografia, tokens) passa a ser um subcomponente limpo de ~50 linhas.
- **Alternativa Considerada**: Manter em arquivo único — Rejeitada por violação direta da meta de <200 linhas.

### Decisão 4: Preservação Estrita das APIs shadcn/ui (`src/components/ui/sidebar.tsx` e `calendar.tsx`)
- **Escolha**: Modularizar componentes internos utilitários da Sidebar e do Calendário sem alterar nenhuma prop exportada pelo shadcn/ui.
- **Justificativa**: Garante que qualquer outro componente que utilize `Sidebar` ou `Calendar` continue funcionando sem quebra de contrato.
- **Alternativa Considerada**: Reescrever a API da Sidebar — Rejeitada por violar o padrão shadcn do projeto.
