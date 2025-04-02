import { Prisma, PrismaClient, type Project } from "@prisma/client";
import { IdDto } from "../validators/common.dto";
import type { CreateProjectDto, EditProjectDto } from "../validators/projects.dto";

class Projects {
  private projects = new PrismaClient().project;

  public async findAll(): Promise<Project[]> {
    return await this.projects.findMany();
  }

  public async findSingle(data: IdDto): Promise<Project> {
    const category = await this.projects.findUnique({ where: { id: data.id } });
    if (!category) {
      throw createError({ statusCode: 404, statusMessage: `Project '${data.id}' nof found.` });
    }
    return category;
  }

  public async deleteProject(data: IdDto): Promise<Project> {
    return await this.projects.delete({ where: { id: data.id } });
  }

  public async createProject(projectData: CreateProjectDto): Promise<Project> {
    try {
      return await this.projects.create({ data: { ...projectData } as any });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          throw createError({ statusCode: 400, statusMessage: `Project '${projectData.name}' aready exists.` });
        }
      }
      throw e;
    }
  }

  public async editProject(projecData: EditProjectDto): Promise<Project> {
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
          throw createError({ statusCode: 400, statusMessage: `Project '${projecData.name}' aready exists.` });
        }
      }
      throw e;
    }
  }
}

export default new Projects();
