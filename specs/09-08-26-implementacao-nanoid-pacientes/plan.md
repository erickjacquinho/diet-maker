# Implementation Plan: Identificador de Paciente com NanoID e Código de Prontuário

**Branch**: `implementacao-nanoid-pacientes` | **Date**: 2026-08-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/09-08-26-implementacao-nanoid-pacientes/spec.md`

## Summary

Migrar a identificação de pacientes nas URLs de `pat-[timestamp]-[hash]` para NanoID opaco de 8 caracteres (`/pacientes/k8Xm2P9q`) e introduzir a exibição do código de prontuário (`P-0042`) na interface. Manter suporte e redirecionamento automático para IDs legados existentes.

## Technical Context

**Language/Version**: TypeScript 5.x / React 19 / Next.js 15 (App Router)
**Primary Dependencies**: `nanoid` (para geração de IDs opacos curtos), `lucide-react`, `tailwindcss`
**Storage**: `localStorage` (com migração de esquema) / compatível com Postgres/Supabase futuro
**Testing**: Vitest (`npm run test`)
**Target Platform**: Web Browser / Desktop & Mobile responsive
**Project Type**: Next.js Web Application
**Performance Goals**: Carregamento e roteamento de perfil <100ms
**Constraints**: Zero links quebrados para registros antigos existentes

## Constitution Check

- PASS: Nenhuma violação das diretrizes de arquitetura do projeto.
- PASS: Mantém desacoplamento entre modelo de dados, hooks de navegação e componentes de UI.

## Project Structure

### Documentation (this feature)

```text
specs/09-08-26-implementacao-nanoid-pacientes/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan
├── research.md          # Technical research & decisions
├── data-model.md        # Entity definitions & schema
├── quickstart.md        # Validation scenarios
└── tasks.md             # Actionable task list
```

### Source Code

```text
src/
├── lib/
│   ├── patientsStore.ts     # Atualização do modelo Patient, gerador NanoID e prontuário P-XXXX
│   └── patientProfileSelectors.ts
├── hooks/
│   └── usePatientProfilePage.ts # Adaptação do roteamento por id/legacyId
├── components/
│   ├── molecules/
│   │   └── CreatePatientModal.tsx
│   └── organisms/
│       └── PatientProfileHeader.tsx # Adição do badge de código de prontuário
└── app/
    └── pacientes/
        └── [id]/
            └── page.tsx      # Rota do perfil do paciente por NanoID
```

## Complexity Tracking

Nenhuma complexidade extra introduzida.
