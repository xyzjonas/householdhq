import type { Db } from "./prisma";

export const DEFAULT_BANK_ACCOUNT = "Bank account";
export const DEFAULT_EXPENSE_ACCOUNT = "Expenses";

/**
 * Creates the two accounts every installation needs when none exist yet:
 *  1. a default bank account
 *  2. the default outgoing "account" that represents expenses
 *     (`Transaction.targetId` defaults to id 2 in the schema)
 * Returns true when accounts were created.
 */
export async function ensureDefaultAccounts(db: Db): Promise<boolean> {
  if ((await db.source.count()) > 0) return false;
  await db.source.create({
    data: {
      name: DEFAULT_BANK_ACCOUNT,
      type: "ACCOUNT",
      isDisponible: true,
      position: 1,
    },
  });
  await db.source.create({
    data: {
      name: DEFAULT_EXPENSE_ACCOUNT,
      type: "OUT",
      isOut: true,
      position: 2,
    },
  });
  return true;
}
