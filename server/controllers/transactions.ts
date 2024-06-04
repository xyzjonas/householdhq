import { PrismaClient, type Transaction } from "@prisma/client";
import type { Transaction as TransactionWithIncludes } from "~/types";
import {
  CreateTransactionDto as CreateDto,
  TagTransactionDto as TagDto,
  TransactionMonthDto as MonthDto,
  EditTransactionDto as EditDto,
} from "../validators/transactions.dto";
import { IdDto } from "../validators/common.dto";

const DEFAULT_INCLUDE = {
  category: true,
  source: true,
  target: true,
  tags: true,
};

export interface GetTransactionsResponse {
  month: string;
  count: number;
  data: TransactionWithIncludes[];
}

function ignoreNul<T>(item: T | null | undefined): T {
  return item as T;
}

class Transactions {
  private transactions = new PrismaClient().transaction;

  public async findAll(): Promise<TransactionWithIncludes[]> {
    const allTrans: Transaction[] = await this.transactions.findMany({
      include: DEFAULT_INCLUDE,
    });
    allTrans.sort(
      (a, b) =>
        ignoreNul(b.transactedAt).getTime() -
        ignoreNul(a.transactedAt).getTime()
    );
    return allTrans as any;
  }

  public async findSingle(transactionData: IdDto): Promise<TransactionWithIncludes> {
    const transaction = await this.transactions.findUnique({
      where: { id: transactionData.id },
      include: DEFAULT_INCLUDE,
    });
    if (!transaction) {
      throw createError({
        statusCode: 400,
        statusMessage: `No such transaction id=${transactionData.id}`,
      });
    }
    return transaction as any;
  }

  public async findRecent(data: MonthDto): Promise<GetTransactionsResponse> {
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
    const queryDate = new Date((year = year), (month = month));
    const queryDateNext = new Date((year = yearNext), (month = monthNext));
    const allTrans = await this.findInterval(queryDate, queryDateNext);
    allTrans.sort(
      (a, b) => ignoreNul(b.transactedAt).getTime() - ignoreNul(a.transactedAt).getTime()
    );
    return {
      month: `${year}-${month}`,
      count: allTrans.length,
      data: allTrans as any,
    };
  }

  public async findInterval(from: Date, to: Date, filters?: { categoryId?: number }): Promise<TransactionWithIncludes[]> {
    console.log(`Querying transactions from='${from}' to='${to}' (category=${filters?.categoryId})`);
    const allTrans: Transaction[] = await this.transactions.findMany({
      where: {
        transactedAt: {
          gte: from,
          lt: to,
        },
        categoryId: filters?.categoryId,
      },
      include: DEFAULT_INCLUDE,
    });
    return allTrans as any;
  }

  public async createTransaction(transactionData: CreateDto): Promise<Transaction> {
    const now = new Date();
    let parsed_date = new Date();

    if (transactionData.transactedAt) {
      parsed_date = new Date(transactionData.transactedAt);
    }

    const tags = (transactionData?.tags ?? []).map((tagName) => ({
      name: tagName,
    }));

    let category = undefined;
    if (transactionData.categoryId) {
      category = { connect: { id: transactionData.categoryId } };
    }

    transactionData.currency ??= "CZK";
    const trans: Transaction = await this.transactions.create({
      data: {
        confirmed: parsed_date > now ? false : true,
        transactedAt: parsed_date,
        currency: transactionData.currency,
        description: transactionData.description ?? "N/A",
        amount: transactionData.amount ?? 0,
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
      include: DEFAULT_INCLUDE,
    });
    return trans;
  }

  public async editTransaction(transactionData: EditDto): Promise<TransactionWithIncludes> {
    let parsed_date = new Date();
    
    if (transactionData.transactedAt) {
      parsed_date = new Date(transactionData.transactedAt);
    }

    let tags = undefined;
    if (transactionData.tags && transactionData.tags.length > 0) {
      tags = {
        connect: transactionData.tags.map((tagName) => ({ name: tagName })),
      };
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
        data: { tags: { set: [] } },
      });
    }

    transactionData.currency ??= "CZK";
    const now = new Date();
    const trans: Transaction = await this.transactions.update({
      where: {
        id: transactionData.id,
      },
      data: {
        transactedAt: parsed_date,
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
      include: DEFAULT_INCLUDE,
    });
    return trans as any;
  }

  public async deleteTransaction(transactionData: IdDto): Promise<Transaction> {
    return await this.transactions.delete({
      where: { id: transactionData.id },
    });
  }

  public async tagTransaction(tagsData: TagDto): Promise<TransactionWithIncludes> {
    const tags = (tagsData?.tags ?? []).map((tagName) => ({ name: tagName }));
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
    return trans as any;
  }

  public async untagTransaction(tagsData: TagDto): Promise<TransactionWithIncludes> {
    const tags = (tagsData?.tags ?? []).map((tagName) => ({ name: tagName }));
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
    return trans as any;
  }
}

export default new Transactions();
