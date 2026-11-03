import { home } from "~/server/controllers";
import { HomePeriodQuerySchema } from "~/types/home";
import doValidate from "~/server/validators/validator";

/** Income, expenses and their category breakdown of a fiscal period. */
export default defineEventHandler(async (event) => {
  const query = await doValidate(HomePeriodQuerySchema, getQuery(event));
  return home.getSummary(query.period);
});
