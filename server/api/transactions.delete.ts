import transactions from "../controllers/transactions";
import { IdDto } from "../validators/common.dto";
import doValidate from "../validators/validator";


export default defineEventHandler(async (event) => {
    const data: IdDto = await doValidate(IdDto, await readBody(event));
    const deletedTransaction = await transactions.deleteTransaction(data)
    setResponseStatus(event, 200);
    return {
        data: deletedTransaction,
        message: 'deleted'
    };
})