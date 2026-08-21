'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

import { SidebarNav, type SidebarNavProps } from '@/components/organisms/SidebarNav';
import { SIDEBAR_NAVIGATION_ITEMS } from './sidebar-navigation-config';

export type SidebarNavigationAdapterProps = Omit<SidebarNavProps, 'pathname' | 'navigationItems'>;

export const SidebarNavigationAdapter: React.FC<SidebarNavigationAdapterProps> = (props) => {
  const pathname = usePathname() ?? '';

  return <SidebarNav {...props} pathname={pathname} navigationItems={SIDEBAR_NAVIGATION_ITEMS} />;
};
