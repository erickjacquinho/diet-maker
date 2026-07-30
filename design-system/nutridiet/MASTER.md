# NutriDiet Design System - Fonte Única Mestra (MASTER.md)

> 📌 **Fonte Única da Verdade Global (Single Source of Truth)**
> Este documento define os princípios fundamentais, diretrizes arquiteturais e o índice de submódulos do **NutriDiet Local Pro**, baseado na estética *Swiss Warm Minimalist Flat Design*.

---

## 📚 1. Índice da Documentação Modular

A especificação completa do Design System NutriDiet encontra-se dividida nos seguintes arquivos por responsabilidade:

### 🎨 1.1 Tokens & Fundações Visuais (`tokens/`)
- 🎨 [colors.md](file:///c:/Programmer/diet-maker/design-system/nutridiet/tokens/colors.md) — Paleta em 3 Camadas (Primitivos, Semânticos e Componentes).
- 🔤 [typography.md](file:///c:/Programmer/diet-maker/design-system/nutridiet/tokens/typography.md) — Fontes (Plus Jakarta Sans + Inter), escala de tipos e hierarquia.
- 📐 [spacing-grid.md](file:///c:/Programmer/diet-maker/design-system/nutridiet/tokens/spacing-grid.md) — Escala de espaçamento, arredondamentos (`rounded-2xl`, `rounded-xl`, `rounded-full`) e Z-Index.
- 🏛️ [motion-flat-rules.md](file:///c:/Programmer/diet-maker/design-system/nutridiet/tokens/motion-flat-rules.md) — Regra Swiss Flat (Zero box-shadow) e tempos de transição (150-200ms).

### 🧩 1.2 Componentes Modulares (`components/`)
- 🧱 [atoms.md](file:///c:/Programmer/diet-maker/design-system/nutridiet/components/atoms.md) — Átomos Primitivos (`Button`, `Input`, `Badge`, `Card`, `ProgressBar`, `IconButton`).
- 🧩 [molecules.md](file:///c:/Programmer/diet-maker/design-system/nutridiet/components/molecules.md) — Moléculas Reutilizáveis (`MacroMetricCard`, `MealItemRow`, `PatientBadgeHeader`).
- 🏛️ [organisms.md](file:///c:/Programmer/diet-maker/design-system/nutridiet/components/organisms.md) — Organismos de Layout (`SidebarNav`, `MacroTrackerHeader`, `MealCardContainer`).

### 📄 1.3 Guias por Página (`pages/`)
- 🥗 [diet-builder.md](file:///c:/Programmer/diet-maker/design-system/nutridiet/pages/diet-builder.md) — Especificação da tela de Montar Dieta / Dashboard Ativo.


---

## 🎨 2. Síntese dos Tokens Principais

### 2.1 Cores Base & Semânticas
- **Fundo da App (`bg-warm-bg`)**: `#f5f2eb` (Creme / Areia Suave).
- **Cards Principais (`bg-warm-card`)**: `#ffffff` (Branco Puro Nítido).
- **Superfície Interna (`bg-warm-inner`)**: `#faf8f5` (Off-white sutil).
- **Contorno / Linha Clean (`border-warm-border`)**: `#e8e4dc` (Linha sólida de contorno 1px).
- **Contorno de Foco / Hover (`border-warm-borderDark`)**: `#d6cfc4`.
- **Texto Principal (`text-warm-charcoal`)**: `#111827` (Carvão Escuro).
- **Texto Secundário (`text-warm-secondary`)**: `#4b5563` (Cinza Médio).
- **Texto Muted (`text-warm-muted`)**: `#8c8275` (Bege/Cinza Neutro).

### 2.2 Macronutrientes Semânticos
- **Esmeralda (Sucesso / Meta)**: `#059669` | Fundo Pílula: `#e6f4ea`.
- **Carmim (Proteínas / Alerta Crítico)**: `#e11d48` | Fundo Pílula: `#fce8e6`.
- **Âmbar (Carboidratos / Alerta Moderado)**: `#d97706` | Fundo Pílula: `#fef3c7`.
- **Teal (Gorduras / Acento Secundário)**: `#0d9488` | Fundo Pílula: `#e6f2f2`.
- **Terracota (Ação Secundária)**: `#d97760`.

---

## 🏛️ 3. Regras Invioláveis de Design (Swiss Flat Rules)

1. **Zero Sombras (`box-shadow: none !important`)**: Absolutamente nenhum elemento 3D ou sombra projetada.
2. **Zero Gradientes (`background-image: none !important`)**: Todas as cores devem ser sólidas e planas.
3. **Arredondamento Estrito**:
   - `rounded-2xl` para Cards e Painéis.
   - `rounded-xl` para Inputs, Botões e Caixas.
   - `rounded-full` para Badges e Pílulas.
4. **Ícones Vetoriais SVG**: Substituir emojis por componentes da biblioteca **Lucide-React**.
