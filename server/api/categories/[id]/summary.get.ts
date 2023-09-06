// import categories from "~~/server/controllers/categories";
import transactions from "~~/server/controllers/transactions";
import transaction from "~~/server/controllers/transactions";
import { IdDto } from "~~/server/validators/common.dto";
import doValidate from "~~/server/validators/validator";


// function sum
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
        const element = trans[index];

        // todo: query by category
        if (element.tags.map(t => t.id).indexOf(categoryId) < 0) {
            continue;
        }

        const year = element.created.getFullYear();
        const month = element.created.getMonth();
        const summ = months.find(summary => summary.month === month && summary.year === year);
        if (summ) {
            if (!element.source.isOut && element.target.isOut) {
                summ.amount += element.amount;
            }
        } else {
            months.push({
                month: month + 1,
                year: year,
                amount: element.amount,
            });
        }
    }
    months.sort((a, b) => 1000*(a.year - b.year) + a.month - b.month);
    return months;
});
