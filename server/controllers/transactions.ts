import { PrismaClient, Transaction } from "@prisma/client";
import { CreateTransactionDto, TagTransactionDto, TransactionIdDto } from "../validators/transactions.dto";


class Transactions {

    private transactions = new PrismaClient().transaction;

    public async findAll(): Promise<Transaction[]> {
        const allTrans: Transaction[] = await this.transactions.findMany({ include: { source: true, tags: true } });
        allTrans.sort((a, b) => b.created.getTime() - a.created.getTime());
        return allTrans;
    }

    public async findSingle(transactionData: TransactionIdDto): Promise<Transaction> {
        console.info(`Querying transaction id=${transactionData.id}`)
        const transaction = await this.transactions.findUnique({ where: { id: transactionData.id } });
        if (!transaction) {
            throw createError({ statusCode: 400, statusMessage: `No such transaction id=${transactionData.id}` });
        }
        return transaction
    }

    public async findRecent({ month = undefined, year = undefined }: { month?: number; year?: number; } = {}): Promise<Transaction[]> {
        const now = new Date();
        if (!month) {
          month = now.getMonth() + 1;
        }
        if (!year) {
          year = now.getUTCFullYear();
        }
        let monthNext = month + 1;
        let yearNext = year;
        if (monthNext > 12) {
            monthNext = monthNext % 12;
            yearNext++;
        }
    
        const queryDate = new Date(`${year}-${month}-${1}`);
        const queryDateNext = new Date(`${yearNext}-${monthNext}-${1}`);
        console.log(`Querying transactions from='${queryDate}' to='${queryDateNext}'`);
        const allTrans: Transaction[] = await this.transactions.findMany({
          where: {
            created: {
                gte: queryDate,
                lt: queryDateNext,
            }
        },
          include: { source: true, tags: true },
        });
        allTrans.sort((a, b) => b.created.getTime() - a.created.getTime());
        return allTrans;
    }
    
      public async createTransaction(transactionData: CreateTransactionDto): Promise<Transaction> {
        let parsed_date = undefined;
        if (transactionData.created) {
            parsed_date = new Date(transactionData.created);
        }
        const tags = transactionData.tags.split(',').map(tagName => ({ name: tagName }));
        console.info(tags);
    
        transactionData.currency ??= 'CZK';
        const trans: Transaction = await this.transactions.create({
          data: {
            created: parsed_date,
            currency: transactionData.currency,
            description: transactionData.description,
            amount: transactionData.amount,
            tags: {
              connect: tags,
            },
            source: {
              connect: {
                id: transactionData.sourceId,
              },
            },
          },
        });
        return trans;
    }

      public async deleteTransaction(transactionData: TransactionIdDto): Promise<Transaction> {
        return await this.transactions.delete({ where: { id: transactionData.id } });
    }

    public async tagTransaction(tagsData: TagTransactionDto): Promise<Transaction> {
        const tags = tagsData.tags.split(',').map(t => t.trim()).map(tagName => ({ name: tagName }));
        const trans = await this.transactions.update({
          where: {
            id: tagsData.transactionId,
          },
          data: {
            tags: {
              connect: tags,
            },
          },
          include: {
            tags: true,
          },
        });
        return trans;
    }
    
    public async untagTransaction(tagsData: TagTransactionDto): Promise<Transaction> {
        const tags = tagsData.tags.split(',').map(t => t.trim()).map(tagName => ({ name: tagName }));
        const trans = await this.transactions.update({
          where: {
            id: tagsData.transactionId,
          },
          data: {
            tags: {
              disconnect: tags,
            },
          },
          include: {
            tags: true,
          },
        });
        return trans;
    }
}

export default new Transactions();