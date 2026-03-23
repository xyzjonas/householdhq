import { Prisma } from "@prisma/client";
import type {
  VehicleFuelEntry,
  VehicleFuelEntryCreate,
  VehicleFuelEntryUpdate,
} from "~/types";
import { prisma } from "./prisma-client";
import { getSettings } from "./appSettings";

class VehicleFuelEntriesService {
  private entries = (prisma as any).vehicleFuelEntry;
  private vehicles = prisma.vehicle;
  private transactions = prisma.transaction;
  private serviceEntries = (prisma as any).vehicleServiceEntry;

  private async assertVehicleExists(vehicleId: number): Promise<void> {
    const exists = await this.vehicles.findUnique({
      where: { id: vehicleId },
      select: { id: true },
    });

    if (!exists) {
      throw createError({
        statusCode: 404,
        statusMessage: `Vehicle '${vehicleId}' not found.`,
      });
    }
  }

  private async resolveDefaultTransactionRoute() {
    const source = await prisma.source.findFirst({
      where: { isOut: false, isDisponible: true },
      orderBy: { id: "asc" },
      select: { id: true },
    });

    const target = await prisma.source.findFirst({
      where: { isOut: true },
      orderBy: { id: "asc" },
      select: { id: true },
    });

    if (!source || !target) {
      throw createError({
        statusCode: 400,
        statusMessage:
          "Unable to auto-create transaction: missing default source/target accounts.",
      });
    }

    return { sourceId: source.id, targetId: target.id };
  }

  private async resolvePreviousFullTank(
    vehicleId: number,
    fueledAt: Date,
    previousFullTankFuelEntryId?: number | null,
    currentEntryId?: number,
  ): Promise<number | null> {
    if (previousFullTankFuelEntryId === undefined) {
      const latestFullTank = await this.entries.findFirst({
        where: {
          vehicleId,
          isFullTank: true,
          fueledAt: { lt: fueledAt },
          ...(currentEntryId ? { id: { not: currentEntryId } } : {}),
        },
        orderBy: { fueledAt: "desc" },
        select: { id: true },
      });

      return latestFullTank?.id ?? null;
    }

    if (previousFullTankFuelEntryId === null) {
      return null;
    }

    const previous = await this.entries.findUnique({
      where: { id: previousFullTankFuelEntryId },
      select: {
        id: true,
        vehicleId: true,
        isFullTank: true,
        fueledAt: true,
        previousFullTankFuelEntryId: true,
      },
    });

    if (!previous) {
      throw createError({
        statusCode: 400,
        statusMessage: `Previous full tank entry '${previousFullTankFuelEntryId}' not found.`,
      });
    }

    if (previous.vehicleId !== vehicleId) {
      throw createError({
        statusCode: 400,
        statusMessage:
          "Previous full tank entry must belong to the same vehicle.",
      });
    }

    if (!previous.isFullTank) {
      throw createError({
        statusCode: 400,
        statusMessage: "Previous full tank entry must be marked as full tank.",
      });
    }

    if (previous.fueledAt >= fueledAt) {
      throw createError({
        statusCode: 400,
        statusMessage:
          "Previous full tank entry must be older than current entry.",
      });
    }

    if (currentEntryId && previous.id === currentEntryId) {
      throw createError({
        statusCode: 400,
        statusMessage:
          "Fuel entry cannot reference itself as previous full tank.",
      });
    }

    if (currentEntryId) {
      const visited = new Set<number>();
      let cursor: number | null = previous.id;

      while (cursor) {
        if (visited.has(cursor)) {
          throw createError({
            statusCode: 400,
            statusMessage: "Detected a cycle in full tank references.",
          });
        }
        visited.add(cursor);

        if (cursor === currentEntryId) {
          throw createError({
            statusCode: 400,
            statusMessage: "Updating this relation would create a cycle.",
          });
        }

        const node = await this.entries.findUnique({
          where: { id: cursor },
          select: { previousFullTankFuelEntryId: true },
        });
        cursor = node?.previousFullTankFuelEntryId ?? null;
      }
    }

    return previous.id;
  }

  public async findByVehicleId(vehicleId: number): Promise<VehicleFuelEntry[]> {
    await this.assertVehicleExists(vehicleId);

    return (await this.entries.findMany({
      where: { vehicleId },
      include: {
        transaction: {
          select: {
            id: true,
            transactedAt: true,
            description: true,
            amount: true,
            currency: true,
          },
        },
        previousFullTankFuelEntry: {
          select: {
            id: true,
            fueledAt: true,
            odometer: true,
            isFullTank: true,
          },
        },
      },
      orderBy: { fueledAt: "desc" },
    })) as unknown as VehicleFuelEntry[];
  }

