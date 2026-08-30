# Histórico de ciclo de carboidratos no perfil Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer o histórico de prescrições do perfil representar dietas de ciclo de carboidratos com média semanal ponderada e detalhes expansíveis das variações.

**Architecture:** `buildPatientDietHistory` continuará sendo o único adaptador entre `FullDietPlan` persistido e a visão `HistoricalDiet`, mas passará a preservar o modo, as variações e os metadados necessários à leitura. `PatientDietsTable` continuará responsável apenas pela apresentação, controlando uma expansão por vez por meio do contrato existente de `DataTable`; dietas simples manterão o caminho atual.

**Tech Stack:** Next.js App Router, React 19, TypeScript, `calculateWeeklyCycleAverage`, `DataTable`, componentes Shadcn existentes, Lucide React e Vitest + Testing Library.

## Global Constraints

- Usar a ordem canônica proteína → carboidrato → gordura → calorias ao apresentar macros e energia.
- Manter tabela semântica, caption acessível, unidades explícitas, foco visível e controles acionáveis por teclado.
- Usar espaçamento/raios/tokens já existentes; não introduzir cores Hex, utilitários arbitrários ou novos primitivos em `src/components/ui`.
- Não alterar o schema persistido de `FullDietPlan`, o construtor de dietas, a matriz de ciclo ou a tabela/modal de importação.
- Preservar as alterações locais existentes em `.specify/`, `src/components/molecules/DataTable.tsx`, `src/components/molecules/FoodSearchModal.tsx`, `src/components/molecules/ImportPreviousDietModal.tsx`, `src/lib/dietDuplication.ts` e seus testes.

---

### Task 1: Enriquecer a visão de histórico para ciclos

**Files:**
- Modify: `src/lib/patientsStoreTypes.ts` — extrair o tipo de refeição histórica e adicionar metadados opcionais de modo/variações.
- Modify: `src/lib/patientProfileSelectors.ts` — mapear `FullDietPlan` de ciclo e usar a média semanal ponderada.
- Test: `tests/lib/patient-profile-selectors.test.ts` — cobrir médias, modo, dias e contagem de refeições.

**Interfaces:**
- Consumes: `StoredDietRecord`, `CarbCyclingVariation` e `calculateWeeklyCycleAverage` de `src/lib/dietStore.ts`.
- Produces: `HistoricalDiet.mode`, `HistoricalDiet.carbCyclingVariations` e `buildPatientDietHistory(records)` com metas agregadas corretas.

- [ ] **Step 1: Escrever o teste que falha para o adaptador de ciclo**

Adicionar ao arquivo `tests/lib/patient-profile-selectors.test.ts` os imports `buildPatientDietHistory` e `type FullDietPlan`, e este caso:

```ts
it('maps carb cycling plans to a weighted weekly history summary', () => {
  const cycle: FullDietPlan = {
    id: 'diet-cycle',
    patientId: 'patient-1',
    name: 'Ciclo de Carboidratos',
    createdAt: '20/08/2026',
    updatedAt: '20/08/2026',
    mode: 'carb_cycling',
    simpleTargetKcal: 0,
    simpleTargetProtein: 0,
    simpleTargetCarbs: 0,
    simpleTargetFats: 0,
    simpleMeals: [],
    carbCyclingVariations: [
      {
        id: 'high',
        name: 'Dia Alto Carbo',
        type: 'high',
        assignedDays: ['seg', 'qua', 'sex'],
        targetKcal: 2300,
        targetProtein: 180,
        targetCarbs: 260,
        targetFats: 55,
        meals: [{ id: 'meal-high', name: 'Café', time: '08:00', items: [] }],
      },
      {
        id: 'low',
        name: 'Dia Baixo Carbo',
        type: 'low',
        assignedDays: ['ter', 'qui', 'sab', 'dom'],
        targetKcal: 1950,
        targetProtein: 180,
        targetCarbs: 150,
        targetFats: 55,
        meals: [],
      },
    ],
  };

  const [history] = buildPatientDietHistory([cycle]);

  expect(history).toMatchObject({
    id: 'diet-cycle',
    mode: 'carb_cycling',
    targetKcal: 2100,
    proteinG: 180,
    carbsG: 197,
    fatsG: 55,
  });
  expect(history.carbCyclingVariations).toEqual([
    expect.objectContaining({
      id: 'high',
      name: 'Dia Alto Carbo',
      assignedDays: ['seg', 'qua', 'sex'],
      targetKcal: 2300,
      proteinG: 180,
      carbsG: 260,
      fatsG: 55,
      mealsCount: 1,
    }),
    expect.objectContaining({
      id: 'low',
      assignedDays: ['ter', 'qui', 'sab', 'dom'],
      mealsCount: 0,
    }),
  ]);
});
```

