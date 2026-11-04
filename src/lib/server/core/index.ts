import { accountsRepo } from "./accounts";
import { ensureDefaultAccounts } from "./bootstrap";
import { categoriesRepo } from "./categories";
import type { Db } from "./prisma";
import { sessionsRepo } from "./sessions";
import { transactionsRepo } from "./transactions";
import { usersRepo } from "./users";

export { createPrismaClient } from "./prisma";
export { DEFAULT_BANK_ACCOUNT, DEFAULT_EXPENSE_ACCOUNT } from "./bootstrap";
export { SESSION_TTL_MS } from "./sessions";
export * from "./schemas";
export * from "./types";

/**
 * The core layer: the only API the rest of the app (pages, endpoints, jobs)
 * uses to read and write data. Nothing outside `core/` touches Prisma.
 */
export function createCore(db: Db) {
  return {
    accounts: accountsRepo(db),
    categories: categoriesRepo(db),
    transactions: transactionsRepo(db),
    users: usersRepo(db),
    sessions: sessionsRepo(db),
    /** Idempotent first-run setup of the default accounts. */
    ensureDefaults: () => ensureDefaultAccounts(db),
    disconnect: () => db.$disconnect(),
  };
}

export type Core = ReturnType<typeof createCore>;
