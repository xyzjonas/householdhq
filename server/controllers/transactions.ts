import { PrismaClient, Transaction } from "@prisma/client";
import { CreateTransactionDto, TagTransactionDto, TransactionMonthDto, EditTransactionDto } from "../validators/transactions.dto";
import { IdDto } from "../validators/common.dto"

const DEFAULT_INCLUDE = { category: true, source: true, target:true, tags: true };

class Transactions {

    private transactions = new PrismaClient().transaction;

    public async findAll(): Promise<Transaction[]> {
        const allTrans: Transaction[] = await this.transactions.findMany({ include: DEFAULT_INCLUDE });
        allTrans.sort((a, b) => b.created.getTime() - a.created.getTime());
        return allTrans;
    }

    public async findSingle(transactionData: IdDto): Promise<Transaction> {
        const transaction = await this.transactions.findUnique({
            where: { id: transactionData.id },
            include: DEFAULT_INCLUDE,
        });
        if (!transaction) {
            throw createError({ statusCode: 400, statusMessage: `No such transaction id=${transactionData.id}` });
        }
        return transaction
    }

    public async findRecent(data: TransactionMonthDto): Promise<any> {
        const now = new Date();
        let month = data.month;
        let year = data.year;
        
        if (month) {
            month--;
        } else {
            month = now.getMonth();
        }
        year ??= now.getUTCFullYear();
        
        let monthNext = month + 1;
        let yearNext = year;
        if (monthNext > 12) {
            monthNext = monthNext % 12;
            yearNext++;
        }
        const queryDate = new Date(year=year,month=month)
        const queryDateNext = new Date(year=yearNext, month=monthNext);
        console.log(`Querying transactions from='${queryDate}' to='${queryDateNext}'`);
        const allTrans: Transaction[] = await this.transactions.findMany({
          where: {
            created: {
                gte: queryDate,
                lt: queryDateNext,
            }
        },
          include: DEFAULT_INCLUDE,
        });
        allTrans.sort((a, b) => b.created.getTime() - a.created.getTime());
        return {
            month: `${year}-${month}`,
            count: allTrans.length,
            data: allTrans
        };
    }
    
      public async createTransaction(transactionData: CreateTransactionDto): Promise<Transaction> {
        let parsed_date = undefined;
        if (transactionData.created) {
            parsed_date = new Date(transactionData.created);
        }
        const tags = transactionData.tags.map(tagName => ({ name: tagName }));
        
        let category = undefined;
        if (transactionData.categoryId) {
          category = { connect: { id: transactionData.categoryId } }
        }

        transactionData.currency ??= 'CZK';
        const now = new Date();
        const trans: Transaction = await this.transactions.create({
          data: {
            confirmed: parsed_date > now ? false : true,
            created: parsed_date,
            currency: transactionData.currency,
            description: transactionData.description,
            amount: transactionData.amount,
            recurring: transactionData.recurring,
            tags: {
              connect: tags,
            },
            category: category,
            source: {
              connect: {
                id: transactionData.sourceId,
              },
            },
            target: {
              connect: {
                id: transactionData.targetId,
              },
            },
          },
          include: DEFAULT_INCLUDE
        });
        return trans;
    }

    public async editTransaction(transactionData: EditTransactionDto): Promise<Transaction> {
      let parsed_date = undefined;
      if (transactionData.created) {
          parsed_date = new Date(transactionData.created);
      }
      let tags = undefined;
      if (transactionData.tags) {
        tags = { connect: transactionData.tags.map(tagName => ({ name: tagName })) };
      }
      let category = undefined;
      if (transactionData.categoryId) {
        category = { connect: { id: transactionData.categoryId } };
      }
      let source = undefined;
      if (transactionData.sourceId) {
        source = { connect: { id: transactionData.sourceId } };
      }
      let target = undefined;
      if (transactionData.targetId) {
        target = { connect: { id: transactionData.targetId } };
      }

      // disconnect all other tags...
      if (tags) {
        await this.transactions.update({
          where: { id: transactionData.id },
          data: { tags: { set: [] } }
        });
      }

      transactionData.currency ??= 'CZK';
      const now = new Date();
      const trans: Transaction = await this.transactions.update({
        where: {
          id: transactionData.id
        },
        data: {
          created: parsed_date,
          confirmed: parsed_date <= now ? transactionData.confirmed : false,
          recurring: transactionData.recurring,
          currency: transactionData.currency,
          description: transactionData.description,
          amount: transactionData.amount,
          tags: tags,
          category: category,
          source: source,
          target: target,
        },
        include: DEFAULT_INCLUDE
      });
      return trans;
  }

      public async deleteTransaction(transactionData: IdDto): Promise<Transaction> {
        return await this.transactions.delete({ where: { id: transactionData.id } });
    }

    public async tagTransaction(tagsData: TagTransactionDto): Promise<Transaction> {
        const tags = tagsData.tags.map(tagName => ({ name: tagName }));
        const trans = await this.transactions.update({
          where: {
            id: tagsData.transactionId,
          },
          data: {
            tags: {
              connect: tags,
            },
          },
          include: DEFAULT_INCLUDE,
        });
        return trans;
    }
    
    public async untagTransaction(tagsData: TagTransactionDto): Promise<Transaction> {
        const tags = tagsData.tags.map(tagName => ({ name: tagName }));
        const trans = await this.transactions.update({
          where: {
            id: tagsData.transactionId,
          },
          data: {
            tags: {
              disconnect: tags,
            },
          },
          include: DEFAULT_INCLUDE,
        });
        return trans;
    }
}

export default new Transactions();