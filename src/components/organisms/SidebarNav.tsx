'use client';

import React, { useState, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, BookOpen, UtensilsCrossed, Utensils, Sparkles, Palette, ChevronLeft, ChevronRight, Save, FolderOpen, LucideIcon } from 'lucide-react';
import { Avatar, Button } from '@/components/atoms';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface SidebarContextValue {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export function useSidebarContext() {
  return useContext(SidebarContext);
}

export interface SidebarNavProps {
  doctorName?: string;
  doctorRole?: string;
  onSave?: () => void;
  onOpen?: () => void;
  initialCollapsed?: boolean;
  children?: React.ReactNode;
}

export interface SidebarBrandProps {
  title?: string;
  subtitle?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const SidebarBrand: React.FC<SidebarBrandProps> = ({
  title = 'NutriDiet',
  subtitle = 'Pro Local',
  isCollapsed: propIsCollapsed,
  onToggleCollapse: propOnToggleCollapse,
}) => {
  const context = useSidebarContext();
  const isCollapsed = propIsCollapsed ?? context?.isCollapsed ?? false;
  const toggleCollapse = propOnToggleCollapse ?? context?.toggleCollapse ?? (() => {});

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-3 w-full mb-6">
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Link href="/pacientes" className="flex items-center justify-center rounded-xl transition-transform hover:scale-105">
              <Avatar initials="N" variant="charcoal" size="md" className="rounded-xl shrink-0 shadow-xs" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-semibold text-xs bg-warm-charcoal text-white border-warm-charcoal">
            {title} {subtitle}
          </TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapse}
              className="h-7 w-7 border border-warm-border text-warm-muted hover:text-warm-charcoal hover:bg-warm-inner rounded-lg p-0"
              aria-label="Expandir Menu"
            >
              <ChevronRight size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-semibold text-xs">
            Expandir Menu
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between mb-6 w-full">
      <Link href="/pacientes" className="flex items-center space-x-3 overflow-hidden group">
        <Avatar initials="N" variant="charcoal" size="md" className="rounded-xl shrink-0 shadow-xs group-hover:scale-105 transition-transform" />
        <div className="transition-opacity duration-200 min-w-0">
          <h1 className="font-black text-base text-warm-charcoal tracking-tight leading-none truncate">{title}</h1>
          <span className="text-[10px] font-bold text-warm-emerald uppercase tracking-wider block">{subtitle}</span>
        </div>
      </Link>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="h-8 w-8 border border-warm-border p-0 text-warm-muted hover:text-warm-charcoal hover:bg-warm-inner rounded-xl shrink-0"
            aria-label="Recolher Menu"
          >
            <ChevronLeft size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="font-semibold text-xs">
          Recolher Menu
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export interface SidebarNavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive?: boolean;
  isCollapsed?: boolean;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  href,
  label,
  icon: Icon,
  isActive: customIsActive,
  isCollapsed: propIsCollapsed,
}) => {
  const context = useSidebarContext();
  const isCollapsed = propIsCollapsed ?? context?.isCollapsed ?? false;
  const pathname = usePathname();

  const isActive = customIsActive ?? (
    pathname === href ||
    (href !== '/pacientes' && pathname.startsWith(href)) ||
    (href === '/pacientes' && pathname.startsWith('/pacientes'))
  );

  const activeClass = isActive
    ? 'bg-warm-charcoal text-white font-bold shadow-xs'
    : 'text-warm-muted hover:text-warm-charcoal hover:bg-warm-inner font-semibold';

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <Link
            href={href}
            aria-label={label}
            className={`flex items-center justify-center size-10 rounded-xl text-xs transition-all mx-auto ${activeClass}`}
          >
            <Icon size={18} className="shrink-0" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="font-bold text-xs bg-warm-charcoal text-white border-warm-charcoal shadow-md">
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all w-full ${activeClass}`}
    >
      <Icon size={18} className="shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
};

export interface SidebarUserProfileProps {
  doctorName?: string;
  doctorRole?: string;
  isCollapsed?: boolean;
}

const SidebarUserProfile: React.FC<SidebarUserProfileProps> = ({
  doctorName = 'Dr. Lucas',
  doctorRole = 'Nutricionista',
  isCollapsed: propIsCollapsed,
}) => {
  const context = useSidebarContext();
  const isCollapsed = propIsCollapsed ?? context?.isCollapsed ?? false;

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center p-2 bg-warm-inner border border-warm-border rounded-xl size-10 mx-auto cursor-pointer hover:border-warm-muted transition-colors">
            <Avatar initials="DR" variant="emerald" size="sm" className="shrink-0" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="p-2.5">
          <div className="text-xs font-bold text-warm-charcoal">{doctorName}</div>
          <div className="text-[10px] text-warm-muted">{doctorRole}</div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="flex items-center p-2 bg-warm-inner border border-warm-border rounded-xl gap-2.5 w-full">
      <Avatar initials="DR" variant="emerald" size="sm" className="shrink-0" />
      <div className="text-xs truncate min-w-0 flex-1">
        <div className="font-bold text-warm-charcoal truncate">{doctorName}</div>
        <div className="text-[10px] text-warm-muted truncate">{doctorRole}</div>
      </div>
    </div>
  );
};

export interface SidebarQuickActionsProps {
  onSave?: () => void;
  onOpen?: () => void;
  isCollapsed?: boolean;
}

const SidebarQuickActions: React.FC<SidebarQuickActionsProps> = ({
  onSave,
  onOpen,
  isCollapsed: propIsCollapsed,
}) => {
  const context = useSidebarContext();
  const isCollapsed = propIsCollapsed ?? context?.isCollapsed ?? false;

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-2 w-full">
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <Button
              onClick={onSave}
              variant="secondary"
              size="icon"
              className="h-9 w-9 rounded-xl border border-warm-border text-warm-charcoal hover:bg-warm-inner"
              aria-label="Salvar Arquivo Local"
            >
              <Save size={15} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12} className="font-semibold text-xs">
            Salvar Arquivo Local
          </TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <Button
              onClick={onOpen}
              variant="secondary"
              size="icon"
              className="h-9 w-9 rounded-xl border border-warm-border text-warm-charcoal hover:bg-warm-inner"
              aria-label="Abrir Arquivo .diet"
            >
              <FolderOpen size={15} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12} className="font-semibold text-xs">
            Abrir Arquivo .diet
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 w-full">
      <Button
        onClick={onSave}
        variant="secondary"
        size="sm"
        className="flex-1 flex items-center justify-center gap-1 text-[11px] h-8 rounded-xl font-semibold"
      >
        <Save size={14} />
        <span>Salvar</span>
      </Button>
      <Button
        onClick={onOpen}
        variant="secondary"
        size="sm"
        className="flex-1 flex items-center justify-center gap-1 text-[11px] h-8 rounded-xl font-semibold"
      >
        <FolderOpen size={14} />
        <span>Abrir</span>
      </Button>
    </div>
  );
};

const navItems = [
  { href: '/pacientes', label: 'Pacientes', icon: Users },
  { href: '/presets', label: 'Presets de Dietas', icon: Sparkles },
  { href: '/refeicoes-prontas', label: 'Refeições Prontas', icon: UtensilsCrossed },
  { href: '/receitas', label: 'Receitas Culinárias', icon: Utensils },
  { href: '/alimentos', label: 'Planilha de Alimentos', icon: BookOpen },
  { href: '/design-system', label: 'Guia Design System', icon: Palette },
];

export const SidebarNavComponent: React.FC<SidebarNavProps> & {
  Brand: typeof SidebarBrand;
  Item: typeof SidebarNavItem;
  UserProfile: typeof SidebarUserProfile;
  QuickActions: typeof SidebarQuickActions;
} = ({
  doctorName = 'Dr. Lucas',
  doctorRole = 'Nutricionista',
  onSave,
  onOpen,
  initialCollapsed = false,
  children,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        toggleCollapse: () => setIsCollapsed((prev) => !prev),
      }}
    >
      <TooltipProvider delayDuration={150}>
        <aside
          className={`bg-warm-card border-r border-warm-border h-screen sticky top-0 flex flex-col justify-between shrink-0 transition-all duration-300 z-30 ${
            isCollapsed ? 'w-20 px-3 py-4' : 'w-64 p-4'
          }`}
        >
          {children || (
            <>
              <div className="flex flex-col w-full">
                <SidebarBrand />
                <nav className="space-y-1.5 w-full">
                  {navItems.map((item) => (
                    <SidebarNavItem key={item.href} href={item.href} label={item.label} icon={item.icon} />
                  ))}
                </nav>
              </div>

              <div className="pt-4 border-t border-warm-border space-y-3 w-full">
                <SidebarUserProfile doctorName={doctorName} doctorRole={doctorRole} />
                <SidebarQuickActions onSave={onSave} onOpen={onOpen} />
              </div>
            </>
          )}
        </aside>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
};

SidebarNavComponent.Brand = SidebarBrand;
SidebarNavComponent.Item = SidebarNavItem;
SidebarNavComponent.UserProfile = SidebarUserProfile;
SidebarNavComponent.QuickActions = SidebarQuickActions;

export const SidebarNav = SidebarNavComponent;
