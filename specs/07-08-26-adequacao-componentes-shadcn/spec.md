# Feature Specification: Adequação de Componentes Shadcn e Vercel Composition Patterns

**Feature Directory**: `specs/07-08-26-adequacao-componentes-shadcn`
**Created**: 2026-08-07
**Status**: Clarified
**Input**: Adequação de 100% dos achados da auditoria do diretório `src/components` para aderência total às diretrizes do Shadcn UI e Vercel Composition Patterns.

## Clarifications

### Session 2026-08-07
- Q: Qual o escopo e estratégia para adequar 100% dos componentes? → A: Refatorar os 8 componentes identificados (Avatar, ProgressBar, FieldTrigger, PatientConsultationHistoryTable, MetricBox/MetricBoxGroup, MealCardContainer, TacoSearchInput) garantindo 100% de compatibilidade retroativa e 0% de quebra nos testes existentes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Padronização dos Componentes Atom de UI Base (Priority: P1)

Como desenvolvedor e nutricionista utilizando a plataforma, quero que os elementos visuais base de UI (Avatar, Barra de Progresso, FieldTrigger) utilizem as primitivas oficiais do Shadcn UI, garantindo acessibilidade, animações nativas e consistência do design system.

**Why this priority**: É a fundação visual do sistema. A refatoração dos Atoms impacta diretamente todas as Molecules e Organisms.

**Independent Test**: Pode ser testado de forma isolada renderizando os componentes em visualizadores/histórias e inspecionando o DOM gerado.

**Acceptance Scenarios**:
1. **Given** um componente `Avatar` em qualquer tela, **When** ele for renderizado, **Then** ele deve utilizar a primitiva `@/components/ui/avatar` com fallback de texto acessível via `AvatarFallback`.
2. **Given** um componente `ProgressBar` em métricas corporais e nutricionais, **When** for renderizado, **Then** deve utilizar a primitiva `@/components/ui/progress`.
3. **Given** um gatilho de campo `FieldTrigger`, **When** renderizado, **Then** deve utilizar `SelectTrigger` do `@/components/ui/select` ou o `Button` do Shadcn em vez de uma tag `<button>` bruta.

---

### User Story 2 - Migração da Tabela de Histórico de Consultas para Shadcn Table (Priority: P1)

Como nutricionista navegando pelo histórico de consultas de um paciente, quero visualizar a tabela de histórico formatada com o componente Shadcn Table com suporte a linhas expansíveis, garantindo acessibilidade via teclado e responsividade.

**Why this priority**: A tabela de consultas é a tela mais densa do sistema e atualmente utiliza tags HTML `<table>` brutas estilizadas manualmente.

**Independent Test**: Pode ser testado acessando o histórico de consultas de um paciente e verificando a navegação via teclado, abertura de acordeão e integridade do layout.

**Acceptance Scenarios**:
1. **Given** a tabela em `PatientConsultationHistoryTable`, **When** renderizada na tela de perfil do paciente, **Then** ela deve compor com `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`, `TableHead` de `@/components/ui/table`.
2. **Given** uma linha de consulta com acordeão expandido, **When** o usuário clica para expandir, **Then** o estado expansível e os dados da consulta/dieta/avaliação devem ser exibidos dentro de células `TableCell` padronizadas.

---

### User Story 3 - Substituição de Estados Vazios e Divisores por Primitivas Semânticas (Priority: P2)

Como nutricionista elaborando ou visualizando prescrições de dieta, quero que estados vazios de refeições e divisores visuais utilizem os componentes semânticos Shadcn (`Empty` e `Separator`), eliminando caixas com bordas tracejadas e divs manuais.

**Why this priority**: Melhora a polidez do design e elimina código CSS duplicado e ad-hoc no projeto.

**Independent Test**: Testar abrindo uma dieta sem refeições ou uma refeição sem alimentos e verificando se os estados vazios utilizam os componentes padrão do design system.

**Acceptance Scenarios**:
1. **Given** o container de refeição `MealCardContainer` sem alimentos ou `DietBuilderTemplate` sem refeições, **When** renderizado, **Then** deve exibir o componente de estado vazio padrão em vez de `div`s manuais com `border-dashed`.
2. **Given** divisores em modais e cards, **When** renderizados, **Then** devem utilizar o componente `<Separator />` em vez de `<div className="border-b..." />`.

