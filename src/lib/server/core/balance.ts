import type { Prisma } from "@prisma/client";

/** Anything that can read balances: the Prisma client or a transaction of it. */
export type BalanceReader = Pick<
  Prisma.TransactionClient,
  "sourceState" | "transaction"
>;

/**
 * The one rule every balance in the app derives from (account lists, pillars,
 * net worth, available-to-spend, trajectories, checkpoint suggestions):
 *
 *   balance(asOf) = latest checkpoint at or before `asOf`
 *                   + non-cancelled transactions strictly after it, up to `asOf`
 *                     (incoming minus outgoing)
 *
 * Pending transactions (not yet confirmed) have not happened, however overdue
 * they are, so they only count when `asOf` lies in the future, as a
 * projection of what is scheduled.
 *
 * A checkpoint is the balance *after* everything that happened up to its own
 * timestamp, so transactions sharing that timestamp (like the adjustment
 * created together with it) are already part of the checkpoint's amount.
 * Without a checkpoint all transactions up to `asOf` count.
 */
export async function balanceOf(
  db: BalanceReader,
  accountId: number,
  asOf: Date = new Date(),
): Promise<number> {
  const checkpoint = await db.sourceState.findFirst({
    where: { sourceId: accountId, created: { lte: asOf } },
    orderBy: [{ created: "desc" }, { id: "desc" }],
  });
  const projecting = asOf > new Date();
  const since: Prisma.TransactionWhereInput = {
    cancelled: false,
    ...(projecting ? {} : { confirmed: true }),
    transactedAt: checkpoint
      ? { gt: checkpoint.created, lte: asOf }
      : { lte: asOf },
  };
  const [incoming, outgoing] = await Promise.all([
    db.transaction.aggregate({
      _sum: { amount: true },
      where: { ...since, targetId: accountId },
    }),
    db.transaction.aggregate({
      _sum: { amount: true },
      where: { ...since, sourceId: accountId },
    }),
  ]);
  return (
    (checkpoint?.amount ?? 0) +
    (incoming._sum.amount ?? 0) -
    (outgoing._sum.amount ?? 0)
  );
}

/** Currency amounts are kept to cents so float noise never becomes a "diff". */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** The parts of a transaction that decide how it moves account balances. */
export type BalanceEffect = {
  amount: number;
  sourceId: number;
  targetId: number;
  transactedAt: Date | null;
  cancelled: boolean;
  confirmed: boolean;
};

/** Anything that can move checkpoints: the Prisma client or a transaction of it. */
export type CheckpointWriter = Pick<Prisma.TransactionClient, "sourceState">;

/** How `t` changes `accountId`'s balance as captured by a checkpoint at `at`. */
function effectOn(t: BalanceEffect, accountId: number, at: Date): number {
  // Mirrors balanceOf: only dated, confirmed, non-cancelled transactions up to
  // the checkpoint's timestamp are part of its amount.
  if (t.cancelled || !t.confirmed || !t.transactedAt || t.transactedAt > at)
    return 0;
  return (
    (t.targetId === accountId ? t.amount : 0) -
    (t.sourceId === accountId ? t.amount : 0)
  );
}

/**
 * Keeps checkpoints truthful when a transaction changes. A checkpoint freezes
 * the balance after everything up to its timestamp, so when a transaction at
 * or before it changes (amount, accounts, date), every checkpoint of the
 * accounts involved - before and after the change - is moved by the
 * difference. Later transactions then keep building on the right balance.
 */
export async function shiftCheckpoints(
  db: CheckpointWriter,
  before: BalanceEffect,
  after: BalanceEffect,
): Promise<void> {
  const accountIds = new Set([
    before.sourceId,
    before.targetId,
    after.sourceId,
    after.targetId,
  ]);
  for (const sourceId of accountIds) {
    const checkpoints = await db.sourceState.findMany({ where: { sourceId } });
    for (const { id, created, amount } of checkpoints) {
      const delta = roundMoney(
        effectOn(after, sourceId, created) -
          effectOn(before, sourceId, created),
      );
      if (delta !== 0) {
        await db.sourceState.update({
          where: { id },
          data: { amount: roundMoney(amount + delta) },
        });
      }
    }
  }
}
