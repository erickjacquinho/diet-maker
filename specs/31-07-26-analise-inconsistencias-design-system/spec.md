# Feature Specification: Análise de Inconsistências do Design System em Todas as Telas

**Feature Branch**: `31-07-26-analise-inconsistencias-design-system`  
**Created**: 2026-07-31  
**Status**: Draft  
**Input**: User description: "crie um sdd de analise em busca de inconsistências em relação ao design system atual em todas as telas do app"

## Executive Summary

Este SDD define o escopo, requisitos e matriz de verificação para uma auditoria completa e sistemática em **todas as telas e fluxos de usuário** da aplicação `diet-maker`, com o objetivo de identificar e catalogar 100% das inconsistências visuais, estruturais, tipográficas, cromáticas e de componentes em relação ao Design System canônico (`design-system-guidelines/`).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Auditoria de Telas Principais do Sistema (Priority: P1)

Como desenvolvedor/designer do projeto, quero auditar todas as telas primárias (`/pacientes`, `/pacientes/[id]`, `/pacientes/[id]/consulta/[date]`, `/pacientes/[id]/dieta/[dietaId]`, `/alimentos`, `/receitas`, `/refeicoes-prontas`, `/presets`, `/design-system`), garantindo que nenhuma tela apresente cores hardcoded, tipografia fora dos contratos nomeados (`textStyle`), cantos arredondados não autorizados ou botões incompatíveis com a fonte única da verdade.

**Why this priority**: Garantir coerência visual imediata em todas as rotas ativas do produto para que a experiência do usuário seja totalmente alinhada ao novo Design System.

**Independent Test**: Pode ser verificado independentemente rodando os scripts de auditoria automatizados (`node scripts/verify-design-system-legacy.mjs` e `node scripts/audit-atomic-design.mjs`) e inspecionando o mapa de telas de cada rota.

**Acceptance Scenarios**:
1. **Given** a execução da ferramenta de auditoria de legado, **When** inspecionada qualquer rota ativa em `src/app/`, **Then** o relatório deve listar zero infrações de tokens legados (`warm-*`, `emerald-*`, `font-black`, `rounded-2xl`, etc.).
2. **Given** qualquer componente visual em uma rota primária, **When** renderizado, **Then** ele deve consumir as recipes ou tokens do módulo `@/design-system` ou componentes atômicos padronizados.

---

### User Story 2 - Auditoria de Modais, Overlays e Diálogos (Priority: P2)

Como usuário do sistema, quero interagir com modais e overlays (ex: `FoodSearchModal`, `ReadOnlyDietModal`, modais de descarte, de escala de calorias, de cópia de refeições e de compartilhamento de texto), garantindo que sua estrutura de card, títulos, botões de ação e campos de busca estejam 100% harmonizados.

**Why this priority**: Modais e overlays representam pontos críticos de interação e tomada de decisão durante a prescrição nutricional.

**Independent Test**: Pode ser testado abrindo cada modal em telas de pacientes/dietas/presets/receitas e verificando a aplicação dos tokens de superfície (`bg-surface`), borda (`border-border-subtle`), botões (`variant="primary"|"secondary"|"quiet"`) e controle de foco.

**Acceptance Scenarios**:
1. **Given** um modal ativado pelo usuário, **When** ele aparece na tela, **Then** o container utiliza `bg-surface`, `border-border-subtle`, `rounded-surface` e os botões seguem os tamanhos e tipografias padronizadas.

---

### User Story 3 - Auditoria do Catálogo Documental e Registry (Priority: P3)

Como mantenedor da arquitetura, quero garantir que a página interna do Design System (`/design-system`) reflita honestamente a contagem de categorias, componentes, lifecycle, recipes e text styles do catálogo oficial.

**Why this priority**: A página de documentação viva é o espelho do Design System e deve ter alinhamento total com `design-system-guidelines/components/registry.json`.

