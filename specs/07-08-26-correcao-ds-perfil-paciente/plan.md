# Implementation Plan: Correção de Conformidade 100% ao Design System na Página de Perfil do Paciente (/pacientes/perfil)

**Branch**: `07-08-26-correcao-ds-perfil-paciente` | **Date**: 2026-08-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/07-08-26-correcao-ds-perfil-paciente/spec.md`

## Summary

O objetivo desta tarefa é corrigir 100% das violações e não conformidades em relação ao Design System canônico (`design-system/`) identificadas na página de perfil do paciente (`src/app/pacientes/[id]/page.tsx`) e em seus componentes associados.
A abordagem técnica consistirá em:
1. Normalizar todas as chamadas de tipografia para os tokens fechados de `textStyle(...)`, removendo sobrescritas ad-hoc (`font-bold`, `font-semibold`, `tracking-tight`) e eliminando o uso inadequado de `text-style-legal`.
2. Adequar a geometria e dimensões de componentes átomos e moléculas (remover `h-16 w-16` em `Avatar`, `h-7 w-7` em `IconButton`, `h-6 w-px` em divisores), aplicando superfícies `Surface` e `MetricBox`.
3. Desacoplar a arquitetura da página `src/app/pacientes/[id]/page.tsx`, extraindo o histórico de consultas (atualmente +200 linhas de HTML `<table>` bruto) para o organismo `PatientConsultationHistoryTable.tsx` e extraindo os diálogos inline (`NextEventModal`, `AddObjectiveModal`, `DeletePatientModal`) para a camada `molecules`.
4. Eliminar todos os imports diretos de primitivos `@/components/ui/` no arquivo da página.

---

## Technical Context

**Language/Version**: TypeScript 5.x / React 19 / Next.js 15 App Router  
**Primary Dependencies**: TailwindCSS (com tokens do Design System), Lucide React, Radix UI primitives (`@/components/ui/`)  
**Storage**: `localStorage` (via `patientsStore.ts`)  
**Testing**: Vitest (`npm test`)  
**Target Platform**: Web Desktop (mínimo `1024px`)  
**Project Type**: Web application (Next.js App Router)  
**Performance Goals**: Renderização sem oscilação de layout (CLS 0), resposta de interações em < 50ms  
**Constraints**: Respeitar integralmente os Princípios da Constituição NutriDiet (Atomic Design, Design System Canônico, Acessibilidade WCAG 2.2 AA)  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio da Constituição | Status | Evidência / Validação |
| --- | --- | --- |
| **I. Atomic Design Architecture** | PASS | A página deixará de consumir `@/components/ui` diretamente, dependendo apenas de `atoms`, `molecules` e `organisms`. Componentes de modais viverão em `molecules` e a tabela em `organisms`. |
| **II. Canonical Design System** | PASS | 100% dos textos utilizarão `textStyle(...)` sem sobrescritas ad-hoc. Cores, dimensões e superfícies derivadas estritamente de `design-system/`. |
| **III. Desktop Scope & Accessibility** | PASS | Foco exclusivo desktop (>= 1024px). Preservação de atributos ARIA, labels acessíveis e navegação por teclado. |
| **IV. Test-First Quality & Isolation** | PASS | Suíte de testes automatizados unitários/de componente garantindo regressão zero. |
| **V. Spec-Driven Execution** | PASS | Mudança totalmente governada por artefatos Spec Kit sob `specs/07-08-26-correcao-ds-perfil-paciente/`. |

---

## Project Structure

### Documentation (this feature)

```text
specs/07-08-26-correcao-ds-perfil-paciente/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/
│   ├── requirements.md
│   └── design-system-compliance.md
└── tasks.md
```

### Source Code

```text
src/
├── app/
│   └── pacientes/
│       └── [id]/
│           └── page.tsx                         # Refatorado: limpo de imports ui, dialogs e raw table
├── components/
│   ├── atoms/                                   # Avatar, Button, IconButton, Surface, FieldTrigger
│   ├── molecules/
│   │   ├── MetricBox.tsx                        # Molécula homologada de métrica
│   │   ├── DatePickerField.tsx
│   │   ├── PageContextHeader.tsx
│   │   ├── EditAssessmentModal.tsx              # Refatorado para conformidade com DS
│   │   ├── EditPatientModal.tsx                 # Refatorado para conformidade com DS
│   │   ├── ReadOnlyDietModal.tsx                # Refatorado para conformidade com DS
│   │   ├── NextEventModal.tsx                   # [NEW] Molécula extraída da página
│   │   ├── AddObjectiveModal.tsx                # [NEW] Molécula extraída da página
│   │   └── DeletePatientModal.tsx               # [NEW] Molécula extraída da página
│   └── organisms/
│       ├── MetricBoxGroup.tsx
│       └── PatientConsultationHistoryTable.tsx   # [NEW] Organismo extraído da página
```

**Structure Decision**: Aplicação web com Next.js App Router seguindo o padrão Atomic Design aprovado no repositório.

---

## Complexity Tracking

*Nenhuma violação da Constituição necessária; sem complexidades extraordinárias.*
