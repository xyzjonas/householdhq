import transactions from "../../controllers/transactions";
import { TransactionMonthDto } from "../../validators/transactions.dto";
import doValidate from "../../validators/validator";


export default defineEventHandler(async (event) => {
    const start = new Date();

    const data = await transactions.findAll()
    const end = new Date();

    console.info(`Request took ${ (end.getTime() - start.getTime()) / 1000 }s`)
    return {
        data: data,
        count: data.length
    }
})