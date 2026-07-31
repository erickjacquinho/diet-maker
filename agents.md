# AGENTS.md - AI Agent Direct File Router

All AI agents working on this codebase MUST read and strictly follow the target documentation files based on task scope:

## Documentation & Architecture (Sources of Truth)

| Scope | Direct Target File | Description |
| :--- | :--- | :--- |
| **Design System Guia Mestre** | [design-system/README.md](file:///c:/Programmer/diet-maker/design-system/README.md) | Guia mestre, tokens visuais, regras de layout e especificações |
| **Design System 01-Overview** | [design-system/01-overview/architecture.md](file:///c:/Programmer/diet-maker/design-system/01-overview/architecture.md) | Filosofia Swiss Warm Minimalist Flat, regras estritas e pilares de UX |
| **Design System 02-Tokens** | [design-system/02-tokens/](file:///c:/Programmer/diet-maker/design-system/02-tokens/) | Paleta em 3 camadas (Primitivos, Semânticos, Nutricionais/Macros) |
| **Design System 03-Components**| [design-system/03-components/](file:///c:/Programmer/diet-maker/design-system/03-components/) | Especificações de componentes atômicos (Atoms, Molecules, Organisms, Templates) |
| **Design System 04-Guidelines** | [design-system/04-guidelines/](file:///c:/Programmer/diet-maker/design-system/04-guidelines/) | Preservação do Shadcn UI, regras de Atomic Design e matrizes de estados |
| **Design System 05-Screens** | [design-system/05-screens/](file:///c:/Programmer/diet-maker/design-system/05-screens/) | Especificações de layout e interações por tela da aplicação |
| **Atomic Design Rules** | [.agents/rules/atomic-design.md](file:///c:/Programmer/diet-maker/.agents/rules/atomic-design.md) | Regras estritas da hierarquia de 5 níveis de componentes |
| **Shadcn UI Rules** | [.agents/rules/shadcn-preservation.md](file:///c:/Programmer/diet-maker/.agents/rules/shadcn-preservation.md) | Manter primitivos limpos em `src/components/ui`, estender via wrappers/filhos |
| **PRD & Requirements** | [docs/prd/PRD.md](file:///c:/Programmer/diet-maker/docs/prd/PRD.md) | Requisitos de produto, estórias de usuário e critérios de aceite |
| **Domain Context** | [docs/context/CONTEXT.md](file:///c:/Programmer/diet-maker/docs/context/CONTEXT.md) | Termos nutricionais, tabela TACO, VET e fórmulas de macros |
| **Architecture Decisions** | [docs/adr/](file:///c:/Programmer/diet-maker/docs/adr/) | Registros de decisões arquiteturais ADR-001 a ADR-007 |
| **Visual Prototype** | [demo_dashboard.html](file:///c:/Programmer/diet-maker/demo_dashboard.html) | Protótipo visual standalone HTML de referência |
| **Plan Execution** | `/speckit-implement` | Comando obrigatório para executar planos de implementação aprovados |

## Repository Layout

```
src/
├── app/          # Next.js App Router (páginas & rotas)
├── components/   # Hierarquia UI atômica (atoms, molecules, organisms, templates, ui)
├── data/         # Datasets do domínio (ex: tabela TACO)
└── lib/          # Utilitários compartilhados & funções auxiliares
docs/             # Especificações do projeto (prd, context, adr)
design-system/    # Documentação e tokens do sistema visual (5 módulos)
tests/            # Suíte de testes do projeto
refs/             # Materiais de referência & arquivos de pesquisa
```
