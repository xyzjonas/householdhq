import { Prisma } from "@prisma/client";
import type {
  VehicleServiceEntry,
  VehicleServiceEntryCreate,
  VehicleServiceEntryUpdate,
} from "~/types";
import { prisma } from "./prisma-client";
import { getSettings } from "./appSettings";

class VehicleServiceEntriesService {
  private entries = (prisma as any).vehicleServiceEntry;
  private vehicles = prisma.vehicle;

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

  public async findByVehicleId(
    vehicleId: number,
  ): Promise<VehicleServiceEntry[]> {
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
        components: true,
      },
      orderBy: { servicedAt: "desc" },
    })) as unknown as VehicleServiceEntry[];
  }

  public async create(
    vehicleId: number,
    payload: VehicleServiceEntryCreate,
  ): Promise<VehicleServiceEntry> {
    await this.assertVehicleExists(vehicleId);

    const [settings, vehicleData, route] = await Promise.all([
      getSettings(),
      this.vehicles.findUnique({
        where: { id: vehicleId },
        select: { categoryId: true },
      }),
      this.resolveDefaultTransactionRoute(),
    ]);

    const description = payload.title?.trim()
      ? `Service: ${payload.title.trim()}`
      : "Service";

    try {
      return (await prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.create({
          data: {
            transactedAt: payload.servicedAt,
            description,
            amount: payload.price ?? 0,
            currency: settings.currency,
            confirmed: payload.servicedAt <= new Date(),
            source: { connect: { id: route.sourceId } },
            target: { connect: { id: route.targetId } },
            ...(vehicleData?.categoryId
              ? { category: { connect: { id: vehicleData.categoryId } } }
              : {}),
          },
        });

        const { componentIds, price: _price, ...entryData } = payload;

        return await (tx as any).vehicleServiceEntry.create({
          data: {
            ...entryData,
            vehicleId,
            transactionId: transaction.id,
            ...(componentIds?.length
              ? { components: { connect: componentIds.map((id) => ({ id })) } }
              : {}),
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
            components: true,
          },
        });
      })) as unknown as VehicleServiceEntry;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        throw createError({
          statusCode: 409,
          statusMessage:
            "Failed to create service entry due to unique constraint.",
        });
      }
      throw e;
    }
  }

  public async edit(
    vehicleId: number,
    entryId: number,
    payload: VehicleServiceEntryUpdate,
  ): Promise<VehicleServiceEntry> {
    await this.assertVehicleExists(vehicleId);

    const current = await this.entries.findFirst({
      where: { id: entryId, vehicleId },
      select: { id: true, transactionId: true },
    });

    if (!current) {
      throw createError({
        statusCode: 404,
        statusMessage: `Service entry '${entryId}' not found for vehicle '${vehicleId}'.`,
      });
    }

    if (payload.price !== undefined && current.transactionId) {
      await prisma.transaction.update({
        where: { id: current.transactionId },
        data: { amount: payload.price ?? 0 },
      });
    }

    return (await this.entries.update({
      where: { id: entryId },
      data: {
        ...(() => {
          const { componentIds, price: _price, ...rest } = payload;
          return rest;
        })(),
        ...(payload.componentIds !== undefined
          ? { components: { set: payload.componentIds.map((id) => ({ id })) } }
          : {}),
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
        components: true,
      },
    })) as unknown as VehicleServiceEntry;
  }

  public async delete(
    vehicleId: number,
    entryId: number,
  ): Promise<VehicleServiceEntry> {
    const current = await this.entries.findFirst({
      where: { id: entryId, vehicleId },
      select: { id: true },
    });

    if (!current) {
      throw createError({
        statusCode: 404,
        statusMessage: `Service entry '${entryId}' not found for vehicle '${vehicleId}'.`,
      });
    }

    return (await prisma.$transaction(async (tx) => {
      const deleted = await (tx as any).vehicleServiceEntry.delete({
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
          components: true,
        },
      });

      await tx.transaction.delete({ where: { id: deleted.transactionId } });
      return deleted;
    })) as unknown as VehicleServiceEntry;
  }
}

export default new VehicleServiceEntriesService();
