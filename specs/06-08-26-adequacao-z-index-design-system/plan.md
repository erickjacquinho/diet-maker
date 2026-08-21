# Implementation Plan: Adequação da hierarquia z-index ao Design System

**Branch**: `06-08-26-adequacao-z-index-design-system` | **Date**: 2026-08-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/06-08-26-adequacao-z-index-design-system/spec.md`

**Implementation gate**: This is a handoff for `/speckit-implement`; no runtime implementation is part of this SDD session.

## Summary

Auditar e adequar todos os usos explícitos e semânticos de empilhamento do runtime à escala oficial do Design System. A implementação posterior manterá os primitives Radix/Shadcn genéricos, substituirá utilities numéricas por tokens semânticos, formalizará o contexto modal fechado de overlays ancorados, corrigirá a camada do Sheet e retirará decisões de z-index dos consumidores.

## Technical Context

**Language/Version**: TypeScript 5.7.2, React 19, Next.js 15.1.6

**Primary Dependencies**: Tailwind CSS 3.4.17, Radix Dialog 1.1.23, Radix Select 2.3.7, Radix Popover 1.1.23, Radix Dropdown Menu 2.1.24, class-variance-authority, Testing Library React 16.3.2, Vitest 4.1.10

**Storage**: N/A; only source code, design-system documentation and validation artifacts

**Testing**: Vitest/Testing Library for behavior and contract tests; Node-based deterministic audit scripts; existing catalog, legacy, type-check and lint gates

**Target Platform**: Web desktop, minimum 1024px, with browser zoom up to 200%

**Project Type**: Next.js desktop web application with Atomic Design component layers

**Performance Goals**: Preserve current overlay opening/closing responsiveness; the static audit must be deterministic and complete within the existing validation workflow without network or data dependencies

**Constraints**: No numeric/local z-index values; no `z-[N]`; no inline static `zIndex`; no new visual tokens without governance; preserve Radix focus, portal, collision and dismissal behavior; preserve Atomic dependency direction; implementation only through `/speckit-implement`

**Scale/Scope**: 19 explicit `z-*` utility matches, 10 `layer="modal"` Select consumers, 8 primitive/consumer families, 11 canonical z-index tokens, and the related design-system profiles/categories/gates

## Constitution Check

- **I. Atomic Design Architecture — PASS**: primitives remain generic; consumer changes stay in their existing layers; no upward imports or domain logic are introduced.
- **II. Canonical Design System — PASS**: all z-index decisions derive from `design-system/07-icons-motion-and-layers.md`, category contracts and profiles; numeric/local values are removed rather than added.
- **III. Desktop Scope and Accessibility — PASS**: validation covers desktop ≥1024px, zoom 200%, focus, keyboard, dismissal, accessible names, contrast and reduced motion; no mobile/tablet scope is introduced.
- **IV. Test-First Quality and Isolation — PASS**: contract/audit tests precede implementation tasks; validators are deterministic, nominal and do not use external data.
- **V. Spec-Driven Execution — PASS**: this plan is a handoff only; any code change must be executed through `/speckit-implement` after human validation.

No constitutional violation requires complexity justification.

## Project Structure

### Documentation (this feature)

```text
specs/06-08-26-adequacao-z-index-design-system/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/stacking-contract.md
├── checklists/requirements.md
├── checklists/stacking-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/                         # rotas e consumidores de overlays
├── components/
│   ├── ui/                      # primitives Radix/Shadcn
│   ├── atoms/
│   ├── molecules/               # DatePicker, modais e busca de ingredientes
│   ├── organisms/               # PatientListTable
│   └── templates/
├── design-system/               # tokens, recipes, tipos e exports
└── lib/

tests/
├── components/ui/               # contratos de primitives e overlays
├── components/molecules/        # regressões de DatePicker e modais
├── components/organisms/        # regressão de PatientListTable
└── design-system/               # auditoria de tokens e catálogo

scripts/
└── verify-design-system-z-index.mjs
```

**Structure Decision**: Manter o projeto Next.js único e a direção `ui → atoms → molecules → organisms → templates → app`. A regra de camada será centralizada nos primitives e nas receitas do Design System; consumers recebem apenas contextos semânticos fechados. O inventário e o gate específico ficarão em `scripts/`, os testes permanecem sob `tests/` e a documentação específica sob esta pasta de feature.

## Phase 0: Research decisions

As decisões e alternativas estão consolidadas em [research.md](./research.md). Não há decisão aberta pendente.

## Phase 1: Design artifacts

- [data-model.md](./data-model.md) define os registros de uso, tokens, contextos e exceções sem introduzir persistência.
- [contracts/stacking-contract.md](./contracts/stacking-contract.md) define o contrato de tokens, contexto modal, consumidor e auditoria.
- [quickstart.md](./quickstart.md) define os gates automatizados e a matriz manual de overlays.

## Implementation phases

1. **Inventory gate**: congelar a matriz dos 19 matches explícitos e 10 consumidores semânticos; confirmar o estado parcial de `SelectContent layer="modal"`.
2. **Primitive contract**: alinhar `z-dropdown`/`z-popover`, corrigir `SheetContent`, formalizar contexto modal em overlays ancorados e registrar o contrato.
3. **Consumer migration**: trocar os seis usos `z-10`, remover o `z-modal` local do `DatePickerField` e recompor a busca de ingredientes sobre overlay aprovado.
4. **Validation and governance**: atualizar categorias/perfis/índice/compliance, adicionar o gate nominal e cobrir comportamento e acessibilidade.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Overlay interno ficar atrás de dialog/backdrop | Teste explícito de camadas `default`/`modal`, DOM/portal e matriz manual com Dialog/Sheet |
| Corrigir token e perder foco/dismissal | Preservar primitives Radix, usar testes de teclado/foco e não reimplementar portal |
| `z-dropdown` e `z-popover` permanecerem contraditórios | Atualizar fundamento dependente, categoria e perfis no mesmo change set; gate valida o mapeamento |
| Busca de ingredientes perder seleção ou rolagem | Testes focados do fluxo com zero, um e muitos resultados e comportamento de Escape |
| Gate bloquear exceções legítimas | Não criar exceção para valor estático; qualquer exceção temporária deve ter ExceptionRecord completo e prazo |
| Alterações do worktree serem sobrescritas | `/speckit-implement` deve partir do estado revisado; esta sessão não altera os arquivos de runtime existentes |

## Validation gates

- `npm run verify:design-system-z-index` — gate novo para utilities e compatibilidade semântica de camada.
- `npm run verify:design-system` — catálogo, fontes, exports, categorias, perfis, tokens e governança.
- `npm run verify:design-system-legacy` — ausência dos padrões legados existentes.
- `npm run type-check` e `npm run lint` — integridade de tipos e regras de código.
- `npm test -- tests/design-system tests/components/ui tests/components/molecules tests/components/organisms` — contratos e regressões focados.
- `git diff --check` — higiene do change set.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --- | --- | --- |
| Nenhuma | N/A | O escopo usa o projeto único e os primitives existentes; não há nova aplicação, storage ou camada de infraestrutura. |
