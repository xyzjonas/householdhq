import { home } from "~/server/controllers";
import { HomePeriodQuerySchema } from "~/types/home";
import doValidate from "~/server/validators/validator";

export default defineEventHandler(async (event) => {
  const query = await doValidate(HomePeriodQuerySchema, getQuery(event));
  const { info } = await home.resolvePeriod(query.period);
  return info;
});
