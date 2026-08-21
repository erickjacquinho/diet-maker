'use client';

import React from 'react';
import { Surface } from '@/components/atoms';
import { PatientProfileHeader } from '../PatientProfileHeader';
import { DietModeSwitcher, DietModeSwitcherProps, CarbCyclingVariationPanel } from '../../molecules';

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
  const isCarbCycling = activeDietModeProps.mode === 'carb_cycling';

  return (
    <section aria-label="Contexto da dieta" data-testid="diet-context-card" className="flex flex-col gap-4">
      {/* 1️⃣ Quadro Principal: Perfil do Paciente + Seletor de Modelo */}
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
            <DietModeSwitcher {...activeDietModeProps} embedded modeOnly />
          </PatientProfileHeader.Actions>
        </PatientProfileHeader.Root>
      </Surface>

      {/* 2️⃣ Quadro Adicional / Box Abaixo: Opções do Ciclo de Carboidratos */}
      {isCarbCycling && (
        <CarbCyclingVariationPanel
          variationsCount={activeDietModeProps.variationsCount}
          onVariationsCountChange={activeDietModeProps.onVariationsCountChange}
          variations={activeDietModeProps.variations}
          activeVariationId={activeDietModeProps.activeVariationId}
          onSelectVariation={activeDietModeProps.onSelectVariation}
          onCopyMealsBetweenVariations={activeDietModeProps.onCopyMealsBetweenVariations}
        />
      )}
    </section>
  );
}

