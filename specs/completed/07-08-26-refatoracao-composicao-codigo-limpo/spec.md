# Feature Specification: Refatoração, Componentização e Padrões de Composição Vercel (100% dos Arquivos Extensos)

**Feature Directory**: `specs/07-08-26-refatoracao-composicao-codigo-limpo`
**Created**: 2026-08-07
**Status**: Draft
**Input**: User description: "/vercel-composition-patterns analise todos estes arquivos, r crie um plano de refatoraçao para 100% deles usando /sdd. o foco maximo é: limpea d codigo. componentiaçao, refatoraçao, modularizaçao. utilize as melhores praticas do mercado para deixar o codigo limpo e direto."

---

## Executive Summary & Vision

Refatoração abrangente de **100% dos arquivos com mais de 100 linhas** identificados no projeto (Páginas, Componentes de UI, Stores/Lógica de Negócio, Suíte de Testes e Scripts de Automação). O foco primário é atingir código limpo, de alta coesão e baixo acoplamento, aplicando estritamente as diretrizes do **Vercel React Composition Patterns** (`architecture-avoid-boolean-props`, `architecture-compound-components`, `state-decouple-implementation`, `patterns-explicit-variants`, e `patterns-children-over-render-props`).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Decomposição Modular das Páginas e Views Monolíticas (Priority: P1)

Como desenvolvedor e mantenedor da plataforma, quero que as páginas extensas (`src/app/pacientes/[id]/dieta/[dietaId]/page.tsx`, `alimentos/page.tsx`, `pacientes/[id]/page.tsx`, etc.) sejam decompostas em subcomponentes puros e hooks especializados com responsabilidade única, para que o fluxo de renderização seja previsível, sem acoplamento direto de lógica de estado complexa na camada visual.

**Why this priority**: As páginas principais contêm atualmente entre 360 e 825 linhas cada, misturando manipulação de estado local, lógica de cálculo, busca de dados e renderização de modais em blocos monolíticos.

**Independent Test**: Cada página refatorada deve manter 100% das funcionalidades funcionais (navegação, edição de dieta, filtro de alimentos e perfil do paciente) com 0 regressões de interface e 100% de passagem nos testes automatizados existentes.

