import { Prisma } from "@prisma/client";
import type {
  VehicleComponent,
  VehicleComponentCreate,
  VehicleComponentUpdate,
} from "~/types";
import { prisma } from "./prisma-client";

class VehicleComponentsService {
  private components = (prisma as any).vehicleComponent;

  public async findAll(): Promise<VehicleComponent[]> {
    return (await this.components.findMany({
      orderBy: { name: "asc" },
    })) as unknown as VehicleComponent[];
  }

  public async create(
    payload: VehicleComponentCreate,
  ): Promise<VehicleComponent> {
    try {
      return (await this.components.create({
        data: payload,
      })) as unknown as VehicleComponent;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        throw createError({
          statusCode: 409,
          statusMessage: "A component with that name already exists.",
        });
      }
      throw e;
    }
  }

  public async edit(
    id: number,
    payload: VehicleComponentUpdate,
  ): Promise<VehicleComponent> {
    const existing = await this.components.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw createError({
        statusCode: 404,
        statusMessage: `Vehicle component '${id}' not found.`,
      });
    }

    try {
      return (await this.components.update({
        where: { id },
        data: payload,
      })) as unknown as VehicleComponent;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        throw createError({
          statusCode: 409,
          statusMessage: "A component with that name already exists.",
        });
      }
      throw e;
    }
  }

  public async delete(id: number): Promise<VehicleComponent> {
    const existing = await this.components.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw createError({
        statusCode: 404,
        statusMessage: `Vehicle component '${id}' not found.`,
      });
    }

    return (await this.components.delete({
      where: { id },
    })) as unknown as VehicleComponent;
  }
}

export default new VehicleComponentsService();
