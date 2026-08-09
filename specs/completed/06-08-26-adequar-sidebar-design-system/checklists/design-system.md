# Design System Requirements Quality Checklist: Adequação da Sidebar ao Design System

**Purpose**: Validar se a especificação usa as fontes normativas do Design System e não cria regras visuais locais sem decisão.
**Created**: 2026-08-06
**Feature**: [spec.md](../spec.md) · [design-system/README.md](../../../design-system/README.md)

## Canonical Tokens and Geometry

- [x] CHK001 As larguras 224px/64px, border-right, spacing, radius, icon size 16px e altura de submenu 36px são mensuráveis e atribuídas a tokens/perfis? [Measurability, Spec §FR-002–FR-005, FR-018]
- [x] CHK002 A especificação proíbe valores utilitários locais para geometria sem proibir os casos documentados pelo Design System? [Consistency, Spec §FR-004, Assumptions]
- [x] CHK003 A regra de novos tokens exige decisão de governança e atualização do registry, em vez de permitir uma exceção silenciosa? [Governance, Spec §NFR-005]
- [x] CHK004 O tema claro e a ausência de mobile/tablet/dark mode estão registrados como limites da feature? [Scope, Spec §FR-001, Out of Scope]

## Component and Atomic Boundaries

- [x] CHK005 A especificação distingue primitivo genérico em `src/components/ui` de moléculas, organismo, template e adaptador da aplicação? [Architecture, Spec §FR-019, NFR-003]
- [x] CHK006 O requisito impede que a camada `ui` conheça rotas, texto de conta, callbacks de produto ou ações locais? [Completeness, Spec §FR-019]
- [x] CHK007 A composição real, exports, sources, consumers e primitive base são exigidos no catálogo? [Traceability, Spec §FR-020, SC-009]
- [x] CHK008 A correção de perfil/registry é limitada aos componentes diretamente afetados, sem abrir escopo para dívida visual não relacionada? [Scope, Spec §Out of Scope, NFR-005]

## Typography, Icons and Motion

- [x] CHK009 Brand, group label, navigation, compact actions e submenu têm papéis tipográficos diferenciados e não são reduzidos a “texto legível”? [Clarity, Spec §FR-006]
- [x] CHK010 Ícones de 16px são exigidos por requisito, incluindo ícones de rota, ações, submenu e affordance de chevron? [Completeness, Spec §FR-005]
- [x] CHK011 Reduced motion especifica o que é reduzido e o que deve continuar perceptível, evitando a interpretação de remover todo feedback? [Consistency, Spec §FR-007, NFR-004]

## States, Accessibility and Evidence

- [x] CHK012 Os estados collapsed/expanded, hover/focus/current/disabled e callback presente/ausente estão descritos com resultado observável? [Coverage, Spec §FR-007–FR-012]
- [x] CHK013 A exigência de manual review para geometria, foco, clipping, motion e apresentação acessível está separada dos gates automatizados? [Evidence, Spec §NFR-004, FR-022]
- [x] CHK014 Os critérios de sucesso indicam zero findings bloqueantes, mas não confundem gates de código com conformidade visual final? [Measurability, Spec §SC-008]
- [x] CHK015 As fontes normativas do Design System e a decisão para valores ausentes estão referenciadas como dependência do plano? [Dependency, Spec §Assumptions, NFR-005]

## Validation Result

Os itens estão satisfeitos como qualidade de requisito e serão usados como entrada para o plano e para a análise de consistência entre os artefatos.
