import transactions from "../controllers/transactions";
import { CreateTransactionDto } from "../validators/transactions.dto";
import doValidate from "../validators/validator";


export default defineEventHandler(async (event) => {
    const data: CreateTransactionDto = await doValidate(CreateTransactionDto, await readBody(event));
    data.tags = data.tags?.filter((tag: string) => !!tag) ?? []
    const createdTransaction = await transactions.createTransaction(data)
    setResponseStatus(event, 201);
    return {
        data: createdTransaction,
        message: 'created'
    };
})