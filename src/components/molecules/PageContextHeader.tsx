import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export interface PageContextBreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageContextHeaderProps {
  title: string;
  backHref?: string;
  backLabel: string;
  breadcrumbs: readonly PageContextBreadcrumbItem[];
  actions?: React.ReactNode;
  onBackClick?: () => void;
}

export const PageContextHeader: React.FC<PageContextHeaderProps> = ({
  title,
  backHref,
  backLabel,
  breadcrumbs,
  actions,
  onBackClick,
}) => {
  const ancestorItems = breadcrumbs.slice(0, -1);
  const currentItem = breadcrumbs[breadcrumbs.length - 1];

  const backButtonContent = <ArrowLeft size={16} aria-hidden="true" />;
  const backButtonClasses = "flex h-control-standard w-control-standard shrink-0 items-center justify-center rounded-control border border-border-subtle bg-surface text-text-muted transition-colors hover:border-text-primary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  return (
    <header className="flex min-w-0 flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {onBackClick ? (
          <button
            type="button"
            onClick={onBackClick}
            aria-label={backLabel}
            title={backLabel}
            className={backButtonClasses}
          >
            {backButtonContent}
          </button>
        ) : (
          <Link
            href={backHref || '#'}
            aria-label={backLabel}
            title={backLabel}
            className={backButtonClasses}
          >
            {backButtonContent}
          </Link>
        )}

        <div className="flex min-w-0 flex-col gap-2">
          <Breadcrumb aria-label="Navegação contextual">
            <BreadcrumbList className="min-w-0 flex-nowrap text-style-legal">
              {ancestorItems.map((item) => (
                <React.Fragment key={`${item.label}-${item.href}`}>
                  <BreadcrumbItem className="min-w-0">
                    {item.href ? (
                      <BreadcrumbLink asChild>
                        <Link
                          href={item.href}
                          title={item.label}
                          className="truncate text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          {item.label}
                        </Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage title={item.label}>{item.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </React.Fragment>
              ))}
              {currentItem && (
                <BreadcrumbItem className="min-w-0">
                  <BreadcrumbPage
                    aria-label={currentItem.label}
                    title={currentItem.label}
                    className="max-w-72 truncate"
                  >
                    {currentItem.label}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              )}
            </BreadcrumbList>
          </Breadcrumb>

          <h1 className="truncate text-style-subsection-title font-bold tracking-tight text-text-primary" title={title}>
            {title}
          </h1>
        </div>
      </div>

      {actions ? (
        <div role="group" aria-label="Ações da página" className="flex shrink-0 items-center gap-2">
          {actions}
        </div>
      ) : null}
    </header>
  );
};
