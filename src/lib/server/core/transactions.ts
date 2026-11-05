import { Prisma } from "@prisma/client";
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
     * Scheduled transactions still to happen: after `after` and before
     * `before`, soonest first. Cancelled ones are left out.
     */
    async upcoming(
      after: Date,
      before: Date,
    ): Promise<TransactionWithRelations[]> {
      return db.transaction.findMany({
        where: {
          cancelled: false,
          transactedAt: { gt: after, lt: before },
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
      const { tags, categoryId, sourceId, targetId, transactedAt, ...data } =
        TransactionInput.parse(input);
      const when = transactedAt ?? new Date();
      return db.transaction.create({
        data: {
          ...data,
          transactedAt: when,
          confirmed: when <= new Date(),
          source: { connect: { id: sourceId } },
          target: { connect: { id: targetId } },
          category: categoryId ? { connect: { id: categoryId } } : undefined,
          tags: { connectOrCreate: tagLinks(tags) },
        },
        include,
      });
    },

    async update(
      id: number,
      input: TransactionPatch,
    ): Promise<TransactionWithRelations> {
      const { tags, categoryId, sourceId, targetId, transactedAt, ...data } =
        TransactionPatch.parse(input);
      try {
        return await db.transaction.update({
          where: { id },
          data: {
            ...data,
            ...(transactedAt
              ? { transactedAt, confirmed: transactedAt <= new Date() }
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
