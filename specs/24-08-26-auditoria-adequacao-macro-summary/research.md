# Research: Auditoria e Adequação do Componente MacroSummary

## Decisão 1: Prevenção de Quebra de Linha (No-Wrap)
- **Decisão**: Adicionar `flex-nowrap whitespace-nowrap shrink-0` ao contêiner raiz do `MacroSummary` e remover classes legadas `flex-wrap` ou `sm:gap-2`.
- **Racional**: Garante que os macros (`P 150g • C 286g • G 60g • 2284 kcal`) fiquem sempre em linha única contínua, prevenindo desalinhamentos em tabelas e cards compactos.
- **Alternativas descartadas**:
  - Manter `flex-wrap`: Rejeitado pelo usuário e causava quebra visual feia entre o identificador `P` e o valor ou entre macros e calorias.
  - `overflow-hidden` forçado: Rejeitado porque deve ser o contêiner pai que decide o comportamento de overflow caso necessário.

## Decisão 2: Controle Explícito de Calorias (`showKcal`)
- **Decisão**: Introduzir a prop opcional `showKcal?: boolean`.
  - Se `showKcal === false`: Oculta as calorias e o separador correspondente, mesmo que `kcal` possua valor numérico.
  - Se `showKcal === true` ou omitido (padrão): Exibe calorias sempre que `kcal !== undefined && kcal !== null`.
- **Racional**: Permite reaproveitar objetos de dados completos (ex: `{ proteinG: 150, carbsG: 200, fatsG: 50, targetKcal: 2000 }`) em locais onde calorias não devem ser exibidas inline (ex: tabela onde calorias têm coluna própria).
- **Alternativas descartadas**:
  - Exigir deletar a propriedade `kcal`: Inconveniente e propenso a erros em componentes que repassam props completas.

## Decisão 3: Auditoria de Consumidores
- **Decisão**: Auditar todos os 8 pontos de consumo identificados e validar conformidade.
  1. `CarbCyclingVariationPanel`: exibe macros + kcal.
  2. `CycleMatrixModal`: exibe macros semanais com `showKcal={false}`.
  3. `PatientProfileCurrentContext`: exibe macros + kcal.
  4. `ConsultationHistoryRow`: exibe macros + kcal.
  5. `PatientDietsTable`: exibe macros com `showKcal={false}` (pois há coluna de calorias dedicada).
  6. `ConsultationDietCard`: exibe macros com `showKcal={false}` (pois há badge de kcal dedicado).
  7. `ReadOnlyDietModal`: exibe macros com `showKcal={false}`.
  8. `FoodSearchResultsList`: exibe macros + kcal com sufixo `kcalSuffix="kcal (por 100g)"`.
