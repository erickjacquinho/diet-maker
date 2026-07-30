# Plano de Arquitetura e Implementação: Documentação Modular do Design System

## 1. Visão de Arquitetura da Documentação

A documentação será dividida em arquivos Markdown organizados de maneira lógica dentro de `design-system/nutridiet/`:

```
c:\Programmer\diet-maker\design-system\nutridiet\
├── MASTER.md                    # Mapeamento Global & Índice Geral
├── tokens/
│   ├── colors.md               # Tokens de Cores em 3 Camadas
│   ├── typography.md           # Tipografia, Pesos e Escala de Tipos
│   ├── spacing-grid.md         # Geometria, Espaçamentos, Radius e Z-Index
│   └── motion-flat-rules.md    # Swiss Flat Rules e Animações
├── components/
│   ├── atoms.md                # Átomos (Button, Input, Badge, Card, ProgressBar, IconButton)
│   ├── molecules.md            # Moléculas (MacroMetricCard, MealItemRow, TacoSearchInput)
│   └── organisms.md            # Organismos (SidebarNav, MacroTrackerHeader, MealCardContainer)
└── pages/
    ├── diet-builder.md         # Guia Específico: Montar Dieta / Dashboard
    └── patients.md             # Guia Específico: Lista de Pacientes
```

---

## 2. Detalhamento dos Arquivos a Serem Criados

### 2.1 Mapeamento Global (`MASTER.md`)
- Servirá como o índice mestre e contrato único da marca NutriDiet Local Pro.
- Conectará os links para os sub-arquivos de `tokens/`, `components/` e `pages/`.

### 2.2 Tokens de Cores (`tokens/colors.md`)
- Tabela completa de equivalência em CSS Variables e Tailwind Config (`bg-warm-bg`, `text-warm-charcoal`, `text-warm-secondary`, `text-warm-muted`, `border-warm-border`, `bg-warm-emeraldBg`, etc.).

### 2.3 Tipografia (`tokens/typography.md`)
- Configuração de `Plus Jakarta Sans` para títulos/números e `Inter` para corpo de texto/entradas de dados.
- Escalas de fonte (`text-xs` a `text-3xl`) e combinações recomendadas.

### 2.4 Geometria & Swiss Flat (`tokens/spacing-grid.md` & `motion-flat-rules.md`)
- Proibição absoluta de `box-shadow` e `background-image` gradientes.
- Escala de border-radius: `rounded-2xl` (cards/modais), `rounded-xl` (inputs/botões), `rounded-full` (badges).

### 2.5 Componentes Atômicos (`components/atoms.md`)
- Especificação em tabelas de Props, Variantes, Estados Interativos (`hover`, `active`, `focus-visible`, `disabled`) e snippets Tailwind CSS para cada um dos 7 átomos principais.

### 2.6 Moléculas & Organismos (`components/molecules.md` & `components/organisms.md`)
- Composição dos átomos para formar estruturas mais complexas de UI.

---

## 3. Plano de Validação
- **Verificação Visual**: Validação através de leitores Markdown e conferência contra o protótipo [demo_dashboard.html](file:///c:/Programmer/diet-maker/demo_dashboard.html).
- **Consistência de Tokens**: Garantir que nenhum token no `MASTER.md` original seja descontinuado ou alterado inadvertidamente.
