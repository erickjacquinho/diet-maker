# Regra: Padronização Atomic Design (Brad Frost - Capítulo 2)

## 📌 Visão Geral
Esta regra estabelece o padrão arquitetural prioritário para todos os componentes de interface no projeto **NutriDiet Local Pro**, seguindo rigorosamente a metodologia oficial do [Atomic Design por Brad Frost (Capítulo 2)](https://atomicdesign.bradfrost.com/chapter-2/).

O objetivo desta regra é garantir **extrema reusabilidade**, **modularidade**, **testabilidade** e **facilidade de manutenção**, garantindo que a base de código permaneça limpa, previsível e alinhada ao Design System.

---

## 🏛️ Estrutura e Hierarquia de 5 Níveis

Toda a interface desenvolvida **MUST** estar categorizada em uma das 5 camadas abaixo:

```
src/components/
├── atoms/          # Level 1: Átomos Primitivos
├── molecules/      # Level 2: Moléculas Funcionais
├── organisms/      # Level 3: Organismos de Layout/Seção
└── templates/      # Level 4: Templates de Página (Layout Skeleton)
src/app/            # Level 5: Páginas / Rotas (Next.js App Router)
```

### 1. ⚛️ Átomos (`src/components/atoms/`)
- **Definição**: Elementos primitivos e indivisíveis da interface (ex: `Button`, `Input`, `Label`, `Badge`, `Avatar`, `ProgressBar`, `IconButton`).
- **Regras de Isolamento**:
  - **NÃO** podem importar ou depender de moléculas, organismos ou regras de negócio.
  - Devem ser 100% genéricos, agnósticos ao domínio da aplicação e reutilizáveis.
  - Estilizados exclusivamente com os tokens do [Design System NutriDiet](file:///c:/Programmer/diet-maker/design-system/README.md).

### 2. 🧬 Moléculas (`src/components/molecules/`)
- **Definição**: Grupos simples de dois ou mais átomos integrados que funcionam como uma unidade funcional com propósito único (ex: `TacoSearchInput` = Input + SearchIcon; `MealItemRow` = Text + Badge + Input + TrashIcon; `MacroMetricCard` = Label + Badge + Value + ProgressBar).
- **Regras**:
  - Focadas em uma única responsabilidade visual/funcional.
  - Reutilizáveis em múltiplos organismos e templates.

### 3. 🦠 Organismos (`src/components/organisms/`)
- **Definição**: Componentes complexos formados por grupos de moléculas, átomos e/ou outros organismos que gerenciam uma seção inteira da interface (ex: `SidebarNav`, `MacroTrackerHeader`, `MealCardContainer`, `AdjustGoalsModal`).
- **Regras**:
  - Gerenciam layouts de seção, estados compostos e interações ricas.
  - Podem se conectar a contextos locais ou estados da aplicação.

### 4. 📐 Templates (`src/components/templates/`)
- **Definição**: Estruturas de layout em nível de página que articulam a distribuição visual e o esqueleto dos organismos e componentes na tela.
- **Regras**:
  - Definem a grade e estrutura visual sem embutir dados reais de API ou valores hardcoded.

### 5. 📄 Páginas (`src/app/`)
- **Definição**: Instâncias específicas dos templates renderizadas nas rotas da aplicação (Next.js App Router).
- **Regras**:
  - Injetam dados reais, gerenciam estados de API, Server Actions, busca de banco de dados e hooks da aplicação.

---

## 🔗 Referências
- Metodologia Oficial: [Atomic Design (Brad Frost - Chapter 2)](https://atomicdesign.bradfrost.com/chapter-2/)
- Documentação do Design System: [README.md](file:///c:/Programmer/diet-maker/design-system/README.md)
- Regra de Preservação Shadcn UI: [shadcn-preservation.md](file:///c:/Programmer/diet-maker/.agents/rules/shadcn-preservation.md)
- Diretrizes Globais: [agents.md](file:///c:/Programmer/diet-maker/agents.md)
