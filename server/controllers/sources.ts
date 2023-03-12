import { PrismaClient, Source } from "@prisma/client";
import { CreateSourceDto } from "../validators/sources.dto";
import { CreateTransactionDto, TagTransactionDto, IdDto, TransactionMonthDto, EditTransactionDto } from "../validators/transactions.dto";


class Sources {

    private sources = new PrismaClient().source;

    public async findAll(): Promise<Source[]> {
        const allSources: Source[] = await this.sources.findMany();
        return allSources;
    }

    public async findSingle(transactionData: IdDto): Promise<Transaction> {
        console.info(`Querying transaction id=${transactionData.id}`)
        const transaction = await this.transactions.findUnique({
            where: { id: transactionData.id },
            include: { source: true, tags: true },
        });
        if (!transaction) {
            throw createError({ statusCode: 400, statusMessage: `No such transaction id=${transactionData.id}` });
        }
        return transaction
    }
    
    public async createSource(sourceData: CreateSourceDto): Promise<Source> {
      const source: Source = await this.sources.create({ data: { name: sourceData.name } });
      return source;
    }
}

    

export default new Sources();