import { PatientApplicationError } from '@/lib/application/patients/patient-errors';
import type {
  AccountContext,
  AccountContextRepository,
  AccountContextSnapshot,
} from '@/lib/persistence/account-context';

export function createActiveAccountContext(repository: AccountContextRepository): AccountContext {
  let active: AccountContextSnapshot | null = null;

  return {
    getActive: async () => {
      if (active) return active;
      const account = await repository.getActiveOrCreate();
      active = { accountId: account.id, account };
      return active;
    },
    requireActive: async () => {
      try {
        const snapshot = await (active ? Promise.resolve(active) : repository.getActiveOrCreate().then((account) => ({ accountId: account.id, account })));
        active = snapshot;
        if (!snapshot.accountId) throw new Error('A Conta local não possui identidade.');
        return snapshot;
      } catch (cause) {
        if (cause instanceof PatientApplicationError) throw cause;
        throw new PatientApplicationError('ACCOUNT_CONTEXT_UNAVAILABLE', 'A Conta local não pôde ser carregada.', { cause });
      }
    },
  };
}

export async function getActiveAccount(context: AccountContext): Promise<AccountContextSnapshot> {
  return context.requireActive();
}
