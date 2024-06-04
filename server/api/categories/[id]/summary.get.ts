import type { Transaction } from "~/types";
import transactions from "~~/server/controllers/transactions";
import { IdDto } from "~~/server/validators/common.dto";
import doValidate from "~~/server/validators/validator";

interface Summary {
  month: number;
  year: number;
  amount: number;
}

export function isExpense(transaction: Transaction) {
  const isNormalExpense = !transaction.source.isOut && transaction.target.isOut;
  const isInternalTransfer = !transaction.source.isOut && transaction.target.isPortfolio;
  return isNormalExpense || isInternalTransfer;
}

export function isIncome(transaction: Transaction) {
  // const isInternal = !transaction.source.isOut && !transaction.target.isOut;
  return !isExpense(transaction)
}


export default defineEventHandler(async (event) => {
  const data = await doValidate(IdDto, event.context.params);

  const from = new Date();
  from.setMonth(from.getMonth() - 12);
  const trans = await transactions.findInterval(from, new Date(), {
    categoryId: data.id,
  });

  const months: Summary[] = [];
  for (const transaction of trans) {
    if (isExpense(transaction)) {
      const year = transaction.transactedAt.getFullYear();
      const month = transaction.transactedAt.getMonth();
      const summ = months.find(
        (summary) => summary.month === month && summary.year === year
      );

      if (summ) {
        summ.amount += transaction.amount;
      } else {
        months.push({
          month: month,
          year: year,
          amount: transaction.amount,
        });
      }
    }

    // if (transaction.source.isOut && !transaction.target.isOut) {
    if (isIncome(transaction)) {
      const year = transaction.transactedAt.getFullYear();
      const month = transaction.transactedAt.getMonth();
      const summ = months.find(
        (summary) => summary.month === month && summary.year === year
      );

      if (summ) {
        summ.amount -= transaction.amount;
      } else {
        months.push({
          month: month,
          year: year,
          amount: -1 * transaction.amount,
        });
      }
    }
  }
  months.sort((a, b) => 1000 * (a.year - b.year) + a.month - b.month);
  return months.map((summ) => {
    return {
      year: summ.year,
      month: summ.month,
      amount: Math.abs(summ.amount),
    };
  });
});
