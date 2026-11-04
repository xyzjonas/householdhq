import { Prisma } from "@prisma/client";
import type { Db } from "./prisma";
import { CategoryInput, CategoryPatch } from "./schemas";
import { ConflictError, NotFoundError, type Category } from "./types";

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
