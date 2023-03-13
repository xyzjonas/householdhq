import { PrismaClient, Source } from "@prisma/client";
import { CreateSourceDto, EditSourceDto, IdDto } from "../validators/sources.dto";


class Sources {

    private sources = new PrismaClient().source;

    public async findAll(): Promise<Source[]> {
        const allSources: Source[] = await this.sources.findMany();
        return allSources;
    }

    public async findSingle(sourceData: IdDto): Promise<Source> {
        const source = await this.sources.findUnique({ where: { id: sourceData.id } });
        if (!source) {
            throw createError({ statusCode: 400, statusMessage: `No such transaction id=${sourceData.id}` });
        }
        return source
    }
    
    public async createSource(sourceData: CreateSourceDto): Promise<Source> {
      const source: Source = await this.sources.create({ data: { name: sourceData.name } });
      return source;
    }

    public async editSource(sourceData: EditSourceDto) {
      const source: Source = await this.sources.update({ 
        where: { id: sourceData.id },
        data: { name: sourceData.name }
      });
      return source;
    }
}

    

export default new Sources();