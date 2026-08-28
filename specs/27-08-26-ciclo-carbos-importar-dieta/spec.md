# Feature Specification: Suporte a Ciclo de Carboidratos no Modal de Importação de Dietas

**Feature Branch**: `diet-screen`

**Created**: 2026-08-27

**Status**: Clarified

**Input**: Suporte e tratamento de dietas com ciclo de carboidratos na tabela de dietas anteriores e no fluxo de importação do modal ImportPreviousDietModal (exibição de amplitude min-max e detalhamento de variações via linha expansível, além de conversão automática do rascunho de destino para modo ciclo de carboidratos ao importar macros ou refeições).

## Clarifications & Decisions

1. **Experiência Visual na Tabela**:
   - Linha principal exibe a amplitude Mínima e Máxima (ex: `1.700 – 2.500 kcal` e `P 180g · C 100–300g · G 55g`).
   - Badge da coluna Modo indica o total de variações (`Ciclo (3 variações)`).
   - Suporte a Linha Expansível (`renderExpandedRow`) acionada por chevron `▼` para inspecionar os valores e refeições de cada dia individual do ciclo inline.
2. **Comportamento de Importação de Metas ("Puxar apenas os macros")**:
   - Ao importar macros de uma dieta de Ciclo de Carboidratos para uma dieta de destino (mesmo que esteja atualmente em modo Simples), o sistema **transforma a dieta atual em Ciclo de Carboidratos**, copiando os alvos de macros (P/C/G e kcal) de todas as variações sem transferir alimentos/refeições.
3. **Comportamento de Importação de Cardápios ("Puxar todas as refeições")**:
   - Transforma a dieta atual em Ciclo de Carboidratos, transferindo integralmente a estrutura de todas as variações e duplicando todas as refeições e alimentos com identificadores únicos novos.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualização Clara da Amplitude do Ciclo na Tabela (Priority: P1)

Como um nutricionista que utiliza o modal de importação de dietas anteriores, quero ver com precisão que um plano é de Ciclo de Carboidratos e identificar a sua faixa de oscilação calórica e de macronutrientes na tabela resumida, para que eu não seja induzido ao erro de achar que a dieta possui apenas um valor calórico fixo.

**Why this priority**: É o ponto crítico de tomada de decisão. Atualmente, o sistema exibe apenas a primeira variação do ciclo (ex: apenas o dia de Alto Carbo), distorcendo a percepção do plano clínico anterior.

**Independent Test**: Abrir o modal com um paciente que possui dietas em modo Simples e dietas em modo Ciclo de Carboidratos; verificar se a linha do ciclo exibe distintamente a amplitude mínima e máxima (ex: `1.700 – 2.500 kcal` e `P 180g · C 100–300g · G 55g`) e badge indicando a contagem de variações (`Ciclo (3 variações)`).

**Acceptance Scenarios**:
1. **Given** um plano com 3 variações de carboidratos (Alto 300g / 2500kcal, Médio 200g / 2100kcal, Baixo 100g / 1700kcal), **When** o nutricionista visualiza a tabela de dietas anteriores, **Then** a coluna *Macros* exibe `P 180g · C 100–300g · G 55g`, a coluna *Calorias* exibe `1.700 – 2.500 kcal` e o *Modo* exibe o badge `Ciclo (3 variações)`.
2. **Given** um plano em modo simples (ex: 2000kcal fixas), **When** exibido na tabela, **Then** continua exibindo os valores únicos estáticos normalmente sem hífen de intervalo.

---

### User Story 2 - Detalhamento das Variações do Ciclo via Linha Expansível (Priority: P2)

Como um nutricionista comparando dietas antigas, quero poder expandir a linha de um plano de ciclo para inspecionar os valores e refeições de cada dia individual (Alto, Médio, Baixo) sem sair do modal, para validar se a distribuição atende ao novo momento do paciente antes de importar.

**Why this priority**: Permite uma análise aprofundada antes da importação sem sobrecarregar a visualização padrão.

**Independent Test**: Clicar no botão de expansão da linha de uma dieta de ciclo e verificar o painel expansível com a listagem de cada variação, suas metas individuais de P/C/G, calorias e número de refeições cadastradas.

**Acceptance Scenarios**:
1. **Given** uma linha de dieta com Ciclo de Carboidratos, **When** o nutricionista clica no botão chevron para expandir a linha, **Then** o `renderExpandedRow` renderiza um container com o detalhe de cada variação (ex: `Alto Carbo: 2.500 kcal · P 180g · C 300g · G 55g · 4 refs`, `Médio Carbo: 2.100 kcal...`, etc.).
2. **Given** uma linha expandida, **When** o usuário clica novamente no botão de colapso, **Then** o detalhe é recolhido suavemente.

---

### User Story 3 - Importação e Conversão de Modo de Destino (Priority: P3)

