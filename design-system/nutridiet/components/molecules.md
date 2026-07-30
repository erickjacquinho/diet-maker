# Especificação de Moléculas - NutriDiet Design System

> 🧩 **Moléculas**: Combinações de 2 ou mais componentes atômicos que formam uma unidade funcional com lógica visual.

---

## 1. `MacroMetricCard` (Card Métrico de Macronutriente)

### 1.1 Responsabilidade
Exibe o consumo acumulado de calorias, proteínas, carboidratos ou gorduras versus a meta diária estipulada, acompanhado de badge de status e barra de progresso.

### 1.2 Estrutura & Código TSX
```tsx
import { Badge } from './atoms';
import { ProgressBar } from './atoms';

interface MacroMetricCardProps {
  label: string;
  currentValue: string; // Ex: "168g" ou "2.450"
  targetValue: string;  // Ex: "165g" ou "2.400 kcal"
  statusBadgeText?: string;
  statusBadgeVariant?: 'emerald' | 'rose' | 'amber' | 'teal';
  percentage: number;   // 0 a 100+
  gPerKgRatio?: string; // Ex: "2.03 g/kg"
  gPerKgMeta?: string;  // Ex: "2.0"
  macroColor: 'emerald' | 'rose' | 'amber' | 'teal';
}

export const MacroMetricCard: React.FC<MacroMetricCardProps> = ({
  label,
  currentValue,
  targetValue,
  statusBadgeText,
  statusBadgeVariant = 'emerald',
  percentage,
  gPerKgRatio,
  gPerKgMeta,
  macroColor
}) => {
  return (
    <div className="bg-warm-inner border border-warm-border rounded-2xl p-4">
      <div className="flex justify-between text-xs font-semibold text-warm-muted mb-1">
        <span className={`text-warm-${macroColor} font-bold`}>{label}</span>
        {statusBadgeText && (
          <Badge variant={statusBadgeVariant}>{statusBadgeText}</Badge>
        )}
      </div>

      <div className="text-3xl font-black text-warm-charcoal my-1">
        {currentValue} <span className="text-xs font-normal text-warm-muted">/ {targetValue}</span>
      </div>

      {gPerKgRatio && (
        <div className={`text-xs font-bold text-warm-${macroColor} mb-2`}>
          {gPerKgRatio} <span className="text-[10px] text-warm-muted font-normal">(meta: {gPerKgMeta})</span>
        </div>
      )}

      <ProgressBar value={percentage} colorVariant={macroColor} />
    </div>
  );
};
```

---

## 2. `MealItemRow` (Linha do Item de Alimento)

### 2.1 Responsabilidade
Exibe um alimento cadastrado na refeição com seus valores de Kcal, Proteínas, Carbo e Gorduras, um input numérico de quantidade em gramas e um botão de remoção.

### 2.2 Estrutura TSX
```tsx
import { Trash2 } from 'lucide-react'; // Ícone SVG padronizado

interface MealItemRowProps {
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
  quantityGrams: number;
  onQuantityChange?: (newGrams: number) => void;
  onRemove?: () => void;
}

export const MealItemRow: React.FC<MealItemRowProps> = ({
  name,
  kcal,
  protein,
  carbs,
  fats,
  quantityGrams,
  onRemove
}) => {
  return (
    <div className="flex items-center justify-between bg-warm-inner border border-warm-border rounded-xl p-3">
      <div>
        <div className="text-xs font-bold text-warm-charcoal">{name}</div>
        <div className="text-[11px] text-warm-secondary mt-0.5">
          <span className="text-warm-rose font-bold">P: {protein}g</span> • C: {carbs}g • <span className="text-warm-teal font-bold">G: {fats}g</span> • {kcal} kcal
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="bg-warm-card border border-warm-borderDark rounded-xl px-2.5 py-1 text-xs font-bold text-warm-charcoal">
          {quantityGrams} <span className="text-warm-muted font-normal">g</span>
        </div>
        <button 
          onClick={onRemove}
          aria-label={`Remover ${name}`}
          className="text-warm-muted hover:text-warm-rose p-1 transition-colors rounded-lg"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};
```

---

## 3. `PatientBadgeHeader` (Banner do Paciente)

### 3.1 Responsabilidade
Exibe o avatar do paciente, nome completo, peso atual, objetivo clínico e botão para ajustar metas.

```tsx
interface PatientBadgeHeaderProps {
  initials: string;
  name: string;
  weightKg: number;
  goalDescription: string;
  onAdjustGoals?: () => void;
}

export const PatientBadgeHeader: React.FC<PatientBadgeHeaderProps> = ({
  initials,
  name,
  weightKg,
  goalDescription,
  onAdjustGoals
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-warm-border gap-3">
    <div className="flex items-center space-x-3.5">
      <div className="w-11 h-11 rounded-full bg-warm-inner border border-warm-borderDark flex items-center justify-center text-warm-charcoal font-black text-sm">
        {initials}
      </div>
      <div>
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-black text-warm-charcoal">{name}</h3>
          <span className="text-xs font-bold px-2.5 py-0.5 bg-warm-inner border border-warm-border text-warm-charcoal rounded-full">
            {weightKg} kg
          </span>
        </div>
        <p className="text-xs text-warm-secondary">{goalDescription}</p>
      </div>
    </div>
    <button 
      onClick={onAdjustGoals}
      className="px-3.5 py-2 bg-warm-inner border border-warm-border hover:border-warm-borderDark text-warm-charcoal text-xs font-bold rounded-xl transition-all"
    >
      ✏️ Ajustar Metas
    </button>
  </div>
);
```
