# Phase 0 Research: Showcase da Linha Visual e Design System

## Decision 1: Estrutura da Página Showcase `/design-system`
- **Decisão**: Dividir a página `/design-system` em 4 abas visuais principais:
  1. **Overview & Visão da Linha Visual**: Banner de apresentação da marca NutriDiet, pilares de UX, estatísticas de componentes e resumo da linguagem.
  2. **Tokens de Design (Visual Swatches)**: Swatches de Cores (Reference, System, Component) com teste de contraste WCAG AA/AAA, Espécimes de Tipografia interativos, Régua de Espaçamentos (`--space-*`) e Sombras (`--shadow-*`).
  3. **Catálogo & Playground de Componentes**: Galeria ao vivo dividida por hierarquia Atomic Design (Atoms, Molecules, Organisms) com matriz de variantes e controles (knobs) em tempo real.
  4. **Exemplos de Composições (Client View)**: Modos de visualização de telas montadas (ex: mini-dietas, cards de macronutrientes montados) e toggle entre "Modo Cliente Showcase" e "Modo Dev Spec".
- **Justificativa**: Substitui a listagem textual crua por uma experiência de live styleguide / pitch deck visual interativo para clientes e desenvolvedores.
- **Alternativas Consideradas**: Manter a listagem JSON antiga (rejeitada por ser puramente técnica e não ser adequada para apresentação visual a clientes).

## Decision 2: Arquitetura de Componentização do Showcase
- **Decisão**: Criar componentes dedicados de renderização dentro de `src/app/design-system/components/`:
  - `ShowcaseHeader.tsx`: Banner principal de boas-vindas com estética mineral dark.
  - `TokenColorSwatch.tsx`: Componente de exibição visual de token de cor com cópia HEX e badge de contraste.
  - `TypographySpecimen.tsx`: Amostra interativa de tipos com input para testar texto personalizado.
  - `ComponentPlayground.tsx`: Sandbox com controles visuais (variante, estado, tamanho, tom) e preview do elemento.
  - `CompositionGallery.tsx`: Showcase de composições reais de telas.
- **Justificativa**: Isolamento total do código de apresentação do showcase, consumindo diretamente as receitas (`recipes`) e os componentes do design system sem poluir os componentes de produção do app.
- **Alternativas Consideradas**: Importar o Storybook ou bibliotecas externas (rejeitadas para manter o projeto sem dependências adicionais pesadas e 100% integrado ao runtime Next.js existente).

## Decision 3: Princípios de Estética & Anti-Slop (`/frontend-design` & `/ui-ux-pro-max`)
- **Decisão**: Utilizar paleta de minerais escuros com contraste rico, cartões levemente translúcidos com bordas metálicas suaves, tipografia refinada e micro-animações de 150ms-250ms em hover e transições.
- **Justificativa**: Evita visual genérico ou padrão "AI-generated slop" de templates pré-fabricados, oferecendo um showcase memorável e customizado para a marca NutriDiet.
- **Alternativas Consideradas**: Layouts brancos corporativos simples (rejeitados por falta de fator "WOW" na apresentação ao cliente).