Como um nutricionista que escolheu uma dieta anterior de Ciclo de Carboidratos, quero clicar em "Puxar todas as refeições" ou "Puxar apenas os macros" e ter o rascunho de destino transformado em Ciclo de Carboidratos com todas as variações e dados consistentes.

**Why this priority**: Garante integridade do modelo de dados e fidelidade clínica da prescrição, adaptando o rascunho ativo automaticamente.

**Independent Test**: Selecionar uma dieta de ciclo em um rascunho atualmente simples e executar "Puxar apenas os macros" e "Puxar todas as refeições", verificando que a dieta ativa passa para `mode: 'carb_cycling'` com todas as variações preenchidas.

**Acceptance Scenarios**:
1. **Given** um rascunho no modo simples e uma dieta anterior de Ciclo selecionada, **When** o usuário clica em "Puxar apenas os macros", **Then** o rascunho ativo é convertido para `mode: 'carb_cycling'`, com as variações recebendo as metas de cada dia do ciclo e mantendo as refeições vazias.
2. **Given** um rascunho no modo simples e uma dieta anterior de Ciclo selecionada, **When** o usuário clica em "Puxar todas as refeições", **Then** o rascunho ativo é convertido para `mode: 'carb_cycling'` com todas as variações e suas respectivas refeições/alimentos clonados com IDs únicos.

---

### Edge Cases

- **Ciclo com variações sem refeições cadastradas**: O sistema deve indicar `0 refs` para aquela variação sem quebrar o cálculo de macros.
- **Ciclo onde todos os dias possuem a mesma quantidade de carboidratos**: Exibir valor único sem formato de intervalo redundante (ex: `C 200g` em vez de `C 200–200g`).
- **Dieta histórica antiga sem o objeto completo `carbCyclingVariations`**: Tratar com fallback gracioso para os valores em nível raiz.
- **Acessibilidade do botão de expansão**: O toggle de expansão deve ter `aria-expanded` e `aria-label` adequados e não interferir na seleção da linha via checkbox/click.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O adaptador `buildPreviousDietSummaries` DEVE calcular o intervalo mínimo e máximo de calorias, carboidratos, proteínas e gorduras entre todas as variações para planos em modo `carb_cycling`.
- **FR-002**: A coluna *Macros* da tabela DEVE renderizar formatos de faixa quando houver variação de valores (`min–max g`) ou valor fixo quando não houver variação.
- **FR-003**: A coluna *Calorias* DEVE renderizar a faixa de calorias `min – max kcal` para dietas de ciclo com valores distintos entre variações.
- **FR-004**: A coluna *Modo* DEVE exibir a quantidade de variações cadastradas (ex: `Ciclo (3 variações)`).
- **FR-005**: O componente DEVE implementar `renderExpandedRow` no `DataTable` para detalhar inline as variações de dietas de ciclo.
- **FR-006**: A função de duplicação `cloneDietForNewDraft` DEVE preservar todas as variações do ciclo, gerando novos identificadores únicos para variações, refeições e itens.
- **FR-007**: A extração e aplicação de macros (`extractMacrosFromPreviousDiet`) DEVE converter a dieta de destino para modo ciclo de carboidratos quando a fonte for um ciclo, transferindo as metas de todas as variações.

### Key Entities

- **PreviousDietSummary**: Estrutura de dados sintetizada para a tabela contendo `isCycling: boolean`, `calorieRange?: { min: number, max: number }`, `carbsRange?: { min: number, max: number }`, `proteinRange?: { min: number, max: number }`, `fatsRange?: { min: number, max: number }`, `variationsCount: number`, e `variations: CarbCyclingVariationSummary[]`.
- **CarbCyclingVariationSummary**: Resumo de cada dia do ciclo contendo `id`, `name`, `targetKcal`, `targetProtein`, `targetCarbs`, `targetFats` e `mealsCount`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das dietas com Ciclo de Carboidratos exibem com precisão a faixa de calorias e carboidratos no modal de importação sem truncamento ou NaN.
- **SC-002**: Linha expansível abre e fecha com 1 clique e expõe com clareza cada dia do ciclo com seus macros e refeições.
- **SC-003**: 100% das importações de dietas de ciclo convertem a dieta ativa para modo de ciclo com fidelidade total aos dados originais.
- **SC-004**: 100% de conformidade com os testes automatizados unitários e de conformidade de tabela da suíte.

## Assumptions

- O modelo de dados do projeto (`FullDietPlan` e `CarbCyclingVariation`) já persiste as variações e seus respectivos cardápios.
- O componente `DataTable` suporta `renderExpandedRow` e `expandedRowId`.
- A maioria dos ciclos de carboidratos mantém proteínas e gorduras constantes, enquanto carboidratos e calorias oscilam amplamente entre os dias.
