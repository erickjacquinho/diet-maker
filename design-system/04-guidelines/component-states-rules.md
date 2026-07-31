# 04-guidelines / component-states-rules — Regras Universais de Estados & Elevação Flat

> **NutriDiet Design System — Matrizes de Interatividade, Validação e Camadas Z-Index**

---

## 🎨 1. Matriz Universal para Uso de Cards & Regras de Hover

| Tipo de Card | Fundo (Resting) | Borda (Resting) | Estado Hover | Quando USAR Hover | Quando NÃO USAR Hover |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Card Informativo Estático** | `#ffffff` (`bg-warm-card`) | 1px sólida `#e8e4dc` (`border-warm-border`) | **SEM HOVER** (Fixo) | Nunca. | Em painéis de estatísticas somente leitura, resumos de relatórios e contêineres de texto estáticos. |
| **Card Interativo / Clicável** | `#ffffff` (`bg-warm-card`) | 1px sólida `#e8e4dc` (`border-warm-border`) | BG: `#faf8f5`<br>Border: `1px #d6cfc4`<br>Cursor: `pointer`<br>Transition: `150ms` | Em cartões de hábitos clicáveis, alimentos da lista, cards de paciente e itens selecionáveis da tabela TACO. | Em cartões que contêm botões e inputs internos que já possuem suas próprias interações. |
| **Card Selecionado / Ativo** | `#ffffff` (`bg-warm-card`) | 2px sólida `#111827` (ou `#047857`) | Border: Mantém 2px ativa<br>BG: `#faf8f5` sutil | Para indicar a refeição atualmente em edição, o paciente selecionado ou a opção ativa em um grupo de escolha. | Em listas de múltipla escolha sem estado de foco primário. |
| **Sub-contêiner Interno** | `#faf8f5` (`bg-warm-inner`) | 1px sólida `#e8e4dc` (`border-warm-border`) | BG: `#f0ebe1` (apenas se for interativo) | Em blocos de rotina aninhados (`Morning`/`Evening`), áreas de upload e sub-tabelas dentro de um card Bento principal. | Em blocos internos puramente estruturais. |

---

## 🥞 2. Hierarquia de Elevação Flat & Tabela Z-Index

Como o sistema segue a regra **Zero Box-Shadow**, a elevação e profundidade são construídas via contraste de superfícies e Z-index:

```
Level 0: Canvas Base (#f5f2eb / bg-warm-bg) [z-base: 0]
 └── Level 1: Bento Cards e Sidebar (#ffffff + Borda #e8e4dc) [z-card: 10]
      └── Level 2: Sub-contêineres (#faf8f5) [z-subcontainer: 20]
           └── Level 3: Dropdowns, Selects e Tooltips [z-dropdown: 30]
                └── Level 4: Toasts Flutuantes [z-toast: 40]
                     └── Level 5a: Backdrop Dimmed [z-modal-backdrop: 50]
                          └── Level 5b: Conteúdo de Dialog [z-modal-content: 60]
```

---

## 📝 3. Padrões de Formulários & Estados de Validação

1. **Input Foco**: `focus-visible:outline-none focus-visible:border-warm-borderDark focus-visible:ring-2 focus-visible:ring-warm-focus focus-visible:ring-offset-2 transition-all duration-150`.
2. **Input com Erro de Validação**:
   - Borda: `border-1.5 border-nutri-error-text` (`#be123c`).
   - Texto de Ajuda / Mensagem de Erro: `text-xs text-nutri-error-text font-body font-medium flex items-center gap-1 mt-1`.
3. **Input com Sucesso / Validação Positiva**:
   - Borda: `border-1.5 border-emerald-700` (`#047857`).
   - Mensagem de Sucesso: `text-xs text-emerald-700 font-body font-medium mt-1`.
4. **Select / Popover Trigger**:
   - Botão Trigger: BG `#ffffff`, borda 1px `#e8e4dc`, cantos `rounded-xl`, ícone `ChevronDown` à direita.
   - Lista Dropdown (Popover): BG `#ffffff`, borda 1.5px sólida `#d6cfc4`, cantos `rounded-xl`, padding `p-1.5`.
5. **Labels**:
   - Todo input, select, textarea, switch, checkbox e radio possui label visível associado por `htmlFor`/`id`.
   - Placeholder nunca substitui label.
6. **Envio**:
   - Estado `loading` bloqueia envio duplicado e expõe `aria-busy`.
   - Sucesso e erro são apresentados junto ao formulário e anunciados por live region.

---

## ⏳ 4. Padrões de Skeleton Loading & Empty States

### 4.1 Skeleton Loading
Para dar feedback visual durante carregamentos assíncronos:
- **Componente**: `<NutriSkeleton className="h-6 w-full" />`
- **Animação**: Pulso suave alternando entre `#e8e4dc` e `#faf8f5` (`animate-pulse bg-warm-border rounded-xl`).

### 4.2 Empty States (Telas & Blocos Vazios)
Quando uma lista de refeições, hábitos ou pacientes estiver vazia:
- **Ícone**: Badge circular de 48x48px em fundo pastel `bg-warm-inner` com ícone Lucide SVG (ex: `Inbox` ou `Utensils`).
- **Título**: H2 (`font-display font-semibold text-lg text-warm-main`).
- **Subtítulo**: Body Small (`font-body text-sm text-warm-muted`).
- **Ação**: Botão `CreateButton` ou variante `emerald`.

---

## 5. Matriz universal de estados

| Estado | Aparência | Semântica |
| :--- | :--- | :--- |
| Default | Tokens-base | Sem atributo adicional |
| Hover | Mudança sólida de superfície/borda | Nunca é a única forma de revelar função essencial |
| Active | `scale(.98)` ou borda ativa | Mantém nome acessível |
| Focus-visible | Ring 2px + offset 2px | Visível para teclado |
| Disabled | Muted + cursor | `disabled` ou `aria-disabled` |
| Loading | Spinner + conteúdo estável | `aria-busy="true"` |
| Error | Borda + ícone + texto | `aria-invalid`, helper com `role="alert"` |
| Success | Borda + ícone + texto | Mensagem em `role="status"` |

Prioridade: `disabled > loading > error/success > active > focus-visible > hover > default`.

## 6. Interação por teclado e touch

- Enter/Space acionam botões, checkboxes e cards interativos.
- Escape fecha Dialog, Popover, Select e Toast dispensável e devolve foco ao gatilho.
- Setas navegam Tabs, RadioGroup e opções de Select.
- Nenhum fluxo possui keyboard trap fora de modal corretamente contido.
- Área touch mínima: 44×44px; gap mínimo entre ações: 8px.

## 7. Gráficos e dados

- Valor, unidade e tendência permanecem visíveis em texto.
- Cor é acompanhada por label, ícone, padrão ou posição.
- Gráfico essencial fornece tabela ou lista equivalente.
- Atualizações relevantes podem usar live region; não anunciar cada ponto de animação.
