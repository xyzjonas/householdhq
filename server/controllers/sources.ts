import { PrismaClient, type Source, type SourceState } from "@prisma/client";
import type { IDBase } from "~/types/base";
import type {
  CreateSourceRequest,
  EditSourceRequest,
  UpdateSourceStateRequest,
} from "~/types/source";
import { prisma } from "./prisma-client";

class Sources {
  private sources = prisma.source;
  private sourceStates = prisma.sourceState;
  private transactions = prisma.transaction;

  public async findAll(): Promise<Source[]> {
    const allSources: Source[] = await this.sources.findMany({
      include: { states: true },
    });
    return allSources;
  }

  public async findSingle(sourceData: IDBase): Promise<Source> {
    const source = await this.sources.findUnique({
      where: { id: sourceData.id },
      include: { states: true },
    });
    if (!source) {
      throw createError({
        statusCode: 400,
        statusMessage: `No such transaction id=${sourceData.id}`,
      });
    }
    return source;
  }

  public async createSource(sourceData: CreateSourceRequest): Promise<Source> {
    // const data = { ...sourceData };
    const source: Source = await this.sources.create({
      data: { ...sourceData } as any,
    });
    return source;
  }

  public async editSource(sourceData: EditSourceRequest) {
    const data: any = { ...sourceData };
    delete data.id;
    const source: Source = await this.sources.update({
      where: { id: sourceData.id },
      data: {
        ...data,
        type: data.type as any,
      },
      include: { states: true },
    });
    return source;
  }

  public async insertState(sourceData: UpdateSourceStateRequest) {
    const data: any = { ...sourceData };
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

  public async autoInsertState(sourceId: IDBase) {
    const { id } = sourceId;

    const lastState: SourceState | null = await this.sourceStates.findFirst({
      where: {
        sourceId: {
          equals: id,
        },
      },
      orderBy: {
        created: "desc",
      },
    });

    if (!lastState) {
      return {
        id: "-1",
        sourceId,
        amount: 0,
        created: new Date(),
      };
    }

    const transactions = await this.transactions.findMany({
      where: {
        transactedAt: {
          gte: lastState.created,
          lte: new Date(),
        },
      },
    });

    const from = transactions.filter((t) => t.sourceId === id);
    const to = transactions.filter((t) => t.targetId === id);

    let result = lastState.amount;
    if (to.length > 0) {
      result = to.reduce((a, b) => {
        return a + b.amount;
      }, result);
    }

    if (from.length > 0) {
      result = from.reduce((a, b) => {
        return a - b.amount;
      }, result);
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

  public async deleteSource(sourceData: IDBase) {
    await this.sources.delete({
      where: { id: sourceData.id },
    });
  }

  public async deleteState(entryData: IDBase) {
    const sourceState: SourceState = await this.sourceStates.delete({
      where: { id: entryData.id },
    });
    return sourceState;
  }
}

export default new Sources();
