import transactions from "../../controllers/transactions";
import { IdSchema, type IDBase } from "~/types/base";
import doValidate from "../../validators/validator";

export default defineEventHandler(async (event) => {
  const data: IDBase = await doValidate(IdSchema, await readBody(event));
  const deletedTransaction = await transactions.deleteTransaction(data);
  setResponseStatus(event, 200);
  return {
    data: deletedTransaction,
    message: "deleted",
  };
});
