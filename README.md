# NutriDiet Local Pro - Central de Documentação do Projeto

Bem-vindo à documentação oficial do **NutriDiet Local Pro**, o aplicativo local de elaboração, adequação, cópia/cola e escala de dietas clínicas e esportivas para nutricionistas, construído em **Next.js (App Router)** com TypeScript e Tailwind CSS.

---

## ⚡ Comandos de Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar servidor de desenvolvimento local
npm run dev

# Gerar build de produção para Vercel
npm run build
```

---

## 📂 Estrutura de Documentação do Projeto

Toda a especificação, arquitetura, design system e decisões de design estão organizadas na pasta [`docs/`](file:///c:/Programmer/diet-maker/docs/) e [`design-system/`](file:///c:/Programmer/diet-maker/design-system/):

```
c:/Programmer/diet-maker/
├── README.md                          # Visão geral do projeto e índice de documentação
├── AGENTS_PATHS.md                    # Guia de rotas e instrução para agentes de IA
├── demo_dashboard.html                # Protótipo visual HTML do Design System (Swiss Warm Minimalist)
├── design-system/
│   └── nutridiet/
│       └── MASTER.md                  # Fonte Única da Verdade do Design System (Tokens de Cores, Fontes, Componentes)
├── src/
│   └── app/                           # Arquitetura Next.js App Router
│       ├── globals.css                # Estilos globais e variáveis Tailwind
│       ├── layout.tsx                 # Root Layout & Fontes Google
│       └── page.tsx                   # Página principal (Dashboard Shell)
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

## 🔗 Links Rápidos

- 🎨 **[MASTER.md Design System](file:///c:/Programmer/diet-maker/design-system/nutridiet/MASTER.md)**: Especificação completa de tokens de cores, tipografia, geometria de cards e componentes.
- 🖥️ **[Protótipo Visual (demo_dashboard.html)](file:///c:/Programmer/diet-maker/demo_dashboard.html)**: Demonstração navegável do visual Swiss Warm Minimalist.
- 📋 **[Product Requirements Document (PRD.md)](file:///c:/Programmer/diet-maker/docs/prd/PRD.md)**: Requisitos funcionais, user stories e critérios de aceitação.
- 📖 **[Glossário de Domínio (CONTEXT.md)](file:///c:/Programmer/diet-maker/docs/context/CONTEXT.md)**: Termos técnicos de nutrição (VET, g/kg, macros, deltas e escala).
- 🏛️ **[Decisões de Arquitetura (ADRs)](file:///c:/Programmer/diet-maker/docs/adr/)**: Registros formais de decisões do sistema (incluindo migração Next.js no ADR-006).
- 🤖 **[Instruções para Agentes de IA (AGENTS_PATHS.md)](file:///c:/Programmer/diet-maker/AGENTS_PATHS.md)**: Roteamento de comandos e matriz de caminhos.