- [ ] **Step 2: Rodar o teste para confirmar a falha**

Run: `npm test -- tests/lib/patient-profile-selectors.test.ts`

Expected: FAIL porque `buildPatientDietHistory` ainda retorna os `simpleTarget*` e não produz `mode` nem `carbCyclingVariations`.

- [ ] **Step 3: Adicionar os tipos de snapshot histórico**

Em `src/lib/patientsStoreTypes.ts`, substituir o tipo inline de `HistoricalDiet.meals` por tipos nomeados e acrescentar os campos opcionais:

```ts
export interface HistoricalDietMeal {
  name: string;
  time: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  itemsSummary?: string;
}

export type HistoricalDietVariationType = 'high' | 'medium' | 'low' | 'zero' | 'custom';

export interface HistoricalDietVariation {
  id: string;
  name: string;
  type: HistoricalDietVariationType;
  assignedDays?: string[];
  targetKcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  mealsCount: number;
}

export interface HistoricalDiet {
  id: string;
  name: string;
  date: string;
  targetKcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  status: 'Ativa' | 'Histórica';
  mode?: 'simple' | 'carb_cycling';
  carbCyclingVariations?: HistoricalDietVariation[];
  meals?: HistoricalDietMeal[];
}
```

- [ ] **Step 4: Implementar o mapeamento ponderado**

Em `src/lib/patientProfileSelectors.ts`, importar `calculateWeeklyCycleAverage` e `type CarbCyclingVariation`, criar o adaptador de variação e substituir o corpo de `buildPatientDietHistory` pelo fluxo que distingue ciclo de dieta simples:

```ts
function mapHistoricalVariation(variation: CarbCyclingVariation): HistoricalDietVariation {
  return {
    id: String(variation.id),
    name: variation.name || 'Variação de carboidratos',
    type: variation.type || 'custom',
    assignedDays: Array.isArray(variation.assignedDays) ? [...variation.assignedDays] : [],
    targetKcal: Number(variation.targetKcal) || 0,
    proteinG: Number(variation.targetProtein) || 0,
    carbsG: Number(variation.targetCarbs) || 0,
    fatsG: Number(variation.targetFats) || 0,
    mealsCount: Array.isArray(variation.meals) ? variation.meals.length : 0,
  };
}

export function buildPatientDietHistory(records: StoredDietRecord[]): HistoricalDiet[] {
  const mapped = records.map((record, index) => {
    const mode = record.mode === 'carb_cycling' ? 'carb_cycling' : 'simple';
    const variations = mode === 'carb_cycling' && Array.isArray(record.carbCyclingVariations)
      ? record.carbCyclingVariations as CarbCyclingVariation[]
      : [];
    const cycleAverage = variations.length > 0 ? calculateWeeklyCycleAverage(variations) : null;

    const simpleProtein = numericRecordValue(record, 'simpleTargetProtein');
    const simpleCarbs = numericRecordValue(record, 'simpleTargetCarbs');
    const simpleFats = numericRecordValue(record, 'simpleTargetFats');

    return {
      id: String(record.id ?? `diet-${index}`),
      name: String(record.name ?? 'Prescrição Alimentar'),
      date: String(record.date ?? record.updatedAt ?? record.createdAt ?? ''),
      targetKcal: cycleAverage?.avgKcal ?? numericRecordValue(record, 'simpleTargetKcal'),
      proteinG: cycleAverage?.avgProtein ?? simpleProtein,
      carbsG: cycleAverage?.avgCarbs ?? simpleCarbs,
      fatsG: cycleAverage?.avgFats ?? simpleFats,
      status: record.status === 'Histórica' ? 'Histórica' : 'Ativa',
      mode,
      carbCyclingVariations: mode === 'carb_cycling'
        ? variations.map(mapHistoricalVariation)
        : undefined,
    } satisfies HistoricalDiet;
  });

  const sorted = [...mapped].sort((left, right) =>
    (normalizePatientDateKey(right.date) ?? '').localeCompare(normalizePatientDateKey(left.date) ?? ''),
  );
  return sorted.map((diet, index) => ({ ...diet, status: index === 0 ? 'Ativa' : 'Histórica' }));
}
```

