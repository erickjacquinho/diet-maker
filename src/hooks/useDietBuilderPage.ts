import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPatientById, Patient } from '@/lib/patientsStore';
import {
  FullDietPlan,
  DietMeal,
  DietItem,
  CarbCyclingVariation,
  getDietFromStorage,
  saveDietToStorage,
  createInitialDietPlan,
  calculateMealTotals,
} from '@/lib/dietStore';
import { MacroMetricCardProps } from '@/components/molecules';
import { toast } from 'sonner';

export function useDietBuilderPage() {
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

  const currentTotals = useMemo(() => calculateMealTotals(currentMeals.flatMap(m => m.items)), [currentMeals]);

  const macroMetrics: MacroMetricCardProps[] = useMemo(() => {
    const weight = patient?.weightKg || 70;

    const kcalDiff = currentTotals.kcal - targetKcal;
    const kcalBadgeText = kcalDiff === 0 ? 'Na meta ✓' : kcalDiff > 0 ? `+${kcalDiff} kcal` : `${kcalDiff} kcal`;
    const kcalBadgeVariant = Math.abs(kcalDiff) <= targetKcal * 0.05 ? 'emerald' : kcalDiff > 0 ? 'rose' : 'amber';
    const kcalPct = targetKcal > 0 ? Math.min(100, Math.round((currentTotals.kcal / targetKcal) * 100)) : 0;

    const protDiff = Math.round((currentTotals.proteinG - targetProt) * 10) / 10;
    const protBadgeText = Math.abs(protDiff) <= 2 ? 'Na meta ✓' : protDiff > 0 ? `+${protDiff}g` : `${protDiff}g`;
    const protBadgeVariant = Math.abs(protDiff) <= targetProt * 0.05 ? 'emerald' : protDiff > 0 ? 'rose' : 'amber';
    const protPct = targetProt > 0 ? Math.min(100, Math.round((currentTotals.proteinG / targetProt) * 100)) : 0;
    const protGPerKg = (currentTotals.proteinG / weight).toFixed(2);
    const protMetaGPerKg = (targetProt / weight).toFixed(1);

    const carbDiff = Math.round((currentTotals.carbsG - targetCarb) * 10) / 10;
    const carbBadgeText = Math.abs(carbDiff) <= 2 ? 'Na meta ✓' : carbDiff > 0 ? `+${carbDiff}g` : `${carbDiff}g`;
    const carbBadgeVariant = Math.abs(carbDiff) <= targetCarb * 0.05 ? 'emerald' : carbDiff > 0 ? 'rose' : 'amber';
    const carbPct = targetCarb > 0 ? Math.min(100, Math.round((currentTotals.carbsG / targetCarb) * 100)) : 0;
    const carbGPerKg = (currentTotals.carbsG / weight).toFixed(2);
    const carbMetaGPerKg = (targetCarb / weight).toFixed(1);

    const fatsVal = currentTotals.fatsG;
    const fatDiff = Math.round((fatsVal - targetFat) * 10) / 10;
    const fatBadgeText = Math.abs(fatDiff) <= 2 ? 'Na meta ✓' : fatDiff > 0 ? `+${fatDiff}g` : `${fatDiff}g`;
    const fatBadgeVariant = Math.abs(fatDiff) <= targetFat * 0.05 ? 'emerald' : fatDiff > 0 ? 'rose' : 'amber';
    const fatPct = targetFat > 0 ? Math.min(100, Math.round((fatsVal / targetFat) * 100)) : 0;
    const fatGPerKg = (fatsVal / weight).toFixed(2);
    const fatMetaGPerKg = (targetFat / weight).toFixed(1);

    return [
      {
        label: 'Calorias',
        currentValue: `${currentTotals.kcal}`,
        targetValue: `${targetKcal} kcal`,
        statusBadgeText: kcalBadgeText,
        statusBadgeVariant: kcalBadgeVariant as any,
        percentage: kcalPct,
        macroColor: 'blue',
      },
      {
        label: 'Proteínas',
        currentValue: `${Math.round(currentTotals.proteinG)}g`,
        targetValue: `${targetProt}g`,
        statusBadgeText: protBadgeText,
        statusBadgeVariant: protBadgeVariant as any,
        percentage: protPct,
        gPerKgRatio: `${protGPerKg} g/kg`,
        gPerKgMeta: protMetaGPerKg,
        macroColor: 'emerald',
      },
      {
        label: 'Carboidratos',
        currentValue: `${Math.round(currentTotals.carbsG)}g`,
        targetValue: `${targetCarb}g`,
        statusBadgeText: carbBadgeText,
        statusBadgeVariant: carbBadgeVariant as any,
        percentage: carbPct,
        gPerKgRatio: `${carbGPerKg} g/kg`,
        gPerKgMeta: carbMetaGPerKg,
        macroColor: 'amber',
      },
      {
        label: 'Gorduras',
        currentValue: `${Math.round(fatsVal)}g`,
        targetValue: `${targetFat}g`,
        statusBadgeText: fatBadgeText,
        statusBadgeVariant: fatBadgeVariant as any,
        percentage: fatPct,
        gPerKgRatio: `${fatGPerKg} g/kg`,
        gPerKgMeta: fatMetaGPerKg,
        macroColor: 'rose',
      },
    ];
  }, [patient, currentTotals, targetKcal, targetProt, targetCarb, targetFat]);

  const updateActiveMeals = useCallback(
    (updater: (prevMeals: DietMeal[]) => DietMeal[]) => {
      setDietPlan((prev) => {
        if (!prev) return prev;
        if (prev.mode === 'simple') {
          return { ...prev, simpleMeals: updater(prev.simpleMeals || []) };
        } else {
          return {
            ...prev,
            carbCyclingVariations: prev.carbCyclingVariations.map((v) =>
              v.id === activeVariationId ? { ...v, meals: updater(v.meals) } : v
            ),
          };
        }
      });
    },
    [activeVariationId]
  );

  const handleModeChange = useCallback((newMode: 'simple' | 'carb_cycling') => {
    setDietPlan((prev) => (prev ? { ...prev, mode: newMode } : prev));
  }, []);

  const handleSaveDiet = useCallback(() => {
    if (!dietPlan) return;
    saveDietToStorage(dietPlan);
    toast.success('Plano alimentar salvo com sucesso!');
    router.push(`/pacientes/${patientId}`);
  }, [dietPlan, patientId, router]);

  const handleAddMeal = useCallback(() => {
    updateActiveMeals((prev) => [
      ...prev,
      {
        id: `meal-${Date.now()}`,
        name: `Refeição ${prev.length + 1}`,
        time: '12:00',
        items: [],
      },
    ]);
    toast.success('Nova refeição adicionada');
  }, [updateActiveMeals]);

  const handleRemoveMeal = useCallback(
    (mealId: string) => {
      updateActiveMeals((prev) => prev.filter((m) => m.id !== mealId));
      toast.info('Refeição removida');
    },
    [updateActiveMeals]
  );

  const handleUpdateMealHeader = useCallback(
    (mealId: string, updates: { name?: string; time?: string }) => {
      updateActiveMeals((prev) => prev.map((m) => (m.id === mealId ? { ...m, ...updates } : m)));
    },
    [updateActiveMeals]
  );

  const handleAddFoodToMeal = useCallback(
    (item: Omit<DietItem, 'id'>) => {
      if (foodSearchMealIndex === null) return;
      const newItem: DietItem = {
        ...item,
        id: `item-${Date.now()}`,
        quantityGrams: item.quantityGrams || item.grams || 100,
        protein: item.protein ?? item.proteinG ?? 0,
        carbs: item.carbs ?? item.carbsG ?? 0,
        fats: item.fats ?? item.fatsG ?? item.fatG ?? 0,
      };
      updateActiveMeals((prev) =>
        prev.map((meal, idx) => (idx === foodSearchMealIndex ? { ...meal, items: [...meal.items, newItem] } : meal))
      );
      toast.success(`${item.name} adicionado à refeição`);
    },
    [foodSearchMealIndex, updateActiveMeals]
  );

  const handleUpdateItemGram = useCallback(
    (mealId: string, itemId: string, newGrams: number) => {
      updateActiveMeals((prev) =>
        prev.map((meal) => {
          if (meal.id !== mealId) return meal;
          return {
            ...meal,
            items: meal.items.map((item) => {
              if (item.id !== itemId) return item;
              const currentGrams = item.quantityGrams || item.grams || 100;
              const ratio = newGrams > 0 ? newGrams / currentGrams : 1;
              const p = item.protein ?? item.proteinG ?? 0;
              const c = item.carbs ?? item.carbsG ?? 0;
              const f = item.fats ?? item.fatsG ?? item.fatG ?? 0;
              return {
                ...item,
                quantityGrams: newGrams,
                grams: newGrams,
                kcal: Math.round(item.kcal * ratio),
                protein: Math.round(p * ratio * 10) / 10,
                carbs: Math.round(c * ratio * 10) / 10,
                fats: Math.round(f * ratio * 10) / 10,
              };
            }),
          };
        })
      );
    },
    [updateActiveMeals]
  );

  const handleRemoveItem = useCallback(
    (mealId: string, itemId: string) => {
      updateActiveMeals((prev) =>
        prev.map((meal) => (meal.id === mealId ? { ...meal, items: meal.items.filter((i) => i.id !== itemId) } : meal))
      );
    },
    [updateActiveMeals]
  );

  const handleApplyScale = useCallback(
    (percent: number) => {
      const factor = 1 + percent / 100;
      updateActiveMeals((prev) =>
        prev.map((meal) => ({
          ...meal,
          items: meal.items.map((item) => {
            const currentGrams = item.quantityGrams || item.grams || 100;
            const p = item.protein ?? item.proteinG ?? 0;
            const c = item.carbs ?? item.carbsG ?? 0;
            const f = item.fats ?? item.fatsG ?? item.fatG ?? 0;
            return {
              ...item,
              quantityGrams: Math.round(currentGrams * factor),
              grams: Math.round(currentGrams * factor),
              kcal: Math.round(item.kcal * factor),
              protein: Math.round(p * factor * 10) / 10,
              carbs: Math.round(c * factor * 10) / 10,
              fats: Math.round(f * factor * 10) / 10,
            };
          }),
        }))
      );
      toast.success(`Dieta ajustada em ${percent > 0 ? '+' : ''}${percent}%`);
      setIsScaleModalOpen(false);
    },
    [updateActiveMeals]
  );

  const handleCopyVariation = useCallback(() => {
    if (!dietPlan || dietPlan.mode !== 'carb_cycling') return;
    const source = dietPlan.carbCyclingVariations.find((v) => v.id === copySourceId);
    if (!source) return;

    setDietPlan((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        carbCyclingVariations: prev.carbCyclingVariations.map((v) =>
          v.id === copyTargetId
            ? { ...v, meals: JSON.parse(JSON.stringify(source.meals)) }
            : v
        ),
      };
    });
    toast.success('Refeições copiadas com sucesso!');
    setIsCopyModalOpen(false);
  }, [dietPlan, copySourceId, copyTargetId]);

  const handleSaveAdjustedGoals = useCallback(() => {
    if (!dietPlan) return;
    setDietPlan((prev) => {
      if (!prev) return prev;
      const targetKcal = tempTargetProt * 4 + tempTargetCarb * 4 + tempTargetFat * 9;
      if (prev.mode === 'simple') {
        return {
          ...prev,
          simpleTargetKcal: targetKcal,
          simpleTargetProtein: tempTargetProt,
          simpleTargetCarbs: tempTargetCarb,
          simpleTargetFats: tempTargetFat,
        };
      } else {
        return {
          ...prev,
          carbCyclingVariations: prev.carbCyclingVariations.map((v) =>
            v.id === activeVariationId
              ? {
                  ...v,
                  targetKcal,
                  targetProtein: tempTargetProt,
                  targetCarbs: tempTargetCarb,
                  targetFats: tempTargetFat,
                }
              : v
          ),
        };
      }
    });
    toast.success('Metas de macronutrientes atualizadas!');
    setIsAdjustGoalsModalOpen(false);
  }, [dietPlan, tempTargetProt, tempTargetCarb, tempTargetFat, activeVariationId]);

  const openAdjustGoalsModal = useCallback(() => {
    setTempTargetProt(targetProt);
    setTempTargetCarb(targetCarb);
    setTempTargetFat(targetFat);
    setIsAdjustGoalsModalOpen(true);
  }, [targetProt, targetCarb, targetFat]);

  const openWhatsAppModal = useCallback(() => {
    if (!patient || !dietPlan) return;
    let msg = `*Plano Alimentar - ${patient.name}*\n\n`;
    currentMeals.forEach((m) => {
      msg += `*${m.name} (${m.time})*\n`;
      m.items.forEach((i) => {
        const g = i.quantityGrams || i.grams || 100;
        msg += `• ${i.name} (${g}g) - ${i.kcal} kcal\n`;
      });
      msg += '\n';
    });
    msg += `*Total:* ${currentTotals.kcal} kcal | P: ${Math.round(currentTotals.proteinG)}g | C: ${Math.round(currentTotals.carbsG)}g | G: ${Math.round(currentTotals.fatsG)}g\n`;
    setWhatsAppText(msg);
    setIsWhatsAppModalOpen(true);
  }, [patient, dietPlan, currentMeals, currentTotals]);

  return {
    patientId,
    dietaId,
    patient,
    dietPlan,
    activeVariationId,
    setActiveVariationId,
    foodSearchMealIndex,
    setFoodSearchMealIndex,
    isScaleModalOpen,
    setIsScaleModalOpen,
    scalePercentage,
    setScalePercentage,
    isCopyModalOpen,
    setIsCopyModalOpen,
    copySourceId,
    setCopySourceId,
    copyTargetId,
    setCopyTargetId,
    isAdjustGoalsModalOpen,
    setIsAdjustGoalsModalOpen,
    tempTargetProt,
    setTempTargetProt,
    tempTargetCarb,
    setTempTargetCarb,
    tempTargetFat,
    setTempTargetFat,
    isWhatsAppModalOpen,
    setIsWhatsAppModalOpen,
    whatsAppText,
    setWhatsAppText,
    currentMeals,
    targetKcal,
    targetProt,
    targetCarb,
    targetFat,
    currentTotals,
    macroMetrics,
    handleModeChange,
    handleSaveDiet,
    handleAddMeal,
    handleRemoveMeal,
    handleUpdateMealHeader,
    handleAddFoodToMeal,
    handleUpdateItemGram,
    handleRemoveItem,
    handleApplyScale,
    handleCopyVariation,
    handleSaveAdjustedGoals,
    openAdjustGoalsModal,
    openWhatsAppModal,
    router,
  };
}
