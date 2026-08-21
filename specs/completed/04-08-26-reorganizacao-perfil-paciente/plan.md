# Implementation Plan: Reorganização estrutural do perfil do paciente

**Branch**: `04-08-26-reorganizacao-perfil-paciente` | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/04-08-26-reorganizacao-perfil-paciente/spec.md`

## Summary

A página de perfil deve funcionar primeiro como um resumo clínico do paciente, e não como uma cópia das metas de prescrição. O plano futuro deve preservar a estrutura já existente de identidade, indicadores corporais, acompanhamento e histórico, remover a apresentação isolada de metas manuais e derivar um resumo compacto apenas da dieta vigente registrada.

A mudança será implementada por composição dos organismos e moléculas já existentes na página, com uma regra de seleção explícita para diferenciar `Patient` (metas manuais), `BodyAssessment` (medição atual/histórica) e `HistoricalDiet` (plano registrado). O detalhamento energético e de macronutrientes continuará no fluxo da dieta e nas linhas expandidas do histórico.

## Technical Context

**Language/Version**: TypeScript 5.7, React 19, Next.js 15 App Router

**Primary Dependencies**: componentes locais de UI, Radix UI, lucide-react, Tailwind CSS e utilitários de `src/lib/patientsStore.ts`

**Storage**: localStorage existente para pacientes, avaliações corporais e dietas

**Testing**: Vitest/Testing Library para contratos e estados; validação visual e interação desktop com o fluxo local de webapp

**Target Platform**: web desktop a partir de 1024px

**Project Type**: aplicação web desktop local para acompanhamento nutricional

**Performance Goals**: manter a abertura do perfil dentro do comportamento atual, sem chamadas externas adicionais e sem duplicar a leitura dos registros do paciente

**Constraints**: Atomic Design; primitives shadcn preservadas; tokens canônicos; WCAG 2.2 AA; não criar nova fonte de persistência, integração ou componente de produto sem necessidade

**Scale/Scope**: uma rota de perfil por paciente, com dados locais e histórico de dietas/avaliações; sem alteração do fluxo completo de prescrição

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Atomic Design Architecture**: PASS — a mudança será feita na composição da página existente e em regras de dados sob `src/lib`, sem importar camadas superiores em componentes inferiores.
- **II. Canonical Design System**: PASS — reutilizar categorias, perfis, tokens e dimensões já catalogados; qualquer lacuna visual será tratada por governança, não por valor arbitrário local.
- **III. Desktop Scope and Accessibility**: PASS — escopo desktop a partir de 1024px, com foco visível, teclado, nomes acessíveis e estados vazios explícitos.
- **IV. Test-First Quality and Isolation**: PASS — incluir cobertura determinística para seleção de plano, estados vazio/ativo e preservação do histórico antes da validação visual.
- **V. Spec-Driven Execution**: PASS — este plano termina em artefatos de especificação; a implementação deverá ser executada posteriormente por `/speckit-implement` após aprovação humana.

## Project Structure

### Documentation (this feature)

```text
specs/04-08-26-reorganizacao-perfil-paciente/
├── spec.md              # Requisitos e jornadas
├── checklists/          # Qualidade dos requisitos
├── research.md          # Decisões de fonte de dados e escopo
├── data-model.md        # Entidades e projeção do resumo
├── quickstart.md        # Cenários de validação desktop
├── plan.md              # Este plano
└── tasks.md             # Tarefas para futura implementação
```

### Source Code (repository root)

```text
src/
├── app/pacientes/[id]/page.tsx       # composição do perfil e estados da rota
├── components/                       # moléculas/organismos já catalogados
└── lib/patientsStore.ts              # tipos e leitura dos registros locais

