/**
 * Balance projection maths shared by the home endpoints.
 */

export interface FlowTransaction {
  amount: number;
  sourceId: number;
  targetId: number;
}

/**
 * Effect of a transaction on the combined balance of the given accounts:
 * money flowing into them adds, money flowing out subtracts, transfers
 * between two of them cancel out.
 */
export const balanceDelta = (
  transaction: FlowTransaction,
  accountIds: ReadonlySet<number>,
): number => {
  let delta = 0;
  if (accountIds.has(transaction.targetId)) {
    delta += transaction.amount;
  }
  if (accountIds.has(transaction.sourceId)) {
    delta -= transaction.amount;
  }
  return delta;
};

export interface Projection {
  projected: number;
  pendingTotal: number;
  pendingCount: number;
}

/**
 * Projects the balance by applying all pending transactions that happen
 * before `until` (exclusive).
 */
export const projectBalance = <T extends FlowTransaction & { at: Date }>(
  balance: number,
  pending: readonly T[],
  accountIds: ReadonlySet<number>,
  until: Date,
): Projection => {
  const relevant = pending.filter((transaction) => transaction.at < until);
  const pendingTotal = relevant.reduce(
    (sum, transaction) => sum + balanceDelta(transaction, accountIds),
    0,
  );
  return {
    projected: balance + pendingTotal,
    pendingTotal,
    pendingCount: relevant.length,
  };
};
