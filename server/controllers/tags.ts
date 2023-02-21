import { PrismaClient, Tag, Prisma } from '@prisma/client';
import { CreateTagDto, TagIdDto } from '../validators/tags.dto';
import { IdDto } from '../validators/transactions.dto';


class Tags {

  private tags = new PrismaClient().tag;

  public async findAllTags(): Promise<Tag[]> {
    const tags: Tag[] = await this.tags.findMany({ include: { childTags: true } });
    return tags;
  }

  public async findSingle(data: IdDto): Promise<Tag> {
    const tag = await this.tags.findUnique({
      where: { id: data.id },
      include: { childTags: true }
    });
    if (!tag) {
      throw createError({ statusCode: 404, statusMessage: `Tag '${data.id}' nof found.` });
    }
    return tag;
  }

  public async deleteTag(tagData: TagIdDto): Promise<Tag> {
    return await this.tags.delete({ where: { id: tagData.id } });
  }

  public async createTag(tagData: CreateTagDto): Promise<Tag> {
    try {
      const tag = await this.tags.create({
        data: {
          name: tagData.name,
          description: tagData.description,
          parentTag: {
            connect: {
              id: tagData.parentId ? tagData.parentId : undefined,
            },
          },
        },
      });
      return tag;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw createError({ statusCode: 400, statusMessage: `Tag '${tagData.name}' aready exists.` });
        }
        if (e.code === 'P2025') {
          throw createError({ statusCode: 400, statusMessage: `Parent tag '${tagData.parentId}' not found.` });
        }
      }
      throw e;
    }
  }
}

export default new Tags();
