import { accountsRepo } from "./accounts";
import { ensureDefaultAccounts } from "./bootstrap";
import { categoriesRepo } from "./categories";
import { checkpointsRepo } from "./checkpoints";
import type { Db } from "./prisma";
import { ledgerRepo } from "./ledger";
import { metersRepo } from "./meters";
import { sessionsRepo } from "./sessions";
import { settingsRepo } from "./settings";
import { transactionsRepo } from "./transactions";
import { usersRepo } from "./users";
import { vehiclesRepo } from "./vehicles";

export { createPrismaClient } from "./prisma";
export { DEFAULT_BANK_ACCOUNT, DEFAULT_EXPENSE_ACCOUNT } from "./bootstrap";
export { SESSION_TTL_MS } from "./sessions";
export { FALLBACK_CATEGORY } from "./settings";
export * from "./schemas";
export * from "./types";

/**
 * The core layer: the only API the rest of the app (pages, endpoints, jobs)
 * uses to read and write data. Nothing outside `core/` touches Prisma.
 */
export function createCore(db: Db) {
  const transactions = transactionsRepo(db);
  const settings = settingsRepo(db);
  return {
    accounts: accountsRepo(db),
    categories: categoriesRepo(db),
    transactions,
    /** Account journals: transactions interleaved with balance checkpoints. */
    ledger: ledgerRepo(db, transactions),
    /** Balance checkpoints (frozen balances) and their adjustments. */
    checkpoints: checkpointsRepo(db, settings),
    /** Vehicles with their fuel and service journals and service components. */
    vehicles: vehiclesRepo(db, settings),
    /** Utility meters (electricity, water, …) and their readings. */
    meters: metersRepo(db),
    users: usersRepo(db),
    sessions: sessionsRepo(db),
    settings,
    /** Creates the default accounts, but only on a database without any accounts. */
    ensureDefaults: () => ensureDefaultAccounts(db),
    disconnect: () => db.$disconnect(),
  };
}

export type Core = ReturnType<typeof createCore>;
