# 01-overview / Arquitetura & Diretrizes Universais

> **NutriDiet Design System — Filosofia Visual & Diretrizes Invioláveis**

---

## 🏛️ 1. Filosofia: Swiss Warm Minimalist Flat Design

O **NutriDiet Local Pro** adota a linguagem de design **Swiss Warm Minimalist Flat Design**. Esta filosofia combina a clareza tipográfica suíça com tons quentes e orgânicos, eliminando qualquer distrações visuais desnecessárias (efeitos 3D, gradientes e sombras).

### Princípios Norteadores:
1. **Alta Densidade com Baixa Fadiga Cognitiva**: Apresentar dados nutricionais complexos (macros, micros, porções, tendências) através de layouts ordenados (Bento Grid) e tipografia com contraste ideal.
2. **Estética Orgânica Acolhedora**: Substituir o cinza frio industrial por tons de creme/areia quentes (`#f5f2eb`), criando uma atmosfera profissional e convidativa para o nutricionista e para o paciente.
3. **Clareza Tátil e Resposta Imediata**: Interações rápidas (<100ms), contornos limpos e semântica de cores direta.

---

## ⛔ 2. Regras Invioláveis de Design (Strict Flat Rules)

Todas as telas e componentes desenvolvidos no projeto **MUST** seguir rigorosamente as 4 regras abaixo:

### Rule #1: Zero Box-Shadow (`box-shadow: none !important`)
- **Proibido**: Usar `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl` ou `box-shadow` CSS em qualquer elemento.
- **Substituto**: Separação visual feita exclusivamente por **linhas de contorno de 1px sólidas** (`border border-warm-border` ou `#e8e4dc`) e variação de superfícies (`bg-warm-bg` vs `bg-warm-card`).

### Rule #2: Zero Gradientes (`background-image: none !important`)
- **Proibido sem exceções**: Utilizar gradientes de fundo, borda, texto, máscara ou decoração (ex: `bg-gradient-to-r`, `linear-gradient`, `radial-gradient`, `conic-gradient`).
- **Substituto**: Cores 100% sólidas e planas da paleta oficial do sistema.
- **Toasts e badges pastel**: usam superfícies sólidas; a variação semântica ocorre por token de fundo, borda e ícone, nunca por gradiente.

### Rule #3: Zero Emojis como Ícones
- **Proibido**: Usar caracteres emoji para representar categorias, ícones de botões ou indicadores no sistema (ex: 🥗, 🥩, 💧).
- **Substituto**: Ícones vetoriais SVG da biblioteca **Lucide-React** estilizados com a cor semântica apropriada.

### Rule #4: Escala Estrita de Border-Radius
- **`rounded-2xl`** (16px): Exclusivo para Cards Principais, Painéis Bento Grid e Modais.
- **`rounded-xl`** (12px): Exclusivo para Inputs, Botões, Selects e Containers Internos.
- **`rounded-full`** (9999px): Exclusivo para Badges, Pílulas de Categoria, Avatares e Checkboxes Circulares.

---

## 🎯 3. Referências Visuais de Origem (UI Foundations)

O sistema foi sintetizado a partir de 4 padrões visuais de nível mundial:
- **`ref-shadcn-bento.png`**: Bento Grid modular para aproveitamento máximo da tela.
- **`ref-kucoin-dashboard.png`**: Tabelas de alta densidade e mini gráficos Sparklines vetoriais.
- **`ref-habit-tracker.png`**: Micro-interações de checklist diário e filtros por pílulas com contadores.
- **`ref-toast-notifications.png`**: Notificações flutuantes semânticas em fundos pastel com borda de 1px.

---

## 4. Cobertura Obrigatória das Referências

| Referência | Padrões obrigatórios | Componentes canônicos |
| :--- | :--- | :--- |
| `ref-habit-tracker.png` | Pills com contador, checklist circular, cards de hábito e rotina por período | `FilterPillBar`, `HabitItemRow`, `NutriCheckbox`, `RoutineBlockOrganism`, `HabitTrackerSection` |
| `ref-kucoin-dashboard.png` | Sidebar persistente, cabeçalho de perfil, tabela densa e sparklines | `SidebarNav`, `PatientBadgeHeader`, `NutritionalSparklineTable`, `SparklineLine` |
| `ref-shadcn-bento.png` | Bento responsivo, métricas, stepper, histograma e formulários integrados | `BentoGridContainer`, `MacroMetricCard`, `NutriStepper`, `GoalHistogram`, `RadioCards`, `NutriSwitch`, `TacoFoodSelector` |
| `ref-toast-notifications.png` | Stack, quatro variantes, badge pastel sólido, ícone Lucide e fechar | `NutriToast`, `NutriToastStack` |

Todos os padrões acima devem ter valor textual acessível, navegação por teclado e estado de foco visível. Gráficos nunca podem depender somente de cor ou hover.

## 5. Pilares de UX Verificáveis

1. **Acessibilidade**: contraste WCAG 2.1 AA; texto principal prioriza AAA; foco visível; labels reais; ARIA apropriado.
2. **Toque e teclado**: alvo mínimo de 44×44px em touch, distância mínima de 8px entre ações e ordem de tabulação igual à ordem visual.
3. **Responsividade**: mobile-first, sem rolagem horizontal da página; tabelas densas usam container próprio ou representação em cards.
4. **Feedback**: toda ação assíncrona percorre `idle → loading → success|error`; o estado não é comunicado apenas por cor.
5. **Dados**: sparklines e histogramas exibem valor/resumo textual e fornecem fallback tabular quando representam informação essencial.
6. **Desempenho percebido**: espaço de conteúdo assíncrono é reservado por skeleton para impedir layout shift.
