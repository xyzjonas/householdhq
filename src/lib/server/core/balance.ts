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
  const since: Prisma.TransactionWhereInput = {
    cancelled: false,
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
