# Tarefas de Implementação: Remoção de Mocks

**Diretório do Recurso**: `specs/30-07-26-remover-todos-os-mocks-das`
**Data**: 30/07/2026

## Lista de Tarefas Rastreáveis

- [x] T001 [skill: vercel-composition-patterns] Remover constantes de mocks (`MOCK_DIETS`, `MOCK_ASSESSMENTS`) em `src/lib/patientsStore.ts` e refatorar `getConsultationRecord` para buscar apenas dados reais de dietas e avaliações físicas salvas.
- [x] T002 [skill: vercel-composition-patterns] Refatorar `src/lib/recipesStore.ts` para que `getRecipesFromStorage()` retorne um array vazio `[]` quando não houver dados gravados no `localStorage`.
- [x] T003 [skill: frontend-design] Atualizar `src/app/pacientes/[id]/page.tsx` para inicializar os estados `dietHistory` e `bodyAssessments` como arrays vazios e adicionar componente visual para tratamento de paciente não encontrado.
- [x] T004 [skill: frontend-design] Refatorar `src/app/pacientes/[id]/consulta/[date]/page.tsx` removendo o paciente fallback hardcoded ("Paciente Sem Nome") e implementando o tratamento de estado limpo.
- [x] T005 [skill: tdd] Executar e atualizar os testes automatizados em `src/lib/__tests__/` garantindo que nenhuma asserção dependa de dados mockados e validando o comportamento com `localStorage` limpo.
- [x] T006 [skill: webapp-testing] Validar visualmente e via build de produção (`npm run build`) a ausência completa de dados mockados e o correto funcionamento das telas de estado vazio.
