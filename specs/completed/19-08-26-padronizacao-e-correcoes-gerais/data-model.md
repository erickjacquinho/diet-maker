# Data Model: Padronização de Entidades e Tipos

## 1. Domain Entities & Type Contracts

### Patient (`src/lib/patientsStoreTypes.ts`)
```typescript
export interface Patient {
  id: string;                         // Identificador nanoid(8)
  code: string;                       // Código formatado "P-0001"
  legacyId?: string;                  // Fallback legado "pat-1"
  name: string;                       // Nome completo
  initials: string;                   // Iniciais "AL"
  age: number;                        // Idade em anos
  gender: string;                     // "Masculino" | "Feminino"
  heightCm: number;                   // Altura em centímetros
  weightKg: number;                   // Peso em quilogramas
  targetKcal: number;                 // Meta diária de calorias
  targetProtein: number;              // Meta de proteína (g)
  targetCarbs: number;                // Meta de carboidrato (g)
  targetFats: number;                 // Meta de gordura (g)
  objective: string;                  // "Hipertrofia", "Emagrecimento", etc.
  lastConsultation?: string;          // Data da última consulta
  nextEvent?: PatientNextEvent | null;
  lastActivity?: PatientLastActivity | null;
  whatsapp?: string;                  // Contato formatado
}
```

### MacroMetric (`src/components/molecules/MacroMetricCard.tsx`)
```typescript
export type MacroTone = 'kcal' | 'protein' | 'carbohydrate' | 'fat';

export interface MacroMetricCardProps {
  label: string;
  currentValue: string;
  targetValue: string;
  statusBadgeText?: string;
  statusBadgeVariant?: 'emerald' | 'rose' | 'amber' | 'teal' | 'blue' | 'neutral';
  percentage: number;
  gPerKgRatio?: string;
  gPerKgMeta?: string;
  macroTone: MacroTone;
}
```

### Storage Key Lifecycle
| Chave no LocalStorage | Finalidade | Ciclo de Vida |
| :--- | :--- | :--- |
| `nutridiet_patients` | Array de todos os pacientes ativos | Criado no cadastro, atualizado na edição, filtrado na exclusão |
| `nutridiet_assessments_{id}` | Avaliações físicas do paciente | Criado na consulta, removido na exclusão do paciente |
| `nutridiet_diets_{id}` | Planos de dieta do paciente | Criado na prescrição, **removido na exclusão do paciente** |
| `nutridiet_custom_foods` | Catálogo de alimentos personalizados | Persistente independente |
| `nutridiet_recipes` | Catálogo de receitas culinárias | Persistente independente |
| `nutridiet_presets` | Presets globais de dietas | Persistente independente |
| `nutridiet_ready_meals` | Blocos de refeições prontas | Persistente independente |