Keep the existing `numericRecordValue`, date normalization and status ordering. The empty-cycle case must retain the simple target fields and expose an empty variation array instead of calling the average helper with no variations.

- [ ] **Step 5: Rodar os testes do adaptador**

Run: `npm test -- tests/lib/patient-profile-selectors.test.ts`

Expected: PASS, including all existing selector tests and the new weighted-cycle case.

- [ ] **Step 6: Commitar a unidade de dados**

```bash
git add -- src/lib/patientsStoreTypes.ts src/lib/patientProfileSelectors.ts tests/lib/patient-profile-selectors.test.ts
git commit -m "fix(profile): preserve carb cycling history metadata"
```

### Task 2: Exibir e expandir variações na tabela do perfil

**Files:**
- Modify: `src/components/organisms/patient/PatientDietsTable.tsx` — adicionar identificação do modo, estado de expansão e detalhes das variações.
- Test: `tests/components/organisms/patient-diets-table.test.tsx` — cobrir média na linha e expansão sem disparar ações concorrentes.

**Interfaces:**
- Consumes: `HistoricalDiet.mode`, `HistoricalDiet.carbCyclingVariations` e o contrato de expansão de `DataTable`.
- Produces: botão `Ver variações de <nome>`, linha expandida com id estável e detalhes legíveis das variações.

- [ ] **Step 1: Escrever os testes de apresentação que falham**

No arquivo `tests/components/organisms/patient-diets-table.test.tsx`, importar `within` e adicionar uma dieta de ciclo ao conjunto de fixtures ou criar uma fixture local com esta forma:

```ts
const cycleDiet: HistoricalDiet = {
  id: 'diet-cycle',
  name: 'Plano ciclo agosto',
  date: '24/08/2026',
  targetKcal: 2100,
  proteinG: 180,
  carbsG: 197,
  fatsG: 55,
  status: 'Ativa',
  mode: 'carb_cycling',
  carbCyclingVariations: [
    {
      id: 'high',
      name: 'Dia Alto Carbo',
      type: 'high',
      assignedDays: ['seg', 'qua', 'sex'],
      targetKcal: 2300,
      proteinG: 180,
      carbsG: 260,
      fatsG: 55,
      mealsCount: 4,
    },
    {
      id: 'low',
      name: 'Dia Baixo Carbo',
      type: 'low',
      assignedDays: ['ter', 'qui', 'sab', 'dom'],
      targetKcal: 1950,
      proteinG: 180,
      carbsG: 150,
      fatsG: 55,
      mealsCount: 3,
    },
  ],
};
```

Adicionar estes casos:

```ts
it('renders the weighted cycle summary and mode label', () => {
  render(<PatientDietsTable patientId="p1" diets={[cycleDiet]} onOpenReadOnlyDiet={vi.fn()} />);

  expect(screen.getByText('Ciclo de Carboidratos')).toBeInTheDocument();
  expect(screen.getByText('2100 kcal')).toBeInTheDocument();
  expect(screen.getByText(/P\s*180g/)).toBeInTheDocument();
  expect(screen.getByText(/C\s*197g/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Ver variações de Plano ciclo agosto' })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
});

it('expands and collapses cycle variations without triggering the diet action', () => {
  const handleOpen = vi.fn();
  render(<PatientDietsTable patientId="p1" diets={[cycleDiet]} onOpenReadOnlyDiet={handleOpen} />);

  const expandButton = screen.getByRole('button', { name: 'Ver variações de Plano ciclo agosto' });
  expect(screen.queryByText('Variações do ciclo')).not.toBeInTheDocument();

  fireEvent.click(expandButton);

  expect(expandButton).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByText('Variações do ciclo')).toBeInTheDocument();
  expect(screen.getByText('Dia Alto Carbo')).toBeInTheDocument();
  expect(screen.getByText('Seg, Qua, Sex')).toBeInTheDocument();
  expect(screen.getByText('2300', { exact: true })).toBeInTheDocument();
  expect(screen.getByText('4 refeições')).toBeInTheDocument();
  expect(handleOpen).not.toHaveBeenCalled();

  fireEvent.click(expandButton);
  expect(screen.queryByText('Variações do ciclo')).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Rodar o teste para confirmar a falha**

Run: `npm test -- tests/components/organisms/patient-diets-table.test.tsx`

Expected: FAIL porque a tabela não conhece `mode`, não tem botão de expansão nem `renderExpandedRow`.

- [ ] **Step 3: Implementar a linha de detalhes e o estado controlado**

Em `src/components/organisms/patient/PatientDietsTable.tsx`:

1. importar `useState`, `Calendar`, `ChevronDown`, `DAYS_OF_WEEK` e `HistoricalDietVariation`;
2. adicionar os helpers abaixo antes de `DietTableRow`;
3. adicionar `isExpanded` e `onToggleExpand` às props da linha;
4. renderizar o badge de modo e o botão acessível na célula do plano;
5. adicionar `expandedDietId` e passá-lo ao `DataTable`.

```tsx
function formatAssignedDays(days: string[] = []): string {
  return days
    .map((dayId) => DAYS_OF_WEEK.find((day) => day.id === dayId)?.shortLabel ?? dayId)
    .join(', ');
}

