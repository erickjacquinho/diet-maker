'use client';

import { Input } from '@/components/ui/input';
import { textStyle } from '@/design-system';

export interface MealBasicsEntry {
  id: string;
  name: string;
  time: string;
  label?: string;
}

export interface MealBasicsEditorProps {
  entries: MealBasicsEntry[];
  idPrefix: string;
  onChange: (entries: MealBasicsEntry[]) => void;
  nameLabel?: string;
  timeLabel?: string;
}

export function MealBasicsEditor({
  entries,
  idPrefix,
  onChange,
  nameLabel = 'Nome da refeição',
  timeLabel = 'Horário sugerido',
}: MealBasicsEditorProps) {
  const updateEntry = (index: number, updates: Partial<MealBasicsEntry>) => {
    onChange(entries.map((entry, entryIndex) => entryIndex === index ? { ...entry, ...updates } : entry));
  };

  return (
    <div role="group" aria-label="Nome e horário das refeições" className="flex flex-col gap-3">
      {entries.map((entry, index) => {
        const nameId = `${idPrefix}-name-${index}`;
        const timeId = `${idPrefix}-time-${index}`;

        return (
          <fieldset key={entry.id} className="flex flex-col gap-3 rounded-surface border border-border-subtle bg-surface-subtle p-4">
            {entry.label && <legend className={`${textStyle('field-label')} px-1`}>{entry.label}</legend>}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 flex flex-col gap-1">
                <label htmlFor={nameId} className={textStyle('field-label')}>{nameLabel}</label>
                <Input id={nameId} required value={entry.name} onChange={(event) => updateEntry(index, { name: event.target.value })} />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor={timeId} className={textStyle('field-label')}>{timeLabel}</label>
                <Input id={timeId} type="time" value={entry.time} onChange={(event) => updateEntry(index, { time: event.target.value })} />
              </div>
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
