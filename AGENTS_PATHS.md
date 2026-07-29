# AGENTS_PATHS.md - Mapa de Caminhos e Instruções para Agentes de IA

Este documento contém o mapeamento estruturado de caminhos (*paths*), especificações e responsabilidades de cada arquivo do projeto **NutriDiet Local Pro** para orientar a atuação de subagentes autônomos.

---

## 📌 1. Documentação de Especificação, Design System e Arquitetura (Fontes da Verdade)

Todos os agentes devem ler estes arquivos antes de realizar qualquer modificação no código ou na UI:

| Recurso | Caminho Absoluto / Relativo | Descrição / Finalidade |
| :--- | :--- | :--- |
| **Índice do Projeto** | `c:/Programmer/diet-maker/README.md` | Guia inicial e visão geral da documentação. |
| **Design System (MASTER)** | `c:/Programmer/diet-maker/design-system/nutridiet/MASTER.md` | **Fonte Única da Verdade do Visual**: Tokens de cores, fontes, bordas 1px, sem gradientes/sombras. |
| **Protótipo Visual** | `c:/Programmer/diet-maker/demo_dashboard.html` | Exemplo HTML de referência visual (Swiss Warm Minimalist Off-White). |
| **PRD Geral** | `c:/Programmer/diet-maker/docs/prd/PRD.md` | Documento principal de requisitos, user stories e critérios de aceitação. |
| **Glossário de Domínio** | `c:/Programmer/diet-maker/docs/context/CONTEXT.md` | Termos nutricionais (VET, g/kg, macros, deltas, tabela TACO). |
| **ADR-001 (Escopo & Foco)** | `c:/Programmer/diet-maker/docs/adr/ADR-001-product-scope-and-architecture.md` | Decisão sobre foco em velocidade de consulta e não-escopos. |
| **ADR-002 (Persistência & .diet)** | `c:/Programmer/diet-maker/docs/adr/ADR-002-data-persistence-and-local-file-format.md` | Padrão de arquivos `.diet` locais e auto-save IndexedDB. |
| **ADR-003 (Metas & Tolerância)** | `c:/Programmer/diet-maker/docs/adr/ADR-003-macro-targets-and-tolerance-ranges.md` | Faixas de tolerância visual (±5%) e metas manuais. |
| **ADR-004 (Substitutos Manuais)** | `c:/Programmer/diet-maker/docs/adr/ADR-004-food-substitutions-model.md` | Regras para opções de alimentos substitutos por lista. |
| **ADR-005 (Design System)** | `c:/Programmer/diet-maker/docs/adr/ADR-005-design-system-warm-minimalist.md` | Decisão de arquitetura visual Swiss Warm Minimalist Off-White. |
| **ADR-006 (Arquitetura Next.js)** | `c:/Programmer/diet-maker/docs/adr/ADR-006-nextjs-app-router-architecture.md` | Migração para Next.js App Router (15+) e limites RSC / Client. |
| **ADR-007 (Arquitetura de Telas & UX)** | `c:/Programmer/diet-maker/docs/adr/ADR-007-screen-architecture-and-navigation.md` | Especificação completa do mapa de telas, timeline de pacitentes, UX rasa e sidebar recolhível. |

---

## 📂 2. Árvore Organizacional do Repositório

```
c:/Programmer/diet-maker/
├── README.md                          # Visão geral do projeto e índice de documentação
├── AGENTS_PATHS.md                    # Guia de rotas e instrução para agentes de IA
├── demo_dashboard.html                # Protótipo visual HTML do Design System (Swiss Warm Minimalist)
├── design-system/
│   └── nutridiet/
│       └── MASTER.md                  # Fonte Única da Verdade do Design System
├── src/
│   └── app/                           # Código da Aplicação Next.js (App Router)
│       ├── globals.css                # Estilos globais e variáveis de tema
│       ├── layout.tsx                 # Root Layout
│       └── page.tsx                   # Dashboard Principal
└── docs/
    ├── prd/
    │   └── PRD.md                     # Product Requirements Document (Requisitos & User Stories)
    ├── context/
    │   └── CONTEXT.md                 # Glossário de Domínio Nutricional & Termos Clínicos
    └── adr/                           # Architecture Decision Records (ADRs)
        ├── ADR-001-product-scope-and-architecture.md
        ├── ADR-002-data-persistence-and-local-file-format.md
        ├── ADR-003-macro-targets-and-tolerance-ranges.md
        ├── ADR-004-food-substitutions-model.md
        ├── ADR-005-design-system-warm-minimalist.md
        ├── ADR-006-nextjs-app-router-architecture.md
        └── ADR-007-screen-architecture-and-navigation.md
```

---

## 🤖 3. Instruções de Roteamento para Agentes de Código e UI

Ao delegar tarefas para subagentes:
1. **Para implementar qualquer componente visual ou tela**: Ler obrigatoriamente `design-system/nutridiet/MASTER.md` e validar contra `demo_dashboard.html`.
2. **Para componentes interativos React**: Seguir as diretrizes do Next.js App Router. Adicionar a diretiva `'use client'` apenas nos componentes que exigem interatividade do cliente (ex: `useState`, `useEffect`, `onClick`).
3. **Para consultar Requisitos e User Stories**: Ler `docs/prd/PRD.md`.
4. **Para consultar Termos do Domínio de Nutrição**: Ler `docs/context/CONTEXT.md`.
5. **Para consultar as Decisões de Arquitetura**: Consultar os arquivos na pasta `docs/adr/`.
