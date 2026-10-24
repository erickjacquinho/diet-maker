# UX Requirements Checklist: Início e placeholders

**Purpose**: revisão dos requisitos de navegação, dados existentes, placeholders e limites.
**Created**: 2026-10-23
**Feature**: [spec.md](../spec.md)
**Audience**: autor e revisor antes da implementação; profundidade padrão.

## Completude e clareza

- [x] CHK001 A prioridade entre rotina e conta está definida? [Clareza, Spec §FR-001]
- [x] CHK002 A semana tem início, fim, calendário local e regra de atualização definidos? [Completude, Spec §FR-002, Edge Cases]
- [x] CHK003 O intervalo, a ordenação e os campos das próximas ações estão definidos? [Clareza, Spec §FR-003]
- [x] CHK004 Os tipos, datas independentes e registros legados estão delimitados? [Cobertura, Spec §FR-004]
- [x] CHK005 Há distinção entre acompanhamentos, lembretes e consultas? [Consistência, Spec §FR-004, Contexto e limites]
- [x] CHK006 O destino único de assinatura e o significado de recorrência estão explícitos? [Clareza, Spec §FR-007, Contexto e limites]

## Estados e recuperação

- [x] CHK007 Os cinco estados de rotina e a recuperação de erro estão descritos? [Cobertura, Spec §FR-006]
- [x] CHK008 O comportamento sem arquivo autorizado está definido sem confundi-lo com vazio? [Completude, Spec §FR-005]
- [x] CHK009 Troca, fechamento, bloqueio e respostas antigas têm tratamento documentado? [Cobertura, Spec §FR-005, NFR-003]
- [x] CHK010 Conteúdo e limites do placeholder estão definidos sem dados financeiros fictícios? [Clareza, Spec §FR-007, FR-009]
- [x] CHK011 O alcance da integração futura está explicitamente excluído desta entrega? [Consistência, Spec §FR-011]

## Compatibilidade e critérios de aceite

- [x] CHK012 Foco, teclado, altura fixa, rascunhos, bloqueios e logout têm requisitos consistentes? [Cobertura, Spec §FR-008, FR-010]
- [x] CHK013 Os critérios de datas, estados, navegação e layout são mensuráveis? [Mensurabilidade, Spec §SC-001–SC-005]
- [x] CHK014 As dependências e a diferença entre prova documental, mocks e sessão real estão declaradas? [Rastreabilidade, Spec §NFR-004, Assumptions]

## Notes

14/14 atendidos pela especificação; nenhum item mede execução de código.
O helper padrão de checklist exige plan.md nesta instalação, embora o fluxo SDD situe Checklist antes de Plan. Os caminhos foram resolvidos pelo modo PathsOnly já executado em Clarify, e o checklist foi avaliado diretamente contra spec.md; não se antecipou o desenho.
