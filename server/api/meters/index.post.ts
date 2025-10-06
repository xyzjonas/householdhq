import meters from "~/server/controllers/meters";
import { MeterCreateSchema } from "~/types";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const validatedData = MeterCreateSchema.parse(body);
  return await meters.createMeter(validatedData);
});
