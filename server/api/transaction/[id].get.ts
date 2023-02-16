import { plainToClass, plainToInstance } from "class-transformer";
import transactions from "~~/server/controllers/transactions";
import { TransactionIdDto } from "~~/server/validators/transactions.dto";
import doValidate from "~~/server/validators/validator";
import "reflect-metadata"


export default defineEventHandler((event) => {
    console.info(event.context.params);
    const x = plainToInstance(TransactionIdDto, event.context.params);
    console.info(x)
    return transactions.findSingle(doValidate(TransactionIdDto, event.context.params));
})