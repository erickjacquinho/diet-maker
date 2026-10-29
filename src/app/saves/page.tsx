import { redirect } from 'next/navigation';
import { getDashboardRedirectUrl } from '@/lib/navigation/dashboard-redirect';

export default async function SavesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  redirect(getDashboardRedirectUrl(await searchParams));
}
