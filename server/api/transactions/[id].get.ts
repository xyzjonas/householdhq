import transactions from "~~/server/controllers/transactions";
import { IdSchema, type IDBase } from "~~/types/base";
import doValidate from "~~/server/validators/validator";

export default defineEventHandler(async (event) => {
  console.info(event.context.params);
  const data: IDBase = await doValidate(IdSchema, event.context.params);
  return {
    data: await transactions.findSingle(data),
  };
});
