import { Prisma } from "@prisma/client";
import { shiftCheckpoints } from "./balance";
import type { Db } from "./prisma";
import {
  TransactionFilter,
  TransactionInput,
  TransactionPatch,
  type TransactionFlow,
  type TransactionSort,
  type TransactionStatus,
} from "./schemas";
import {
  ConflictError,
  NotFoundError,
  type Page,
  type TransactionWithRelations,
} from "./types";

const include = {
  category: true,
  source: true,
  target: true,
  tags: true,
} satisfies Prisma.TransactionInclude;

function tagLinks(tags: string[]) {
  return tags.map((name) => ({ where: { name }, create: { name } }));
}

/** Turn free text into a safe MySQL boolean-mode prefix query. */
function toBooleanQuery(query: string): string {
  return query
    .trim()
    .split(/\s+/)
    .map((term) => term.replace(/[+\-<>~*"()@]+/g, "").trim())
    .filter(Boolean)
    .map((term) => `+${term}*`)
    .join(" ");
}

/** `date` moved by whole months, clamped to the end of shorter months. */
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const day = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  const lastDay = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0,
  ).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
}

/**
 * First occurrence of a schedule (`due` plus whole multiples of
 * `everyMonths`) that lies after `now`, so confirming a stale transaction
 * doesn't schedule its successor in the past.
 */
export function nextOccurrence(
  due: Date,
  everyMonths: number,
  now: Date,
): Date {
  let next = addMonths(due, everyMonths);
  for (let n = 2; next <= now; n++) next = addMonths(due, n * everyMonths);
  return next;
}

type Filter = ReturnType<typeof TransactionFilter.parse>;

const flowWhere: Record<TransactionFlow, Prisma.TransactionWhereInput> = {
  spent: { source: { isOut: false }, target: { isOut: true } },
  received: { source: { isOut: true }, target: { isOut: false } },
  transfer: {
    OR: [
      { source: { isOut: false }, target: { isOut: false } },
      { source: { isOut: true }, target: { isOut: true } },
    ],
  },
};

const statusWhere: Record<TransactionStatus, Prisma.TransactionWhereInput> = {
  completed: { cancelled: false, confirmed: true },
  pending: { cancelled: false, confirmed: false },
  cancelled: { cancelled: true },
};

const orderBy: Record<
  TransactionSort,
  Prisma.TransactionOrderByWithRelationInput[]
> = {
  "date-desc": [{ transactedAt: "desc" }, { id: "desc" }],
  "date-asc": [{ transactedAt: "asc" }, { id: "asc" }],
  "amount-desc": [{ amount: "desc" }, { id: "desc" }],
  "amount-asc": [{ amount: "asc" }, { id: "asc" }],
};

export function transactionsRepo(db: Db) {
  function buildWhere(f: Filter): Prisma.TransactionWhereInput {
    const and: Prisma.TransactionWhereInput[] = [];
    if (f.accountId !== undefined) {
      and.push({ OR: [{ sourceId: f.accountId }, { targetId: f.accountId }] });
    }
    if (f.flow) and.push(flowWhere[f.flow]);
    if (f.status) and.push(statusWhere[f.status]);
    return {
      ...(f.from || f.to
        ? { transactedAt: { gte: f.from, lt: f.to } }
        : undefined),
      ...(f.uncategorized
        ? { categoryId: null }
        : f.categoryId !== undefined
          ? { categoryId: f.categoryId }
          : {}),
      ...(f.sourceId !== undefined ? { sourceId: f.sourceId } : {}),
      ...(f.targetId !== undefined ? { targetId: f.targetId } : {}),
      ...(f.important !== undefined ? { isImportant: f.important } : {}),
      ...(f.hidden !== undefined ? { isHidden: f.hidden } : {}),
      ...(f.recurring !== undefined
        ? { recurring: f.recurring ? { gt: 0 } : 0 }
        : {}),
      ...(f.minAmount !== undefined || f.maxAmount !== undefined
        ? { amount: { gte: f.minAmount, lte: f.maxAmount } }
        : {}),
      ...(f.tag ? { tags: { some: { name: f.tag } } } : {}),
      ...(and.length ? { AND: and } : {}),
    };
  }

  /** Ids of every transaction matching the text, best match first. */
  async function searchIds(query: string): Promise<number[]> {
    const q = toBooleanQuery(query);
    if (!q) return [];
    const rows = await db.$queryRaw<Array<{ id: number }>>(Prisma.sql`
      SELECT t.id FROM \`transaction\` t
      WHERE MATCH(t.description) AGAINST (${q} IN BOOLEAN MODE)
      ORDER BY MATCH(t.description) AGAINST (${q} IN BOOLEAN MODE) DESC,
               t.transactedAt DESC, t.id DESC
    `);
    return rows.map((r) => r.id);
  }

  async function listSearch(
    filter: Filter,
    where: Prisma.TransactionWhereInput,
    matches: number[],
  ): Promise<Page<TransactionWithRelations>> {
    const scoped = { AND: [where, { id: { in: matches } }] };
    if (filter.sort) {
      const [items, total] = await Promise.all([
        db.transaction.findMany({
          where: scoped,
          include,
          orderBy: orderBy[filter.sort],
          take: filter.limit,
          skip: filter.offset,
        }),
        db.transaction.count({ where: scoped }),
      ]);
      return { items, total };
    }
    // Relevance order: the match order is the sort, so page in memory.
    const eligible = new Set(
      (
        await db.transaction.findMany({
          where: scoped,
          select: { id: true },
        })
      ).map((t) => t.id),
    );
    const ranked = matches.filter((id) => eligible.has(id));
    const ids = ranked.slice(filter.offset, filter.offset + filter.limit);
    const found = await db.transaction.findMany({
      where: { id: { in: ids } },
      include,
    });
    const byId = new Map(found.map((t) => [t.id, t]));
    return {
      items: ids.flatMap((id) => byId.get(id) ?? []),
      total: ranked.length,
    };
  }

  return {
    async list(
      input: TransactionFilter = {},
    ): Promise<Page<TransactionWithRelations>> {
      const filter = TransactionFilter.parse(input);
      const where = buildWhere(filter);

      if (filter.search) {
        const matches = await searchIds(filter.search);
        if (!matches.length) return { items: [], total: 0 };
        return listSearch(filter, where, matches);
      }

      const [items, total] = await Promise.all([
        db.transaction.findMany({
          where,
          include,
          orderBy: orderBy[filter.sort ?? "date-desc"],
          take: filter.limit,
          skip: filter.offset,
        }),
        db.transaction.count({ where }),
      ]);
      return { items, total };
    },

    /** Names of all tags in use, for filter menus. */
    async tags(): Promise<string[]> {
      const tags = await db.tag.findMany({
        select: { name: true },
        orderBy: { name: "asc" },
      });
      return tags.map((t) => t.name);
    },

    /**
     * Transactions still to happen: everything pending that is due before
     * `before`, soonest first. Overdue ones stay until they are confirmed;
     * cancelled ones are left out.
     */
    async upcoming(before: Date): Promise<TransactionWithRelations[]> {
      return db.transaction.findMany({
        where: {
          cancelled: false,
          confirmed: false,
          transactedAt: { lt: before },
        },
        include,
        orderBy: [{ transactedAt: "asc" }, { id: "asc" }],
      });
    },

    async get(id: number): Promise<TransactionWithRelations> {
      const tx = await db.transaction.findUnique({ where: { id }, include });
      if (!tx) throw new NotFoundError("Transaction", id);
      return tx;
    },

    async create(input: TransactionInput): Promise<TransactionWithRelations> {
      return (await this.createScheduled(input)).transaction;
    },

    /**
     * Like `create`, but also reports the upcoming occurrence that got
     * scheduled when a recurring transaction was recorded as already happened.
     */
    async createScheduled(input: TransactionInput): Promise<{
      transaction: TransactionWithRelations;
      next: TransactionWithRelations | null;
    }> {
      const { tags, categoryId, sourceId, targetId, transactedAt, ...data } =
        TransactionInput.parse(input);
      const now = new Date();
      const when = transactedAt ?? now;
      const row = (at: Date) => ({
        ...data,
        transactedAt: at,
        confirmed: at <= now,
        source: { connect: { id: sourceId } },
        target: { connect: { id: targetId } },
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        tags: { connectOrCreate: tagLinks(tags) },
      });
      if (data.recurring > 0 && when <= now) {
        const at = nextOccurrence(when, data.recurring, now);
        return db.$transaction(async (tx) => ({
          transaction: await tx.transaction.create({
            data: row(when),
            include,
          }),
          next: await tx.transaction.create({ data: row(at), include }),
        }));
      }
      return {
        transaction: await db.transaction.create({
          data: row(when),
          include,
        }),
        next: null,
      };
    },

    async update(
      id: number,
      input: TransactionPatch,
    ): Promise<TransactionWithRelations> {
      const { tags, categoryId, sourceId, targetId, transactedAt, ...data } =
        TransactionPatch.parse(input);
      try {
        // The edit and the checkpoint corrections land together or not at all.
        return await db.$transaction(async (tx) => {
          const before = await tx.transaction.findUniqueOrThrow({
            where: { id },
          });
          const updated = await tx.transaction.update({
            where: { id },
            data: {
              ...data,
              // Moving a completed transaction into the future makes it
              // pending again; a pending one never completes by date alone.
              ...(transactedAt
                ? {
                    transactedAt,
                    confirmed: before.confirmed && transactedAt <= new Date(),
                  }
                : {}),
              ...(sourceId ? { source: { connect: { id: sourceId } } } : {}),
              ...(targetId ? { target: { connect: { id: targetId } } } : {}),
              ...(categoryId !== undefined
                ? {
                    category: categoryId
                      ? { connect: { id: categoryId } }
                      : { disconnect: true },
                  }
                : {}),
              ...(tags
                ? { tags: { set: [], connectOrCreate: tagLinks(tags) } }
                : {}),
            },
            include,
          });
          await shiftCheckpoints(tx, before, updated);
          return updated;
        });
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2025"
        ) {
          throw new NotFoundError("Transaction", id);
        }
        throw e;
      }
    },

    /**
     * Completes a pending transaction that has come due: it is stamped with
     * the moment of confirmation and starts counting towards balances and
     * spending. A recurring one schedules its next occurrence, counted from
     * the date it was due.
     */
    async confirm(id: number): Promise<TransactionWithRelations> {
      try {
        return await db.$transaction(async (tx) => {
          const before = await tx.transaction.findUniqueOrThrow({
            where: { id },
            include: { tags: true },
          });
          if (before.cancelled) {
            throw new ConflictError(
              "A cancelled transaction can't be confirmed",
            );
          }
          if (before.confirmed) {
            throw new ConflictError("This transaction is already confirmed");
          }
          const due = before.transactedAt ?? before.created;
          const now = new Date();
          if (due > now) {
            throw new ConflictError("This transaction is not due yet");
          }
          const updated = await tx.transaction.update({
            where: { id },
            data: { transactedAt: now, confirmed: true },
            include,
          });
          await shiftCheckpoints(tx, before, updated);
          if (before.recurring > 0) {
            await tx.transaction.create({
              data: {
                description: before.description,
                amount: before.amount,
                currency: before.currency,
                recurring: before.recurring,
                isImportant: before.isImportant,
                isHidden: before.isHidden,
                transactedAt: nextOccurrence(due, before.recurring, now),
                confirmed: false,
                source: { connect: { id: before.sourceId } },
                target: { connect: { id: before.targetId } },
                category: before.categoryId
                  ? { connect: { id: before.categoryId } }
                  : undefined,
                tags: {
                  connectOrCreate: tagLinks(before.tags.map((t) => t.name)),
                },
              },
            });
          }
          return updated;
        });
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2025"
        ) {
          throw new NotFoundError("Transaction", id);
        }
        throw e;
      }
    },

    async remove(id: number): Promise<void> {
      // Fuel and service entries own their transaction: removing it alone
      // would leave the entry without its cost.
      const owner = await db.transaction.findUnique({
        where: { id },
        select: {
          fuelEntry: { select: { vehicleId: true } },
          serviceEntry: { select: { vehicleId: true } },
        },
      });
      if (owner?.fuelEntry || owner?.serviceEntry) {
        throw new ConflictError(
          "This transaction belongs to a vehicle entry; delete the entry on the vehicle page instead",
        );
      }
      try {
        await db.transaction.delete({ where: { id } });
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2025"
        ) {
          throw new NotFoundError("Transaction", id);
        }
        throw e;
      }
    },
  };
}
