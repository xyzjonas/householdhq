import { Prisma } from "@prisma/client";
import type { Db } from "./prisma";
import { CategoryInput, CategoryPatch } from "./schemas";
import {
  ConflictError,
  NotFoundError,
  type Category,
  type CategoryWithActivity,
  type MonthlySpend,
} from "./types";

function rethrow(e: unknown, name?: string | null): never {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2002") {
      throw new ConflictError(`Category '${name}' already exists`);
    }
    if (e.code === "P2025") {
      throw new NotFoundError("Category", name ?? "?");
    }
  }
  throw e;
}

export function categoriesRepo(db: Db) {
  return {
    list(): Promise<Category[]> {
      return db.category.findMany({ orderBy: { name: "asc" } });
    },

    /**
     * All categories with the money spent / received in `[from, to)`.
     * Cancelled and pending transactions are ignored; transfers between household
     * accounts are neither spending nor income.
     */
    async listWithActivity(range: {
      from: Date;
      to: Date;
    }): Promise<CategoryWithActivity[]> {
      const base = {
        categoryId: { not: null },
        cancelled: false,
        confirmed: true,
        transactedAt: { gte: range.from, lt: range.to },
      } satisfies Prisma.TransactionWhereInput;
      const totals = async (where: Prisma.TransactionWhereInput) => {
        const rows = await db.transaction.groupBy({
          by: ["categoryId"],
          where: { ...base, ...where },
          _sum: { amount: true },
        });
        return new Map(rows.map((r) => [r.categoryId, r._sum.amount ?? 0]));
      };
      const [categories, spent, received] = await Promise.all([
        db.category.findMany({ orderBy: { name: "asc" } }),
        totals({ source: { isOut: false }, target: { isOut: true } }),
        totals({ source: { isOut: true }, target: { isOut: false } }),
      ]);
      return categories.map((c) => ({
        ...c,
        spent: spent.get(c.id) ?? 0,
        received: received.get(c.id) ?? 0,
      }));
    },

    /**
     * Money spent in a category per calendar month (UTC), zero-filled, for
     * months in `[from, to)`. Without `from` the series starts at the
     * category's first spending. Same definition of "spent" as
     * `listWithActivity`. With `flow: "received"` it sums incoming money
     * instead (reported in the same `spent` field).
     */
    async spendingByMonth(
      id: number,
      range: { from?: Date; to: Date },
      flow: "spent" | "received" = "spent",
    ): Promise<MonthlySpend[]> {
      const outgoing = flow === "spent";
      const rows = await db.transaction.findMany({
        where: {
          categoryId: id,
          cancelled: false,
          confirmed: true,
          source: { isOut: !outgoing },
          target: { isOut: outgoing },
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
    },

    async get(id: number): Promise<Category> {
      const category = await db.category.findUnique({ where: { id } });
      if (!category) throw new NotFoundError("Category", id);
      return category;
    },

    async create(input: CategoryInput): Promise<Category> {
      const data = CategoryInput.parse(input);
      try {
        return await db.category.create({ data });
      } catch (e) {
        rethrow(e, data.name);
      }
    },

    async update(id: number, input: CategoryPatch): Promise<Category> {
      const data = CategoryPatch.parse(input);
      try {
        return await db.category.update({ where: { id }, data });
      } catch (e) {
        rethrow(e, data.name ?? String(id));
      }
    },

    async remove(id: number): Promise<void> {
      try {
        await db.category.delete({ where: { id } });
      } catch (e) {
        rethrow(e, String(id));
      }
    },
  };
}
