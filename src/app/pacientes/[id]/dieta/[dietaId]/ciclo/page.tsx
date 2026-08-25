'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Plus,
  Copy,
  Calendar,
  Sparkles,
  CheckCheck,
  GripVertical,
  Save,
  AlertTriangle,
  ClipboardPaste,
} from 'lucide-react';
import {
  Button,
  Surface,
  DeleteIconButton,
} from '@/components/atoms';
import { Input } from '@/components/ui/input';
import { SelectField } from '@/components/atoms/SelectField';
import { Spinner } from '@/components/ui/spinner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { PageContextHeader } from '@/components/molecules/PageContextHeader';
import { PatientProfileHeader } from '@/components/organisms/PatientProfileHeader';
import { MetricBoxGroup, MetricBoxGroupItem } from '@/components/organisms/MetricBoxGroup';
import {
  CarbCyclingVariation,
  DayOfWeek,
  DAYS_OF_WEEK,
  calculateWeeklyCycleAverage,
  getDietFromStorage,
  saveDietToStorage,
  FullDietPlan,
  createInitialDietPlan,
} from '@/lib/dietStore';
import { getPatientById, Patient } from '@/lib/patientsStore';
import { calculatePresetCalories } from '@/lib/presetUtils';
import { textStyle } from '@/design-system';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useSaveShortcut } from '@/hooks/useSaveShortcut';

interface EditableVariationItem {
  id: string;
  name: string;
  assignedDays: DayOfWeek[];
  proteinG: number;
  carbsG: number;
  fatsG: number;
  proteinGPerKg: number;
  carbsGPerKg: number;
  fatsGPerKg: number;
  kcal: number;
}

const ALL_WEEK_DAYS: DayOfWeek[] = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];

