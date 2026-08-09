'use client';

import React, { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  PatientProfileHeaderContext,
  PatientProfileHeaderContextValue,
} from './patient-profile-header/PatientProfileHeaderContext';
import {
  PatientProfileHeaderIdentity,
  PatientProfileHeaderAvatar,
  PatientProfileHeaderInfo,
  PatientProfileHeaderName,
  PatientProfileHeaderGender,
  PatientProfileHeaderCode,
  PatientProfileHeaderBadge,
  PatientProfileHeaderMeta,
  PatientProfileHeaderActions,
} from './patient-profile-header/subcomponents';

export type { PatientProfileHeaderContextValue };

export interface PatientProfileHeaderRootProps {
  children: ReactNode;
  patient?: PatientProfileHeaderContextValue;
  className?: string;
}

export function PatientProfileHeaderRoot({
  children,
  patient,
  className,
}: PatientProfileHeaderRootProps) {
  return (
    <PatientProfileHeaderContext value={patient ?? null}>
      <div
        className={cn(
          'flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border-divider pb-5',
          className
        )}
      >
        {children}
      </div>
    </PatientProfileHeaderContext>
  );
}

export const PatientProfileHeader = Object.assign(PatientProfileHeaderRoot, {
  Root: PatientProfileHeaderRoot,
  Identity: PatientProfileHeaderIdentity,
  Avatar: PatientProfileHeaderAvatar,
  Info: PatientProfileHeaderInfo,
  Name: PatientProfileHeaderName,
  Gender: PatientProfileHeaderGender,
  Code: PatientProfileHeaderCode,
  Badge: PatientProfileHeaderBadge,
  Meta: PatientProfileHeaderMeta,
  Actions: PatientProfileHeaderActions,
});
