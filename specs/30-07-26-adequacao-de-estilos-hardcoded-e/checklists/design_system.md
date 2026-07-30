# Checklist de Qualidade dos Requisitos: Adequação de Estilos e Componentes

**Finalidade**: Validação da qualidade, clareza e completude dos requisitos para adequação visual e estrutural do NutriDiet Local Pro.
**Criado**: 30/07/2026
**Feature**: [spec.md](../spec.md)

## Requirement Completeness

- [ ] CHK001 - Estão definidos todos os caminhos dos 12 arquivos de rota sob `src/app` a serem refatorados? [Completeness, Spec §FR-001]
- [ ] CHK002 - Estão mapeadas todas as substituições de cores utilitárias brutas pelos tokens semânticos do Design System NutriDiet? [Completeness, Spec §FR-001]
- [ ] CHK003 - Estão identificadas todas as modais e formulários inline a serem extraídos para a camada de componentes (`src/components/`)? [Completeness, Spec §FR-003]

## Requirement Clarity

- [ ] CHK004 - Os tokens semânticos de substituição para macronutrientes (`Proteína`, `Carboidrato`, `Gordura`, `Calorias`) estão explicitamente definidos em `tokens.ts`/`globals.css`? [Clarity, Spec §FR-001]
- [ ] CHK005 - As regras de descarte de utilitários arbitrários (`text-[10px]`, `text-[11px]`, `text-[9px]`) definem com clareza os utilitários de escala oficiais correspondentes? [Clarity, Spec §FR-002]

## Requirement Consistency & Atomic Design

- [ ] CHK006 - As diretrizes do Atomic Design (regras do `AGENTS.md`) e preservação do Shadcn UI são mantidas em todas as refatorações de componentes compostos? [Consistency, Spec §FR-004, §FR-005]
- [ ] CHK007 - As modais extraídas preservam 100% o comportamento interativo e os contratos de props sem vazamento de estado de negócio para os primitivos base do Shadcn UI? [Consistency, Spec §FR-005]

## Non-Functional Requirements & Build Safety

- [ ] CHK008 - O critério de aceite de build sem erros ou warnings (`npm run build`) está explicitamente configurado como porta de entrada para conclusão? [Measurability, Spec §SC-004]
- [ ] CHK009 - O comportamento responsivo e legibilidade em laptops pequenos é garantido após a refatoração? [Edge Case, Spec §Edge Cases]
