# Especificação do Sistema: Reestruturação Modular do Design System NutriDiet

## 1. Visão Geral & Objetivo
Reestruturar e expandir a especificação do Design System **NutriDiet** a partir do protótipo inicial (`MASTER.md`), transformando-o em uma **arquitetura de documentação modular em Markdown (.md)** que cubra 100% dos requisitos visuais, de tokens, componentes, acessibilidade e submódulos do projeto.

---

## 2. Atores, Papéis e Jornadas
- **Designer / UI-UX Lead**: Define a linguagem visual, tokens de cores, tipografia, espaçamento e variantes de componentes.
- **Desenvolvedor Frontend (React / Next.js)**: Consome a documentação em `.md` para implementar componentes reutilizáveis, contratos de props e estilos via Tailwind CSS.
- **Engenheiro de Acessibilidade / QA**: Valida contraste WCAG 4.5:1, marcação ARIA, foco por teclado e responsividade.

---

## 3. Estrutura Modular Proposta para a Documentação (`design-system/nutridiet/`)

A especificação será dividida em arquivos Markdown organizados por responsabilidade para máxima legibilidade e facilidade de manutenção:

```
design-system/nutridiet/
├── MASTER.md                    # Fonte Única Global da Verdade (Visão Geral, Regras Mestras)
├── tokens/
│   ├── colors.md               # Paleta de Cores em 3 Camadas (Primitivos, Semânticos, Componentes)
│   ├── typography.md           # Famílias (Plus Jakarta Sans + Inter), Escalas e Pesos
│   ├── spacing-grid.md         # Escala de Espaçamento, Breakpoints e Z-Index
│   └── motion-flat-rules.md    # Regra Swiss Flat (Zero-shadow/gradient) e Transições (150-250ms)
├── components/
│   ├── atoms.md                # Átomos: Button, Input, Badge/Pill, Card, Avatar, ProgressBar, IconButton
│   ├── molecules.md            # Moléculas: MacroCard, MealItemRow, TacoSearchSelect, PatientBadge
│   └── organisms.md            # Organismos: SidebarNav, MacroTrackerHeader, MealCard, AdjustGoalsModal
└── pages/
    ├── diet-builder.md         # Específico: Tela de Montar Dieta / Dashboard Ativo
    ├── patients.md             # Específico: Gestão de Pacientes
    └── taco-database.md        # Específico: Tabela TACO / Consulta Alimentos
```

---

## 4. Requisitos Funcionais

### RF-01: Arquitetura de Design Tokens em 3 Camadas
- **Camada 1 (Primitivos)**: Hexadecimais puros (`stone-100` a `stone-900`, `emerald-500` a `emerald-900`, etc.).
- **Camada 2 (Semânticos)**: Mapeamento funcional (`--color-bg-app`, `--color-surface-card`, `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`, `--color-border-clean`, `--color-emerald`, `--color-rose`, `--color-amber`, `--color-teal`, `--color-terracotta`).
- **Camada 3 (Componentes)**: Variáveis específicas (`--button-primary-bg`, `--input-border-focus`, `--pill-rose-bg`).

### RF-02: Especificação de Componentes Atômicos & Variantes
- **Button**: Variantes (`primary`, `secondary`, `outline`, `ghost`, `destructive`), Tamanhos (`sm`, `md`, `lg`), Estados (`hover`, `active`, `focus-visible`, `disabled`, `loading`).
- **Input & SearchSelect**: Rótulo visível, texto auxiliar, mensagem de erro, suporte a ícone `Search` da biblioteca Lucide-React.
- **Badge / Pill**: Formato `rounded-full`, fundos suaves pastel (`bg-warm-*Bg`) com texto e borda na cor semântica correspondente.
- **ProgressBar**: Barra plana sem sombra, altura fixa de 8px, cores semânticas (`rose`, `amber`, `teal`, `emerald`) e atributos ARIA.
- **IconButton**: Quadrado/circular (`rounded-xl`), tamanho mínimo de clique de 44x44px em telas sensíveis ao toque, obrigatório `aria-label`.

### RF-03: Padronização de Ícones Visuais (Lucide Icons)
- Substituir emojis no layout (`🥗`, `👥`, `📚`, `📋`, `💾`, `📂`, `🗑️`, `✏️`) por especificações baseadas em SVG via **Lucide-React** (`Utensils`, `Users`, `BookOpen`, `ClipboardList`, `Save`, `FolderOpen`, `Trash2`, `Edit3`).

### RF-04: Diretrizes de Acessibilidade & UX (WCAG AA)
- Ratio de contraste mínimo de 4.5:1 para texto normal e 3:1 para texto grande/componentes.
- Anéis de foco nítidos (`ring-2 ring-warm-emerald ring-offset-2`) para navegação exclusiva por teclado.
- Respeito à preferência de movimento reduzido (`prefers-reduced-motion`).

---

## 5. Requisitos Não-Funcionais
- **RNF-01 (Manutenibilidade)**: Cada arquivo `.md` deve ser independente, curto e conter tabelas claros de visualização e snippets Tailwind CSS de referência.
- **RNF-02 (Escalabilidade)**: Adição de novas telas não deve alterar arquivos de componentes atômicos.
- **RNF-03 (Desempenho Visual)**: Zero dependência de bibliotecas de animação pesadas; transições puras CSS entre 150ms e 250ms.

---

## 6. Critérios de Aceite e Sucesso
1. Todos os arquivos da estrutura `design-system/nutridiet/` criados em formato Markdown legível.
2. Nenhuma regra do `MASTER.md` original violada (preservação integral dos hexadecimais de base `#f5f2eb`, `#ffffff`, `#111827`, etc.).
3. 100% dos componentes atômicos, moléculas e organismos documentados com suas variantes, estados e exemplos de código Tailwind.
