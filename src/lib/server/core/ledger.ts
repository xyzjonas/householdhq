import type { Db } from "./prisma";
import { TransactionFilter } from "./schemas";
import type { transactionsRepo } from "./transactions";
import type {
  AccountState,
  LedgerEntry,
  Page,
  TransactionWithRelations,
} from "./types";

/** Filters that make a transaction-only match, so checkpoints can't qualify. */
const narrowingFilters = [
  "categoryId",
  "uncategorized",
  "sourceId",
  "targetId",
  "flow",
  "status",
  "important",
  "recurring",
  "hidden",
  "minAmount",
  "maxAmount",
  "tag",
  "search",
] as const;

function asTransactionEntry(t: TransactionWithRelations): LedgerEntry {
  return {
    kind: "transaction",
    at: t.transactedAt ?? t.created,
    transaction: t,
  };
}

/**
 * Fills one page of the merged journal. `positions[i]` is where checkpoint `i`
 * sits in the full merged order; transactions fill every other slot.
 * `transactions` must start at the first transaction slot of the page.
 */
export function placeCheckpoints(
  checkpoints: AccountState[],
  positions: number[],
  transactions: TransactionWithRelations[],
  offset: number,
  limit: number,
): LedgerEntry[] {
  const atSlot = new Map<number, AccountState>();
  checkpoints.forEach((c, i) => atSlot.set(positions[i], c));
  const entries: LedgerEntry[] = [];
  let next = 0;
  for (let slot = offset; slot < offset + limit; slot++) {
    const checkpoint = atSlot.get(slot);
    if (checkpoint) {
      entries.push({ kind: "checkpoint", at: checkpoint.created, checkpoint });
    } else if (next < transactions.length) {
      entries.push(asTransactionEntry(transactions[next++]));
    } else {
      break;
    }
  }
  return entries;
}

export function ledgerRepo(
  db: Db,
  transactions: ReturnType<typeof transactionsRepo>,
) {
  return {
    /**
     * The account's journal: its transactions with its balance checkpoints
     * interleaved by timestamp (a checkpoint sorts after transactions sharing
     * its timestamp, as it includes them). Checkpoints are left out of
     * filtered views that cannot match them (category, search, ...) and of
     * non-date sorts.
     */
    async forAccount(
      accountId: number,
      input: TransactionFilter = {},
    ): Promise<Page<LedgerEntry>> {
      const filter = TransactionFilter.parse({ ...input, accountId });
      const sort = filter.sort ?? "date-desc";
      const withCheckpoints =
        (sort === "date-desc" || sort === "date-asc") &&
        narrowingFilters.every((key) => filter[key] === undefined);

      if (!withCheckpoints) {
        const page = await transactions.list(filter);
        return { total: page.total, items: page.items.map(asTransactionEntry) };
      }

      const ascending = sort === "date-asc";
      const checkpoints = await db.sourceState.findMany({
        where: {
          sourceId: accountId,
          created: { gte: filter.from, lt: filter.to },
        },
        orderBy: [{ created: ascending ? "asc" : "desc" }, { id: "asc" }],
      });

      // The transactions ahead of a checkpoint decide where it lands.
      const ahead = await Promise.all(
        checkpoints.map(async ({ created }) => {
          const justAfter = new Date(created.getTime() + 1);
          const bound = ascending
            ? { to: filter.to && filter.to < justAfter ? filter.to : justAfter }
            : {
                from:
                  filter.from && filter.from > justAfter
                    ? filter.from
                    : justAfter,
              };
          const page = await transactions.list({
            ...filter,
            ...bound,
            limit: 1,
            offset: 0,
          });
          return page.total;
        }),
      );
      const positions = ahead.map((count, i) => count + i);

      const before = positions.filter((p) => p < filter.offset).length;
      const inPage = positions.filter(
        (p) => p >= filter.offset && p < filter.offset + filter.limit,
      ).length;
      const wanted = filter.limit - inPage;
      const page = await transactions.list({
        ...filter,
        offset: filter.offset - before,
        limit: Math.max(wanted, 1),
      });

      return {
        total: page.total + checkpoints.length,
        items: placeCheckpoints(
          checkpoints,
          positions,
          page.items.slice(0, wanted),
          filter.offset,
          filter.limit,
        ),
      };
    },
  };
}
