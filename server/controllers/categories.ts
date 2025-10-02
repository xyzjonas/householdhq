import { PrismaClient, Prisma } from "@prisma/client";
import type { Category, CreateCategory, EditCategory, IDBase } from "~/types";

class Categories {
  private categories = new PrismaClient().category;

  public async findAllCategories(): Promise<Category[]> {
    return await this.categories.findMany();
  }

  public async findSingle(data: IDBase): Promise<Category> {
    const category = await this.categories.findUnique({
      where: { id: data.id },
    });
    if (!category) {
      throw createError({
        statusCode: 404,
        statusMessage: `Category '${data.id}' nof found.`,
      });
    }
    return category;
  }

  public async deleteCategory(categoryData: IDBase): Promise<Category> {
    return await this.categories.delete({ where: { id: categoryData.id } });
  }

  public async createCategory(categoryData: CreateCategory): Promise<Category> {
    try {
      return await this.categories.create({ data: { ...categoryData } as any });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          throw createError({
            statusCode: 400,
            statusMessage: `Tag '${categoryData.name}' aready exists.`,
          });
        }
      }
      throw e;
    }
  }

  public async editTag(categoryData: EditCategory): Promise<Category> {
    try {
      const cleanData = Object.fromEntries(
        Object.entries(categoryData).filter(([_, v]) => v !== undefined)
      );
      const tag = await this.categories.update({
        where: {
          id: categoryData.id,
        },
        data: cleanData,
      });
      return tag;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          throw createError({
            statusCode: 400,
            statusMessage: `Tag '${categoryData.name}' aready exists.`,
          });
        }
      }
      throw e;
    }
  }
}

export default new Categories();
