# Feature Specification: Adequação de 100% dos Componentes de Telas e Modais ao Design System Shadcn

**Feature Branch**: `29-07-26-adequacao-componentes-shadcn-ui`

**Created**: 29/07/2026

**Status**: Draft

**Input**: User description: "mapeie todos os arquivos de telas, modais, 100% do projeto em /src e crie um /sdd para adequar 100% dos componentes que cabem adequação, para nossos componentes ja criados derivados do shadcn."

## Executive Summary

O projeto Diet Maker possui 14 componentes base de UI criados sob `@/components/ui/` derivados do Shadcn/Radix (Button, Input, Select, Dialog, Sheet, Card, Badge, Table, Tabs, Tooltip, DropdownMenu, Popover, ScrollArea, Separator). No entanto, diversas telas e modais em `src/app` e componentes em `src/components/atoms`, `molecules`, `organisms` e `templates` ainda utilizam elementos HTML nativos (`<button>`, `<input>`, `<select>`, `<table`) ou overlays customizados (`fixed inset-0 z-50 flex items-center...`).

Esta especificação define a migração e adequação de 100% dos componentes de interface do usuário em `src/` para os componentes unificados do Shadcn UI, garantindo consistência visual, acessibilidade via Radix primitives, responsividade e manutenibilidade.

---

## User Scenarios & Testing

### User Story 1 - Padronização dos Modais e Overlays da Aplicação (Priority: P1)

Como usuário (nutricionista), desejo interagir com modais (cadastro de paciente, adição de alimentos TACO, modais de presets e refeições prontas, plano alimentar) que possuam comportamentos de acessibilidade consistentes (fechamento via ESC, foco preso no modal, overlay escurecido padrão e animações suaves).

**Why this priority**: Modais são a principal forma de interação do nutricionista ao cadastrar pacientes, alimentos e dietas. Modais customizados atuais carecem de gestão de foco e acessibilidade Radix.

**Independent Test**: Abrir os modais nas telas de Pacientes, Alimentos, Montador de Dieta, Presets e Refeições Prontas e verificar se respondem corretamente às teclas de atalho (ESC), acessibilidade de leitores de tela e fecham adequadamente ao clicar fora, usando o componente `Dialog` e `Sheet` do Shadcn.

**Acceptance Scenarios**:

1. **Given** o usuário na tela de Pacientes, **When** clica em "Novo Paciente", **Then** o formulário é exibido dentro de `Dialog` do Shadcn com overlay acessível e botão de fechar padronizado.
2. **Given** o usuário no Montador de Dieta, **When** abre a busca de alimentos TACO ou adição de refeição, **Then** o modal utiliza `Dialog` ou `Sheet` do Shadcn mantendo todo o estado reativo.

---

### User Story 2 - Substituição de Elementos de Formulário e Botões Nativos por Componentes Shadcn (Priority: P2)

Como usuário, desejo visualizar botões, campos de texto, seletores dropdown e badges com estilo unificado em todas as telas da aplicação.

**Why this priority**: Garante que nenhum elemento de tela fique com estilos desalinhados do design system visual.

**Independent Test**: Navegar por todas as páginas (`/alimentos`, `/pacientes`, `/pacientes/[id]`, `/pacientes/[id]/dieta/[dietaId]`, `/presets`, `/refeicoes-prontas`) e validar que todos os botões e inputs utilizam as variantes e estados (`hover`, `focus`, `disabled`, `loading`) dos componentes `Button`, `Input`, `Select` e `Badge` de `@/components/ui/`.

**Acceptance Scenarios**:

1. **Given** qualquer campo de busca ou formulário nas telas em `src/app`, **When** renderizado, **Then** utiliza o componente `Input` ou `Select` de `@/components/ui/` ao invés de tags nativas HTML.
2. **Given** qualquer botão de ação (salvar, cancelar, deletar, filtrar, alternar aba), **When** renderizado, **Then** utiliza o componente `Button` com a variante correspondente (`default`, `secondary`, `outline`, `destructive`, `ghost`).

---

### User Story 3 - Adequação e Unificação dos Componentes Atômicos e Estruturais (Priority: P3)

Como desenvolvedor e designer de sistemas, desejo que a estrutura de componentes em `src/components/atoms`, `molecules` e `organisms` estenda diretamente os primitivos do Shadcn sem duplicação de lógica.

**Why this priority**: Evita componentes legados redundantes (`atoms/Button.tsx`, `atoms/Input.tsx`, `atoms/Badge.tsx`) competindo com `components/ui/*`.

**Independent Test**: Verificar se a importação em toda a base de código aponta de forma transparente e limpa para os componentes unificados do Shadcn UI sem quebrar funcionalidades existentes.

**Acceptance Scenarios**:

