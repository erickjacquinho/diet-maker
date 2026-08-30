# Feature Specification: Adequação e Centralização da Página de Elaboração de Dieta

**Feature Branch**: `20-08-26-adequar-pagina-dieta-nova`

**Created**: 2026-08-20

**Status**: Ready for Implementation

**Input**: User description: "adequar totalmente a pagina ao projeto . no final a pagina deve usar apenas componentes do projeto, deve estar totalmente no padrão das outras paginas do projeto em questão de layout. não deve haver nenhum hardcode de componente, feature ou style. não exclua nenhuma feature e nem adicione componentes visuais. não mude o ui final."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Experiência Visual e Funcional Idêntica sem Hardcode Estrutural (Priority: P1)

Como nutricionista elaborando ou editando um plano alimentar em `/pacientes/:id/dieta/:dietaId` (ou `/dieta/nova`), desejo visualizar o cabeçalho contextual, dados do paciente, alternador de modelo de dieta, metas de macronutrientes e lista de refeições exatamente com a mesma interface visual e funcionalidade, porém com toda a estrutura consumindo exclusivamente os componentes centralizados (`Surface`, `Button`, `IconButton`, `Badge`, `FieldTrigger`) e tokens canônicos do Design System sem nenhuma quebra de layout ou estilos inline/hardcoded.

**Why this priority**: É o núcleo da entrega: garantir que a tela de dieta esteja 100% em conformidade com o Design System do NutriDiet Local Pro sem regressões visuais ou funcionais.

**Independent Test**: Navegar para `/pacientes/pat-1/dieta/nova` e `/pacientes/pat-1/dieta/diet-1`, verificar que o layout renderiza perfeitamente idêntico, que todos os cartões usam `Surface`, que não há classes conflitantes de CSS no DOM e que todas as interações funcionam.

**Acceptance Scenarios**:

1. **Given** que o usuário acessa a página de elaboração de dieta, **When** a página carrega, **Then** o layout exibe `PageContextHeader`, `DietContextSection` (com `PatientProfileHeader` e `DietModeSwitcher`), `MacroTrackerHeader` e `DietMealsSection` estruturados sobre superfícies canônicas `Surface` sem classes conflitantes como `p-5 p-6`, `flex-col flex-row` ou `w-full w-auto`.
2. **Given** que o usuário visualiza os badges de macronutrientes nas refeições e itens, **When** os valores de Proteína, Carboidrato, Gordura e Calorias são renderizados, **Then** os badges utilizam variantes centralizadas do átomo `Badge` (`protein`, `carbohydrate`, `fat`, `kcal`) em vez de strings inline de classes customizadas.
3. **Given** que o usuário clica no botão de edição de nome/horário da refeição em `MealCardContainer`, **When** o botão é renderizado, **Then** ele utiliza o átomo `EditIconButton` ou `IconButton` do Design System, mantendo a mesma ergonomia visual e comportamento de edição inline.

---

### User Story 2 - Preservação Integral de Modais e Fluxos Operacionais (Priority: P2)

Como nutricionista gerenciando a prescrição, desejo buscar alimentos na base TACO (`FoodSearchModal`), ajustar proporcionalmente as quantidades (`ScaleDietModal`), copiar variações do ciclo de carboidratos (`CopyVariationModal`), ajustar metas calóricas (`AdjustDietGoalsModal`) e exportar via WhatsApp (`WhatsAppShareModal`) com total integridade funcional e com os modais devidamente padronizados no Design System.

**Why this priority**: Garante que nenhuma funcionalidade existente seja perdida ou degradada durante a padronização dos componentes.

**Independent Test**: Abrir individualmente cada um dos 5 modais de ação, executar suas operações (adicionar alimento, escalar porcentagem, copiar variação, alterar metas, copiar texto do WhatsApp) e validar que todas as operações persistem os dados corretamente.

**Acceptance Scenarios**:

1. **Given** que o usuário clica em "+ Adicionar Alimento da Base TACO", **When** o modal `FoodSearchModal` abre, **Then** a lista de resultados `FoodSearchResultsList` utiliza componentes centralizados com tokens de cor semânticos (`text-macro-*`, `bg-success-soft`) e o botão de confirmação adiciona o alimento à refeição ativa.
2. **Given** que o usuário seleciona "Escalar", **When** o modal `ScaleDietModal` é acionado, **Then** os botões de porcentagem aplicam a escala proporcional a todos os alimentos da refeição/dieta ativa.
3. **Given** que o usuário aciona "Duplicar Refeição" ou altera a contagem de variações do ciclo, **When** a ação é disparada, **Then** o hook processa a duplicação ou ajuste de contagem sem no-op ou falhas silenciosas.

---

### User Story 3 - Conformidade com Auditoria Automatizada e Regras de Governança (Priority: P3)

Como mantenedor da base de código do NutriDiet Local Pro, desejo que todos os arquivos relacionados ao construtor de dietas passem com 0 violações em `verify-design-system-legacy.mjs`, `audit-atomic-design.mjs` e na suíte de testes do Vitest.

**Why this priority**: Assegura a manutenibilidade de longo prazo e impede que regressões de hardcode ou violações ao Atomic Design entrem na base.

**Independent Test**: Executar os scripts de auditoria do Design System e os testes automatizados do Vitest confirmando zero falhas nos arquivos do fluxo de dieta.

