# Data Model & Interface Contracts: Refatoração de Componentes UI

## Component Interfaces & Prop Mappings

### 1. `AvatarProps` (`src/components/atoms/Avatar.tsx`)
```typescript
export interface AvatarProps {
  initials: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'emerald' | 'charcoal' | 'inner';
  className?: string;
}
```
- **Mapeamento Interno**:
  - `Avatar` do Shadcn `<ShadcnAvatar className={cn(sizeMap[size], className)}>`
  - `AvatarFallback` do Shadcn `<ShadcnAvatarFallback>{initials}</ShadcnAvatarFallback>`

### 2. `ProgressBarProps` (`src/components/atoms/ProgressBar.tsx`)
```typescript
export interface ProgressBarProps {
  value: number; // 0 a 100
  colorVariant?: 'emerald' | 'rose' | 'amber' | 'teal' | 'blue';
  className?: string;
}
```
- **Mapeamento Interno**:
  - `<Progress value={clampedValue} className={cn(toneMap[colorVariant], className)} />`

### 3. `PatientConsultationHistoryTableProps` (`src/components/organisms/PatientConsultationHistoryTable.tsx`)
```typescript
export interface PatientConsultationHistoryTableProps {
  patientId: string;
  updates: ConsolidatedConsultationUpdate[];
  onOpenReadOnlyDiet: (diet: HistoricalDiet) => void;
  onOpenEditAssessment: (assessment: BodyAssessment) => void;
}
```
- **Mapeamento Interno**:
  - Renderiza `<Table>`, `<TableHeader>`, `<TableHead>`, `<TableBody>`, `<TableRow>`, `<TableCell>` de `@/components/ui/table`.
