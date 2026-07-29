'use client';

import React from 'react';
import { SidebarNav } from '../organisms/SidebarNav';

export interface AppLayoutShellProps {
  children: React.ReactNode;
}

export const AppLayoutShell: React.FC<AppLayoutShellProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-warm-bg text-warm-charcoal antialiased">
      <SidebarNav />
      <main className="flex-1 min-w-0 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
};
