import type { TransactionRunner } from '@/lib/persistence/transaction-runner';

/**
 * Repository mutations are each executed in a PGlite transaction. The
 * application-level runner keeps the port explicit without nesting PGlite
 * transactions when several repositories are composed by a use case.
 */
export class LocalTransactionRunner implements TransactionRunner {
  async run<T>(operation: () => Promise<T>): Promise<T> {
    return operation();
  }
}
