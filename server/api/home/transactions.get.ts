import { home } from "~/server/controllers";
import { HomeTransactionsQuerySchema } from "~/types/home";
import doValidate from "~/server/validators/validator";

/** Settled transactions of a fiscal period, newest first. */
export default defineEventHandler(async (event) => {
  const query = await doValidate(HomeTransactionsQuerySchema, getQuery(event));
  return home.getTransactions(query);
});
