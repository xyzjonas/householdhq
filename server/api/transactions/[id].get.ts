import { plainToClass, plainToInstance } from "class-transformer";
import transactions from "~~/server/controllers/transactions";
import { TransactionIdDto } from "~~/server/validators/transactions.dto";
import doValidate from "~~/server/validators/validator";


export default defineEventHandler(async (event) => {
    console.info(event.context.params);
    const data = await doValidate(TransactionIdDto, event.context.params);
    return transactions.findSingle(data);
})