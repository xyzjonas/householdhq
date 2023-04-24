import { PrismaClient, Category, Prisma } from '@prisma/client';
import { IdDto } from '../validators/common.dto';
import { CategoryDto, EditCategoryDto } from '../validators/categories.dto';


class Categories {

  private categories = new PrismaClient().category;

  public async findAllCategories(): Promise<Category[]> {
    return await this.categories.findMany();
  }

  public async findSingle(data: IdDto): Promise<Category> {
    const category = await this.categories.findUnique({ where: { id: data.id } });
    if (!category) {
      throw createError({ statusCode: 404, statusMessage: `Category '${data.id}' nof found.` });
    }
    return category;
  }

  public async deleteCategory(categoryData: IdDto): Promise<Category> {
    return await this.categories.delete({ where: { id: categoryData.id } });
  }

  public async createCategory(categoryData: CategoryDto): Promise<Category> {
    try {
      return await this.categories.create({ data: { ...categoryData } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw createError({ statusCode: 400, statusMessage: `Tag '${categoryData.name}' aready exists.` });
        }
      }
      throw e;
    }
  }

  public async editTag(categoryData: EditCategoryDto): Promise<Category> {
    try {
      const tag = await this.categories.update({
        where: {
          id: categoryData.id
        },
        data: { ...categoryData },
      });
      return tag;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw createError({ statusCode: 400, statusMessage: `Tag '${categoryData.name}' aready exists.` });
        }
      }
      throw e;
    }
  }
}

export default new Categories();