1. **Given** os componentes legados em `src/components/atoms/`, **When** refatorados, **Then** reexportam ou adaptam o Shadcn UI mantendo compatibilidade total de API onde necessário.
2. **Given** os cartões e tabelas (`MacroMetricCard`, `MealCardContainer`, `tabela TACO`), **When** renderizados, **Then** utilizam os primitivos `Card` e `Table` de `@/components/ui/`.

---

## Edge Cases

- **Modais com conteúdos dinâmicos muito extensos**: Garantir que `DialogContent` envolva conteúdos com `ScrollArea` do Shadcn para evitar overflow de tela em monitores menores.
- **Inputs controlados com estado local em tabelas**: Garantir que a troca de `<input>` por `Input` preserve handlers de `onChange`, `onKeyDown` e seleções rápidas de texto.
- **Seletor Select nativo vs Select Radix**: Tratar casos onde `<select>` nativo aceitava strings diretas e o `Select` do Shadcn exige `<SelectTrigger>`, `<SelectValue>`, `<SelectContent>` e `<SelectItem>`.

---

## Requirements

### Functional Requirements

- **FR-001**: O sistema MUST utilizar o componente `Dialog` de `@/components/ui/dialog` para todos os modais da aplicação (`/pacientes`, `/alimentos`, `/pacientes/[id]`, `/pacientes/[id]/dieta/[dietaId]`, `/presets`, `/refeicoes-prontas`), eliminando overlays customizados `fixed inset-0`.
- **FR-002**: O sistema MUST utilizar o componente `Button` de `@/components/ui/button` em todas as ações clicáveis, substituindo tags `<button>` nativas e unificando o `atoms/Button.tsx` e `atoms/IconButton.tsx`.
- **FR-003**: O sistema MUST utilizar o componente `Input` de `@/components/ui/input` em todos os formulários e buscas, substituindo tags `<input>` nativas e unificando o `atoms/Input.tsx`.
- **FR-004**: O sistema MUST utilizar o componente `Select` de `@/components/ui/select` em substituição a tags `<select>` nativas em formulários de paciente, categorias de alimentos e seletores de refeição.
- **FR-005**: O sistema MUST utilizar o componente `Card` (`CardHeader`, `CardTitle`, `CardContent`) de `@/components/ui/card` em todos os contêineres de métricas, listas de refeições e cartões de pacientes.
- **FR-006**: O sistema MUST utilizar o componente `Badge` de `@/components/ui/badge` em substituição a tags com badges customizados e `atoms/Badge.tsx`.
- **FR-007**: O sistema MUST utilizar o componente `Table` (`TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell`) de `@/components/ui/table` para a exibição da tabela de alimentos TACO em `/alimentos`.
- **FR-008**: O sistema MUST utilizar o componente `Sheet` de `@/components/ui/sheet` para gavetas laterais de navegação e filtros mobile em `SidebarNav.tsx`.

---

## Key Entities

- **Mapeamento de UI Módulo a Módulo**:
  - `src/app/alimentos/page.tsx`: Tabela TACO + Modal Criar/Editar Alimento Customizado.
  - `src/app/pacientes/page.tsx`: Lista de Pacientes + Modal Novo Paciente.
  - `src/app/pacientes/[id]/page.tsx`: Detalhes + Modal Novo Plano.
  - `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx`: Montador de Dieta + Modais Adicionar Refeição, Busca TACO, Edição de Porção.
  - `src/app/presets/page.tsx`: Presets + Modal Criar Preset.
  - `src/app/refeicoes-prontas/page.tsx`: Refeições Prontas + Modal Criar Refeição.
  - `src/components/atoms/`: Button, Input, Badge, IconButton, Avatar, ProgressBar.
  - `src/components/molecules/`: MacroMetricCard, MealItemRow, PatientBadgeHeader, TacoSearchInput.
  - `src/components/organisms/`: MacroTrackerHeader, MealCardContainer, SidebarNav.
  - `src/components/templates/`: AppLayoutShell, DietBuilderTemplate.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% dos arquivos em `src/app` e `src/components` utilizam componentes Shadcn UI (`@/components/ui/*`) para botões, inputs, modais, selects, cartões e tabelas, com zero ocorrências de tags HTML brutas `<button>`, `<input>`, `<select>` ou modais div `fixed inset-0` fora da biblioteca UI base.
- **SC-002**: 100% das páginas mantêm suas funcionalidades funcionais existentes sem regressão visual ou comportamental.
- **SC-003**: 100% das sobreposições de telas atendem aos padrões de acessibilidade (foco acessível e fechamento por atalho de teclado).

---

## Assumptions

- Todos os 14 componentes requeridos do Shadcn UI já estão instalados e disponíveis em `src/components/ui/`.
- A estilização do Tailwind CSS e tokens de design em `src/design-system/tokens.ts` e `src/app/globals.css` são compatíveis com os temas dos componentes do Shadcn.
