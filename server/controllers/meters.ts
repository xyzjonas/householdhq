import { PrismaClient, Prisma } from "@prisma/client";
import type {
  IDBase,
  Meter,
  MeterCreate,
  MeterState,
  MeterStateCreate,
  MeterStateUpdate,
  MeterUpdate,
} from "~/types";

class MetersService {
  private prisma = new PrismaClient();
  private meters = this.prisma.meter;
  private meterStates = this.prisma.meterState;

  // Meter Methods
  public async findAllMeters(): Promise<Meter[]> {
    return await this.meters.findMany({
      include: {
        states: {
          orderBy: {
            meteredAt: "desc",
          },
        },
      },
    });
  }

  public async findSingleMeter(data: IDBase): Promise<Meter> {
    const meter = await this.meters.findUnique({
      where: { id: data.id },
      include: { states: true },
    });
    if (!meter) {
      throw createError({
        statusCode: 404,
        statusMessage: `Meter '${data.id}' not found.`,
      });
    }
    return meter;
  }

  public async deleteMeter(meterData: IDBase): Promise<Meter> {
    return await this.meters.delete({
      where: { id: meterData.id },
      include: { states: true },
    });
  }

  public async createMeter(meterData: MeterCreate): Promise<Meter> {
    try {
      return await this.meters.create({
        data: { ...meterData } as any,
        include: { states: true },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          throw createError({
            statusCode: 400,
            statusMessage: `Meter '${meterData.name}' already exists.`,
          });
        }
      }
      throw e;
    }
  }

  public async editMeter(
    meterId: number,
    meterData: MeterUpdate
  ): Promise<Meter> {
    try {
      const cleanData = Object.fromEntries(
        Object.entries(meterData).filter(
          ([k, v]) => k !== "id" && v !== undefined
        )
      );
      const meter = await this.meters.update({
        where: { id: meterId },
        data: cleanData,
        include: { states: true },
      });
      return meter;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          throw createError({
            statusCode: 400,
            statusMessage: `Meter '${meterData.name}' already exists.`,
          });
        }
      }
      throw e;
    }
  }

  // MeterState Methods
  public async findAllMeterStates(meterId?: number): Promise<MeterState[]> {
    return await this.meterStates.findMany({
      where: meterId ? { meterId } : undefined,
      orderBy: { meteredAt: "desc" },
    });
  }

  public async findSingleMeterState(data: IDBase): Promise<MeterState> {
    const state = await this.meterStates.findUnique({
      where: { id: data.id },
    });
    if (!state) {
      throw createError({
        statusCode: 404,
        statusMessage: `Meter state '${data.id}' not found.`,
      });
    }
    return state;
  }

  public async deleteMeterState(stateData: IDBase): Promise<MeterState> {
    return await this.meterStates.delete({
      where: { id: stateData.id },
    });
  }

  public async createMeterState(
    stateData: MeterStateCreate
  ): Promise<MeterState> {
    try {
      // Verify meter exists
      await this.findSingleMeter({ id: stateData.meterId });

      return await this.meterStates.create({
        data: { ...stateData } as any,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2003") {
          throw createError({
            statusCode: 400,
            statusMessage: `Meter '${stateData.meterId}' does not exist.`,
          });
        }
      }
      throw e;
    }
  }

  public async editMeterState(
    meterStateId: number,
    stateData: MeterStateUpdate
  ): Promise<MeterState> {
    try {
      const cleanData = Object.fromEntries(
        Object.entries(stateData).filter(
          ([k, v]) => k !== "id" && v !== undefined
        )
      );

      const state = await this.meterStates.update({
        where: { id: meterStateId },
        data: cleanData,
      });
      return state;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2003") {
          throw createError({
            statusCode: 400,
            statusMessage: `Meter does not exist.`,
          });
        }
      }
      throw e;
    }
  }
}

export default new MetersService();
