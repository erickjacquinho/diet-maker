# Feature Specification: Revisão Completa dos Componentes e Aplicação do Design System

**Feature Branch**: `31-07-26-revisao-componentes-design-system`  
**Created**: 2026-07-31  
**Status**: Draft  
**Input**: User description: "crie um /sdd que revisa completamente os componentes, um a um e compara com as regras de design system. garanra que tudo está corretamente formatado, aplicado e estilizado de forma correta no projeto. itens como tabelas, textos e botoes ainda estado fora de design. entre em loop até concluir"

## Executive Summary

Este SDD define o plano e as especificações para uma revisão minuciosa, componente a componente e tela a tela, comparando todas as implementações com a fonte única da verdade em `design-system-guidelines/`. Foco prioritário na revisão e estilização semântica de **Tabelas**, **Tipografia/Textos**, **Botões**, **Inputs/Controles**, **Cards/Superfícies** e **Badges/Chips** para erradicação total de estilos ad-hoc ou fora das diretrizes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Padronização Visual de Tabelas e Listas de Dados (Priority: P1)

Como nutricionista/usuário do aplicativo, quero visualizar tabelas de alimentos, tabelas de refeições, listas de prescrições e tabelas nutricionais com cabeçalhos padronizados (`bg-surface-subtle`, `text-text-muted`, `text-style-legal`), bordas sutis (`border-border-subtle`), espaçamento de células uniforme e alternância de linhas semântica, sem uso de tabelas HTML não estilizadas ou com cores hardcoded.

**Why this priority**: As tabelas de alimentos, dietas e refeições representam a maior área de leitura e manipulação de dados de alta densidade no aplicativo.

**Independent Test**: Pode ser testado inspecionando visualmente e via testes unitários as tabelas em `/pacientes/[id]/dieta/[dietaId]`, `/alimentos`, `/receitas`, `/refeicoes-prontas` e `/presets`.

**Acceptance Scenarios**:
1. **Given** qualquer tabela de dados na aplicação, **When** renderizada na tela, **Then** o container possui `border border-border-subtle rounded-surface overflow-hidden`, os cabeçalhos usam `text-style-legal text-text-muted bg-surface-subtle` e as células usam tipografia semântica (`text-style-body` ou `text-style-body-compact`).
2. **Given** linhas de dados em uma tabela, **When** o cursor passa sobre a linha, **Then** o fundo altera suavemente para `bg-surface-hover` com transição `transition-colors`.

---

### User Story 2 - Uniformização da Tipografia e Hierarquia de Textos (Priority: P2)

Como usuário do aplicativo, quero que todos os títulos (`h1`, `h2`, `h3`), subtextos, rótulos e contadores numéricos consumam estritamente os contratos de Text Style do Design System (`display-hero`, `title-page`, `title-section`, `title-subsection`, `body-default`, `body-compact`, `legal-caption`, `chart-micro`), eliminando classes Tailwind arbitrárias como `text-[13px]`, `text-[11px]`, `font-black` ou `font-extrabold`.

**Why this priority**: A consistência tipográfica garante legibilidade profissional, hierarquia clara e previne poluição visual.

**Independent Test**: Testado verificando que todos os nós de texto em componentes e telas pertencem a um `textStyle` autorizado cadastrado no catálogo.

**Acceptance Scenarios**:
1. **Given** qualquer elemento de texto no app, **When** inspecionado, **Then** suas classes tipográficas mapeiam para um dos estilos de texto nomeados em `design-system-guidelines/05-typography-system.md`.

---

### User Story 3 - Auditoria e Refatoração de Botões e Controles Interativos (Priority: P3)

Como usuário do aplicativo, quero interagir com botões de ação (`Button`, `CreateButton`, `SecondaryActionButton`, `IconButton`, `EditIconButton`, `DeleteIconButton`, `Select`, `Input`) cujos tamanhos (`sm`, `md`, `lg`), pesos (`font-semibold`), estados de foco, hover e desabilitação sigam fielmente a recipe `recipes.button` e os componentes atômicos.

**Why this priority**: Botões e controles são as ferramentas fundamentais de tomada de ação do usuário.

**Independent Test**: Testado via suíte de testes de acessibilidade e estados (`tests/components/atoms/states.test.tsx` e `verify-design-system-legacy.mjs`).

**Acceptance Scenarios**:
1. **Given** qualquer botão na aplicação, **When** focado via teclado ou mouse, **Then** ele exibe o anel de foco semântico `ring-2 ring-focus-ring ring-offset-2`.
2. **Given** um botão em estado desabilitado, **When** renderizado, **Then** ele aplica `disabled:opacity-disabled disabled:pointer-events-none`.

---

### Edge Cases

- **Tabelas com Múltiplas Colunas em Viewports Compactos**: Como tabelas com muitas colunas se comportam? Devem possuir rolagem horizontal graciosa dentro do container `rounded-surface border border-border-subtle`.
- **Textos Longos e Truncamento**: Nomes de alimentos ou receitas longas devem utilizar `truncate` ou `line-clamp-2` mantendo a tipografia base.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A revisão DEVE passar componente a componente em `src/components/atoms/`, `src/components/molecules/`, `src/components/organisms/`, `src/components/ui/` e `src/app/`.
- **FR-002**: Todas as tabelas no aplicativo DEVEM ser refatoradas para utilizar containers semânticos `bg-surface border border-border-subtle rounded-surface` com células tipografadas via text styles autorizados.
- **FR-003**: Todos os textos DEVEM utilizar cores semânticas (`text-text-primary`, `text-text-secondary`, `text-text-muted`, `text-on-primary`, `text-on-success`) e escalas tipográficas oficiais, proibindo `text-gray-*`, `text-black` ou estilos inline.
- **FR-004**: Todos os botões DEVEM herdar `font-semibold` (`button-label` ou `button-label-compact`), altura e padding padronizados da recipe `recipes.button`, sem variações ad-hoc.
- **FR-005**: O processo DEVE rodar em um ciclo contínuo de verificação automatizada (`verify-design-system-legacy.mjs`, `audit-atomic-design.mjs`, `npx tsc --noEmit` e `npx vitest run`) até obter aprovação sem falhas em 100% dos componentes e telas.

### Key Entities

- **ComponentAuditEntry**: Objeto de verificação individual por componente especificando `componentName`, `category` ('atom' | 'molecule' | 'organism' | 'screen'), `designSystemCompliance` (boolean), `issuesFound` (array de strings) e `status` ('pending' | 'in_review' | 'compliant').

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos componentes atômicos, moleculares, orgânicos e páginas do app auditados e em conformidade total.
- **SC-002**: Script de verificação de legado `node scripts/verify-design-system-legacy.mjs` retorna 0 erros.
- **SC-003**: Pontuação no script de auditoria atômica `node scripts/audit-atomic-design.mjs` é mantida em >= 96%.
- **SC-004**: 0 erros de compilação TypeScript (`npx tsc --noEmit`) e 100% dos testes aprovados no Vitest (`npx vitest run`).

## Assumptions

- A pasta `design-system-guidelines/` é a ÚNICA fonte da verdade para componentes, esquemas e regras.
- As mudanças de revisão visual manterão todas as funcionalidades de negócio e estado da aplicação intocadas.
