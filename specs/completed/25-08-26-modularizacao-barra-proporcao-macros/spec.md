# Feature Specification: Modularização da Barra de Proporção de Macronutrientes e Distribuição Calórica (% VET)

**Feature Directory**: `specs/25-08-26-modularizacao-barra-proporcao-macros`

**Created**: 25/08/2026

**Status**: Draft

**Input**: User description: "modularizar o componente de barra de proporção de macronutrientes (% VET) para deixá-lo 100% modular e reutilizável em qualquer tela sem esforço"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Distribuição Calórica Unificada no Modal de Ajustar Metas (Priority: P1)

Como nutricionista ajustando as metas nutricionais de um paciente ou variação de dieta, quero visualizar a barra multi-segmentada de distribuição calórica (% VET) renderizada pelo componente oficial e modular, para que as cores, proporções e cálculos de macros estejam sempre sincronizados e consistentes em todo o sistema.

**Why this priority**: O modal de ajuste de metas é o ponto central de definição do plano alimentar. Substituir o código hardcoded inline pela molécula oficial garante integridade e manutenibilidade.

**Independent Test**: Abrir o modal "Ajustar Metas", alterar os valores de Proteínas, Carboidratos e Gorduras e verificar que a barra de proporção e a legenda exibem os percentuais e calorias de forma responsiva e idêntica aos padrões do Design System.

**Acceptance Scenarios**:

1. **Given** que o modal de ajuste de metas está aberto com metas de 160g P, 200g C e 50g G, **When** os valores são calculados, **Then** a barra exibe os segmentos coloridos proporcionais (34% P, 42% C, 24% G) e a legenda com as calorias por macro.
2. **Given** que todos os campos de metas são zerados, **When** o total de calorias é zero, **Then** a barra exibe o estado vazio amigável informando a ausência de dados sem quebrar o layout.

---

### User Story 2 - Proporção de Macros nos Cards de Refeição (Priority: P1)

Como nutricionista elaborando refeições para um paciente, quero ver a proporção de macronutrientes de cada refeição exibida de forma compacta e clara abaixo dos alimentos, para avaliar rapidamente o equilíbrio nutricional daquela refeição isolada.

**Why this priority**: A tela de elaboração de dieta depende da leitura imediata de calorias e macros por refeição para tomada de decisão clínica rápida.

**Independent Test**: Na tela de elaboração de dieta, adicionar e remover alimentos de uma refeição e verificar que a barra de proporção atualiza em tempo real seus segmentos e legenda na ordem canônica (P → C → G → Kcal).

**Acceptance Scenarios**:

1. **Given** uma refeição contendo alimentos cadastrados, **When** os alimentos totalizam macronutrientes positivos, **Then** a barra exibe os percentuais e gramaturas nos tons semânticos de cada macro.
2. **Given** uma nova refeição vazia, **When** nenhum alimento foi incluído, **Then** a barra exibe o estado inicial com gramaturas zeradas e estilo sutil.

---

### User Story 3 - Reutilização Instantânea em Qualquer Tela ou Contexto (Priority: P2)

Como desenvolvedor frontend e nutricionista, quero que a molécula `MacroProportionBar` possa ser instanciada em qualquer tela (cards de receitas, consultas, presets, relatórios ou modais) passando apenas as gramaturas (`proteinG`, `carbsG`, `fatsG`) e opções declarativas de exibição, sem necessidade de reimplementar cálculos, estilos ou marcação HTML.

**Why this priority**: Elimina duplicação de código, previne divergências visuais e garante conformidade absoluta com o Design System em novas funcionalidades futuras.

**Independent Test**: Instanciar o componente em um componente de teste passando apenas as props obrigatórias e verificar renderização completa, acessibilidade e cálculo correto.

**Acceptance Scenarios**:

1. **Given** um desenvolvedor criando uma nova tela que necessita de resumo de macros, **When** importa `<MacroProportionBar proteinG={30} carbsG={50} fatsG={15} />`, **Then** a barra calcula automaticamente as calorias e proporções percentuais e renderiza com acessibilidade total.
2. **Given** um contexto com restrição de espaço vertical ou horizontal, **When** utiliza a prop `size="compact"` ou oculta a legenda via `showLegend={false}`, **Then** o componente se adapta perfeitamente ao container.

---

### Edge Cases

