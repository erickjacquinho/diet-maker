# Data Model: Timeline de Atendimentos

## Tipos e Estruturas de Dados

```typescript
export type TimelineEventType = 'diet' | 'assessment';

export interface TimelineDietEvent {
  id: string;
  type: 'diet';
  date: string;
  dateIso: string;
  diet: HistoricalDiet;
}

export interface TimelineAssessmentEvent {
  id: string;
  type: 'assessment';
  date: string;
  dateIso: string;
  assessment: BodyAssessment;
}

export type TimelineItem = TimelineDietEvent | TimelineAssessmentEvent;

export interface TimelineDateGroup {
  date: string;
  dateIso: string;
  items: TimelineItem[];
}

export type TimelineFilter = 'all' | 'assessments' | 'diets';
```
