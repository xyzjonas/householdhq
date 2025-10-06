import meters from "~/server/controllers/meters";
import { MeterStateCreateSchema } from "~/types";

export default defineEventHandler(async (event) => {
  const validatedData = MeterStateCreateSchema.parse(await readBody(event));
  return await meters.createMeterState(validatedData);
});