**Acceptance Scenarios**:
1. **Given** a página do construtor de dietas ([`page.tsx`](file:///c:/Programmer/diet-maker/src/app/pacientes/%5Bid%5D/dieta/%5BdietaId%5D/page.tsx)), **When** refatorada em componentes compostos (ex: `DietBuilderHeader`, `DietBuilderMealList`, `DietBuilderSummaryFooter`), **Then** a linha de código do arquivo principal cai para menos de 250 linhas sem alterar o comportamento do usuário.
2. **Given** a página de alimentos ([`page.tsx`](file:///c:/Programmer/diet-maker/src/app/alimentos/page.tsx)), **When** a tabela e o formulário de adição/filtro forem extraídos em compostos com estado encapsulado, **Then** o arquivo principal passa a apenas orquestrar a composição visual.

---

### User Story 2 - Aplicação dos Vercel Composition Patterns nos Componentes & Modais (Priority: P1)

Como arquiteto de software, quero refatorar componentes complexos e modais extensos (`EditAssessmentModal.tsx`, `sidebar.tsx`, `PatientConsultationHistoryTable.tsx`, `SidebarNav.tsx`, `PatientProfileHeader.tsx`, `FoodSearchModal.tsx`, etc.) eliminando proliferação de props booleanas (`isOpen`, `isEditing`, `isReadOnly`, etc.) em favor de componentes compostos com contexto compartilhado ou variantes explícitas.

**Why this priority**: Previne a proliferação incontrolável de props booleanas e facilita o reuso limpo e expressivo dos componentes de UI pela aplicação.

**Independent Test**: Modais e tabelas aceitam composição por subcomponentes (ex: `<Modal.Header>`, `<Modal.Body>`, `<Modal.Footer>`) ou variantes explícitas e mantêm conformidade com as regras de acessibilidade e z-index do projeto.

**Acceptance Scenarios**:
1. **Given** um modal complexo como `EditAssessmentModal`, **When** refatorado para utilizar o padrão Compound Component (`AssessmentModal.Header`, `AssessmentModal.Form`, `AssessmentModal.Actions`), **Then** evita-se a repetição de condicionais gigantescas e props de controle repassadas via prop-drilling.
2. **Given** componentes de lista e tabelas (`PatientListTable`, `PatientConsultationHistoryTable`), **When** refatorados com o padrão `children-over-render-props`, **Then** os slots de ação e renderização de células tornam-se declarativos.

---

### User Story 3 - Modularização das Stores de Estado e Seletores (Priority: P2)

Como desenvolvedor, quero que as stores de estado (`patientsStore.ts`, `patientListView.ts`, `dietStore.ts`, `tacoStore.ts`) sejam desacopladas da camada visual através de seletores puros, cortando responsabilidades misturadas e dividindo arquivos extensos em slices coesos.

**Why this priority**: A store `patientsStore.ts` (382 linhas) e `patientListView.ts` (348 linhas) acumulam múltiplas responsabilidades (persistência, busca, cálculos de avaliação e mutações de dados).

**Independent Test**: Todas as operações de leitura e mutação continuam funcionando de forma transparente para as views, validadas pela suíte de testes de unidade e integração.

**Acceptance Scenarios**:
1. **Given** a store `patientsStore`, **When** refatorada em slices funcionais (`patientProfileSlice`, `patientAssessmentSlice`, `patientConsultationSlice`), **Then** a interface exportada permanece retrocompatível, reduzindo a complexidade interna de manutenção.
2. **Given** seletores complexos de cálculo de gordura e histórico, **When** isolados em utilitários puros com memoização, **Then** reduzem-se re-renders desnecessários.

---

### User Story 4 - Reorganização e Limpeza dos Testes Automatizados e Scripts (Priority: P3)

Como mantenedor de QA e CI/CD, quero que suítes de teste extensas (`component-catalog.test.mjs`, `patientsStore.test.ts`, etc.) e scripts de automação (`verify-design-system-components.mjs`, `audit-z-index.mjs`) sejam organizados com utilitários de auxílio reutilizáveis (helpers/fixtures), removendo duplicação de boilerplate.

**Why this priority**: Testes com mais de 500 linhas contêm duplicação de setup e fixtures, tornando a leitura e adição de novas asserções trabalhosa.

**Independent Test**: Os scripts e suítes de teste executam mais rapidamente e com logs de saída claros e declarativos.

**Acceptance Scenarios**:
1. **Given** o arquivo `component-catalog.test.mjs` (589 linhas), **When** refatorado com helpers de asserção reutilizáveis, **Then** reduz o número de linhas sem omitir nenhum caso de teste.

---

## Edge Cases

- **Preservação de SSR / Hydration Safety**: A refatoração com React Composition Patterns não pode introduzir `useContext` incompatível com Server Components em Next.js App Router (manter fronteiras `'use client'` bem separadas nos limites de composição).
- **Tratamento de Animações / Framer Motion**: Transições de modais e accordions refatorados não podem perder estados de saída (*exit animations*) ou causar *layout thrashing*.
- **Compatibilidade de Seletores Zustand**: A divisão de stores em slices deve assegurar que a reatividade por seletores (`usePatientsStore(selectX)`) não cause loops de re-render.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST refatorar **100% dos 66 arquivos de código/testes/scripts com >100 linhas** listados no inventário prévio.
- **FR-002**: O sistema MUST aplicar o padrão **Vercel Composition (Avoid Boolean Props)** substituindo props booleanas conflitantes por composição de componentes ou variantes explícitas.
- **FR-003**: O sistema MUST aplicar o padrão **Vercel Composition (Compound Components)** em estruturas complexas (Modais, Sidebar, Tabelas, Cards de Refeição) utilizando contextos desacoplados.
- **FR-004**: O sistema MUST aplicar o padrão **Vercel Composition (State Decoupling & Lifting)** garantindo que o gerenciamento de estado fique restrito a providers/slices dedicados sem vazar detalhes de implementação para subcomponentes de apresentação.
- **FR-005**: O sistema MUST modularizar as páginas de `src/app` que excederem 250 linhas, extraindo componentes moleculares/organismos e hooks customizados (`useDietBuilder`, `useFoodSearch`, `usePatientProfile`).
- **FR-006**: O sistema MUST reorganizar as stores Zustand (`src/lib/patientsStore.ts`, `src/lib/dietStore.ts`) usando o padrão Slice Pattern ou separação de domínios puros.
- **FR-007**: O sistema MUST manter 100% de compatibilidade retroativa com os contratos de tipos TypeScript existentes, garantindo build limpo sem erros de checagem estática (`tsc --noEmit`).
- **FR-008**: O sistema MUST refatorar scripts extensos em `scripts/` utilizando módulos utilitários compartilhados para reutilização de lógica de parsing e validação de AST/DOM.
- **FR-009**: O sistema MUST modularizar as suítes de testes em `tests/` criando helpers e builders de fixture compartilhados.
- **FR-010**: O sistema MUST preservar todas as convenções do Design System do projeto (tokens CSS, z-index contract, shadcn/ui primitives).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: **Redução de Tamanho de Arquivo**: NENHUM arquivo de código-fonte de componente ou página no diretório `src/` excederá 250 linhas após a refatoração (redução média de ~50% no tamanho das páginas monolíticas atuais).
- **SC-002**: **Conformidade de Testes (0 Regressões)**: 100% dos testes automatizados existentes continuam passando com sucesso (`npm test` ou executor de testes equivalente).
- **SC-003**: **Qualidade de Código & Tipagem**: Zero erros de compilação TypeScript (`tsc --noEmit`) e zero avisos graves de linter.
- **SC-004**: **Manutenibilidade & Coesão**: Todos os modais e componentes compostos passam a expor API sem proliferação de boolean props (máximo de 2 boolean props funcionais por componente primário).
- **SC-005**: **Verificação de Desempenho Visual**: Nenhuma alteração visual inesperada na interface ou quebra na renderização responsiva do layout.

---

## Assumptions

- A stack tecnológica permanece rigorosamente Next.js 14+ (App Router), React 18/19, TypeScript, TailwindCSS / Vanilla CSS Tokens e Zustand.
- A refatoração é puramente estrutural e arquitetural, focada em código limpo, sem alteração das regras de negócio nutricionais ou adição de novas features visuais ao usuário final.
