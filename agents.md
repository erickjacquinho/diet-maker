# AGENTS.md - Diretrizes para Agentes de IA

Este documento define as regras fundamentais, arquiteturais e organizacionais para todos os agentes de IA que atuarem no projeto **NutriDiet Local Pro**.

---

## 🚨 REGRA PRIORITÁRIA Nº 1: Padronização Atomic Design (Brad Frost - Capítulo 2)

> 📄 **Regra Detalhada**: [.agents/rules/atomic-design.md](file:///c:/Programmer/diet-maker/.agents/rules/atomic-design.md)
> 📘 **Metodologia de Referência**: [Atomic Design por Brad Frost (Capítulo 2)](https://atomicdesign.bradfrost.com/chapter-2/)

Toda a interface e componentes visuais desenvolvidos no projeto **MUST** seguir estritamente a hierarquia de 5 níveis do Atomic Design:

```
src/components/
├── atoms/          # Level 1: Átomos
├── molecules/      # Level 2: Moléculas
├── organisms/      # Level 3: Organismos
└── templates/      # Level 4: Templates
src/app/            # Level 5: Páginas (Next.js App Router)
```

### Resumo dos Níveis:
1. **⚛️ Átomos (`src/components/atoms/`)**: Componentes primitivos indivisíveis (`Button`, `Input`, `Label`, `Badge`, `Avatar`, `ProgressBar`, `IconButton`).
2. **🧬 Moléculas (`src/components/molecules/`)**: Combinações simples de 2+ átomos (`MacroMetricCard`, `MealItemRow`, `PatientBadgeHeader`, `TacoSearchInput`).
3. **🦠 Organismos (`src/components/organisms/`)**: Seções complexas de interface (`SidebarNav`, `MacroTrackerHeader`, `MealCardContainer`).
4. **📐 Templates (`src/components/templates/`)**: Esqueleto de layout de página sem dados hardcoded (`DietBuilderTemplate`).
5. **📄 Páginas (`src/app/`)**: Rotas Next.js App Router injetando dados reais.

---

## 🛡️ REGRA PRIORITÁRIA Nº 2: Preservação do Shadcn UI & Criação de Componentes Filhos

> 📄 **Regra Detalhada**: [.agents/rules/shadcn-preservation.md](file:///c:/Programmer/diet-maker/.agents/rules/shadcn-preservation.md)
> 💡 **Manutenção, Escala e Identidade Visual**: Os componentes base do Shadcn UI (`src/components/ui/` ou primitivos) devem ser estritamente preservados em seu estado limpo. Componentes filhos especializados/compostos devem ser criados para atender a novas demandas de manutenção e escala, seguindo 100% a identidade do projeto.

1. **Preservação dos Componentes Base (Shadcn UI)**:
   - Os componentes nativos e primitivos do Shadcn UI (gerados em `src/components/ui/` ou integrados na camada base) **MUST** ser preservados sem poluição por regras de negócio específicas ou customizações ad-hoc que limitem seu reuso.

2. **Criação de Componentes Filhos para Manutenção e Escala**:
   - Sempre que uma funcionalidade exigir comportamentos de domínio, variações de layout ou composições complexas, crie **componentes filhos** (moléculas, organismos ou wrappers) que estendem e compõem os componentes base do Shadcn UI.

3. **Fidelidade Total à Identidade do Projeto**:
   - Todos os componentes filhos e customizações desenvolvidas **MUST** seguir rigorosamente os tokens do [Design System NutriDiet](file:///c:/Programmer/diet-maker/design-system/nutridiet/MASTER.md).

---

## 📌 Regras Complementares de Organização de Arquivos

1. **Testes**:
   - Todos os testes devem ser mantidos estritamente dentro da pasta `/tests`.
   - **Caminho**: `c:/Programmer/diet-maker/tests`.

2. **Referências**:
   - Todas as referências, materiais de consulta, documentações externas e arquivos de apoio devem ser salvos estritamente dentro da pasta `/refs`.
   - **Caminho**: `c:/Programmer/diet-maker/refs`.

---

## 🔗 Mapeamento e Fontes da Verdade
- **Regra Atomic Design**: [atomic-design.md](file:///c:/Programmer/diet-maker/.agents/rules/atomic-design.md)
- **Regra Shadcn UI & Componentes Filhos**: [shadcn-preservation.md](file:///c:/Programmer/diet-maker/.agents/rules/shadcn-preservation.md)
- **Design System Mestre**: [MASTER.md](file:///c:/Programmer/diet-maker/design-system/nutridiet/MASTER.md)
- **Mapeamento de Rotas e Paths**: [AGENTS_PATHS.md](file:///c:/Programmer/diet-maker/AGENTS_PATHS.md)
