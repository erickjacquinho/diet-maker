import { createContext, use } from 'react';

export interface PatientProfileHeaderContextValue {
  name?: string;
  code?: string;
  gender?: string;
  objective?: string;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  initials?: string;
}

export const PatientProfileHeaderContext = createContext<PatientProfileHeaderContextValue | null>(null);

export function usePatientProfileHeaderContext() {
  const context = use(PatientProfileHeaderContext);
  return context ?? {};
}
