# Especificação da Tela: Montar Dieta / Dashboard (`diet-builder.md`)

> 🥗 Guia de implementação específico para a tela de Elaboração de Plano Alimentar do NutriDiet Local Pro.

---

## 1. Estrutura da Página & Layout Grid

```
+-----------------------------------------------------------------------------------+
|  Sidebar (240px) | Top Action Bar (Título + Botões Rápidos)                        |
|                  |----------------------------------------------------------------|
|  - Logo          | Section: MacroTrackerHeader                                    |
|  - Nav Links     | [ Paciente Info + Metas ]                                      |
|  - Perfil Dr.    | [ Kcal ] [ Proteínas ] [ Carboidratos ] [ Gorduras ]           |
|                  |----------------------------------------------------------------|
|                  | Section: MealCards Grid (grid-cols-1 md:grid-cols-2)           |
|                  | [ Refeição 1: Café da Manhã ]  [ Refeição 2: Almoço ]           |
|                  | [ Refeição 3: Lanche Tarde ]   [ Refeição 4: Jantar ]           |
+-----------------------------------------------------------------------------------+
```

---

## 2. Ações Rápidas do Cabeçalho Superior

- `+ Nova Refeição`: Botão primário (`bg-warm-emerald text-white rounded-xl`).
- `% Escalar Dieta`: Botão secundário (`bg-warm-card border border-warm-border text-warm-charcoal rounded-xl`).
- `💬 WhatsApp`: Botão secundário (`bg-warm-card border border-warm-border text-warm-charcoal rounded-xl`).
- `📄 PDF`: Botão secundário (`bg-warm-card border border-warm-border text-warm-charcoal rounded-xl`).

---

## 3. Protótipo de Referência
- A implementação fiel desta tela em HTML limpo encontra-se no arquivo [demo_dashboard.html](file:///c:/Programmer/diet-maker/demo_dashboard.html).
