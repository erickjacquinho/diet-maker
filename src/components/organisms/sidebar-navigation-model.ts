import type { LucideIcon } from 'lucide-react';

export type SidebarRouteMatch = 'exact' | 'prefix' | 'patients-prefix';

export interface SidebarRouteItem {
  kind: 'route';
  href: string;
  label: string;
  icon: LucideIcon;
  match?: SidebarRouteMatch;
}

export interface SidebarGroupItem {
  kind: 'group';
  id: string;
  label: string;
  icon?: LucideIcon;
  children: SidebarRouteItem[];
  defaultOpen?: boolean;
}

export type SidebarNavigationItem = SidebarRouteItem | SidebarGroupItem;

function isSegmentPrefix(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isSidebarRouteActive(pathname: string, item: SidebarRouteItem): boolean {
  switch (item.match) {
    case 'prefix':
    case 'patients-prefix':
      return isSegmentPrefix(pathname, item.href);
    case 'exact':
    default:
      return pathname === item.href;
  }
}

export function isSidebarNavigationItemActive(
  pathname: string,
  item: SidebarNavigationItem,
): boolean {
  if (item.kind === 'route') return isSidebarRouteActive(pathname, item);
  return item.children.some((child) => isSidebarRouteActive(pathname, child));
}

export function getRenderableNavigationItems(
  items: SidebarNavigationItem[],
): SidebarNavigationItem[] {
  return items.filter((item) => item.kind === 'route' || item.children.length > 0);
}

export function validateSidebarNavigationItems(items: SidebarNavigationItem[]): string[] {
  const errors: string[] = [];
  const hrefs = new Set<string>();

  const validateRoute = (item: SidebarRouteItem, indexLabel: string) => {
    if (!item.label.trim()) {
      errors.push(`Route item at index ${indexLabel} must have a non-empty label.`);
    }
    if (!item.href.startsWith('/')) {
      errors.push(`Route item at index ${indexLabel} must use an absolute pathname href.`);
    }
    if (hrefs.has(item.href)) {
      errors.push(`Route href "${item.href}" is duplicated.`);
    } else {
      hrefs.add(item.href);
    }
  };

  items.forEach((item, index) => {
    if (item.kind === 'route') {
      validateRoute(item, String(index));
      return;
    }

    if (!item.id.trim()) {
      errors.push(`Group item at index ${index} must have a stable id.`);
    }
    if (!item.label.trim()) {
      errors.push(`Group item at index ${index} must have a non-empty label.`);
    }
    if (item.children.length === 0) {
      errors.push(`Group item at index ${index} must have at least one child route.`);
    }
    item.children.forEach((child, childIndex) => validateRoute(child, `${index}.${childIndex}`));
  });

  return errors;
}
