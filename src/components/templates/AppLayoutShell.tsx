'use client';

import React from 'react';

export interface AppLayoutShellProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export const AppLayoutShell: React.FC<AppLayoutShellProps> = ({ sidebar, children }) => {
  return (
    <div className="flex min-h-screen bg-canvas text-text-primary antialiased">
      <a
        href="#main-content"
        className="sr-only z-overlay rounded-control bg-primary px-3 py-2 text-on-primary focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Pular para o conteúdo principal
      </a>
      {sidebar}
      <main id="main-content" tabIndex={-1} className="h-screen min-w-0 flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
