'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  Palette,
  Type,
  Layers,
  Component,
  Boxes,
  Sliders,
  Table as TableIcon,
  Code,
  Copy,
  Check,
  Plus,
  Trash2,
  Settings,
  Sparkles,
  ShieldCheck,
  Zap,
  Activity,
  FileSpreadsheet,
  Download,
  Search,
  ChevronRight,
  Utensils,
  BookOpen,
  Users,
  UtensilsCrossed,
  Info,
  SlidersHorizontal,
  LayoutTemplate,
  CheckCircle2,
  HelpCircle,
  FileText,
  Lock,
  Eye,
  SlidersVertical,
  Pencil,
  Loader2,
  ArrowRight,
} from 'lucide-react';

// Design System Tokens (100% Single Source of Truth)
import {
  primitiveTokens,
  semanticTokens,
  componentTokens,
  designTokens,
} from '@/design-system/tokens';
import { resolvePresetForPatient } from '@/lib/presetUtils';

// Atoms
import {
  Avatar,
  Badge,
  Button,
  IconButton,
  EditIconButton,
  DeleteIconButton,
  CreateButton,
  SecondaryActionButton,
  Input,
  ProgressBar,
} from '@/components/atoms';

// Molecules
import {
  MacroMetricCard,
  MealItemRow,
  PatientBadgeHeader,
  TacoSearchInput,
  SidebarBrand,
  SidebarNavItem,
  SidebarUserProfile,
  SidebarQuickActions,
  ReadOnlyDietModal,
} from '@/components/molecules';

// Organisms
import {
  MacroTrackerHeader,
  MealCardContainer,
  SidebarNav,
} from '@/components/organisms';

// Templates
import {
  DietBuilderTemplate,
} from '@/components/templates';

