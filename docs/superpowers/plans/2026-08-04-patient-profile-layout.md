# Patient Profile Layout Implementation Plan

> **For agentic workers:** Execute this plan task-by-task with review checkpoints.

**Goal:** Reorganizar a página de perfil do paciente para colocar dados pessoais atuais em primeiro plano e tornar o agendamento secundário.

**Architecture:** Alterar somente a composição JSX/classes da rota existente `src/app/pacientes/[id]/page.tsx`. Os dados continuam sendo lidos do objeto `patient`; as ações, modais, persistência e rotas permanecem intactas. A interface usará `Card`, `MetricBox`, `Avatar`, `Badge`, botões e ícones já existentes.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Radix/Shadcn local, Lucide React.

## Global Constraints

- Produto desktop a partir de `1024px`; mobile/tablet fora do escopo.
- Tema claro levemente quente; tokens semânticos existentes; Plus Jakarta Sans; Lucide.
- Não criar componentes, tokens, dependências ou modelos de dados.
- Não alterar `src/components/ui`.

---

### Task 1: Recompor o resumo do paciente

**Files:**
- Modify: `src/app/pacientes/[id]/page.tsx`

- [x] Remover a repetição visual do nome no cabeçalho do card sem remover a identificação do paciente.
- [x] Organizar o primeiro card em identidade, ações e grid modular de dados pessoais atuais.
- [x] Manter ações de nova dieta, nova avaliação, edição e exclusão com seus handlers atuais.

### Task 2: Tornar o agendamento secundário e separar metas

**Files:**
- Modify: `src/app/pacientes/[id]/page.tsx`

- [x] Mover a faixa de acompanhamento para depois dos dados pessoais e reduzir sua hierarquia visual usando `surface-subtle`.
- [x] Preservar o formulário de data/tipo e os handlers de salvar, cancelar, limpar e reagendar.
- [x] Criar uma seção visual separada para kcal e P/C/G reutilizando `MetricBox`.

### Task 3: Rebalancear histórico e verificar

**Files:**
- Modify: `src/app/pacientes/[id]/page.tsx`

- [x] Renomear o cabeçalho do histórico para refletir a leitura de consultas sem remover a tabela unificada.
- [x] Remover sombras pesadas dos cards da página e manter bordas/superfícies semânticas.
- [x] Rodar `npm run type-check`, `npm run lint` e o teste isolado de `MetricBox` (a suíte completa excedeu 120s sem reportar falhas).
- [x] Rodar a aplicação, validar interações e revisar a rota em viewport desktop.
