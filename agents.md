# AGENTS.md - AI Agent Direct File Router

All AI agents working on this codebase MUST read and strictly follow the target documentation files based on task scope:

## Documentation & Architecture (Sources of Truth)

| Scope | Direct Target File | Description |
| :--- | :--- | :--- |
| **Design System — Guia Mestre** | [design-system/README.md](file:///c:/Programmer/diet-maker/design-system/README.md) | Índice canônico, escopo, decisões fixadas e ordem de leitura |
| **Design System — Fundamentos** | [design-system/01-principles-and-scope.md](file:///c:/Programmer/diet-maker/design-system/01-principles-and-scope.md) | Princípios, linguagem visual e limites do produto desktop |
| **Design System — Tokens** | [design-system/03-token-architecture.md](file:///c:/Programmer/diet-maker/design-system/03-token-architecture.md) | Arquitetura reference → system → component; cores, tipografia e geometria nos documentos 04–08 |
| **Design System — Componentes** | [design-system/09-component-decision-model.md](file:///c:/Programmer/diet-maker/design-system/09-component-decision-model.md) | Decisão, arquitetura, contrato, especificações e registro nos documentos 09–12 e 15 |
| **Design System — Implementação** | [design-system/13-implementation-and-compliance.md](file:///c:/Programmer/diet-maker/design-system/13-implementation-and-compliance.md) | Migração, conformidade, validação e critérios de homologação |
| **Design System — Governança** | [design-system/14-lifecycle-and-governance.md](file:///c:/Programmer/diet-maker/design-system/14-lifecycle-and-governance.md) | Proposta, revisão, versionamento, depreciação e remoção |
| **Atomic Design Rules** | [.agents/rules/atomic-design.md](file:///c:/Programmer/diet-maker/.agents/rules/atomic-design.md) | Regras estritas da hierarquia de 5 níveis de componentes |
| **Shadcn UI Rules** | [.agents/rules/shadcn-preservation.md](file:///c:/Programmer/diet-maker/.agents/rules/shadcn-preservation.md) | Manter primitivos limpos em `src/components/ui`, estender via wrappers/filhos |
| **PRD & Requirements** | [docs/prd/PRD.md](file:///c:/Programmer/diet-maker/docs/prd/PRD.md) | Requisitos de produto, estórias de usuário e critérios de aceite |
| **Domain Context** | [docs/context/CONTEXT.md](file:///c:/Programmer/diet-maker/docs/context/CONTEXT.md) | Termos nutricionais, tabela TACO, VET e fórmulas de macros |
| **Architecture Decisions** | [docs/adr/](file:///c:/Programmer/diet-maker/docs/adr/) | Registros de decisões arquiteturais ADR-001 a ADR-007 |
| **Historical Visual Prototype** | [demo_dashboard.html](file:///c:/Programmer/diet-maker/demo_dashboard.html) | Artefato histórico e não normativo; não usar como fonte de tokens ou estilos |
| **Plan Execution** | `/speckit-implement` | Comando obrigatório para executar planos de implementação aprovados |

## Repository Layout

```
src/
├── app/          # Next.js App Router (páginas & rotas)
├── components/   # Hierarquia UI atômica (atoms, molecules, organisms, templates, ui)
├── data/         # Datasets do domínio (ex: tabela TACO)
└── lib/          # Utilitários compartilhados & funções auxiliares
docs/             # Especificações do projeto (prd, context, adr)
design-system/    # Fonte canônica do sistema visual (15 documentos normativos)
tests/            # Suíte de testes do projeto
refs/             # Materiais de referência & arquivos de pesquisa
```
