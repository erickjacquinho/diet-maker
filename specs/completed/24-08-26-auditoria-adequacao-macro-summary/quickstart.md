# Quickstart: Validação e Uso do MacroSummary

## Guia de Execução Rápida

### 1. Testes Automatizados Unitários e de Integração

```bash
npx vitest run tests/components/molecules/MacroSummary.test.tsx
npx vitest run tests/components/molecules/CarbCyclingVariationPanel.test.tsx
npx vitest run tests/components/organisms/patient-diets-table.test.tsx
```

### 2. Validação Estática de Tipos e Atomic Design

```bash
npm run type-check
npm run audit:atomic-design
```

### 3. Exemplos de Uso do Componente

#### Com Calorias (Ex: Card de Ciclo de Carboidratos em `/dieta/nova`)
```tsx
<MacroSummary
  protein={150}
  carbs={286}
  fats={60}
  kcal={2284}
/>
```
*Resultado*: `P 150g • C 286g • G 60g • 2284 kcal` em uma única linha contínua sem quebras.

#### Sem Calorias (Ex: Tabela com coluna própria de calorias)
```tsx
<MacroSummary
  protein={150}
  carbs={220}
  fats={60}
  showKcal={false}
/>
```
*Resultado*: `P 150g • C 220g • G 60g` em uma única linha contínua sem quebras.
