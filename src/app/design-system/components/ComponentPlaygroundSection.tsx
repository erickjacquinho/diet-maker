"use client";

import { AtomsGallery } from "./AtomsGallery";
import { MoleculesGallery } from "./MoleculesGallery";
import { OrganismsGallery } from "./OrganismsGallery";
import { ShowcaseTab, ViewMode } from "./types";

interface ComponentPlaygroundSectionProps {
  activeTab: ShowcaseTab;
  viewMode: ViewMode;
}

export function ComponentPlaygroundSection({ activeTab, viewMode }: ComponentPlaygroundSectionProps) {
  return (
    <div className="space-y-12">
      {(activeTab === "all" || activeTab === "atoms") && (
        <section>
          <AtomsGallery viewMode={viewMode} />
        </section>
      )}

      {(activeTab === "all" || activeTab === "molecules") && (
        <section>
          <MoleculesGallery viewMode={viewMode} />
        </section>
      )}

      {(activeTab === "all" || activeTab === "organisms") && (
        <section>
          <OrganismsGallery viewMode={viewMode} />
        </section>
      )}
    </div>
  );
}
