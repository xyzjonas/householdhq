import transactions from "../controllers/transactions";
import { EditTransactionDto } from "../validators/transactions.dto";
import doValidate from "../validators/validator";


export default defineEventHandler(async (event) => {
    const data: EditTransactionDto = await doValidate(EditTransactionDto, await readBody(event));
    const updatedTransaction = await transactions.editTransaction(data)
    console.info(`ingress: ${data}`);
    if (data.confirmed) {
        console.info(`updated: ${updatedTransaction}`);
        console.info(updatedTransaction);
        // we are confirming pending transaction, let's create another one - if recurring...
        if (updatedTransaction.recurring > 0) {
            console.info(`${updatedTransaction.id} is recurring, each ${updatedTransaction.recurring} monhts`);
            const newData = { ... updatedTransaction };
            delete newData.id;
            delete newData.source;
            newData.created = new Date(newData.created);
            newData.tags = newData.tags.map(t => t.name);
            newData.created = newData.created.setMonth(newData.created.getMonth() + newData.recurring);
            const createdTrans = await transactions.createTransaction(newData);
            console.info(`Created a new transaction: id=${createdTrans.id} date=${createdTrans.created}`);
        }
    }
    setResponseStatus(event, 200);
    return {
        data: updatedTransaction,
        message: 'created'
    };
})