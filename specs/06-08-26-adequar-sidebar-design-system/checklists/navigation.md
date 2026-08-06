# Navigation Requirements Quality Checklist: Adequação da Sidebar ao Design System

**Purpose**: Validar a completude e a precisão dos requisitos de navegação, contexto de rota, estados ativos e acesso por teclado.
**Created**: 2026-08-06
**Feature**: [spec.md](../spec.md) · [sidebar-navigation.md](../contracts/sidebar-navigation.md)

## Navigation Model Completeness

- [x] CHK001 O requisito diferencia explicitamente rotas de primeiro nível, grupos futuros e itens filhos? [Completeness, Spec §FR-016–FR-018]
- [x] CHK002 A preservação das seis rotas atuais inclui ordem, labels e URLs, e não apenas “continuidade” genérica? [Clarity, Spec §FR-016, SC-001]
- [x] CHK003 O comportamento de pathname vazio, desconhecido, nested/patient route e item sem correspondência está definido? [Edge Case Coverage, Spec §Edge Cases]
- [x] CHK004 O requisito de grupo vazio define a ausência de disclosure/surface vazia? [Edge Case Coverage, Spec §FR-018]

## Active and Disclosure State

- [x] CHK005 O estado current de rota é definido programática e visualmente, sem depender apenas de cor? [Accessibility, Spec §FR-008, User Story 3]
- [x] CHK006 O requisito diferencia current child, ancestor discoverability e expanded/collapsed state do grupo? [Clarity, Spec §FR-017]
- [x] CHK007 O comportamento de grupo no collapsed state possui caminho acessível documentado, sem assumir que esconder texto equivale a esconder navegação? [Coverage, Spec §User Story 1, Edge Cases]
- [x] CHK008 A altura de subitem de 36px e o foco correto estão quantificados e não dependem de um valor local indefinido? [Measurability, Spec §Clarifications, FR-018]

## Application Boundary and Shell

- [x] CHK009 A especificação identifica o adaptador como dono do pathname e do modelo de produção, separando-o do organismo? [Architecture Boundary, Spec §Clarifications, FR-015–FR-016]
- [x] CHK010 A remoção de `usePathname` do organismo possui critério verificável e contrato de props correspondente? [Traceability, Spec §FR-015, SC-007]
- [x] CHK011 O shell mantém sidebar persistente, main scroll independente e skip link com target definido? [Completeness, Spec §FR-013–FR-014]
- [x] CHK012 O requisito explicita que a ausência do adapter não deve fazer o organismo inventar rota de produção ou ler contexto diretamente? [Edge Case, Spec §Edge Cases, FR-015]

## Accessibility and Keyboard Coverage

- [x] CHK013 Os requisitos cobrem keyboard operation, semantic role/name/value, focus ring, `aria-current`/expanded e não dependência de cor? [Accessibility, Spec §FR-008, NFR-003]
- [x] CHK014 O skip link tem texto, target, comportamento de foco e estado visual definidos? [Clarity, Spec §Clarifications, FR-013, SC-006]
- [x] CHK015 O suporte a reduced motion é definido para rail, controls, chevron, tooltip e popover, sem desabilitar estado ou foco? [Coverage, Spec §FR-007, SC-004]
- [x] CHK016 Os limites de Ctrl/Cmd+B e de persistência são explicitamente negativos, evitando que uma implementação futura seja inferida nesta entrega? [Consistency, Spec §NFR-001, Out of Scope]

## Validation Result

Os itens estão satisfeitos como qualidade de requisito; a confirmação de comportamento será executada apenas na fase de implementação e validação manual prevista no `quickstart.md`.
