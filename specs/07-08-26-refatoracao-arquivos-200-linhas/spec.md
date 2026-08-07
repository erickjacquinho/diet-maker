# Feature Specification: Refatoração, Componentização e Limpeza de Código (>200 Linhas)

**Feature Branch**: `refatoracao-arquivos-200-linhas`

**Created**: 2026-08-07

**Status**: Draft

**Input**: User description: "/vercel-composition-patterns crie um /sdd de refatoração, componentizacao e limpeza de codigo para todos os arquivos listado com mais de 200 linhas. o objetivo é limpar o máximo possível e minimizar o numero de linhas desnecessárias."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Decomposição e Componentização de Páginas e Componentes Monolíticos (Priority: P1)

Como desenvolvedor da aplicação, quero que componentes React e páginas com mais de 200 linhas de código sejam divididos em subcomponentes atômicos e reutilizáveis aplicando os padrões de composição da Vercel (`vercel-composition-patterns`), reduzindo o tamanho de cada arquivo individual para <150 linhas sem alterar nenhuma funcionalidade visual ou de negócio existente.

**Why this priority**: É o objetivo central da solicitação de refatoração: simplificar a manutenção, eliminar código duplicado e tornar a base de código modular e fácil de ler/testar.

**Independent Test**: Pode ser testado executando a suíte de testes regressivos (`npm run test`) e verificando que a aplicação continua com 100% de paridade funcional e visual, além de validar que nenhum arquivo refatorado ultrapassa 200 linhas.

**Acceptance Scenarios**:

