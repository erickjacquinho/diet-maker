# Requirements Checklist: Avaliação física com cálculo US Navy

**Purpose**: Confirmar que a especificação está completa, clara e pronta para execução.
**Created**: 2026-08-05
**Feature**: [spec.md](../spec.md)

## Completeness

- [x] O escopo cobre criação e edição do diálogo.
- [x] Todos os campos solicitados estão listados e ordenados.
- [x] Pescoço está posicionado antes de Escápula.
- [x] O cálculo masculino e feminino está definido.
- [x] Massa gorda e massa magra têm fórmulas definidas.
- [x] Dados legados e campos ausentes têm comportamento definido.

## Quality

- [x] Resultados derivados são somente leitura.
- [x] Entradas inválidas bloqueiam persistência com mensagem contextual.
- [x] A fórmula fica em função reutilizável, fora da interface.
- [x] Há critérios de sucesso mensuráveis e testes correspondentes.
- [x] Atomic Design, Shadcn preservation e design system estão cobertos.

## Notes

Todos os requisitos conhecidos foram confirmados na conversa e no design aprovado antes da execução.

## Requirement Quality Validation

- [x] CHK001 — Os dois fluxos P1 possuem atores, objetivo, prioridade e teste independente? [Completeness, Spec §User Scenarios & Testing]
- [x] CHK002 — A ordem completa dos campos e as unidades de entrada estão explicitamente documentadas? [Clarity, Spec §FR-001–FR-002]
- [x] CHK003 — As equações masculina e feminina identificam medidas, conversão de unidade e regra de gênero sem ambiguidade? [Clarity, Spec §FR-003–FR-004]
- [x] CHK004 — As fórmulas de massa gorda e massa magra são consistentes entre requisitos, entidades e critérios de sucesso? [Consistency, Spec §FR-005]
- [x] CHK005 — Os estados de erro, bloqueio de salvamento e recuperação de avaliação legada estão especificados? [Scenario Coverage, Spec §FR-008–FR-010]
- [x] CHK006 — O contrato de somente leitura dos resultados derivados está definido sem confundir leitura com campo desabilitado? [Clarity, Spec §FR-006]
- [x] CHK007 — O requisito de cálculo reutilizável está distinguido do contrato visual do diálogo? [Consistency, Spec §FR-007 e FR-011]
- [x] CHK008 — Os critérios de sucesso são verificáveis e cobrem os dois ramos da equação e dados legados? [Measurability, Spec §SC-001–SC-005]
- [x] CHK009 — Os limites de gênero, medidas ausentes, valores não positivos e circunferências inválidas estão cobertos como casos-limite? [Edge Cases]
- [x] CHK010 — As suposições sobre altura do cadastro, persistência local, compatibilidade e escopo desktop estão registradas? [Dependencies & Assumptions, Spec §Assumptions]
