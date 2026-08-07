# Implementation Tasks - Adequação do Dialog de Avaliação Física

## Tasks

- [ ] T001 [skill: vercel-composition-patterns] Desacoplar o estado do formulário e o cálculo de composição corporal de `EditAssessmentModal.tsx` (`draft`, `updateNumericField`, `calculateBodyComposition`) em um custom hook composável ou provedor de estado (`useAssessmentForm`), eliminando responsabilidades misturadas na modal.
- [ ] T002 [skill: vercel-composition-patterns] Decompor a renderização monolítica de `EditAssessmentModal.tsx` em sub-componentes declarativos (`AssessmentMeasurementField`, `TrunkAssessmentSection`, `LimbAssessmentSection`), eliminando duplicação de marcação HTML e estruturando abas com clareza.
- [ ] T003 [skill: frontend-design] Substituir todas as classes CSS Tailwind hardcoded e arbitrárias (`max-h-[85vh]`, `bg-surface-subtle/30`, `h-9`, `mt-1`), opacidades manuais e caixas de erro ad-hoc por tokens e componentes semânticos do Design System (`Surface`, `MetricBoxGroup`, `textStyle`, `Input`, `Dialog`).
- [ ] T004 [skill: general] Executar validação de tipos TypeScript (`npx tsc --noEmit`) e suíte de testes (`npm run test`) para confirmar zero regressões operacionais.
