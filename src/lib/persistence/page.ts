export interface PageRequest {
  pageIndex?: number;
  pageSize?: number;
}

export interface PageResult<T> {
  items: T[];
  total: number;
  pageIndex: number;
  pageSize: number;
}

export const MAX_PAGE_SIZE = 25;

export function normalizePageRequest(request: PageRequest = {}): Required<PageRequest> {
  const requestedSize = Number.isFinite(request.pageSize) ? Math.floor(request.pageSize!) : MAX_PAGE_SIZE;
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, requestedSize));
  const maxPageIndex = Math.floor(Number.MAX_SAFE_INTEGER / pageSize);
  const requestedIndex = Number.isFinite(request.pageIndex) ? Math.floor(request.pageIndex!) : 0;
  return {
    pageIndex: Math.min(maxPageIndex, Math.max(0, requestedIndex)),
    pageSize,
  };
}
