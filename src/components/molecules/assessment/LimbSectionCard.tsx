import React from 'react';
import { textStyle } from '@/design-system';
import { Surface } from '@/components/atoms';

export interface LimbSectionCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function LimbSectionCard({ title, subtitle, children }: LimbSectionCardProps) {
  return (
    <Surface variant="subtle" className="flex flex-col gap-3 p-4 rounded-surface border border-border-subtle">
      <div className="flex items-center justify-between border-b border-border-subtle pb-2">
        <span className={textStyle('caption-strong')}>{title}</span>
        <span className={textStyle('helper')}>{subtitle}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">{children}</div>
    </Surface>
  );
}
