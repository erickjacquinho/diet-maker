# Feature Specification: Auditoria e Adequação do Componente MacroSummary

**Feature Directory**: `specs/24-08-26-auditoria-adequacao-macro-summary`

**Created**: 2026-08-24

**Status**: Draft

**Input**: User description: "audiote as implementacoes. crie um /sdd de auditoria e adequacao. o componente nao pode ter quebra de linha, o componente deve conseguir mostrar ou nao as kcal para se adequar a mais situacoes."

## Clarifications

### Session 2026-08-24
- Q: O componente deve permitir tanto omitir `kcal` por ausência da prop quanto por controle booleano explícito `showKcal`? → A: Sim, o componente suporta `showKcal?: boolean` (quando `showKcal === false`, oculta as calorias mesmo se `kcal` estiver presente) e omissão natural quando `kcal` não for informado.
- Q: Como deve ser garantida a não quebra de linha do componente? → A: O contêiner raiz do componente deve possuir `flex-nowrap whitespace-nowrap shrink-0` ou estrutura equivalente inline para garantir que nunca quebre linha internamente.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Exibição Contínua Sem Quebra de Linha (Priority: P1)

Como usuário ou profissional visualizando cards de ciclo de carboidratos, tabelas de prescrições e listas de refeições, quero que os macronutrientes e calorias sejam exibidos sempre em uma linha contínua, sem quebras de linha indesejadas que desalinhem o layout ou prejudiquem a leitura rápida.

**Why this priority**: A integridade visual e alinhamento em layouts densos (como cards em grid e células de tabela) depende criticamente de os dados de macros não quebrarem linha inesperadamente.

**Independent Test**: Pode ser testado visualmente e programaticamente renderizando o componente em contêineres estreitos e verificando a aplicação das propriedades de não quebra de linha (`whitespace-nowrap flex-nowrap`).

**Acceptance Scenarios**:

1. **Given** um card de ciclo de carboidratos ou linha de tabela com largura reduzida, **When** o componente `MacroSummary` renderiza os macros e calorias, **Then** todos os itens (`P`, `•`, `C`, `•`, `G`, `•`, `kcal`) permanecem na mesma linha horizontal sem quebra de linha interna.
2. **Given** um componente pai que precise controlar o encolhimento ou overflow, **Then** o `MacroSummary` respeita as classes adicionais passadas via `className` sem forçar wrap.

---

### User Story 2 - Controle Explícito da Exibição de Calorias (Priority: P1)

Como desenvolvedor e usuário do sistema, quero poder decidir de maneira explícita e flexível se as calorias (`kcal`) devem ser renderizadas junto aos macronutrientes (`P`, `C`, `G`) em cada contexto específico da aplicação (como tabelas onde calorias já possuem coluna própria ou cards onde devem aparecer juntas).

**Why this priority**: Diferentes partes da interface têm convenções distintas: tabelas possuem colunas separadas para calorias, enquanto cards de ciclo e resumos de contexto exibem macros + calorias em uma única linha.

**Independent Test**: Pode ser testado renderizando o componente com e sem valor de `kcal`, e com a propriedade booleana `showKcal` definida como `true` ou `false`, validando a presença ou ausência da seção de calorias e do separador correspondente.

**Acceptance Scenarios**:

1. **Given** `MacroSummary` com valores de macros e `kcal` fornecido com `showKcal={true}` (ou padrão implícito quando `kcal` existe e `showKcal` não é `false`), **When** o componente é renderizado, **Then** as calorias são exibidas precedidas pelo separador `•`.
2. **Given** `MacroSummary` com `showKcal={false}` mesmo com valor de `kcal` passado, **When** o componente é renderizado, **Then** nenhuma caloria ou separador final é exibido.
3. **Given** `MacroSummary` sem valor de `kcal`, **When** o componente é renderizado, **Then** apenas os três macronutrientes (`P`, `C`, `G`) são exibidos.