function DietCycleDetails({ diet }: { diet: HistoricalDiet }) {
  const variations = diet.carbCyclingVariations ?? [];
  const daysAssigned = variations.reduce((total, variation) => total + (variation.assignedDays?.length ?? 0), 0);

  return (
    <TableRow id={`diet-cycle-details-${diet.id}`} className="bg-surface-subtle/40">
      <TableCell colSpan={6} className="border-b border-t border-border-subtle p-4">
        <div className="flex flex-col gap-3" data-testid="diet-cycle-details">
          <div className="flex items-center justify-between gap-3">
            <span className={`flex items-center gap-1.5 ${textStyle('caption-strong')}`}>
              <Calendar size={13} className="text-primary" aria-hidden="true" />
              <span>Variações do ciclo</span>
            </span>
            <span className={textStyle('metadata')}>
              Média semanal ponderada · {daysAssigned > 0 ? `${daysAssigned} dias atribuídos` : 'dias não atribuídos'}
            </span>
          </div>

          {variations.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {variations.map((variation) => {
                const assignedDays = formatAssignedDays(variation.assignedDays);
                return (
                  <div key={variation.id} className="min-w-0 rounded-control border border-border-subtle bg-surface p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={textStyle('table-cell-strong')}>{variation.name}</span>
                      <span className={textStyle('metadata')}>
                        {variation.assignedDays?.length ?? 0} dias
                      </span>
                    </div>
                    <MacroSummary
                      protein={variation.proteinG}
                      carbs={variation.carbsG}
                      fats={variation.fatsG}
                      kcal={variation.targetKcal}
                      className="mt-2"
                    />
                    <div className={`mt-2 flex items-center gap-1.5 ${textStyle('metadata')}`}>
                      <Calendar size={12} className="shrink-0" aria-hidden="true" />
                      <span>{assignedDays || 'Nenhum dia vinculado'}</span>
                    </div>
                    <div className={`mt-1 flex items-center gap-1.5 ${textStyle('metadata')}`}>
                      <Utensils size={12} className="shrink-0" aria-hidden="true" />
                      <span>{variation.mealsCount} {variation.mealsCount === 1 ? 'refeição' : 'refeições'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={textStyle('caption')}>Este ciclo não possui variações configuradas.</p>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
```

In the plan cell of `DietTableRow`, use the existing `Button` contract and stop propagation:

```tsx
const isCarbCycling = diet.mode === 'carb_cycling';
const hasCycleDetails = isCarbCycling && (diet.carbCyclingVariations?.length ?? 0) > 0;

{isCarbCycling && <Badge variant="primary">Ciclo de Carboidratos</Badge>}
{hasCycleDetails && (
  <Button
    type="button"
    variant="quiet"
    size="compact"
    aria-expanded={isExpanded}
    aria-controls={`diet-cycle-details-${diet.id}`}
    aria-label={isExpanded ? `Recolher variações de ${diet.name}` : `Ver variações de ${diet.name}`}
    onClick={(event) => {
      event.stopPropagation();
      onToggleExpand();
    }}
    className="inline-flex items-center gap-1 px-1 text-text-secondary hover:text-text-primary"
  >
    <span>{isExpanded ? 'Ocultar variações' : 'Ver variações'}</span>
    <ChevronDown size={13} aria-hidden="true" className={isExpanded ? 'rotate-180' : ''} />
  </Button>
)}
```

The `PatientDietsTable` body must use:

```tsx
const [expandedDietId, setExpandedDietId] = React.useState<string | null>(null);

const toggleDietExpansion = (dietId: string) => {
  setExpandedDietId((currentId) => (currentId === dietId ? null : dietId));
};

<DataTable
  expandedRowId={expandedDietId}
  renderExpandedRow={(diet) =>
    diet.mode === 'carb_cycling' ? <DietCycleDetails diet={diet} /> : null
  }
  renderRow={(diet) => (
    <DietTableRow
      patientId={patientId}
      diet={diet}
      isExpanded={expandedDietId === diet.id}
      onToggleExpand={() => toggleDietExpansion(diet.id)}
      onOpenReadOnlyDiet={onOpenReadOnlyDiet}
      onDeleteDiet={onDeleteDiet}
    />
  )}
  // preserve the existing data, columns, caption, labels and classes
/>
```

`renderExpandedRow` must return `null` for simple diets so they never receive an expansion row. Keep all existing edit, read-only and delete callbacks unchanged.

- [ ] **Step 4: Rodar os testes da tabela**

Run: `npm test -- tests/components/organisms/patient-diets-table.test.tsx`

Expected: PASS, including all existing simple-diet tests and the new cycle tests.

- [ ] **Step 5: Commitar a unidade visual**

```bash
git add -- src/components/organisms/patient/PatientDietsTable.tsx tests/components/organisms/patient-diets-table.test.tsx
git commit -m "fix(profile): show carb cycling details in diet history"
```

### Task 3: Validar o fluxo completo do perfil

**Files:**
- Modify: `tests/app/pacientes/patient-profile-history.test.tsx` — adicionar fixture de `FullDietPlan` persistida e verificar o comportamento pela rota do perfil.

**Interfaces:**
- Consumes: `usePatientProfilePage`, `buildPatientDietHistory` e `PatientDietsTable`.
- Produces: regressão cobrindo armazenamento → adaptador → perfil → tabela.

- [ ] **Step 1: Adicionar teste de integração da rota**

No teste de histórico do perfil, adicionar um caso que grave em `nutridiet_diets_<patientId>` um plano com `mode: 'carb_cycling'`, duas variações com 3 e 4 dias e metas 2300/1950 kcal, renderize `PatientDetailPage` e verifique:

```ts
expect(await screen.findByText('Ciclo de Carboidratos')).toBeInTheDocument();
expect(screen.getByText('2100 kcal')).toBeInTheDocument();
expect(screen.getByText(/C\s*197g/)).toBeInTheDocument();

fireEvent.click(
  screen.getByRole('button', { name: 'Ver variações de Ciclo de Carboidratos' }),
);

expect(screen.getByText('Variações do ciclo')).toBeInTheDocument();
expect(screen.getByText('Dia Alto Carbo')).toBeInTheDocument();
expect(screen.getByText('Dia Baixo Carbo')).toBeInTheDocument();
```

Use os mesmos ids/data do paciente já configurado no `beforeEach`, sem alterar as fixtures compartilhadas de dietas simples.

- [ ] **Step 2: Rodar a regressão da rota**

Run: `npm test -- tests/app/pacientes/patient-profile-history.test.tsx`

Expected: PASS for empty state, simple history, delete flow and the new cycling history flow.

- [ ] **Step 3: Rodar a bateria direcionada e os gates do projeto**

Run:

```bash
npm test -- tests/lib/patient-profile-selectors.test.ts tests/components/organisms/patient-diets-table.test.tsx tests/app/pacientes/patient-profile-history.test.tsx
npm run type-check
npm run lint
npm run verify:table
npm run verify:design-system
```

Expected: all commands exit with code 0. If `verify:table` or `verify:design-system` reports a violation caused by the new organism markup, adjust only the organism to the existing category/profile contract; do not modify `DataTable` or a `src/components/ui` primitive for this feature.

- [ ] **Step 4: Conferir diff e status sem incluir mudanças pré-existentes**

Run: `git diff --check; git status --short; git diff --stat HEAD~2..HEAD`

Expected: the commits created by Tasks 1–3 contain only the selector/type/test changes and the profile table/test changes; unrelated working-tree modifications remain unstaged.

- [ ] **Step 5: Commitar a regressão da rota**

```bash
git add -- tests/app/pacientes/patient-profile-history.test.tsx
git commit -m "test(profile): cover carb cycling prescription history"
```
