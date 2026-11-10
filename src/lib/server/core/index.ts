import { accountsRepo } from "./accounts";
import { ensureDefaultAccounts } from "./bootstrap";
import { categoriesRepo } from "./categories";
import { checkpointsRepo } from "./checkpoints";
import { householdsRepo } from "./households";
import type { Db, RawDb } from "./prisma";
import { ledgerRepo } from "./ledger";
import { metersRepo } from "./meters";
import { scopeToHousehold } from "./scope";
import { sessionsRepo } from "./sessions";
import { settingsRepo } from "./settings";
import { tagsRepo } from "./tags";
import { transactionsRepo } from "./transactions";
import { usersRepo } from "./users";
import { vehiclesRepo } from "./vehicles";
import type { Household } from "./types";
import type { HouseholdInput } from "./schemas";

export { createPrismaClient } from "./prisma";
export { DEFAULT_BANK_ACCOUNT, DEFAULT_EXPENSE_ACCOUNT } from "./bootstrap";
export { pickActiveHousehold } from "./households";
export { SESSION_TTL_MS } from "./sessions";
export { FALLBACK_CATEGORY } from "./settings";
export * from "./schemas";
export * from "./types";

/**
 * Everything one household owns, bound to that household: every read and
 * write below can only ever see and touch its rows. Obtained through
 * `core.forHousehold`, after the caller has verified the user is a member.
 */
export function createHouseholdCore(db: Db, householdId: number) {
  const transactions = transactionsRepo(db, householdId);
  const settings = settingsRepo(db, householdId);
  return {
    householdId,
    accounts: accountsRepo(db),
    categories: categoriesRepo(db, householdId),
    /** Free-form labels, orthogonal to categories, many per transaction. */
    tags: tagsRepo(db),
    transactions,
    /** Account journals: transactions interleaved with balance checkpoints. */
    ledger: ledgerRepo(db, transactions),
    /** Balance checkpoints (frozen balances) and their adjustments. */
    checkpoints: checkpointsRepo(db, settings),
    /** Vehicles with their fuel and service journals and service components. */
    vehicles: vehiclesRepo(db, settings),
    /** Utility meters (electricity, water, …) and their readings. */
    meters: metersRepo(db),
    settings,
    /** Creates the default accounts, but only while the household has none. */
    ensureDefaults: () => ensureDefaultAccounts(db),
  };
}

export type HouseholdCore = ReturnType<typeof createHouseholdCore>;

/**
 * The core layer: the only API the rest of the app (pages, endpoints, jobs)
 * uses to read and write data. Nothing outside `core/` touches Prisma.
 *
 * Data is multi-tenant. This object only has the global parts (users,
 * sessions, households and their members); everything a household owns is
 * reachable solely through `forHousehold(id)`.
 */
export function createCore(db: RawDb) {
  const scopes = new Map<number, HouseholdCore>();
  const forHousehold = (id: number): HouseholdCore => {
    let scoped = scopes.get(id);
    if (!scoped) {
      scoped = createHouseholdCore(scopeToHousehold(db, id), id);
      scopes.set(id, scoped);
    }
    return scoped;
  };
  const households = householdsRepo(db);

  return {
    /**
     * The data of one household. Callers must have checked that the user may
     * enter it (`households.isMember` / `households.forUser`).
     */
    forHousehold,
    users: usersRepo(db),
    sessions: sessionsRepo(db),
    households: {
      ...households,
      /** Creates a household with its default accounts. */
      async create(input: HouseholdInput): Promise<Household> {
        const household = await households.create(input);
        await forHousehold(household.id).ensureDefaults();
        return household;
      },
    },
    disconnect: () => db.$disconnect(),
  };
}

export type Core = ReturnType<typeof createCore>;