tests/
├── app/pacientes/                    # cenários do perfil
├── components/                       # contratos de componentes reutilizados
└── lib/                              # regras puras de dados do paciente
```

**Structure Decision**: manter a mudança concentrada na rota existente do perfil e na derivação de dados necessária para separar fonte atual de fonte histórica. Não serão criadas páginas, endpoints, tabelas, primitives ou componentes de domínio paralelos.

## Design and Data Decisions

1. **Perfil primeiro, prescrição depois**: a área inicial responde “quem é o paciente e como ele está agora”; o plano alimentar aparece depois dos indicadores e somente quando existe uma dieta vigente.
2. **Fonte de verdade por intenção**: `Patient.target*` continua sendo meta manual; `BodyAssessment` mais recente alimenta indicadores corporais; `HistoricalDiet` vigente alimenta o resumo do plano.
3. **Resumo sem duplicação**: a informação resumida do plano pode expor energia e distribuição de macros em uma composição curta, mas não replica a grade detalhada de refeições/macros.
4. **Estado vazio honesto**: ausência de dieta ou avaliação é um estado de dados, não um valor zero ou placeholder com aparência de dado atual.
5. **Composição existente**: usar os componentes e tokens já aplicados na página e no catálogo; não introduzir um novo componente de produto se uma composição de `Card`, `MetricBox`, `Separator`, ações e estados existentes resolver o caso.

## Implementation References

- **Layout**: desktop a partir de 1024px, spacing da escala de 4px e regiões principais separadas por `space-section`/`space-page-section`; o perfil continua dentro do container de página existente.
- **Surfaces**: `Card` padrão com `surface`, `border-subtle` e `radius-surface`; indicadores contínuos usam um único frame com `border-divider` nos separadores internos.
- **Typography**: `page-title`, `section-title`, `body-small` e `legal`/`helper` existentes por meio das classes `text-style-*` já adotadas na rota.
- **Icons**: Lucide, `icon-micro` (12px) para metadata, `icon-compact` (14px) para controles e `stroke-width: 1.75`; ícones decorativos permanecem `aria-hidden`.
- **Interaction**: `Dialog`, `Select`, `Popover` e `Calendar` continuam sendo os primitivos Shadcn/Radix; foco segue ring de 2px com offset de 2px e o foco retorna ao acionador.
- **Component decision**: a mudança é uma composição local em `src/app/pacientes/[id]/page.tsx` apoiada por um seletor puro em `src/lib/patientProfileSelectors.ts`; nenhum componente visual novo é necessário para o plano vigente.

## Implementation Sequence

1. Confirmar a regra de seleção e os estados com os artefatos deste SDD.
2. Criar testes determinísticos para separar plano vigente, metas manuais, medição atual e histórico.
3. Refatorar a composição do perfil para remover a área de metas manuais em destaque e inserir o resumo contextual do plano.
4. Preservar o histórico, a definição de acompanhamento e o acesso à dieta detalhada.
5. Validar tipos, lint, testes, acessibilidade e captura visual desktop.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Nenhuma | N/A | A solução mantém o projeto, a rota e o modelo de persistência atuais. |

## Phase 0: Research Output

See [research.md](./research.md). All relevant data-source, hierarchy, and scope decisions are resolved; no external integration research is required.

## Phase 1: Design Output

- [data-model.md](./data-model.md) defines existing entities and the non-persisted `ActivePlanSummary` projection.
- [quickstart.md](./quickstart.md) defines the desktop validation scenarios.
- `contracts/` is intentionally omitted because this change exposes no external API or integration contract.

## Post-Design Constitution Check

- **Atomic Design**: PASS — no new lower-layer dependency or domain primitive is required.
- **Canonical Design System**: PASS — visual composition is constrained to cataloged components and tokens.
- **Desktop and accessibility**: PASS — the plan includes keyboard/focus validation and desktop-only scope.
- **Test isolation**: PASS — data-selection tests use fixtures and do not mutate external data.
- **Spec-driven execution**: PASS — tasks are prepared for later `/speckit-implement`; this SDD does not claim implementation completion.
