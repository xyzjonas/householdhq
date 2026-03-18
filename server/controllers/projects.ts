import {
  Prisma,
  PrismaClient,
  type Project,
  type Transaction,
} from "@prisma/client";
import type { CreateProjectRequest, EditProjectRequest } from "~/types/project";
import type { IDBase } from "~/types/base";
import { prisma } from "./prisma-client";

const DEFAULT_INCLUDE = {
  transactions: { include: { source: true, target: true } },
};

class Projects {
  private projects = prisma.project;

  public async findAll(): Promise<Project[]> {
    return await this.projects.findMany({ include: DEFAULT_INCLUDE });
  }

  public async findSingle(data: IDBase): Promise<Project> {
    const project = await this.projects.findUnique({
      where: { id: data.id },
      include: DEFAULT_INCLUDE,
    });

    if (!project) {
      throw createError({
        statusCode: 404,
        statusMessage: `Project '${data.id}' nof found.`,
      });
    }

    return project;
  }

  public async deleteProject(data: IDBase): Promise<Project> {
    return await this.projects.delete({ where: { id: data.id } });
  }

  public async createProject(
    projectData: CreateProjectRequest,
  ): Promise<Project> {
    try {
      return await this.projects.create({ data: { ...projectData } as any });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          throw createError({
            statusCode: 400,
            statusMessage: `Project '${projectData.name}' aready exists.`,
          });
        }
      }
      throw e;
    }
  }

  public async editProject(projecData: EditProjectRequest): Promise<Project> {
    try {
      const project = await this.projects.update({
        where: {
          id: projecData.id,
        },
        data: { ...projecData },
      });
      return project;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          throw createError({
            statusCode: 400,
            statusMessage: `Project '${projecData.name}' aready exists.`,
          });
        }
      }
      throw e;
    }
  }
}

export default new Projects();
