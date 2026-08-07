'use client';

import React, { createContext, use, type ReactNode, type ComponentType } from 'react';
import { Mars, Venus } from 'lucide-react';
import { Avatar } from '@/components/atoms/Avatar';
import { textStyle } from '@/design-system';
import { cn } from '@/lib/utils';

export interface PatientProfileHeaderContextValue {
  name?: string;
  gender?: string;
  objective?: string;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  initials?: string;
}

const PatientProfileHeaderContext = createContext<PatientProfileHeaderContextValue | null>(null);

function usePatientProfileHeaderContext() {
  const context = use(PatientProfileHeaderContext);
  return context ?? {};
}

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

export function PatientProfileHeaderIdentity({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn('flex items-center gap-4', className)}>{children}</div>;
}

export interface PatientProfileHeaderAvatarProps {
  initials?: string;
  variant?: 'emerald' | 'charcoal' | 'inner';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PatientProfileHeaderAvatar({
  initials,
  variant = 'charcoal',
  size = 'lg',
  className,
}: PatientProfileHeaderAvatarProps) {
  const ctx = usePatientProfileHeaderContext();
  const displayInitials = initials ?? ctx.initials ?? '';

  return (
    <Avatar
      initials={displayInitials}
      variant={variant}
      size={size}
      className={cn('shrink-0', className)}
    />
  );
}

export function PatientProfileHeaderInfo({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn('flex flex-col gap-1', className)}>{children}</div>;
}

export function PatientProfileHeaderName({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  const ctx = usePatientProfileHeaderContext();
  const displayName = children ?? ctx.name;

  return <h2 className={cn(textStyle('subsection-title'), className)}>{displayName}</h2>;
}

export function PatientProfileHeaderGender({
  icon,
  label,
  className,
}: {
  icon?: ComponentType<{ size?: number; strokeWidth?: number; className?: string; 'aria-hidden'?: boolean }> | null;
  label?: string;
  className?: string;
}) {
  const ctx = usePatientProfileHeaderContext();
  const genderLabel = label ?? ctx.gender;

  const ResolvedIcon =
    icon !== undefined
      ? icon
      : ctx.gender === 'Masculino'
      ? Mars
      : ctx.gender === 'Feminino'
      ? Venus
      : null;

  if (!ResolvedIcon) return null;

  return (
    <span
      role="img"
      aria-label={genderLabel}
      title={genderLabel}
      className={cn('flex items-center justify-center text-text-muted', className)}
    >
      <ResolvedIcon size={14} strokeWidth={1.8} aria-hidden={true} />
    </span>
  );
}

export function PatientProfileHeaderBadge({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  const ctx = usePatientProfileHeaderContext();
  const objectiveText = children ?? ctx.objective ?? 'Acompanhamento';

  return (
    <span
      className={cn(
        `px-2 py-0.5 rounded-control bg-surface-subtle border border-border-subtle ${textStyle('caption-strong')}`,
        className
      )}
    >
      {objectiveText}
    </span>
  );
}

export function PatientProfileHeaderMeta({
  age,
  heightCm,
  weightKg,
  className,
}: {
  age?: number;
  heightCm?: number;
  weightKg?: number;
  className?: string;
}) {
  const ctx = usePatientProfileHeaderContext();
  const displayAge = age ?? ctx.age;
  const displayHeight = heightCm ?? ctx.heightCm;
  const displayWeight = weightKg ?? ctx.weightKg;

  const parts = [];
  if (displayAge !== undefined) parts.push(`${displayAge} anos`);
  if (displayHeight !== undefined) parts.push(`${displayHeight} cm`);
  if (displayWeight !== undefined) parts.push(`${displayWeight} kg`);

  if (parts.length === 0) return null;

  return (
    <div className={cn(`flex items-center gap-2 ${textStyle('caption')}`, className)} aria-label="Dados cadastrais">
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span aria-hidden="true">·</span>}
          <span className="font-semibold text-text-primary">{part}</span>
        </React.Fragment>
      ))}
    </div>
  );
}

export function PatientProfileHeaderActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2 pt-2 lg:pt-0', className)}>
      {children}
    </div>
  );
}

export const PatientProfileHeader = Object.assign(PatientProfileHeaderRoot, {
  Root: PatientProfileHeaderRoot,
  Identity: PatientProfileHeaderIdentity,
  Avatar: PatientProfileHeaderAvatar,
  Info: PatientProfileHeaderInfo,
  Name: PatientProfileHeaderName,
  Gender: PatientProfileHeaderGender,
  Badge: PatientProfileHeaderBadge,
  Meta: PatientProfileHeaderMeta,
  Actions: PatientProfileHeaderActions,
});
