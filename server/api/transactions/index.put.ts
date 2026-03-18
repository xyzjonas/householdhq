import transactions from "../../controllers/transactions";
import {
  CreateTransactionSchema,
  type CreateTransactionRequest,
} from "~/types/transaction";
import doValidate from "../../validators/validator";

export default defineEventHandler(async (event) => {
  const data: CreateTransactionRequest = await doValidate(
    CreateTransactionSchema,
    await readBody(event),
  );
  data.tags = data.tags?.filter((tag: string) => !!tag) ?? [];
  const createdTransaction = await transactions.createTransaction(data);
  setResponseStatus(event, 201);
  return {
    data: createdTransaction,
    message: "created",
  };
});
