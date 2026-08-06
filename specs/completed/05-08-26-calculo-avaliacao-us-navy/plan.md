# Implementation Plan: Avaliação física com cálculo US Navy

**Branch**: `05-08-26-calculo-avaliacao-us-navy` | **Date**: 2026-08-05 | **Spec**: [spec.md](./spec.md)

## Summary

Adicionar um módulo de domínio reutilizável para calcular composição corporal pelo método US Navy, estender `BodyAssessment` com as circunferências solicitadas e substituir os diálogos inline de avaliação no perfil e na consulta por uma molécula compartilhada com resultados somente leitura.

## Technical Context

**Language/Version**: TypeScript 5+ / React 19 / Next.js App Router

**Primary Dependencies**: React, Tailwind tokens do projeto, Shadcn/Radix Dialog e Input, Vitest, Testing Library

**Storage**: `localStorage` através de `src/lib/patientsStore.ts`

**Testing**: Vitest e Testing Library; validação final com lint e build

**Target Platform**: Web desktop a partir de 1024px

**Project Type**: Aplicação web local/offline-first

**Performance Goals**: Recalcular composição no mesmo ciclo de interação do formulário, sem chamadas externas ou operações assíncronas

**Constraints**: Preservar avaliações legadas, manter `src/components/ui` genérico, usar tokens e contratos do design system, respeitar Atomic Design e WCAG 2.2 AA

**Scale/Scope**: Uma função de domínio, um modelo persistido, um modal compartilhado e dois consumidores de rota

## Constitution Check

- Atomic Design: o cálculo ficará em `src/lib`; o modal em `src/components/molecules`; páginas apenas orquestram; `src/components/ui` não terá regra de negócio.
- Design System: dialog, inputs, labels, estados de erro, foco e espaçamento seguirão `design-system/components/categories/fields.md`, `design-system/components/categories/overlays.md` e `design-system/components/profiles/ui/dialog.md`.
- Desktop/accessibility: manter faixa desktop, labels explícitos, `DialogTitle`/`DialogDescription`, foco Radix, mensagem de erro associada ao formulário e região rolável para o conteúdo extenso.
- Test-first: testes de domínio e interação serão criados antes da implementação correspondente em `tests/`.
- Spec-driven execution: este plano será executado via `/speckit-implement`.

## Project Structure

### Documentation

```text
specs/05-08-26-calculo-avaliacao-us-navy/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code

```text
src/lib/bodyFat.ts
src/lib/patientsStore.ts
src/components/molecules/EditAssessmentModal.tsx
src/components/molecules/index.ts
src/app/pacientes/[id]/page.tsx
src/app/pacientes/[id]/consulta/[date]/page.tsx
tests/lib/bodyFat.test.ts
tests/components/molecules/edit-assessment-modal.test.tsx
```

## Architecture

`bodyFat.ts` recebe somente dados numéricos e o sexo normalizado, valida entradas, converte unidades, aplica as constantes US Navy e retorna uma composição arredondada. O modal mantém um rascunho local, chama a função a cada alteração e só chama `onSave` com uma avaliação completa e calculada.

`patientsStore.ts` mantém os campos novos opcionais no tipo, preserva o JSON existente e continua sendo a única fronteira de persistência. As duas rotas usam a mesma molécula para eliminar fórmulas e marcação duplicadas.

## Validation Strategy

- Unit tests: homens, mulheres, conversão cm/in, arredondamento, massa gorda, massa magra e todos os erros de entrada.
- Interaction tests: ordem dos labels, resultados readonly, recálculo após mudança, erro inline, bloqueio de submit e callback com dados calculados.
- Static checks: `npm test -- --run`, `npm run lint`, `npm run build`.
