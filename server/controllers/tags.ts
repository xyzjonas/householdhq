import { PrismaClient, Tag, Prisma } from '@prisma/client';
import { TagDto, EditTagDto, TagIdDto } from '../validators/tags.dto';
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

  public async createTag(tagData: TagDto): Promise<Tag> {
    try {
      const data = {
        name: tagData.name,
        description: tagData.description,
        icon: tagData.icon,
        // color: tagData.color,
      }
      if (tagData.parentId) {
        data['parentTag'] = { connect: { id: tagData.parentId }, }
      }
      const tag = await this.tags.create({ data: data });
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

  public async editTag(tagData: EditTagDto): Promise<Tag> {
    let data = {...tagData}
    const parentId = data.parentId;
    delete data.parentId;
    try {
      const tag = await this.tags.update({
        where: {
          id: tagData.id
        },
        data: {
          name: tagData.name,
          description: tagData.description,
          icon: tagData.icon,
          color: tagData.color,
          parentTag: parentId ? {
            connect: {
              id: parentId ? tagData.parentId : undefined,
            },
          } : undefined,
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