**Acceptance Scenarios**:

1. **Given** a execução do auditor legado de Design System, **When** os arquivos de dieta são escaneados, **Then** 0 violações das regras LEG001 a LEG017 são reportadas para esses arquivos.
2. **Given** a execução da suíte de testes de superfície e acessibilidade (`diet-builder-template.test.tsx`, `diet-builder-template.surface.test.tsx`), **When** os testes rodam, **Then** 100% dos testes passam com sucesso.

---

### Edge Cases

- **Dieta sem refeições cadastradas (Estado Vazio)**: O estado vazio em `DietMealsSection` deve renderizar dentro de um `Surface variant="subtle"` com o ícone de utensílios em `bg-success-soft text-success`, mantendo o botão único de criação "Nova Refeição".
- **Edição inline de gramatura e reordenação de itens**: Em `MealItemRow`, o gatilho de edição de gramatura deve utilizar `FieldTrigger` sem quebrar o listener de `onBlur` ou a tecla Enter, e o botão de reordenação deve utilizar tokens de estado ativos canônicos.
- **Ciclo de carboidratos com 2 ou 3 variações**: A alternância entre variações ativas e a alteração da contagem de variações devem manter os cálculos de macronutrientes sincronizados com o paciente sem valores `NaN` ou `undefined`.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE renderizar a página de elaboração de dieta utilizando exclusivamente a hierarquia canônica de Atomic Design (`templates/DietBuilderTemplate` -> `organisms/diet` -> `molecules` -> `atoms/ui`).
- **FR-002**: O sistema NÃO DEVE conter nenhuma classe conflitante ou duplicada de Tailwind (ex: `p-5 p-6`, `flex-col flex-row`, `w-full w-auto`, `grid-cols-1 grid-cols-2`) nos componentes de dieta.
- **FR-003**: Todos os contêineres de cartão e agrupamentos estruturais DEVEM utilizar o átomo `Surface` (`variant="default"` ou `variant="subtle"`) em substituição a `Card` genérico não estilizado.
- **FR-004**: O átomo `Badge` DEVE suportar formalmente variantes semânticas de macronutrientes (`protein`, `carbohydrate`, `fat`, `kcal`) com tokens oficiais, eliminando a injeção manual repetida de classes de borda/fundo/cor.
- **FR-005**: Todas as cores, opacidades e espaçamentos DEVEM utilizar os tokens do Design System (`bg-success-soft`, `text-macro-*`, `border-border-subtle`, `rounded-control`, `rounded-surface`), eliminando literais e frações arbitrárias como `/50`, `/60` ou `/10`.
- **FR-006**: Todos os botões de ação e ícones DEVEM utilizar os componentes centralizados `Button`, `IconButton`, `EditIconButton` e `FieldTrigger` de `@/components/atoms`.
- **FR-007**: O sistema DEVE preservar todas as funcionalidades existentes de cálculo de metas, busca de alimentos TACO, escala percentual, cópia de variações, edição de metas, compartilhamento WhatsApp e persistência de dados.
- **FR-008**: O hook `useDietMealActions` DEVE implementar o handler `handleDuplicateMeal` para duplicação completa de refeições com clonagem de itens e geração de novos IDs.
- **FR-009**: O hook `useDietBuilderPage` DEVE conectar `onVariationsCountChange` para permitir alternar entre 2 e 3 variações no modo ciclo de carboidratos.
- **FR-010**: A interface visual final renderizada ao usuário DEVE permanecer idêntica em aparência, disposição e usabilidade.

### Key Entities

- **FullDietPlan**: Plano alimentar completo contendo identificador, modo (`simple` | `carb_cycling`), metas calóricas/macros, refeições simples ou variações do ciclo.
- **DietMeal**: Refeição individual contendo ID, nome (ex: "Café da Manhã"), horário planejado e lista de itens alimentares.
- **DietItem**: Item de alimento associado a uma refeição com gramatura, calorias e distribuição de proteínas, carboidratos e gorduras calculados via base TACO.
- **MacroMetric**: Métrica consolidada de nutriente com valor atual, valor-alvo, porcentagem da meta, razão g/kg e variante visual de status.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos componentes da rota de elaboração de dieta consomem exclusivamente átomos e moléculas centralizados do projeto.
- **SC-002**: 0 classes CSS conflitantes, duplicadas ou opacidades arbitrárias não-tokenizadas presentes no código-fonte de dieta.
- **SC-003**: 100% dos testes unitários e de integração existentes para o construtor de dietas continuam passando com sucesso.
- **SC-004**: 0 regressões de interface visual: layout, espaçamentos, tipografia e cores visíveis ao usuário final permanecem estritamente preservados.
- **SC-005**: 100% de conformidade verificada pelos scripts de auditoria do Design System (`verify-design-system-legacy.mjs` e `audit-atomic-design.mjs`).

---

## Assumptions

- O escopo é estritamente desktop a partir de `1024px`, alinhado com a Constituição do NutriDiet Local Pro.
- A base de dados TACO (`tacoStore.ts`) e o storage local de dietas (`dietStore.ts`) permanecem a fonte de verdade para os dados e cálculos nutricionais.
- Nenhuma biblioteca externa visual adicional deve ser adicionada; todas as composições utilizam os componentes já existentes no repositório.
