# NutriDiet Design System — Guia Mestre

> 📌 **Single Source of Truth (Fonte Única da Verdade)**
> Sistema de design modular e tokenizado para o **NutriDiet Local Pro**, construído com a estética **Swiss Warm Minimalist Flat Design**.

---

## 🏛️ Estrutura da Documentação Modular

O NutriDiet Design System é organizado em 5 etapas numéricas e diretas para garantir fácil consulta por humanos e agentes de IA:

### 1. 📋 [01-overview/architecture.md](file:///c:/Programmer/diet-maker/design-system/01-overview/architecture.md)
Filosofia visual, regras invioláveis (Zero box-shadow, Zero gradientes, Lucide Icons) e pilares de UX.

### 2. 🎨 [02-tokens/](file:///c:/Programmer/diet-maker/design-system/02-tokens/) — Fundações Visuais (Sistema de 3 Camadas)
- 🎨 [01-colors.md](file:///c:/Programmer/diet-maker/design-system/02-tokens/01-colors.md) — Paleta em 3 Camadas (Primitivos, Semânticos e Nutricionais/Macros).
- 🔤 [02-typography.md](file:///c:/Programmer/diet-maker/design-system/02-tokens/02-typography.md) — Plus Jakarta Sans, Inter, escala de fontes e WCAG AAA.
- 📐 [03-spacing-layout.md](file:///c:/Programmer/diet-maker/design-system/02-tokens/03-spacing-layout.md) — Grid, espaçamentos, arredondamentos (`rounded-2xl`, `rounded-xl`, `rounded-full`) e Z-index.
- ⚡ [04-motion.md](file:///c:/Programmer/diet-maker/design-system/02-tokens/04-motion.md) — Transições rápidas (150-200ms), efeitos interativos e micro-interações flat.
- 💻 [05-tailwind-config.md](file:///c:/Programmer/diet-maker/design-system/02-tokens/05-tailwind-config.md) — Mapeamento mestre e código de configuração para `tailwind.config.ts`.

### 3. 🧩 [03-components/](file:///c:/Programmer/diet-maker/design-system/03-components/) — Especificações de Componentes (Atomic Design)
- 🧱 [01-atoms.md](file:///c:/Programmer/diet-maker/design-system/03-components/01-atoms.md) — `NutriButton`, `NutriBadge`, `NutriInput`, `ProgressBar`, `Avatar`, `SparklineLine`, `NutriCheckbox`, `NutriStepper`, `NutriSwitch` e `NutriSkeleton`.
- 🧬 [02-molecules.md](file:///c:/Programmer/diet-maker/design-system/03-components/02-molecules.md) — `MacroMetricCard`, `MealItemRow`, `PatientBadgeHeader`, `NutriToast`, `HabitItemRow`, `NutriEmptyState`, `FilterPillBar`, `RadioCards` e `TacoFoodSelector`.
- 🦠 [03-organisms.md](file:///c:/Programmer/diet-maker/design-system/03-components/03-organisms.md) — `SidebarNav`, `MacroTrackerHeader`, `MealCardContainer`, `BentoGridContainer`, `RoutineBlockOrganism`, `HabitTrackerSection`, `NutritionalSparklineTable` e `NutriToastStack`.
- 📐 [04-templates.md](file:///c:/Programmer/diet-maker/design-system/03-components/04-templates.md) — `DietBuilderTemplate`, `AppLayoutShell` e `PatientDashboardTemplate`.

### 4. 🛡️ [04-guidelines/](file:///c:/Programmer/diet-maker/design-system/04-guidelines/) — Regras de Código e Arquitetura
- 🧩 [shadcn-integration.md](file:///c:/Programmer/diet-maker/design-system/04-guidelines/shadcn-integration.md) — Preservação da camada base (`src/components/ui/`) e criação de wrappers/componentes filhos.
- 🏛️ [atomic-design-rules.md](file:///c:/Programmer/diet-maker/design-system/04-guidelines/atomic-design-rules.md) — Regras de organização e limites dos 5 níveis do Atomic Design.
- 🎨 [component-states-rules.md](file:///c:/Programmer/diet-maker/design-system/04-guidelines/component-states-rules.md) — Matrizes universais para uso de Cards, Elevação Flat (Level 0 a 5) e Validação de Formulários.
- ✅ [compliance-checklist.md](file:///c:/Programmer/diet-maker/design-system/04-guidelines/compliance-checklist.md) — Matriz de homologação visual, acessibilidade, desempenho e cobertura das quatro referências.

### 5. 📄 [05-screens/](file:///c:/Programmer/diet-maker/design-system/05-screens/) — Especificação por Tela da Aplicação
- 🏠 [dashboard.md](file:///c:/Programmer/diet-maker/design-system/05-screens/dashboard.md) — Dashboard principal.
- 🥗 [diet-builder.md](file:///c:/Programmer/diet-maker/design-system/05-screens/diet-builder.md) — Tela de montagem e edição de dietas.
- 👤 [patient-dashboard.md](file:///c:/Programmer/diet-maker/design-system/05-screens/patient-dashboard.md) — Gestão e acompanhamento clínico do paciente.

---

## ⚡ Síntese Rápida de Tokens

- **Fundo da App (`bg-warm-bg`)**: `#f5f2eb` (Creme Swiss Warm).
- **Cards Principais (`bg-warm-card`)**: `#ffffff` (Branco Nítido).
- **Superfície Interna (`bg-warm-inner`)**: `#faf8f5` (Off-white sutil).
- **Linha de Contorno (`border-warm-border`)**: `#e8e4dc` (Linha sólida de 1px).
- **Texto Principal (`text-warm-main`)**: `#111827` (Carvão Escuro).
- **Destaque Primário (`emerald-700`)**: `#047857` (Esmeralda).
- **Macronutrientes**: Proteínas (`rose-700` / `#be123c`), Carboidratos (`amber-700` / `#b45309`), Gorduras (`teal-700` / `#0f766e`).

---

## Regra de Conformidade

Os documentos em `design-system/` materializam integralmente os requisitos de `refs/UI/design-system-prd/`. Em caso de dúvida:

1. A regra **Swiss Warm Minimalist Flat** prevalece: zero sombras e zero gradientes.
2. `src/design-system/tokens.ts` é o espelho executável dos tokens documentados.
3. Nenhum item listado neste README pode apontar para componente apenas “futuro” ou sem especificação.
4. A homologação só pode ser declarada após executar a matriz de `04-guidelines/compliance-checklist.md`.
