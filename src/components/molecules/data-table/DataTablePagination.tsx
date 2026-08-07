import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DataTablePagination as PaginationState } from './types';

export function DataTablePagination({
  pagination,
  pageIndex,
  pageCount,
}: {
  pagination: PaginationState;
  pageIndex: number;
  pageCount: number;
}) {
  const hasPreviousPage = pageIndex > 0;
  const hasNextPage = pageIndex < pageCount - 1;

  return (
    <div className="flex items-center justify-between px-2" aria-label="Paginação da tabela">
      <span className="text-style-legal text-text-muted">
        Página {pageIndex + 1} de {pageCount}
      </span>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="secondary"
          size="compact"
          iconOnly
          aria-label="Primeira página"
          onClick={() => pagination.onPageChange(0)}
          disabled={!hasPreviousPage}
        >
          <ChevronsLeft aria-hidden="true" size={16} />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="compact"
          iconOnly
          aria-label="Página anterior"
          onClick={() => pagination.onPageChange(pageIndex - 1)}
          disabled={!hasPreviousPage}
        >
          <ChevronLeft aria-hidden="true" size={16} />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="compact"
          iconOnly
          aria-label="Próxima página"
          onClick={() => pagination.onPageChange(pageIndex + 1)}
          disabled={!hasNextPage}
        >
          <ChevronRight aria-hidden="true" size={16} />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="compact"
          iconOnly
          aria-label="Última página"
          onClick={() => pagination.onPageChange(pageCount - 1)}
          disabled={!hasNextPage}
        >
          <ChevronsRight aria-hidden="true" size={16} />
        </Button>
      </div>
    </div>
  );
}
