import meters from "~/server/controllers/meters";
import { IdSchema } from "~/types";

export default defineEventHandler(async (event) => {
  const validatedData = IdSchema.parse(event.context.params);
  return await meters.deleteMeterState(validatedData);
});
