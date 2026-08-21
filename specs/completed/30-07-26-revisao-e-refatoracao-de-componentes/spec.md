# Feature Specification: Revisão e Refatoração de Componentes e src/app

**Feature Branch**: `specs/30-07-26-revisao-e-refatoracao-de-componentes`

**Created**: 2026-07-30

**Status**: Draft

**Input**: User description: "Vercel Composition Patterns & Code Reviewer Expert: revisar todos os componentes, fundir/minimizar o número de componentes duplicados ou fragmentados e adequar 100% dos arquivos de src/app"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consolidação e Merge de Átomos de UI (Priority: P1)

Como desenvolvedor do NutriDiet Pro Local, quero consolidar componentes átomos redundantes e duplicados (ex: unificar `IconButton` em `Button.tsx` e integrar os estilos do `Badge.tsx` com `cva` no `ui/badge.tsx`) para reduzir o número de arquivos na árvore de componentes e padronizar o design system.

**Why this priority**: Reduz complexidade de manutenção, elimina duplicidade entre a camada `atoms/` e `ui/`, e garante uma API limpa de componentes base.

**Independent Test**: Pode ser testado executando a suíte de testes de componentes (`Button.test.tsx`, `IconButton.test.tsx`, etc.) e verificando que a renderização dos botões, ícones de ação e badges permanece 100% funcional em todas as páginas sem quebra visual.

**Acceptance Scenarios**:

1. **Given** um botão de ação com ícone (`EditIconButton`, `DeleteIconButton`, `CreateButton`), **When** utilizado em qualquer tela do app, **Then** ele renderiza com a API unificada baseada em `Button`, mantendo acessibilidade (`aria-label`), variante visual e interatividade.
2. **Given** o componente `Badge`, **When** utilizado com as variantes de cores nutricionais (`emerald`, `rose`, `amber`, `teal`, `blue`), **Then** ele utiliza as variantes nativas baseadas no `cva` do `components/ui/badge.tsx`, sem a necessidade de wrappers redundantes.

---

### User Story 2 - Composição de Componentes na Sidebar e Navegação (Priority: P2)

Como desenvolvedor, quero refatorar a estrutura do menu lateral (`SidebarNav`) aplicando *Vercel Composition Patterns* (Compound Components) para eliminar arquivos fragmentados de uso único (`SidebarBrand`, `SidebarNavItem`, `SidebarUserProfile`, `SidebarQuickActions`) e evitar proliferação de boolean props.

**Why this priority**: A sidebar possui 4 subcomponentes em `molecules/` usados unicamente dentro de `SidebarNav`. Aplicar o padrão Compound Component (`SidebarNav.Brand`, `SidebarNav.Item`, etc.) simplifica a hierarquia e melhora a coesão.

**Independent Test**: Pode ser testado navegando entre todas as rotas da aplicação (`/pacientes`, `/presets`, `/receitas`, `/alimentos`, etc.) e alternando o estado colapsado/expandido do menu lateral.

**Acceptance Scenarios**:

1. **Given** a sidebar da aplicação, **When** o usuário alterna o botão de expandir/recolher, **Then** todos os itens compostos ajustam seu estado e visibilidade sem vazamento de props ou inconsistência visual.

---

### User Story 3 - Adequação de 100% das Páginas em `src/app` (Priority: P3)

Como desenvolvedor e nutricionista usuário do sistema, quero que todas as páginas contidas em `src/app` façam uso padronizado dos componentes consolidados do Design System, eliminando elementos de formulário inline não padronizados e garantindo tratamento de erros e tipagem estrita TypeScript.

**Why this priority**: Garante que o frontend seja 100% coeso em todas as rotas (`/pacientes`, `/pacientes/[id]`, `/pacientes/[id]/consulta/[date]`, `/pacientes/[id]/dieta/[dietaId]`, `/alimentos`, `/presets`, `/receitas`, `/refeicoes-prontas`, `/design-system`).

**Independent Test**: Pode be testado abrindo e interagindo com cada uma das páginas da pasta `src/app`, verificando ausencia de erros no console, ausência de warnings do React e validação de formulários.

**Acceptance Scenarios**:

1. **Given** a rota `/pacientes` ou subrotas de consulta/dieta, **When** o usuário interage com listagens, modais e seletores, **Then** a interface responde de forma fluida utilizando os componentes refatorados do design system.

---

### Edge Cases

- O que acontece se um componente refatorado receber props legadas? Deve haver compatibilidade ou depreciação limpa sem quebrar testes existentes.
- O que acontece se a sidebar for colapsada em telas pequenas (mobile)? O layout responsivo deve manter a acessibilidade e o correto fechamento/expansão.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST unificar `IconButton` e suas variantes explícitas (`EditIconButton`, `DeleteIconButton`) dentro do módulo `Button.tsx`, re-exportando para manter retrocompatibilidade.
- **FR-002**: O sistema MUST migrar o suporte de cores e variantes de `components/atoms/Badge.tsx` diretamente para as variantes `cva` de `components/ui/badge.tsx`.
- **FR-003**: O sistema MUST unificar ou descontinuar wrappers triviais de 1 linha (como `components/atoms/Input.tsx`) em prol dos primitivos UI padronizados (`components/ui/input.tsx`).
- **FR-004**: O sistema MUST aplicar o padrão *Compound Components* (Vercel Composition Patterns) na `SidebarNav` para gerenciar estado compartilhado de navegação e colapso de forma explícita.
- **FR-005**: O sistema MUST adequar todas as páginas em `src/app` (`alimentos`, `design-system`, `pacientes`, `presets`, `receitas`, `refeicoes-prontas`) para utilizar a biblioteca unificada de componentes, seguindo as diretrizes do `code-reviewer-expert` (tipagem estrita sem `any`, sem mutação direta de estado, com gerenciamento correto de keys).

### Key Entities

- **Design System Token & Primitive**: Conjunto de tokens visuais e componentes atômicos (`Button`, `Badge`, `Card`, `Dialog`, `Input`) que formam a linguagem de interface do NutriDiet.
- **SidebarNav Compound Component**: Estrutura composta de navegação lateral contendo Brand, Items, Profile e QuickActions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Redução do número de arquivos de componentes atômicos/moleculares duplicados em pelo menos 25% através do merge de componentes.
- **SC-002**: 100% dos testes unitários existentes em `src/components/**/__tests__` e `src/lib/__tests__` executando com sucesso e zero falhas após as refatorações.
- **SC-003**: Zero avisos de depreciação de props ou violações de regras do React (como keys ausentes ou tipagem `any`) em 100% das rotas de `src/app`.

## Assumptions

- Todos os componentes do projeto utilizam React 19 / Next.js App Router e Tailwind CSS com as classes personalizadas do tema `warm-`.
- A API pública de importação via `@/components/atoms` e `@/components/molecules` deve permanecer funcionando através de re-exports ou aliases para não quebrar código de terceiros.
