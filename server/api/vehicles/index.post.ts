import vehicles from "~/server/controllers/vehicles";
import { VehicleCreateSchema } from "~/types";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const validatedData = VehicleCreateSchema.parse(body);
  return await vehicles.createVehicle(validatedData);
});
