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

# Executar linter com verificação de regras de Atomic Design
npm run lint

# Executar scanner AST e gerar relatório completo de conformidade
npm run audit:atomic-design
```

---

## 🎨 Auditoria de Conformidade ao Atomic Design

O projeto conta com ferramentas automatizadas para garantir que telas, organismos e páginas utilizem os componentes reutilizáveis de Design System (localizados em `src/components/ui` e `src/components/atoms`) em vez de tags HTML nativas brutas ou estilos inline:

1. **ESLint (`npm run lint`)**: Alerta e sinaliza no editor o uso de `<button>`, `<input>`, `<select>`, `<textarea>` nativos ou `style={{ ... }}` fora dos átomos de UI.
2. **Scanner AST (`npm run audit:atomic-design`)**: Varre todos os arquivos `.tsx`/`.jsx`, calcula a porcentagem de conformidade e gera relatórios detalhados em `.audit-report.json` e `.audit-report.md`.

---

## 📂 Estrutura de Documentação do Projeto

Toda a especificação, arquitetura, design system e decisões de design estão organizadas na pasta [`docs/`](file:///c:/Programmer/diet-maker/docs/) e [`design-system/`](file:///c:/Programmer/diet-maker/design-system/):

```
c:/Programmer/diet-maker/
├── README.md                          # Visão geral do projeto e índice de documentação
├── AGENTS.md                          # Guia de rotas e instrução para agentes de IA
├── demo_dashboard.html                # Protótipo histórico; não normativo
├── design-system/
│   ├── README.md                      # Índice e fonte canônica do Design System
│   └── 01-*.md … 15-*.md             # Regras normativas completas
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

- 🎨 **[README.md Design System](file:///c:/Programmer/diet-maker/design-system/README.md)**: Especificação completa de tokens de cores, tipografia, geometria de cards e componentes.
- 🖥️ **[Protótipo histórico (demo_dashboard.html)](file:///c:/Programmer/diet-maker/demo_dashboard.html)**: Registro não normativo; não deve orientar tokens ou estilos atuais.
- 📋 **[Product Requirements Document (PRD.md)](file:///c:/Programmer/diet-maker/docs/prd/PRD.md)**: Requisitos funcionais, user stories e critérios de aceitação.
- 📖 **[Glossário de Domínio (CONTEXT.md)](file:///c:/Programmer/diet-maker/docs/context/CONTEXT.md)**: Termos técnicos de nutrição (VET, g/kg, macros, deltas e escala).
- 🏛️ **[Decisões de Arquitetura (ADRs)](file:///c:/Programmer/diet-maker/docs/adr/)**: Registros formais de decisões do sistema (incluindo migração Next.js no ADR-006).
- 🤖 **[Instruções para Agentes de IA (AGENTS.md)](file:///c:/Programmer/diet-maker/AGENTS.md)**: Roteamento de comandos e matriz de caminhos.
