# Regra: Padronização Atomic Design & Limites Arquiteturais

> **Escopo:** Hierarquia de 5 níveis de componentes (Atomic Design por Brad Frost - Capítulo 2) e limites de dependência.

## 1. Visão Geral

Esta regra estabelece o padrão arquitetural prioritário para todos os componentes de interface no projeto **NutriDiet Local Pro**, garantindo extrema reusabilidade, modularidade, testabilidade e separação de responsabilidades.

---

## 2. Estrutura e Hierarquia de Camadas

```text
src/components/
├── ui/             # Primitivos Shadcn / Radix (Genéricos visuais base)
├── atoms/          # Level 1: Átomos Primitivos (Componentes base do produto)
├── molecules/      # Level 2: Moléculas Funcionais (Combinações de átomos)
├── organisms/      # Level 3: Organismos de Layout/Seção (Seções complexas)
└── templates/      # Level 4: Templates de Página (Layout Skeleton)
src/app/            # Level 5: Páginas / Rotas (Next.js App Router)
```

### 2.1 Primitivos Shadcn (`src/components/ui/`)
- Componentes visuais genéricos gerados pelo Shadcn UI / Radix primitives (`button.tsx`, `dialog.tsx`, `select.tsx`).
- 🛑 **Regra de Preservação:** Manter limpos. Não adicionar regras de negócio nem acoplamento de domínio.

### 2.2 Átomos (`src/components/atoms/`)
- Elementos primitivos da marca NutriDiet (ex: `Button`, `Input`, `Label`, `Badge`, `Avatar`, `ProgressBar`).
- Agnosticos ao domínio da aplicação. Estilizados exclusivamente com tokens do Design System.

### 2.3 Moléculas (`src/components/molecules/`)
- Grupos simples de dois ou mais átomos integrados com propósito visual/funcional único (ex: `MealItemRow`, `MacroMetricCard`, `TacoSearchInput`).

### 2.4 Organismos (`src/components/organisms/`)
- Componentes complexos formados por moléculas e átomos que gerenciam uma seção inteira da interface (ex: `SidebarNav`, `MacroTrackerHeader`, `MealCardContainer`, `AdjustGoalsModal`).

### 2.5 Templates (`src/components/templates/`)
- Estruturas de layout de página sem dados reais de API.

### 2.6 Páginas (`src/app/`)
- Rotas do Next.js App Router que injetam dados reais, executam Server Actions e realizam chamadas de banco/API.

---

## 3. Matriz de Dependência entre Camadas

Para evitar acoplamentos cíclicos e vazamento de abstração, siga a matriz de importação permitida:

| Camada | Pode Importar De | NÃO Pode Importar De |
| :--- | :--- | :--- |
| `src/components/ui` | `lib/utils`, Radix | `atoms`, `molecules`, `organisms`, `templates`, `app`, `data` |
| `src/components/atoms` | `ui`, `lib/utils`, Lucide | `molecules`, `organisms`, `templates`, `app`, `data` |
| `src/components/molecules` | `ui`, `atoms`, `lib/utils` | `organisms`, `templates`, `app` |
| `src/components/organisms` | `ui`, `atoms`, `molecules`, `lib/utils` | `templates`, `app` |
| `src/components/templates` | `ui`, `atoms`, `molecules`, `organisms` | `app` |
| `src/app` | TODAS as camadas acima | Outras rotas diretamente |

---

## 4. Separação: Genérico vs Domínio

- **Componentes Genéricos (`ui`, `atoms`):** Não devem conter vocabulário de nutrição, paciente, dieta, refeição ou tabela TACO em suas props, nomes ou tipos.
- **Componentes de Domínio (`molecules`, `organisms`):** Podem aceitar tipos e dados específicos do domínio nutricional (`Paciente`, `Refeicao`, `AlimentoTACO`).

---

## 5. Referências

- Metodologia Oficial: [Atomic Design (Brad Frost - Chapter 2)](https://atomicdesign.bradfrost.com/chapter-2/)
- Regra de Preservação Shadcn UI: [shadcn-preservation.md](file:///c:/Programmer/diet-maker/.agents/rules/shadcn-preservation.md)
- Diretrizes Globais: [agents.md](file:///c:/Programmer/diet-maker/agents.md)
