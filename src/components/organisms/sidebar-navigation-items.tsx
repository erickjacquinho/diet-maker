'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { SidebarNavItem } from '@/components/molecules/SidebarNavItem';
import {
  getRenderableNavigationItems,
  isSidebarNavigationItemActive,
  type SidebarNavigationItem,
} from '@/components/organisms/sidebar-navigation-model';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

function SidebarGroupRoute({
  item,
  pathname,
}: {
  item: Extract<SidebarNavigationItem, { kind: 'route' }>;
  pathname: string;
}) {
  const isActive = isSidebarNavigationItemActive(pathname, item);
  const Icon = item.icon;

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild isActive={isActive}>
        <Link href={item.href} aria-current={isActive ? 'page' : undefined}>
          <Icon aria-hidden="true" className="size-4" />
          <span className="truncate">{item.label}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}

function SidebarNavigationGroup({
  item,
  pathname,
  isCollapsed,
}: {
  item: Extract<SidebarNavigationItem, { kind: 'group' }>;
  pathname: string;
  isCollapsed: boolean;
}) {
  const isActive = isSidebarNavigationItemActive(pathname, item);
  const accessibleLabel = isActive ? `${item.label}, contém destino atual` : item.label;
  const Icon = item.icon;

  const children = item.children.map((child) => (
    <SidebarGroupRoute key={child.href} item={child} pathname={pathname} />
  ));

  if (isCollapsed) {
    return (
      <Popover>
        <SidebarMenuItem>
          <PopoverTrigger asChild>
            <SidebarMenuButton
              type="button"
              isActive={isActive}
              aria-label={accessibleLabel}
              className="mx-auto justify-center"
            >
              {Icon ? <Icon aria-hidden="true" className="size-4" /> : null}
              <span className="sr-only">{item.label}</span>
            </SidebarMenuButton>
          </PopoverTrigger>
          <PopoverContent side="right" align="start" sideOffset={12} className="w-56 p-2">
            <nav aria-label={item.label}>
              <SidebarMenuSub className="m-0 border-0 px-0 py-0">{children}</SidebarMenuSub>
            </nav>
          </PopoverContent>
        </SidebarMenuItem>
      </Popover>
    );
  }

  return (
    <Collapsible defaultOpen={isActive || item.defaultOpen === true} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton type="button" isActive={isActive} aria-label={accessibleLabel}>
            {Icon ? <Icon aria-hidden="true" className="size-4" /> : null}
            <span className="truncate">{item.label}</span>
            <ChevronRight
              aria-hidden="true"
              className="ml-auto size-4 transition-transform duration-fast motion-reduce:transition-none motion-reduce:duration-0 group-data-[state=open]/collapsible:rotate-90"
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>{children}</SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function SidebarNavigation({
  items,
  pathname,
  isCollapsed,
}: {
  items: SidebarNavigationItem[];
  pathname: string;
  isCollapsed: boolean;
}) {
  const renderableItems = getRenderableNavigationItems(items);

  return (
    <nav aria-label="Navegação principal" className="flex w-full flex-col">
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {renderableItems.map((item) => {
              if (item.kind === 'group') {
                return (
                  <SidebarNavigationGroup
                    key={item.id}
                    item={item}
                    pathname={pathname}
                    isCollapsed={isCollapsed}
                  />
                );
              }
              return (
                <SidebarNavItem
                  key={item.href}
                  {...item}
                  isCollapsed={isCollapsed}
                  isActive={isSidebarNavigationItemActive(pathname, item)}
                />
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </nav>
  );
}
