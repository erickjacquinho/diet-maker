# Feature Specification: Correção Universal de Cálculo de Calorias a partir de Macros

**Feature Branch**: `30-07-26-correcao-de-todos-os-calculos`

**Created**: 30/07/2026

**Status**: Draft

**Input**: User description: "Correção de todos os cálculos de calorias a partir de macros para o componente que temos hoje usando vercel-composition-patterns"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Padronização do Cálculo Calórico Automático no Componente de Macros (Priority: P1)

Como nutricionista ou profissional de saúde, quero que todas as exibições e edições de metas/refeições que informam Kcal, Proteínas, Carboidratos e Gorduras calculem e atualizem dinamicamente as calorias ($4 \times \text{Prot} + 4 \times \text{Carb} + 9 \times \text{Gord}$), eliminando discrepâncias visuais e entradas manuais inconsistentes (ex: 30g Prot, 40g Carb, 12g Gord mostrando 400 kcal ao invés de 388 kcal).

**Why this priority**: A precisão matemática no cálculo de macronutrientes e calorias é fundamental para o sucesso das prescrições dietéticas e confiança no sistema.

**Independent Test**: Pode ser testado de forma independente inserindo valores de macronutrientes (ex: 30g Prot, 40g Carb, 12g Gord) no componente `AutoKcalSection` / formulários de refeição e verificando se a caloria total é instantaneamente recalculada e exibida como 388 kcal.

**Acceptance Scenarios**:

1. **Given** um formulário ou card com entrada de macronutrientes (Proteínas, Carboidratos, Gorduras), **When** o usuário altera qualquer valor de macro, **Then** o valor total de Kcal é recalculado automaticamente e exibido de forma transparente em tempo real.
2. **Given** um componente de refeição ou prescrição contendo 30g de Proteína, 40g de Carboidrato e 12g de Gordura, **When** o componente é renderizado, **Then** a caloria calculada exibida deve ser exatamente 388 kcal ($30 \times 4 + 40 \times 4 + 12 \times 9$).

---

### User Story 2 - Composição de Componentes sem Proliferação de Booleans (Priority: P2)

Como desenvolvedor da plataforma, quero reutilizar o padrão de composição `AutoKcalSection` (conforme as diretrizes de `vercel-composition-patterns`), separando o estado do formulário dos componentes de exibição/cálculo, sem criar múltiplos props booleanos de controle (ex: `isManualMode`, `hideFormula`, `showKcalInput`).

**Why this priority**: Garante manutenibilidade e escalabilidade da arquitetura React à medida que novos formulários de dieta e refeições forem criados.

**Independent Test**: Testar se os componentes de visualização e edição aceitam handlers limpos e renderizam partes customizadas via composição sem quebras de tipagem.

**Acceptance Scenarios**:

1. **Given** a necessidade de exibir ou editar calorias calculadas em modal de prescrição, lista de refeições ou presets, **When** o desenvolvedor utiliza o componente `AutoKcalSection`, **Then** a integração ocorre via props de estado e manipuladores de eventos limpos (`proteinG`, `carbsG`, `fatsG`, `onProteinChange`, `onCarbsChange`, `onFatsChange`).

---

### Edge Cases

- **Valores nulos, negativos ou decimais**: Como o sistema se comporta ao digitar valores vazios (`""`), negativos ou fracionários? O cálculo deve tratar entradas inválidas como 0 e arredondar o resultado de Kcal de forma previsível.
- **Valores históricos/legados divergentes**: Quando um registro antigo salvo no banco/storage tiver divergência entre Kcal salvo e Kcal calculado por macros, o sistema deve priorizar o cálculo dinâmico atualizado ou destacar visualmente o valor calculado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE calcular as calorias totais aplicando rigorosamente a regra atwater ($4 \text{ kcal/g de proteína} + 4 \text{ kcal/g de carboidrato} + 9 \text{ kcal/g de gordura}$).
- **FR-002**: O sistema DEVE substituir campos de entrada manual estática de Kcal por cálculo automático dinâmico em todos os componentes de metas nutricionais e refeições.
- **FR-003**: O componente `AutoKcalSection` DEVE ser o padrão único reutilizável para exibição e edição de macros/calorias.
- **FR-004**: O sistema DEVE atualizar instantaneamente a Badge/Display de Kcal no momento da alteração de qualquer input numérico de macro.
- **FR-005**: A arquitetura do componente DEVE obedecer às diretrizes do `vercel-composition-patterns`, evitando boolean props desnecessários.

### Key Entities

- **NutrientMacroSet**: Entidade que representa os macronutrientes em gramas (`proteinG`, `carbsG`, `fatsG`) e a função puramente matemática de derivação para `targetKcal`.
- **AutoKcalSectionProps**: Interface pública do componente com contrato claro de estado e ações de modificação.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos locais onde o usuário visualiza ou edita macronutrientes/calorias utilizam a fórmula matemática exata ($4/4/9$).
- **SC-002**: Zero divergência matemática entre a soma dos macronutrientes e as calorias exibidas na interface.
- **SC-003**: Tempo de atualização reativa da caloria calculada ao alterar um input inferior a 16ms (60 FPS).

## Assumptions

- Todos os alimentos e metas no sistema adotam os fatores padrão 4 kcal/g para proteínas, 4 kcal/g para carboidratos e 9 kcal/g para gorduras.
-Arredondamento de calorias totais é feito para o número inteiro mais próximo (`Math.round`).
