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
            <Link href="/pacientes" className="flex items-center justify-center rounded-control transition-transform">
              <Avatar initials="N" variant="charcoal" size="md" className="rounded-control shrink-0 shadow-floating" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-semibold text-style-legal bg-primary text-white border-text-primary">
            {title} {subtitle}
          </TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapse}
              className="h-7 w-7 border border-border-subtle text-text-muted hover:text-text-primary hover:bg-surface-subtle rounded-surface p-0"
              aria-label="Expandir Menu"
            >
              <ChevronRight size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-semibold text-style-legal">
            Expandir Menu
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between mb-6 w-full">
      <Link href="/pacientes" className="flex items-center gap-3 overflow-hidden group">
        <Avatar initials="N" variant="charcoal" size="md" className="rounded-control shrink-0 shadow-floating transition-transform" />
        <div className="transition-opacity duration-standard min-w-0">
          <h1 className="font-bold text-style-body text-text-primary tracking-tight leading-none truncate">{title}</h1>
          <span className="text-style-legal font-bold text-success tracking-overline block">{subtitle}</span>
        </div>
      </Link>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="h-8 w-8 border border-border-subtle p-0 text-text-muted hover:text-text-primary hover:bg-surface-subtle rounded-control shrink-0"
            aria-label="Recolher Menu"
          >
            <ChevronLeft size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="font-semibold text-style-legal">
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
    ? 'bg-primary text-white font-bold shadow-floating'
    : 'text-text-muted hover:text-text-primary hover:bg-surface-subtle font-semibold';

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <Link
            href={href}
            aria-label={label}
            className={`flex items-center justify-center size-10 rounded-control text-style-legal transition-colors duration-standard mx-auto ${activeClass}`}
          >
            <Icon size={18} className="shrink-0" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="font-bold text-style-legal bg-primary text-white border-text-primary shadow-floating">
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-control text-style-legal transition-colors duration-standard w-full ${activeClass}`}
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
          <div className="flex items-center justify-center p-2 bg-surface-subtle border border-border-subtle rounded-control size-10 mx-auto cursor-pointer hover:border-text-muted transition-colors">
            <Avatar initials="DR" variant="emerald" size="sm" className="shrink-0" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="p-2.5">
          <div className="text-style-legal font-bold text-text-primary">{doctorName}</div>
          <div className="text-style-legal text-text-muted">{doctorRole}</div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="flex items-center p-2 bg-surface-subtle border border-border-subtle rounded-control gap-2.5 w-full">
      <Avatar initials="DR" variant="emerald" size="sm" className="shrink-0" />
      <div className="text-style-legal truncate min-w-0 flex-1">
        <div className="font-bold text-text-primary truncate">{doctorName}</div>
        <div className="text-style-legal text-text-muted truncate">{doctorRole}</div>
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
              className="h-9 w-9 rounded-control border border-border-subtle text-text-primary hover:bg-surface-subtle"
              aria-label="Salvar Arquivo Local"
            >
              <Save size={15} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12} className="font-semibold text-style-legal">
            Salvar Arquivo Local
          </TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <Button
              onClick={onOpen}
              variant="secondary"
              size="icon"
              className="h-9 w-9 rounded-control border border-border-subtle text-text-primary hover:bg-surface-subtle"
              aria-label="Abrir Arquivo .diet"
            >
              <FolderOpen size={15} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12} className="font-semibold text-style-legal">
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
        className="flex-1 flex items-center justify-center gap-1 text-style-legal h-8 rounded-control font-semibold"
      >
        <Save size={14} />
        <span>Salvar</span>
      </Button>
      <Button
        onClick={onOpen}
        variant="secondary"
        size="sm"
        className="flex-1 flex items-center justify-center gap-1 text-style-legal h-8 rounded-control font-semibold"
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
          className={`bg-surface border-r border-border-subtle h-screen sticky top-0 flex flex-col justify-between shrink-0 transition-colors duration-standard z-30 ${
            isCollapsed ? 'w-20 px-3 py-4' : 'w-64 p-4'
          }`}
        >
          {children || (
            <>
              <div className="flex flex-col w-full">
                <SidebarBrand />
                <nav className="flex flex-col gap-1.5 w-full">
                  {navItems.map((item) => (
                    <SidebarNavItem key={item.href} href={item.href} label={item.label} icon={item.icon} />
                  ))}
                </nav>
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-border-subtle w-full">
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
