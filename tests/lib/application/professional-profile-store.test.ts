import { describe, expect, it, vi } from 'vitest';
import { createProfessionalProfileStore } from '@/lib/application/professional-profile-store';
import { clinicLogo } from '../../fixtures/clinic-logo';

const profile = { firstName: 'Ana', lastName: 'Souza', averagePatientsPerMonth: 40, experience: { kind: 'years', value: 5 } };
const csrfToken = 'A'.repeat(43);

describe('professional profile settings persistence', () => {
  it('keeps preferences and logo after a save and a fresh load', async () => {
    let persisted: object = profile;
    const fetcher = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
      if (url === '/api/auth/csrf') return Response.json({ csrfToken });
      if (init?.method === 'PUT') {
        const { csrfToken: _csrf, ...input } = JSON.parse(init.body as string);
        persisted = input;
      }
      return Response.json({ profile: persisted, accountEmail: 'ana@example.invalid' });
    });
    const store = createProfessionalProfileStore(fetcher);
    await store.load();
    await store.save({ ...store.getSnapshot().profile!, agendaRemindersEnabled: false, documentLogo: clinicLogo });
    const reopened = createProfessionalProfileStore(fetcher);
    await reopened.load();
    expect(reopened.getSnapshot().profile).toMatchObject({ agendaRemindersEnabled: false, documentLogo: clinicLogo });
  });

  it('requests recovery for the loaded login email with a validated CSRF token', async () => {
    const fetcher = vi.fn(async (url: RequestInfo | URL) => {
      if (url === '/api/profile') return Response.json({ profile, accountEmail: 'ana@example.invalid' });
      if (url === '/api/auth/csrf') return Response.json({ csrfToken });
      return new Response(null, { status: 202 });
    });
    const store = createProfessionalProfileStore(fetcher);
    await store.load();
    await store.requestPasswordReset();
    expect(fetcher).toHaveBeenCalledWith('/api/auth/recovery', expect.objectContaining({
      method: 'POST', credentials: 'same-origin', body: JSON.stringify({ email: 'ana@example.invalid', csrfToken }),
    }));
  });

  it('does not send recovery without a known email or a valid CSRF response', async () => {
    const fetcher = vi.fn(async (url: RequestInfo | URL) => url === '/api/profile'
      ? Response.json({ profile, accountEmail: 'ana@example.invalid' })
      : Response.json({ csrfToken: 'invalid' }));
    const store = createProfessionalProfileStore(fetcher);
    await expect(store.requestPasswordReset()).rejects.toThrow('e-mail da conta');
    expect(fetcher).not.toHaveBeenCalled();
    await store.load();
    await expect(store.requestPasswordReset()).rejects.toThrow('operação protegida');
    expect(fetcher).not.toHaveBeenCalledWith('/api/auth/recovery', expect.anything());
  });

  it.each([429, 503])('surfaces recovery failure for HTTP %s', async (status) => {
    const store = createProfessionalProfileStore(vi.fn(async (url: RequestInfo | URL) => {
      if (url === '/api/profile') return Response.json({ profile, accountEmail: 'ana@example.invalid' });
      if (url === '/api/auth/csrf') return Response.json({ csrfToken });
      return new Response(null, { status });
    }));
    await store.load();
    await expect(store.requestPasswordReset()).rejects.toThrow(status === 429 ? 'Muitas tentativas' : 'Tente novamente');
  });
});
