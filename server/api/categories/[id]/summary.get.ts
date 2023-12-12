import type { Transaction } from "@prisma/client";
import transactions from "~~/server/controllers/transactions";
import { IdDto } from "~~/server/validators/common.dto";
import doValidate from "~~/server/validators/validator";

interface Summary {
  month: number;
  year: number;
  amount: number;
}

export default defineEventHandler(async (event) => {
  const data = await doValidate(IdDto, event.context.params);

  const from = new Date();
  from.setMonth(from.getMonth() - 12);
  const trans = await transactions.findInterval(from, new Date());

  const categoryId = data.id;
  const months: Summary[] = [];

  for (let index = 0; index < trans.length; index++) {
    const element: any = trans[index];

    // todo: query by category
    if (element.tags.map((t: Transaction) => t.id).indexOf(categoryId) < 0) {
      continue;
    }

    if (!element.source.isOut && element.target.isOut) {
      const year = element.created.getFullYear();
      const month = element.created.getMonth();
      const summ = months.find((summary) => summary.month === month && summary.year === year);

      if (summ) {
        summ.amount += element.amount;
      } else {
        months.push({
          month: month,
          year: year,
          amount: element.amount,
        });
      }
    }

    if (element.source.isOut && !element.target.isOut) {
      const year = element.created.getFullYear();
      const month = element.created.getMonth();
      const summ = months.find((summary) => summary.month === month && summary.year === year);

      if (summ) {
        summ.amount -= element.amount;
      } else {
        months.push({
          month: month,
          year: year,
          amount: -1 * element.amount,
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
