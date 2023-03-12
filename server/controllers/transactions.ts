import { PrismaClient, Transaction } from "@prisma/client";
import { CreateTransactionDto, TagTransactionDto, IdDto, TransactionMonthDto, EditTransactionDto } from "../validators/transactions.dto";


class Transactions {

    private transactions = new PrismaClient().transaction;

    public async findAll(): Promise<Transaction[]> {
        const allTrans: Transaction[] = await this.transactions.findMany({ include: { source: true, tags: true } });
        allTrans.sort((a, b) => b.created.getTime() - a.created.getTime());
        return allTrans;
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

    public async findRecent(data: TransactionMonthDto): Promise<any> {
        const now = new Date();
        console.info(data);
        let month = data.month;
        let year = data.year;
        
        if (month) {
            month--;
        } else {
            month = now.getMonth();
        }
        year ??= now.getUTCFullYear();
        console.info(`${year}, ${month}`);
        
        let monthNext = month + 1;
        let yearNext = year;
        if (monthNext > 12) {
            monthNext = monthNext % 12;
            yearNext++;
        }
    
        // const queryDate = new Date(`${year}-${month}-${1}`);
        const queryDate = new Date(year=year,month=month)
        // const queryDateNext = new Date(`${yearNext}-${monthNext}-${1}`);
        const queryDateNext = new Date(year=yearNext, month=monthNext);
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
          include: { source: true, tags: true }
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
      let source = undefined;
      if (transactionData.sourceId) {
        source = { connect: { id: transactionData.sourceId } };
      }
  
      transactionData.currency ??= 'CZK';
      const trans: Transaction = await this.transactions.update({
        where: {
          id: transactionData.id
        },
        data: {
          created: parsed_date,
          currency: transactionData.currency,
          description: transactionData.description,
          amount: transactionData.amount,
          tags: tags,
          source: source,
        },
        include: { source: true, tags: true }
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
          include: { tags: true, source: true },
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
          include: { tags: true, source: true },
        });
        return trans;
    }
}

export default new Transactions();