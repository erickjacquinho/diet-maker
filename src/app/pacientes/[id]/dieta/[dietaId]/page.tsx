'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DietBuilderTemplate } from '@/components/templates';
import { MacroMetricCardProps } from '@/components/molecules';
import { FoodSearchModal } from '@/components/molecules/FoodSearchModal';
import { getPatientById, Patient } from '@/lib/patientsStore';
import {
  FullDietPlan,
  DietMeal,
  DietItem,
  CarbCyclingVariation,
  getDietFromStorage,
  saveDietToStorage,
  createInitialDietPlan,
  calculateMealsTotal,
} from '@/lib/dietStore';
import { calculatePresetCalories } from '@/lib/presetUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Percent, Copy, Check, Edit3, MessageCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function DietBuilderPage() {
  const params = useParams();
  const router = useRouter();

  const patientId = (params?.id as string) || 'pat-1';
  const dietaId = (params?.dietaId as string) || 'nova';

  const [patient, setPatient] = useState<Patient | null>(null);
  const [dietPlan, setDietPlan] = useState<FullDietPlan | null>(null);

  // Active Carb Cycling Variation ID
  const [activeVariationId, setActiveVariationId] = useState<string>('var-high');

  // Modals state
  const [foodSearchMealIndex, setFoodSearchMealIndex] = useState<number | null>(null);
  const [isScaleModalOpen, setIsScaleModalOpen] = useState(false);
  const [scalePercentage, setScalePercentage] = useState<number>(10);

  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copySourceId, setCopySourceId] = useState<string>('var-high');
  const [copyTargetId, setCopyTargetId] = useState<string>('var-low');

  const [isAdjustGoalsModalOpen, setIsAdjustGoalsModalOpen] = useState(false);
  const [tempTargetProt, setTempTargetProt] = useState<number>(160);
  const [tempTargetCarb, setTempTargetCarb] = useState<number>(240);
  const [tempTargetFat, setTempTargetFat] = useState<number>(65);

  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppText, setWhatsAppText] = useState('');

  // Load Patient & Diet Plan
  useEffect(() => {
    let p = getPatientById(patientId);
    if (!p) {
      p = {
        id: patientId,
        name: 'Paciente Sem Nome',
        age: 30,
        gender: 'Não Informado',
        heightCm: 170,
        weightKg: 70,
        initials: 'P',
        objective: 'Acompanhamento Nutricional',
        targetKcal: 2000,
        targetProtein: 140,
        targetCarbs: 220,
        targetFats: 60,
        lastConsultation: new Date().toLocaleDateString('pt-BR'),
      };
    }
    setPatient(p);

    // Load diet from storage if editing, or create new scratch diet
    if (dietaId !== 'nova') {
      const saved = getDietFromStorage(patientId, dietaId);
      if (saved) {
        setDietPlan(saved);
        if (saved.carbCyclingVariations && saved.carbCyclingVariations.length > 0) {
          setActiveVariationId(saved.carbCyclingVariations[0].id);
        }
        return;
      }
    }

    // New diet plan initialization
    const initial = createInitialDietPlan(patientId, {
      weightKg: p.weightKg,
      targetKcal: p.targetKcal,
      targetProtein: p.targetProtein,
      targetCarbs: p.targetCarbs,
      targetFats: p.targetFats,
    });
    setDietPlan(initial);
  }, [patientId, dietaId]);

  // Current Active Meals and Target Macros depending on mode & variation
  const { currentMeals, targetKcal, targetProt, targetCarb, targetFat } = useMemo(() => {
    if (!dietPlan) {
      return { currentMeals: [], targetKcal: 2000, targetProt: 140, targetCarb: 220, targetFat: 60 };
    }

    if (dietPlan.mode === 'simple') {
      return {
        currentMeals: dietPlan.simpleMeals || [],
        targetKcal: dietPlan.simpleTargetKcal,
        targetProt: dietPlan.simpleTargetProtein,
        targetCarb: dietPlan.simpleTargetCarbs,
        targetFat: dietPlan.simpleTargetFats,
      };
    } else {
      const activeVar = dietPlan.carbCyclingVariations.find((v) => v.id === activeVariationId) || dietPlan.carbCyclingVariations[0];
      return {
        currentMeals: activeVar ? activeVar.meals : [],
        targetKcal: activeVar ? activeVar.targetKcal : 2000,
        targetProt: activeVar ? activeVar.targetProtein : 140,
        targetCarb: activeVar ? activeVar.targetCarbs : 220,
        targetFat: activeVar ? activeVar.targetFats : 60,
      };
    }
  }, [dietPlan, activeVariationId]);

  // Recalculate totals for active meals
  const currentTotals = useMemo(() => calculateMealsTotal(currentMeals), [currentMeals]);

  // Compute Macro Metrics for Header
  const macroMetrics: MacroMetricCardProps[] = useMemo(() => {
    const weight = patient?.weightKg || 70;

    // Kcal
    const kcalDiff = currentTotals.kcal - targetKcal;
    const kcalBadgeText = kcalDiff === 0 ? 'Na meta ✓' : kcalDiff > 0 ? `+${kcalDiff} kcal` : `${kcalDiff} kcal`;
    const kcalBadgeVariant = Math.abs(kcalDiff) <= targetKcal * 0.05 ? 'emerald' : kcalDiff > 0 ? 'rose' : 'amber';
    const kcalPct = targetKcal > 0 ? Math.min(100, Math.round((currentTotals.kcal / targetKcal) * 100)) : 0;

    // Protein
    const protDiff = Math.round((currentTotals.proteinG - targetProt) * 10) / 10;
    const protBadgeText = Math.abs(protDiff) <= 2 ? 'Na meta ✓' : protDiff > 0 ? `+${protDiff}g` : `${protDiff}g`;
    const protBadgeVariant = Math.abs(protDiff) <= targetProt * 0.05 ? 'emerald' : protDiff > 0 ? 'rose' : 'amber';
    const protPct = targetProt > 0 ? Math.min(100, Math.round((currentTotals.proteinG / targetProt) * 100)) : 0;
    const protGPerKg = (currentTotals.proteinG / weight).toFixed(2);
    const protMetaGPerKg = (targetProt / weight).toFixed(1);

    // Carbs
    const carbDiff = Math.round((currentTotals.carbsG - targetCarb) * 10) / 10;
    const carbBadgeText = Math.abs(carbDiff) <= 2 ? 'Na meta ✓' : carbDiff > 0 ? `+${carbDiff}g` : `${carbDiff}g`;
    const carbBadgeVariant = Math.abs(carbDiff) <= targetCarb * 0.05 ? 'emerald' : carbDiff > 0 ? 'rose' : 'amber';
    const carbPct = targetCarb > 0 ? Math.min(100, Math.round((currentTotals.carbsG / targetCarb) * 100)) : 0;
    const carbGPerKg = (currentTotals.carbsG / weight).toFixed(2);
    const carbMetaGPerKg = (targetCarb / weight).toFixed(1);

    // Fats
    const fatDiff = Math.round((currentTotals.fatsG - targetFat) * 10) / 10;
    const fatBadgeText = Math.abs(fatDiff) <= 2 ? 'Na meta ✓' : fatDiff > 0 ? `+${fatDiff}g` : `${fatDiff}g`;
    const fatBadgeVariant = Math.abs(fatDiff) <= targetFat * 0.05 ? 'emerald' : fatDiff > 0 ? 'rose' : 'amber';
    const fatPct = targetFat > 0 ? Math.min(100, Math.round((currentTotals.fatsG / targetFat) * 100)) : 0;
    const fatGPerKg = (currentTotals.fatsG / weight).toFixed(2);
    const fatMetaGPerKg = (targetFat / weight).toFixed(1);

    return [
      {
        label: 'Kcal Total',
        currentValue: `${currentTotals.kcal}`,
        targetValue: `${targetKcal} kcal`,
        statusBadgeText: kcalBadgeText,
        statusBadgeVariant: kcalBadgeVariant,
        percentage: kcalPct,
        macroColor: 'emerald',
      },
      {
        label: 'Proteínas',
        currentValue: `${currentTotals.proteinG}g`,
        targetValue: `${targetProt}g`,
        statusBadgeText: protBadgeText,
        statusBadgeVariant: protBadgeVariant,
        percentage: protPct,
        gPerKgRatio: `${protGPerKg} g/kg`,
        gPerKgMeta: protMetaGPerKg,
        macroColor: 'blue',
      },
      {
        label: 'Carboidratos',
        currentValue: `${currentTotals.carbsG}g`,
        targetValue: `${targetCarb}g`,
        statusBadgeText: carbBadgeText,
        statusBadgeVariant: carbBadgeVariant,
        percentage: carbPct,
        gPerKgRatio: `${carbGPerKg} g/kg`,
        gPerKgMeta: carbMetaGPerKg,
        macroColor: 'amber',
      },
      {
        label: 'Gorduras',
        currentValue: `${currentTotals.fatsG}g`,
        targetValue: `${targetFat}g`,
        statusBadgeText: fatBadgeText,
        statusBadgeVariant: fatBadgeVariant,
        percentage: fatPct,
        gPerKgRatio: `${fatGPerKg} g/kg`,
        gPerKgMeta: fatMetaGPerKg,
        macroColor: 'teal',
      },
    ];
  }, [currentTotals, targetKcal, targetProt, targetCarb, targetFat, patient?.weightKg]);

  // Helper to update current active meals array in state
  const updateActiveMeals = (newMeals: DietMeal[]) => {
    if (!dietPlan) return;

    if (dietPlan.mode === 'simple') {
      setDietPlan({
        ...dietPlan,
        simpleMeals: newMeals,
      });
    } else {
      const updatedVariations = dietPlan.carbCyclingVariations.map((v) =>
        v.id === activeVariationId ? { ...v, meals: newMeals } : v
      );
      setDietPlan({
        ...dietPlan,
        carbCyclingVariations: updatedVariations,
      });
    }
  };

  // Add new meal
  const handleAddMeal = () => {
    const mealCount = currentMeals.length + 1;
    const defaultTimes = ['08:00', '12:00', '16:00', '20:00', '22:00'];
    const time = defaultTimes[(mealCount - 1) % defaultTimes.length];

    const newMeal: DietMeal = {
      id: `meal-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: `Refeição ${mealCount}`,
      time,
      items: [],
    };

    updateActiveMeals([...currentMeals, newMeal]);
    toast.success(`Refeição ${mealCount} adicionada!`);
  };

  // Delete meal
  const handleDeleteMeal = (index: number) => {
    const updated = currentMeals.filter((_, idx) => idx !== index);
    updateActiveMeals(updated);
    toast.success('Refeição excluída com sucesso.');
  };

  // Duplicate meal
  const handleDuplicateMeal = (index: number) => {
    const mealToDup = currentMeals[index];
    if (!mealToDup) return;

    const duplicated: DietMeal = {
      id: `meal-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: `${mealToDup.name} (Cópia)`,
      time: mealToDup.time,
      items: mealToDup.items.map((it) => ({ ...it })),
    };

    const updated = [...currentMeals];
    updated.splice(index + 1, 0, duplicated);
    updateActiveMeals(updated);
    toast.success(`Refeição "${mealToDup.name}" duplicada!`);
  };

  // Update meal title & time
  const handleUpdateMealTitle = (index: number, newTitle: string) => {
    const updated = [...currentMeals];
    if (updated[index]) {
      updated[index].name = newTitle;
      updateActiveMeals(updated);
    }
  };

  const handleUpdateMealTime = (index: number, newTime: string) => {
    const updated = [...currentMeals];
    if (updated[index]) {
      updated[index].time = newTime;
      updateActiveMeals(updated);
    }
  };

  // Add food item to meal
  const handleAddFoodItem = (food: {
    foodId?: string;
    name: string;
    quantityGrams: number;
    protein: number;
    carbs: number;
    fats: number;
    kcal: number;
  }) => {
    if (foodSearchMealIndex === null || !currentMeals[foodSearchMealIndex]) return;

    const updated = [...currentMeals];
    const targetMeal = updated[foodSearchMealIndex];

    const newItem: DietItem = {
      ...food,
    };

    targetMeal.items.push(newItem);
    updateActiveMeals(updated);
    toast.success(`"${food.name}" adicionado à ${targetMeal.name}!`);
  };

  // Update food item quantity (grammage)
  const handleQuantityChange = (mealIndex: number, itemIndex: number, newGrams: number) => {
    const updated = [...currentMeals];
    const meal = updated[mealIndex];
    if (!meal || !meal.items[itemIndex]) return;

    const item = meal.items[itemIndex];
    const oldGrams = item.quantityGrams || 100;
    const ratio = newGrams / oldGrams;

    const protein = Math.round(item.protein * ratio * 10) / 10;
    const carbs = Math.round(item.carbs * ratio * 10) / 10;
    const fats = Math.round(item.fats * ratio * 10) / 10;
    const kcal = calculatePresetCalories(protein, carbs, fats);

    meal.items[itemIndex] = {
      ...item,
      quantityGrams: newGrams,
      protein,
      carbs,
      fats,
      kcal,
    };

    updateActiveMeals(updated);
  };

  // Remove food item from meal
  const handleRemoveFoodItem = (mealIndex: number, itemIndex: number) => {
    const updated = [...currentMeals];
    const meal = updated[mealIndex];
    if (!meal) return;

    meal.items.splice(itemIndex, 1);
    updateActiveMeals(updated);
  };

  // Mode Change Handler
  const handleModeChange = (newMode: 'simple' | 'carb_cycling') => {
    if (!dietPlan) return;
    setDietPlan({
      ...dietPlan,
      mode: newMode,
    });
  };

  // Variations Count Change Handler
  const handleVariationsCountChange = (count: 2 | 3) => {
    if (!dietPlan) return;
    setDietPlan({
      ...dietPlan,
      carbCyclingVariationsCount: count,
    });
  };

  // Copy Meals Between Variations
  const handleExecuteCopyMeals = () => {
    if (!dietPlan) return;

    const sourceVar = dietPlan.carbCyclingVariations.find((v) => v.id === copySourceId);
    if (!sourceVar) return;

    const clonedMeals: DietMeal[] = sourceVar.meals.map((m) => ({
      id: `meal-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: m.name,
      time: m.time,
      items: m.items.map((it) => ({ ...it })),
    }));

    const updatedVariations = dietPlan.carbCyclingVariations.map((v) =>
      v.id === copyTargetId ? { ...v, meals: clonedMeals } : v
    );

    setDietPlan({
      ...dietPlan,
      carbCyclingVariations: updatedVariations,
    });

    setIsCopyModalOpen(false);
    toast.success('Refeições copiadas com sucesso!');
  };

  // Scale active diet / meals by percentage
  const handleExecuteScale = () => {
    if (scalePercentage === 0) return;
    const multiplier = 1 + scalePercentage / 100;

    const scaledMeals = currentMeals.map((meal) => ({
      ...meal,
      items: meal.items.map((item) => {
        const newGrams = Math.round(item.quantityGrams * multiplier);
        const protein = Math.round(item.protein * multiplier * 10) / 10;
        const carbs = Math.round(item.carbs * multiplier * 10) / 10;
        const fats = Math.round(item.fats * multiplier * 10) / 10;
        const kcal = calculatePresetCalories(protein, carbs, fats);

        return {
          ...item,
          quantityGrams: Math.max(1, newGrams),
          protein,
          carbs,
          fats,
          kcal,
        };
      }),
    }));

    updateActiveMeals(scaledMeals);
    setIsScaleModalOpen(false);
    toast.success(`Dieta escalada em ${scalePercentage > 0 ? '+' : ''}${scalePercentage}%!`);
  };

  // Open Adjust Goals Modal
  const handleOpenAdjustGoals = () => {
    setTempTargetProt(targetProt);
    setTempTargetCarb(targetCarb);
    setTempTargetFat(targetFat);
    setIsAdjustGoalsModalOpen(true);
  };

  // Save Adjusted Goals
  const handleSaveAdjustedGoals = () => {
    if (!dietPlan) return;

    const calcKcal = calculatePresetCalories(tempTargetProt, tempTargetCarb, tempTargetFat);

    if (dietPlan.mode === 'simple') {
      setDietPlan({
        ...dietPlan,
        simpleTargetProtein: tempTargetProt,
        simpleTargetCarbs: tempTargetCarb,
        simpleTargetFats: tempTargetFat,
        simpleTargetKcal: calcKcal,
      });
    } else {
      const updatedVariations = dietPlan.carbCyclingVariations.map((v) =>
        v.id === activeVariationId
          ? {
              ...v,
              targetProtein: tempTargetProt,
              targetCarbs: tempTargetCarb,
              targetFats: tempTargetFat,
              targetKcal: calcKcal,
            }
          : v
      );
      setDietPlan({
        ...dietPlan,
        carbCyclingVariations: updatedVariations,
      });
    }

    setIsAdjustGoalsModalOpen(false);
    toast.success('Metas de macronutrientes atualizadas!');
  };

  // Save Diet to Storage
  const handleSaveDiet = () => {
    if (!dietPlan) return;

    const saved = saveDietToStorage(dietPlan);
    setDietPlan(saved);
    toast.success('Prescrição de dieta salva com sucesso!');
  };

  // Generate WhatsApp Share Text
  const handleOpenWhatsAppShare = () => {
    if (!patient || !dietPlan) return;

    let text = `*Plano Alimentar - ${patient.name}*\n`;
    text += `Data: ${dietPlan.updatedAt}\n\n`;

    if (dietPlan.mode === 'simple') {
      text += `*META DIÁRIA:* ${targetKcal} kcal (P: ${targetProt}g | C: ${targetCarb}g | G: ${targetFat}g)\n\n`;

      dietPlan.simpleMeals.forEach((meal, idx) => {
        text += `*${meal.name} (${meal.time})*\n`;
        meal.items.forEach((it) => {
          text += `• ${it.name} - ${it.quantityGrams}g (${it.kcal} kcal)\n`;
        });
        text += `\n`;
      });
    } else {
      text += `*CICLO DE CARBOIDRATOS*\n\n`;
      const activeVars = dietPlan.carbCyclingVariations.slice(0, dietPlan.carbCyclingVariationsCount);

      activeVars.forEach((v) => {
        text += `----------------------------------------\n`;
        text += `📌 *${v.name.toUpperCase()}*\n`;
        text += `Meta: ${v.targetKcal} kcal | P: ${v.targetProtein}g | C: ${v.targetCarbs}g | G: ${v.targetFats}g\n\n`;

        v.meals.forEach((meal) => {
          text += `*${meal.name} (${meal.time})*\n`;
          meal.items.forEach((it) => {
            text += `• ${it.name} - ${it.quantityGrams}g\n`;
          });
          text += `\n`;
        });
      });
    }

    text += `_Dúvidas ou adaptações, entre em contato com seu nutricionista._`;

    setWhatsAppText(text);
    setIsWhatsAppModalOpen(true);
  };

  const handleCopyWhatsAppText = () => {
    navigator.clipboard.writeText(whatsAppText);
    toast.success('Texto formatado copiado para a área de transferência!');
  };

  // PDF Exporting / Printing
  const handleExportPDF = () => {
    window.print();
  };

  // Format MealCardContainerProps array for active meals
  const formattedMealsData = useMemo(() => {
    return currentMeals.map((meal, mealIdx) => {
      const totals = calculateMealsTotal([meal]);
      return {
        id: meal.id,
        title: meal.name,
        time: meal.time,
        kcal: totals.kcal,
        proteinG: totals.proteinG,
        carbsG: totals.carbsG,
        fatsG: totals.fatsG,
        items: meal.items.map((it) => ({
          name: it.name,
          kcal: it.kcal,
          protein: it.protein,
          carbs: it.carbs,
          fats: it.fats,
          quantityGrams: it.quantityGrams,
        })),
        onTitleChange: (newTitle: string) => handleUpdateMealTitle(mealIdx, newTitle),
        onTimeChange: (newTime: string) => handleUpdateMealTime(mealIdx, newTime),
        onAddFoodClick: () => setFoodSearchMealIndex(mealIdx),
        onDuplicate: () => handleDuplicateMeal(mealIdx),
        onScale: () => {
          setFoodSearchMealIndex(mealIdx);
          setIsScaleModalOpen(true);
        },
        onDeleteMeal: () => handleDeleteMeal(mealIdx),
        onRemoveItem: (itemIdx: number) => handleRemoveFoodItem(mealIdx, itemIdx),
        onQuantityChange: (itemIdx: number, newGrams: number) => handleQuantityChange(mealIdx, itemIdx, newGrams),
      };
    });
  }, [currentMeals]);

  if (!patient || !dietPlan) return null;

  return (
    <div>
      <DietBuilderTemplate
        patientId={patient.id}
        patientName={patient.name}
        dietaId={dietaId}
        dietModeProps={{
          mode: dietPlan.mode,
          onModeChange: handleModeChange,
          variationsCount: dietPlan.carbCyclingVariationsCount,
          onVariationsCountChange: handleVariationsCountChange,
          variations: dietPlan.carbCyclingVariations,
          activeVariationId,
          onSelectVariation: setActiveVariationId,
          onCopyMealsBetweenVariations: () => setIsCopyModalOpen(true),
        }}
        macroTrackerData={{
          patientInitials: patient.initials,
          patientName: patient.name,
          patientWeightKg: patient.weightKg,
          patientGoalDescription: `${patient.objective || 'Prescrição Alimentar'} • Peso: ${patient.weightKg}kg`,
          onAdjustGoals: handleOpenAdjustGoals,
          metrics: macroMetrics,
        }}
        mealsData={formattedMealsData}
        onAddMeal={handleAddMeal}
        onScaleDiet={() => setIsScaleModalOpen(true)}
        onWhatsAppShare={handleOpenWhatsAppShare}
        onExportPDF={handleExportPDF}
        onSaveDiet={handleSaveDiet}
      />

      {/* TACO Food Search Modal */}
      <FoodSearchModal
        isOpen={foodSearchMealIndex !== null}
        onClose={() => setFoodSearchMealIndex(null)}
        mealTitle={foodSearchMealIndex !== null && currentMeals[foodSearchMealIndex] ? currentMeals[foodSearchMealIndex].name : 'Refeição'}
        onAddFood={handleAddFoodItem}
      />

      {/* Scale Diet Modal */}
      <Dialog open={isScaleModalOpen} onOpenChange={setIsScaleModalOpen}>
        <DialogContent className="sm:max-w-md bg-warm-card border-warm-border p-6 rounded-2xl">
          <DialogHeader className="border-b border-warm-border pb-3">
            <DialogTitle className="font-black text-base text-warm-charcoal flex items-center space-x-2">
              <Percent size={18} className="text-warm-emerald" />
              <span>Escalar Porcentagem da Dieta</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-warm-muted">
              Aumente ou reduza proporcionalmente a gramatura dos alimentos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div>
              <label className="text-xs font-bold text-warm-charcoal block mb-2">Porcentagem de Ajuste (%)</label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={scalePercentage}
                  onChange={(e) => setScalePercentage(Number(e.target.value))}
                  className="bg-warm-inner border-warm-border text-sm font-black text-center"
                />
                <span className="text-sm font-bold text-warm-muted">%</span>
              </div>
            </div>

            {/* Quick Percentage Shortcuts */}
            <div className="flex flex-wrap gap-1.5">
              {[-20, -15, -10, -5, 5, 10, 15, 20].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setScalePercentage(pct)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                    scalePercentage === pct
                      ? 'bg-warm-emerald text-white border-transparent'
                      : 'bg-warm-inner border-warm-border text-warm-charcoal hover:bg-warm-card'
                  }`}
                >
                  {pct > 0 ? `+${pct}%` : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="border-t border-warm-border pt-3">
            <Button variant="outline" size="sm" onClick={() => setIsScaleModalOpen(false)}>
              Cancelar
            </Button>

            <Button variant="emerald" onClick={handleExecuteScale} size="sm" className="font-bold">
              Aplicar Escala ({scalePercentage > 0 ? '+' : ''}{scalePercentage}%)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Copy Meals Between Carb Cycling Variations Modal */}
      <Dialog open={isCopyModalOpen} onOpenChange={setIsCopyModalOpen}>
        <DialogContent className="sm:max-w-md bg-warm-card border-warm-border p-6 rounded-2xl">
          <DialogHeader className="border-b border-warm-border pb-3">
            <DialogTitle className="font-black text-base text-warm-charcoal flex items-center space-x-2">
              <Copy size={18} className="text-warm-emerald" />
              <span>Copiar Refeições entre Dias</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-warm-muted">
              Copie o plano de refeições de um dia do ciclo para outro para fácil adaptação de gramaturas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div>
              <label className="text-xs font-bold text-warm-charcoal block mb-1">Copiar De (Origem):</label>
              <select
                value={copySourceId}
                onChange={(e) => setCopySourceId(e.target.value)}
                className="w-full p-2 bg-warm-inner border border-warm-border rounded-xl text-xs font-bold text-warm-charcoal"
              >
                {dietPlan.carbCyclingVariations.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.meals.length} refeições)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-warm-charcoal block mb-1">Copiar Para (Destino):</label>
              <select
                value={copyTargetId}
                onChange={(e) => setCopyTargetId(e.target.value)}
                className="w-full p-2 bg-warm-inner border border-warm-border rounded-xl text-xs font-bold text-warm-charcoal"
              >
                {dietPlan.carbCyclingVariations.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter className="border-t border-warm-border pt-3">
            <Button variant="outline" size="sm" onClick={() => setIsCopyModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="emerald" onClick={handleExecuteCopyMeals} size="sm" className="font-bold">
              Confirmar Cópia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjust Target Goals Modal */}
      <Dialog open={isAdjustGoalsModalOpen} onOpenChange={setIsAdjustGoalsModalOpen}>
        <DialogContent className="sm:max-w-md bg-warm-card border-warm-border p-6 rounded-2xl">
          <DialogHeader className="border-b border-warm-border pb-3">
            <DialogTitle className="font-black text-base text-warm-charcoal flex items-center space-x-2">
              <Edit3 size={18} className="text-warm-emerald" />
              <span>Ajustar Metas Manuais de Macronutrientes</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-warm-muted">
              Altere as metas de Proteínas, Carboidratos e Gorduras da prescrição ativa.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-blue-600 block mb-1">Proteínas (g)</label>
                <Input
                  type="number"
                  value={tempTargetProt}
                  onChange={(e) => setTempTargetProt(Number(e.target.value))}
                  className="bg-warm-inner border-warm-border text-xs font-black"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-amber-600 block mb-1">Carboidratos (g)</label>
                <Input
                  type="number"
                  value={tempTargetCarb}
                  onChange={(e) => setTempTargetCarb(Number(e.target.value))}
                  className="bg-warm-inner border-warm-border text-xs font-black"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-teal-600 block mb-1">Gorduras (g)</label>
                <Input
                  type="number"
                  value={tempTargetFat}
                  onChange={(e) => setTempTargetFat(Number(e.target.value))}
                  className="bg-warm-inner border-warm-border text-xs font-black"
                />
              </div>
            </div>

            <div className="p-3 bg-warm-inner border border-warm-border rounded-xl text-center">
              <span className="text-[10px] font-bold text-warm-muted uppercase block">Calorias Calculadas</span>
              <span className="text-lg font-black text-warm-charcoal">
                {calculatePresetCalories(tempTargetProt, tempTargetCarb, tempTargetFat)} kcal
              </span>
            </div>
          </div>

          <DialogFooter className="border-t border-warm-border pt-3">
            <Button variant="outline" size="sm" onClick={() => setIsAdjustGoalsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="emerald" onClick={handleSaveAdjustedGoals} size="sm" className="font-bold">
              Salvar Novas Metas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* WhatsApp Share Text Modal */}
      <Dialog open={isWhatsAppModalOpen} onOpenChange={setIsWhatsAppModalOpen}>
        <DialogContent className="sm:max-w-lg bg-warm-card border-warm-border p-6 rounded-2xl">
          <DialogHeader className="border-b border-warm-border pb-3">
            <DialogTitle className="font-black text-base text-warm-charcoal flex items-center space-x-2">
              <MessageCircle size={18} className="text-warm-emerald" />
              <span>Texto Formato para WhatsApp</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-warm-muted">
              Copie a prescrição formatada com emojis para enviar diretamente ao paciente.
            </DialogDescription>
          </DialogHeader>

          <div className="py-3">
            <textarea
              readOnly
              value={whatsAppText}
              rows={12}
              className="w-full p-3 font-mono text-xs bg-warm-inner border border-warm-border rounded-xl text-warm-charcoal focus:outline-none resize-none"
            />
          </div>

          <DialogFooter className="border-t border-warm-border pt-3">
            <Button variant="outline" size="sm" onClick={() => setIsWhatsAppModalOpen(false)}>
              Fechar
            </Button>
            <Button variant="emerald" onClick={handleCopyWhatsAppText} size="sm" className="font-bold flex items-center space-x-1.5">
              <Copy size={14} />
              <span>Copiar Texto</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