  public async create(
    vehicleId: number,
    payload: VehicleFuelEntryCreate,
  ): Promise<VehicleFuelEntry> {
    await this.assertVehicleExists(vehicleId);

    const [settings, vehicleData, route] = await Promise.all([
      getSettings(),
      this.vehicles.findUnique({
        where: { id: vehicleId },
        select: { categoryId: true },
      }),
      this.resolveDefaultTransactionRoute(),
    ]);

    const transactionTitle =
      settings.defaultFuelTransactionTitle?.trim() || "Fuel";

    const previousFullTankFuelEntryId = await this.resolvePreviousFullTank(
      vehicleId,
      payload.fueledAt,
      payload.previousFullTankFuelEntryId,
    );

    try {
      return (await prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.create({
          data: {
            transactedAt: payload.fueledAt,
            description: transactionTitle,
            amount: payload.fuelAmount * payload.unitPrice,
            currency: settings.currency,
            confirmed: payload.fueledAt <= new Date(),
            source: { connect: { id: route.sourceId } },
            target: { connect: { id: route.targetId } },
            ...(vehicleData?.categoryId
              ? { category: { connect: { id: vehicleData.categoryId } } }
              : {}),
          },
        });

        return await (tx as any).vehicleFuelEntry.create({
          data: {
            ...payload,
            vehicleId,
            transactionId: transaction.id,
            previousFullTankFuelEntryId,
          },
          include: {
            transaction: {
              select: {
                id: true,
                transactedAt: true,
                description: true,
                amount: true,
                currency: true,
              },
            },
            previousFullTankFuelEntry: {
              select: {
                id: true,
                fueledAt: true,
                odometer: true,
                isFullTank: true,
              },
            },
          },
        });
      })) as unknown as VehicleFuelEntry;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        throw createError({
          statusCode: 409,
          statusMessage:
            "Failed to create fuel entry due to unique constraint.",
        });
      }
      throw e;
    }
  }

  public async edit(
    vehicleId: number,
    entryId: number,
    payload: VehicleFuelEntryUpdate,
  ): Promise<VehicleFuelEntry> {
    await this.assertVehicleExists(vehicleId);

    const current = await this.entries.findFirst({
      where: { id: entryId, vehicleId },
      select: {
        id: true,
        fueledAt: true,
        transactionId: true,
        previousFullTankFuelEntryId: true,
      },
    });

    if (!current) {
      throw createError({
        statusCode: 404,
        statusMessage: `Fuel entry '${entryId}' not found for vehicle '${vehicleId}'.`,
      });
    }

    const effectiveFueledAt = payload.fueledAt ?? current.fueledAt;
    const effectivePreviousId = await this.resolvePreviousFullTank(
      vehicleId,
      effectiveFueledAt,
      payload.previousFullTankFuelEntryId ??
        current.previousFullTankFuelEntryId,
      entryId,
    );

    return (await this.entries.update({
      where: { id: entryId },
      data: {
        ...payload,
        previousFullTankFuelEntryId: effectivePreviousId,
      },
      include: {
        transaction: {
          select: {
            id: true,
            transactedAt: true,
            description: true,
            amount: true,
            currency: true,
          },
        },
        previousFullTankFuelEntry: {
          select: {
            id: true,
            fueledAt: true,
            odometer: true,
            isFullTank: true,
          },
        },
      },
    })) as unknown as VehicleFuelEntry;
  }

  public async delete(
    vehicleId: number,
    entryId: number,
  ): Promise<VehicleFuelEntry> {
    const current = await this.entries.findFirst({
      where: { id: entryId, vehicleId },
      select: { id: true },
    });

    if (!current) {
      throw createError({
        statusCode: 404,
        statusMessage: `Fuel entry '${entryId}' not found for vehicle '${vehicleId}'.`,
      });
    }

    return (await prisma.$transaction(async (tx) => {
      const deleted = await (tx as any).vehicleFuelEntry.delete({
        where: { id: entryId },
        include: {
          transaction: {
            select: {
              id: true,
              transactedAt: true,
              description: true,
              amount: true,
              currency: true,
            },
          },
          previousFullTankFuelEntry: {
            select: {
              id: true,
              fueledAt: true,
              odometer: true,
              isFullTank: true,
            },
          },
        },
      });

      await tx.transaction.delete({ where: { id: deleted.transactionId } });
      return deleted;
    })) as unknown as VehicleFuelEntry;
  }
}

export default new VehicleFuelEntriesService();
