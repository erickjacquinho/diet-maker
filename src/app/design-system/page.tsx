"use client";

import { useState } from "react";
import { ShowcaseHeader } from "./components/ShowcaseHeader";
import { ShowcaseTabs } from "./components/ShowcaseTabs";
import { ShowcaseSearch } from "./components/ShowcaseSearch";
import { TokenSwatchesSection } from "./components/TokenSwatchesSection";
import { ComponentPlaygroundSection } from "./components/ComponentPlaygroundSection";
import { CompositionGallery } from "./components/CompositionGallery";
import { ShowcaseTab, ViewMode } from "./components/types";
import { textStyle } from "@/design-system";

export default function DesignSystemPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("client-showcase");
  const [activeTab, setActiveTab] = useState<ShowcaseTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const counts: Record<ShowcaseTab, number> = {
    all: 42,
    tokens: 18,
    atoms: 8,
    molecules: 5,
    organisms: 4,
    compositions: 2,
  };

  return (
    <main className="mx-auto flex w-full max-w-container-page flex-col gap-8 p-6 lg:p-10 bg-stone-50/50 dark:bg-stone-950 min-h-screen">
      {/* Presentation Header */}
      <ShowcaseHeader viewMode={viewMode} onViewModeChange={setViewMode} />

      {/* Filter and Search Bar */}
      <ShowcaseSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTag={selectedTag}
        onTagSelect={setSelectedTag}
      />

      {/* Category Tabs */}
      <ShowcaseTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
      />

      {/* Active Section Content */}
      <div className="space-y-12">
        {(activeTab === "all" || activeTab === "tokens") && (
          <TokenSwatchesSection viewMode={viewMode} />
        )}

        {(activeTab === "all" || activeTab === "atoms" || activeTab === "molecules" || activeTab === "organisms") && (
          <ComponentPlaygroundSection activeTab={activeTab} viewMode={viewMode} />
        )}

        {(activeTab === "all" || activeTab === "compositions") && (
          <CompositionGallery viewMode={viewMode} />
        )}
      </div>

      {/* Footer Info */}
      <footer className="mt-12 border-t border-stone-200 pt-6 text-center text-xs text-stone-500 dark:border-stone-800">
        <p className={textStyle("metadata")}>
          NutriDiet Design System Showcase · Fonte Canônica: `design-system/` & `src/design-system/`
        </p>
      </footer>
    </main>
  );
}
