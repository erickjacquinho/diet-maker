# Research: Refatoração do botão Puxar Metas Anteriores com Modal de Seleção de Dietas

## 1. Contexto e Problema Atual

Atualmente, na tela de elaboração de dieta (`/dieta/nova`), existe um botão simples 'Puxar Metas Anteriores' na barra de ações de metas (`src/components/templates/DietBuilderTemplate.tsx`). 
Ao ser clicado, a função `handlePullPreviousGoals` em `src/hooks/useDietBuilderPage.ts`:
1. Busca automaticamente a primeira dieta do array `getPatientDietsFromStorage(patientId)`.
2. Se não houver, busca em `patient.dietHistory[0]`.
3. Puxa cegamente os macros (P, C, G, kcal) dessa primeira dieta encontrada para o rascunho atual.

Limitações atuais:
- O nutricionista não pode escolher de qual dieta anterior deseja importar os dados quando o paciente tem múltiplos históricos de consultas.
- O nutricionista não tem opção de duplicar as refeições completas (alimentos, gramaturas, horários) de uma dieta anterior para criar uma nova variação rápida.
- O botão não reflete de forma explícita o estado desabilitado quando o paciente não possui nenhuma dieta anterior cadastrada.

## 2. Decisões Técnicas

### 2.1. Arquitetura do Modal (Atomic Design)
- **Localização**: `src/components/molecules/ImportPreviousDietModal.tsx`.
- **Composição**: Utiliza `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter` de `src/components/ui/dialog`, `Table` de `src/components/ui/table` e `Button`/`Badge` dos átomos/UI canônicos.
- **Design System**: Consome tokens canônicos (`textStyle`, `colors`, espaçamentos compact/standard desktop) conforme `design-system/README.md`.

### 2.2. Obtenção e Normalização das Dietas Anteriores
- As dietas anteriores do paciente são recuperadas combinando:
  1. `getPatientDietsFromStorage(patientId)` (planos completos estruturados `FullDietPlan`).
  2. `patient.dietHistory` (registros históricos resumidos `HistoricalDiet`).
- Itens com `id === 'nova'` ou `id === dietaId` atual são filtrados para não listar o próprio rascunho em edição.
- As dietas são ordenadas da mais recente para a mais antiga (pela data de prescrição/atualização).

### 2.3. Duplicação Segura (Isolamento de Estado)
- **Puxar apenas os macros**:
  - Copia `simpleTargetProtein`, `simpleTargetCarbs`, `simpleTargetFats` e `simpleTargetKcal` (ou metas da variação no caso de ciclo).
  - Mantém o array de refeições `simpleMeals` inalterado.
- **Puxar todas as refeições**:
  - Clona profundamente o plano de origem.
  - Para garantir integridade no React e nas operações de edição/remoção, novos identificadores únicos (`id: diet-meal-...` e `id: food-...`) são atribuídos às refeições e aos itens alimentares clonados.
  - O `id` do plano atual é mantido estritamente como `'nova'` (ou o `dietaId` da rota atual), garantindo que ao salvar seja disparada a criação de um novo registro, preservando 100% o registro histórico original.

### 2.4. Comportamento do Botão de Acionamento
- Se `previousDiets.length === 0`:
  - O botão na barra de ações exibe estado `disabled`.
  - Tooltip/title indica 'Nenhuma dieta anterior cadastrada para este paciente'.
- Se `previousDiets.length > 0`:
  - O botão fica ativo (`variant="secondary"`, tamanho `compact`) com ícone `History` e rótulo 'Puxar Metas Anteriores'.
  - O clique abre o modal de seleção.

## 3. Conformidade com a Constituição

- **Atomic Design**: O modal é uma Molecule (`src/components/molecules/ImportPreviousDietModal.tsx`); a orquestração de estado fica nos hooks (`useDietBuilderModals.ts`, `useDietBuilderPage.ts`); a página (`src/app/pacientes/[id]/dieta/[dietaId]/page.tsx`) conecta os callbacks.
- **Canônico**: Utiliza os componentes de UI e tokens sem inventar classes ad-hoc.
- **Desktop e Acessibilidade**: Interface desktop (>=1024px), acessível por teclado (foco retido no modal, seleção via rádio/teclas, tecla Escape para fechar, aria-labels descritivos).
