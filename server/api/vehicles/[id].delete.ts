import vehicles from "~/server/controllers/vehicles";
import { IdSchema } from "~/types";

export default defineEventHandler(async (event) => {
  const validatedData = IdSchema.parse(event.context.params);
  return await vehicles.deleteVehicle(validatedData);
});
