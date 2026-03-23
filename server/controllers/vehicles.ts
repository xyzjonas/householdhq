import { PrismaClient, Prisma } from "@prisma/client";
import type {
  IDBase,
  Vehicle,
  VehicleDetail,
  VehicleCreate,
  VehicleUpdate,
} from "~/types";
import { prisma } from "./prisma-client";

class VehiclesService {
  private prisma = prisma;
  private vehicles = this.prisma.vehicle;

  public async findAllVehicles(): Promise<Vehicle[]> {
    return await this.vehicles.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  public async findSingleVehicle(data: IDBase): Promise<VehicleDetail> {
    const vehicle = await this.vehicles.findUnique({
      where: { id: data.id },
      include: {
        category: {
          include: {
            transactions: {
              include: {
                source: true,
                target: true,
                category: true,
                project: true,
                tags: true,
              },
              orderBy: { transactedAt: "desc" },
            },
          },
        },
      },
    });
    if (!vehicle) {
      throw createError({
        statusCode: 404,
        statusMessage: `Vehicle '${data.id}' not found.`,
      });
    }
    const { category, ...rest } = vehicle;
    return {
      ...rest,
      linkedCategory: category
        ? {
            id: category.id,
            name: category.name,
            description: category.description,
            icon: category.icon,
            color: category.color,
          }
        : null,
      transactions: category?.transactions ?? [],
    };
  }

  public async deleteVehicle(vehicleData: IDBase): Promise<Vehicle> {
    return await this.vehicles.delete({
      where: { id: vehicleData.id },
    });
  }

  public async createVehicle(vehicleData: VehicleCreate): Promise<Vehicle> {
    try {
      return await this.vehicles.create({
        data: { ...vehicleData } as any,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          const field = (e.meta?.target as string[])?.[0];
          throw createError({
            statusCode: 400,
            statusMessage: `Vehicle with this ${field} already exists.`,
          });
        }
      }
      throw e;
    }
  }

  public async editVehicle(
    vehicleId: number,
    vehicleData: VehicleUpdate,
  ): Promise<Vehicle> {
    try {
      const cleanData = Object.fromEntries(
        Object.entries(vehicleData).filter(
          ([k, v]) => k !== "id" && v !== undefined,
        ),
      );
      const vehicle = await this.vehicles.update({
        where: { id: vehicleId },
        data: cleanData,
      });
      return vehicle;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          const field = (e.meta?.target as string[])?.[0];
          throw createError({
            statusCode: 400,
            statusMessage: `Vehicle with this ${field} already exists.`,
          });
        }
      }
      throw e;
    }
  }
}

export default new VehiclesService();
