import type { TransactionWithRelations } from "#lib/server/core/types.ts";

/**
 * How a transaction changes the liquid (available to spend) balance:
 * negative when money leaves liquid accounts, positive when it arrives.
 * Moves between two liquid accounts (or none) are neutral.
 */
export function liquidImpact(t: TransactionWithRelations): number {
  const fromLiquid = t.source.isDisponible && !t.source.isOut;
  const toLiquid = t.target.isDisponible && !t.target.isOut;
  if (fromLiquid === toLiquid) return 0;
  return toLiquid ? t.amount : -t.amount;
}

/** Current liquid balance after everything upcoming has been settled. */
export function availableToSpend(
  liquid: number,
  upcoming: TransactionWithRelations[],
): number {
  return upcoming.reduce((sum, t) => sum + liquidImpact(t), liquid);
}
