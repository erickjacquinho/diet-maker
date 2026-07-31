# 15 — Registro de componentes

## 1. Finalidade

Este registro separa o estado real do código de propostas e especificações futuras.

Data da verificação inicial: **31 de julho de 2026**.

Os itens abaixo foram classificados como `implementado` apenas porque possuem arquivo em `src/components`. Isso não certifica conformidade visual, acessibilidade, cobertura de testes ou estabilidade da API.

## 2. Campos do registro

Toda entrada futura deve possuir:

| Campo | Obrigatório | Descrição |
| --- | --- | --- |
| Nome | Sim | Exportação pública |
| Camada | Sim | `ui`, atom, molecule, organism ou template |
| Natureza | Sim | Genérico ou domínio |
| Estado | Sim | Proposto, experimental, implementado, migração necessária, estável, depreciado ou removido |
| Caminho | Sim | Local da implementação ou destino planejado |
| Propósito | Sim | Responsabilidade em uma frase |
| Base | Quando aplicável | Primitivo ou componente principal utilizado |
| Consumidores | Para estabilidade | Rotas ou componentes que usam a API |
| Versão/data | Para mudança de estado | Quando o estágio mudou |
| Substituto | Para depreciação | API recomendada |

## 3. Primitivos `ui`

| Nome | Natureza | Estado | Caminho |
| --- | --- | --- | --- |
| Badge | Genérico | Implementado | `src/components/ui/badge.tsx` |
| Button | Genérico | Implementado | `src/components/ui/button.tsx` |
| Card | Genérico | Implementado | `src/components/ui/card.tsx` |
| Dialog | Genérico | Implementado | `src/components/ui/dialog.tsx` |
| DropdownMenu | Genérico | Implementado | `src/components/ui/dropdown-menu.tsx` |
| Input | Genérico | Implementado | `src/components/ui/input.tsx` |
| Popover | Genérico | Implementado | `src/components/ui/popover.tsx` |
| ScrollArea | Genérico | Implementado | `src/components/ui/scroll-area.tsx` |
| Select | Genérico | Implementado | `src/components/ui/select.tsx` |
| Separator | Genérico | Implementado | `src/components/ui/separator.tsx` |
| Sheet | Genérico | Implementado | `src/components/ui/sheet.tsx` |
| Table | Genérico | Implementado | `src/components/ui/table.tsx` |
| Tabs | Genérico | Implementado | `src/components/ui/tabs.tsx` |
| Tooltip | Genérico | Implementado | `src/components/ui/tooltip.tsx` |
| Textarea | Genérico | Proposto | `src/components/ui/textarea.tsx` |

## 4. Atoms

| Nome | Natureza | Estado | Caminho |
| --- | --- | --- | --- |
| Avatar | Genérico | Implementado | `src/components/atoms/Avatar.tsx` |
| Badge | Genérico | Implementado | `src/components/atoms/Badge.tsx` |
| Button | Genérico | Implementado | `src/components/atoms/Button.tsx` |
| IconButton | Genérico | Implementado | `src/components/atoms/IconButton.tsx` |
| Input | Genérico | Implementado | `src/components/atoms/Input.tsx` |
| ProgressBar | Genérico | Implementado | `src/components/atoms/ProgressBar.tsx` |
| Skeleton | Genérico | Proposto | `src/components/atoms/Skeleton.tsx` |
| Spinner | Genérico | Proposto | `src/components/atoms/Spinner.tsx` |

## 5. Molecules

| Nome | Natureza | Estado | Caminho |
| --- | --- | --- | --- |
| AutoKcalSection | Domínio | Implementado | `src/components/molecules/AutoKcalSection.tsx` |
| DietModeSwitcher | Domínio | Implementado | `src/components/molecules/DietModeSwitcher.tsx` |
| FoodSearchModal | Domínio | Implementado | `src/components/molecules/FoodSearchModal.tsx` |
| MacroMetricCard | Domínio | Implementado | `src/components/molecules/MacroMetricCard.tsx` |
| MealItemRow | Domínio | Implementado | `src/components/molecules/MealItemRow.tsx` |
| PatientBadgeHeader | Domínio | Implementado | `src/components/molecules/PatientBadgeHeader.tsx` |
| ReadOnlyDietModal | Domínio | Implementado | `src/components/molecules/ReadOnlyDietModal.tsx` |
| RecipeCard | Domínio | Implementado | `src/components/molecules/RecipeCard.tsx` |
| RecipeIngredientRow | Domínio | Implementado | `src/components/molecules/RecipeIngredientRow.tsx` |
| SidebarBrand | Genérico do produto | Implementado | `src/components/molecules/SidebarBrand.tsx` |
| SidebarNavItem | Genérico | Implementado | `src/components/molecules/SidebarNavItem.tsx` |
| SidebarQuickActions | Genérico do produto | Implementado | `src/components/molecules/SidebarQuickActions.tsx` |
| SidebarUserProfile | Genérico do produto | Implementado | `src/components/molecules/SidebarUserProfile.tsx` |
| TacoSearchInput | Domínio | Implementado | `src/components/molecules/TacoSearchInput.tsx` |
| FormField | Genérico | Proposto | `src/components/molecules/FormField.tsx` |

