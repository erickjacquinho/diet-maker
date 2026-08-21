# Implementation Plan: Refatoração, Componentização e Padrões de Composição Vercel

**Feature Directory**: `specs/07-08-26-refatoracao-composicao-codigo-limpo` | **Date**: 2026-08-07 | **Spec**: [spec.md](file:///c:/Programmer/diet-maker/specs/07-08-26-refatoracao-composicao-codigo-limpo/spec.md)

---

## Summary

Plano de execução arquitetural para decompor e refatorar **100% dos 66 arquivos extensos (>100 linhas)** do projeto. A estratégia aplica os Vercel React Composition Patterns para eliminar boolean props conflitantes, introduzir Compound Components com context desacoplado, extrair seletores puros para stores Zustand e organizar testes e scripts em módulos concisos, garantindo que nenhum arquivo de página/componente em `src/` exceda 250 linhas.

---

## Technical Context

- **Language/Version**: TypeScript 5.x / React 18 / Next.js 14+ (App Router)
- **Primary Dependencies**: React, Next.js, TailwindCSS, Lucide Icons, Zustand, Framer Motion, Radix UI (shadcn/ui primitives)
- **Storage**: LocalStorage / Zustand Persist / Memory Stores
- **Testing**: Vitest / Playwright / Node Test Runner (`npm test`)
- **Target Platform**: Modern Web Browsers (Desktop & Mobile Responsiveness)
- **Project Type**: Web Application (Diet Maker Nutrition Platform)
- **Performance Goals**: Zero re-renders desnecessários em modais e formulários; tempo de build e checagem de tipos estáticos (`tsc --noEmit`) sem degradação.
- **Constraints**: Limite estrito de <250 linhas por arquivo em `src/components` e `src/app`; zero regressão de regras de negócio ou contratos visuais de z-index.
- **Scale/Scope**: 66 arquivos com >100 linhas (9 páginas, 27 componentes/modais, 9 stores/lógica de negócio, 17 suítes de testes, 4 scripts).

---

## Constitution Check

- **Gate 1: Single Responsibility & Composition**: Vercel Composition Patterns aplicados a todos os componentes e modais complexos (**APROVADO**).
- **Gate 2: Type Safety**: Preservar contratos de tipo TypeScript sem usar `any` ou desativar linter (**APROVADO**).
- **Gate 3: Test Continuity**: Nenhuma asserção de teste existente removida; refatorar apenas mocks e fixtures de testes extensos (**APROVADO**).

---

## Project Structure & Architecture Mapping

```text
specs/07-08-26-refatoracao-composicao-codigo-limpo/
├── spec.md              # Requisitos funcionais e cenários de refatoração
├── plan.md              # Este plano de execução
├── research.md          # Padrões de composição Vercel e decisões de decomposição
├── data-model.md        # Interfaces de contexto e contratos de componentes compostos
├── quickstart.md        # Guia de validação end-to-end e testes de regressão
├── checklists/          # Checklists de qualidade das especificações e refatoração
└── tasks.md             # Tarefas ordenadas de refatoração por domínio

src/
├── app/                 # Páginas refatoradas (decomposição em hooks e compostos)
├── components/          # UI Components & Layouts (Compound Components, Variants)
│   ├── ui/              # Primitivos shadcn/ui refatorados
│   ├── molecules/       # Modais e campos compostos
│   ├── organisms/       # Tabelas e containers compostos
│   └── templates/       # Templates de página
├── lib/                 # Stores Zustand (Slice Pattern) e seletores memoizados
└── design-system/       # Tokens e estilos
```

---

## Phase 0: Research & Pattern Selection (`research.md`)

O documento `research.md` consolida os 5 padrões centrais da Vercel para esta refatoração:
1. `architecture-avoid-boolean-props`: Substituição de múltiplos flags booleanos por subcomponentes declarativos ou enums de variante.
2. `architecture-compound-components`: Criação de contextos acoplados internamente ao componente primário (ex: `Modal.Header`, `Modal.Content`, `Modal.Footer`).
3. `state-decouple-implementation`: Isolamento do estado do modal/form em seu próprio Provider/Hook.
4. `patterns-children-over-render-props`: Passagem de slots visuais via `children` em vez de render props como `renderFooter`.
5. `store-slice-pattern`: Decomposição de Zustand stores extensas (`patientsStore.ts`, `patientListView.ts`) em slices puros acoplados via `create()`.

---

## Phase 1: Design Artifacts

- **`data-model.md`**: Mapeamento das novas interfaces TypeScript, tipos de contexto composto e estrutura de Slices para Zustand.
- **`quickstart.md`**: Comandos de validação rápida (`npm test`, `npx tsc --noEmit`, e scripts de auditoria visual de z-index).
