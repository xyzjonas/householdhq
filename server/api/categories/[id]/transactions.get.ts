import { IdSchema } from "~/types";
import transactions from "~~/server/controllers/transactions";

export default defineEventHandler(async (event) => {
  const data = IdSchema.parse(event.context.params);
  const trans = await transactions.findAll({ categoryId: data.id });
  return {
    count: trans.length,
    data: trans,
    message: "success",
  };
});
