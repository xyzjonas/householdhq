import transactions from "../../controllers/transactions";
import { TransactionFiltersDto } from "../../validators/transactions.dto";
import doValidate from "../../validators/validator";


export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    console.table(query)
    let filters = {};
    if (query && Object.keys(query).length <= 2) {
        filters = await doValidate(TransactionFiltersDto, query);
    }

    const data = await transactions.findAll(filters)

    return {
        data: data,
        count: data.length
    }
})
