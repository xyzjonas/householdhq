import transactions from "../controllers/transactions";
import { EditTransactionDto } from "../validators/transactions.dto";
import doValidate from "../validators/validator";


export default defineEventHandler(async (event) => {
    const data: EditTransactionDto = await doValidate(EditTransactionDto, await readBody(event));
    const updatedTransaction = await transactions.editTransaction(data)
    setResponseStatus(event, 200);
    return {
        data: updatedTransaction,
        message: 'created'
    };
})