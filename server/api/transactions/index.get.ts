import transactions from "../../controllers/transactions";
import { TransactionMonthDto } from "../../validators/transactions.dto";
import doValidate from "../../validators/validator";


export default defineEventHandler(async (event) => {
    const start = new Date();
    const query = getQuery(event);
    let dateConstraints = {};
    if (query && Object.keys(query).length <= 2) {
        dateConstraints = await doValidate(TransactionMonthDto, query);
    }
    const data = await transactions.findRecent(dateConstraints);
    const end = new Date();

    console.info(`Request took ${ (end.getTime() - start.getTime()) / 1000 }s`)
    return data;
})