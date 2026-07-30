# Especificação do Sistema: Implementação do Atomic Design System em Código React / Next.js

## 1. Visão Geral & Objetivo
Implementar em código TypeScript/React a biblioteca completa de componentes do **NutriDiet Design System**, construindo a base total da aplicação no projeto Next.js sob a arquitetura estrita do **Atomic Design (Brad Frost - Capítulo 2)**.

---

## 2. Atores, Papéis e Jornadas
- **Desenvolvedor Frontend**: Consome os componentes atômicos, moléculas, organismos e templates para construir novas telas rapidamente sem duplicação de código.
- **Nutricionista (Usuário Final)**: Interage com uma interface fluida, rápida, 100% acessível e visualmente harmoniosa baseada na estética Swiss Warm Minimalist.

---

## 3. Requisitos Funcionais (Atomic Design Levels)

### RF-01: Nível 1 - Átomos (`src/components/atoms/`)
- Implementar os 6 componentes atômicos primitivos baseados nos contratos de `design-system/nutridiet/components/atoms.md`:
  1. `Button` (`src/components/atoms/Button.tsx`) com variantes `primary`, `secondary`, `terracotta`, `ghost`, `danger` e tamanhos `sm`, `md`, `lg`.
  2. `Badge` (`src/components/atoms/Badge.tsx`) com variantes semânticas `emerald`, `rose`, `amber`, `teal`, `neutral`.
  3. `Input` (`src/components/atoms/Input.tsx`) com suporte a focus e placeholder customizados.
  4. `ProgressBar` (`src/components/atoms/ProgressBar.tsx`) com cálculo de porcentagem e atributos ARIA.
  5. `IconButton` (`src/components/atoms/IconButton.tsx`) com `aria-label` e ícones Lucide-React.
  6. `Avatar` (`src/components/atoms/Avatar.tsx`) com formato circular e suporte a iniciais.

### RF-02: Nível 2 - Moléculas (`src/components/molecules/`)
- Implementar componentes compostos por 2+ átomos baseados em `design-system/nutridiet/components/molecules.md`:
  1. `MacroMetricCard` (`src/components/molecules/MacroMetricCard.tsx`): Exibe valor, meta, % acumulada, métrica g/kg e barra de progresso.
  2. `MealItemRow` (`src/components/molecules/MealItemRow.tsx`): Exibe alimento com macros, gramagem e botão excluir.
  3. `PatientBadgeHeader` (`src/components/molecules/PatientBadgeHeader.tsx`): Exibe iniciais do paciente, nome, peso, meta e botão de ajuste.
  4. `TacoSearchInput` (`src/components/molecules/TacoSearchInput.tsx`): Input com ícone de busca para a base TACO.

### RF-03: Nível 3 - Organismos (`src/components/organisms/`)
- Implementar agrupadores funcionais complexos baseados em `design-system/nutridiet/components/organisms.md`:
  1. `SidebarNav` (`src/components/organisms/SidebarNav.tsx`): Navegação fixa lateral de 240px com perfil e ações de arquivo.
  2. `MacroTrackerHeader` (`src/components/organisms/MacroTrackerHeader.tsx`): Header mestre contendo PatientBadgeHeader e Grid de 4 MacroMetricCards.
  3. `MealCardContainer` (`src/components/organisms/MealCardContainer.tsx`): Container de refeição com lista de alimentos e busca.

### RF-04: Nível 4 - Templates (`src/components/templates/`)
- Implementar `DietBuilderTemplate` (`src/components/templates/DietBuilderTemplate.tsx`): Estrutura de layout de montagem de dieta agrupando Sidebar, TopActionBar, MacroTrackerHeader e Grid de MealCards.

### RF-05: Nível 5 - Páginas (`src/app/`)
- Atualizar a rota principal `src/app/page.tsx` para consumir o `DietBuilderTemplate`, removendo o código monolítico anterior.

---

## 4. Requisitos Não-Funcionais
- **RNF-01 (Strict Atomic Hierarchy)**: Nenhum componente atômico pode importar moléculas ou organismos.
- **RNF-02 (Zero Inline Styles / Zero Shadows)**: Respeito absoluto às regras do [MASTER.md](file:///c:/Programmer/diet-maker/design-system/nutridiet/MASTER.md).
- **RNF-03 (TypeScript Strict)**: Todas as props de componentes devem ter interfaces fortemente tipadas.

---

## 5. Critérios de Aceite e Sucesso
1. 100% dos componentes criados nas pastas `src/components/atoms`, `molecules`, `organisms`, `templates`.
2. `src/app/page.tsx` refatorada usando a nova arquitetura atômica.
3. Zero erros de compilação TypeScript e zero violações de acessibilidade/CSS.
