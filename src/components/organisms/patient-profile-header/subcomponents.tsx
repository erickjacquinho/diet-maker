'use client';

import React, { type ReactNode, type ComponentType } from 'react';
import { Mars, Venus } from 'lucide-react';
import { Avatar } from '@/components/atoms/Avatar';
import { textStyle } from '@/design-system';
import { cn } from '@/lib/utils';
import { usePatientProfileHeaderContext } from './PatientProfileHeaderContext';

export function PatientProfileHeaderIdentity({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex items-center gap-4', className)}>{children}</div>;
}

export interface PatientProfileHeaderAvatarProps {
  initials?: string;
  variant?: 'emerald' | 'charcoal' | 'inner';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PatientProfileHeaderAvatar({ initials, variant = 'charcoal', size = 'lg', className }: PatientProfileHeaderAvatarProps) {
  const ctx = usePatientProfileHeaderContext();
  return <Avatar initials={initials ?? ctx.initials ?? ''} variant={variant} size={size} className={cn('shrink-0', className)} />;
}

export function PatientProfileHeaderInfo({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-col gap-1', className)}>{children}</div>;
}

export function PatientProfileHeaderName({ children, className }: { children?: ReactNode; className?: string }) {
  const ctx = usePatientProfileHeaderContext();
  return <h2 className={cn(textStyle('subsection-title'), className)}>{children ?? ctx.name}</h2>;
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
  const ResolvedIcon = icon !== undefined ? icon : ctx.gender === 'Masculino' ? Mars : ctx.gender === 'Feminino' ? Venus : null;

  if (!ResolvedIcon) return null;

  return (
    <span role="img" aria-label={genderLabel} title={genderLabel} className={cn('flex items-center justify-center text-text-muted', className)}>
      <ResolvedIcon size={14} strokeWidth={1.8} aria-hidden={true} />
    </span>
  );
}

export function PatientProfileHeaderCode({ code, className }: { code?: string; className?: string }) {
  const ctx = usePatientProfileHeaderContext();
  const displayCode = code ?? ctx.code;

  if (!displayCode) return null;

  return (
    <span className={cn(`px-2 py-0.5 rounded-control bg-accent/10 text-accent border border-accent/20 ${textStyle('caption-strong')}`, className)}>
      Prontuário {displayCode}
    </span>
  );
}

export function PatientProfileHeaderBadge({ children, className }: { children?: ReactNode; className?: string }) {
  const ctx = usePatientProfileHeaderContext();
  return (
    <span className={cn(`px-2 py-0.5 rounded-control bg-surface-subtle border border-border-subtle ${textStyle('caption-strong')}`, className)}>
      {children ?? ctx.objective ?? 'Acompanhamento'}
    </span>
  );
}

export function PatientProfileHeaderMeta({ age, heightCm, weightKg, className }: { age?: number; heightCm?: number; weightKg?: number; className?: string }) {
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

export function PatientProfileHeaderActions({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-wrap items-center gap-2 pt-2 lg:pt-0', className)}>{children}</div>;
}