**Independent Test**: Pode ser testado navegando até `/design-system` e rodando a suíte de testes de rota `tests/routes/design-system-page.test.tsx`.

**Acceptance Scenarios**:
1. **Given** o catálogo `registry.json`, **When** a página `/design-system` é carregada, **Then** todos os componentes, categorias e estatísticas batem exatamente com o arquivo de contrato.

---

### Edge Cases

- **Telas com dados vazios (Empty States)**: Como o sistema se comporta visualmente quando um catálogo não possui itens? (Ex: presets vazios, receitas vazias). O container de empty state deve utilizar os cartões e tipografias do Design System.
- **Componentes legados reutilizados em sub-fluxos**: Qualquer subcomponente interno que utilize inline styles ou utilitários Tailwind arbitrários deve ser capturado na auditoria.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema de análise DEVE inspecionar 100% dos arquivos JSX/TSX nas pastas `src/app/`, `src/components/` e `src/design-system/`.
- **FR-002**: A análise DEVE verificar o uso de cores, garantindo que não existam classes de paleta antiga (`warm-card`, `warm-border`, `warm-charcoal`, `warm-muted`, `warm-emerald`, `emerald-700`, `amber-600`, etc.) nem cores hexadecimais brutas.
- **FR-003**: A análise DEVE verificar o uso de pesos tipográficos e estilos, garantindo que os rótulos de botões utilizem exclusivamente `font-semibold` (`button-label` ou `button-label-compact`) sem overrides arbitrários (`font-black`, `font-bold`, `text-xs font-bold`).
- **FR-004**: A análise DEVE verificar o uso de border-radius, exigindo tokens canônicos (`rounded-surface`, `rounded-control`, `rounded-compact` ou exceção cadastrada `rounded-full`) e barrando valores legados (`rounded-2xl`, `rounded-xl`).
- **FR-005**: A análise DEVE validar que todos os botões de ação nas telas consumam os componentes padronizados (`Button`, `CreateButton`, `SecondaryActionButton`, `IconButton`, `EditIconButton`, `DeleteIconButton`) ou a recipe `recipes.button`.
- **FR-006**: O relatório final da análise DEVE classificar o resultado por rota/tela e por categoria de inconsistência (Cores, Tipografia, Radius, Componentes, Layout/Breakpoints).

### Key Entities

- **AuditFinding**: Entidade de resultado da auditoria contendo `filePath`, `lineNumber`, `ruleId` (ex: `LEG001`, `LEG002`, `LEG003`, `LEG004`, `LEG005`, `LEG006`), `severity` ('error' | 'warning'), `foundValue` e `suggestedToken`.
- **ScreenAuditReport**: Relatório consolidado agrupando os achados por rota da aplicação (`/pacientes`, `/pacientes/[id]`, `/pacientes/[id]/consulta/[date]`, `/pacientes/[id]/dieta/[dietaId]`, `/alimentos`, `/receitas`, `/refeicoes-prontas`, `/presets`, `/design-system`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das 10 rotas ativas do aplicativo auditadas sem omissão de telas.
- **SC-002**: O script de verificação de legado `node scripts/verify-design-system-legacy.mjs` reporta exatamente 0 infrações em todos os 69 arquivos inspecionados.
- **SC-003**: 100% dos testes da suíte Vitest (`npx vitest run`, 30/30 arquivos) executam com aprovação total.
- **SC-004**: Verificação de tipos com `npx tsc --noEmit` resulta em 0 erros em todo o código fonte.

## Assumptions

- A pasta `design-system-guidelines/` é a ÚNICA fonte da verdade para a documentação, diretrizes e esquemas do Design System.
- O produto é desenhado desktop-first (viewport primário >= 1024px), dispensando utilitários móveis/tablets desnecessários conforme a regra `LEG006`.
- Todas as refatorações decorrentes do plano de análise manterão as funcionalidades e o comportamento do aplicativo 100% inalterados.
