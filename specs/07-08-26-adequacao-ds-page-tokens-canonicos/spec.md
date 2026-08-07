# Feature Specification: Adequação Estrita da Página /design-system aos Tokens Canônicos

**Feature Branch**: `adequacao-ds-page-tokens-canonicos`

**Created**: 2026-08-07

**Status**: Draft

**Input**: User description: "essa pagina deve seguir rigorosamente o design system do projeto. valide. caso nao soga, crie um /sdd de adequação"

## Audit & Gap Analysis

A auditoria da página `/design-system` revelou as seguintes não-conformidades com os Princípios I, II e III da Constituição do NutriDiet:

1. **Uso de Classes de Cores Ad-Hoc (Tailwind Padrão)**: Uso de utilitários como `bg-stone-950`, `border-stone-800`, `text-stone-400`, `bg-blue-700`, `bg-emerald-600`, `bg-amber-600`, `text-blue-400` em múltiplos componentes do showcase, violando o Princípio II (Design System Canônico).
2. **Substituição de Receitas e Utilitários Canônicos**: Cards e containers foram implementados com utilitários div manuais em vez de utilizar `recipes.card()`, `recipes.badge()`, `recipes.button()` ou a primitiva `Surface`.
3. **Tipografia Fora do Padrão Canônico**: Headings e labels utilizaram tamanhos arbitrários (`text-3xl`, `text-sm font-bold`) em vez das funções `textStyle(...)` ou classes normativas (`text-style-page-title`, `text-style-section-title`, `text-style-card-title`, `text-style-body`, `text-style-metadata`, `text-style-overline`).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Eliminação de Estilos Hardcoded e Migração para Tokens Canônicos (Priority: P1)

Como arquiteto de design system e desenvolvedor, quero que todos os componentes da página `/design-system` consumam exclusivamente tokens de design (`--sys-color-*`, `--ref-color-*`, `--sys-space-*`, `--sys-radius-*`), eliminando todas as cores e espaçamentos arbitrários do Tailwind padrão.

**Why this priority**: A constituição proíbe a invenção de estilos ou cores ad-hoc. A própria página de design system deve ser o modelo impecável de conformidade aos tokens do projeto.

**Independent Test**: Rodar o validador de tokens ou inspecionar o código CSS/TSX da página `/design-system` e confirmar zero ocorrências de cores arbitrárias como `stone-*`, `slate-*`, `gray-*`, `zinc-*`, `blue-700` cru.

**Acceptance Scenarios**:

1. **Given** a página `/design-system` e seus componentes (`ShowcaseHeader`, `ShowcaseTabs`, `ShowcaseSearch`, `TokenColorSwatch`, `TypographySpecimen`, `StructuralTokensSection`, `ComponentSandbox`, `PlaygroundControls`, `AtomsGallery`, `MoleculesGallery`, `OrganismsGallery`, `CompositionGallery`), **When** o código é analisado, **Then** todas as cores de fundo, bordas e texto utilizam exclusivamente variáveis CSS semânticas (`var(--sys-color-canvas)`, `var(--sys-color-surface)`, `var(--sys-color-border-divider)`, `var(--sys-color-text-primary)`, `var(--sys-color-action-primary)`) ou receitas `recipes`.
2. **Given** o cabeçalho e cards do showcase, **When** renderizados, **Then** utilizam a receita `recipes.card()` e a primitiva `Surface` para estrutura e elevação.

---

### User Story 2 - Tipografia 100% Normativa via `textStyle` (Priority: P1)

Como designer, quero que todos os títulos, legendas, rótulos e metadados na página `/design-system` utilizem a função `textStyle(...)` canônica do NutriDiet.

**Why this priority**: Garante que o catálogo de fontes reflita exatamente os contratos tipográficos normativos em `src/design-system/text-styles.ts`.

**Independent Test**: Inspecionar os elementos `<h1-h4>`, `<p>`, `<span>` e `<label>` na página e verificar que aplicam `textStyle("page-title")`, `textStyle("section-title")`, `textStyle("card-title")`, `textStyle("body-primary")`, `textStyle("metadata")` ou `textStyle("overline")`.

**Acceptance Scenarios**:

1. **Given** os elementos tipográficos do showcase, **When** inspecionados no DOM, **Then** não possuem classes de fontes/tamanhos ad-hoc (`text-3xl`, `text-sm font-bold`), sendo formatados via `textStyle(...)`.

---

### User Story 3 - Conformidade com Escopo Desktop e Acessibilidade (Priority: P2)

Como usuário e stakeholder, quero que a página atenda a WCAG 2.2 AA e layout desktop (≥1024px) sem dependência de comportamentos não documentados.

**Why this priority**: Atende ao Princípio III da Constituição NutriDiet.

**Independent Test**: Verificar operação por teclado (Tab/Shift+Tab), foco visível nos botões de abas e toggles, e contraste de cor AA.

**Acceptance Scenarios**:

1. **Given** a navegação da página de showcase, **When** o usuário interage via teclado, **Then** o anel de foco visível (`--sys-color-action-primary-focus`) é exibido e todas as abas e controles respondem ao teclado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE refatorar todos os componentes em `src/app/design-system/components/` para remover 100% das cores e utilitários hardcoded do Tailwind (`stone-*`, `blue-600`, `emerald-600`, etc.).
- **FR-002**: O sistema DEVE utilizar as variáveis CSS semânticas canônicas (`var(--sys-color-canvas)`, `var(--sys-color-surface)`, `var(--sys-color-surface-subtle)`, `var(--sys-color-border-divider)`, `var(--sys-color-border-subtle)`, `var(--sys-color-text-primary)`, `var(--sys-color-text-secondary)`, `var(--sys-color-text-muted)`, `var(--sys-color-action-primary)`) para todas as áreas de layout.
- **FR-003**: O sistema DEVE aplicar a receita `recipes.card({ density: ... })` ou a primitiva `Surface` para estruturar os cards de componentes, previews e containers de abas.
- **FR-004**: O sistema DEVE aplicar a função `textStyle(...)` em todas as tags de texto e títulos da página.
- **FR-005**: O sistema DEVE manter o `ViewModeToggle` ("Modo Showcase Cliente" vs "Modo Dev Spec") operando perfeitamente usando tokens de botão e tags do design system.
- **FR-006**: O sistema DEVE garantir que nenhum arquivo em `src/app/design-system/` contenha violadores do linter de tokens.

### Key Entities

- **CanonicalTokenMapping**: Mapeamento entre intenção visual e variável CSS semântica canônica do NutriDiet.
- **RefactoredShowcaseComponent**: Componente de showcase refatorado para conformidade estrita ao design system.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0% de classes de cores Tailwind genéricas (`stone-*`, `blue-700`, `emerald-600`, etc.) presentes nos arquivos de `src/app/design-system/`.
- **SC-002**: 100% dos elementos container utilizam `recipes.card()`, `recipes.badge()`, `recipes.button()` ou `Surface`.
- **SC-003**: 100% dos elementos tipográficos utilizam `textStyle(...)`.
- **SC-004**: 0 regressões visuais ou de tipo no build (`npx tsc --noEmit`).

## Assumptions

- Todos os tokens de cor semânticos e tipográficos necessários já existem em `src/design-system/tokens.css` e `src/design-system/text-styles.ts`.
- Os componentes base (`Button`, `Badge`, `Input`, `Avatar`, `Surface`, `ProgressBar`, `MetricBox`) continuam sendo consumidos no playground.
