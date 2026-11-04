import { accountsRepo } from "./accounts";
import { categoriesRepo } from "./categories";
import type { Db } from "./prisma";
import { transactionsRepo } from "./transactions";
import { usersRepo } from "./users";

export { createPrismaClient } from "./prisma";
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
    disconnect: () => db.$disconnect(),
  };
}

export type Core = ReturnType<typeof createCore>;