1. **Given** um componente monolítico como [`DesignSystemShowcase.tsx`](file:///c:/Programmer/diet-maker/src/app/design-system/components/DesignSystemShowcase.tsx) ou [`EditAssessmentModal.tsx`](file:///c:/Programmer/diet-maker/src/components/molecules/EditAssessmentModal.tsx), **When** a refatoração for aplicada, **Then** o arquivo principal deve ser decomposto em subcomponentes focados sob suas respectivas pastas de domínio, mantendo a API externa e props inalteradas.
2. **Given** qualquer um dos 20 arquivos com mais de 200 linhas de código do projeto, **When** a refatoração for concluída, **Then** cada arquivo resultante deve possuir responsabilidade única e contagem de linhas significativamente reduzida (meta: <150 linhas por arquivo).

---

### User Story 2 - Extração de Hooks Customizados e Lógica de Estado (Priority: P2)

Como desenvolvedor da aplicação, quero desacoplar a lógica de cálculo, manipulação de dados e efeitos visuais contida em hooks gigantes (como [`useDietBuilderPage.ts`](file:///c:/Programmer/diet-maker/src/hooks/useDietBuilderPage.ts)) e stores (como [`patientsStore.ts`](file:///c:/Programmer/diet-maker/src/lib/patientsStore.ts) e [`patientListView.ts`](file:///c:/Programmer/diet-maker/src/lib/patientListView.ts)), dividindo-os em hooks especializados e funções utilitárias puras.

**Why this priority**: Evita hooks e stores "God object" que acumulam múltiplos estados não relacionados, facilitando testes unitários isolados e reduzindo renderizações desnecessárias.

**Independent Test**: Testar individualmente os novos sub-hooks e utilitários via `npm run test` garantindo que os fluxos de consulta, construção de dieta e gerenciamento de pacientes continuem funcionando identicamente.

**Acceptance Scenarios**:

1. **Given** o hook [`useDietBuilderPage.ts`](file:///c:/Programmer/diet-maker/src/hooks/useDietBuilderPage.ts) (471 linhas), **When** desacoplado, **Then** suas responsabilidades devem ser divididas em sub-hooks isolados (ex: `useDietCalculations`, `useMealActions`, `usePresetSelector`).
2. **Given** a store [`patientsStore.ts`](file:///c:/Programmer/diet-maker/src/lib/patientsStore.ts) (385 linhas) e [`patientListView.ts`](file:///c:/Programmer/diet-maker/src/lib/patientListView.ts) (348 linhas), **When** refatorados, **Then** as rotinas de busca, ordenação e mutação devem ser divididas em fatias (slices) ou módulos auxiliares coesos.

---

### User Story 3 - Eliminação de Prop Drilling e Proliferação de Props Booleanas (Priority: P3)

Como desenvolvedor da aplicação, quero substituir o uso de múltiplas props booleanas (`isEdit`, `isReadOnly`, `hasHeader`, `showActions`, etc.) por padrões de Composição de Componentes (Compound Components e Children Slots), utilizando `vercel-composition-patterns`.

**Why this priority**: Torna as APIs dos componentes mais expressivas, flexíveis para extensões futuras e fáceis de compor sem poluir as props com seleções condicionais rígidas.

**Independent Test**: Verificar se os componentes refatorados utilizam a API composta sem depender de flags booleanas confusas nas props.

**Acceptance Scenarios**:

1. **Given** componentes como [`SidebarNav.tsx`](file:///c:/Programmer/diet-maker/src/components/organisms/SidebarNav.tsx) ou [`FoodTableSection.tsx`](file:///c:/Programmer/diet-maker/src/components/organisms/foods/FoodTableSection.tsx), **When** refatorados com Compound Components, **Then** os subcomponentes são expostos como slots configuráveis (ex: `FoodTable.Header`, `FoodTable.Row`).

---

### Edge Cases

- Como o sistema se comporta durante refatorações se o estado do formulário em modais for complexo? A separação de subcomponentes deve manter o contexto unificado via React Context ou React Hook Form para evitar perda de estado ao digitar.
- O que acontece se a suíte de testes quebrar durante a reestruturação dos arquivos? Nenhuma alteração de compilação ou regressão visual deve ser aceita; a suíte de testes e o build Next.js (`npm run build`) devem passar 100% limpos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE refatorar os 20 arquivos mapeados com mais de 200 linhas de código no diretório `src/`:
  1. [`DesignSystemShowcase.tsx`](file:///c:/Programmer/diet-maker/src/app/design-system/components/DesignSystemShowcase.tsx) (567 L)
  2. [`useDietBuilderPage.ts`](file:///c:/Programmer/diet-maker/src/hooks/useDietBuilderPage.ts) (471 L)
  3. [`EditAssessmentModal.tsx`](file:///c:/Programmer/diet-maker/src/components/molecules/EditAssessmentModal.tsx) (410 L)
  4. [`patientsStore.ts`](file:///c:/Programmer/diet-maker/src/lib/patientsStore.ts) (385 L)
  5. [`sidebar.tsx`](file:///c:/Programmer/diet-maker/src/components/ui/sidebar.tsx) (380 L)
  6. [`src/app/pacientes/[id]/consulta/[date]/page.tsx`](file:///c:/Programmer/diet-maker/src/app/pacientes/[id]/consulta/[date]/page.tsx) (366 L)
  7. [`patientListView.ts`](file:///c:/Programmer/diet-maker/src/lib/patientListView.ts) (348 L)
  8. [`PatientConsultationHistoryTable.tsx`](file:///c:/Programmer/diet-maker/src/components/organisms/PatientConsultationHistoryTable.tsx) (292 L)
  9. [`DietBuilderTemplate.tsx`](file:///c:/Programmer/diet-maker/src/components/templates/DietBuilderTemplate.tsx) (286 L)
  10. [`SidebarNav.tsx`](file:///c:/Programmer/diet-maker/src/components/organisms/SidebarNav.tsx) (279 L)
  11. [`FoodTableSection.tsx`](file:///c:/Programmer/diet-maker/src/components/organisms/foods/FoodTableSection.tsx) (233 L)
  12. [`PatientProfileHeader.tsx`](file:///c:/Programmer/diet-maker/src/components/organisms/PatientProfileHeader.tsx) (227 L)
  13. [`FoodSearchModal.tsx`](file:///c:/Programmer/diet-maker/src/components/molecules/FoodSearchModal.tsx) (215 L)
  14. [`src/app/pacientes/[id]/page.tsx`](file:///c:/Programmer/diet-maker/src/app/pacientes/[id]/page.tsx) (208 L)
  15. [`PatientListTable.tsx`](file:///c:/Programmer/diet-maker/src/components/organisms/PatientListTable.tsx) (207 L)
  16. [`CustomFoodModal.tsx`](file:///c:/Programmer/diet-maker/src/components/molecules/CustomFoodModal.tsx) (206 L)
  17. [`dietStore.ts`](file:///c:/Programmer/diet-maker/src/lib/dietStore.ts) (205 L)
  18. [`src/app/presets/page.tsx`](file:///c:/Programmer/diet-maker/src/app/presets/page.tsx) (202 L)
  19. [`calendar.tsx`](file:///c:/Programmer/diet-maker/src/components/ui/calendar.tsx) (201 L)
  20. [`src/app/pacientes/[id]/dieta/[dietaId]/page.tsx`](file:///c:/Programmer/diet-maker/src/app/pacientes/[id]/dieta/[dietaId]/page.tsx) (200 L)
- **FR-002**: O sistema DEVE aplicar as diretrizes da skill `vercel-composition-patterns`:
  - `architecture-avoid-boolean-props`
  - `architecture-compound-components`
  - `state-decouple-implementation`
  - `patterns-explicit-variants`
  - `patterns-children-over-render-props`
- **FR-003**: Todas as exportações públicas existentes e contratos de componentes/hooks DEVEM ser mantidos para garantir retrocompatibilidade com o restante do sistema.
- **FR-004**: O build da aplicação (`npm run build`) e os testes automatizados (`npm run test`) DEVEM passar com 0 erros após a refatoração de cada grupo de arquivos.

### Key Entities

- **Refactored Module**: Representa a unidade modularizada (componente, hook ou store) refatorada com responsabilidade única e limites bem definidos.
- **Compound Slot/Subcomponent**: Subcomponente extraído que responde por uma sub-região da interface ou sub-responsabilidade do estado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Nenhum arquivo de código no diretório `src/` (com exceção de arquivos de dados estáticos como JSON) deve exceder 200 linhas de código após a conclusão.
- **SC-002**: Redução média do tamanho dos arquivos refatorados em pelo menos 50% através de extração em subcomponentes e hooks auxiliares.
- **SC-003**: 100% dos testes existentes no projeto passam com sucesso sem regressões (`npm run test`).
- **SC-004**: O tempo de build da aplicação não deve aumentar e a compilação do TypeScript não deve gerar nenhum novo erro de tipagem.

## Assumptions

- O arquivo `src/data/taco_database.json` é uma base de dados JSON estática de alimentos e não faz parte da refatoração de código React/TypeScript.
- A refatoração preservará rigorosamente a aparência visual (design system), comportamento interativo e persistência dos dados dos pacientes e dietas.
