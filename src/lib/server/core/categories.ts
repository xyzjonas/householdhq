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
     * and `tagId` additionally tags every moved transaction. With
     * `reassignTo`, categories linked to a vehicle can't be deleted.
     */
    async remove(
      id: number,
      options: { reassignTo?: number; tagId?: number } = {},
    ): Promise<void> {
      const { reassignTo, tagId } = options;
      if (reassignTo === undefined) {
        try {
          await db.category.delete({ where: { id } });
        } catch (e) {
          rethrow(e, String(id));
        }
        return;
      }
      if (reassignTo === id) {
        throw new ConflictError("Choose a different category to move to");
      }
      const [category, target, tag, vehicle] = await Promise.all([
        db.category.findUnique({ where: { id }, select: { id: true } }),
        db.category.findUnique({
          where: { id: reassignTo },
          select: { id: true },
        }),
        tagId === undefined
          ? null
          : db.tag.findUnique({ where: { id: tagId }, select: { id: true } }),
        db.vehicle.findFirst({
          where: { OR: [{ categoryId: id }, { fuelCategoryId: id }] },
          select: { name: true },
        }),
      ]);
      if (!category) throw new NotFoundError("Category", id);
      if (!target) throw new NotFoundError("Category", reassignTo);
      if (tagId !== undefined && !tag) throw new NotFoundError("Tag", tagId);
      if (vehicle) {
        throw new ConflictError(
          `This category is used by the vehicle '${vehicle.name}'`,
        );
      }
      await db.$transaction(async (tx) => {
        if (tagId !== undefined) {
          const moved = await tx.transaction.findMany({
            where: { categoryId: id },
            select: { id: true },
          });
          await tx.tag.update({
            where: { id: tagId },
            data: { transactions: { connect: moved } },
          });
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
