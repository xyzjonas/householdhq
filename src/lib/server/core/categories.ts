import { Prisma } from "@prisma/client";
import type { Db } from "./prisma";
import { CategoryInput, CategoryPatch } from "./schemas";
import {
  ConflictError,
  NotFoundError,
  type Category,
  type CategoryWithActivity,
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
     * Cancelled transactions are ignored; transfers between household
     * accounts are neither spending nor income.
     */
    async listWithActivity(range: {
      from: Date;
      to: Date;
    }): Promise<CategoryWithActivity[]> {
      const base = {
        categoryId: { not: null },
        cancelled: false,
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
