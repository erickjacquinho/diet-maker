# Feature Specification: Adequação da Tipografia da Sidebar ao Design System

**Feature Branch**: `specs/07-08-26-adequar-sidebar-tipografia`

**Created**: 2026-08-07

**Status**: Draft

**Input**: User description: "Adequar a tipografia do sidebar ao Design System adicionando font-semibold ao menu button inativo conforme contrato nav-item em 05-typography-system.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Legibilidade e Presença Visual no Menu Lateral (Priority: P1)

Como usuário navegando no sistema, desejo que os itens inativos do menu lateral tenham presença visual nítida e legibilidade adequada sem parecerem finos ou apagados, respeitando o contrato tipográfico `nav-item` do Design System.

**Why this priority**: É a necessidade central de UX identificada na auditoria visual e atende diretamente ao contrato formal de tipografia do projeto.

**Independent Test**: Pode ser testado visualmente inspecionando qualquer botão do menu lateral no estado inativo e verificando o peso de fonte `600 (font-semibold)`.

**Acceptance Scenarios**:

1. **Given** a aplicação aberta com a sidebar visível, **When** os itens de menu estão no estado inativo (padrão), **Then** a fonte do texto exibe o peso de fonte semibold (`600`) alinhado ao token `nav-item`.
2. **Given** um item de menu ativo, **When** a rota atual corresponde ao link, **Then** o item mantém a estilização ativa (fundo soft e cor primária) sem quebras de layout ou desalinhamentos.

---

### User Story 2 - Conformidade com os Contratos do Design System (Priority: P2)

Como desenvolvedor ou auditor de UI, desejo que todos os componentes da sidebar estejam em 100% de conformidade com o catálogo tipográfico (`05-typography-system.md`), sem utilitários ad-hoc ou desalinhamento com `text-styles.ts`.

**Why this priority**: Evita regressões tipográficas e mantém a integridade do Design System do projeto.

**Independent Test**: Pode ser verificado auditando o JSX de `SidebarMenuButton` e executando a suite de testes automatizados do sistema.

**Acceptance Scenarios**:

1. **Given** os estilos de texto em `text-styles.ts`, **When** o componente `SidebarMenuButton` é renderizado, **Then** o contrato `nav-item` (`13px/18px`, `font-semibold`) é respeitado integralmente.

---

### Edge Cases

- Como o componente se comporta no estado recolhido (`collapsed`)? O texto fica oculto (`sr-only`) e o tooltip preserva a acessibilidade do rótulo sem afetação visual.
- Como o peso `font-semibold` afeta a largura dos botões em telas pequenas? Com a propriedade `truncate`, o texto trunca graciosamente com reticências sem extrapolar a largura do rail de 224px.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O componente `SidebarMenuButton` MUST aplicar o peso `font-semibold` (`600`) no estado padrão/inativo de todos os botões do menu da sidebar.
- **FR-002**: O tamanho da fonte e altura de linha de `SidebarMenuButton` MUST corresponder à escala `text-style-nav-item` (`13px/18px`).
- **FR-003**: O estado ativo (`data-[active=true]`) MUST preservar a indicação visual de seleção com fundo soft (`bg-sidebar-primary-soft`) e texto de ação (`text-sidebar-primary`).
- **FR-004**: O componente `SidebarMenuSubButton` MUST manter a consistência de peso e contrato tipográfico aplicável.

### Key Entities

- **SidebarMenuButton**: Componente de primitiva UI em `src/components/ui/sidebar.tsx` responsável pela renderização dos botões interativos do menu lateral.
- **TextStyleContract (nav-item)**: Contrato tipográfico em `src/design-system/text-styles.ts` que estabelece a combinação de tamanho (`13px`), line-height (`18px`) e peso (`600`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos botões de menu inativos da sidebar exibem o peso `600` (`font-semibold`) via CSS computado no navegador.
- **SC-002**: Zero erros ou regressões em testes automatizados e suíte Vitest após o ajuste.
- **SC-003**: 100% de conformidade com a regra de tipografia de `05-typography-system.md`.

## Assumptions

- A família de fonte `Plus Jakarta Sans` já possui todas as variantes de peso necessárias (400, 500, 600, 700) carregadas na aplicação.
- A alteração restringe-se aos estilos do componente `SidebarMenuButton` em `src/components/ui/sidebar.tsx` e não impacta APIs externas.