- **Valores negativos ou NaN**: O componente deve tratar qualquer entrada inválida ou negativa como `0` sem lançar exceções.
- **Divisão por zero (total de calorias = 0)**: Percentuais de macros devem ser `0%` e a barra deve renderizar uma trilha neutra/tracejada sem exibir `NaN%`.
- **Valores decimais longos**: As gramaturas e percentuais devem ser arredondados com precisão limpa (gramas com 1 casa decimal e percentuais inteiros).
- **Apenas um macro presente (ex.: 100% Proteína)**: O segmento único deve preencher 100% da barra sem overflow ou falha de borda/radius.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O componente `MacroProportionBar` MUST ser uma molécula desacoplada localizada em `src/components/molecules/MacroProportionBar.tsx` e exportada no barrel de moléculas (`src/components/molecules/index.ts`).
- **FR-002**: O componente MUST calcular automaticamente a distribuição calórica percentual (% VET: 4 kcal/g para proteínas e carboidratos, 9 kcal/g para gorduras) utilizando a função canônica `calculateMacroDistributionPct`.
- **FR-003**: A barra multi-segmentada MUST utilizar as cores semânticas oficiais do Design System:
  - Proteína: `bg-macro-protein` (`#B8325A`)
  - Carboidrato: `bg-macro-carbohydrate` (`#A55B00`)
  - Gordura: `bg-macro-fat` (`#0F766E`)
- **FR-004**: A apresentação textual e legenda MUST respeitar estritamente a ordem canônica normativa:
  1. Proteínas (`P` / `protein`)
  2. Carboidratos (`C` / `carbohydrate`)
  3. Gorduras (`G` / `fat`)
  4. Total de Calorias (`kcal` / `calories`)
- **FR-005**: O componente MUST fornecer props flexíveis e declarativas para customização de apresentação em múltiplos contextos:
  - `proteinG: number` (obrigatório)
  - `carbsG: number` (obrigatório)
  - `fatsG: number` (obrigatório)
  - `kcal?: number` (opcional; se omitido, calcula automaticamente via fórmula de Atwater)
  - `title?: React.ReactNode` (opcional; para títulos como "Distribuição Calórica (% VET)")
  - `showLegend?: boolean` (opcional; padrão `true`)
  - `showCalories?: boolean` (opcional; padrão `true`)
  - `showKcalPerMacro?: boolean` (opcional; padrão `false`)
  - `showGrams?: boolean` (opcional; padrão `true`)
  - `showTotalPct?: boolean` (opcional; padrão `false`)
  - `size?: 'compact' | 'standard'` (opcional; padrão `'compact'`)
  - `emptyMessage?: string` (opcional)
  - `className?: string` (opcional)
- **FR-006**: O modal `AdjustDietGoalsModal` MUST ser refatorado para remover o bloco de JSX hardcoded e reutilizar `MacroProportionBar`.
- **FR-007**: O card `MealCardContainer` MUST consumir `MacroProportionBar` de forma padronizada e limpa.
- **FR-008**: O componente MUST possuir atributos de acessibilidade (`role="progressbar"`, `aria-label`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `title` explicativo nos segmentos) e contraste WCAG AA.

---

### Key Entities

- **MacroDistribution**: Representação dos percentuais e calorias de cada macronutriente (`proteinPct`, `carbsPct`, `fatsPct`, `proteinKcal`, `carbsKcal`, `fatsKcal`, `totalKcal`).
- **MacroProportionBarProps**: Contrato TypeScript público contendo todas as opções de entrada e customização da molécula.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% do código duplicado/hardcoded de barras de distribuição calórica (% VET) em modais e cards é eliminado e substituído pelo componente único.
- **SC-002**: A molécula pode ser instanciada em qualquer componente novo com 1 única linha de código e zero boilerplate de cálculo.
- **SC-003**: 100% dos testes unitários da molécula, modais e telas consumidoras passam com sucesso.
- **SC-004**: O componente é 100% compatível com a arquitetura atômica e o Design System canônico do projeto.

---

## Assumptions

- O cálculo calórico segue a regra padrão de Atwater adotada no projeto (4 kcal para P, 4 kcal para C e 9 kcal para G).
- O escopo de layout é desktop (>= 1024px) com design responsivo fluido nos containers onde for inserido.
- Não há necessidade de bibliotecas externas de gráficos (SVG ou Canvas complexos); a barra em CSS/Tailwind nativo atende plenamente e com desempenho superior.
