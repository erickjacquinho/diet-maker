import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  redirect: (destination: string) => { throw new Error(`NEXT_REDIRECT:${destination}`); },
}));

import HomePage from '@/app/home/page';
import SavesPage from '@/app/saves/page';

type LegacyPage = (props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) => Promise<unknown>;

describe('legacy route redirects', () => {
  it('redirects /home to the dashboard and preserves repeated query parameters', async () => {
    await expect((HomePage as unknown as LegacyPage)({ searchParams: Promise.resolve({ source: 'email', view: ['files', 'recent'] }) }))
      .rejects.toThrow('NEXT_REDIRECT:/dashboard?source=email&view=files&view=recent');
  });

  it('redirects /saves to the dashboard and preserves its query parameters', async () => {
    await expect((SavesPage as unknown as LegacyPage)({ searchParams: Promise.resolve({ saveId: 'saved-id', source: 'old-link' }) }))
      .rejects.toThrow('NEXT_REDIRECT:/dashboard?saveId=saved-id&source=old-link');
  });
});
