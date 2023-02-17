import transactions from "../controllers/transactions";
import { TransactionMonthDto } from "../validators/transactions.dto";
import doValidate from "../validators/validator";


export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    let data = {};
    console.info(query)
    if (query && Object.keys(query).length <= 2) {
        data = await doValidate(TransactionMonthDto, query);
    }
    return await transactions.findRecent(data);
})