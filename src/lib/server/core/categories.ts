import { m } from "#paraglide/messages.js";
import { Prisma } from "@prisma/client";
import { monthlyFlow, type Flow } from "./flow";
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
      throw new ConflictError(m.core_category_exists({ name: name ?? "?" }));
    }
    if (e.code === "P2025") {
      throw new NotFoundError("Category", name ?? "?");
    }
  }
  throw e;
}

/** How far back "recent" usage looks when ranking categories. */
export const RECENT_USAGE_DAYS = 90;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Order categories by how often they're used: transactions within the recent
 * window first, then all-time transactions, then name. Unused categories end
 * up last, alphabetically.
 */
export function rankCategories<T extends Pick<Category, "id" | "name">>(
  categories: T[],
  recent: ReadonlyMap<number, number>,
  allTime: ReadonlyMap<number, number>,
): T[] {
  return [...categories].sort(
    (a, b) =>
      (recent.get(b.id) ?? 0) - (recent.get(a.id) ?? 0) ||
      (allTime.get(b.id) ?? 0) - (allTime.get(a.id) ?? 0) ||
      a.name.localeCompare(b.name),
  );
}

export function categoriesRepo(db: Db, householdId: number) {
  const counts = async (where: Prisma.TransactionWhereInput) => {
    const rows = await db.transaction.groupBy({
      by: ["categoryId"],
      where: { ...where, categoryId: { not: null } },
      _count: { _all: true },
    });
    return new Map(
      rows.flatMap((r) =>
        r.categoryId === null ? [] : [[r.categoryId, r._count._all] as const],
      ),
    );
  };

  return {
    /** All categories, most used first (see `rankCategories`). */
    async list(): Promise<Category[]> {
      const since = new Date(Date.now() - RECENT_USAGE_DAYS * DAY_MS);
      const [categories, recent, allTime] = await Promise.all([
        db.category.findMany({ orderBy: { name: "asc" } }),
        counts({ transactedAt: { gte: since } }),
        counts({}),
      ]);
      return rankCategories(categories, recent, allTime);
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
     * `listWithActivity`. With `flow: "received"` or `"transferred"` it sums
     * incoming money or money moved between accounts instead (reported in
     * the same `spent` field).
     */
    async spendingByMonth(
      id: number,
      range: { from?: Date; to: Date },
      flow: Flow = "spent",
    ): Promise<MonthlySpend[]> {
      return monthlyFlow(db, { categoryId: id }, range, flow);
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

    /**
     * Delete a category. With `reassignTo`, its transactions (and the manko
     * setting, if it points here) move to that category first, atomically,
     * and `tags` (names, created when new) are added to every moved transaction. With
     * `reassignTo`, categories linked to a vehicle can't be deleted.
     */
    async remove(
      id: number,
      options: { reassignTo?: number; tags?: string[] } = {},
    ): Promise<void> {
      const { reassignTo, tags = [] } = options;
      if (reassignTo === undefined) {
        try {
          await db.category.delete({ where: { id } });
        } catch (e) {
          rethrow(e, String(id));
        }
        return;
      }
      if (reassignTo === id) {
        throw new ConflictError(m.core_category_move_same());
      }
      const [category, target, vehicle] = await Promise.all([
        db.category.findUnique({ where: { id }, select: { id: true } }),
        db.category.findUnique({
          where: { id: reassignTo },
          select: { id: true },
        }),
        db.vehicle.findFirst({
          where: { OR: [{ categoryId: id }, { fuelCategoryId: id }] },
          select: { name: true },
        }),
      ]);
      if (!category) throw new NotFoundError("Category", id);
      if (!target) throw new NotFoundError("Category", reassignTo);
      if (vehicle) {
        throw new ConflictError(
          m.core_category_used_by_vehicle({ name: vehicle.name }),
        );
      }
      await db.$transaction(async (tx) => {
        if (tags.length > 0) {
          const moved = await tx.transaction.findMany({
            where: { categoryId: id },
            select: { id: true },
          });
          for (const name of new Set(tags)) {
            await tx.tag.upsert({
              where: { householdId_name: { householdId, name } },
              create: { name, householdId, transactions: { connect: moved } },
              update: { transactions: { connect: moved } },
            });
          }
        }
        await tx.transaction.updateMany({
          where: { categoryId: id },
          data: { categoryId: reassignTo },
        });
        await tx.appSettings.updateMany({
          where: { mankoCategoryId: id },
          data: { mankoCategoryId: reassignTo },
        });
        await tx.category.delete({ where: { id } });
      });
    },
  };
}
