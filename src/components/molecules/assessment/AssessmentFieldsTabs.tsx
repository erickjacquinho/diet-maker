import { Activity, Scale } from 'lucide-react';
import { textStyle } from '@/design-system';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { BodyAssessment } from '@/lib/patientsStore';
import type { NumericAssessmentField } from '@/hooks/useAssessmentForm';
import { AssessmentMeasurementField } from './AssessmentMeasurementField';
import { LimbSectionCard } from './LimbSectionCard';
import { TRUNK_FIELDS, UPPER_LIMB_FIELDS, LOWER_LIMB_FIELDS } from './assessmentFieldsConfig';

export function AssessmentFieldsTabs({
  draft,
  updateNumericField,
}: {
  draft: BodyAssessment;
  updateNumericField: (field: NumericAssessmentField, value: string) => void;
}) {
  const field = (name: NumericAssessmentField, label: string, unit: string, className?: string) => (
    <AssessmentMeasurementField
      key={name}
      id={`assessment-${name}`}
      label={label}
      unit={unit}
      value={draft[name]}
      onChange={(value) => updateNumericField(name, value)}
      className={className}
    />
  );

  return (
    <Tabs defaultValue="trunk" className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <TabsList className="grid grid-cols-2 w-full shrink-0 p-1">
        <TabsTrigger value="trunk" className={`flex items-center justify-center gap-1.5 py-1 ${textStyle('caption')}`}>
          <Scale className="size-3.5" />
          <span>Tronco & Composição</span>
        </TabsTrigger>
        <TabsTrigger value="limbs" className={`flex items-center justify-center gap-1.5 py-1 ${textStyle('caption')}`}>
          <Activity className="size-3.5" />
          <span>Membros (E / D)</span>
        </TabsTrigger>
      </TabsList>
      <div className="flex-1 min-h-0 overflow-y-auto p-1.5 flex flex-col gap-3">
        <TabsContent value="trunk" className="m-0 flex flex-col gap-3 p-1">
          <div className="grid grid-cols-2 gap-2.5">
            {field('weightKg', 'Peso atual', 'kg', 'col-span-2')}
            {TRUNK_FIELDS.slice(0, 3).map(({ field: name, label, unit }) => field(name, label, unit))}
          </div>
        </TabsContent>
        <TabsContent value="limbs" forceMount className="m-0 flex flex-col gap-3 p-1">
          <LimbSectionCard title="Membros Superiores" subtitle="E / D (Auto-espelhado)">
            {UPPER_LIMB_FIELDS.map(({ field: name, label, unit }) => field(name, label, unit))}
          </LimbSectionCard>
        </TabsContent>
        <TabsContent value="trunk" className="m-0 flex flex-col gap-3 p-1">
          <div className="grid grid-cols-2 gap-2.5">
            {TRUNK_FIELDS.slice(3).map(({ field: name, label, unit }) => field(name, label, unit))}
          </div>
        </TabsContent>
        <TabsContent value="limbs" forceMount className="m-0 flex flex-col gap-3 p-1">
          <LimbSectionCard title="Membros Inferiores" subtitle="E / D (Auto-espelhado)">
            {LOWER_LIMB_FIELDS.map(({ field: name, label, unit }) => field(name, label, unit))}
          </LimbSectionCard>
        </TabsContent>
      </div>
    </Tabs>
  );
}
