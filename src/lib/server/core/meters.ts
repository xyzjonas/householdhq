import { Prisma } from "@prisma/client";
import type { Db } from "./prisma";
import { requireMeter } from "./refs";
import { MeterInput, MeterPatch, MeterReadingInput } from "./schemas";
import {
  NotFoundError,
  type Meter,
  type MeterReading,
  type MeterWithReadings,
} from "./types";

function rethrow(e: unknown, entity: string, id: number): never {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2025" || e.code === "P2003") {
      throw new NotFoundError(entity, id);
    }
  }
  throw e;
}

export function metersRepo(db: Db) {
  const withReadings = {
    include: { states: { orderBy: { meteredAt: "desc" } } },
  } as const;
  const toMeter = ({
    states,
    ...meter
  }: Meter & { states: MeterReading[] }): MeterWithReadings => ({
    ...meter,
    readings: states,
  });

  return {
    /** All meters by name, each with its readings (newest first). */
    async list(): Promise<MeterWithReadings[]> {
      const meters = await db.meter.findMany({
        ...withReadings,
        orderBy: { name: "asc" },
      });
      return meters.map(toMeter);
    },

    async get(id: number): Promise<MeterWithReadings> {
      const meter = await db.meter.findUnique({
        where: { id },
        ...withReadings,
      });
      if (!meter) throw new NotFoundError("Meter", id);
      return toMeter(meter);
    },

    create(input: MeterInput): Promise<Meter> {
      return db.meter.create({ data: MeterInput.parse(input) });
    },

    async update(id: number, input: MeterPatch): Promise<Meter> {
      try {
        return await db.meter.update({
          where: { id },
          data: MeterPatch.parse(input),
        });
      } catch (e) {
        rethrow(e, "Meter", id);
      }
    },

    async addReading(
      meterId: number,
      input: MeterReadingInput,
    ): Promise<MeterReading> {
      const { value, meteredAt } = MeterReadingInput.parse(input);
      await requireMeter(db, meterId);
      try {
        return await db.meterState.create({
          data: { meterId, value, meteredAt: meteredAt ?? new Date() },
        });
      } catch (e) {
        rethrow(e, "Meter", meterId);
      }
    },

    async removeReading(id: number): Promise<void> {
      try {
        await db.meterState.delete({ where: { id } });
      } catch (e) {
        rethrow(e, "Meter reading", id);
      }
    },
  };
}