---

### User Story 4 - Adequação a Vercel Composition Patterns & Simplificação de Props (Priority: P3)

Como desenvolvedor mantendo a base de código, quero que os componentes sigam os padrões de composição React do Vercel (substituindo proliferação de booleanas por subcomponentes compostos), tornando a arquitetura escalável e legível.

**Why this priority**: Melhora a manutenibilidade e reduz acoplamento e refatorações futuras.

**Independent Test**: Inspecionar os tipos dos componentes e garantir que comportamentos de layout são expressos por composição em vez de flag props como `isCollapsed`, `embedded`, `compact`.

**Acceptance Scenarios**:
1. **Given** componentes como `DietModeSwitcher` e `PatientBadgeHeader`, **When** compostos na página, **Then** devem permitir composição flexível sem depender de múltiplas props booleanas para alterar drasticamente seu layout.

---

### Edge Cases

- O que acontece se a imagem do `Avatar` falhar em carregar ou o texto de iniciais for muito longo? O `AvatarFallback` deve cortar graciosamente e manter a acessibilidade `aria-label`.
- Como a tabela `PatientConsultationHistoryTable` lida com telas móveis/estreitas ao usar `Table` do Shadcn? O container deve manter um wrapper `overflow-x-auto`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O componente `atoms/Avatar.tsx` DEVE ser refatorado para compor com `@/components/ui/avatar` (possuindo `Avatar` e `AvatarFallback`).
- **FR-002**: O componente `atoms/ProgressBar.tsx` DEVE ser refatorado para utilizar a primitiva `@/components/ui/progress`.
- **FR-003**: O componente `atoms/FieldTrigger.tsx` DEVE ser refatorado para utilizar `SelectTrigger` de `@/components/ui/select` ou a variante adequada de `Button` do Shadcn.
- **FR-004**: O componente `organisms/PatientConsultationHistoryTable.tsx` DEVE substituir as tags HTML `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<td>`, `<th>` brutas pelos componentes exportados por `@/components/ui/table`.
- **FR-005**: Os componentes `molecules/MetricBox.tsx` e `organisms/MetricBoxGroup.tsx` DEVEM utilizar as primitivas `Card` e `Separator` do Shadcn UI.
- **FR-006**: As mensagens e containers de estado vazio em `MealCardContainer.tsx`, `DietBuilderTemplate.tsx` e `ReadOnlyDietModal.tsx` DEVEM ser padronizados utilizando composição semântica Shadcn.
- **FR-007**: As tags de macronutrientes e informações secundárias em `RecipeCard.tsx`, `MealItemRow.tsx` e `RecipeIngredientRow.tsx` DEVEM reutilizar o componente `Badge` do Shadcn com tokens semânticos.
- **FR-008**: O campo `molecules/TacoSearchInput.tsx` DEVE ser ajustado para compor o ícone com o input de forma padronizada.
- **FR-009**: Todos os componentes refatorados DEVEM manter integridade total das props públicas existentes para evitar quebras de retrocompatibilidade nas páginas que os consomem.

### Key Entities

- **Atoms Design System**: Coleção de componentes primitivos base do projeto (`Avatar`, `Badge`, `Button`, `Input`, `Progress`, `Surface`).
- **Consultation History View**: Visão tabular do histórico de consultas físicas e nutricionais do paciente.
- **Diet Builder Components**: Conjunto de moléculas e organismos responsáveis pela elaboração e prescrição de dietas (`MealCardContainer`, `DietBuilderTemplate`, `DietModeSwitcher`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos componentes em `src/components/atoms` utilizam ou compõem primitivas oficiais de `@/components/ui`.
- **SC-002**: 0% de uso de tags HTML `<table>` puras em `src/components/organisms` (100% convertidos para `@/components/ui/table`).
- **SC-003**: 100% das suítes de testes unitários existentes continuam passando sem regressões.
- **SC-004**: Redução de código duplicado de estilização manual de divisores e caixas vazias.

## Assumptions

- Os componentes existentes em `@/components/ui` (`avatar`, `progress`, `table`, `card`, `select`, `badge`, etc.) já estão instalados e configurados no projeto ou disponíveis no Shadcn CLI.
- Nenhuma funcionalidade de negócio das páginas existentes será alterada ou removida durante a adequação visual.
