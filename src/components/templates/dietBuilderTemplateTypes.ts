import {
  MacroTrackerHeaderProps,
  MealCardContainerProps,
} from '../organisms';
import {
  MacroMetricCardProps,
} from '../molecules';
import type { DietModeSwitcherProps } from '../organisms/diet/DietModeSwitcher';

export interface DietBuilderTemplateProps {
  patient?: {
    id?: string;
    name?: string;
    initials?: string;
    age?: number;
    heightCm?: number;
    weightKg?: number;
    gender?: string;
    objective?: string;
  };
  patientId?: string;
  patientName?: string;
  patientInitials?: string;
  patientObjective?: string;
  patientAge?: number;
  patientHeightCm?: number;
  patientGender?: string;
  dietaId?: string;
  mode?: 'simple' | 'carb_cycling';
  onModeChange?: (mode: 'simple' | 'carb_cycling') => void;
  dietModeProps?: DietModeSwitcherProps;
  macroTrackerData?: MacroTrackerHeaderProps;
  macroMetrics?: MacroMetricCardProps[];
  mealsData?: MealCardContainerProps[];
  meals?: any[];
  onAddMeal?: () => void;
  onRemoveMeal?: (index: number) => void;
  onUpdateMealHeader?: (index: number, title: string, time: string) => void;
  onAddFoodClick?: (index: number) => void;
  onUpdateItemGram?: (mealIndex: number, itemIndex: number, newGrams: number) => void;
  onRemoveItem?: (mealIndex: number, itemIndex: number) => void;
  onScaleDiet?: () => void;
  onOpenScaleModal?: () => void;
  scaleDisabled?: boolean;
  onOpenCopyModal?: () => void;
  onOpenAdjustGoalsModal?: () => void;
  onPullPreviousGoals?: () => void;
  onOpenImportPreviousDietModal?: () => void;
  hasPreviousDiets?: boolean;
  onOpenWhatsAppModal?: () => void;
  onWhatsAppShare?: () => void;
  onExportPDF?: () => void;
  onSaveDiet?: () => void;
  onDiscardDraft?: () => void | Promise<void>;
  canDiscardDraft?: boolean;
  saveStatus?: 'clean' | 'pending' | 'saving' | 'persisted' | 'error' | 'committing' | 'cleanup-pending';
  saveError?: string;
  onRetrySave?: () => void;
  onBackClick?: () => void;
  carbCyclingVariations?: any[];
  activeVariationId?: string;
  onSelectVariation?: (id: string) => void;
  onOpenFoodSearchForMeal?: (mealIndex: number) => void;
}