export default function DedicatedCarbCyclingPage() {
  const params = useParams();
  const router = useRouter();

  const patientId = (params?.id as string) || 'pat-1';
  const dietaId = (params?.dietaId as string) || 'nova';

  const [patient, setPatient] = useState<Patient | null>(null);
  const [dietPlan, setDietPlan] = useState<FullDietPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [unitMode, setUnitMode] = useState<'grams' | 'g_per_kg'>('grams');
  const [items, setItems] = useState<EditableVariationItem[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Estados de Guardrail para alterações não salvas
  const [initialStateHash, setInitialStateHash] = useState<string>('');
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingExitUrl, setPendingExitUrl] = useState<string | null>(null);

  // Estado de valores copiados para Copiar/Colar entre variações
  const [copiedValues, setCopiedValues] = useState<{
    proteinG: number;
    carbsG: number;
    fatsG: number;
    proteinGPerKg: number;
    carbsGPerKg: number;
    fatsGPerKg: number;
    kcal: number;
    sourceName: string;
  } | null>(null);

  const weight = patient?.weightKg && patient.weightKg > 0 ? patient.weightKg : 70;

  // Carregar Paciente e Dieta
  useEffect(() => {
    const p = getPatientById(patientId);
    setPatient(p);

    let plan = getDietFromStorage(patientId, dietaId);
    if (!plan) {
      plan = createInitialDietPlan(patientId, {
        weightKg: p?.weightKg,
        targetKcal: p?.targetKcal,
        targetProtein: p?.targetProtein,
        targetCarbs: p?.targetCarbs,
        targetFats: p?.targetFats,
      });
      plan.id = dietaId;
    }
    plan.patientId = patientId;

    setDietPlan(plan);

    // Mapear variações para itens editáveis
    const initialItems: EditableVariationItem[] = (plan.carbCyclingVariations || []).map((v, index) => {
      const prot = v.targetProtein;
      const carb = v.targetCarbs;
      const fat = v.targetFats;
      const kcal = v.targetKcal || calculatePresetCalories(prot, carb, fat);

      return {
        id: v.id || `var-${Date.now()}-${index}`,
        name: v.name,
        assignedDays: v.assignedDays ? [...v.assignedDays] : [],
        proteinG: prot,
        carbsG: carb,
        fatsG: fat,
        proteinGPerKg: v.gPerKg?.protein ?? Number((prot / weight).toFixed(1)),
        carbsGPerKg: v.gPerKg?.carbs ?? Number((carb / weight).toFixed(1)),
        fatsGPerKg: v.gPerKg?.fats ?? Number((fat / weight).toFixed(1)),
        kcal,
      };
    });

    setItems(initialItems);
    setInitialStateHash(
      JSON.stringify({
        unitMode: 'grams',
        items: initialItems.map((it) => ({
          id: it.id,
          name: it.name,
          assignedDays: it.assignedDays,
          proteinG: it.proteinG,
          carbsG: it.carbsG,
          fatsG: it.fatsG,
        })),
      })
    );
    setIsLoading(false);
  }, [patientId, dietaId, weight]);

  // Checagem se o formulário foi modificado em relação ao estado inicial
  const isDirty = useMemo(() => {
    if (!initialStateHash) return false;
    const currentHash = JSON.stringify({
      unitMode,
      items: items.map((it) => ({
        id: it.id,
        name: it.name,
        assignedDays: it.assignedDays,
        proteinG: it.proteinG,
        carbsG: it.carbsG,
        fatsG: it.fatsG,
      })),
    });
    return currentHash !== initialStateHash;
  }, [initialStateHash, unitMode, items]);

  // Guardrail do navegador (fechar aba / recarregar)
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Guardrail de navegação interna (Cancelar / Voltar)
  const handleRequestExit = (targetUrl?: string) => {
    if (isDirty) {
      setPendingExitUrl(targetUrl || `/pacientes/${patientId}/dieta/${dietaId}`);
      setShowUnsavedModal(true);
    } else {
      router.push(targetUrl || `/pacientes/${patientId}/dieta/${dietaId}`);
    }
  };

  const handleConfirmExit = () => {
    setShowUnsavedModal(false);
    router.push(pendingExitUrl || `/pacientes/${patientId}/dieta/${dietaId}`);
  };

  const handleUpdateField = (
    id: string,
    field: 'name' | 'protein' | 'carbs' | 'fats',
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        if (field === 'name') {
          return { ...item, name: String(value) };
        }

        const rawStr = String(value);
        const truncatedStr = rawStr.length > 4 ? rawStr.slice(0, 4) : rawStr;
        const numVal = Math.max(0, Number(truncatedStr) || 0);

        if (unitMode === 'grams') {
          const newP = field === 'protein' ? numVal : item.proteinG;
          const newC = field === 'carbs' ? numVal : item.carbsG;
          const newF = field === 'fats' ? numVal : item.fatsG;
          const newKcal = calculatePresetCalories(newP, newC, newF);

          return {
            ...item,
            proteinG: newP,
            carbsG: newC,
            fatsG: newF,
            proteinGPerKg: Number((newP / weight).toFixed(1)),
            carbsGPerKg: Number((newC / weight).toFixed(1)),
            fatsGPerKg: Number((newF / weight).toFixed(1)),
            kcal: newKcal,
          };
        } else {
          const newPKg = field === 'protein' ? numVal : item.proteinGPerKg;
          const newCKg = field === 'carbs' ? numVal : item.carbsGPerKg;
          const newFKg = field === 'fats' ? numVal : item.fatsGPerKg;

          const newP = Math.round(newPKg * weight);
          const newC = Math.round(newCKg * weight);
          const newF = Math.round(newFKg * weight);
          const newKcal = calculatePresetCalories(newP, newC, newF);

          return {
            ...item,
            proteinG: newP,
            carbsG: newC,
            fatsG: newF,
            proteinGPerKg: newPKg,
            carbsGPerKg: newCKg,
            fatsGPerKg: newFKg,
            kcal: newKcal,
          };
        }
      })
    );
  };

  const handleToggleDay = (itemId: string, day: DayOfWeek) => {
    setItems((prev) =>
      prev.map((item) => {
        const hasDay = item.assignedDays.includes(day);

        if (item.id === itemId) {
          const newDays = hasDay
            ? item.assignedDays.filter((d) => d !== day)
            : [...item.assignedDays, day];
          return { ...item, assignedDays: newDays };
        } else {
          if (!hasDay) return item;
          const targetItem = prev.find((i) => i.id === itemId);
          if (targetItem && !targetItem.assignedDays.includes(day)) {
            return { ...item, assignedDays: item.assignedDays.filter((d) => d !== day) };
          }
          return item;
        }
      })
    );
  };

  const handleSelectAllDays = (itemId: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === itemId);
      const isAllSelected = target && target.assignedDays.length === 7;

      return prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            assignedDays: isAllSelected ? [] : [...ALL_WEEK_DAYS],
          };
        } else {
          return {
            ...item,
            assignedDays: isAllSelected ? item.assignedDays : [],
          };
        }
      });
    });
  };

  const handleAddVariation = () => {
    const nextIdx = items.length + 1;
    const defaultProt = Math.round(weight * 2.0);
    const defaultCarb = Math.round(weight * 2.5);
    const defaultFat = Math.round(weight * 0.8);
    const kcal = calculatePresetCalories(defaultProt, defaultCarb, defaultFat);

    const newItem: EditableVariationItem = {
      id: `var-custom-${Date.now()}`,
      name: `Variação ${nextIdx}`,
      assignedDays: [],
      proteinG: defaultProt,
      carbsG: defaultCarb,
      fatsG: defaultFat,
      proteinGPerKg: Number((defaultProt / weight).toFixed(1)),
      carbsGPerKg: Number((defaultCarb / weight).toFixed(1)),
      fatsGPerKg: Number((defaultFat / weight).toFixed(1)),
      kcal,
    };

    setItems((prev) => [...prev, newItem]);
  };

  const handleCopyValues = (item: EditableVariationItem) => {
    setCopiedValues({
      proteinG: item.proteinG,
      carbsG: item.carbsG,
      fatsG: item.fatsG,
      proteinGPerKg: item.proteinGPerKg,
      carbsGPerKg: item.carbsGPerKg,
      fatsGPerKg: item.fatsGPerKg,
      kcal: item.kcal,
      sourceName: item.name,
    });
    toast.success(`Valores de "${item.name}" copiados!`);
  };

  const handlePasteValues = (targetId: string) => {
    if (!copiedValues) return;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== targetId) return item;
        return {
          ...item,
          proteinG: copiedValues.proteinG,
          carbsG: copiedValues.carbsG,
          fatsG: copiedValues.fatsG,
          proteinGPerKg: copiedValues.proteinGPerKg,
          carbsGPerKg: copiedValues.carbsGPerKg,
          fatsGPerKg: copiedValues.fatsGPerKg,
          kcal: copiedValues.kcal,
        };
      })
    );
    toast.success(`Valores colados na variação!`);
  };

  const handleDuplicateItem = (itemId: string) => {
    const source = items.find((i) => i.id === itemId);
    if (!source) return;

    const newItem: EditableVariationItem = {
      ...source,
      id: `var-${Date.now()}`,
      name: `${source.name} (Cópia)`,
      assignedDays: [],
    };

    setItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (itemId: string) => {
    if (items.length <= 1) {
      toast.error('O plano precisa ter pelo menos 1 variação.');
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Drag and drop handlers seguros acionados exclusivamente pelo Grip Handle
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent, index: number) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverIndex === index) {
      setDragOverIndex(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIdx = draggedIndex ?? Number(e.dataTransfer.getData('text/plain'));

    if (
      Number.isInteger(sourceIdx) &&
      sourceIdx >= 0 &&
      sourceIdx < items.length &&
      sourceIdx !== targetIndex
    ) {
      const newItems = [...items];
      const [draggedItem] = newItems.splice(sourceIdx, 1);
      newItems.splice(targetIndex, 0, draggedItem);
      setItems(newItems);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Suporte a teclado Alt + Setas
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      const targetIndex = e.key === 'ArrowUp' ? index - 1 : index + 1;
      if (targetIndex >= 0 && targetIndex < items.length) {
        const newItems = [...items];
        const [movedItem] = newItems.splice(index, 1);
        newItems.splice(targetIndex, 0, movedItem);
        setItems(newItems);
      }
    }
  };

  // Estatísticas Semanais
  const weeklyAverage = useMemo(() => {
    const mappedVars: CarbCyclingVariation[] = items.map((i) => ({
      id: i.id,
      name: i.name,
      type: 'custom',
      assignedDays: i.assignedDays,
      targetKcal: i.kcal,
      targetProtein: i.proteinG,
      targetCarbs: i.carbsG,
      targetFats: i.fatsG,
      meals: [],
    }));
    return calculateWeeklyCycleAverage(mappedVars);
  }, [items]);

  const assignedDaysSet = useMemo(() => {
    const set = new Set<DayOfWeek>();
    items.forEach((i) => i.assignedDays.forEach((d) => set.add(d)));
    return set;
  }, [items]);

  const all7DaysAssigned = assignedDaysSet.size === 7;

  // Itens das Médias Semanais: 4 colunas compactas, sem repetição da palavra "média"
  const metricItems: [
    MetricBoxGroupItem,
    MetricBoxGroupItem,
    MetricBoxGroupItem,
    MetricBoxGroupItem,
  ] = useMemo(() => [
    {
      label: 'Calorias',
      value: weeklyAverage.avgKcal,
      unit: 'kcal/dia',
      tone: 'default',
      size: 'compact',
      icon: <Sparkles className="text-primary" aria-hidden="true" />,
    },
    {
      label: 'Proteína',
      value: weeklyAverage.avgProtein,
      unit: 'g/dia',
      tone: 'protein',
      size: 'compact',
    },
    {
      label: 'Carboidrato',
      value: weeklyAverage.avgCarbs,
      unit: 'g/dia',
      tone: 'carbohydrate',
      size: 'compact',
    },
    {
      label: 'Gordura',
      value: weeklyAverage.avgFats,
      unit: 'g/dia',
      tone: 'fat',
      size: 'compact',
    },
  ], [weeklyAverage]);

  const handleSave = () => {
    if (!dietPlan) return;

    if (!all7DaysAssigned) {
      const missingCount = 7 - assignedDaysSet.size;
      toast.error(
        `Distribua todos os 7 dias da semana antes de salvar (faltam ${missingCount} ${
          missingCount === 1 ? 'dia' : 'dias'
        }).`
      );
      return;
    }

    const originalVariations = dietPlan.carbCyclingVariations || [];
    const updatedVariations: CarbCyclingVariation[] = items.map((item) => {
      const original = originalVariations.find((v) => v.id === item.id);
      return {
        id: item.id,
        name: item.name.trim() || 'Variação Sem Nome',
        type: original?.type || 'custom',
        assignedDays: item.assignedDays,
        targetKcal: item.kcal,
        targetProtein: item.proteinG,
        targetCarbs: item.carbsG,
        targetFats: item.fatsG,
        inputMode: unitMode,
        gPerKg: {
          protein: item.proteinGPerKg,
          carbs: item.carbsGPerKg,
          fats: item.fatsGPerKg,
        },
        meals: original?.meals || [],
      };
    });

    const updatedPlan: FullDietPlan = {
      ...dietPlan,
      mode: 'carb_cycling',
      carbCyclingVariationsCount: updatedVariations.length,
      carbCyclingVariations: updatedVariations,
    };

    setInitialStateHash('');
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('nutridiet_cycle_configured', 'true');
    }
    saveDietToStorage(updatedPlan);
    toast.success('Ciclo de carboidratos configurado com sucesso!');
    router.push(`/pacientes/${patientId}/dieta/${dietaId}`);
  };

  useSaveShortcut({
    onSave: handleSave,
    priority: 0,
  });

  if (isLoading || !patient || !dietPlan) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  const headerActions = (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="compact"
        onClick={() => handleRequestExit()}
      >
        Cancelar
      </Button>
      <Button
        variant="primary"
        size="compact"
        onClick={handleSave}
        disabled={!all7DaysAssigned}
        aria-keyshortcuts="Control+s Meta+s"
        title={
          !all7DaysAssigned
            ? 'Distribua todos os 7 dias da semana antes de salvar'
            : 'Salvar configurações do ciclo e voltar (Ctrl+S)'
        }
        className="flex items-center gap-1.5"
      >
        <Save size={14} aria-hidden="true" />
        <span>
          Salvar Configurações <span className="opacity-70 text-[11px] font-mono">(Ctrl+S)</span>
        </span>
      </Button>
    </div>
  );

  return (
    <main
      aria-label="Configuração do Ciclo de Carboidratos"
      className="flex w-full max-w-container-workflow flex-1 flex-col gap-6 py-6 px-8 lg:mx-auto text-text-primary"
    >
      {/* 1. PageContextHeader canônico do NutriDiet */}
      <PageContextHeader
        title="Configuração do Ciclo de Carboidratos"
        backHref={`/pacientes/${patientId}/dieta/${dietaId}`}
        backLabel={`Voltar para a prescrição de ${patient.name}`}
        onBackClick={() => handleRequestExit()}
        breadcrumbs={[
          { label: 'Pacientes', href: '/pacientes' },
          { label: patient.name, href: `/pacientes/${patientId}` },
          { label: 'Plano Alimentar', href: `/pacientes/${patientId}/dieta/${dietaId}` },
          { label: 'Ciclo de Carboidratos' },
        ]}
        actions={headerActions}
      />

      {/* 2. Contexto do Paciente no padrão Surface + PatientProfileHeader */}
      <Surface variant="default" density="compact" className="p-5">
        <PatientProfileHeader.Root
          patient={{
            name: patient.name,
            initials: patient.initials,
            objective: patient.objective || 'Prescrição Alimentar',
            age: patient.age,
            heightCm: patient.heightCm,
            gender: patient.gender,
            weightKg: patient.weightKg,
          }}
          className="border-b-0 pb-0"
        >
          <PatientProfileHeader.Identity>
            <PatientProfileHeader.Avatar variant="charcoal" size="md" />
            <PatientProfileHeader.Info>
              <div className="flex flex-wrap items-center gap-2">
                <PatientProfileHeader.Name />
                <PatientProfileHeader.Gender />
                <PatientProfileHeader.Badge />
              </div>
              <PatientProfileHeader.Meta />
            </PatientProfileHeader.Info>
          </PatientProfileHeader.Identity>
        </PatientProfileHeader.Root>
      </Surface>

      {/* 3. Seção de Médias Semanais: 4 Métricas compactas com divisor vertical */}
      <section aria-label="Média semanal do ciclo" className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h2 className={textStyle('section-title')}>Média Semanal Ponderada</h2>
          <span
            className={cn(
              textStyle('legal'),
              all7DaysAssigned ? 'text-primary font-semibold' : 'text-warning font-semibold'
            )}
          >
            {all7DaysAssigned
              ? '✓ 7/7 dias distribuídos'
              : `⚠️ ${assignedDaysSet.size}/7 dias distribuídos`}
          </span>
        </div>
        <MetricBoxGroup items={metricItems} className="shadow-xs" />
      </section>

      {/* 4. Seção de Variações do Ciclo em 2 Linhas com Drag & Drop */}
      <section aria-label="Variações do ciclo de carboidratos" className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className={textStyle('section-title')}>Variações do Ciclo</h2>
            <p className={textStyle('legal')}>
              Ajuste as metas de macronutrientes de cada oscilação e atribua os dias da semana correspondentes.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Seletor de Unidade com Label Externo */}
            <div className="flex items-center gap-2">
              <label htmlFor="dedicated-unit-mode" className="text-style-caption font-medium text-text-muted whitespace-nowrap">
                Unidade:
              </label>
              <div className="w-36">
                <SelectField
                  id="dedicated-unit-mode"
                  value={unitMode}
                  onValueChange={(val) => setUnitMode(val as 'grams' | 'g_per_kg')}
                  options={[
                    { value: 'grams', label: 'gramas (g)' },
                    { value: 'g_per_kg', label: `g/kg (${weight}kg)` },
                  ]}
                  size="compact"
                  aria-label="Unidade de entrada dos macronutrientes"
                />
              </div>
            </div>

            {/* Botão Adicionar Variação */}
            <Button
              type="button"
              variant="secondary"
              size="compact"
              onClick={handleAddVariation}
              className="flex items-center gap-1.5"
            >
              <Plus size={14} className="text-primary" aria-hidden="true" />
              <span>Adicionar Variação</span>
            </Button>
          </div>
        </div>

        {/* Lista Vertical de Variações */}
        <div
          className="flex flex-col gap-3"
          onDragOver={(e) => e.preventDefault()}
        >
          {items.map((item, index) => {
            const isDraggingThis = draggedIndex === index;
            const isDragOverThis = dragOverIndex === index && draggedIndex !== index;
            const isAllDaysSelected = item.assignedDays.length === 7;

            return (
              <Surface
                key={item.id}
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={(e) => handleDragLeave(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                className={cn(
                  'p-4 flex flex-col gap-3 rounded-surface border border-border-subtle hover:border-border-hover transition-all bg-surface',
                  isDraggingThis && 'opacity-40 border-dashed border-primary',
                  isDragOverThis && 'border-t-2 border-t-primary ring-2 ring-primary/20 bg-surface'
                )}
              >
                {/* Linha 1: Handle, Ordem, Nome, Prot, Carbo, Gordura, Kcal e Ações */}
                <div className="flex flex-wrap items-center justify-between gap-3 w-full">
                  {/* Lado Esquerdo: Grip Handle + Ordem + Input de Nome */}
                  <div className="flex items-center gap-2.5 flex-1 min-w-60">
                    <div
                      draggable
                      onDragStart={(e) => {
                        e.stopPropagation();
                        handleDragStart(e, index);
                      }}
                      onDragEnd={handleDragEnd}
                      className="text-text-muted hover:text-text-primary cursor-grab active:cursor-grabbing shrink-0 p-1 -m-1 rounded-control hover:bg-surface-subtle transition-colors"
                      title="Arrastar para reordenar (ou use Alt + Setas no teclado)"
                      aria-label="Alça de reordenação"
                    >
                      <GripVertical size={16} aria-hidden="true" />
                    </div>

                    <span className="size-6 rounded-round bg-surface-subtle border border-border-subtle text-text-muted flex items-center justify-center font-bold text-style-chart-micro shrink-0">
                      {index + 1}
                    </span>

                    <Input
                      type="text"
                      size="compact"
                      value={item.name}
                      onChange={(e) => handleUpdateField(item.id, 'name', e.target.value)}
                      placeholder="Ex: Alto Carbo"
                      className="bg-surface w-48 text-text-primary"
                    />
                  </div>

                  {/* Centro/Direita: Inputs de Macros e Kcal */}
                  <div className="flex flex-wrap items-center gap-3.5">
                    {/* Proteína */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-style-caption font-semibold text-macro-protein whitespace-nowrap">
                        Prot:
                      </span>
                      <div className="relative w-20">
                        <Input
                          type="number"
                          size="compact"
                          step={unitMode === 'grams' ? '1' : '0.1'}
                          min="0"
                          max="9999"
                          maxLength={4}
                          value={unitMode === 'grams' ? item.proteinG : item.proteinGPerKg}
                          onChange={(e) => handleUpdateField(item.id, 'protein', e.target.value.slice(0, 4))}
                          onInput={(e) => {
                            const target = e.currentTarget;
                            if (target.value.length > 4) {
                              target.value = target.value.slice(0, 4);
                            }
                          }}
                          className="bg-surface pr-6 text-right font-medium tabular-nums"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-style-legal text-text-muted pointer-events-none">
                          {unitMode === 'grams' ? 'g' : 'g/k'}
                        </span>
                      </div>
                    </div>

                    {/* Carboidrato */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-style-caption font-semibold text-macro-carbohydrate whitespace-nowrap">
                        Carb:
                      </span>
                      <div className="relative w-20">
                        <Input
                          type="number"
                          size="compact"
                          step={unitMode === 'grams' ? '1' : '0.1'}
                          min="0"
                          max="9999"
                          maxLength={4}
                          value={unitMode === 'grams' ? item.carbsG : item.carbsGPerKg}
                          onChange={(e) => handleUpdateField(item.id, 'carbs', e.target.value.slice(0, 4))}
                          onInput={(e) => {
                            const target = e.currentTarget;
                            if (target.value.length > 4) {
                              target.value = target.value.slice(0, 4);
                            }
                          }}
                          className="bg-surface pr-6 text-right font-medium tabular-nums"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-style-legal text-text-muted pointer-events-none">
                          {unitMode === 'grams' ? 'g' : 'g/k'}
                        </span>
                      </div>
                    </div>

                    {/* Gordura */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-style-caption font-semibold text-macro-fat whitespace-nowrap">
                        Gord:
                      </span>
                      <div className="relative w-20">
                        <Input
                          type="number"
                          size="compact"
                          step={unitMode === 'grams' ? '1' : '0.1'}
                          min="0"
                          max="9999"
                          maxLength={4}
                          value={unitMode === 'grams' ? item.fatsG : item.fatsGPerKg}
                          onChange={(e) => handleUpdateField(item.id, 'fats', e.target.value.slice(0, 4))}
                          onInput={(e) => {
                            const target = e.currentTarget;
                            if (target.value.length > 4) {
                              target.value = target.value.slice(0, 4);
                            }
                          }}
                          className="bg-surface pr-6 text-right font-medium tabular-nums"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-style-legal text-text-muted pointer-events-none">
                          {unitMode === 'grams' ? 'g' : 'g/k'}
                        </span>
                      </div>
                    </div>

                    {/* Total Calórico em Texto Limpo */}
                    <div className="text-style-body font-bold text-text-primary whitespace-nowrap pl-1">
                      {item.kcal} <span className="text-style-legal font-normal text-text-muted">kcal</span>
                    </div>
                  </div>

                  {/* Ações: Copiar (apenas ícone), Colar (apenas ícone) e Excluir */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      type="button"
                      variant="secondary"
                      size="compact"
                      iconOnly
                      onClick={() => handleCopyValues(item)}
                      className="size-8 p-0 flex items-center justify-center"
                      title="Copiar valores da variação"
                      aria-label="Copiar valores da variação"
                    >
                      <Copy size={13} aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="compact"
                      iconOnly
                      disabled={!copiedValues}
                      onClick={() => handlePasteValues(item.id)}
                      className="size-8 p-0 flex items-center justify-center"
                      title={copiedValues ? `Colar valores copiados de "${copiedValues.sourceName}"` : 'Nenhum valor copiado'}
                      aria-label="Colar valores na variação"
                    >
                      <ClipboardPaste size={13} aria-hidden="true" />
                    </Button>
                    <DeleteIconButton
                      size="compact"
                      disabled={items.length <= 1}
                      onClick={() => handleRemoveItem(item.id)}
                      title="Excluir variação"
                      aria-label="Excluir variação"
                    />
                  </div>
                </div>

                {/* Linha 2: Escala Semanal Alinhada à Esquerda + Divisor + Botão 'Todos' */}
                <div className="flex flex-wrap items-center justify-start gap-3 pt-2.5 border-t border-border-subtle">
                  <div className="flex items-center gap-1.5 text-style-chart-micro font-bold text-text-muted uppercase shrink-0">
                    <Calendar size={12} aria-hidden="true" />
                    <span>Escala:</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {DAYS_OF_WEEK.map((day) => {
                      const isAssigned = item.assignedDays.includes(day.id);
                      return (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => handleToggleDay(item.id, day.id)}
                          aria-pressed={isAssigned}
                          className={cn(
                            'h-7 w-9 flex items-center justify-center rounded-control text-style-chart-micro font-bold transition-all cursor-pointer text-center border box-border select-none shrink-0',
                            isAssigned
                              ? 'bg-primary text-on-primary border-primary shadow-xs'
                              : 'bg-surface-subtle text-text-muted hover:text-text-primary hover:bg-surface border-border-subtle'
                          )}
                        >
                          {day.shortLabel}
                        </button>
                      );
                    })}

                    {/* Divisor vertical sutil entre o Domingo e o botão Todos */}
                    <div className="h-4 w-px bg-border-divider mx-1.5 shrink-0" aria-hidden="true" />

                    {/* Botão Selecionar Todos à Direita do Divisor */}
                    <button
                      type="button"
                      onClick={() => handleSelectAllDays(item.id)}
                      title={
                        isAllDaysSelected
                          ? 'Desmarcar todos os dias desta variação'
                          : 'Selecionar todos os dias da semana para esta variação'
                      }
                      aria-pressed={isAllDaysSelected}
                      className={cn(
                        'h-7 px-2.5 flex items-center justify-center gap-1.5 rounded-control text-style-chart-micro font-bold transition-all cursor-pointer border box-border select-none shrink-0',
                        isAllDaysSelected
                          ? 'bg-primary text-on-primary border-primary shadow-xs'
                          : 'bg-surface-subtle text-text-muted hover:text-text-primary hover:bg-surface border-border-subtle'
                      )}
                    >
                      <CheckCheck size={13} aria-hidden="true" />
                      <span>Todos</span>
                    </button>
                  </div>
                </div>
              </Surface>
            );
          })}

          {/* Botão Adicionar no fim da lista */}
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddVariation}
            className="w-full border-dashed border-border-hover py-3 flex items-center justify-center gap-2 font-semibold text-style-body-small hover:bg-surface-subtle mt-1"
          >
            <Plus size={15} aria-hidden="true" />
            <span>Adicionar Nova Variação ao Ciclo</span>
          </Button>
        </div>
      </section>

      {/* Modal de Guardrail para Alterações Não Salvas */}
      <Dialog open={showUnsavedModal} onOpenChange={setShowUnsavedModal}>
        <DialogContent className="bg-surface border-border-subtle p-6 rounded-surface max-w-sm">
          <DialogHeader>
            <DialogTitle className={textStyle('dialog-title')}>
              <AlertTriangle size={18} className="text-warning shrink-0 inline-block mr-2" aria-hidden="true" />
              <span>Descartar alterações?</span>
            </DialogTitle>
            <DialogDescription className={textStyle('body-secondary')}>
              As alterações não salvas no ciclo de carboidratos serão perdidas.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-row justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button
              type="button"
              variant="secondary"
              size="compact"
              onClick={() => setShowUnsavedModal(false)}
            >
              Continuar editando
            </Button>
            <Button
              type="button"
              variant="destructive-outline"
              size="compact"
              onClick={handleConfirmExit}
            >
              Descartar e sair
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
