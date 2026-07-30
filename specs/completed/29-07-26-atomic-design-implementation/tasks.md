# Lista de Tarefas de Implementação do Atomic Design em Código

## Fase 1: Átomos Primitivos (`src/components/atoms/`)
- [x] T001 [skill: ui-ux-pro-max] Implementar `src/components/atoms/Button.tsx` com variantes `primary`, `secondary`, `terracotta`, `ghost`, `danger` e suporte a tamanhos.
- [x] T002 [skill: ui-ux-pro-max] Implementar `src/components/atoms/Badge.tsx` com pílulas semânticas pastel (`emerald`, `rose`, `amber`, `teal`, `neutral`).
- [x] T003 [skill: ui-ux-pro-max] Implementar `src/components/atoms/Input.tsx` e `src/components/atoms/ProgressBar.tsx` com acessibilidade ARIA.
- [x] T004 [skill: ui-ux-pro-max] Implementar `src/components/atoms/IconButton.tsx` e `src/components/atoms/Avatar.tsx`.
- [x] T005 [skill: frontend-architecture-mindset] Criar `src/components/atoms/index.ts` exportando todos os átomos.

## Fase 2: Moléculas (`src/components/molecules/`)
- [x] T006 [skill: ui-ux-pro-max] Implementar `src/components/molecules/MacroMetricCard.tsx`.
- [x] T007 [skill: ui-ux-pro-max] Implementar `src/components/molecules/MealItemRow.tsx` integrando ícones Lucide-React (`Trash2`).
- [x] T008 [skill: ui-ux-pro-max] Implementar `src/components/molecules/PatientBadgeHeader.tsx` e `TacoSearchInput.tsx`.
- [x] T009 [skill: frontend-architecture-mindset] Criar `src/components/molecules/index.ts` exportando todas as moléculas.

## Fase 3: Organismos (`src/components/organisms/`)
- [x] T010 [skill: ui-ux-pro-max] Implementar `src/components/organisms/SidebarNav.tsx` (navegação lateral fixa de 240px).
- [x] T011 [skill: ui-ux-pro-max] Implementar `src/components/organisms/MacroTrackerHeader.tsx` e `src/components/organisms/MealCardContainer.tsx`.
- [x] T012 [skill: frontend-architecture-mindset] Criar `src/components/organisms/index.ts` exportando todos os organismos.

## Fase 4: Templates & Refatoração de Página (`src/components/templates/` & `src/app/`)
- [x] T013 [skill: frontend-architecture-mindset] Implementar `src/components/templates/DietBuilderTemplate.tsx`.
- [x] T014 [skill: nextjs-fullstack-master] Refatorar a página principal `src/app/page.tsx` para utilizar a nova arquitetura atômica.