// UI Components (Shadcn)
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export default function DesignSystemPage() {
  // State for interactive features
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [btnClickCount, setBtnClickCount] = useState(0);
  const [progressValue, setProgressValue] = useState(78);
  const [progressColor, setProgressColor] = useState<'emerald' | 'rose' | 'amber' | 'teal' | 'blue'>('emerald');
  const [isReadOnlyModalOpen, setIsReadOnlyModalOpen] = useState(false);
  const [sidebarCollapsedDemo, setSidebarCollapsedDemo] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  // Multiplicative Preset Calculation Demo State
  const [demoPatientWeight, setDemoPatientWeight] = useState(80);
  const [demoPreset] = useState({
    title: 'Protocolo Bulking Limpo',
    proteinMode: 'multiplicativo' as const,
    proteinValue: 2.2,
    carbsMode: 'multiplicativo' as const,
    carbsValue: 3.5,
    fatsMode: 'multiplicativo' as const,
    fatsValue: 0.9,
  });

  const resolvedDemoNutrients = resolvePresetForPatient(demoPreset, demoPatientWeight);

  // Backdrop confirmation demo state
  const [isDemoPresetFormOpen, setIsDemoPresetFormOpen] = useState(false);
  const [isDemoConfirmDiscardOpen, setIsDemoConfirmDiscardOpen] = useState(false);
  const [demoFormTitle, setDemoFormTitle] = useState('');


  // Interactive Meal State
  const [mealItems, setMealItems] = useState([
    { id: '1', name: 'Peito de Frango Grelhado', kcal: 165, protein: 31, carbs: 0, fats: 3.6, quantityGrams: 100 },
    { id: '2', name: 'Arroz Integral Cozido', kcal: 124, protein: 2.6, carbs: 25.8, fats: 1.0, quantityGrams: 150 },
    { id: '3', name: 'Azeite de Oliva Extra Virgem', kcal: 88, protein: 0, carbs: 0, fats: 10, quantityGrams: 10 },
  ]);

  // Interactive Target Goals State for Dialog
  const [patientMetrics, setPatientMetrics] = useState({
    name: 'Gabriel Siqueira',
    weight: 82.5,
    goal: 'Hipertrofia Limpa • 2.400 kcal/dia',
    kcalCurrent: '2.450',
    kcalTarget: '2.400 kcal',
    proteinCurrent: '168g',
    proteinTarget: '165g',
    carbsCurrent: '260g',
    carbsTarget: '270g',
    fatsCurrent: '62g',
    fatsTarget: '65g',
  });

  const [editKcal, setEditKcal] = useState('2400');
  const [editProtein, setEditProtein] = useState('165');
  const [editCarbs, setEditCarbs] = useState('270');
  const [editFats, setEditFats] = useState('65');

  // Sample Historical Diet for ReadOnlyDietModal Demo
  const sampleHistoricalDiet = {
    id: 'hist-1',
    name: 'Plano Fase 1: Cutting Intermediário',
    date: '15/05/2026',
    status: 'Histórica' as const,
    targetKcal: 2200,
    proteinG: 180,
    carbsG: 200,
    fatsG: 60,
  };

  // Sample TACO Data
  const tacoFoods = [
    { code: '001', name: 'Arroz, integral, cozido', category: 'Cereais', kcal: 124, protein: 2.6, carbs: 25.8, lipids: 1.0 },
    { code: '002', name: 'Frango, peito, sem pele, grelhado', category: 'Carnes', kcal: 165, protein: 31.0, carbs: 0.0, lipids: 3.6 },
    { code: '003', name: 'Ovo, de galinha, inteira, cozida', category: 'Ovos', kcal: 146, protein: 13.3, carbs: 0.6, lipids: 9.5 },
    { code: '004', name: 'Batata, doce, cozida', category: 'Tubérculos', kcal: 77, protein: 0.6, carbs: 18.4, lipids: 0.1 },
    { code: '005', name: 'Banana, prata, crua', category: 'Frutas', kcal: 98, protein: 1.3, carbs: 26.0, lipids: 0.1 },
    { code: '006', name: 'Feijão, carioca, cozido', category: 'Leguminosas', kcal: 76, protein: 4.8, carbs: 13.6, lipids: 0.5 },
  ];

  const [tacoSearch, setTacoSearch] = useState('');
  const filteredTaco = tacoFoods.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(tacoSearch.toLowerCase()) || f.category.toLowerCase().includes(tacoSearch.toLowerCase());
    const matchesCategory = selectedCategory === 'todos' || f.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Calculate totals for meal card demo
  const totalMealKcal = mealItems.reduce((acc, curr) => acc + curr.kcal, 0);
  const totalMealProtein = mealItems.reduce((acc, curr) => acc + curr.protein, 0);
  const totalMealCarbs = mealItems.reduce((acc, curr) => acc + curr.carbs, 0);
  const totalMealFats = mealItems.reduce((acc, curr) => acc + curr.fats, 0);

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    toast.success(`Copiado ${label}: ${text}`, {
      description: 'Valor de token copiado para a área de transferência.',
    });
    setTimeout(() => setCopiedToken(null), 2000);
  };

  // Update target goals
  const handleSaveGoals = () => {
    setPatientMetrics((prev) => ({
      ...prev,
      kcalTarget: `${editKcal} kcal`,
      proteinTarget: `${editProtein}g`,
      carbsTarget: `${editCarbs}g`,
      fatsTarget: `${editFats}g`,
      goal: `Hipertrofia Limpa • ${editKcal} kcal/dia`,
    }));
    toast.success('Metas nutricionais atualizadas com sucesso!', {
      description: 'Valores refletidos em tempo real nos componentes e cards.',
    });
  };

  const handleRemoveMealItem = (index: number) => {
    const item = mealItems[index];
    setMealItems((prev) => prev.filter((_, i) => i !== index));
    toast.info(`Alimento removido: ${item.name}`);
  };

  const handleAddSampleItem = () => {
    const newItem = {
      id: Date.now().toString(),
      name: 'Ovo de Galinha Cozido',
      kcal: 78,
      protein: 6.3,
      carbs: 0.6,
      fats: 5.3,
      quantityGrams: 50,
    };
    setMealItems((prev) => [...prev, newItem]);
    toast.success('Ovo Cozido (50g) adicionado à refeição!');
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="p-6 md:p-10 space-y-10 max-w-[1400px] mx-auto pb-24">
        {/* 1. Header / Hero Section */}
        <div className="bg-warm-card border border-warm-border rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-warm-border pb-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="p-2 bg-warm-emeraldBg text-warm-emerald rounded-xl border border-warm-emerald/20">
                  <Palette size={22} />
                </span>
                <Badge variant="emerald" className="text-xs uppercase tracking-wider font-extrabold">
                  Design System v1.0.0
                </Badge>
                <Badge variant="neutral" className="text-xs font-mono">
                  100% Real Tokens & Componentes Atômicos
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-warm-charcoal tracking-tight">
                NutriDiet Brand & Design System Guide
              </h1>
              <p className="text-sm text-warm-secondary max-w-3xl leading-relaxed">
                Guia vivo da identidade visual do NutriDiet Local Pro. Todos os tokens são importados de 
                <code className="bg-warm-inner px-1 rounded border border-warm-border text-warm-charcoal font-mono ml-1 mr-1">
                  @/design-system/tokens
                </code>
                e consumidos diretamente por 100% dos átomos, moléculas, organismos, templates e componentes UI do projeto.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info('NutriDiet DS v1.0.0 — Arquitetura de Tokens em 3 Camadas')}
              >
                <ShieldCheck size={14} className="mr-1.5 text-warm-emerald" />
                WCAG AAA Compliant
              </Button>
              <Button
                variant="terracotta"
                size="sm"
                onClick={() => handleCopy('bg-warm-bg text-warm-charcoal border-warm-border', 'Classes Base')}
              >
                <Copy size={14} className="mr-1.5" />
                Copiar Classes Base
              </Button>
            </div>
          </div>

          {/* Quick Spec Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="bg-warm-inner border border-warm-border rounded-xl p-3.5 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-warm-muted">Base Surface</div>
              <div className="text-lg font-black text-warm-charcoal">{primitiveTokens.colors.stone[100]}</div>
              <div className="text-[11px] text-warm-secondary font-mono">primitiveTokens.stone[100]</div>
            </div>
            <div className="bg-warm-inner border border-warm-border rounded-xl p-3.5 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-warm-muted">Display Font</div>
              <div className="text-lg font-black text-warm-charcoal">Plus Jakarta</div>
              <div className="text-[11px] text-warm-secondary font-mono">{primitiveTokens.typography.fonts.display}</div>
            </div>
            <div className="bg-warm-inner border border-warm-border rounded-xl p-3.5 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-warm-muted">Body Font</div>
              <div className="text-lg font-black text-warm-charcoal">Inter</div>
              <div className="text-[11px] text-warm-secondary font-mono">{primitiveTokens.typography.fonts.body}</div>
            </div>
            <div className="bg-warm-inner border border-warm-border rounded-xl p-3.5 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-warm-muted">Flat Geometry</div>
              <div className="text-lg font-black text-warm-charcoal">1px Solid Clean</div>
              <div className="text-[11px] text-warm-secondary font-mono">Zero Box-Shadow & Gradient</div>
            </div>
          </div>
        </div>

        {/* 2. Interactive Section Tabs */}
        <Tabs defaultValue="overview" className="w-full space-y-8">
          <TabsList className="bg-warm-card border border-warm-border p-1.5 rounded-xl flex flex-wrap gap-1 h-auto w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview" className="data-[state=active]:bg-warm-inner data-[state=active]:text-warm-charcoal text-xs font-bold px-3 py-2 rounded-lg">
              <Layers size={14} className="mr-1.5" /> Visão Geral
            </TabsTrigger>
            <TabsTrigger value="tokens" className="data-[state=active]:bg-warm-inner data-[state=active]:text-warm-charcoal text-xs font-bold px-3 py-2 rounded-lg">
              <Palette size={14} className="mr-1.5" /> Cores & Tokens Reais
            </TabsTrigger>
            <TabsTrigger value="typography" className="data-[state=active]:bg-warm-inner data-[state=active]:text-warm-charcoal text-xs font-bold px-3 py-2 rounded-lg">
              <Type size={14} className="mr-1.5" /> Tipografia & Espaçamento
            </TabsTrigger>
            <TabsTrigger value="atoms" className="data-[state=active]:bg-warm-inner data-[state=active]:text-warm-charcoal text-xs font-bold px-3 py-2 rounded-lg">
              <Component size={14} className="mr-1.5" /> Átomos & UI Base
            </TabsTrigger>
            <TabsTrigger value="molecules" className="data-[state=active]:bg-warm-inner data-[state=active]:text-warm-charcoal text-xs font-bold px-3 py-2 rounded-lg">
              <Boxes size={14} className="mr-1.5" /> Moléculas Clínicas
            </TabsTrigger>
            <TabsTrigger value="organisms" className="data-[state=active]:bg-warm-inner data-[state=active]:text-warm-charcoal text-xs font-bold px-3 py-2 rounded-lg">
              <Sliders size={14} className="mr-1.5" /> Organismos
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-warm-inner data-[state=active]:text-warm-charcoal text-xs font-bold px-3 py-2 rounded-lg">
              <LayoutTemplate size={14} className="mr-1.5" /> Templates de Tela
            </TabsTrigger>
            <TabsTrigger value="dialogs" className="data-[state=active]:bg-warm-inner data-[state=active]:text-warm-charcoal text-xs font-bold px-3 py-2 rounded-lg">
              <Sparkles size={14} className="mr-1.5" /> Modais & Overlays (Shadcn)
            </TabsTrigger>
            <TabsTrigger value="tables" className="data-[state=active]:bg-warm-inner data-[state=active]:text-warm-charcoal text-xs font-bold px-3 py-2 rounded-lg">
              <TableIcon size={14} className="mr-1.5" /> Tabela de Alimentos
            </TabsTrigger>
            <TabsTrigger value="code" className="data-[state=active]:bg-warm-inner data-[state=active]:text-warm-charcoal text-xs font-bold px-3 py-2 rounded-lg">
              <Code size={14} className="mr-1.5" /> Guia de Código
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: VISÃO GERAL */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-warm-card border-warm-border rounded-2xl">
                <CardHeader>
                  <div className="flex items-center space-x-2 text-warm-emerald">
                    <ShieldCheck size={20} />
                    <CardTitle className="text-lg font-black">1. Swiss Minimalist Flat</CardTitle>
                  </div>
                  <CardDescription className="text-xs">Identidade estética limpa, direta e cirúrgica</CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-warm-secondary space-y-2">
                  <p>
                    Eliminamos gradientes e sombras difusas para manter a máxima legibilidade de dados nutricionais.
                    O contorno limpo de 1px (<code className="bg-warm-inner px-1 rounded border border-warm-border">border-warm-border</code>) 
                    delimita módulos com precisão suíça.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-warm-card border-warm-border rounded-2xl">
                <CardHeader>
                  <div className="flex items-center space-x-2 text-warm-terracotta">
                    <Zap size={20} />
                    <CardTitle className="text-lg font-black">2. Tokens Semânticos em 3 Camadas</CardTitle>
                  </div>
                  <CardDescription className="text-xs">Primitivo ➔ Semântico ➔ Componente</CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-warm-secondary space-y-2">
                  <p>
                    Nenhum código Hex é inserido arbitrariamente nos componentes. Todas as superfícies utilizam
                    tokens consolidados (<code className="bg-warm-inner px-1 rounded border border-warm-border">bg-warm-bg</code>, 
                    <code className="bg-warm-inner px-1 rounded border border-warm-border">bg-warm-card</code>, 
                    <code className="bg-warm-inner px-1 rounded border border-warm-border">bg-warm-inner</code>).
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-warm-card border-warm-border rounded-2xl">
                <CardHeader>
                  <div className="flex items-center space-x-2 text-blue-600">
                    <Activity size={20} />
                    <CardTitle className="text-lg font-black">3. Código de Macronutrientes</CardTitle>
                  </div>
                  <CardDescription className="text-xs">Cores estritas para identificação nutricional</CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-warm-secondary space-y-2">
                  <p>
                    <strong>Kcal</strong> em Emerald ({primitiveTokens.colors.emerald[600]}), <strong>Proteína</strong> em Blue ({primitiveTokens.colors.blue[600]}), 
                    <strong>Carboidratos</strong> em Amber ({primitiveTokens.colors.amber[600]}) e <strong>Gorduras</strong> em Teal ({primitiveTokens.colors.teal[600]}).
                    A consistência cromática acelera a leitura clínica.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Interactive Live Demo Preview */}
            <Card className="bg-warm-card border-warm-border rounded-2xl">
              <CardHeader className="border-b border-warm-border">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black">Demonstração ao Vivo dos Organismos Reais</CardTitle>
                    <CardDescription className="text-xs">
                      Organismo <strong>MacroTrackerHeader</strong> consumindo tokens reais em tempo real.
                    </CardDescription>
                  </div>
                  <Badge variant="emerald">100% Real & Interativo</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <MacroTrackerHeader
                  patientInitials="GS"
                  patientName={patientMetrics.name}
                  patientWeightKg={patientMetrics.weight}
                  patientGoalDescription={patientMetrics.goal}
                  onAdjustGoals={() => toast.info('Edite as metas no modal da aba Modais & Overlays!')}
                  metrics={[
                    {
                      label: 'CALORIAS TOTAIS',
                      currentValue: patientMetrics.kcalCurrent,
                      targetValue: patientMetrics.kcalTarget,
                      statusBadgeText: 'DENTRO DA META',
                      statusBadgeVariant: 'emerald',
                      percentage: 102,
                      macroColor: 'emerald',
                    },
                    {
                      label: 'PROTEÍNAS (AZUL)',
                      currentValue: patientMetrics.proteinCurrent,
                      targetValue: patientMetrics.proteinTarget,
                      statusBadgeText: '+3g ACIMA',
                      statusBadgeVariant: 'blue',
                      percentage: 101,
                      gPerKgRatio: '2.03 g/kg',
                      gPerKgMeta: '2.0',
                      macroColor: 'blue',
                    },
                    {
                      label: 'CARBOIDRATOS (ÂMBAR)',
                      currentValue: patientMetrics.carbsCurrent,
                      targetValue: patientMetrics.carbsTarget,
                      statusBadgeText: '96% CONCLUÍDO',
                      statusBadgeVariant: 'amber',
                      percentage: 96,
                      gPerKgRatio: '3.15 g/kg',
                      gPerKgMeta: '3.3',
                      macroColor: 'amber',
                    },
                    {
                      label: 'GORDURAS (TEAL)',
                      currentValue: patientMetrics.fatsCurrent,
                      targetValue: patientMetrics.fatsTarget,
                      statusBadgeText: 'ADEQUADO',
                      statusBadgeVariant: 'teal',
                      percentage: 95,
                      gPerKgRatio: '0.75 g/kg',
                      gPerKgMeta: '0.8',
                      macroColor: 'teal',
                    },
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: CORES & TOKENS REAIS */}
          <TabsContent value="tokens" className="space-y-8">
            <Card className="bg-warm-card border-warm-border rounded-2xl">
              <CardHeader className="border-b border-warm-border">
                <CardTitle className="text-xl font-black">Navegador Dinâmico de Tokens de Código</CardTitle>
                <CardDescription className="text-xs">
                  Estes cartões são gerados iterando diretamente sobre o objeto <code className="font-mono text-warm-charcoal font-bold">primitiveTokens</code> e <code className="font-mono text-warm-charcoal font-bold">semanticTokens</code> importados do TypeScript.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                {/* 1. Primitive Colors Scale */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-warm-charcoal uppercase tracking-wider flex items-center justify-between">
                    <span>1. Escala de Cores Primitivas (primitiveTokens.colors)</span>
                    <Badge variant="neutral">Objeto TS Real</Badge>
                  </h3>

                  {Object.entries(primitiveTokens.colors).map(([colorFamily, val]) => {
                    if (typeof val === 'string') {
                      return (
                        <div key={colorFamily} className="flex items-center gap-3 bg-warm-inner border border-warm-border p-3 rounded-xl">
                          <div className="w-8 h-8 rounded-lg border border-warm-border shrink-0" style={{ backgroundColor: val }} />
                          <div>
                            <div className="text-xs font-bold text-warm-charcoal capitalize">{colorFamily}</div>
                            <div className="text-[10px] font-mono text-warm-muted">{val}</div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={colorFamily} className="space-y-2">
                        <div className="text-xs font-extrabold text-warm-charcoal capitalize tracking-wide flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-warm-emerald" />
                          <span>Família: {colorFamily}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                          {Object.entries(val)
                            .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
                            .map(([shade, hex]) => (
                            <button
                              key={shade}
                              onClick={() => handleCopy(`primitiveTokens.colors.${colorFamily}[${shade}]`, `${colorFamily}-${shade}`)}
                              className="group text-left border border-warm-border rounded-xl p-3 bg-warm-inner hover:border-warm-borderDark transition-all duration-200"
                            >
                              <div
                                className="h-10 w-full rounded-lg border border-warm-border mb-2 flex items-center justify-center font-mono text-[10px] font-bold"
                                style={{
                                  backgroundColor: hex,
                                  color: shade === '50' || shade === '100' || shade === '200' ? '#111827' : '#ffffff',
                                }}
                              >
                                {copiedToken === `primitiveTokens.colors.${colorFamily}[${shade}]` ? <Check size={14} /> : shade}
                              </div>
                              <div className="text-[11px] font-bold text-warm-charcoal">{colorFamily} {shade}</div>
                              <div className="text-[10px] font-mono text-warm-muted">{hex}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator className="bg-warm-border" />

                {/* 2. Semantic Tokens */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-warm-charcoal uppercase tracking-wider flex items-center justify-between">
                    <span>2. Tokens Semânticos de Superfície & Texto (semanticTokens)</span>
                    <Badge variant="emerald">Camada 2 - Semântica</Badge>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="border border-warm-border rounded-xl p-4 bg-warm-inner space-y-2">
                      <div className="text-xs font-bold text-warm-charcoal uppercase">Superfícies (Surfaces)</div>
                      <div className="text-xs font-mono text-warm-secondary space-y-1">
                        <div>app: <strong className="text-warm-charcoal">{semanticTokens.surfaces.app}</strong></div>
                        <div>card: <strong className="text-warm-charcoal">{semanticTokens.surfaces.card}</strong></div>
                        <div>inner: <strong className="text-warm-charcoal">{semanticTokens.surfaces.inner}</strong></div>
                      </div>
                    </div>

                    <div className="border border-warm-border rounded-xl p-4 bg-warm-inner space-y-2">
                      <div className="text-xs font-bold text-warm-charcoal uppercase">Textos (Text)</div>
                      <div className="text-xs font-mono text-warm-secondary space-y-1">
                        <div>primary: <strong className="text-warm-charcoal">{semanticTokens.text.primary}</strong></div>
                        <div>secondary: <strong className="text-warm-charcoal">{semanticTokens.text.secondary}</strong></div>
                        <div>muted: <strong className="text-warm-charcoal">{semanticTokens.text.muted}</strong></div>
                      </div>
                    </div>

                    <div className="border border-warm-border rounded-xl p-4 bg-warm-inner space-y-2">
                      <div className="text-xs font-bold text-warm-charcoal uppercase">Bordas (Borders)</div>
                      <div className="text-xs font-mono text-warm-secondary space-y-1">
                        <div>clean: <strong className="text-warm-charcoal">{semanticTokens.borders.clean}</strong></div>
                        <div>focus: <strong className="text-warm-charcoal">{semanticTokens.borders.focus}</strong></div>
                        <div>emerald: <strong className="text-warm-charcoal">{semanticTokens.borders.emerald}</strong></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: TIPOGRAFIA & ESPAÇAMENTO */}
          <TabsContent value="typography" className="space-y-8">
            <Card className="bg-warm-card border-warm-border rounded-2xl">
              <CardHeader className="border-b border-warm-border">
                <CardTitle className="text-xl font-black">Tokens de Tipografia, Spacing & Geometria</CardTitle>
                <CardDescription className="text-xs">
                  Valores reais extraídos de <code className="font-mono text-warm-charcoal font-bold">primitiveTokens.typography</code> e <code className="font-mono text-warm-charcoal font-bold">primitiveTokens.spacing</code>.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                {/* Font Families */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-warm-charcoal uppercase tracking-wider">Famílias Tipográficas</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="border border-warm-border p-4 rounded-xl bg-warm-inner space-y-1">
                      <div className="text-xs font-bold text-warm-muted uppercase">Display Font (Títulos & Números)</div>
                      <div className="text-base font-black text-warm-charcoal" style={{ fontFamily: primitiveTokens.typography.fonts.display }}>
                        Plus Jakarta Sans
                      </div>
                      <div className="text-[11px] font-mono text-warm-secondary">{primitiveTokens.typography.fonts.display}</div>
                    </div>
                    <div className="border border-warm-border p-4 rounded-xl bg-warm-inner space-y-1">
                      <div className="text-xs font-bold text-warm-muted uppercase">Body Font (Corpo & Form)</div>
                      <div className="text-base font-medium text-warm-charcoal" style={{ fontFamily: primitiveTokens.typography.fonts.body }}>
                        Inter Font
                      </div>
                      <div className="text-[11px] font-mono text-warm-secondary">{primitiveTokens.typography.fonts.body}</div>
                    </div>
                    <div className="border border-warm-border p-4 rounded-xl bg-warm-inner space-y-1">
                      <div className="text-xs font-bold text-warm-muted uppercase">Monospace (Tags & Código)</div>
                      <div className="text-base font-mono font-bold text-warm-charcoal" style={{ fontFamily: primitiveTokens.typography.fonts.mono }}>
                        Monospace Scale
                      </div>
                      <div className="text-[11px] font-mono text-warm-secondary">{primitiveTokens.typography.fonts.mono}</div>
                    </div>
                  </div>
                </div>

                {/* Font Sizes Scale */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-warm-charcoal uppercase tracking-wider">Escala Tipográfica de Tamanhos (sizes - Crescente)</h3>
                  <div className="space-y-3">
                    {Object.entries(primitiveTokens.typography.sizes)
                      .sort((a, b) => parseFloat(a[1]) - parseFloat(b[1]))
                      .map(([key, sizeVal]) => (
                        <div key={key} className="border border-warm-border rounded-xl p-4 bg-warm-inner flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="w-48 shrink-0">
                            <div className="text-xs font-bold text-warm-charcoal capitalize">{key}</div>
                            <div className="text-[11px] font-mono text-warm-muted">primitiveTokens.typography.sizes.{key} = {sizeVal}</div>
                          </div>
                          <div className="text-warm-charcoal font-black truncate" style={{ fontSize: sizeVal }}>
                            NutriDiet Local Pro • {sizeVal}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Spacing & Radii */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-warm-charcoal uppercase tracking-wider">Escala de Arredondamento (radii - Crescente)</h3>
                    <div className="bg-warm-inner border border-warm-border p-4 rounded-xl space-y-2">
                      {Object.entries(primitiveTokens.radii)
                        .sort((a, b) => parseFloat(a[1]) - parseFloat(b[1]))
                        .map(([rKey, rVal]) => (
                          <div key={rKey} className="flex items-center justify-between text-xs py-1 border-b border-warm-border/50 last:border-none">
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-6 h-6 bg-warm-emerald/20 border border-warm-emerald flex items-center justify-center font-bold text-[9px] text-warm-emerald shrink-0"
                                style={{ borderRadius: rVal }}
                              />
                              <span className="font-bold text-warm-charcoal capitalize">{rKey}</span>
                            </div>
                            <span className="font-mono text-warm-secondary font-bold">{rVal}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-warm-charcoal uppercase tracking-wider">Escala de Espaçamento (spacing - Crescente)</h3>
                    <div className="bg-warm-inner border border-warm-border p-4 rounded-xl space-y-2 max-h-[300px] overflow-y-auto">
                      {Object.entries(primitiveTokens.spacing)
                        .sort((a, b) => parseFloat(a[1]) - parseFloat(b[1]))
                        .map(([sKey, sVal]) => (
                          <div key={sKey} className="flex items-center justify-between text-xs py-1 border-b border-warm-border/50 last:border-none">
                            <div className="flex items-center space-x-2">
                              <div
                                className="h-3 bg-warm-terracotta/40 border border-warm-terracotta rounded"
                                style={{ width: typeof sVal === 'string' && sVal.endsWith('px') ? Math.min(parseInt(sVal) || 8, 80) : 24 }}
                              />
                              <span className="font-bold text-warm-charcoal font-mono">space-{sKey}</span>
                            </div>
                            <span className="font-mono text-warm-secondary font-bold">{sVal}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-warm-charcoal uppercase tracking-wider">Transições & Z-Index</h3>
                    <div className="bg-warm-inner border border-warm-border p-4 rounded-xl space-y-3">
                      <div>
                        <div className="text-xs font-bold text-warm-charcoal uppercase mb-1">Transições Suaves:</div>
                        <div className="text-[11px] font-mono text-warm-secondary space-y-1">
                          <div>fast: <span className="font-bold text-warm-charcoal">{primitiveTokens.transitions.fast}</span></div>
                          <div>normal: <span className="font-bold text-warm-charcoal">{primitiveTokens.transitions.normal}</span></div>
                          <div>slow: <span className="font-bold text-warm-charcoal">{primitiveTokens.transitions.slow}</span></div>
                        </div>
                      </div>
                      <div className="border-t border-warm-border pt-2">
                        <div className="text-xs font-bold text-warm-charcoal uppercase mb-1">Camadas Z-Index:</div>
                        <div className="text-[11px] font-mono text-warm-secondary grid grid-cols-2 gap-1">
                          <div>card: <strong className="text-warm-charcoal">1</strong></div>
                          <div>sidebar: <strong className="text-warm-charcoal">10</strong></div>
                          <div>dropdown: <strong className="text-warm-charcoal">20</strong></div>
                          <div>backdrop: <strong className="text-warm-charcoal">40</strong></div>
                          <div>modal: <strong className="text-warm-charcoal">50</strong></div>
                          <div>toast: <strong className="text-warm-charcoal">60</strong></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: ÁTOMOS & UI BASE */}
          <TabsContent value="atoms" className="space-y-8">
            <Card className="bg-warm-card border-warm-border rounded-2xl">
              <CardHeader className="border-b border-warm-border">
                <CardTitle className="text-xl font-black">Átomos & Botões Interativos (Atoms)</CardTitle>
                <CardDescription className="text-xs">
                  Componentes atômicos puros importados diretamente de <code className="font-mono text-warm-charcoal font-bold">@/components/atoms</code>.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                {/* Buttons Showcase */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-warm-charcoal uppercase tracking-wider">1. Variantes Principais de Botões (Button Component)</h3>
                    <Badge variant="emerald">Cliques: {btnClickCount}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 bg-warm-inner border border-warm-border p-4 rounded-xl">
                    <Button
                      variant="primary"
                      onClick={() => { setBtnClickCount(c => c + 1); toast.success('Botão Primary Clicado!'); }}
                    >
                      Primary (Default)
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => { setBtnClickCount(c => c + 1); toast.info('Botão Secondary Clicado!'); }}
                    >
                      Secondary
                    </Button>
                    <Button
                      variant="emerald"
                      onClick={() => { setBtnClickCount(c => c + 1); toast.success('Botão Emerald Clicado!'); }}
                    >
                      Emerald Accent
                    </Button>
                    <Button
                      variant="terracotta"
                      onClick={() => { setBtnClickCount(c => c + 1); toast.warning('Botão Terracotta Clicado!'); }}
                    >
                      Terracotta Accent
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => { setBtnClickCount(c => c + 1); toast.info('Botão Ghost Clicado!'); }}
                    >
                      Ghost
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => { setBtnClickCount(c => c + 1); toast.error('Botão Danger Clicado!'); }}
                    >
                      Danger / Destructive
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => { setBtnClickCount(c => c + 1); toast.info('Botão Outline Clicado!'); }}
                    >
                      Outline
                    </Button>
                    <Button
                      variant="link"
                      onClick={() => { setBtnClickCount(c => c + 1); toast.info('Botão Link Clicado!'); }}
                    >
                      Link Style
                    </Button>
                  </div>
                </div>

                {/* Standardized Action Buttons */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-warm-charcoal uppercase tracking-wider">2. Botões de Ação Padronizados (Specialized Action Buttons)</h3>
                  <div className="flex flex-wrap items-center gap-3 bg-warm-inner border border-warm-border p-4 rounded-xl">
                    <CreateButton onClick={() => { setBtnClickCount(c => c + 1); toast.success('CreateButton Clicado!'); }}>
                      Nova Dieta
                    </CreateButton>
                    <CreateButton onClick={() => { setBtnClickCount(c => c + 1); toast.success('CreateButton Clicado!'); }}>
                      Novo Paciente
                    </CreateButton>
                    <SecondaryActionButton
                      icon={<FileSpreadsheet size={14} className="shrink-0" />}
                      onClick={() => { setBtnClickCount(c => c + 1); toast.info('SecondaryActionButton Clicado!'); }}
                    >
                      Exportar Relatório
                    </SecondaryActionButton>
                    <SecondaryActionButton
                      icon={<SlidersHorizontal size={14} className="shrink-0" />}
                      onClick={() => { setBtnClickCount(c => c + 1); toast.info('SecondaryActionButton Clicado!'); }}
                    >
                      Filtrar Registros
                    </SecondaryActionButton>
                  </div>
                </div>

                {/* Icon Buttons */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-warm-charcoal uppercase tracking-wider">3. Botões de Ícone (IconButton & Variantes Especializadas)</h3>
                  <div className="flex flex-wrap items-center gap-4 bg-warm-inner border border-warm-border p-4 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-warm-muted">Especializados:</span>
                      <EditIconButton title="Editar Paciente" onClick={() => toast.info('EditIconButton acionado')} />
                      <DeleteIconButton title="Excluir Registro" onClick={() => toast.error('DeleteIconButton acionado')} />
                    </div>
                    <div className="h-6 w-px bg-warm-border" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-warm-muted">IconButton Genéricos:</span>
                      <IconButton icon={<Search size={16} />} aria-label="Pesquisar" onClick={() => toast.info('Pesquisa acionada')} />
                      <IconButton icon={<Plus size={16} />} aria-label="Adicionar" onClick={() => toast.success('Adição acionada')} />
                      <IconButton icon={<Trash2 size={16} />} aria-label="Excluir" onClick={() => toast.error('Exclusão acionada')} />
                      <IconButton icon={<Copy size={16} />} aria-label="Copiar" onClick={() => toast.info('Cópia acionada')} />
                      <IconButton icon={<Download size={16} />} aria-label="Download" onClick={() => toast.success('Download iniciado')} />
                      <IconButton icon={<Settings size={16} />} aria-label="Configurações" onClick={() => toast.info('Configurações abertas')} />
                    </div>
                  </div>
                </div>

                {/* Button Sizes */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-warm-charcoal uppercase tracking-wider">4. Tamanhos do Componente Button (Sizes)</h3>
                  <div className="flex flex-wrap items-center gap-3 bg-warm-inner border border-warm-border p-4 rounded-xl">
                    <Button size="sm" variant="secondary">Small (sm)</Button>
                    <Button size="md" variant="secondary">Medium (md)</Button>
                    <Button size="lg" variant="secondary">Large (lg)</Button>
                    <Button size="icon" variant="secondary" aria-label="Icon Button">
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>

                {/* Button States & Modifiers */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-warm-charcoal uppercase tracking-wider">5. Estados & Modificadores de Botão</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 bg-warm-inner border border-warm-border p-4 rounded-xl">
                      <div className="text-xs font-bold text-warm-charcoal">Ícones & Estados</div>
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <Button variant="emerald">
                          <Plus size={14} />
                          Com Ícone à Esquerda
                        </Button>
                        <Button variant="secondary">
                          Próxima Etapa
                          <ChevronRight size={14} />
                        </Button>
                        <Button variant="primary" disabled>
                          <Loader2 size={14} className="animate-spin" />
                          Carregando...
                        </Button>
                        <Button variant="outline" disabled>
                          Desabilitado
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 bg-warm-inner border border-warm-border p-4 rounded-xl">
                      <div className="text-xs font-bold text-warm-charcoal">Largura Total (Full Width)</div>
                      <div className="pt-1">
                        <Button variant="terracotta" className="w-full">
                          Confirmar e Finalizar Plano Nutricional
                          <ArrowRight size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-warm-charcoal uppercase tracking-wider">3. Pílulas de Status (Badge Component)</h3>
                  <div className="flex flex-wrap items-center gap-2 bg-warm-inner border border-warm-border p-4 rounded-xl">
                    <Badge variant="emerald">Emerald (Kcal / Sucesso)</Badge>
                    <Badge variant="blue">Blue (Proteína / Azul)</Badge>
                    <Badge variant="rose">Rose (Alerta / Perigo)</Badge>
                    <Badge variant="amber">Amber (Carboidratos / Aviso)</Badge>
                    <Badge variant="teal">Teal (Gorduras / Info)</Badge>
                    <Badge variant="neutral">Neutral (Contorno)</Badge>
                    <Badge variant="default">Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge variant="outline">Outline</Badge>
                  </div>
                </div>

                {/* Avatars */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-warm-charcoal uppercase tracking-wider">4. Avatares (Avatar Component)</h3>
                  <div className="flex items-center gap-6 bg-warm-inner border border-warm-border p-4 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <Avatar initials="GS" size="sm" variant="emerald" />
                      <span className="text-xs text-warm-secondary font-medium">Emerald sm</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Avatar initials="DR" size="md" variant="charcoal" />
                      <span className="text-xs text-warm-secondary font-medium">Charcoal md</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Avatar initials="NP" size="lg" variant="inner" />
                      <span className="text-xs text-warm-secondary font-medium">Inner lg</span>
                    </div>
                  </div>
                </div>

                {/* Inputs */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-warm-charcoal uppercase tracking-wider">5. Campos de Entrada (Input Component)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-warm-inner border border-warm-border p-4 rounded-xl">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-warm-charcoal">Campo Padrão</label>
                      <Input placeholder="Digite o nome do paciente..." />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-warm-charcoal">Campo Numérico (Quantidade g)</label>
                      <Input type="number" defaultValue="150" />
                    </div>
                  </div>
                </div>

                {/* Interactive Progress Bar */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-warm-charcoal uppercase tracking-wider">6. Barra de Progresso Dinâmica (ProgressBar Component)</h3>
                    <span className="text-xs font-mono font-bold text-warm-charcoal">{progressValue}%</span>
                  </div>
                  <div className="bg-warm-inner border border-warm-border p-5 rounded-xl space-y-4">
                    <ProgressBar value={progressValue} colorVariant={progressColor} />

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-warm-muted">Cor:</span>
                        <Button
                          size="sm"
                          variant={progressColor === 'emerald' ? 'primary' : 'outline'}
                          onClick={() => setProgressColor('emerald')}
                        >
                          Emerald
                        </Button>
                        <Button
                          size="sm"
                          variant={progressColor === 'blue' ? 'primary' : 'outline'}
                          onClick={() => setProgressColor('blue')}
                        >
                          Blue
                        </Button>
                        <Button
                          size="sm"
                          variant={progressColor === 'rose' ? 'primary' : 'outline'}
                          onClick={() => setProgressColor('rose')}
                        >
                          Rose
                        </Button>
                        <Button
                          size="sm"
                          variant={progressColor === 'amber' ? 'primary' : 'outline'}
                          onClick={() => setProgressColor('amber')}
                        >
                          Amber
                        </Button>
                        <Button
                          size="sm"
                          variant={progressColor === 'teal' ? 'primary' : 'outline'}
                          onClick={() => setProgressColor('teal')}
                        >
                          Teal
                        </Button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="secondary" onClick={() => setProgressValue(v => Math.max(0, v - 10))}>-10%</Button>
                        <Button size="sm" variant="secondary" onClick={() => setProgressValue(v => Math.min(100, v + 10))}>+10%</Button>
                        <Button size="sm" variant="terracotta" onClick={() => setProgressValue(100)}>100%</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 5: MOLÉCULAS CLINICAS */}
          <TabsContent value="molecules" className="space-y-8">
            <Card className="bg-warm-card border-warm-border rounded-2xl">
              <CardHeader className="border-b border-warm-border">
                <CardTitle className="text-xl font-black">Moléculas & Componentes Funcionais (Molecules)</CardTitle>
                <CardDescription className="text-xs">
                  Combinações atômicas projetadas para o fluxo de dietas. Importados de <code className="font-mono text-warm-charcoal font-bold">@/components/molecules</code>.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                {/* MacroMetricCards */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-warm-charcoal uppercase tracking-wider">1. Cards de Métricas de Macronutrientes (MacroMetricCard)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MacroMetricCard
                      label="CALORIAS (KCAL)"
                      currentValue="2.450"
                      targetValue="2.400 kcal"
                      statusBadgeText="98%"
                      statusBadgeVariant="emerald"
                      percentage={98}
                      macroColor="emerald"
                    />
                    <MacroMetricCard
                      label="PROTEÍNA (G)"
                      currentValue="168g"
                      targetValue="165g"
                      statusBadgeText="ALTA"
                      statusBadgeVariant="blue"
                      percentage={101}
                      gPerKgRatio="2.03 g/kg"
                      gPerKgMeta="2.0"
                      macroColor="blue"
                    />
                    <MacroMetricCard
                      label="CARBOIDRATOS (G)"
                      currentValue="260g"
                      targetValue="270g"
                      statusBadgeText="OK"
                      statusBadgeVariant="amber"
                      percentage={96}
                      gPerKgRatio="3.15 g/kg"
                      gPerKgMeta="3.3"
                      macroColor="amber"
                    />
                    <MacroMetricCard
                      label="GORDURAS (G)"
                      currentValue="62g"
                      targetValue="65g"
                      statusBadgeText="OK"
                      statusBadgeVariant="teal"
                      percentage={95}
                      gPerKgRatio="0.75 g/kg"
                      gPerKgMeta="0.8"
                      macroColor="teal"
                    />
                  </div>
                </div>

                {/* Interactive Meal List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-warm-charcoal uppercase tracking-wider">2. Linhas de Alimentos de Refeição (MealItemRow - Interativo)</h3>
                    <Button size="sm" variant="terracotta" onClick={handleAddSampleItem}>
                      <Plus size={14} className="mr-1" /> Adicionar Alimento Teste
                    </Button>
                  </div>
                  <div className="bg-warm-inner border border-warm-border p-4 rounded-xl space-y-2.5">
                    {mealItems.length === 0 ? (
                      <div className="text-center py-6 text-xs text-warm-muted">
                        Nenhum alimento na refeição. Clique no botão acima para adicionar.
                      </div>
                    ) : (
                      mealItems.map((item, idx) => (
                        <MealItemRow
                          key={item.id}
                          {...item}
                          onRemove={() => handleRemoveMealItem(idx)}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* Patient Badge Header */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-warm-charcoal uppercase tracking-wider">3. Cabeçalho de Paciente (PatientBadgeHeader)</h3>
                  <div className="bg-warm-inner border border-warm-border p-4 rounded-xl">
                    <PatientBadgeHeader
                      initials="GS"
                      name={patientMetrics.name}
                      weightKg={patientMetrics.weight}
                      goalDescription={patientMetrics.goal}
                      onAdjustGoals={() => toast.success('Ação de ajustar metas disparada!')}
                    />
                  </div>
                </div>

                {/* Taco Search Input */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-warm-charcoal uppercase tracking-wider">4. Campo de Busca de Alimentos (TacoSearchInput)</h3>
                  <div className="bg-warm-inner border border-warm-border p-4 rounded-xl max-w-lg">
                    <TacoSearchInput />
                  </div>
                </div>

                {/* Sidebar Molecules */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-warm-charcoal uppercase tracking-wider">5. Componentes de Menu Lateral (SidebarBrand, SidebarNavItem, SidebarUserProfile, SidebarQuickActions)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-warm-inner border border-warm-border p-4 rounded-xl space-y-4">
                      <div className="text-xs font-bold text-warm-muted uppercase">SidebarBrand Demo</div>
                      <SidebarBrand isCollapsed={sidebarCollapsedDemo} onToggleCollapse={() => setSidebarCollapsedDemo(!sidebarCollapsedDemo)} />
                    </div>

                    <div className="bg-warm-inner border border-warm-border p-4 rounded-xl space-y-4">
                      <div className="text-xs font-bold text-warm-muted uppercase">SidebarUserProfile Demo</div>
                      <SidebarUserProfile doctorName="Dr. Lucas" doctorRole="Nutricionista" isCollapsed={sidebarCollapsedDemo} />
                    </div>
                  </div>
                </div>

                {/* ReadOnlyDietModal Demo */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-warm-charcoal uppercase tracking-wider">6. Modal de Leitura de Dieta (ReadOnlyDietModal)</h3>
                  <div className="bg-warm-inner border border-warm-border p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-warm-charcoal">Visualizar Histórico de Dieta Anterior</div>
                      <div className="text-[11px] text-warm-secondary">Abre o modal em modo somente leitura com alimentos de exemplo.</div>
                    </div>
                    <Button variant="secondary" onClick={() => setIsReadOnlyModalOpen(true)}>
                      <Eye size={14} className="mr-1.5" /> Testar ReadOnlyDietModal
                    </Button>
                  </div>

                  <ReadOnlyDietModal
                    isOpen={isReadOnlyModalOpen}
                    onClose={() => setIsReadOnlyModalOpen(false)}
                    diet={sampleHistoricalDiet}
                    patientName="Gabriel Siqueira"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 6: ORGANISMOS */}
          <TabsContent value="organisms" className="space-y-8">
            <Card className="bg-warm-card border-warm-border rounded-2xl">
              <CardHeader className="border-b border-warm-border">
                <CardTitle className="text-xl font-black">Organismos Complexos (Organisms)</CardTitle>
                <CardDescription className="text-xs">
                  Estruturas completas montadas com átomos e moléculas. Importados de <code className="font-mono text-warm-charcoal font-bold">@/components/organisms</code>.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                {/* MealCardContainer */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-warm-charcoal uppercase tracking-wider">1. MealCardContainer (Container de Refeição Completa)</h3>
                  <MealCardContainer
                    title="Refeição 1: Café da Manhã Pós-Treino"
                    time="07:30"
                    kcal={totalMealKcal}
                    proteinG={Math.round(totalMealProtein)}
                    carbsG={Math.round(totalMealCarbs)}
                    fatsG={Math.round(totalMealFats)}
                    items={mealItems}
                    onDuplicate={() => toast.info('Refeição duplicada para Preset!')}
                    onScale={() => toast.success('Calculadora de Escala 1.5x aplicada!')}
                    onDeleteMeal={() => toast.error('Refeição excluída!')}
                    onRemoveItem={(index) => handleRemoveMealItem(index)}
                  />
                </div>

                {/* SidebarNav Showcase */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-warm-charcoal uppercase tracking-wider">2. SidebarNav (Organismo de Navegação Completa)</h3>
                  <div className="border border-warm-border rounded-xl overflow-hidden bg-warm-bg p-4 flex justify-center">
                    <div className="h-[400px] border border-warm-border rounded-xl overflow-hidden shadow-xs">
                      <SidebarNav doctorName="Dr. Lucas" doctorRole="Nutricionista" initialCollapsed={false} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 7: TEMPLATES DE TELA */}
          <TabsContent value="templates" className="space-y-8">
            <Card className="bg-warm-card border-warm-border rounded-2xl">
              <CardHeader className="border-b border-warm-border">
                <CardTitle className="text-xl font-black">Templates de Página (Templates)</CardTitle>
                <CardDescription className="text-xs">
                  Layouts estruturais que integram organismos e determinam a arquitetura da página. Importados de <code className="font-mono text-warm-charcoal font-bold">@/components/templates</code>.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="border border-warm-border rounded-xl p-4 bg-warm-inner space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-warm-charcoal">DietBuilderTemplate Demo</h4>
                      <p className="text-xs text-warm-secondary">Visualização do template mestre de montagem de dietas.</p>
                    </div>
                    <Badge variant="emerald">Template Ativo</Badge>
                  </div>

                  <div className="border border-warm-border rounded-xl bg-warm-bg overflow-hidden max-h-[500px] overflow-y-auto">
                    <DietBuilderTemplate
                      macroTrackerData={{
                        patientInitials: "GS",
                        patientName: patientMetrics.name,
                        patientWeightKg: patientMetrics.weight,
                        patientGoalDescription: patientMetrics.goal,
                        onAdjustGoals: () => toast.info('Ajustar Metas no Template'),
                        metrics: [
                          { label: 'CALORIAS', currentValue: '2.450', targetValue: '2.400 kcal', statusBadgeText: 'OK', statusBadgeVariant: 'emerald', percentage: 102, macroColor: 'emerald' },
                          { label: 'PROTEÍNAS', currentValue: '168g', targetValue: '165g', statusBadgeText: '+3g', statusBadgeVariant: 'blue', percentage: 101, macroColor: 'blue' },
                          { label: 'CARBOIDRATOS', currentValue: '260g', targetValue: '270g', statusBadgeText: '96%', statusBadgeVariant: 'amber', percentage: 96, macroColor: 'amber' },
                          { label: 'GORDURAS', currentValue: '62g', targetValue: '65g', statusBadgeText: 'OK', statusBadgeVariant: 'teal', percentage: 95, macroColor: 'teal' },
                        ]
                      }}
                      mealsData={[
                        {
                          title: 'Refeição 1: Café da Manhã',
                          time: '07:30',
                          kcal: totalMealKcal,
                          proteinG: Math.round(totalMealProtein),
                          carbsG: Math.round(totalMealCarbs),
                          fatsG: Math.round(totalMealFats),
                          items: mealItems,
                        }
                      ]}
                      onAddMeal={() => toast.success('Adicionar refeição via Template')}
                      onScaleDiet={() => toast.info('Escalar dieta via Template')}
                      onWhatsAppShare={() => toast.success('Compartilhar via WhatsApp')}
                      onExportPDF={() => toast.info('Exportar PDF via Template')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 8: MODAIS & OVERLAYS (SHADCN) */}
          <TabsContent value="dialogs" className="space-y-8">
            <Card className="bg-warm-card border-warm-border rounded-2xl">
              <CardHeader className="border-b border-warm-border">
                <CardTitle className="text-xl font-black">Modais, Overlays & Componentes Shadcn</CardTitle>
                <CardDescription className="text-xs">
                  Componentes de interface de alta qualidade importados de <code className="font-mono text-warm-charcoal font-bold">@/components/ui/*</code>.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                {/* Dialog Showcase */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-warm-charcoal uppercase tracking-wider">1. Modal de Ajuste de Metas (Shadcn Dialog)</h3>
                  <div className="bg-warm-inner border border-warm-border p-5 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-warm-charcoal">Ajustar Metas Nutricionais do Paciente</div>
                      <div className="text-[11px] text-warm-secondary">Edite calorias e macronutrientes do paciente ao vivo.</div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="terracotta">
                          <Settings size={14} className="mr-1.5" />
                          Abrir Modal de Metas
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-warm-card border-warm-border max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-lg font-black text-warm-charcoal">Ajustar Metas Diárias</DialogTitle>
                          <DialogDescription className="text-xs text-warm-secondary">
                            Altere os alvos de energia e macronutrientes do paciente {patientMetrics.name}.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-warm-charcoal">Meta Calórica (kcal)</label>
                            <Input value={editKcal} onChange={(e) => setEditKcal(e.target.value)} type="number" />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-blue-600">Proteínas (g)</label>
                              <Input value={editProtein} onChange={(e) => setEditProtein(e.target.value)} type="number" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-warm-amber">Carbs (g)</label>
                              <Input value={editCarbs} onChange={(e) => setEditCarbs(e.target.value)} type="number" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-warm-teal">Gorduras (g)</label>
                              <Input value={editFats} onChange={(e) => setEditFats(e.target.value)} type="number" />
                            </div>
                          </div>
                        </div>

                        <DialogFooter>
                          <Button variant="primary" onClick={handleSaveGoals}>
                            Salvar Novas Metas
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Sheet Showcase */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-warm-charcoal uppercase tracking-wider">2. Gaveta Lateral de Presets (Shadcn Sheet)</h3>
                  <div className="bg-warm-inner border border-warm-border p-5 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-warm-charcoal">Gaveta Lateral de Presets Prontos</div>
                      <div className="text-[11px] text-warm-secondary">Insira dietas completas pré-configuradas.</div>
                    </div>

                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="secondary">
                          <Sparkles size={14} className="mr-1.5" />
                          Abrir Gaveta de Presets
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="bg-warm-card border-warm-border w-full sm:max-w-md p-6">
                        <SheetHeader>
                          <SheetTitle className="text-lg font-black text-warm-charcoal">Bibliotecas de Presets</SheetTitle>
                          <SheetDescription className="text-xs text-warm-secondary">
                            Selecione um modelo de dieta estruturada para aplicar instantaneamente.
                          </SheetDescription>
                        </SheetHeader>
                        <div className="space-y-3 py-6">
                          <div className="border border-warm-border rounded-xl p-3 bg-warm-inner space-y-1">
                            <div className="text-xs font-bold text-warm-charcoal">Hipertrofia Limpa 2.500 kcal</div>
                            <div className="text-[11px] text-warm-secondary">2.0g/kg Proteína • 3.5g/kg Carbs • 0.8g/kg Lipídios</div>
                          </div>
                          <div className="border border-warm-border rounded-xl p-3 bg-warm-inner space-y-1">
                            <div className="text-xs font-bold text-warm-charcoal">Emagrecimento Deficit 1.800 kcal</div>
                            <div className="text-[11px] text-warm-secondary">2.2g/kg Proteína • 2.0g/kg Carbs • 0.7g/kg Lipídios</div>
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>

                {/* Dropdown Menu Showcase */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-warm-charcoal uppercase tracking-wider">3. Menu de Ações Rápidas (Shadcn DropdownMenu)</h3>
                  <div className="bg-warm-inner border border-warm-border p-5 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-warm-charcoal">Menu Suspenso de Opções Clínicas</div>
                      <div className="text-[11px] text-warm-secondary">Ações de exportação, duplicar e impressão.</div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary">
                          Opções da Dieta <ChevronRight size={14} className="ml-1 rotate-90" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-warm-card border-warm-border w-56">
                        <DropdownMenuLabel className="text-xs font-extrabold text-warm-charcoal">Ações Clínicas</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-warm-border" />
                        <DropdownMenuItem onClick={() => toast.success('Gerando PDF da Dieta...')} className="text-xs font-medium">
                          <Download size={14} className="mr-2" /> Exportar PDF Paciente
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info('Exportando planilha CSV...')} className="text-xs font-medium">
                          <FileSpreadsheet size={14} className="mr-2" /> Exportar Planilha TACO
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info('Preset salvo com sucesso!')} className="text-xs font-medium">
                          <Sparkles size={14} className="mr-2" /> Salvar como Preset
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-warm-border" />
                        <DropdownMenuItem onClick={() => toast.error('Ficha arquivada')} className="text-xs font-medium text-warm-rose">
                          <Trash2 size={14} className="mr-2" /> Arquivar Ficha
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Popover & Select Showcase */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-warm-inner border border-warm-border p-4 rounded-xl space-y-3">
                    <div className="text-xs font-bold text-warm-charcoal">Popover Nutricional (Shadcn Popover)</div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Info size={14} className="mr-1.5" /> Abrir Dica de Macro
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="bg-warm-card border-warm-border p-4 text-xs space-y-2 w-64">
                        <div className="font-bold text-warm-charcoal">Proporção Proteica Recomendada</div>
                        <div className="text-warm-secondary text-[11px]">Para pacientes em cutting, mantenha entre 2.0g/kg e 2.4g/kg para preservar massa magra.</div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="bg-warm-inner border border-warm-border p-4 rounded-xl space-y-3">
                    <div className="text-xs font-bold text-warm-charcoal">Seleção de Categoria (Shadcn Select)</div>
                    <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val)}>
                      <SelectTrigger className="bg-warm-card border-warm-border text-xs font-bold">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent className="bg-warm-card border-warm-border">
                        <SelectItem value="todos">Todas as Categorias</SelectItem>
                        <SelectItem value="carnes">Carnes</SelectItem>
                        <SelectItem value="cereais">Cereais</SelectItem>
                        <SelectItem value="ovos">Ovos</SelectItem>
                        <SelectItem value="leguminosas">Leguminosas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 4. Novo Padrão: Intercepção de Backdrop + Popup de Confirmação */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-warm-charcoal uppercase tracking-wider">4. Confirmação ao Clicar no Backdrop (onInteractOutside Interception)</h3>
                  <div className="bg-warm-inner border border-warm-border p-5 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-warm-charcoal">Prevenção contra Perda Acidental de Dados</div>
                      <div className="text-[11px] text-warm-secondary">Ao digitar no formulário e clicar no fundo escuro, a saída é interceptada exigindo confirmação.</div>
                    </div>

                    <Button variant="emerald" onClick={() => setIsDemoPresetFormOpen(true)}>
                      <Sparkles size={14} className="mr-1.5" /> Testar Intercepção Backdrop
                    </Button>

                    <Dialog
                      open={isDemoPresetFormOpen}
                      onOpenChange={(open) => {
                        if (!open && demoFormTitle.trim()) {
                          setIsDemoConfirmDiscardOpen(true);
                        } else {
                          setIsDemoPresetFormOpen(open);
                        }
                      }}
                    >
                      <DialogContent
                        onInteractOutside={(e) => {
                          if (demoFormTitle.trim()) {
                            e.preventDefault();
                            setIsDemoConfirmDiscardOpen(true);
                          }
                        }}
                        className="bg-warm-card border-warm-border max-w-md p-6 rounded-2xl"
                      >
                        <DialogHeader>
                          <DialogTitle className="text-base font-black text-warm-charcoal">Demo Preset Form</DialogTitle>
                          <DialogDescription className="text-xs text-warm-secondary">
                            Digite algo abaixo e tente clicar no fundo escuro (fora do modal).
                          </DialogDescription>
                        </DialogHeader>

                        <div className="py-3 space-y-2">
                          <label className="text-xs font-bold text-warm-charcoal block">Título do Protocolo</label>
                          <Input
                            placeholder="Digite algo para ativar a proteção..."
                            value={demoFormTitle}
                            onChange={(e) => setDemoFormTitle(e.target.value)}
                          />
                        </div>

                        <DialogFooter>
                          <Button variant="secondary" onClick={() => setIsDemoPresetFormOpen(false)}>Cancelar</Button>
                          <Button variant="emerald" onClick={() => { setIsDemoPresetFormOpen(false); setDemoFormTitle(''); toast.success('Salvo!'); }}>Salvar Demo</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Secondary Confirmation Dialog */}
                    <Dialog open={isDemoConfirmDiscardOpen} onOpenChange={setIsDemoConfirmDiscardOpen}>
                      <DialogContent className="sm:max-w-sm bg-warm-card border-warm-border p-6 rounded-2xl">
                        <DialogHeader>
                          <DialogTitle className="font-black text-base text-warm-charcoal">Descartar alterações?</DialogTitle>
                          <DialogDescription className="text-xs text-warm-secondary pt-1">
                            Você possui dados digitados no formulário. Se fechar agora, as alterações serão perdidas.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="pt-4 flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => setIsDemoConfirmDiscardOpen(false)} className="flex-1 text-xs font-bold">
                            Continuar Editando
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              setIsDemoConfirmDiscardOpen(false);
                              setIsDemoPresetFormOpen(false);
                              setDemoFormTitle('');
                              toast.info('Alterações descartadas');
                            }}
                            className="flex-1 text-xs font-bold"
                          >
                            Descartar
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* 5. Novo Padrão: Recálculo Multiplicativo por Dados do Paciente */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-warm-charcoal uppercase tracking-wider">5. Motor de Recálculo Multiplicativo (`resolvePresetForPatient`)</h3>
                  <div className="bg-warm-inner border border-warm-border p-5 rounded-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-warm-charcoal">Preset: {demoPreset.title}</div>
                        <div className="text-[11px] text-warm-secondary font-mono">
                          Prot: {demoPreset.proteinValue} g/kg | Carb: {demoPreset.carbsValue} g/kg | Gord: {demoPreset.fatsValue} g/kg
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <label className="text-xs font-bold text-warm-charcoal shrink-0">Peso do Paciente (kg):</label>
                        <Input
                          type="number"
                          value={demoPatientWeight}
                          onChange={(e) => setDemoPatientWeight(Number(e.target.value))}
                          className="w-20 font-bold text-center h-8"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-warm-card border border-warm-border rounded-xl text-center">
                      <div>
                        <span className="text-[10px] font-bold text-warm-muted block uppercase">Kcal Calculadas</span>
                        <span className="font-black text-sm text-warm-emerald">{resolvedDemoNutrients.targetKcal} kcal</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 block uppercase">Proteínas ({demoPreset.proteinValue}g/kg)</span>
                        <span className="font-black text-sm text-blue-600">{resolvedDemoNutrients.proteinG} g</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-amber-600 block uppercase">Carboidratos ({demoPreset.carbsValue}g/kg)</span>
                        <span className="font-black text-sm text-amber-600">{resolvedDemoNutrients.carbsG} g</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-teal-600 block uppercase">Gorduras ({demoPreset.fatsValue}g/kg)</span>
                        <span className="font-black text-sm text-teal-600">{resolvedDemoNutrients.fatsG} g</span>
                      </div>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 9: TABELA DE ALIMENTOS */}
          <TabsContent value="tables" className="space-y-8">
            <Card className="bg-warm-card border-warm-border rounded-2xl">
              <CardHeader className="border-b border-warm-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl font-black">Tabela de Composição TACO (Shadcn Table)</CardTitle>
                    <CardDescription className="text-xs">
                      Exibição de alimentos com filtros em tempo real e formato nutricional.
                    </CardDescription>
                  </div>
                  <div className="w-full sm:w-64">
                    <Input
                      placeholder="Filtrar alimentos por nome..."
                      value={tacoSearch}
                      onChange={(e) => setTacoSearch(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-warm-inner border-b border-warm-border">
                    <TableRow>
                      <TableHead className="text-xs font-bold text-warm-charcoal">Código</TableHead>
                      <TableHead className="text-xs font-bold text-warm-charcoal">Nome do Alimento</TableHead>
                      <TableHead className="text-xs font-bold text-warm-charcoal">Categoria</TableHead>
                      <TableHead className="text-xs font-bold text-warm-emerald text-right">Kcal (100g)</TableHead>
                      <TableHead className="text-xs font-bold text-blue-600 text-right">Proteínas (g)</TableHead>
                      <TableHead className="text-xs font-bold text-warm-amber text-right">Carbs (g)</TableHead>
                      <TableHead className="text-xs font-bold text-warm-teal text-right">Lipídios (g)</TableHead>
                      <TableHead className="text-xs font-bold text-warm-charcoal text-center">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTaco.map((food) => (
                      <TableRow key={food.code} className="hover:bg-warm-inner/50 border-b border-warm-border">
                        <TableCell className="font-mono text-xs text-warm-muted">{food.code}</TableCell>
                        <TableCell className="text-xs font-bold text-warm-charcoal">{food.name}</TableCell>
                        <TableCell>
                          <Badge variant="neutral">{food.category}</Badge>
                        </TableCell>
                        <TableCell className="text-xs font-bold text-warm-emerald text-right">{food.kcal} kcal</TableCell>
                        <TableCell className="text-xs font-bold text-blue-600 text-right">{food.protein}g</TableCell>
                        <TableCell className="text-xs font-bold text-warm-amber text-right">{food.carbs}g</TableCell>
                        <TableCell className="text-xs font-bold text-warm-teal text-right">{food.lipids}g</TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setMealItems((prev) => [
                                ...prev,
                                {
                                  id: Date.now().toString(),
                                  name: food.name,
                                  kcal: food.kcal,
                                  protein: food.protein,
                                  carbs: food.carbs,
                                  fats: food.lipids,
                                  quantityGrams: 100,
                                },
                              ]);
                              toast.success(`Alimento ${food.name} adicionado!`);
                            }}
                          >
                            <Plus size={14} /> Adicionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 10: GUIA DE CÓDIGO */}
          <TabsContent value="code" className="space-y-8">
            <Card className="bg-warm-card border-warm-border rounded-2xl">
              <CardHeader className="border-b border-warm-border">
                <CardTitle className="text-xl font-black">Instruções para Desenvolvedores</CardTitle>
                <CardDescription className="text-xs">
                  Como utilizar os tokens, botões, átomos e moléculas do sistema no seu código.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-warm-charcoal uppercase tracking-wider">1. Importação de Tokens em TypeScript</h3>
                  <div className="relative bg-warm-charcoal text-warm-inner p-4 rounded-xl font-mono text-xs overflow-x-auto">
                    <pre>{`import { designTokens, semanticTokens, primitiveTokens } from '@/design-system/tokens';

// Acesso programático a tokens de superfície e texto
const bgApp = semanticTokens.surfaces.app; // '#f5f2eb'
const primaryText = semanticTokens.text.primary; // '#111827'
const kcalColor = semanticTokens.macros.calories.main; // '#059669'`}</pre>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-warm-charcoal uppercase tracking-wider">2. Importação de Componentes (Atoms, Molecules, Organisms, Templates)</h3>
                  <div className="relative bg-warm-charcoal text-warm-inner p-4 rounded-xl font-mono text-xs overflow-x-auto">
                    <pre>{`import { Button, CreateButton, SecondaryActionButton, IconButton, EditIconButton, DeleteIconButton, Badge, ProgressBar, Input, Avatar } from '@/components/atoms';
import { MacroMetricCard, MealItemRow, PatientBadgeHeader, ReadOnlyDietModal } from '@/components/molecules';
import { MacroTrackerHeader, MealCardContainer, SidebarNav } from '@/components/organisms';
import { DietBuilderTemplate, AppLayoutShell } from '@/components/templates';`}</pre>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-warm-charcoal uppercase tracking-wider">3. Regras Obrigatórias de Tailwind CSS</h3>
                  <ul className="list-disc list-inside text-xs text-warm-secondary space-y-1 bg-warm-inner border border-warm-border p-4 rounded-xl font-medium">
                    <li>Sempre use <code className="bg-warm-card px-1 border border-warm-border rounded font-bold">bg-warm-bg</code> para fundos de página e <code className="bg-warm-card px-1 border border-warm-border rounded font-bold">bg-warm-card</code> para painéis.</li>
                    <li>Nunca aplique <code className="bg-warm-card px-1 border border-warm-border rounded font-bold">shadow-*</code> ou <code className="bg-warm-card px-1 border border-warm-border rounded font-bold">bg-gradient-*</code>.</li>
                    <li>Sempre utilize <code className="bg-warm-card px-1 border border-warm-border rounded font-bold">border border-warm-border</code> para contornos.</li>
                    <li>Use as fontes <code className="bg-warm-card px-1 border border-warm-border rounded font-bold">font-sans</code> (Plus Jakarta) para títulos/métricas e <code className="bg-warm-card px-1 border border-warm-border rounded font-bold">font-body</code> (Inter) para textos longos.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