---

### User Story 3 - Auditoria e Adequação Global dos Consumidores (Priority: P2)

Como mantenedor do projeto, quero auditar todos os pontos de consumo do componente `MacroSummary` e da interface para garantir que nenhum local utilize HTML/classes manuais legadas e que todos os locais utilizem a assinatura e comportamento adequados do componente.

**Why this priority**: Evita regressões, inconsistências de layout e garante conformidade arquitetural com o Atomic Design do projeto.

**Independent Test**: Varredura estática de código e execução de testes em todos os arquivos de componentes e organismos consumidores.

**Acceptance Scenarios**:

1. **Given** a aplicação completa, **When** executada a auditoria nos componentes (`CarbCyclingVariationPanel`, `CycleMatrixModal`, `PatientProfileCurrentContext`, `ConsultationHistoryRow`, `PatientDietsTable`, `ConsultationDietCard`, `ReadOnlyDietModal`, `FoodSearchResultsList`), **Then** todos utilizam `MacroSummary` com parametrização consistente e sem estilos conflitantes.

---

### Edge Cases

- O que acontece quando os valores de macronutrientes são 0 ou strings vazias? O componente deve formatar com segurança exibindo `0g` e não quebrar.
- O que acontece quando um contêiner pai é extremamente estreito? O componente não quebra linha internamente, permitindo que o contêiner pai gerencie rolagem ou truncamento conforme o design token aplicável.
- O que acontece quando `showKcal` é `true`, mas `kcal` é `undefined` ou `null`? O componente não exibe texto de calorias vazio nem separador órfão.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O componente `MacroSummary` DEVE impedir quebra de linha interna entre seus elementos, utilizando classes como `flex-nowrap whitespace-nowrap` e mantendo a integridade horizontal.
- **FR-002**: O componente `MacroSummary` DEVE suportar a propriedade explícita `showKcal?: boolean` para permitir forçar a exibição ou ocultação de calorias independentemente da presença do valor de `kcal`.
- **FR-003**: O componente `MacroSummary` DEVE manter o comportamento padrão de omitir calorias e separador quando `kcal` não for informado ou quando `showKcal === false`.
- **FR-004**: O componente `MacroSummary` DEVE manter os tokens de cores semânticas (`text-macro-protein`, `text-macro-carbohydrate`, `text-macro-fat`, `text-text-primary`, `text-text-muted`) e atributos de acessibilidade (`title`, `aria-hidden`).
- **FR-005**: Todos os locais auditados na aplicação DEVEM estar adequados para usar `MacroSummary` com a parametrização apropriada para seu layout (com ou sem `kcal`, com classes de estilo de texto do design system).
- **FR-006**: Todos os testes unitários e de integração pertinentes DEVEM validar a ausência de quebra de linha e o controle de exibição de calorias.

### Key Entities

- **MacroSummaryProps**: Interface de configuração do componente contendo `protein`, `carbs`, `fats`, `kcal?`, `showKcal?`, `unit?`, `kcalSuffix?`, `showLabels?`, `className?`, `data-testid?`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos locais da aplicação que exibem resumos inline de macros utilizam o componente `MacroSummary`.
- **SC-002**: 100% das renderizações de `MacroSummary` mantêm seus elementos em linha única contínua sem wrap acidental.
- **SC-003**: 100% dos testes unitários e de integração passam sem falhas (`npm test` e testes direcionados).
- **SC-004**: 0 violações de TypeScript (`npm run type-check`) e conformidade com Atomic Design mantida.

## Assumptions

- O produto desktop NutriDiet opera com foco em resoluções a partir de 1024px, portanto layouts compactos utilizam controle de espaço preciso sem breakpoints móveis arbitrários.
- O padrão visual estabelecido para os identificadores de macronutrientes é `P`, `C`, `G` em negrito com cores semânticas dedicadas do design system.
