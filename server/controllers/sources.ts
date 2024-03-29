import { PrismaClient, type Source, type SourceState } from "@prisma/client";
import { CreateSourceDto, EditSourceDto, UpdateSourceStateDto } from "../validators/sources.dto";
import { IdDto } from "../validators/common.dto";

class Sources {
  private sources = new PrismaClient().source;
  private sourceStates = new PrismaClient().sourceState;

  public async findAll(): Promise<Source[]> {
    const allSources: Source[] = await this.sources.findMany({
      include: { states: true },
    });
    return allSources;
  }

  public async findSingle(sourceData: IdDto): Promise<Source> {
    const source = await this.sources.findUnique({
      where: { id: sourceData.id },
      include: { states: true },
    });
    if (!source) {
      throw createError({ statusCode: 400, statusMessage: `No such transaction id=${sourceData.id}` });
    }
    return source;
  }

  public async createSource(sourceData: CreateSourceDto): Promise<Source> {
    // const data = { ...sourceData };
    const source: Source = await this.sources.create({ data: { ...sourceData } as any });
    return source;
  }

  public async editSource(sourceData: EditSourceDto) {
    const data = { ...sourceData };
    delete data.id;
    const source: Source = await this.sources.update({
      where: { id: sourceData.id },
      data: data,
      include: { states: true },
    });
    return source;
  }

  public async insertState(sourceData: UpdateSourceStateDto) {
    const data = { ...sourceData };
    delete data.sourceId;
    const sourceState: SourceState = await this.sourceStates.create({
      data: {
        ...data,
        source: {
          connect: {
            id: sourceData.sourceId,
          },
        },
      } as any,
      include: {
        source: true,
      },
    });
    return sourceState;
  }

  public async deleteSource(sourceData: IdDto) {
    await this.sources.delete({
      where: { id: sourceData.id }
    })
  }

  public async deleteState(entryData: IdDto) {
    const sourceState: SourceState = await this.sourceStates.delete({ where: { id: entryData.id } });
    return sourceState;
  }
}

export default new Sources();
