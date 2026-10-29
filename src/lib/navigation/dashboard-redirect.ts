export type PageSearchParams = Record<string, string | string[] | undefined>;

export function getDashboardRedirectUrl(searchParams: PageSearchParams): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    for (const entry of Array.isArray(value) ? value : [value]) {
      if (entry !== undefined) query.append(key, entry);
    }
  }
  const serialized = query.toString();
  return serialized ? `/dashboard?${serialized}` : '/dashboard';
}
