# Implementation Tasks: Identificador de Paciente com NanoID e Código de Prontuário

**Feature Branch**: `implementacao-nanoid-pacientes`
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Phase 1: Setup

- [x] T001 [skill: general] Instalar dependência `nanoid` no projeto `package.json`

## Phase 2: Foundational

- [x] T002 [skill: general] Atualizar interface `Patient` e funções de armazenamento em `src/lib/patientsStore.ts` com gerador `nanoid(8)` e código de prontuário `P-XXXX`
- [x] T003 [P] [skill: tdd] Criar testes unitários para a geração de NanoID e código de prontuário em `src/lib/__tests__/patientsStore.test.ts`

## Phase 3: User Story 1 - Acesso Seguro ao Perfil via NanoID (Priority: P1)

Goal: Permitir navegação e acesso ao perfil do paciente usando URL limpa `/pacientes/[nanoid]`.
Independent Test: Clicar em um paciente da lista ou acessar `/pacientes/k8Xm2P9q` carrega o perfil do paciente.

- [x] T004 [P] [US1] [skill: frontend-design] Atualizar a rota `/pacientes/[id]/page.tsx` para buscar e resolver paciente por NanoID e suporte a legacy ID
- [x] T005 [P] [US1] [skill: frontend-design] Atualizar o hook `usePatientProfilePage.ts` em `src/hooks/usePatientProfilePage.ts` para manipular IDs NanoID e redirecionamentos
- [x] T006 [US1] [skill: frontend-design] Atualizar links de navegação da lista de pacientes em `src/app/pacientes/page.tsx` para apontar para `/pacientes/[nanoid]`

## Phase 4: User Story 2 - Exibição do Código de Prontuário (Priority: P2)

Goal: Exibir o código de prontuário `P-0042` no perfil e listagens.
Independent Test: O badge "Prontuário P-XXXX" é exibido no cabeçalho da página do paciente.

- [x] T007 [P] [US2] [skill: ui-ux-pro-max] Adicionar badge de Código de Prontuário no componente `src/components/organisms/PatientProfileHeader.tsx`
- [x] T008 [P] [US2] [skill: ui-ux-pro-max] Exibir código de prontuário na listagem de pacientes em `src/app/pacientes/page.tsx`

## Phase 5: User Story 3 - Compatibilidade de IDs Legados (Priority: P3)

Goal: Redirecionar URLs antigas `/pacientes/pat-XXXX` para `/pacientes/[nanoid]`.
Independent Test: Digitar URL com ID antigo redireciona suavemente para o novo NanoID.

- [x] T009 [US3] [skill: frontend-design] Implementar lógica de fallback e `router.replace()` para IDs legados em `src/app/pacientes/[id]/page.tsx`

## Phase 6: Polish & Verification

- [x] T010 [skill: tdd] Executar suite completa de testes vitest (`npm run test`) e validar integridade do fluxo
