# Especificação de Organismos - NutriDiet Design System

> 🏛️ **Organismos**: Componentes complexos da interface que combinam moléculas e átomos para gerenciar seções completas de uma aplicação.

---

## 1. `SidebarNav` (Navegação Fixa Lateral)

### 1.1 Especificações Técnicas
- **Largura Fixa**: `240px` (`w-60` em Tailwind).
- **Posicionamento**: `sticky top-0 h-screen`.
- **Fundo & Borda**: Fundo `#ffffff` (`bg-warm-card`) com borda direita `#e8e4dc` (`border-r border-warm-border`).
- **Composição**:
  - Logo e marca NutriDiet Pro.
  - Links de navegação com pílulas interativas de item ativo (`bg-warm-charcoal text-white`).
  - Card de perfil do nutricionista no rodapé com ações rápidas "Salvar" e "Abrir".

---

## 2. `MacroTrackerHeader` (Card Mestre de Metas Nutricionais)

### 2.1 Especificações Técnicas
- Contém o `PatientBadgeHeader` no topo.
- Contém um grid de 4 colunas (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`) composto por instâncias de `MacroMetricCard`:
  1. Kcal Total
  2. Proteínas (Carmim)
  3. Carboidratos (Âmbar)
  4. Gorduras (Teal)

---

## 3. `MealCardContainer` (Card de Refeição)

### 3.1 Especificações Técnicas
- Container Principal: `bg-warm-card border border-warm-border rounded-2xl p-6 space-y-4`.
- **Header**: Nome da Refeição (ex: "Café da Manhã"), horário formatado (`07:30`) e badges contendo totais de Kcal, P, C, G.
- **Corpo**: Lista flexível de `MealItemRow`.
- **Autocomplete**: Input de busca para consultar a base TACO.
- **Rodapé**: Ações de duplicar refeição, escalar porcentagem e excluir.
