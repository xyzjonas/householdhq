import type { Prisma } from "@prisma/client";
import type { Db } from "./prisma";
import type { MonthlySpend } from "./types";

export type Flow = "spent" | "received" | "transferred";

/** Same split as `flowOf` on the client. */
function direction(flow: Flow): Prisma.TransactionWhereInput {
  return flow === "transferred"
    ? {
        OR: [
          { source: { isOut: false }, target: { isOut: false } },
          { source: { isOut: true }, target: { isOut: true } },
        ],
      }
    : {
        source: { isOut: flow === "received" },
        target: { isOut: flow === "spent" },
      };
}

/**
 * Money moved per calendar month (UTC) by the transactions matching `where`,
 * zero-filled, for months in `[from, to)`. Without `from` the series starts
 * at the first matching transaction. Cancelled and pending transactions are
 * ignored; the amounts land in the `spent` field whatever the flow.
 */
export async function monthlyFlow(
  db: Db,
  where: Prisma.TransactionWhereInput,
  range: { from?: Date; to: Date },
  flow: Flow,
): Promise<MonthlySpend[]> {
  const rows = await db.transaction.findMany({
    where: {
      ...where,
      cancelled: false,
      confirmed: true,
      ...direction(flow),
      transactedAt: { gte: range.from, lt: range.to },
    },
    select: { amount: true, transactedAt: true },
  });
  const key = (d: Date) => d.getUTCFullYear() * 12 + d.getUTCMonth();
  const sums = new Map<number, number>();
  for (const r of rows) {
    if (!r.transactedAt) continue;
    sums.set(
      key(r.transactedAt),
      (sums.get(key(r.transactedAt)) ?? 0) + r.amount,
    );
  }
  const start = range.from
    ? key(range.from)
    : Math.min(...sums.keys(), key(range.to) - 1);
  const months: MonthlySpend[] = [];
  for (let k = start; k < key(range.to); k++) {
    months.push({
      monthStart: new Date(Date.UTC(Math.floor(k / 12), k % 12, 1)),
      spent: sums.get(k) ?? 0,
    });
  }
  return months;
}
