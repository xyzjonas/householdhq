import { balanceOf, roundMoney } from "./balance";
import type { Db } from "./prisma";
import { CheckpointInput } from "./schemas";
import type { settingsRepo } from "./settings";
import {
  ConflictError,
  NotFoundError,
  type AccountState,
  type CheckpointResult,
  type CheckpointSuggestion,
  type TransactionWithRelations,
} from "./types";

export const ADJUSTMENT_DESCRIPTION = "Balance checkpoint adjustment";

export function checkpointsRepo(
  db: Db,
  settings: ReturnType<typeof settingsRepo>,
) {
  async function requireAccount(id: number) {
    const account = await db.source.findUnique({ where: { id } });
    if (!account) throw new NotFoundError("Account", id);
    return account;
  }

  return {
    /**
     * What the balance should be at `asOf` according to the previous
     * checkpoint and the transactions since: the pre-filled checkpoint value.
     */
    async suggest(
      accountId: number,
      asOf: Date = new Date(),
    ): Promise<CheckpointSuggestion> {
      await requireAccount(accountId);
      const [balance, previous] = await Promise.all([
        balanceOf(db, accountId, asOf),
        db.sourceState.findFirst({
          where: { sourceId: accountId, created: { lte: asOf } },
          orderBy: [{ created: "desc" }, { id: "desc" }],
        }),
      ]);
      return { balance: roundMoney(balance), previous };
    },

    list(accountId: number): Promise<AccountState[]> {
      return db.sourceState.findMany({
        where: { sourceId: accountId },
        orderBy: [{ created: "desc" }, { id: "desc" }],
      });
    },

    /**
     * Deletes one of the account's checkpoints. Its manko adjustment stays: it
     * is an ordinary transaction, so the balance keeps adding up without the
     * checkpoint, which only stops being a reconciliation point.
     */
    async remove(accountId: number, id: number): Promise<void> {
      const { count } = await db.sourceState.deleteMany({
        where: { id, sourceId: accountId },
      });
      if (count === 0) throw new NotFoundError("Checkpoint", id);
    },

    /**
     * Freezes the account's balance at `amount`. When that differs from what
     * the transactions add up to, a "manko" transaction in the configured
     * category (see settings) covers the difference, so the journal still
     * explains the balance. Both are written atomically.
     */
    async create(
      accountId: number,
      input: CheckpointInput,
    ): Promise<CheckpointResult> {
      const { amount: rawAmount, at = new Date() } =
        CheckpointInput.parse(input);
      const amount = roundMoney(rawAmount);
      await requireAccount(accountId);
      const { currency, mankoCategoryId, defaultOutAccountId } =
        await settings.get();

      return db.$transaction(async (tx) => {
        const difference = roundMoney(
          amount - (await balanceOf(tx, accountId, at)),
        );

        let adjustment: TransactionWithRelations | null = null;
        if (difference !== 0) {
          // Money the books can't explain comes from / goes to the default
          // out account (any external account if that one is gone).
          const external =
            (defaultOutAccountId
              ? await tx.source.findFirst({
                  where: { id: defaultOutAccountId, isOut: true },
                })
              : null) ??
            (await tx.source.findFirst({
              where: { isOut: true },
              orderBy: [{ position: "asc" }, { id: "asc" }],
            }));
          if (!external) {
            throw new ConflictError(
              "An external (expense) account is needed to record the adjustment",
            );
          }
          const [sourceId, targetId] =
            difference > 0
              ? [external.id, accountId]
              : [accountId, external.id];
          adjustment = await tx.transaction.create({
            data: {
              description: ADJUSTMENT_DESCRIPTION,
              amount: Math.abs(difference),
              currency,
              transactedAt: at,
              confirmed: true,
              source: { connect: { id: sourceId } },
              target: { connect: { id: targetId } },
              category: mankoCategoryId
                ? { connect: { id: mankoCategoryId } }
                : undefined,
            },
            include: { category: true, source: true, target: true, tags: true },
          });
        }

        const checkpoint = await tx.sourceState.create({
          data: { sourceId: accountId, amount, created: at },
        });
        return { checkpoint, adjustment };
      });
    },
  };
}