`Genérico do produto` indica composição sem regra nutricional, mas acoplada à identidade ou estrutura do aplicativo. Em revisão futura, cada caso deve ser confirmado como genérico reutilizável ou composição de domínio.

## 6. Organisms

| Nome | Natureza | Estado | Caminho |
| --- | --- | --- | --- |
| MacroTrackerHeader | Domínio | Implementado | `src/components/organisms/MacroTrackerHeader.tsx` |
| MealCardContainer | Domínio | Implementado | `src/components/organisms/MealCardContainer.tsx` |
| SidebarNav | Genérico do produto | Implementado | `src/components/organisms/SidebarNav.tsx` |

## 7. Templates

| Nome | Natureza | Estado | Caminho |
| --- | --- | --- | --- |
| AppLayoutShell | Genérico do produto | Implementado | `src/components/templates/AppLayoutShell.tsx` |
| DietBuilderTemplate | Domínio | Implementado | `src/components/templates/DietBuilderTemplate.tsx` |

## 8. Propostos e experimentais

As propostas desta versão possuem consumidores ou estados reais identificados:

| Componente | Motivo |
| --- | --- |
| Textarea | Existem quatro textareas nativas |
| FormField | Padronizar label, helper, erro e associação |
| Spinner | Padronizar loading de controles |
| Skeleton | Padronizar loading estrutural |

Outros itens descritos em PRDs ou no Design System visual, mas sem consumidor real, **não foram promovidos automaticamente**. Devem passar pelo [modelo de decisão](./09-component-decision-model.md).

## 9. Migrações de camada

| Componente atual | Camada atual | Camada-alvo | Motivo |
| --- | --- | --- | --- |
| DietModeSwitcher | Molecule | Organism | Coordena seção e múltiplos estados |
| FoodSearchModal | Molecule | Organism | Fluxo completo dentro de dialog |
| ReadOnlyDietModal | Molecule | Organism | Seção modal completa |
| SidebarBrand | Reexporta organism | Molecule independente | Corrigir dependência ascendente |
| SidebarNavItem | Reexporta organism | Molecule independente | Corrigir dependência ascendente |
| SidebarQuickActions | Reexporta organism | Molecule independente | Corrigir dependência ascendente |
| SidebarUserProfile | Reexporta organism | Molecule independente | Corrigir dependência ascendente |

## 10. Template para nova entrada

```md
| ComponentName | Genérico ou domínio | Proposto | `src/components/.../ComponentName.tsx` |
```

Além da linha, a proposta deve apontar para o contrato e identificar o primeiro consumidor.

## 11. Registro de decisões

Decisões locais ficam na própria alteração. Use a tabela abaixo apenas para decisões que afetem o catálogo ou suas regras:

| Data | Decisão | Motivo | Componentes afetados | Referência |
| --- | --- | --- | --- | --- |
| 2026-07-31 | Separar implementado de planejado | Evitar que documentação seja interpretada como disponibilidade | Todo o catálogo | Criação deste registro |
| 2026-07-31 | Propor Textarea, FormField, Spinner e Skeleton | Existem consumidores e estados reais sem contrato comum | Formulários e loading | Especificação completa |
| 2026-07-31 | Corrigir classificação de overlays e sidebar | Responsabilidade e direção de dependência atuais não correspondem à arquitetura | 7 componentes | Especificação completa |

## 12. Manutenção

Atualize este arquivo na mesma alteração que:

- adiciona ou remove componente público;
- promove ou deprecia uma API;
- move componente entre camadas;
- altera sua natureza genérica ou de domínio;
- substitui a implementação pública.

Uma busca pelo caminho e pelo nome da exportação deve confirmar o estado antes da atualização.
