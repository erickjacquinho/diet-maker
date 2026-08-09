# Phase 1: Data Model & Context Interfaces

**Feature**: [plan.md](file:///c:/Programmer/diet-maker/specs/07-08-26-refatoracao-composicao-codigo-limpo/plan.md)

---

## 1. Compound Component Context Interfaces

### Modal Compound Context Contract
```typescript
export interface ModalCompositionContextValue<TState = unknown> {
  isOpen: boolean;
  onClose: () => void;
  data?: TState;
  isSubmitting?: boolean;
}

export interface AssessmentModalContextValue {
  patientId: string;
  assessmentData: AssessmentFormState;
  activeProtocol: 'us-navy' | 'skinfold-3' | 'skinfold-7';
  updateField: (field: string, value: number) => void;
  saveAssessment: () => Promise<void>;
}
```

---

## 2. Zustand Store Slice Architecture

### Slice Composition Structure (`patientsStore.ts`)
```typescript
export type PatientsStore = PatientProfileSlice & PatientAssessmentSlice & PatientConsultationSlice;

export interface PatientProfileSlice {
  patients: Patient[];
  addPatient: (patient: Omit<Patient, 'id'>) => void;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  removePatient: (id: string) => void;
}

export interface PatientAssessmentSlice {
  assessmentsByPatient: Record<string, PhysicalAssessment[]>;
  addAssessment: (patientId: string, assessment: PhysicalAssessment) => void;
  updateAssessment: (patientId: string, assessmentId: string, updates: Partial<PhysicalAssessment>) => void;
}

export interface PatientConsultationSlice {
  consultationsByPatient: Record<string, PatientConsultation[]>;
  addConsultation: (patientId: string, consultation: PatientConsultation) => void;
}
```

---

## 3. Page Custom Hook Contracts

### Diet Builder Page State (`useDietBuilderPage.ts`)
```typescript
export interface UseDietBuilderPageReturn {
  patient: Patient | null;
  activeDiet: DietPlan | null;
  totals: MacronutrientTotals;
  isFoodSearchOpen: boolean;
  openFoodSearch: (mealId: string) => void;
  closeFoodSearch: () => void;
  handleSaveDiet: () => Promise<void>;
}
```
