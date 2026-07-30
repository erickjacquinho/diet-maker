# Checklist de Requisitos de Implementação do Atomic Design

## Nível 1: Átomos
- [x] `Button.tsx` implementado com todas as 5 variantes e 3 tamanhos.
- [x] `Badge.tsx` implementado com todas as pílulas semânticas pastel.
- [x] `Input.tsx` implementado com suporte a ref forwarding e estados de foco.
- [x] `ProgressBar.tsx` implementado com atributos ARIA e cores semânticas.
- [x] `IconButton.tsx` implementado com obrigatoriedade de `aria-label`.
- [x] `Avatar.tsx` implementado.

## Nível 2: Moléculas
- [x] `MacroMetricCard.tsx` composto exclusivamente por átomos primitivos.
- [x] `MealItemRow.tsx` composto por átomos e ícones Lucide-React (`Trash2`).
- [x] `PatientBadgeHeader.tsx` composto por Avatar, Badge e Button.
- [x] `TacoSearchInput.tsx` composto por Input e ícone de busca.

## Nível 3: Organismos
- [x] `SidebarNav.tsx` implementado como navegação de 240px.
- [x] `MacroTrackerHeader.tsx` implementado agrupando o paciente e os 4 cards de macros.
- [x] `MealCardContainer.tsx` implementado.

## Nível 4 e 5: Templates & Páginas
- [x] `DietBuilderTemplate.tsx` implementado em `src/components/templates/`.
- [x] `src/app/page.tsx` refatorada e validada.

