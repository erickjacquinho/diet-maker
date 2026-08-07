"use client";

import { ShowcaseTab } from "./types";
import { Palette, Box, Layers, LayoutGrid, Sparkles } from "lucide-react";

interface ShowcaseTabsProps {
  activeTab: ShowcaseTab;
  onTabChange: (tab: ShowcaseTab) => void;
  counts: Record<ShowcaseTab, number>;
}

export function ShowcaseTabs({ activeTab, onTabChange, counts }: ShowcaseTabsProps) {
  const tabs: { id: ShowcaseTab; label: string; icon: React.ReactNode }[] = [
    { id: "all", label: "Visão Geral", icon: <Sparkles className="h-4 w-4" /> },
    { id: "tokens", label: "Tokens de Design", icon: <Palette className="h-4 w-4" /> },
    { id: "atoms", label: "Átomos", icon: <Box className="h-4 w-4" /> },
    { id: "molecules", label: "Moléculas", icon: <Layers className="h-4 w-4" /> },
    { id: "organisms", label: "Organismos", icon: <LayoutGrid className="h-4 w-4" /> },
    { id: "compositions", label: "Composições", icon: <Sparkles className="h-4 w-4 text-emerald-500" /> },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3 dark:border-stone-800">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              isActive
                ? "bg-blue-700 text-white shadow-md shadow-blue-500/20"
                : "bg-white text-stone-700 hover:bg-stone-100 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {counts[tab.id] !== undefined && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                }`}
              >
                {counts[tab.id]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
