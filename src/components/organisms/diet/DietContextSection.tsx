'use client';

import React from 'react';
import { Surface } from '@/components/atoms';
import { PatientProfileHeader } from '../PatientProfileHeader';
import { DietModeSwitcher, DietModeSwitcherProps } from '../../molecules';

export interface DietContextSectionProps {
  name: string;
  initials: string;
  objective: string;
  age?: number;
  heightCm?: number;
  gender?: string;
  weightKg?: number;
  activeDietModeProps: DietModeSwitcherProps;
}

export function DietContextSection({
  name,
  initials,
  objective,
  age,
  heightCm,
  gender,
  weightKg,
  activeDietModeProps,
}: DietContextSectionProps) {
  return (
    <section aria-label="Contexto da dieta" data-testid="diet-context-card">
      <Surface variant="default" density="compact" className="p-6">
        <PatientProfileHeader.Root
          patient={{
            name,
            initials,
            objective,
            age,
            heightCm,
            gender,
            weightKg,
          }}
          className="border-b-0 pb-0"
        >
          <PatientProfileHeader.Identity>
            <PatientProfileHeader.Avatar variant="charcoal" size="lg" />
            <PatientProfileHeader.Info>
              <div className="flex flex-wrap items-center gap-2">
                <PatientProfileHeader.Name />
                <PatientProfileHeader.Gender />
                <PatientProfileHeader.Badge />
              </div>
              <PatientProfileHeader.Meta />
            </PatientProfileHeader.Info>
          </PatientProfileHeader.Identity>

          <PatientProfileHeader.Actions>
            <DietModeSwitcher {...activeDietModeProps} embedded />
          </PatientProfileHeader.Actions>
        </PatientProfileHeader.Root>
      </Surface>
    </section>
  );
}
