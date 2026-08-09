# Data Model & Presentation Models: Perfil do Paciente

## Presentation Entities

### `ConsolidatedConsultationUpdate`
Estrutura de apresentação unificada por data no histórico de consultas do paciente.

```typescript
export interface ConsolidatedConsultationUpdate {
  date: string;
  diet?: HistoricalDiet;
  assessment?: BodyAssessment;
}
```

### `PatientNextEventDraft`
Estrutura de rascunho para criação e edição do próximo acompanhamento do paciente.

```typescript
export interface PatientNextEventDraft {
  date: string;
  type: PatientNextEventType;
}
```

## Component Contracts & Interfaces

### `PatientConsultationHistoryTableProps`
```typescript
export interface PatientConsultationHistoryTableProps {
  updates: ConsolidatedConsultationUpdate[];
  expandedRowDate: string | null;
  onToggleExpand: (date: string) => void;
  onOpenReadOnlyDiet: (diet: HistoricalDiet) => void;
  onOpenEditAssessment: (assessment: BodyAssessment) => void;
}
```

### `NextEventModalProps`
```typescript
export interface NextEventModalProps {
  open: boolean;
  patientName?: string;
  currentEvent: PatientNextEvent | null;
  onOpenChange: (open: boolean) => void;
  onSave: (event: PatientNextEvent) => void;
  onRemove: () => void;
}
```

### `AddObjectiveModalProps`
```typescript
export interface AddObjectiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddObjective: (objective: string) => void;
}
```

### `DeletePatientModalProps`
```typescript
export interface DeletePatientModalProps {
  open: boolean;
  patientName: string;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
}
```
