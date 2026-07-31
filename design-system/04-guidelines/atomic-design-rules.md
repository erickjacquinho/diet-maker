# 04-guidelines / atomic-design-rules — Regras da Metodologia Atomic Design

> **NutriDiet Design System — Diretrizes Estritas da Arquitetura em 5 Níveis**

---

## 🏛️ Mapeamento de Diretórios da Aplicação

Toda a interface do projeto **NutriDiet Local Pro** segue os 5 níveis descritos por Brad Frost (Capítulo 2):

```
src/components/
├── atoms/          # Level 1: Átomos indivisíveis
├── molecules/      # Level 2: Moléculas compostas (2+ átomos)
├── organisms/      # Level 3: Organismos de layout e painéis
├── templates/      # Level 4: Esqueletos de página (0% dados reais)
└── ui/             # Level 0: Primitivos intocados do Shadcn UI
src/app/            # Level 5: Páginas do Next.js (Injeção de dados via Server/Client Components)
```

---

## 📜 Regras por Nível

### Level 1: Átomos (`src/components/atoms/`)
- **Regra**: Elementos primitivos indivisíveis (`NutriButton`, `NutriInput`, `NutriBadge`, `NutriProgressBar`).
- **Restrição**: Não podem conter estados de domínio globais nem chamadas de API.

### Level 2: Moléculas (`src/components/molecules/`)
- **Regra**: Combinações simples de 2 ou mais átomos (`MacroMetricCard`, `MealItemRow`, `HabitItemRow`).
- **Restrição**: Devem ser altamente reutilizáveis e focadas em uma única unidade funcional.

### Level 3: Organismos (`src/components/organisms/`)
- **Regra**: Seções autônomas da interface que unem moléculas e átomos (`SidebarNav`, `MacroTrackerHeader`, `MealCardContainer`).
- **Restrição**: Podem gerenciar estados complexos de formulário local.

### Level 4: Templates (`src/components/templates/`)
- **Regra**: Estruturas de layout que definem a disposição espacial dos componentes na tela (`DietBuilderBentoTemplate`).
- **Restrição**: **ZERO DADOS HARDCODED**. Devem receber seções como props (`React.ReactNode`).

### Level 5: Páginas (`src/app/`)
- **Regra**: Rotas do Next.js App Router.
- **Responsabilidade**: Buscar dados (via banco local/Prisma/Supabase), injetar dados nos templates e gerenciar revalidações de estado.
