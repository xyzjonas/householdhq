import { Prisma } from "@prisma/client";
import type { Db } from "./prisma";
import {
  TransactionFilter,
  TransactionInput,
  TransactionPatch,
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

export function transactionsRepo(db: Db) {
  function buildWhere(
    f: ReturnType<typeof TransactionFilter.parse>,
  ): Prisma.TransactionWhereInput {
    return {
      ...(f.from || f.to
        ? { transactedAt: { gte: f.from, lt: f.to } }
        : undefined),
      ...(f.categoryId !== undefined ? { categoryId: f.categoryId } : {}),
      ...(f.important !== undefined ? { isImportant: f.important } : {}),
      ...(f.accountId !== undefined
        ? {
            OR: [{ sourceId: f.accountId }, { targetId: f.accountId }],
          }
        : {}),
    };
  }

  async function searchIds(
    query: string,
    f: ReturnType<typeof TransactionFilter.parse>,
  ): Promise<number[]> {
    const q = toBooleanQuery(query);
    if (!q) return [];
    const where: Prisma.Sql[] = [
      Prisma.sql`MATCH(t.description) AGAINST (${q} IN BOOLEAN MODE)`,
    ];
    if (f.important !== undefined) {
      where.push(Prisma.sql`t.isImportant = ${f.important}`);
    }
    if (f.categoryId !== undefined) {
      where.push(Prisma.sql`t.categoryId = ${f.categoryId}`);
    }
    const rows = await db.$queryRaw<Array<{ id: number }>>(Prisma.sql`
      SELECT t.id FROM \`transaction\` t
      WHERE ${Prisma.join(where, " AND ")}
      ORDER BY MATCH(t.description) AGAINST (${q} IN BOOLEAN MODE) DESC,
               t.transactedAt DESC, t.id DESC
      LIMIT ${f.limit} OFFSET ${f.offset}
    `);
    return rows.map((r) => r.id);
  }

  return {
    async list(
      input: TransactionFilter = {},
    ): Promise<Page<TransactionWithRelations>> {
      const filter = TransactionFilter.parse(input);

      if (filter.search) {
        const ids = await searchIds(filter.search, filter);
        const found = await db.transaction.findMany({
          where: { id: { in: ids } },
          include,
        });
        const byId = new Map(found.map((t) => [t.id, t]));
        const items = ids.flatMap((id) => byId.get(id) ?? []);
        return { items, total: items.length };
      }

      const where = buildWhere(filter);
      const [items, total] = await Promise.all([
        db.transaction.findMany({
          where,
          include,
          orderBy: [{ transactedAt: "desc" }, { id: "desc" }],
          take: filter.limit,
          skip: filter.offset,
        }),
        db.transaction.count({ where }),
      ]);
      return { items, total };
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
