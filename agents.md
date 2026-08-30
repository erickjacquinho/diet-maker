# AGENTS.md - AI Agent Direct File Router

All AI agents working on this codebase MUST read and strictly follow the target documentation files based on task scope:

## Documentation & Architecture (Sources of Truth)

| Scope | Direct Target File | Description |
| :--- | :--- | :--- |
| **Design System — Guia Mestre** | [design-system/README.md](file:///c:/Programmer/diet-maker/design-system/README.md) | Índice canônico, escopo, decisões fixadas e ordem de leitura |
| **Design System — Fundamentos** | [design-system/fundamentals.md](file:///c:/Programmer/diet-maker/design-system/fundamentals.md) | Princípios, linguagem visual e limites do produto desktop |
| **Design System — Tokens Canônicos** | [design-system/tokens-reference.md](file:///c:/Programmer/diet-maker/design-system/tokens-reference.md) | Matriz completa de tokens: cores, tipografia, geometria, ícones e z-index |
| **Design System — Governança & Contratos** | [design-system/governance.md](file:///c:/Programmer/diet-maker/design-system/governance.md) | Contrato mínimo de componentes, ciclo de vida, versionamento e depreciação |
| **Design System — Roadmap de Migração** | [design-system/migration-plan.md](file:///c:/Programmer/diet-maker/design-system/migration-plan.md) | Migração, conformidade, validação e critérios de homologação (DoD) |
| **Atomic Design Rules** | [.agents/rules/atomic-design.md](file:///c:/Programmer/diet-maker/.agents/rules/atomic-design.md) | Hierarquia de 5 níveis e matriz de dependências de componentes |
| **Shadcn UI Rules** | [.agents/rules/shadcn-preservation.md](file:///c:/Programmer/diet-maker/.agents/rules/shadcn-preservation.md) | Manter primitivos limpos em `src/components/ui`, estender via wrappers/filhos |
| **Tokens & Style Rules** | [.agents/rules/tokens.md](file:///c:/Programmer/diet-maker/.agents/rules/tokens.md) | Convenções de tokens e proibição de utilitários arbitrários e cores Hex hardcoded |
| **Color Semantics Rules** | [.agents/rules/color-semantics.md](file:///c:/Programmer/diet-maker/.agents/rules/color-semantics.md) | Uso funcional de superfícies, neutros, primária, macros e feedback semântico |
| **Typography Rules** | [.agents/rules/typography.md](file:///c:/Programmer/diet-maker/.agents/rules/typography.md) | Plus Jakarta Sans, limites de peso (400-700) e escala tipográfica |
| **Geometry & Layout Rules** | [.agents/rules/geometry-layout.md](file:///c:/Programmer/diet-maker/.agents/rules/geometry-layout.md) | Espaçamento múltiplo de 4px, raios de borda, 1px estático e escopo desktop |
| **Icons, Motion & Layers Rules** | [.agents/rules/icons-motion-layers.md](file:///c:/Programmer/diet-maker/.agents/rules/icons-motion-layers.md) | Ícones Lucide, escala de z-index, elevações e micro-animações |
| **States & Accessibility Rules** | [.agents/rules/states-accessibility.md](file:///c:/Programmer/diet-maker/.agents/rules/states-accessibility.md) | Matriz de 10 estados, anel de foco, teclado e conformidade WCAG 2.2 AA |
| **Component Decision Rules** | [.agents/rules/component-decision.md](file:///c:/Programmer/diet-maker/.agents/rules/component-decision.md) | Sequência Usar -> Configurar -> Variar -> Compor -> Criar e vedações de API |
| **PRD & Requirements** | [docs/prd/PRD.md](file:///c:/Programmer/diet-maker/docs/prd/PRD.md) | Requisitos de produto, estórias de usuário e critérios de aceite |
| **Domain Context** | [docs/context/CONTEXT.md](file:///c:/Programmer/diet-maker/docs/context/CONTEXT.md) | Termos nutricionais, tabela TACO, VET e fórmulas de macros |
| **Architecture Decisions** | [docs/adr/](file:///c:/Programmer/diet-maker/docs/adr/) | Registros de decisões arquiteturais ADR-001 a ADR-008 |
| **Pesquisa Mercadológica** | [refs/pesquisa-mercadologica/index.md](file:///c:/Programmer/diet-maker/refs/pesquisa-mercadologica/index.md) | Panorama do mercado brasileiro, concorrentes, personas e proposta de valor |
| **Dieta DB & Persistência** | [refs/dieta-db/index.md](file:///c:/Programmer/diet-maker/refs/dieta-db/index.md) | Arquitetura do banco relacional local, receitas, refeições e arquivo mestre |
| **Plan Execution** | `/speckit-implement` | Comando obrigatório para executar planos de implementação aprovados |

### Design System component catalog

| Scope | Direct target |
| :--- | :--- |
| Visual category contract | `design-system/components/categories/<category>.md` |
| Individual component profile | `design-system/components/profiles/<layer>/<component>.md` |
| Component IDs, layers, traits, sources and exports | `design-system/components/registry.json` |
| Category lifecycle and creation decisions | `design-system/components/category-decisions.md` |
| Catalog audit contract | `design-system/components/audit-contract.md` |

When a component is new or changed, consult the category before the profile. The Atomic layer and visual category are independent axes; do not create a visual rule in a layer document or a duplicate state/token table in a profile.

## Repository Layout

```
src/
├── app/                  # Next.js App Router (páginas & rotas)
├── components/           # Hierarquia UI atômica (atoms, molecules, organisms, templates, ui)
├── data/                 # Datasets do domínio (ex: tabela TACO)
└── lib/                  # Utilitários compartilhados & funções auxiliares
docs/                     # Especificações do projeto (prd, context, adr)
design-system/               # Fonte única da verdade do sistema visual (15 documentos normativos)
tests/                    # Suíte de testes do projeto
refs/                     # Materiais de referência & arquivos de pesquisa
```
