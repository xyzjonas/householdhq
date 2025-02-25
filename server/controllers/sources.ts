import { PrismaClient, type Source, type SourceState } from "@prisma/client";
import { CreateSourceDto, EditSourceDto, UpdateSourceStateDto } from "../validators/sources.dto";
import { IdDto } from "../validators/common.dto";
import transactions from "./transactions";

class Sources {
  private sources = new PrismaClient().source;
  private sourceStates = new PrismaClient().sourceState;
  private transactions = new PrismaClient().transaction;

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

  public async autoInsertState(sourceId: IdDto) {
    const { id } = sourceId;

    const lastState: SourceState | null = await this.sourceStates.findFirst({
      where: {
        sourceId: {
          equals: id,
        },
      },
      orderBy: {
        created: "desc",
      }
    })
    
    if (!lastState) {
      return {
        id: "-1",
        sourceId,
        amount: 0,
        created: new Date(),
      }
    }

    const transactions = await this.transactions.findMany({
      where: {
        created: {
          gte: lastState.created,
          lte: new Date(),
        },
      }
    })

    const from = transactions.filter(t => t.sourceId === id)
    const to = transactions.filter(t => t.targetId === id)
    console.info(`${from.length} from, ${to.length} to`)

    let result = lastState.amount;

    if (from.length > 0 || to.length > 0) {
      result = to.reduce((a, b) => (a + b.amount), result)
      result = from.reduce((a, b) => (a - b.amount), result)
    }
    
    const sourceState: SourceState = await this.sourceStates.create({
      data: {
        amount: result,
        source: {
          connect: { id },
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
